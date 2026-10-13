<?php
declare(strict_types=1);
require __DIR__ . '/app/bootstrap.php';
$message = '';
$error = '';
$action = (string)($_POST['action'] ?? '');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    if ($action === 'logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) { $p=session_get_cookie_params(); setcookie(session_name(), '', time()-42000, $p['path'], $p['domain'] ?? '', $p['secure'], $p['httponly']); }
        session_destroy();
        header('Location: account.php'); exit;
    }
    if ($action === 'register') {
        $name = trim((string)($_POST['name'] ?? ''));
        $email = strtolower(trim((string)($_POST['email'] ?? '')));
        $password = (string)($_POST['password'] ?? '');
        if (mb_strlen($name) < 2 || mb_strlen($name) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
            $error = 'Enter a valid name and email. Your password must be at least 12 characters.';
        } else {
            try {
                $pdo = db(); $pdo->beginTransaction();
                $stmt = $pdo->prepare("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)");
                $stmt->execute([$name,$email,password_hash($password,PASSWORD_DEFAULT)]);
                $id = (int)$pdo->lastInsertId();
                $token = bin2hex(random_bytes(32));
                $pdo->prepare("INSERT INTO email_verifications(user_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 DAY))")->execute([$id,hash('sha256',$token)]);
                $pdo->commit();
                $url = rtrim($config['app_url'],'/') . '/verify.php?token=' . rawurlencode($token);
                $headers = "From: XWADDA.KE <".$config['mail_from'].">\r\nContent-Type: text/plain; charset=UTF-8";
                $sent = mail($email,'Verify your XWADDA.KE account',"Welcome to XWADDA.KE.\n\nVerify your email within 24 hours:\n$url\n\nIf you did not create this account, ignore this message.",$headers);
                $message = $sent ? 'Account created. Check your email for the verification link.' : 'Account created, but the hosting mail service did not accept the verification email. Configure outbound mail before inviting users.';
            } catch (PDOException $ex) {
                if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
                $error = $ex->getCode() === '23000' ? 'That email is already registered. Try signing in.' : 'Account creation could not be completed. Please try again later.';
            }
        }
    } elseif ($action === 'login') {
        $email = strtolower(trim((string)($_POST['email'] ?? '')));
        $stmt = db()->prepare('SELECT id,name,email,password_hash,role,status,email_verified_at FROM users WHERE email=? LIMIT 1');
        $stmt->execute([$email]); $user = $stmt->fetch();
        if (!$user || !password_verify((string)($_POST['password'] ?? ''),$user['password_hash'])) {
            $error = 'Email or password is incorrect.';
        } elseif ($user['status'] === 'suspended' || $user['status'] === 'closed') {
            $error = 'This account is not currently available. Contact support.';
        } elseif (!$user['email_verified_at']) {
            $error = 'Verify your email before signing in.';
        } else {
            session_regenerate_id(true);
            $_SESSION['user'] = ['id'=>(int)$user['id'],'name'=>$user['name'],'email'=>$user['email'],'role'=>$user['role']];
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
            header('Location: ' . ($user['role'] === 'admin' ? 'admin.php' : 'index.php')); exit;
        }
    }
}
$current = current_user();
?><!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Account · XWADDA.KE</title><link rel="stylesheet" href="assets/styles.css"><style>
.auth-wrap{min-height:100vh;display:grid;place-items:center;padding:24px;background:linear-gradient(135deg,#f5f7f3,#e8f1ea)}.auth-card{background:white;border:1px solid #e8ece7;border-radius:14px;width:min(470px,100%);padding:28px;box-shadow:0 18px 50px #20392b12}.auth-card h1{font:700 24px var(--display);margin:16px 0 5px}.auth-card p{font-size:12px;color:#87928a;line-height:1.55}.auth-tabs{display:flex;background:#f3f6f2;padding:4px;border-radius:7px;margin:20px 0}.auth-tabs button{width:50%;padding:9px;border:0;border-radius:5px;background:transparent;font-size:11px;color:#79847c}.auth-tabs button.active{background:#fff;color:#315a40;box-shadow:0 1px 5px #10201412;font-weight:700}.auth-form label{display:block;font-size:10px;color:#506056;font-weight:700;margin:12px 0}.auth-form input{display:block;width:100%;padding:11px;border:1px solid #e1e8e1;border-radius:6px;margin-top:5px;font-size:12px}.auth-message{padding:10px;background:#edf6ed;color:#36744d;border-radius:6px;font-size:11px;margin:12px 0}.auth-error{background:#fbefec;color:#9e5749}.auth-submit{width:100%;justify-content:center;margin-top:8px}.auth-foot{font-size:9px!important;text-align:center;margin-top:14px}.brand{padding:0}.auth-panel[hidden]{display:none}
</style></head><body><div class="auth-wrap"><div class="auth-card"><a class="brand" href="index.php"><span class="brand-mark">X</span><span>XWADDA<span class="brand-dot">.KE</span><small>TRADE WITH CLARITY</small></span></a><h1><?= $current ? 'Your account' : 'Welcome to XWADDA' ?></h1><p><?= $current ? 'You are signed in as ' . e($current['name']) . '.' : 'Create an account to manage real deals and keep your agreements in one place.' ?></p>
<?php if ($message): ?><div class="auth-message"><?=e($message)?></div><?php endif; ?><?php if ($error): ?><div class="auth-message auth-error"><?=e($error)?></div><?php endif; ?>
<?php if ($current): ?><a class="button button-primary auth-submit" href="<?=($current['role']==='admin'?'admin.php':'index.php')?>">Open workspace →</a><form method="post"><input type="hidden" name="csrf" value="<?=e(csrf_token())?>"><input type="hidden" name="action" value="logout"><button class="button button-outline auth-submit" type="submit">Sign out</button></form>
<?php else: ?><div class="auth-tabs"><button class="active" type="button" data-tab="login">Sign in</button><button type="button" data-tab="register">Create account</button></div>
<form class="auth-form auth-panel" id="login-panel" method="post"><input type="hidden" name="csrf" value="<?=e(csrf_token())?>"><input type="hidden" name="action" value="login"><label>Email address<input type="email" name="email" autocomplete="email" required></label><label>Password<input type="password" name="password" autocomplete="current-password" required></label><button class="button button-primary auth-submit" type="submit">Sign in →</button></form>
<form class="auth-form auth-panel" id="register-panel" method="post" hidden><input type="hidden" name="csrf" value="<?=e(csrf_token())?>"><input type="hidden" name="action" value="register"><label>Your name<input name="name" maxlength="120" autocomplete="name" required></label><label>Email address<input type="email" name="email" autocomplete="email" required></label><label>Password<input type="password" name="password" minlength="12" autocomplete="new-password" required><small>Use at least 12 characters.</small></label><button class="button button-primary auth-submit" type="submit">Create account →</button></form>
<p class="auth-foot">Email verification is required. Payments are not enabled until a provider and escrow-funds arrangement are configured.</p><?php endif; ?></div></div><script>
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.auth-panel').forEach(f=>f.hidden=f.id!==b.dataset.tab+'-panel')}));
</script><footer class="site-copyright">© <?=gmdate('Y')?> XWADDA.KE. All rights reserved.</footer></body></html>
