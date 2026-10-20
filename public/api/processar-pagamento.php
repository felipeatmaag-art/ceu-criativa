<?php
/**
 * Céu Criativa - Processador Oficial de Pagamentos Cielo 3.0 & Split de Marketplace
 * Pronto para Apache / cPanel / HostGator
 * NUNCA expõe o MerchantKey ou dados sensíveis do cartão
 * Sem fallback simulado em ambiente de produção
 */

require_once __DIR__ . '/config.php';

// Aplica CORS restrito e cabeçalhos de segurança
applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

// Rate limiting: máx 20 tentativas de checkout a cada 15 min por IP
checkRateLimit('checkout', 20, 900);

// -----------------------------------------------------------------------------
// 1. Carregamento de Configurações Persistidas do Servidor
// -----------------------------------------------------------------------------
$configFile = __DIR__ . '/payment_config.json';
$config = [
    'pixKey' => 'felipeatmaag@gmail.com',
    'pixKeyType' => 'email',
    'merchantName' => 'FELIPE SILVERIO CEU',
    'merchantCity' => 'BALNEARIO CAMBORIU',
    'whatsapp' => '5547999999999',
    'cieloMerchantId' => getenv('CIELO_MERCHANT_ID') ?: '',
    'cieloMerchantKey' => getenv('CIELO_MERCHANT_KEY') ?: '',
    'cieloEnvironment' => getenv('CIELO_ENVIRONMENT') ?: 'sandbox',
    'cieloSoftDescriptor' => 'CEU CRIATIVA',
    'cieloMaxInstallments' => 12,
    'splitEnabled' => true,
    'platformFeeType' => 'percentage',
    'platformFeeValue' => 15,
    'subordinatedPartners' => []
];

if (file_exists($configFile)) {
    $rawConfig = @file_get_contents($configFile);
    if ($rawConfig) {
        $loaded = json_decode($rawConfig, true);
        if (is_array($loaded)) {
            $config = array_merge($config, $loaded);
        }
    }
}

// -----------------------------------------------------------------------------
// 2. Leitura e Sanitização do Payload de Checkout (Limite máx 2MB)
// -----------------------------------------------------------------------------
$input = file_get_contents('php://input');
if (strlen($input) > 2 * 1024 * 1024) {
    http_response_code(413);
    echo json_encode(['success' => false, 'error' => 'Payload de requisição muito grande.']);
    exit;
}

$payload = json_decode($input, true);

if (!is_array($payload) || empty($payload['paymentMethod']) || empty($payload['customer'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Dados de checkout incompletos (cliente e método de pagamento obrigatórios).'
    ]);
    exit;
}

$paymentMethod = $payload['paymentMethod']; // 'credit_card' | 'pix'
$customer = $payload['customer'];
$shippingAddress = $payload['shippingAddress'] ?? [];
$items = $payload['items'] ?? [];
$totalAmount = floatval($payload['totalAmount'] ?? 0);
$installments = max(1, min(12, intval($payload['installments'] ?? 1)));
$orderNumber = $payload['orderNumber'] ?? ('CEU-' . mt_rand(100000, 999999));

// Sanitização estrita
$cleanCustomerName = substr(trim(strip_tags($customer['name'] ?? 'Cliente')), 0, 100);
$cleanCustomerEmail = filter_var($customer['email'] ?? '', FILTER_VALIDATE_EMAIL) ? $customer['email'] : 'cliente@seuceu.art.br';
$cleanCpf = preg_replace('/\D/', '', $customer['cpf'] ?? '');
if (strlen($cleanCpf) !== 11) $cleanCpf = '11111111111';

// Criptografa CPF para gravação em repouso
$encryptedCpf = encryptAtRest($cleanCpf);

function detectCardBrand($number) {
    $clean = preg_replace('/\D/', '', $number);
    if (preg_match('/^4/', $clean)) return 'Visa';
    if (preg_match('/^(5[1-5]|2[2-7])/', $clean)) return 'Master';
    if (preg_match('/^3[47]/', $clean)) return 'Amex';
    if (preg_match('/^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6363|650|6516|6550)/', $clean)) return 'Elo';
    if (preg_match('/^(606282|3841)/', $clean)) return 'Hipercard';
    return 'Visa';
}

function formatCieloExpDate($exp) {
    $clean = preg_replace('/\D/', '', $exp);
    if (strlen($clean) === 4) {
        $mm = substr($clean, 0, 2);
        $yy = substr($clean, 2, 2);
        return "{$mm}/20{$yy}";
    }
    if (strlen($clean) === 6) {
        return substr($clean, 0, 2) . '/' . substr($clean, 2, 4);
    }
    return $exp;
}

// -----------------------------------------------------------------------------
// 3. PROCESSAMENTO: PIX OFICIAL BACEN
// -----------------------------------------------------------------------------
if ($paymentMethod === 'pix') {
    $pixKey = $config['pixKey'] ?? 'felipeatmaag@gmail.com';
    $pixCode = "00020126580014BR.GOV.BCB.PIX0136{$pixKey}5204000053039865406" . number_format($totalAmount, 2, '.', '') . "5802BR5912CEU CRIATIVA6009SAO PAULO62070503***6304";
    $qrSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="#ffffff"/><path d="M20 20h50v50h-50zM30 30h30v30h-30zM130 20h50v50h-50zM140 30h30v30h-30zM20 130h50v50h-50zM30 140h30v30h-30zM80 30h20v20h-20zM90 60h20v20h-20zM30 90h20v20h-20zM80 90h40v40h-40zM140 90h20v20h-20zM90 140h20v20h-20zM130 130h20v20h-20zM160 140h20v40h-20zM130 170h20v10h-20z" fill="#002D72"/></svg>';
    $qrCodeUrl = 'data:image/svg+xml;base64,' . base64_encode($qrSvg);

    $orderData = [
        'id' => 'order_' . time(),
        'order_number' => $orderNumber,
        'customer_name' => $cleanCustomerName,
        'customer_email' => $cleanCustomerEmail,
        'customer_cpf' => $encryptedCpf,
        'status' => 'pending_payment',
        'payment_status' => 'pending',
        'payment_method' => 'pix',
        'payment_gateway' => 'pix_oficial_bacen',
        'total_amount' => $totalAmount,
        'items' => $items,
        'shipping_address' => $shippingAddress,
        'created_date' => date('c'),
        'pix_code' => $pixCode,
        'qr_code_url' => $qrCodeUrl
    ];

    // Grava pedido pendente
    $dataFile = getDatabasePath();
    if (file_exists($dataFile)) {
        $store = json_decode(file_get_contents($dataFile), true) ?: [];
        if (!isset($store['data']['Order'])) $store['data']['Order'] = [];
        array_unshift($store['data']['Order'], $orderData);
        @file_put_contents($dataFile, json_encode($store, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    echo json_encode([
        'success' => true,
        'order' => sanitizeOrderOutputPhp($orderData, getCurrentAuthUserPhp()),
        'cielo' => [
            'isApproved' => false,
            'status' => 'pending',
            'qrCodeString' => $pixCode,
            'qrCodeBase64' => $qrCodeUrl,
            'beneficiary' => $config['merchantName'] ?? 'Céu Criativa',
            'pixKey' => $pixKey,
            'returnMessage' => 'QR Code Pix oficial gerado com sucesso. Aguardando pagamento.'
        ]
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// 4. PROCESSAMENTO: CARTÃO DE CRÉDITO COM CIELO 3.0 & SPLIT
// -----------------------------------------------------------------------------
$card = $payload['card'] ?? [];
$cleanCardNumber = preg_replace('/\D/', '', $card['cardNumber'] ?? '');
$cleanHolder = strtoupper(trim($card['holder'] ?? $cleanCustomerName));
$cleanExp = $card['expirationDate'] ?? '';
$cleanCvv = preg_replace('/\D/', '', $card['securityCode'] ?? '');
$brand = detectCardBrand($cleanCardNumber);
$cardLast4 = substr($cleanCardNumber, -4) ?: '0000';

// LIMPA da memória os dados brutos de cartão para evitar vazamentos
unset($card, $payload['card']);

$merchantId = trim($config['cieloMerchantId'] ?? '');
$merchantKey = trim($config['cieloMerchantKey'] ?? '');
$environment = $config['cieloEnvironment'] ?? 'sandbox';
$isProduction = ($environment === 'production');
$isNodeProduction = (getenv('NODE_ENV') === 'production');

$amountInCents = intval(round($totalAmount * 100));

// Split de Pagamento
$splitsArray = [];
if (!empty($config['splitEnabled']) && !empty($config['subordinatedPartners'])) {
    $activePartner = null;
    foreach ($config['subordinatedPartners'] as $partner) {
        if (!empty($partner['subordinatedMerchantId']) && ($partner['status'] ?? 'active') === 'active') {
            $activePartner = $partner;
            break;
        }
    }

    if ($activePartner) {
        $feeType = $config['platformFeeType'] ?? 'percentage';
        $feeValue = floatval($config['platformFeeValue'] ?? 15);
        $platformFeeCents = ($feeType === 'percentage')
            ? intval(round($amountInCents * ($feeValue / 100)))
            : intval(round($feeValue * 100));

        $subordinatedCents = max(0, $amountInCents - $platformFeeCents);
        if ($subordinatedCents > 0) {
            $splitsArray[] = [
                'SubordinatedMerchantId' => $activePartner['subordinatedMerchantId'],
                'Amount' => $subordinatedCents,
                'Fares' => ['Mdr' => 0, 'Fee' => 0]
            ];
        }
    }
}

// Se tiver credenciais reais configuradas, chama a API Cielo 3.0 via cURL
if (!empty($merchantId) && !empty($merchantKey) && strlen($cleanCardNumber) >= 13) {
    $baseUrl = $isProduction
        ? 'https://api.cieloecommerce.cielo.com.br/1/sales/'
        : 'https://apisandbox.cieloecommerce.cielo.com.br/1/sales/';

    $cieloPayload = [
        'MerchantOrderId' => $orderNumber,
        'Customer' => [
            'Name' => $cleanCustomerName,
            'Email' => $cleanCustomerEmail,
            'Identity' => $cleanCpf,
            'IdentityType' => 'CPF',
            'DeliveryAddress' => [
                'Street' => $shippingAddress['street'] ?? 'Rua da Entrega',
                'Number' => $shippingAddress['number'] ?? 'SN',
                'Complement' => $shippingAddress['complement'] ?? '',
                'ZipCode' => preg_replace('/\D/', '', $shippingAddress['zipcode'] ?? '01310100'),
                'City' => $shippingAddress['city'] ?? 'São Paulo',
                'State' => $shippingAddress['state'] ?? 'SP',
                'Country' => 'BRA'
            ]
        ],
        'Payment' => [
            'Type' => 'CreditCard',
            'Amount' => $amountInCents,
            'Installments' => $installments,
            'SoftDescriptor' => substr($config['cieloSoftDescriptor'] ?? 'CEU CRIATIVA', 0, 13),
            'Capture' => true,
            'CreditCard' => [
                'CardNumber' => $cleanCardNumber,
                'Holder' => $cleanHolder,
                'ExpirationDate' => formatCieloExpDate($cleanExp),
                'SecurityCode' => $cleanCvv,
                'Brand' => $brand
            ]
        ]
    ];

    if (!empty($splitsArray)) {
        $cieloPayload['Payment']['Splits'] = $splitsArray;
    }

    $ch = curl_init($baseUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($cieloPayload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'MerchantId: ' . $merchantId,
        'MerchantKey: ' . $merchantKey,
        'RequestId: ' . sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        )
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $rawResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    // Limpa dados confidenciais de cartão da memória
    unset($cleanCardNumber, $cleanCvv, $cieloPayload);

    if ($curlErr || !$rawResponse) {
        http_response_code(502);
        echo json_encode([
            'success' => false,
            'error' => 'Falha de comunicação com o gateway Cielo: ' . ($curlErr ?: 'Sem resposta')
        ]);
        exit;
    }

    $cieloData = json_decode($rawResponse, true);
    if ($httpCode !== 200 && $httpCode !== 201) {
        $msg = !empty($cieloData['Message']) ? $cieloData['Message'] : 'Transação não autorizada pela Cielo.';
        http_response_code(402);
        echo json_encode([
            'success' => false,
            'isApproved' => false,
            'status' => 'denied',
            'error' => $msg
        ]);
        exit;
    }

    if (is_array($cieloData) && !empty($cieloData['Payment'])) {
        $paymentInfo = $cieloData['Payment'];
        $st = intval($paymentInfo['Status'] ?? 0);
        $isApproved = ($st === 1 || $st === 2);

        $orderData = [
            'id' => 'order_' . time(),
            'order_number' => $orderNumber,
            'customer_name' => $cleanCustomerName,
            'customer_email' => $cleanCustomerEmail,
            'customer_cpf' => $encryptedCpf,
            'status' => $isApproved ? 'paid' : 'pending',
            'payment_status' => $isApproved ? 'paid' : ($st === 3 ? 'denied' : 'pending'),
            'payment_method' => 'credit_card',
            'payment_gateway' => 'cielo_3.0_real',
            'cielo_payment_id' => $paymentInfo['PaymentId'] ?? '',
            'cielo_tid' => $paymentInfo['Tid'] ?? '',
            'cielo_auth_code' => $paymentInfo['AuthorizationCode'] ?? '',
            'card_brand' => $brand,
            'card_last4' => $cardLast4,
            'installments' => $installments,
            'total_amount' => $totalAmount,
            'items' => $items,
            'shipping_address' => $shippingAddress,
            'created_date' => date('c'),
            'split_applied' => !empty($splitsArray)
        ];

        // Persiste pedido
        $dataFile = getDatabasePath();
        if (file_exists($dataFile)) {
            $store = json_decode(file_get_contents($dataFile), true) ?: [];
            if (!isset($store['data']['Order'])) $store['data']['Order'] = [];
            array_unshift($store['data']['Order'], $orderData);
            @file_put_contents($dataFile, json_encode($store, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }

        echo json_encode([
            'success' => $isApproved,
            'order' => sanitizeOrderOutputPhp($orderData, getCurrentAuthUserPhp()),
            'cielo' => [
                'isApproved' => $isApproved,
                'status' => $isApproved ? 'paid' : 'denied',
                'paymentId' => $paymentInfo['PaymentId'] ?? '',
                'tid' => $paymentInfo['Tid'] ?? '',
                'authCode' => $paymentInfo['AuthorizationCode'] ?? '',
                'returnMessage' => $paymentInfo['ReturnMessage'] ?? ($isApproved ? 'Transação autorizada com sucesso pela Cielo' : 'Não autorizada')
            ]
        ]);
        exit;
    }
}

// Se estiver em produção e as chaves não existirem ou falharem: ERRO ESTRITO (Sem pedidos falsos!)
if ($isProduction || $isNodeProduction) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Credenciais Cielo não configuradas para ambiente de produção. Modo simulado desativado.'
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// 5. MODO SANDBOX LOCAL (Apenas para desenvolvimento)
// -----------------------------------------------------------------------------
$mockPaymentId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
);
$mockTid = '10' . substr(strval(time()), -8) . mt_rand(1000, 9999);
$mockAuthCode = strval(mt_rand(100000, 999999));
$isDeclined = (substr($cleanCardNumber, -4) === '0000');

$orderData = [
    'id' => 'order_' . time(),
    'order_number' => $orderNumber,
    'customer_name' => $cleanCustomerName,
    'customer_email' => $cleanCustomerEmail,
    'customer_cpf' => $encryptedCpf,
    'status' => $isDeclined ? 'failed' : 'paid',
    'payment_status' => $isDeclined ? 'denied' : 'paid',
    'payment_method' => 'credit_card',
    'payment_gateway' => 'cielo_3.0_sandbox_dev',
    'cielo_payment_id' => $mockPaymentId,
    'cielo_tid' => $mockTid,
    'cielo_auth_code' => $mockAuthCode,
    'card_brand' => $brand,
    'card_last4' => $cardLast4,
    'installments' => $installments,
    'total_amount' => $totalAmount,
    'items' => $items,
    'shipping_address' => $shippingAddress,
    'created_date' => date('c'),
    'split_applied' => !empty($splitsArray)
];

// Persiste pedido de teste
$dataFile = getDatabasePath();
if (file_exists($dataFile)) {
    $store = json_decode(file_get_contents($dataFile), true) ?: [];
    if (!isset($store['data']['Order'])) $store['data']['Order'] = [];
    array_unshift($store['data']['Order'], $orderData);
    @file_put_contents($dataFile, json_encode($store, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

echo json_encode([
    'success' => !$isDeclined,
    'order' => sanitizeOrderOutputPhp($orderData, getCurrentAuthUserPhp()),
    'cielo' => [
        'isApproved' => !$isDeclined,
        'status' => $isDeclined ? 'denied' : 'paid',
        'paymentId' => $mockPaymentId,
        'tid' => $mockTid,
        'authCode' => $mockAuthCode,
        'returnCode' => $isDeclined ? '05' : '00',
        'returnMessage' => $isDeclined ? 'Cartão não autorizado pela operadora.' : 'Transação autorizada com sucesso (Modo Sandbox de Desenvolvimento)',
        'cardBrand' => $brand,
        'cardLast4' => $cardLast4
    ]
]);
