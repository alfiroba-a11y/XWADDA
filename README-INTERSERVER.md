# XWADDA.KE on InterServer with Coolify

XWADDA is a Node.js and MongoDB application. The public landing page explains the service; the account dashboard and deal history appear only after sign-in. Buyer, seller and third-party participants share a private room opened with a unique five-character code.

## Update the live application

Put these files at the root of the GitHub repository connected to Coolify:

- `Dockerfile`, `package.json`, `server.js`, and `portal.js`
- `public/landing.html`
- `public/assets/portal.css`, `public/assets/preferences.css`, `public/assets/preferences.js`, `public/assets/deal-fee.js`, the XWADDA logo, and both crypto QR images

In Coolify, keep the application build strategy set to **Dockerfile**, base directory `/`, Dockerfile location `/Dockerfile`, and exposed port `3000`. Push the repository update and deploy the new commit. The Dockerfile copies the app files into the image.

Keep the existing MongoDB service and application variables. The app accepts `MONGO_URI` or `MONGODB_URI`; either must contain MongoDB's internal Coolify connection string. Set `MONGODB_DB=xwadda_ke_production` so this site's accounts, deals and sessions use a dedicated database even when the MongoDB server is shared. Do not use `127.0.0.1` or `localhost` for the database host because the app runs in a separate container. Keep the database private; do not expose port 27017 publicly. Keep merchant credentials and all secrets in Coolify, never in GitHub.

Set `APP_URL` to the public site URL for verification emails. Set `SUPPORT_EMAIL` when the support address is ready; the Contact Support page uses that value. The public landing page has separate Sign in and Create account links. Passwords must be at least 6 characters. When SMTP is absent, accounts are verified at signup so people can sign in; configured SMTP enables email verification.

## Shared-room flow

1. Sign in and create a room as buyer, seller, or third party. XWADDA generates the five-character code.
2. Share the code. A signed-in participant chooses one of the unclaimed roles to join. One account cannot take two seats, and the same display name cannot occupy multiple seats in a room.
3. Once buyer and seller have joined, the buyer can deposit through the configured payment flow. Deposits remain pending until an admin verifies receipt.
4. After funding, the seller marks delivery in the room. The buyer can approve delivery and request payout. Disputes and refund requests pause the room for admin review.
5. An admin records the result after manually handling the payout or refund. The room timeline records participant messages and status changes.

Five-character codes are invitations, not passwords. Require accounts to join and do not share codes publicly. Dashboard totals and room history are calculated from the signed-in user's actual deal records; no sample account history is shown.

## Payment operations

HashBack M-Pesa collection needs active merchant credentials and the provider's confirmed callback configuration. USDT TRC20 and BEP20 deposits are submitted for manual on-chain review. This application does not automatically move funds: admin verification, payouts, and refunds are manual operations. Confirm the transfer with the appropriate provider or chain before recording it in the admin panel.

## InterServer VPS

Coolify runs on the existing InterServer Ubuntu VPS. Open the dashboard at `http://YOUR_VPS_IP:8000`, connect the GitHub source, and use the settings above. For public HTTPS, attach a domain in Coolify and point its DNS to the VPS. Do not expose MongoDB publicly.


If SMTP is not configured, signup creates and verifies the account directly so the user can sign in. Configure SMTP if you want email verification enabled.
