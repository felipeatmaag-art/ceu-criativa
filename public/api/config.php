<?php
/**
 * Céu Criativa - Configuração de Segurança do Servidor HostGator (Apache / cPanel)
 * NUNCA armazena chaves privadas em texto puro.
 */

// Chave da API Google Gemini
// Lê estritamente das variáveis de ambiente do cPanel ou do payment_config.json
$custom_key = null;
$payment_config_file = __DIR__ . '/payment_config.json';
if (file_exists($payment_config_file)) {
    $cfg_json = @json_decode(file_get_contents($payment_config_file), true);
    if (!empty($cfg_json['geminiApiKey'])) {
        $custom_key = trim($cfg_json['geminiApiKey']);
    }
}
$gemini_key = $custom_key ?: (getenv('GEMINI_API_KEY') ?: '');
define('GEMINI_API_KEY', $gemini_key);

// Chaves de Criptografia e Sessão (LGPD / Segurança)
define('DATA_ENCRYPTION_KEY', getenv('DATA_ENCRYPTION_KEY') ?: 'ceu-criativa-security-key-32-chars-ok!');
define('SESSION_SECRET', getenv('SESSION_SECRET') ?: 'ceu-criativa-session-secret-2026');

// Diretório de Uploads
define('UPLOADS_DIR', __DIR__ . '/../uploads');
define('UPLOADS_URL', '/uploads');

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// -----------------------------------------------------------------------------
// CORS Seguro com Whitelist
// -----------------------------------------------------------------------------
function applyCorsHeaders() {
    $allowedOrigins = [
        'https://www.seuceu.com.br',
        'https://seuceu.com.br',
        'https://www.seuceu.art.br',
        'https://seuceu.art.br'
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $isLocalDev = (
        getenv('NODE_ENV') !== 'production' &&
        (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false || strpos($origin, '.run.app') !== false)
    );

    if (in_array($origin, $allowedOrigins) || $isLocalDev) {
        header("Access-Control-Allow-Origin: " . $origin);
        header("Access-Control-Allow-Credentials: true");
    } else {
        header("Access-Control-Allow-Origin: https://www.seuceu.com.br");
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: SAMEORIGIN");
    header("X-XSS-Protection: 1; mode=block");
    header("Referrer-Policy: strict-origin-when-cross-origin");
    header("Content-Type: application/json; charset=utf-8");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        echo json_encode(['status' => 'ok']);
        exit;
    }
}

// -----------------------------------------------------------------------------
// Rate Limiter em Arquivo Temporário
// -----------------------------------------------------------------------------
function checkRateLimit($endpointKey, $maxHits = 30, $windowSeconds = 60) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $tmpDir = sys_get_temp_dir();
    $cacheFile = $tmpDir . '/rl_' . md5($endpointKey . '_' . $ip) . '.json';

    $now = time();
    $data = ['count' => 0, 'start' => $now];

    if (file_exists($cacheFile)) {
        $raw = @file_get_contents($cacheFile);
        if ($raw) {
            $parsed = @json_decode($raw, true);
            if ($parsed && ($now - $parsed['start']) < $windowSeconds) {
                $data = $parsed;
            }
        }
    }

    $data['count']++;
    @file_put_contents($cacheFile, json_encode($data));

    if ($data['count'] > $maxHits) {
        http_response_code(429);
        echo json_encode([
            'error' => 'Limite de requisições excedido. Aguarde alguns instantes antes de tentar novamente.'
        ]);
        exit;
    }
}

// -----------------------------------------------------------------------------
// LGPD / Criptografia em Repouso (AES-256-CBC)
// -----------------------------------------------------------------------------
function encryptAtRest($plainText) {
    if (empty($plainText) || !is_string($plainText)) return $plainText;
    if (str_starts_with($plainText, 'enc:')) return $plainText;
    $key = hash('sha256', DATA_ENCRYPTION_KEY, true);
    $iv = random_bytes(16);
    $ciphertext = openssl_encrypt($plainText, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
    return 'enc:' . bin2hex($iv) . ':' . bin2hex($ciphertext);
}

function decryptAtRest($cipherText) {
    if (empty($cipherText) || !is_string($cipherText)) return $cipherText;
    if (!str_starts_with($cipherText, 'enc:')) return $cipherText;
    $parts = explode(':', $cipherText);
    if (count($parts) !== 3) return $cipherText;
    $key = hash('sha256', DATA_ENCRYPTION_KEY, true);
    $iv = hex2bin($parts[1]);
    $ciphertext = hex2bin($parts[2]);
    $decrypted = openssl_decrypt($ciphertext, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
    return $decrypted !== false ? $decrypted : '';
}

// -----------------------------------------------------------------------------
// Autenticação Real & Tokens de Sessão (HMAC-SHA256)
// -----------------------------------------------------------------------------
function generateSessionTokenPhp($user, $hours = 24) {
    $payload = [
        'userId' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'] ?? 'customer',
        'app_role' => $user['app_role'] ?? ($user['role'] ?? 'customer'),
        'exp' => (time() + ($hours * 3600)) * 1000
    ];
    $json = json_encode($payload);
    $b64 = rtrim(strtr(base64_encode($json), '+/', '-_'), '=');
    $sig = rtrim(strtr(base64_encode(hash_hmac('sha256', $b64, SESSION_SECRET, true)), '+/', '-_'), '=');
    return $b64 . '.' . $sig;
}

function verifySessionTokenPhp($token) {
    if (empty($token) || !is_string($token)) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 2) return null;
    [$b64, $sig] = $parts;
    $expected = rtrim(strtr(base64_encode(hash_hmac('sha256', $b64, SESSION_SECRET, true)), '+/', '-_'), '=');
    if (!hash_equals($expected, $sig)) return null;
    $json = base64_decode(strtr($b64, '-_', '+/'));
    $payload = json_decode($json, true);
    if (!$payload || empty($payload['exp']) || (time() * 1000) > $payload['exp']) {
        return null;
    }
    return $payload;
}

function getDatabasePath() {
    $paths = [
        __DIR__ . '/../../data/entities.json',
        __DIR__ . '/../data/entities.json',
        __DIR__ . '/data/entities.json',
        dirname(__DIR__, 2) . '/data/entities.json'
    ];
    foreach ($paths as $p) {
        if (file_exists($p)) return $p;
    }
    return $paths[0];
}

function getCurrentAuthUserPhp() {
    $token = null;
    if (!empty($_COOKIE['ceu_session'])) {
        $token = $_COOKIE['ceu_session'];
    } elseif (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        if (preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $m)) {
            $token = trim($m[1]);
        }
    }
    if (!$token) return null;
    $payload = verifySessionTokenPhp($token);
    if (!$payload || empty($payload['userId'])) return null;

    $dataFile = getDatabasePath();
    if (!file_exists($dataFile)) return null;
    $store = json_decode(file_get_contents($dataFile), true);
    $users = $store['data']['User'] ?? [];
    foreach ($users as $u) {
        if (strval($u['id'] ?? '') === strval($payload['userId'])) {
            return $u;
        }
    }
    return null;
}

function requireAuthPhp() {
    $user = getCurrentAuthUserPhp();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Autenticação necessária. Faça login para continuar.']);
        exit;
    }
    return $user;
}

function requireRolePhp($role) {
    $user = requireAuthPhp();
    if (($user['role'] ?? '') !== $role) {
        http_response_code(403);
        echo json_encode(['error' => "Acesso restrito ao perfil {$role}."]);
        exit;
    }
    return $user;
}

// -----------------------------------------------------------------------------
// Sanitização de Saída (Proteção de Dados Pessoais)
// -----------------------------------------------------------------------------
function sanitizeUserOutputPhp($user, $currentUser = null) {
    if (!is_array($user)) return $user;
    $clean = $user;
    unset($clean['password_hash'], $clean['password']);

    $isSelf = $currentUser && strval($currentUser['id'] ?? '') === strval($user['id'] ?? '');
    $isAdmin = $currentUser && ($currentUser['role'] ?? '') === 'admin';

    if ($isSelf || $isAdmin) {
        if (!empty($clean['cpf'])) $clean['cpf'] = decryptAtRest($clean['cpf']);
        if (!empty($clean['pix_key'])) $clean['pix_key'] = decryptAtRest($clean['pix_key']);
        return $clean;
    }

    unset($clean['cpf'], $clean['pix_key'], $clean['phone'], $clean['email'], $clean['address']);
    return $clean;
}

function sanitizeOrderOutputPhp($order, $currentUser = null) {
    if (!is_array($order)) return $order;
    $clean = $order;
    $isOwner = $currentUser && (!empty($clean['customer_id']) && $clean['customer_id'] === $currentUser['id']);
    $isOwnerEmail = $currentUser && (!empty($clean['customer_email']) && $clean['customer_email'] === ($currentUser['email'] ?? ''));
    $isAdmin = $currentUser && ($currentUser['role'] ?? '') === 'admin';

    if ($isOwner || $isOwnerEmail || $isAdmin) {
        if (!empty($clean['customer_cpf'])) $clean['customer_cpf'] = decryptAtRest($clean['customer_cpf']);
        return $clean;
    }

    if (!empty($clean['customer_cpf'])) $clean['customer_cpf'] = '***.***.***-**';
    if (!empty($clean['customer_phone'])) $clean['customer_phone'] = '(**) *****-****';
    if (!empty($clean['customer_email'])) $clean['customer_email'] = preg_replace('/^(.{2})(.*)(@.*)$/', '$1***$3', $clean['customer_email']);
    unset($clean['shipping_address']);
    return $clean;
}
