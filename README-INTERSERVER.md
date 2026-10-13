# XWADDA.KE — InterServer Ubuntu VPS

This repository is being moved from its earlier PHP/MySQL draft to a Node.js and MongoDB app for the InterServer VPS. The Node app uses `server.js`, serves the homepage from `public/index.html`, and stores users, deals, payment review records, and safety reports in MongoDB.

## Features in this conversion

- XWADDA black-and-white interface, logo, fee preview, seller/market/safety sections and copyright footer.
- Email/password accounts, password hashing, email verification and admin role set through `ADMIN_EMAIL`.
- Deal creation, seller invitation, accept, delivery, completion, dispute, admin review and audit entries.
- Progressive buyer fee: KES 3% of first KES 10,000, 2% of next KES 90,000, 1% above; USDT 2.5% of first $100, 1.5% of next $900, 1% above.
- Crypto payment instructions for the configured USDT TRC20/BEP20 addresses, QR codes, customer transaction hash and manual admin confirmation.
- HashBack M-Pesa checkout and signed webhook endpoints, gated on merchant credentials.

The earlier GitHub upload contains PHP/MySQL files. This Node deployment bundle excludes those files. Replace the old deployment files in GitHub with the contents of this bundle before cloning to the VPS. Configure Nginx to serve only this Node app's `public/` assets and proxy requests to the Node service.

## VPS setup guide (Ubuntu)

The commands below assume Ubuntu 24.04 LTS and a sudo-capable account. If the VPS has another Ubuntu release, check `/etc/os-release` and use the matching MongoDB installation instructions.

1. In the InterServer VPS page, note the server IP and root login details. Connect from PowerShell:

   ```powershell
   ssh root@YOUR_VPS_IP
   ```

2. Update Ubuntu and make a non-root deployment account:

   ```bash
   apt update && apt upgrade -y
   adduser deploy
   usermod -aG sudo deploy
   ```

   Set up an SSH key for `deploy` before disabling root/password SSH access. Keep your existing SSH connection open while verifying the new key login.

3. Install Git, Nginx and MongoDB Community 8.0 using MongoDB's official Ubuntu instructions. Keep MongoDB bound to localhost; do not open port 27017 to the public internet. Enable its authentication and create an application-only MongoDB user for the `xwadda` database.

   Official instructions: [MongoDB Community on Ubuntu](https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-ubuntu/).

4. Install the current Node.js LTS (Node 24) for the `deploy` account using the official Node.js instructions. Verify `node --version` is 24 or newer and `npm --version` works.

   Official download: [Node.js LTS](https://nodejs.org/en/download).

5. Add the VPS's SSH public key to your GitHub account or as a read-only deploy key on the private repository. Then clone the repository as `deploy`:

   ```bash
   sudo mkdir -p /var/www/xwadda
   sudo chown deploy:deploy /var/www/xwadda
   cd /var/www/xwadda
   git clone git@github.com:YOUR_GITHUB_NAME/YOUR_REPOSITORY.git .
   npm install --omit=dev
   cp .env.example .env
   chmod 600 .env
   ```

6. Edit `/var/www/xwadda/.env`. Set the real domain, a long random session secret, authenticated localhost MongoDB URI, admin email, SMTP credentials, and HashBack merchant values. Keep `.env` private and never commit it. Set `APP_URL=https://your-domain`.

   Example Mongo URI format after enabling MongoDB auth:

   ```text
   mongodb://xwadda_app:URL_ENCODED_PASSWORD@127.0.0.1:27017/xwadda?authSource=xwadda
   ```

7. Copy `deploy/nginx-xwadda.conf` to `/etc/nginx/sites-available/xwadda`, replace both example domain names, enable the site with a symlink in `sites-enabled`, then run `nginx -t` and reload Nginx. It serves only `/assets/` files and sends all other paths to Node, so the old PHP files are never served as source. Do not expose port 3000 or MongoDB publicly. Point DNS A/AAAA records to the VPS first, then enable HTTPS with Certbot. Allow SSH, HTTP, and HTTPS in the firewall.

8. Run the app as a systemd service so it restarts after a reboot. Copy `deploy/xwadda.service` to `/etc/systemd/system/xwadda.service`. It assumes Node 24.21.0 installed by nvm; update the `ExecStart` and `PATH` entries if your installed Node path differs.

   ```ini
   [Unit]
   Description=XWADDA.KE Node service
   After=network.target mongod.service
   Requires=mongod.service

   [Service]
   Type=simple
   User=deploy
   WorkingDirectory=/var/www/xwadda
   EnvironmentFile=/var/www/xwadda/.env
   ExecStart=/home/deploy/.nvm/versions/node/v24.21.0/bin/node /var/www/xwadda/server.js
   Restart=on-failure
   RestartSec=5
   NoNewPrivileges=true
   PrivateTmp=true

   [Install]
   WantedBy=multi-user.target
   ```

   Start it with `sudo systemctl daemon-reload && sudo systemctl enable --now xwadda` and inspect logs using `sudo journalctl -u xwadda -n 100 --no-pager`.

9. Create the first account using the `ADMIN_EMAIL` address from `.env`, verify it via the SMTP email link, then sign in. That exact account gets the admin role. Configure HashBack's callback URL as `https://your-domain/hashpay-webhook.php` only after confirming the provider's live signature header and payload format against your merchant account.

10. For updates from GitHub: `cd /var/www/xwadda && git pull && npm install --omit=dev && sudo systemctl restart xwadda`. Back up MongoDB before upgrades.

## Payment readiness

HashBack collections must be enabled and merchant credentials set before M-Pesa can accept money. The webhook uses the signed raw JSON body, configured account ID and exact total. Confirm the current HashBack callback format with HashBack before enabling live collection. USDT is not automatically monitored on-chain: admins must inspect the correct network, wallet, token, amount and transaction before confirming a payment. Payouts and refunds are manual outside the application. The admin panel records the decision; it does not transfer money.

Do not use sample market cards, safety alerts, or overview metrics as live user data. Real custody, KYC, dispute rules, payout controls, secure backups, incident response, and legal/compliance readiness must be in place before launch.

