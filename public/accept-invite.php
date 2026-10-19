<?php
declare(strict_types=1);
require __DIR__ . '/app-loader.php';
$token=(string)($_GET['token']??$_POST['token']??'');
$invite=null;
if (preg_match('/^[a-f0-9]{64}$/',$token)) {
    $stmt=db()->prepare("SELECT i.id AS invite_id,i.deal_id,i.invited_email,i.expires_at,i.accepted_at,d.public_id,d.title,d.terms,d.currency,d.amount_minor,d.status,u.name AS buyer FROM deal_invites i JOIN deals d ON d.id=i.deal_id JOIN users u ON u.id=d.buyer_id WHERE i.token_hash=? LIMIT 1");
    $stmt->execute([hash('sha256',$token)]); $invite=$stmt->fetch() ?: null;
}
$error='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
    verify_csrf(); $user=require_login();
    if (!$invite || $invite['accepted_at'] || strtotime($invite['expires_at'])<time() || !hash_equals(strtolower($invite['invited_email']),strtolower($user['email']))) {
        $error='This invitation is expired, already used, or belongs to a different verified email.';
    } else {
        $pdo=db(); $pdo->beginTransaction();
        $lock=$pdo->prepare("SELECT id,accepted_at,expires_at FROM deal_invites WHERE id=? FOR UPDATE");
        $lock->execute([$invite['invite_id']]); $fresh=$lock->fetch();
        if (!$fresh || $fresh['accepted_at'] || strtotime($fresh['expires_at'])<time()) {
            $pdo->rollBack(); $error='This invitation is no longer available.';
        } else {
            $pdo->prepare("UPDATE deals SET seller_id=?,status='awaiting_payment' WHERE id=? AND status='awaiting_seller'")->execute([$user['id'],$invite['deal_id']]);
            $pdo->prepare('UPDATE deal_invites SET accepted_at=UTC_TIMESTAMP() WHERE id=?')->execute([$invite['invite_id']]);
            $pdo->commit(); header('Location: my-deals.php?accepted=1'); exit;
        }
    }
}
$user=current_user();
$eligible=$invite && !$invite['accepted_at'] && strtotime($invite['expires_at'])>=time() && $user && hash_equals(strtolower($invite['invited_email']),strtolower($user['email']));
?><!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Review deal · XWADDA.KE</title><link rel="stylesheet" href="assets/styles.css"><style>.invite{max-width:680px;margin:7vh auto;background:#fff;border:1px solid #e8ece7;border-radius:12px;padding:25px}.invite-terms{white-space:pre-wrap;background:#f7f9f6;border-radius:7px;padding:14px;font-size:12px;line-height:1.6;color:#657269}.invite-summary{display:flex;justify-content:space-between;border-bottom:1px solid #edf0ec;padding-bottom:14px;margin-bottom:14px}.invite h1{font:700 23px var(--display)}.invite p{font-size:12px;color:#77837b;line-height:1.6}.invite .button{margin-top:13px}.invite-error{background:#fbefec;color:#935345;padding:10px;border-radius:6px;font-size:11px}</style></head><body><main class="invite"><div class="eyebrow">XWADDA.KE · DEAL INVITATION</div><?php if($error):?><div class="invite-error"><?=e($error)?></div><?php endif;?><?php if(!$invite):?><h1>Invitation not found</h1><p>This invitation link is invalid.</p><?php elseif($invite['accepted_at']||strtotime($invite['expires_at'])<time()):?><h1>Invitation expired</h1><p>Ask the buyer to create a new invitation.</p><?php else:?><h1>Review the deal terms</h1><p>Invited by <?=e($invite['buyer'])?>. Read the agreement before accepting.</p><div class="invite-summary"><b><?=e($invite['title'])?></b><b><?=e($invite['currency'])?> <?=number_format(((int)$invite['amount_minor'])/100,2)?></b></div><div class="invite-terms"><?=e($invite['terms'])?></div><?php if(!$user):?><p>Sign in or create an account using <?=e($invite['invited_email'])?>, verify the email, then reopen this invitation link.</p><a class="button button-primary" href="account.php">Sign in / create account →</a><?php elseif(!$eligible):?><p>This invitation is for <?=e($invite['invited_email'])?>. Sign in with that verified email address.</p><a class="button button-outline" href="account.php">Switch account →</a><?php else:?><form method="post"><input type="hidden" name="csrf" value="<?=e(csrf_token())?>"><input type="hidden" name="token" value="<?=e($token)?>"><button class="button button-primary">Accept terms &amp; continue →</button></form><?php endif;?><?php endif;?></main><footer class="site-copyright">© <?=gmdate('Y')?> XWADDA.KE. All rights reserved.</footer></body></html>
