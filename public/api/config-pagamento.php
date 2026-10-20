<?php
/**
 * Céu Criativa - Gestão de Configurações de Pagamento (HostGator Apache / cPanel)
 * Gerencia credenciais da Cielo 3.0, Split de Marketplace e Chave Pix.
 */

require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit;
}

$configFile = __DIR__ . '/payment_config.json';
$rootConfigFile = __DIR__ . '/../../data/payment_config.json';

// Configuração padrão
$defaultConfig = [
    'pixKey' => 'felipeatmaag@gmail.com',
    'pixKeyType' => 'email',
    'merchantName' => 'FELIPE SILVERIO CEU',
    'merchantCity' => 'BALNEARIO CAMBORIU',
    'whatsapp' => '5547999999999',
    'cieloMerchantId' => '',
    'cieloMerchantKey' => '',
    'cieloEnvironment' => 'sandbox',
    'cieloSoftDescriptor' => 'CEU CRIATIVA',
    'cieloMaxInstallments' => 12,
    'splitEnabled' => true,
    'platformFeeType' => 'percentage',
    'platformFeeValue' => 15,
    'partnerPayoutMode' => 'cielo_split',
    'subordinatedPartners' => [],
    'updatedAt' => date('c')
];

function loadPaymentConfig($path, $fallback) {
    if (file_exists($path)) {
        $content = @file_get_contents($path);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data)) {
                return array_merge($fallback, $data);
            }
        }
    }
    return $fallback;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $config = loadPaymentConfig($configFile, $defaultConfig);
    // Para segurança na leitura pública, podemos verificar se vem com autorização ou retornar as configs
    // Retorna as configs para o painel administrativo
    $hasSecret = !empty($config['cieloMerchantKey']);
    $maskedConfig = $config;
    // Se o cliente solicitar com parâmetro showSecret=true ou token master, mantém, senão sinaliza
    $maskedConfig['hasSecret'] = $hasSecret;
    echo json_encode([
        'success' => true,
        'config' => $maskedConfig
    ]);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Payload JSON inválido.']);
        exit;
    }

    $existing = loadPaymentConfig($configFile, $defaultConfig);
    $merged = array_merge($existing, $payload);
    
    // Se a chave secreta enviada estiver vazia mas já existia uma salva, mantém a anterior
    if (empty($payload['cieloMerchantKey']) && !empty($existing['cieloMerchantKey'])) {
        $merged['cieloMerchantKey'] = $existing['cieloMerchantKey'];
    }
    if (empty($payload['geminiApiKey']) && !empty($existing['geminiApiKey'])) {
        $merged['geminiApiKey'] = $existing['geminiApiKey'];
    }

    $merged['updatedAt'] = date('c');

    $saved = @file_put_contents($configFile, json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    // Sincroniza se o diretório data existir
    if (is_dir(dirname($rootConfigFile))) {
        @file_put_contents($rootConfigFile, json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    if ($saved === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Não foi possível gravar no arquivo payment_config.json. Verifique as permissões na pasta cPanel.']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Configurações de pagamento e split salvas com sucesso no servidor HostGator!',
        'config' => $merged
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Método não permitido']);
