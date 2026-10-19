<?php
declare(strict_types=1);
require __DIR__ . '/app/bootstrap.php';
$ok = false;
$token = (string)($_GET['token'] ?? '');
if (preg_match('/^[a-f0-9]{64}$/',$token)) {
    $pdo=db(); $stmt=$pdo->prepare('SELECT user_id FROM email_verifications WHERE token_hash=? AND expires_at>UTC_TIMESTAMP()');
    $stmt->execute([hash('sha256',$token)]); $row=$stmt->fetch();
    if ($row) {
        $pdo->beginTransaction();
        $pdo->prepare("UPDATE users SET status='active',email_verified_at=UTC_TIMESTAMP() WHERE id=? AND status='pending_verification'")->execute([$row['user_id']]);
        $pdo->prepare('DELETE FROM email_verifications WHERE user_id=?')->execute([$row['user_id']]);
        $pdo->commit(); $ok=true;
    }
}
?><!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify email · XWADDA.KE</title><link rel="stylesheet" href="assets/styles.css"><main style="max-width:520px;margin:12vh auto;background:white;padding:32px;border-radius:12px"><div class="eyebrow">XWADDA.KE</div><h1 style="font:700 23px var(--display)"><?= $ok ? 'Email verified' : 'Verification link unavailable' ?></h1><p style="color:#7d8982;font-size:13px"><?= $ok ? 'Your account is active. You can now sign in.' : 'This link may have expired or already been used. Request a new verification email.' ?></p><a class="button button-primary" href="account.php">Continue to sign in →</a></main><footer class="site-copyright">© <?=gmdate('Y')?> XWADDA.KE. All rights reserved.</footer></html>
