# XWADDA.KE — InterServer setup

## Current implementation

This build has persistent MySQL accounts with email verification, password hashing, CSRF-protected forms, seller invitations, private safety reports, admin account moderation, report review and an audit log. Buyers can create KES or USDT deals. A progressive buyer-paid fee is applied by the server: KES 3% of the first KES 10,000, 2% of the next KES 90,000 and 1% thereafter; USDT 2.5% of the first 100, 1.5% of the next 900 and 1% thereafter. The fee is rounded to whole shillings for KES and cents for USDT, shown before deal creation, locked with the deal and added to checkout. After the invited seller accepts, KES deals use HashBack HashPay's hosted M-Pesa checkout and signed webhook; USDT deals show the selected TRC20 or BEP20 address and QR. Buyers can submit a transaction hash for review. An admin must verify its network, amount and destination on-chain before confirming the deposit and marking the deal funded. Admin access is granted manually by the site owner; there is no public admin signup.

The customer-facing overview still contains illustrative sample listings, metrics and deal rows. Seller payout, refunds and dispute resolution are not implemented. USDT-denominated deals offer TRON (TRC20) or BNB Smart Chain (BEP20) manual transfers using the supplied wallet addresses and QR codes. Buyer-submitted transaction hashes remain pending until an admin verifies them on-chain and confirms the deposit. M-Pesa deposits are provider-confirmed; USDT deposits are manually confirmed by an administrator after on-chain review. These pages do not automatically release or pay out funds. Do not accept customer money until your HashBack merchant channel is configured and tested, payout/reconciliation operations are completed, the safeguarded funds arrangement is in place, and the remaining operating controls are ready.

## InterServer cPanel installation

### Deploying from GitHub

The repository is arranged with project files in its main folder and public website files in `public/`:

```text
xwadda-repo/                 GitHub/cPanel source (outside public_html)
  app/                       PHP application code
  database/                  schema and migrations
  public/                    website pages, assets and .htaccess
  .cpanel.yml                cPanel deployment instructions
  README-INTERSERVER.md

/home/CPANEL_USERNAME/public_html/      live document root; receives only public/*
/home/CPANEL_USERNAME/xwadda-private/   private config.php and deployed app code
```

Before pushing to GitHub, edit `.cpanel.yml`. Replace `CPANEL_USERNAME` in both paths with the exact cPanel account username. Set `DEPLOYPATH` to the domain's actual document root shown in cPanel **Domains** (usually `/home/USERNAME/public_html/`). Keep the GitHub repo private; `.gitignore` excludes secrets, ZIPs and work files.

From PowerShell in the project folder, create an empty private repository in GitHub, then run:

```powershell
git init -b main
git add .
git commit -m "Prepare XWADDA deployment"
git remote add origin https://github.com/YOUR_GITHUB_NAME/xwadda-ke.git
git push -u origin main
```

If the project is already a Git repository, skip `git init` and add/commit only the changes. Replace the GitHub URL with your repository's URL.

In InterServer cPanel, open **Files → Git Version Control → Create**, choose **Clone a Repository**, paste the GitHub clone URL, and use a repository path outside the live document root, such as `/home/CPANEL_USERNAME/xwadda-repo`. For a private GitHub repo, configure an SSH key in cPanel and add its public key in GitHub under **Settings → Deploy keys** (read-only access is enough). InterServer's [cPanel clone guide](https://www.interserver.net/tips/kb/how-to-clone-a-git-repository-in-cpanel/) covers the clone screen.

After cloning, open **Manage → Pull or Deploy** for that repository. Use **Update from Remote**, then **Deploy HEAD Commit**. The checked-in `.cpanel.yml` copies `public/` into the live document root and copies `app/` to `~/xwadda-private/app/`; it does not publish `database/` or the rest of the repository. cPanel deployment requires `.cpanel.yml` at the repository root and a clean working tree, as described in its [deployment guide](https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-deployment/).

Create `~/xwadda-private/config.php` by copying the deployed `~/xwadda-private/app/config.example.php`. Add the database and HashBack settings there. Never commit this config or provider credentials to GitHub. Import `database/schema.sql` from the cPanel repository into the database using phpMyAdmin. If you already imported an earlier XWADDA schema, run `database/migrations/20261013_fee_minor.sql` once instead.

Then enable SSL, confirm PHP 8.0+ with PDO MySQL and mbstring, configure email and the HashBack webhook, verify the two crypto wallet addresses, register and verify your admin account, and grant it the `admin` role in phpMyAdmin. The exact commands and payment setup steps follow below.
### First-time application setup after deployment

1. In cPanel **MySQL Database Wizard**, create the database and user, grant the user all required privileges, and record the full database name and username (cPanel commonly prefixes them).
2. In **phpMyAdmin**, select the database and import `database/schema.sql` from the repository. For an earlier deployed schema, import `database/migrations/20261013_fee_minor.sql` once instead.
3. In cPanel **File Manager**, open `/home/CPANEL_USERNAME/xwadda-private/app/`, copy `config.example.php` to `/home/CPANEL_USERNAME/xwadda-private/config.php`, then edit the DSN, database user/password, `app_url`, sender address, HashBack account ID and webhook secret. Keep the actual config outside `public_html`.
4. Enable SSL for the domain and configure the sender email's DNS/mail so PHP `mail()` can send verification and deal invitations.
5. In HashBack HashPay, set the callback URL to `https://YOUR_DOMAIN/hashpay-webhook.php` and enable the M-Pesa collection channel.
6. Create your own XWADDA account, verify its email, then run this in phpMyAdmin (replace the email with your verified account):

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'YOUR_VERIFIED_ADMIN_EMAIL';
   ```

7. Sign in and open `/admin.php`. Before launch, confirm the configured merchant details, receiving wallet addresses, fee schedule, support contact and manual payout process.
## Payment provider details needed before live payment work

The selected M-Pesa product is HashBack HashPay. Its hosted payment button uses a public account ID; the integration relies on the provider's HMAC-SHA256 webhook signature and only marks a deal funded after the matching amount and account are confirmed. The provider documents its lower-level STK API as being phased out, so the current hosted-button flow is used instead.

The requested crypto assets are USDT TRC20 and USDT BEP20. Crypto-priced deals can be created directly in USDT to avoid a KES/USD exchange-rate assumption. This build uses static merchant wallet addresses and QR codes supplied by the owner. Customers submit transaction hashes; an administrator must confirm the exact network, receiving address and amount on-chain before funding a deal. Crypto payment confirmation is manual and no automated on-chain verification is included. Seller payouts remain manual as requested.

For M-Pesa, test in the provider's approved test environment before switching the account to live. Deposit callbacks are checked for signature, account, unique payment reference and exact KES amount, and repeated callbacks do not repeat the state change. The site does not currently send payouts or refunds; use the provider dashboard for manual reconciliation until those operations are integrated and reviewed.

## Funds custody and operating readiness

The admin panel provides operational visibility and moderation. Admin access alone does not establish who safeguards customer money. The user says the business has the required authorization and safeguarding setup; configure the account to match that approved flow and have qualified Kenyan counsel/compliance staff review it before launch. Add dispute rules, KYC/AML controls, fraud monitoring, payout verification, backups, incident response and support procedures before launch.

The Central Bank of Kenya describes mobile-money operators as authorized payment service providers and lists the National Payment System Act/Regulations framework; its PSP checklist includes safeguarding customer funds. The ODPC says entities processing personal data in Kenya must assess and meet data-handler registration requirements. Obtain qualified Kenyan legal/compliance guidance for the intended business model and transaction flows.
