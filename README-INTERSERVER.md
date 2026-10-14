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

### Sign-in and Google

The sign-in and registration forms use a signed, time-limited form token. It does not depend on the browser retaining the same Mongo session cookie between the page view and form submit, preventing the proxy-related “Form expired” 419 shown by older builds. After updating, redeploy the application.

To enable Google sign-in, set `GOOGLE_CLIENT_ID` in Coolify's **Production** environment. Create a Google OAuth client with application type **Web application** and add the site's exact HTTPS origin to **Authorized JavaScript origins** (for example, `https://xwadda.example`). Google sign-in requires a secure HTTPS domain; the temporary `http://...sslip.io` address shown in setup is not suitable for Google OAuth. Add the same variable to Preview only if preview deployments should offer Google sign-in. Users can use the same verified email as their existing password account.

The app defaults to automatic secure-cookie detection. If you are temporarily testing on the HTTP-only Coolify `sslip.io` link and sign-in succeeds but does not stay signed in, set `COOKIE_SECURE=false`. Once the site has HTTPS, set `COOKIE_SECURE=true` (or remove the variable to use automatic detection). Do not leave secure cookies disabled on a public HTTPS site.

The app listens on port 3000 while MongoDB connects and retries, so a database outage no longer prevents the HTTP server from binding. `/health` reports `503` until MongoDB is ready; the dashboard also shows a clear temporary database message. A **502 Bad Gateway** after this update points to a build/startup/port problem; inspect Coolify's **Deployment Logs** and **Runtime Logs**. If logs show `MongoServerSelectionError`, `ECONNREFUSED`, or a timeout, check that `MONGODB_URI` points to the running MongoDB resource's internal network hostname and credentials—not `localhost`, `127.0.0.1`, or an external app's URI. The app retries and logs a specific MongoDB connection hint.

## Shared-room flow

1. Sign in and create a room as buyer, seller, or third party. XWADDA generates the five-character code.
2. Share the code. A signed-in participant chooses one of the unclaimed roles to join. One account cannot take two seats, and the same display name cannot occupy multiple seats in a room.
3. Once buyer and seller have joined, the buyer can deposit through the configured payment flow. Deposits remain pending until XWADDA confirms receipt.
4. After funding, the seller marks delivery in the room. The buyer can approve delivery and request payout. Disputes and refund requests pause the room for XWADDA support review.
5. XWADDA records the result after the payout or refund has been processed. The room timeline records participant messages and status changes.

Five-character codes are invitations, not passwords. Require accounts to join and do not share codes publicly. Dashboard totals and room history are calculated from the signed-in user's actual deal records; no sample account history is shown.

## Payment operations

Members can store M-Pesa, Binance Pay ID, and USDT BEP20/TRC20 payout destinations in **Wallet & payouts**. These values are encrypted with a key derived from `SESSION_SECRET`; keep that secret stable across deployments and backups or saved wallet values cannot be decrypted. Blank fields keep the previous value; use the clear checkbox to remove a destination.

The M-Pesa checkout is provided through XWADDA. The app shows an animated waiting state and can resend the prompt using the same pending payment reference. A browser response only records a claim for review; it never confirms funds. A verified payment notification can confirm a matching amount and merchant account, or XWADDA can record a deposit after checking the payment or chain record. The payment window is hosted externally and may display the payment service's own branding.

USDT TRC20 and BEP20 deposits are submitted for manual on-chain review. The application does not currently initiate M-Pesa, Binance Pay, or blockchain payouts from the saved wallet destinations. XWADDA must make the real payout/refund through the connected payment service or wallet and then record its transfer reference in the control center. A refund cannot be recorded until both buyer and seller agree. Deal members can download an XWADDA-generated PDF transaction record; its circular five-star stamp is an XWADDA record mark, not a provider, bank, or legal certification.

## InterServer VPS

Coolify runs on the existing InterServer Ubuntu VPS. Open the dashboard at `http://YOUR_VPS_IP:8000`, connect the GitHub source, and use the settings above. For public HTTPS, attach a domain in Coolify and point its DNS to the VPS. Do not expose MongoDB publicly.


If SMTP is not configured, signup creates and verifies the account directly so the user can sign in. Configure SMTP if you want email verification enabled.
# USDT kiosk payments

The kiosk reuses the escrow payment setup: M-Pesa checkout uses the existing M-Pesa account and webhook settings, while TRC20 and BEP20 deposits use the same `TRC20_ADDRESS` and `BEP20_ADDRESS` values and QR assets as escrow checkout. No separate kiosk payment destination values are required. When buying USDT, members can select TRC20/BEP20 wallet payout or provide a Binance ID, Bitget UID, or Bybit account ID. When selling USDT, they select the escrow deposit network and use the M-Pesa number saved under Wallet & payouts for KES payout. The kiosk loads current USDT/KES reference quotes from the public P2P quote endpoint, refreshes its cache every minute, and stores a signed quote with each order. An unavailable quote pauses new orders rather than substituting a stored rate. The rate is indicative and may differ from another payment method or an individual counterparty's price.
