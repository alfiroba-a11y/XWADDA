# XWADDA Admin and brand update

This package includes the current Node.js portal plus sticky navigation, separated XW mark and WADDA.KE wordmark, seller approval states, admin seller add/import tools, and account pagination.

## Deploy

Upload/replace the project files in your deployment source and redeploy the existing Node.js service. Keep production environment variables in Coolify; do not put secrets in this archive. After deployment, use a hard refresh if the browser still shows old styles.

CSV seller import columns: `email,displayName,category,services,location,startingPrice,currency`. Each email must match an existing account. Imported profiles stay pending until an administrator approves them.
