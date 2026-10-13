# XWADDA.KE — deploy from GitHub with Coolify

This package runs XWADDA.KE as a Dockerized Node.js application with MongoDB. Use Coolify on the InterServer Ubuntu VPS for a Render-style dashboard workflow: link GitHub, set environment variables, deploy, and manage the MongoDB service.

## What is included

- Black-and-white XWADDA interface, logo, market/seller/safety sections, progressive fee preview, and copyright footer.
- MongoDB-backed account, email verification, deal, payment-review, safety-report, and audit records.
- Seller invitations and acceptance, funded delivery flow, completion, disputes, and admin review.
- Progressive buyer fee: KES 3% of first KES 10,000, 2% of next KES 90,000, 1% above; USDT 2.5% of first $100, 1.5% of next $900, 1% above.
- USDT TRC20/BEP20 deposit instructions with manual on-chain review.
- HashBack M-Pesa checkout/webhook routes that require your merchant credentials and verified callback setup.

## Deploy to your active InterServer Ubuntu VPS

Coolify is InterServer's self-hostable deployment dashboard. The VPS marketplace has a Coolify template for new servers; for your existing Ubuntu VPS, the Coolify installer is the direct setup path. Coolify recommends starting on a fresh VPS and requires at least 2 CPU cores, 2 GB RAM and 10 GB disk for itself. If the VPS already hosts sites or services, back those up and check for port conflicts first.

1. In the InterServer VPS details, copy the server IP and root SSH credentials. From Windows PowerShell, connect:

   ```powershell
   ssh root@YOUR_VPS_IP
   ```

2. On the VPS, install Coolify with its official installer:

   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```

3. When installation finishes, open `http://YOUR_VPS_IP:8000` in your browser and create the Coolify admin account right away. Keep the generated Coolify secrets backed up. Keep ports 80, 443 and 8000 reachable as needed; never expose MongoDB's port 27017 publicly.

4. In Coolify, create a project, choose **New Resource → Application → GitHub**, connect GitHub, and select this repository and its branch. Choose Dockerfile as the build method (Coolify can detect the repository's root `Dockerfile`). Set the exposed application port to `3000`.

5. Create the database in that same Coolify project with **New Resource → Database → MongoDB**. Deploy the database, then copy its **Internal URL** from its configuration. Do not turn on public access for MongoDB.

6. In the app's **Environment Variables**, add:

   ```text
   NODE_ENV=production
   PORT=3000
   APP_URL=https://YOUR_DOMAIN
   MONGODB_URI=PASTE_THE_MONGODB_INTERNAL_URL
   SESSION_SECRET=PASTE_A_LONG_RANDOM_SECRET
   ADMIN_EMAIL=YOUR_ADMIN_EMAIL
   MAIL_HOST=YOUR_SMTP_HOST
   MAIL_PORT=587
   MAIL_USER=YOUR_SMTP_USERNAME
   MAIL_PASSWORD=YOUR_SMTP_PASSWORD
   MAIL_FROM=XWADDA.KE <accounts@YOUR_DOMAIN>
   HASHPAY_ACCOUNT_ID=YOUR_HASHBACK_ACCOUNT_ID
   HASHPAY_WEBHOOK_SECRET=YOUR_HASHBACK_WEBHOOK_SECRET
   TRC20_ADDRESS=TMVimVUeR8u9R6HdjfGzeUeeZtzi19KM72
   BEP20_ADDRESS=0x352b897c40ae74619ed792932a1e561ebcb7331e
   ```

   Keep these values in Coolify's environment settings; never commit real credentials to GitHub. Create a random `SESSION_SECRET` in a password manager or with `openssl rand -base64 48`.

7. Add your domain to the application's Domains setting, point its DNS A record at the VPS IP, then deploy. Coolify can provide HTTPS after DNS points to the VPS. Check `https://YOUR_DOMAIN/health` for `{"ok":true,"service":"xwadda"}`.

8. Create an account using the `ADMIN_EMAIL` address, verify it through email, and sign in to the admin page. In Coolify, enable Git-based auto-deploy if you want commits pushed to the connected branch to deploy automatically.

Coolify's install and app setup instructions: [Self-hosted installation](https://coolify.io/docs/start-with-self-hosted), [deploy applications](https://coolify.io/docs/applications/), [MongoDB databases](https://coolify.io/docs/databases/).

## Payment readiness

HashBack M-Pesa collection requires live merchant credentials and a confirmed callback signature/payload setup before it can accept payments. Set the callback to `https://YOUR_DOMAIN/hashpay-webhook.php` only after HashBack confirms the live webhook format. Crypto payments remain pending until an admin verifies the exact network, wallet, amount and transaction on-chain. Payouts and refunds are manual outside this app; the admin panel records the decision but does not transfer funds.

The sample market cards, safety notices and overview metrics are illustrative. Add operating policies, tested backups, incident response, identity and dispute controls, and appropriate legal/compliance readiness before accepting customer funds.
