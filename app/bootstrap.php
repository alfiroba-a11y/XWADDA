<?php
declare(strict_types=1);

$privateConfig = dirname(__DIR__, 2) . '/xwadda-private/config.php';
if (!is_file($privateConfig)) {
    http_response_code(503);
    exit('XWADDA is not configured yet. Copy config.example.php to your private hosting folder and add database settings.');
}
$config = require $privateConfig;
if (!is_array($config)) {
    http_response_code(503);
    exit('XWADDA configuration is invalid.');
}
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']);
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Frame-Options: DENY');

function db(): PDO {
    static $pdo = null;
    global $config;
    if ($pdo instanceof PDO) return $pdo;
    $pdo = new PDO($config['dsn'], $config['db_user'], $config['db_password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}
function e(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function escrow_fee_minor(string $currency, int $principalMinor): int {
    if ($principalMinor < 0) throw new InvalidArgumentException('Amount must not be negative.');
    if ($currency === 'KES') {
        $fee = min($principalMinor,1000000)*0.03 + max(0,min($principalMinor-1000000,9000000))*0.02 + max(0,$principalMinor-10000000)*0.01;
        return (int)(round($fee/100)*100);
    } elseif ($currency === 'USDT') {
        $fee = min($principalMinor,10000)*0.025 + max(0,min($principalMinor-10000,90000))*0.015 + max(0,$principalMinor-100000)*0.01;
        return (int)round($fee);
    } else {
        throw new InvalidArgumentException('Unsupported deal currency.');
    }
}
function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function verify_csrf(): void {
    $sent = (string)($_POST['csrf'] ?? '');
    if (!hash_equals((string)($_SESSION['csrf'] ?? ''), $sent)) {
        http_response_code(419); exit('This form expired. Go back, refresh the page and try again.');
    }
}
function current_user(): ?array { return $_SESSION['user'] ?? null; }
function require_login(): array {
    $user = current_user();
    if (!$user) { header('Location: account.php'); exit; }
    return $user;
}
function require_admin(): array {
    $user = require_login();
    if (($user['role'] ?? '') !== 'admin') { http_response_code(403); exit('Administrator access required.'); }
    return $user;
}
