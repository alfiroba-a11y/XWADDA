/* Distinct XWADDA portal treatment: paper, ink and a restrained signal blue. */
body[data-theme="light"]{--xw-ink:#111318;--xw-muted:#667085;--xw-surface:#fff;--xw-page:#f4f5f7;--xw-line:#dfe2e8;--xw-menu:#f9fafb;--xw-menu-active:#e9edff;--xw-accent:#3157df;--xw-accent-ink:#fff}
body[data-theme="dark"]{--xw-ink:#f4f5f7;--xw-muted:#a6adbb;--xw-surface:#17191f;--xw-page:#0e1015;--xw-line:#30343d;--xw-menu:#14161b;--xw-menu-active:#252b3c;--xw-accent:#8da3ff;--xw-accent-ink:#111318}
body[data-theme]{background:var(--xw-page);color:var(--xw-ink)}
body[data-theme] .app-sidebar{background:var(--xw-menu);color:var(--xw-ink);border-right:1px solid var(--xw-line);box-shadow:none}
body[data-theme] .sidebar-link{display:flex;align-items:center;gap:13px;width:100%;min-height:48px;padding:10px 13px;border:1px solid transparent;border-radius:9px;background:transparent;color:var(--xw-ink);font-weight:650;text-align:left;transition:background .16s,border-color .16s,transform .16s}
body[data-theme] .sidebar-link:hover{background:var(--xw-surface);border-color:var(--xw-line);transform:translateX(2px)}
body[data-theme] .sidebar-link.active{background:var(--xw-menu-active);color:var(--xw-accent);border-color:transparent;box-shadow:inset 3px 0 var(--xw-accent)}
.menu-icon{width:19px;height:19px;flex:0 0 19px;display:block}
body[data-theme] .sidebar-label{color:var(--xw-muted);letter-spacing:.14em}
body[data-theme] .sidebar-brand,body[data-theme] .sidebar-brand span{color:var(--xw-ink)}
body[data-theme] .sidebar-bottom{border-top:1px solid var(--xw-line)}
body[data-theme] .portal-content{background:var(--xw-page)}
body[data-theme] .dash-welcome{background:transparent;border:0;box-shadow:none}
body[data-theme] .metric,body[data-theme] .deal-card,body[data-theme] .glass-card,body[data-theme] .panel-light,body[data-theme] .insight-card{background:var(--xw-surface);color:var(--xw-ink);border-color:var(--xw-line);box-shadow:0 8px 24px #10152208}
body[data-theme] .deal-card:hover{border-color:var(--xw-accent);transform:translateY(-2px)}
body[data-theme] .button.primary{background:var(--xw-accent);color:var(--xw-accent-ink);border-color:var(--xw-accent)}
body[data-theme] .button.secondary,body[data-theme] .button.ghost{background:var(--xw-surface);color:var(--xw-ink);border-color:var(--xw-line)}
body[data-theme] .sidebar-toggle{display:inline-grid;place-items:center;width:40px;height:40px;border:1px solid var(--xw-line);border-radius:9px;background:var(--xw-surface);color:var(--xw-ink)}
body[data-theme] .state-pill.status-completed,body[data-theme] .status-completed{color:#12834b;background:transparent;border-color:#12834b}
body[data-theme] .state-pill.status-cancelled,body[data-theme] .status-cancelled{color:#c23838;background:transparent;border-color:#c23838}
body[data-theme] .state-pill.status-funded,body[data-theme] .status-funded{color:#16834d}
.escrow-live-strip{max-width:1240px;margin:0 auto;padding:20px 26px 22px;border:1px solid var(--line,#e4e7eb);border-radius:16px;background:var(--surface,#fff);box-shadow:0 16px 42px #1218260a}
.escrow-live-heading{display:flex;justify-content:space-between;align-items:center;gap:15px}.escrow-live-heading .eyebrow{display:flex;align-items:center;gap:9px}.escrow-live-heading .eyebrow i{width:8px;height:8px;border-radius:50%;background:#238456;box-shadow:0 0 0 4px #23845618}.escrow-live-heading small{color:#737b89;font-size:12px}
.escrow-live-values{display:grid;grid-template-columns:1fr 1fr auto;align-items:end;gap:22px;margin-top:18px}.escrow-live-values article{padding:15px 17px;border-left:3px solid #3157df;background:#f5f6fa;border-radius:0 10px 10px 0}.escrow-live-values article small,.escrow-live-values article span{display:block;color:#707989;font-size:11px}.escrow-live-values article strong{display:block;font-size:clamp(22px,3vw,32px);letter-spacing:-.04em;color:#111318;margin:5px 0}.escrow-live-values article span b{color:#3157df}.escrow-live-values>p{max-width:220px;margin:0;color:#737b89;font-size:11px;line-height:1.5}
body[data-theme="dark"] .escrow-live-strip{background:#17191f;border-color:#30343d}body[data-theme="dark"] .escrow-live-values article{background:#20232b;border-left-color:#8da3ff}body[data-theme="dark"] .escrow-live-values article strong{color:#f4f5f7}body[data-theme="dark"] .escrow-live-values article span b{color:#a8b7ff}
.scam-result{margin-top:16px;padding:17px;border:1px solid var(--line,#dfe2e8);border-left:4px solid #8c929d;border-radius:10px;background:var(--surface,#fff)}.scam-result.has-match{border-left-color:#c43b3b}.scam-result.no-match{border-left-color:#248052}.scam-result h2{margin:5px 0}.scam-result article{padding:11px 0;border-top:1px solid var(--line,#dfe2e8)}.scam-result article p{margin:6px 0}.scam-result small{color:var(--muted,#667085)}
body[data-theme="dark"] .scam-result{background:var(--xw-surface);border-color:var(--xw-line)}
.payment-number{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;border:1px solid var(--xw-line,#dfe2e8);border-radius:10px;background:var(--xw-page,#f4f5f7);font-size:20px;font-weight:750;letter-spacing:.04em}.payment-number small{display:block;color:var(--xw-muted);font-size:11px;font-weight:500;letter-spacing:0}.payment-number input{max-width:250px;padding:12px;border:1px solid var(--xw-line);border-radius:8px;background:var(--xw-surface);color:var(--xw-ink);font-size:18px}
.payment-progress.is-active{display:flex!important;align-items:center;gap:13px;padding:15px;border:1px solid var(--xw-line);border-radius:10px;background:var(--xw-page)}.payment-spinner{width:22px;height:22px;border:2px solid #3157df3c;border-top-color:#3157df;border-radius:50%;animation:xw-spin .8s linear infinite}.payment-progress:not(.is-active) .payment-spinner{display:none}@keyframes xw-spin{to{transform:rotate(360deg)}}
@media(max-width:680px){.escrow-live-strip{margin:0 16px;padding:17px}.escrow-live-values{grid-template-columns:1fr 1fr;gap:10px}.escrow-live-values>p{grid-column:1/-1;max-width:none}.escrow-live-values article{padding:12px}.escrow-live-values article strong{font-size:22px}.escrow-live-heading small{font-size:10px;text-align:right}.payment-number{align-items:flex-start;flex-direction:column}.payment-number input{width:100%;max-width:none}}

/* Preserve contrast in both themes, including labels placed on dark chips. */
body[data-theme="light"] .code-chip,
body[data-theme="light"] .deal-code,
body[data-theme="light"] .room-code strong,
body[data-theme="light"] .how-grid article>span {background:#f0f1f4!important;color:#17191d!important}
body[data-theme="light"] .sidebar-link {color:#17191d!important}
body[data-theme="light"] .sidebar-label {color:#555d6b!important}
body[data-theme="light"] .sidebar-link:hover,
body[data-theme="light"] .sidebar-link.active {background:#e9edff!important;color:#2447ca!important}
body[data-theme="light"] .preview-badge,
body[data-theme="light"] .preview-note,
body[data-theme="light"] .hero-proof small {color:#424956!important}
body[data-theme="light"] .escrow-live-values article {background:#f1f3f8;color:#16181d}
body[data-theme="light"] .escrow-live-values article small {color:#4f5868}
body[data-theme="light"] .escrow-live-values article strong {color:#111318}
body[data-theme="light"] .escrow-live-values>p,
body[data-theme="light"] .escrow-live-heading small {color:#4f5868}
body[data-theme="dark"] .code-chip,
body[data-theme="dark"] .deal-code,
body[data-theme="dark"] .room-code strong,
body[data-theme="dark"] .how-grid article>span {background:#252933!important;color:#b6c4ff!important}
body[data-theme="dark"] .preview-badge {color:#f0f2f7!important;border-color:#687080}
body[data-theme="dark"] .preview-note,
body[data-theme="dark"] .hero-proof small,
body[data-theme="dark"] .escrow-live-values article small,
body[data-theme="dark"] .escrow-live-values>p,
body[data-theme="dark"] .escrow-live-heading small {color:#c0c6d1!important}
body[data-theme="dark"] .escrow-live-values article {background:#20232b;color:#f4f5f7}
/* Keep supporting copy legible on every dark-mode surface, not just the main headings. */
body[data-theme="dark"] .landing-hero,
body[data-theme="dark"] .about-section,
body[data-theme="dark"] .how-section,
body[data-theme="dark"] .feature-section,
body[data-theme="dark"] .kiosk-service-section,
body[data-theme="dark"] .payments-section,
body[data-theme="dark"] .faq-section,
body[data-theme="dark"] .page-body {color:#f1f2f5}
body[data-theme="dark"] .landing-hero p,
body[data-theme="dark"] .about-section>p,
body[data-theme="dark"] .section-head>p,
body[data-theme="dark"] .how-grid p,
body[data-theme="dark"] .feature-grid p,
body[data-theme="dark"] .kiosk-service-grid p,
body[data-theme="dark"] .payments-section p,
body[data-theme="dark"] .payments-section li,
body[data-theme="dark"] .faq-section details p,
body[data-theme="dark"] .page-body p,
body[data-theme="dark"] .page-body small,
body[data-theme="dark"] .form-note,
body[data-theme="dark"] .role-note,
body[data-theme="dark"] .terms-copy,
body[data-theme="dark"] .party-row small,
body[data-theme="dark"] .room-code small,
body[data-theme="dark"] .message span {color:#c9ced8!important}
body[data-theme="dark"] .how-grid article,
body[data-theme="dark"] .feature-grid article,
body[data-theme="dark"] .kiosk-service-grid article,
body[data-theme="dark"] .payment-card,
body[data-theme="dark"] .proof-strip,
body[data-theme="dark"] .faq-section details,
body[data-theme="dark"] .page-body .panel,
body[data-theme="dark"] .page-body .panel-light,
body[data-theme="dark"] .page-body .deal-card,
body[data-theme="dark"] .page-body .metric,
body[data-theme="dark"] .page-body .glass-card {background:#1b1d22!important;color:#f1f2f5!important;border-color:#4a4e57!important}
body[data-theme="dark"] .page-body input,
body[data-theme="dark"] .page-body textarea,
body[data-theme="dark"] .page-body select {background:#141519!important;color:#f3f4f6!important;border-color:#626773!important}
.escrow-live-strip{padding:22px;border:0;background:transparent;box-shadow:none}
.escrow-live-heading{padding:12px 18px;background:linear-gradient(110deg,#087fe5,#08a9b3);border-radius:14px 14px 0 0;color:#fff}
.escrow-live-heading .eyebrow,.escrow-live-heading small{color:#fff!important}
.escrow-live-heading .eyebrow i{background:#47e190!important;box-shadow:0 0 0 4px #47e19030!important}
.escrow-live-now{display:grid;grid-template-columns:1fr 1fr auto;align-items:center;gap:18px;padding:20px 26px 24px;background:linear-gradient(110deg,#087fe5,#08a9b3);border-radius:0 0 14px 14px;color:#fff;text-align:center}
.escrow-live-now article strong{display:block;color:#fff;font-size:clamp(28px,4vw,44px);line-height:1.1;letter-spacing:-.035em}
.escrow-live-now article span,.escrow-live-now>p{color:#f1fbff;font-size:13px}
.escrow-live-now>p{max-width:220px;margin:0;line-height:1.55}
.escrow-public-stats{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
.escrow-public-stats article{display:flex;min-height:160px;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:20px;border-radius:14px;color:#fff;text-align:center}
.escrow-public-stats .secured-stat{background:linear-gradient(110deg,#087c73,#08ae9b)}
.escrow-public-stats .scam-stat{background:linear-gradient(110deg,#be2222,#f26816)}
.escrow-public-stats small,.escrow-public-stats strong,.escrow-public-stats span,.escrow-public-stats p{color:#fff!important}
.escrow-public-stats small{font-size:11px;letter-spacing:.09em}
.escrow-public-stats strong{font-size:clamp(25px,3vw,38px);line-height:1.15}
.escrow-public-stats span{font-size:15px}
.escrow-public-stats p{margin:0;font-size:12px;opacity:.94}
@media(max-width:680px){.escrow-live-strip{padding:14px}.escrow-live-now{grid-template-columns:1fr 1fr;padding:18px 14px}.escrow-live-now>p{grid-column:1/-1;max-width:none}.escrow-public-stats{grid-template-columns:1fr}.escrow-live-heading{align-items:flex-start;flex-direction:column}}

/* Homepage escrow totals: match the wide blue panel and paired lower cards. */
.escrow-live-strip,
.escrow-live-strip * { box-sizing: border-box; }
.escrow-live-strip { width:100%; min-width:0; overflow:hidden; }
.escrow-live-heading { justify-content:center; padding:24px 20px 0; text-align:center; }
.escrow-live-heading .eyebrow { justify-content:center; color:#fff!important; font-size:14px; letter-spacing:.1em; }
.escrow-live-now { grid-template-columns:repeat(2,minmax(0,1fr)); align-items:center; gap:20px; padding:18px 26px 26px; text-align:center; }
.escrow-live-now article { min-width:0; }
.escrow-live-now article strong { color:#fff; font-size:clamp(30px,4vw,46px); line-height:1.12; overflow-wrap:anywhere; }
.escrow-live-now article span { display:block; margin-top:10px; color:#f1fbff; font-size:14px; letter-spacing:.06em; }
.escrow-public-stats { grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
.escrow-public-stats article { min-width:0; align-items:center; text-align:center; overflow-wrap:anywhere; }
.escrow-public-stats .secured-stat { background:linear-gradient(110deg,#117d70,#11b6a4); }
.escrow-public-stats .scam-stat { background:linear-gradient(110deg,#bf2424,#f26917); }
.escrow-public-stats small { line-height:1.5; }
.escrow-public-stats strong { max-width:100%; overflow-wrap:anywhere; }
.escrow-public-stats p { max-width:48ch; line-height:1.5; }
.scam-watch-link { display:inline-flex; margin-top:5px; padding:8px 13px; border:1px solid #ffffffa8; border-radius:7px; color:#fff!important; font-size:13px; font-weight:700; text-decoration:none; }
.scam-watch-link:hover { background:#ffffff20; }
@media(max-width:680px) {
  .escrow-live-strip { margin:0; padding:12px; }
  .escrow-live-heading { flex-direction:row; padding:22px 14px 0; }
  .escrow-live-now { grid-template-columns:minmax(0,1fr); gap:16px; padding:18px 16px 22px; }
  .escrow-live-now article strong { font-size:clamp(28px,8vw,38px); }
  .escrow-public-stats { grid-template-columns:minmax(0,1fr); gap:12px; }
  .escrow-public-stats article { min-height:150px; padding:18px; }
}
