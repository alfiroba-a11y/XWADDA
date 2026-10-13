<?php
// Copy this file to ~/xwadda-private/config.php (outside public_html) and edit it.
return [
    'dsn' => 'mysql:host=localhost;dbname=CPANEL_DB_NAME;charset=utf8mb4',
    'db_user' => 'CPANEL_DB_USER',
    'db_password' => 'REPLACE_WITH_A_LONG_RANDOM_PASSWORD',
    'app_url' => 'https://xwadda.ke',
    'mail_from' => 'accounts@xwadda.ke',
    // HashBack HashPay public collection account plus its server-side webhook signing secret.
    'hashpay_account_id' => 'HP_REPLACE_ME',
    'hashpay_webhook_secret' => 'REPLACE_WITH_HASHBACK_WEBHOOK_SECRET',
    // HashPay.me crypto API is a separate product from HashBack M-Pesa HashPay.
    'crypto_hashpay_api_key' => 'REPLACE_WITH_HASHPAY_ME_API_KEY',
    'crypto_hashpay_organization_id' => 'REPLACE_WITH_HASHPAY_ME_ORGANIZATION_ID',
    'crypto_hashpay_webhook_secret' => 'REPLACE_WITH_HASHPAY_ME_WEBHOOK_SECRET',
];
