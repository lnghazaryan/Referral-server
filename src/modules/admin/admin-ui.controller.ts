import { Controller, Get, Header } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";

@ApiExcludeController()
@Controller()
export class AdminUiController {
  @Get("admin")
  @Header("content-type", "text/html; charset=utf-8")
  getUiPage() {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Referral CRM Admin</title>
    <link rel="icon" href="https://eventhub.am/favicon.ico" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --bg: #eef2f9;
        --panel: #ffffff;
        --line: #e6ebf2;
        --text: #0f172a;
        --muted: #64748b;
        --primary: #6366f1;
        --primary-hover: #4f46e5;
        --primary-soft: #eef2ff;
        --primary-ring: #c7d2fe;
        --secondary: #f1f5f9;
        --success-bg: #ecfdf3;
        --success-text: #15803d;
        --error-bg: #fef2f2;
        --error-text: #b91c1c;
        --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);
        --shadow: 0 10px 30px -12px rgba(15, 23, 42, 0.18);
        --radius: 14px;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
          Arial, sans-serif;
        background:
          radial-gradient(1200px 500px at 100% -10%, #e0e7ff 0%, transparent 55%),
          radial-gradient(1000px 500px at -10% 0%, #dbeafe 0%, transparent 45%),
          var(--bg);
        min-height: 100vh;
        color: var(--text);
        -webkit-font-smoothing: antialiased;
      }

      .container {
        max-width: 1320px;
        margin: 0 auto;
        padding: 28px 18px 48px;
      }

      .header {
        margin-bottom: 22px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .brand-mark {
        width: 46px;
        height: 46px;
        border-radius: 13px;
        background: linear-gradient(135deg, #6366f1, #0ea5e9);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        font-weight: 800;
        box-shadow: var(--shadow);
      }

      h1 {
        margin: 0;
        font-size: 24px;
        letter-spacing: -0.02em;
      }

      .sub {
        color: var(--muted);
        font-size: 13.5px;
        margin-top: 2px;
      }

      .shell {
        display: block;
      }

      .topnav, .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow-sm);
      }

      .topnav {
        display: flex;
        gap: 6px;
        padding: 8px;
        margin-bottom: 18px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        position: sticky;
        top: 12px;
        z-index: 20;
        scrollbar-width: thin;
      }

      .nav-btn {
        flex: 0 0 auto;
        white-space: nowrap;
        border: 1px solid transparent;
        border-radius: 10px;
        background: transparent;
        text-align: center;
        padding: 10px 16px;
        cursor: pointer;
        color: var(--muted);
        font-weight: 600;
        font-size: 14px;
        transition: background 0.15s ease, color 0.15s ease;
      }

      .nav-btn:hover {
        background: var(--secondary);
        color: var(--text);
      }

      .nav-btn.active {
        background: var(--primary-soft);
        color: var(--primary-hover);
      }

      .panel {
        padding: 20px;
      }

      .entity {
        display: none;
      }

      .entity.active {
        display: block;
      }

      .entity h2 {
        margin: 0 0 14px;
        font-size: 21px;
      }

      .top-actions {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 14px;
        flex-wrap: wrap;
      }

      .toolbar {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .cards {
        display: grid;
        grid-template-columns: 1fr;
        gap: 14px;
      }

      .form-modal {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 50;
        padding: 16px;
      }

      .form-modal.open {
        display: flex;
      }

      .form-dialog {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 16px;
        width: min(480px, 100%);
        max-height: 90vh;
        overflow: auto;
      }

      .form-dialog h3 {
        margin: 0 0 12px;
        font-size: 18px;
      }

      .modal-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 4px;
      }

      .btn-add {
        background: var(--primary);
        color: #fff;
      }

      .event-thumb {
        width: 48px;
        height: 48px;
        object-fit: cover;
        border-radius: 6px;
        border: 1px solid var(--line);
        display: block;
      }

      .empty-thumb {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        color: var(--muted);
        font-size: 12px;
      }

      .event-catalog-toolbar select {
        width: auto;
        min-width: 200px;
        margin: 0;
      }

      .events-subtitle {
        margin: 18px 0 10px;
        font-size: 16px;
      }

      .card {
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 12px;
        background: #fff;
      }

      .card h3 {
        margin: 0 0 10px;
        font-size: 16px;
      }

      input, button, select {
        font-size: 14px;
      }

      input, select {
        width: 100%;
        padding: 9px 10px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        margin-bottom: 8px;
      }

      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      button {
        border: 0;
        border-radius: 9px;
        padding: 9px 14px;
        cursor: pointer;
        font-weight: 600;
        transition: transform 0.05s ease, background 0.15s ease,
          box-shadow 0.15s ease, opacity 0.15s ease;
      }

      button:active { transform: translateY(1px); }
      button:disabled { opacity: 0.5; cursor: not-allowed; }

      .btn-primary {
        background: linear-gradient(135deg, var(--primary), var(--primary-hover));
        color: #fff;
        box-shadow: 0 8px 18px -8px rgba(99, 102, 241, 0.7);
      }

      .btn-primary:hover {
        box-shadow: 0 10px 22px -8px rgba(99, 102, 241, 0.85);
      }

      .btn-soft {
        background: #fff;
        color: #0f172a;
        border: 1px solid var(--line);
        box-shadow: var(--shadow-sm);
      }

      .btn-soft:hover {
        background: var(--secondary);
      }

      .btn-danger {
        background: #fee2e2;
        color: #991b1b;
      }

      .btn-danger:hover {
        background: #fecaca;
      }

      .badge {
        display: inline-block;
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.01em;
        line-height: 1.5;
      }

      .badge-green { background: #dcfce7; color: #166534; }
      .badge-red { background: #fee2e2; color: #991b1b; }
      .badge-amber { background: #fef3c7; color: #92400e; }
      .badge-blue { background: #dbeafe; color: #1e40af; }
      .badge-violet { background: #ede9fe; color: #5b21b6; }
      .badge-slate { background: #e2e8f0; color: #334155; }

      .status-row {
        margin-top: 10px;
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
      }

      .status::before {
        content: "";
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
      }

      .status.ok {
        background: var(--success-bg);
        color: var(--success-text);
      }

      .status.err {
        background: var(--error-bg);
        color: var(--error-text);
      }

      table {
        width: 100%;
        min-width: 640px;
        border-collapse: collapse;
        margin-top: 0;
        table-layout: fixed;
      }

      th, td {
        border-bottom: 1px solid var(--line);
        padding: 11px 12px;
        text-align: left;
        vertical-align: middle;
        font-size: 13px;
        word-break: break-word;
        overflow-wrap: anywhere;
      }

      th {
        background: #f8fafc;
        position: sticky;
        top: 0;
        z-index: 1;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--muted);
        font-weight: 700;
      }

      tbody tr:nth-child(even) td {
        background: #fbfcfe;
      }

      tbody tr:hover td {
        background: var(--primary-soft);
      }

      .table-wrap {
        border: 1px solid var(--line);
        border-radius: 12px;
        overflow: auto;
        max-height: 560px;
        box-shadow: var(--shadow-sm);
      }

      .small {
        font-size: 12px;
        color: var(--muted);
      }

      .hidden {
        display: none !important;
      }

      .auth-card {
        max-width: 460px;
        margin: 20px auto;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 14px;
      }

      .auth-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }

      .auth-tab {
        flex: 1;
        border: 1px solid #dbe3ee;
        border-radius: 8px;
        background: #f8fafc;
        padding: 8px;
        cursor: pointer;
      }

      .auth-tab.active {
        background: #eff6ff;
        border-color: #bfdbfe;
        color: #1e40af;
        font-weight: 600;
      }

      .auth-panel {
        display: none;
      }

      .auth-panel.active {
        display: block;
      }

      .toolbar select {
        width: auto;
        margin: 0;
        min-width: 110px;
      }

      .action-cell {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }

      .empty {
        padding: 28px 12px;
        text-align: center;
        color: var(--muted);
      }

      .search-input {
        width: 240px;
        max-width: 100%;
        margin: 0;
      }

      /* Content editor */
      .content-intro {
        background: var(--primary-soft);
        border: 1px solid var(--primary-ring);
        color: #3730a3;
        border-radius: 12px;
        padding: 12px 14px;
        font-size: 13px;
        margin-bottom: 16px;
        line-height: 1.5;
      }
      .content-lang-pills {
        display: inline-flex;
        gap: 6px;
        background: #f1f5f9;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 4px;
      }
      .lang-pill {
        border: 0;
        background: transparent;
        border-radius: 999px;
        padding: 7px 16px;
        font-weight: 600;
        color: var(--muted);
        cursor: pointer;
      }
      .lang-pill.active {
        background: #fff;
        color: var(--primary-hover);
        box-shadow: var(--shadow-sm);
      }
      .content-group {
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 18px;
        margin-bottom: 16px;
        background: #fff;
        box-shadow: var(--shadow-sm);
      }
      .content-group > h3 {
        margin: 0 0 2px;
        font-size: 15.5px;
      }
      .content-group .group-help {
        color: var(--muted);
        font-size: 12.5px;
        margin: 0 0 16px;
      }
      .content-field {
        margin-bottom: 15px;
      }
      .content-field:last-child {
        margin-bottom: 0;
      }
      .content-field label {
        display: block;
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 5px;
        color: #334155;
      }
      .content-field .field-help {
        display: block;
        font-weight: 400;
        color: var(--muted);
        font-size: 12px;
        margin-bottom: 6px;
      }
      .content-field textarea {
        width: 100%;
        padding: 9px 11px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-family: inherit;
        font-size: 13.5px;
        resize: vertical;
        margin: 0;
      }
      .content-field input {
        font-size: 13.5px;
        margin: 0;
      }
      .step-card {
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 14px;
        margin-bottom: 12px;
        background: #f8fafc;
      }
      .step-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .step-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #0ea5e9);
        color: #fff;
        font-weight: 700;
        font-size: 13px;
      }
      .step-actions {
        display: flex;
        gap: 6px;
      }
      .step-actions button {
        padding: 5px 10px;
        font-size: 12px;
        background: #fff;
        border: 1px solid var(--line);
        color: #334155;
      }
      .step-actions button:hover:not(:disabled) {
        background: var(--secondary);
      }
      .step-actions .step-remove {
        background: #fee2e2;
        color: #991b1b;
        border-color: #fecaca;
      }
      .add-step-btn {
        background: var(--primary-soft);
        color: var(--primary-hover);
        border: 1px dashed var(--primary-ring);
        width: 100%;
        padding: 11px;
      }
      .content-save-bar {
        position: sticky;
        bottom: 0;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 12px 0 2px;
        margin-top: 8px;
        background: linear-gradient(180deg, rgba(255,255,255,0), #fff 40%);
      }

      @media (max-width: 720px) {
        .container { padding: 16px 12px 36px; }
        h1 { font-size: 20px; }
        .sub { font-size: 12.5px; }
        .brand { gap: 10px; }
        .brand-mark { width: 40px; height: 40px; font-size: 19px; }
        .panel { padding: 14px; }
        .entity h2 { font-size: 18px; }
        .top-actions { flex-direction: column; align-items: stretch; }
        .top-actions .toolbar { width: 100%; }
        .top-actions .toolbar input,
        .top-actions .toolbar select,
        .top-actions .toolbar .btn-soft,
        .top-actions .toolbar .btn-primary,
        .top-actions .toolbar .btn-add,
        .search-input { flex: 1 1 auto; width: auto; }
        .event-catalog-toolbar select { min-width: 0; flex: 1; }
        .topnav { top: 8px; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header class="header">
        <div class="brand">
          <div class="brand-mark">R</div>
          <div>
            <h1>Referral CRM</h1>
            <div class="sub">Manage events, promos, referrals, referred users and admins</div>
          </div>
        </div>
        <div class="toolbar">
          <div class="small" id="sessionInfo">Not logged in</div>
          <button id="logoutBtn" class="btn-danger hidden" onclick="logout()">Logout</button>
        </div>
      </header>

      <section id="authCard" class="auth-card hidden">
        <div class="auth-tabs">
          <button class="auth-tab active" id="authTabLogin" onclick="setAuthMode('login')">Login</button>
          <button class="auth-tab" id="authTabSignup" onclick="setAuthMode('signup')">Sign up</button>
        </div>

        <div id="authPanelLogin" class="auth-panel active">
          <h3>Login</h3>
          <input id="loginUsername" placeholder="Login" />
          <input id="loginPassword" type="password" placeholder="Password" />
          <button class="btn-primary" onclick="login()">Login</button>
        </div>

        <div id="authPanelSignup" class="auth-panel">
          <h3>Create account</h3>
          <input id="signupUsername" placeholder="Login" />
          <input id="signupPassword" type="password" placeholder="Password" />
          <input id="signupPasswordConfirm" type="password" placeholder="Confirm password" />
          <button class="btn-primary" onclick="signUp()">Sign up</button>
        </div>
      </section>

      <div id="appShell" class="shell hidden">
        <nav class="topnav" id="nav"></nav>

        <main class="panel">
          <section class="entity active" data-entity="events">
            <h2>Events</h2>
            <div class="top-actions">
              <div class="toolbar">
                <button class="btn-soft" onclick="loadEventsCatalog()">Refresh from EventHub</button>
                <button class="btn-primary" id="saveEventsBtn" onclick="saveEventsCatalog()">Save selected</button>
              </div>
              <div class="toolbar event-catalog-toolbar">
                <input id="eventsCatalogSearch" class="search-input" placeholder="Search name, venue, category..." oninput="applyCatalogFilter()" />
              </div>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style="width:44px"></th>
                    <th style="width:74px">Image</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody id="eventsCatalogRows">
                  <tr><td colspan="6" class="empty">No data yet</td></tr>
                </tbody>
              </table>
            </div>
            <div class="top-actions">
              <h3 class="events-subtitle" style="margin:0;">Saved in DB</h3>
              <div class="toolbar">
                <input id="eventsSearch" class="search-input" placeholder="Search saved events..." oninput="applyFilter('events')" />
              </div>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>eventId</th>
                    <th>name</th>
                    <th>date</th>
                    <th>venue</th>
                    <th>category</th>
                  </tr>
                </thead>
                <tbody id="eventsRows">
                  <tr><td colspan="5" class="empty">No data yet</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="entity" data-entity="promos">
            <h2>Promos</h2>
            <div class="top-actions">
              <div class="toolbar">
                <button class="btn-soft" onclick="listItems('promos')">Refresh list</button>
                <button class="btn-add" onclick="openCreateForm('promos')">Add promo</button>
              </div>
              <div class="toolbar">
                <input id="promosSearch" class="search-input" placeholder="Search code, email, purpose..." oninput="applyFilter('promos')" />
                <input id="promosLookupId" placeholder="Find by promoId" style="width:150px; margin:0;" />
                <button class="btn-soft" onclick="getById('promos')">Find</button>
              </div>
            </div>
            <div class="table-wrap"><table><thead><tr><th>promoId</th><th>code</th><th>purpose</th><th>recipientEmail</th><th>recipientRole</th><th>referredEmail</th><th>isUsed</th><th>expiredAt</th><th>actions</th></tr></thead><tbody id="promosRows"><tr><td colspan="9" class="empty">No data yet</td></tr></tbody></table></div>
          </section>

          <section class="entity" data-entity="referrals">
            <h2>Referrals</h2>
            <div class="top-actions">
              <div class="toolbar">
                <button class="btn-soft" onclick="listItems('referrals')">Refresh list</button>
                <button class="btn-add" onclick="openCreateForm('referrals')">Add referral</button>
              </div>
              <div class="toolbar">
                <input id="referralsSearch" class="search-input" placeholder="Search email, phone, code..." oninput="applyFilter('referrals')" />
                <input id="referralsLookupId" placeholder="Find by referralId" style="width:150px; margin:0;" />
                <button class="btn-soft" onclick="getById('referrals')">Find</button>
              </div>
            </div>
            <div class="table-wrap"><table><thead><tr><th>referralId</th><th>email</th><th>phone</th><th>referralCode</th><th>eventId</th><th>createdAt</th></tr></thead><tbody id="referralsRows"><tr><td colspan="6" class="empty">No data yet</td></tr></tbody></table></div>
          </section>

          <section class="entity" data-entity="referred">
            <h2>Referred</h2>
            <div class="top-actions">
              <div class="toolbar">
                <button class="btn-soft" onclick="listItems('referred')">Refresh list</button>
                <button class="btn-add" onclick="openCreateForm('referred')">Add referred</button>
              </div>
              <div class="toolbar">
                <input id="referredSearch" class="search-input" placeholder="Search email, phone, code..." oninput="applyFilter('referred')" />
                <input id="referredLookupId" placeholder="Find by referredId" style="width:150px; margin:0;" />
                <button class="btn-soft" onclick="getById('referred')">Find</button>
              </div>
            </div>
            <div class="table-wrap"><table><thead><tr><th>referredId</th><th>email</th><th>phone</th><th>referralCode</th><th>eventId</th><th>referrerEmail</th><th>referrerPhone</th><th>hasPayment</th><th>buyPrice</th></tr></thead><tbody id="referredRows"><tr><td colspan="9" class="empty">No data yet</td></tr></tbody></table></div>
          </section>

          <section class="entity" data-entity="users">
            <h2>Users</h2>
            <div class="top-actions">
              <div class="toolbar">
                <button class="btn-soft" onclick="listUsers()">Refresh users</button>
                <button class="btn-add" onclick="openCreateForm('users')">Add user</button>
              </div>
              <div class="toolbar">
                <input id="usersSearch" class="search-input" placeholder="Search username, role..." oninput="applyUsersFilter()" />
              </div>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>id</th>
                    <th>username</th>
                    <th>role</th>
                    <th>actions</th>
                  </tr>
                </thead>
                <tbody id="usersRows">
                  <tr><td colspan="4" class="empty">No users loaded</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="entity" data-entity="content">
            <h2>Landing page text</h2>
            <div class="content-intro">
              This is the text your visitors see on the landing page. Pick a
              language, edit the fields, and press <b>Save changes</b> — updates
              go live immediately. Each language is edited separately.
            </div>
            <div class="top-actions">
              <div class="content-lang-pills" id="contentLangPills">
                <button type="button" class="lang-pill active" data-locale="hy" onclick="switchContentLocale('hy')">🇦🇲 Armenian</button>
                <button type="button" class="lang-pill" data-locale="ru" onclick="switchContentLocale('ru')">🇷🇺 Russian</button>
                <button type="button" class="lang-pill" data-locale="en" onclick="switchContentLocale('en')">🇬🇧 English</button>
              </div>
              <div class="toolbar">
                <input id="contentSearch" class="search-input" placeholder="Search a field..." oninput="renderContentFields()" />
                <button class="btn-soft" onclick="loadContent()">Reload</button>
              </div>
            </div>
            <div id="contentFields"><div class="empty">Loading…</div></div>
            <div class="content-save-bar">
              <button class="btn-primary" id="saveContentBtn" onclick="saveContent()">Save changes</button>
            </div>
          </section>

          <section class="entity" data-entity="settings">
            <h2>Settings</h2>
            <div class="content-intro">
              Promo rules and email sender details used when creating referral
              codes and sending notifications. API keys stay in server config
              (.env); only business settings are edited here.
            </div>
            <div class="top-actions">
              <div class="toolbar">
                <button class="btn-soft" onclick="loadSettings()">Reload</button>
              </div>
            </div>
            <div id="settingsFields"><div class="empty">Loading…</div></div>
            <div class="content-save-bar">
              <button class="btn-primary" id="saveSettingsBtn" onclick="saveSettings()">Save changes</button>
            </div>
          </section>

          <section class="status-row">
            <div id="statusBadge" class="status ok">Ready</div>
            <span id="statusText" class="small" style="margin-left:8px;"></span>
          </section>
        </main>
      </div>
    </div>

    <div id="createModal" class="form-modal" onclick="onModalBackdropClick(event)">
      <div class="form-dialog" onclick="event.stopPropagation()">
        <h3 id="createModalTitle">Add record</h3>
        <div id="createModalFields"></div>
        <div class="modal-actions">
          <button class="btn-soft" type="button" onclick="closeCreateForm()">Cancel</button>
          <button class="btn-primary" type="button" onclick="submitCreateForm()">Save</button>
        </div>
      </div>
    </div>

    <script>
      let currentUser = null;
      let activeCreateEntity = null;
      const tableCache = {};
      let usersCache = [];
      let catalogCache = [];
      const contentCache = {};
      let contentLoadedLocale = null;
      let currentContentLocale = "hy";
      let settingsCache = null;

      function matchesQuery(row, query) {
        if (!query) return true;
        const needle = query.toLowerCase();
        return Object.keys(row).some(function (key) {
          const value = row[key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().indexOf(needle) !== -1;
        });
      }

      function applyFilter(entity) {
        const input = document.getElementById(entity + "Search");
        const query = input ? input.value.trim() : "";
        const rows = (tableCache[entity] || []).filter(function (row) {
          return matchesQuery(row, query);
        });
        renderRows(entity, rows);
      }

      const entityConfig = {
        events: {
          label: "Events",
          idField: "eventId",
          path: "/admin/events",
          columns: ["eventId", "name", "date", "venue", "category"],
          createFields: [],
          readOnlyCreate: true
        },
        promos: {
          label: "Promos",
          idField: "promoId",
          path: "/admin/promos",
          columns: [
            "promoId",
            "code",
            "purpose",
            "recipientEmail",
            "recipientRole",
            "referredEmail",
            "isUsed",
            "expiredAt"
          ],
          createFields: [],
          readOnlyCreate: true,
          resend: true
        },
        referrals: {
          label: "Referrals",
          idField: "referralId",
          path: "/referrals",
          columns: [
            "referralId",
            "email",
            "phone",
            "referralCode",
            "eventId",
            "createdAt"
          ],
          createFields: [],
          readOnlyCreate: true
        },
        referred: {
          label: "Referred",
          idField: "referredId",
          path: "/referred",
          columns: [
            "referredId",
            "email",
            "phone",
            "referralCode",
            "eventId",
            "referrerEmail",
            "referrerPhone",
            "hasPayment",
            "buyPrice"
          ],
          createFields: [],
          readOnlyCreate: true
        },
        users: {
          label: "Users",
          idField: "id",
          path: "/auth/users",
          columns: ["id", "username", "role"],
          createFields: [
            { key: "username", placeholder: "login (username)" },
            { key: "password", placeholder: "password", type: "password" },
            {
              key: "role",
              type: "select",
              options: ["Guest", "Admin"]
            }
          ]
        },
        content: {
          label: "Content",
          custom: true
        },
        settings: {
          label: "Settings",
          custom: true,
          adminOnly: true
        }
      };

      function initNav() {
        const nav = document.getElementById("nav");
        const keys = Object.keys(entityConfig).filter(function (key) {
          const cfg = entityConfig[key];
          if (cfg.adminOnly && (!currentUser || currentUser.role !== "Admin")) {
            return false;
          }
          return key !== "users" || (currentUser && currentUser.role === "Admin");
        });
        nav.innerHTML = keys.map(function (key, idx) {
          const cls = idx === 0 ? "nav-btn active" : "nav-btn";
          return "<button class='" + cls + "' data-key='" + key + "' onclick='setEntity(\\"" + key + "\\")'>" + entityConfig[key].label + "</button>";
        }).join("");
      }

      function setEntity(key) {
        document.querySelectorAll(".entity").forEach(function (el) {
          el.classList.toggle("active", el.getAttribute("data-entity") === key);
        });
        document.querySelectorAll(".nav-btn").forEach(function (btn) {
          btn.classList.toggle("active", btn.getAttribute("data-key") === key);
        });
        if (key === "content" && !contentCache[currentContentLocale]) {
          loadContent();
        }
        if (key === "settings" && !settingsCache) {
          loadSettings();
        }
      }

      function setStatus(ok, text) {
        const badge = document.getElementById("statusBadge");
        const statusText = document.getElementById("statusText");
        badge.className = ok ? "status ok" : "status err";
        badge.textContent = ok ? "Success" : "Error";
        statusText.textContent = text || "";
      }

      function setAuthVisibility(isLoggedIn) {
        document.getElementById("authCard").classList.toggle("hidden", isLoggedIn);
        document.getElementById("appShell").classList.toggle("hidden", !isLoggedIn);
      }

      function applyRoleUi() {
        const isAdmin = currentUser && currentUser.role === "Admin";
        document.querySelectorAll(".btn-add").forEach(function (button) {
          if (button.getAttribute("onclick")?.includes("openCreateForm") !== true) {
            return;
          }
          const entitySection = button.closest(".entity");
          const entityKey = entitySection
            ? entitySection.getAttribute("data-entity")
            : null;
          const cfg = entityKey ? entityConfig[entityKey] : null;
          const readOnlyCreate = cfg && cfg.readOnlyCreate;
          const canCreate = isAdmin && !readOnlyCreate;
          button.classList.toggle("hidden", !!readOnlyCreate);
          button.disabled = !canCreate;
          button.title = canCreate
            ? ""
            : readOnlyCreate
              ? "Records are created by the public referral flow"
              : "Only Admin can create records";
        });
        const saveEventsBtn = document.getElementById("saveEventsBtn");
        if (saveEventsBtn) {
          saveEventsBtn.disabled = !isAdmin;
          saveEventsBtn.title = isAdmin ? "" : "Only Admin can save events";
        }
        const saveContentBtn = document.getElementById("saveContentBtn");
        if (saveContentBtn) {
          saveContentBtn.disabled = !isAdmin;
          saveContentBtn.title = isAdmin ? "" : "Only Admin can edit content";
        }
        const saveSettingsBtn = document.getElementById("saveSettingsBtn");
        if (saveSettingsBtn) {
          saveSettingsBtn.disabled = !isAdmin;
          saveSettingsBtn.title = isAdmin ? "" : "Only Admin can edit settings";
        }
        if (contentLoadedLocale) {
          renderContentFields();
        }
        if (settingsCache) {
          renderSettingsFields();
        }
        document.getElementById("sessionInfo").textContent = isAdmin
          ? "Logged in as " + currentUser.username + " (Admin)"
          : "Logged in as " + (currentUser ? currentUser.username : "-") + " (read-only)";
        document.getElementById("logoutBtn").classList.toggle("hidden", !isAdmin);
      }

      function getFieldKey(field) {
        return typeof field === "string" ? field : field.key;
      }

      function renderCreateField(entity, field) {
        const key = getFieldKey(field);
        const placeholder =
          typeof field === "string" ? field : field.placeholder || field.key;
        const type =
          typeof field === "string" ? "text" : field.type || "text";
        if (type === "select") {
          const options = field.options || [];
          return (
            "<select id='" +
            entity +
            "Field_" +
            key +
            "'>" +
            options
              .map(function (option) {
                return (
                  "<option value='" + option + "'>" + option + "</option>"
                );
              })
              .join("") +
            "</select>"
          );
        }
        return (
          "<input id='" +
          entity +
          "Field_" +
          key +
          "' type='" +
          type +
          "' placeholder='" +
          placeholder +
          "' />"
        );
      }

      function openCreateForm(entity) {
        if (!currentUser || currentUser.role !== "Admin") {
          setStatus(false, "Only Admin can create records.");
          return;
        }
        const cfg = entityConfig[entity];
        if (!cfg || !cfg.createFields.length) {
          setStatus(false, "Create form is not available.");
          return;
        }
        activeCreateEntity = entity;
        document.getElementById("createModalTitle").textContent =
          "Add " + cfg.label.toLowerCase().slice(0, -1);
        document.getElementById("createModalFields").innerHTML = cfg.createFields
          .map(function (field) {
            return renderCreateField(entity, field);
          })
          .join("");
        document.getElementById("createModal").classList.add("open");
      }

      function closeCreateForm() {
        activeCreateEntity = null;
        document.getElementById("createModal").classList.remove("open");
        document.getElementById("createModalFields").innerHTML = "";
      }

      function onModalBackdropClick(event) {
        if (event.target.id === "createModal") {
          closeCreateForm();
        }
      }

      async function submitCreateForm() {
        if (!activeCreateEntity) {
          return;
        }
        if (activeCreateEntity === "users") {
          await createUser();
          return;
        }
        await createItem(activeCreateEntity);
      }

      async function request(method, path, body) {
        const res = await fetch("/api" + path, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined
        });
        const text = await res.text();
        let data = null;
        try {
          data = JSON.parse(text);
        } catch (_e) {
          data = text;
        }
        if (!res.ok) {
          const msg = (data && data.message) ? data.message : ("HTTP " + res.status);
          throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
        }
        return data;
      }

      function renderRows(entity, data) {
        const cfg = entityConfig[entity];
        const target = document.getElementById(entity + "Rows");
        const rows = Array.isArray(data) ? data : [data];
        const colCount = cfg.columns.length + (cfg.resend ? 1 : 0);
        if (!rows.length || (rows.length === 1 && (!rows[0] || Object.keys(rows[0]).length === 0))) {
          target.innerHTML = "<tr><td colspan='" + colCount + "' class='empty'>No records found</td></tr>";
          return;
        }
        const isAdmin = currentUser && currentUser.role === "Admin";
        target.innerHTML = rows.map(function (row) {
          let cells = cfg.columns.map(function (col) {
            return "<td>" + formatCell(col, row[col]) + "</td>";
          }).join("");
          if (cfg.resend) {
            cells += "<td>" + (row.id != null
              ? "<button class='btn-soft' " + (isAdmin ? "" : "disabled ") +
                "onclick='resendPromo(" + row.id + ")'>Resend email</button>"
              : "") + "</td>";
          }
          return "<tr>" + cells + "</tr>";
        }).join("");
      }

      function badge(cls, text) {
        return "<span class='badge " + cls + "'>" + text + "</span>";
      }

      function formatCell(col, val) {
        if (col === "isUsed" || col === "hasPayment") {
          return val === true || val === "true"
            ? badge("badge-green", "Yes")
            : badge("badge-slate", "No");
        }
        if (col === "buyPrice") {
          if (val === null || val === undefined || val === "") return "";
          const num = Number(val);
          return Number.isFinite(num) ? num.toLocaleString() : String(val);
        }
        if (col === "purpose") {
          if (val === "payment_reward") return badge("badge-violet", "reward");
          if (val === "signup") return badge("badge-blue", "signup");
          return val ? badge("badge-slate", String(val)) : "";
        }
        if (col === "recipientRole") {
          if (val === "referrer") return badge("badge-violet", "referrer");
          if (val === "referred") return badge("badge-blue", "referred");
          return val ? badge("badge-slate", String(val)) : "";
        }
        if (col === "role") {
          return val === "Admin"
            ? badge("badge-violet", "Admin")
            : badge("badge-slate", String(val ?? ""));
        }
        return String(val ?? "");
      }

      async function resendPromo(id) {
        if (!currentUser || currentUser.role !== "Admin") {
          setStatus(false, "Only Admin can resend emails.");
          return;
        }
        try {
          const data = await request("POST", "/promos/" + id + "/resend");
          setStatus(true, "Email resent to " + (data && data.email ? data.email : "recipient"));
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      function parseFieldValue(field, value) {
        if (value === "") return undefined;
        const numberFields = ["promoId"];
        if (numberFields.includes(field)) return Number(value);
        return value;
      }

      function clearCreateForm(entity) {
        const cfg = entityConfig[entity];
        cfg.createFields.forEach(function (field) {
          const key = getFieldKey(field);
          const input = document.getElementById(entity + "Field_" + key);
          if (!input) return;
          if (input.tagName === "SELECT") {
            input.selectedIndex = 0;
          } else {
            input.value = "";
          }
        });
      }

      async function listItems(entity) {
        const cfg = entityConfig[entity];
        try {
          const data = await request("GET", cfg.path);
          tableCache[entity] = Array.isArray(data) ? data : data ? [data] : [];
          applyFilter(entity);
          setStatus(true, cfg.label + " loaded");
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      async function getById(entity) {
        const cfg = entityConfig[entity];
        const rawId = document.getElementById(entity + "LookupId").value.trim();
        if (!rawId) {
          setStatus(false, "Please enter " + cfg.idField);
          return;
        }
        try {
          const data = await request("GET", cfg.path + "/" + encodeURIComponent(rawId));
          renderRows(entity, [data]);
          setStatus(true, cfg.label + " record loaded");
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      async function createItem(entity) {
        if (!currentUser || currentUser.role !== "Admin") {
          setStatus(false, "Only Admin can create records.");
          return;
        }
        const cfg = entityConfig[entity];
        const payload = {};
        cfg.createFields.forEach(function (field) {
          const key = getFieldKey(field);
          const input = document.getElementById(entity + "Field_" + key);
          if (!input) return;
          const parsed = parseFieldValue(key, input.value.trim());
          if (parsed !== undefined) payload[key] = parsed;
        });
        try {
          await request("POST", cfg.path, payload);
          setStatus(true, cfg.label + " created");
          clearCreateForm(entity);
          closeCreateForm();
          await listItems(entity);
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      async function me() {
        try {
          const data = await request("GET", "/auth/me");
          currentUser = data.user;
        } catch (_e) {
          currentUser = null;
        }
      }

      function setAuthMode(mode) {
        const isLogin = mode === "login";
        document.getElementById("authTabLogin").classList.toggle("active", isLogin);
        document.getElementById("authTabSignup").classList.toggle("active", !isLogin);
        document.getElementById("authPanelLogin").classList.toggle("active", isLogin);
        document.getElementById("authPanelSignup").classList.toggle("active", !isLogin);
      }

      async function login() {
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        if (!username || !password) {
          setStatus(false, "Login and password are required.");
          return;
        }
        try {
          const data = await request("POST", "/auth/login", { username: username, password: password });
          currentUser = data.user;
          setStatus(true, "Logged in");
          initAfterAuth();
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      async function signUp() {
        const username = document.getElementById("signupUsername").value.trim();
        const password = document.getElementById("signupPassword").value;
        const passwordConfirm = document.getElementById("signupPasswordConfirm").value;
        if (!username || !password) {
          setStatus(false, "Login and password are required.");
          return;
        }
        if (password !== passwordConfirm) {
          setStatus(false, "Passwords do not match.");
          return;
        }
        try {
          const data = await request("POST", "/auth/signup", { username: username, password: password });
          currentUser = data.user;
          setStatus(true, "Account created successfully");
          initAfterAuth();
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      async function logout() {
        try {
          await request("POST", "/auth/logout");
        } catch (_e) {}
        currentUser = null;
        setAuthVisibility(false);
        document.getElementById("logoutBtn").classList.add("hidden");
        initNav();
        setStatus(true, "Logged out");
      }

      async function listUsers() {
        if (!currentUser || currentUser.role !== "Admin") {
          setStatus(false, "Users page is Admin only.");
          return;
        }
        try {
          const data = await request("GET", "/auth/users");
          usersCache = Array.isArray(data) ? data : [];
          applyUsersFilter();
          setStatus(true, "Users loaded");
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      function applyUsersFilter() {
        const input = document.getElementById("usersSearch");
        const query = input ? input.value.trim() : "";
        const rows = usersCache.filter(function (u) {
          return matchesQuery(u, query);
        });
        renderUsers(rows);
      }

      function renderUsers(data) {
        const target = document.getElementById("usersRows");
        if (!Array.isArray(data) || data.length === 0) {
          target.innerHTML = "<tr><td colspan='4' class='empty'>No users found</td></tr>";
          return;
        }
        target.innerHTML = data.map(function (u) {
          const guestSelected = u.role === "Guest" ? "selected" : "";
          const adminSelected = u.role === "Admin" ? "selected" : "";
          const isSelf = currentUser && currentUser.id === u.id;
          return "<tr>" +
            "<td>" + u.id + "</td>" +
            "<td>" + u.username + "</td>" +
            "<td>" + u.role + "</td>" +
            "<td><div class='action-cell'>" +
            "<select onchange='changeRole(" + u.id + ", this.value)'>" +
            "<option value='Guest' " + guestSelected + ">Guest</option>" +
            "<option value='Admin' " + adminSelected + ">Admin</option>" +
            "</select>" +
            (isSelf
              ? "<span class='small'>current user</span>"
              : "<button class='btn-danger' onclick='removeUser(" + u.id + ")'>Remove</button>") +
            "</div></td>" +
            "</tr>";
        }).join("");
      }

      async function changeRole(userId, role) {
        if (!currentUser || currentUser.role !== "Admin") {
          setStatus(false, "Only Admin can change roles.");
          return;
        }
        try {
          await request("PATCH", "/auth/users/" + userId + "/role", { role: role });
          setStatus(true, "Role updated");
          await listUsers();
        } catch (e) {
          setStatus(false, String(e));
          await listUsers();
        }
      }

      async function createUser() {
        if (!currentUser || currentUser.role !== "Admin") {
          setStatus(false, "Only Admin can create users.");
          return;
        }
        const username = document
          .getElementById("usersField_username")
          .value.trim();
        const password = document.getElementById("usersField_password").value;
        const role = document.getElementById("usersField_role").value;
        if (!username || !password) {
          setStatus(false, "Username and password are required.");
          return;
        }
        try {
          await request("POST", "/auth/users", {
            username: username,
            password: password,
            role: role
          });
          clearCreateForm("users");
          closeCreateForm();
          setStatus(true, "User created");
          await listUsers();
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      async function removeUser(userId) {
        if (!currentUser || currentUser.role !== "Admin") {
          setStatus(false, "Only Admin can remove users.");
          return;
        }
        if (!confirm("Remove this user?")) {
          return;
        }
        try {
          await request("DELETE", "/auth/users/" + userId);
          setStatus(true, "User removed");
          await listUsers();
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      async function loadEventsCatalog() {
        try {
          const data = await request("GET", "/admin/events/catalog");
          renderEventsCatalog(data);
          await listItems("events");
          setStatus(true, "EventHub events loaded");
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      function renderEventsCatalog(data) {
        catalogCache = Array.isArray(data) ? data : [];
        applyCatalogFilter({ skipSync: true });
      }

      // Keep selections in catalogCache so search/filter is UI-only.
      // Checkboxes that leave the DOM on filter must not lose their state.
      function syncCatalogSelectionsFromDom() {
        const byId = {};
        catalogCache.forEach(function (item) {
          byId[item.eventId] = item;
        });
        document
          .querySelectorAll('#eventsCatalogRows input[type="checkbox"]')
          .forEach(function (checkbox) {
            const eventId = checkbox.getAttribute("data-event-id");
            if (eventId && byId[eventId]) {
              byId[eventId].isSelected = checkbox.checked;
            }
          });
      }

      function setCatalogSelection(eventId, isSelected) {
        const item = catalogCache.find(function (row) {
          return row.eventId === eventId;
        });
        if (item) {
          item.isSelected = isSelected;
        }
      }

      function applyCatalogFilter(options) {
        if (!options || !options.skipSync) {
          syncCatalogSelectionsFromDom();
        }
        const input = document.getElementById("eventsCatalogSearch");
        const query = input ? input.value.trim() : "";
        const rows = catalogCache.filter(function (item) {
          return matchesQuery(item, query);
        });
        renderCatalogRows(rows);
      }

      function renderCatalogRows(data) {
        const target = document.getElementById("eventsCatalogRows");
        if (!Array.isArray(data) || data.length === 0) {
          target.innerHTML =
            "<tr><td colspan='6' class='empty'>No events found</td></tr>";
          return;
        }
        target.innerHTML = data
          .map(function (item) {
            const checked = item.isSelected ? "checked" : "";
            const imageCell = item.imageUrl
              ? '<img class="event-thumb" src="' + item.imageUrl + '" alt="" />'
              : '<div class="event-thumb empty-thumb">-</div>';
            return (
              "<tr>" +
              '<td><input type="checkbox" data-event-id="' +
              item.eventId +
              '" ' +
              checked +
              " /></td>" +
              "<td>" +
              imageCell +
              "</td>" +
              "<td>" +
              (item.eventName || "") +
              "</td>" +
              "<td>" +
              (item.eventDateTime || "") +
              "</td>" +
              "<td>" +
              (item.venue || "") +
              "</td>" +
              "<td>" +
              (item.eventCategory || "") +
              "</td>" +
              "</tr>"
            );
          })
          .join("");
      }

      function onCatalogCheckboxChange(event) {
        const checkbox = event.target;
        if (
          !checkbox ||
          checkbox.type !== "checkbox" ||
          !checkbox.getAttribute("data-event-id")
        ) {
          return;
        }
        setCatalogSelection(
          checkbox.getAttribute("data-event-id"),
          checkbox.checked
        );
      }

      async function saveEventsCatalog() {
        if (!currentUser || currentUser.role !== "Admin") {
          setStatus(false, "Only Admin can save events.");
          return;
        }
        syncCatalogSelectionsFromDom();
        const selectedEventIds = catalogCache
          .filter(function (item) {
            return item.isSelected;
          })
          .map(function (item) {
            return item.eventId;
          });
        try {
          await request("POST", "/admin/events/sync", {
            selectedEventIds: selectedEventIds
          });
          setStatus(true, "Events saved");
          await loadEventsCatalog();
          await listItems("events");
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      // Human-friendly editor layout. Each field maps a technical key to a
      // clear label + hint so PMs never see raw keys like "hero.title".
      const CONTENT_SCHEMA = [
        {
          group: "General",
          help: "Basic page information.",
          fields: [
            { key: "meta.title", label: "Browser tab title", help: "Text shown on the browser tab and in search results." }
          ]
        },
        {
          group: "Header menu",
          help: "The links in the top navigation bar.",
          fields: [
            { key: "nav.events", label: "\\"Events\\" menu link" },
            { key: "nav.how", label: "\\"How it works\\" menu link" },
            { key: "nav.buy", label: "Buy button" }
          ]
        },
        {
          group: "Hero — top section",
          help: "The big first screen with the sign-up form.",
          fields: [
            { key: "hero.badge", label: "Small label above the title" },
            { key: "hero.title", label: "Main headline", multiline: true },
            { key: "hero.subtitle", label: "Subtitle under the headline", multiline: true },
            { key: "hero.emailPlaceholder", label: "Email input placeholder" },
            { key: "hero.cta", label: "Submit button" },
            { key: "hero.note", label: "Note under the promo code (after submit)", multiline: true },
            { key: "hero.sending", label: "Button text while submitting" },
            { key: "hero.refMissing", label: "Error when the invite link is missing", multiline: true }
          ]
        },
        {
          group: "Promo result",
          help: "Shown after a visitor receives their promo code.",
          fields: [
            { key: "result.label", label: "Text before the code" },
            { key: "result.copied", label: "\\"Copied!\\" confirmation" },
            { key: "result.browse", label: "Browse events button" }
          ]
        },
        {
          group: "Terms and conditions",
          help: "Loyalty terms page linked from the footer. Body text supports blank lines between paragraphs.",
          fields: [
            { key: "terms.meta.title", label: "Browser tab title for terms page" },
            { key: "terms.title", label: "Page headline" },
            { key: "terms.body", label: "Page body", multiline: true, help: "Separate paragraphs with a blank line." },
            { key: "terms.cta", label: "Button to Eventhub terms" }
          ]
        },
        {
          group: "Promo events page (/events?PROMO=…)",
          help: "Shown when someone opens the promo landing from email (no sign-up form, promo from URL).",
          fields: [
            { key: "promoPage.meta.title", label: "Browser tab title" },
            { key: "promoPage.hero.badge", label: "Small label above the title" },
            { key: "promoPage.hero.title", label: "Main headline", multiline: true },
            {
              key: "promoPage.hero.subtitle",
              label: "Subtitle under the headline",
              multiline: true
            },
            { key: "promoPage.result.label", label: "Text before the promo code" },
            { key: "promoPage.hero.note", label: "Note under the promo code", multiline: true },
            { key: "promoPage.result.browse", label: "Browse events button" },
            {
              key: "promoPage.missing",
              label: "Message when PROMO is missing from the URL",
              multiline: true
            }
          ]
        },
        {
          group: "How it works",
          help: "Steps that explain the flow. Add, remove or reorder as many as you like.",
          steps: true,
          fields: [{ key: "how.title", label: "Section title" }]
        },
        {
          group: "Events section",
          help: "The list of events below the steps.",
          fields: [
            { key: "events.title", label: "Section title" },
            { key: "events.subtitle", label: "Section subtitle", multiline: true },
            { key: "events.loading", label: "\\"Loading…\\" text" },
            { key: "events.empty", label: "Text shown when there are no events" },
            { key: "events.buy", label: "Ticket button on each card" }
          ]
        },
        {
          group: "Footer",
          help: "The bottom of the page.",
          fields: [
            { key: "footer.disclaimer1", label: "Disclaimer paragraph 1", multiline: true },
            { key: "footer.disclaimer2", label: "Disclaimer paragraph 2", multiline: true },
            { key: "footer.follow", label: "\\"Follow\\" column title" },
            { key: "footer.discover", label: "\\"Discover more\\" column title" },
            { key: "footer.terms", label: "\\"Terms and conditions\\" link" },
            { key: "footer.rights", label: "Copyright line" }
          ]
        },
        {
          group: "Error messages",
          help: "Shown on the landing sign-up form. Backend returns error codes (e.g. REFERRED_EMAIL_EXISTS) that map to these fields.",
          fields: [
            { key: "error.generic", label: "Generic error", multiline: true },
            { key: "error.email", label: "Invalid email error", multiline: true },
            { key: "error.emailExists", label: "Email already registered", multiline: true },
            { key: "error.refNotFound", label: "Invalid / missing invite link", multiline: true },
            { key: "error.selfReferral", label: "Using own invite link", multiline: true }
          ]
        }
      ];

      function cText(value) {
        return String(value == null ? "" : value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }

      function cAttr(value) {
        return cText(value).replace(/"/g, "&quot;");
      }

      function switchContentLocale(locale) {
        currentContentLocale = locale;
        document
          .querySelectorAll("#contentLangPills .lang-pill")
          .forEach(function (pill) {
            pill.classList.toggle(
              "active",
              pill.getAttribute("data-locale") === locale
            );
          });
        const searchEl = document.getElementById("contentSearch");
        if (searchEl) searchEl.value = "";
        if (contentCache[locale]) {
          renderContentFields();
        } else {
          loadContent();
        }
      }

      async function loadContent() {
        const locale = currentContentLocale;
        try {
          const data = await request("GET", "/admin/content/" + locale);
          contentCache[locale] = (data && data.content) || {};
          contentLoadedLocale = locale;
          renderContentFields();
          setStatus(true, "Content loaded (" + locale.toUpperCase() + ")");
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      function contentFieldHtml(meta, val, isAdmin) {
        const disabled = isAdmin ? "" : "disabled ";
        const help = meta.help
          ? "<span class='field-help'>" + cText(meta.help) + "</span>"
          : "";
        const control = meta.multiline
          ? "<textarea data-content-key='" +
            cAttr(meta.key) +
            "' rows='3' " +
            disabled +
            ">" +
            cText(val) +
            "</textarea>"
          : "<input data-content-key='" +
            cAttr(meta.key) +
            "' " +
            disabled +
            "value='" +
            cAttr(val) +
            "' />";
        return (
          "<div class='content-field'><label>" +
          cText(meta.label) +
          "</label>" +
          help +
          control +
          "</div>"
        );
      }

      function renderStepsEditor(steps) {
        const host = document.getElementById("stepsEditor");
        if (!host) return;
        const isAdmin = currentUser && currentUser.role === "Admin";
        const disabled = isAdmin ? "" : "disabled ";
        const cards = steps
          .map(function (step, i) {
            return (
              "<div class='step-card'>" +
              "<div class='step-card-head'>" +
              "<span class='step-badge'>" +
              (i + 1) +
              "</span>" +
              "<div class='step-actions'>" +
              "<button type='button' " +
              disabled +
              "onclick='moveStep(" +
              i +
              ",-1)'>&uarr;</button>" +
              "<button type='button' " +
              disabled +
              "onclick='moveStep(" +
              i +
              ",1)'>&darr;</button>" +
              "<button type='button' class='step-remove' " +
              disabled +
              "onclick='removeStep(" +
              i +
              ")'>Remove</button>" +
              "</div></div>" +
              "<div class='content-field'><label>Title</label>" +
              "<input data-step-index='" +
              i +
              "' data-step-field='title' " +
              disabled +
              "value='" +
              cAttr(step.title) +
              "' /></div>" +
              "<div class='content-field'><label>Description</label>" +
              "<textarea data-step-index='" +
              i +
              "' data-step-field='desc' rows='2' " +
              disabled +
              ">" +
              cText(step.desc) +
              "</textarea></div>" +
              "</div>"
            );
          })
          .join("");
        const addBtn = isAdmin
          ? "<button type='button' class='add-step-btn' onclick='addStep()'>+ Add step</button>"
          : "";
        host.innerHTML =
          cards +
          (steps.length ? "" : "<div class='small' style='margin-bottom:10px;'>No steps yet.</div>") +
          addBtn;
      }

      function collectSteps() {
        const host = document.getElementById("stepsEditor");
        if (!host) return null;
        const map = {};
        host.querySelectorAll("[data-step-field]").forEach(function (el) {
          const idx = el.getAttribute("data-step-index");
          const field = el.getAttribute("data-step-field");
          if (!map[idx]) map[idx] = { title: "", desc: "" };
          map[idx][field] = el.value;
        });
        return Object.keys(map)
          .sort(function (a, b) {
            return Number(a) - Number(b);
          })
          .map(function (k) {
            return map[k];
          });
      }

      function addStep() {
        const steps = collectSteps() || [];
        steps.push({ title: "", desc: "" });
        renderStepsEditor(steps);
      }

      function removeStep(i) {
        const steps = collectSteps() || [];
        steps.splice(i, 1);
        renderStepsEditor(steps);
      }

      function moveStep(i, dir) {
        const steps = collectSteps() || [];
        const j = i + dir;
        if (j < 0 || j >= steps.length) return;
        const tmp = steps[i];
        steps[i] = steps[j];
        steps[j] = tmp;
        renderStepsEditor(steps);
      }

      function renderContentFields() {
        const content = contentCache[currentContentLocale] || {};
        const target = document.getElementById("contentFields");
        const isAdmin = currentUser && currentUser.role === "Admin";
        const searchEl = document.getElementById("contentSearch");
        const search = searchEl ? searchEl.value.trim().toLowerCase() : "";

        if (search) {
          const matches = [];
          CONTENT_SCHEMA.forEach(function (group) {
            (group.fields || []).forEach(function (meta) {
              const val = content[meta.key] == null ? "" : String(content[meta.key]);
              if (
                meta.key.toLowerCase().indexOf(search) !== -1 ||
                (meta.label || "").toLowerCase().indexOf(search) !== -1 ||
                val.toLowerCase().indexOf(search) !== -1
              ) {
                matches.push(contentFieldHtml(meta, val, isAdmin));
              }
            });
          });
          target.innerHTML = matches.length
            ? "<div class='content-group'>" + matches.join("") + "</div>"
            : "<div class='empty'>No fields match your search.</div>";
          return;
        }

        target.innerHTML = CONTENT_SCHEMA.map(function (group) {
          let inner = (group.fields || [])
            .map(function (meta) {
              const val = content[meta.key] == null ? "" : String(content[meta.key]);
              return contentFieldHtml(meta, val, isAdmin);
            })
            .join("");
          if (group.steps) {
            inner +=
              "<div class='content-field'><label>Steps</label></div><div id='stepsEditor'></div>";
          }
          return (
            "<div class='content-group'><h3>" +
            cText(group.group) +
            "</h3>" +
            (group.help
              ? "<p class='group-help'>" + cText(group.help) + "</p>"
              : "") +
            inner +
            "</div>"
          );
        }).join("");

        const rawSteps = content["how.steps"];
        const steps = Array.isArray(rawSteps)
          ? rawSteps.map(function (s) {
              return { title: (s && s.title) || "", desc: (s && s.desc) || "" };
            })
          : [];
        renderStepsEditor(steps);
      }

      async function saveContent() {
        if (!currentUser || currentUser.role !== "Admin") {
          setStatus(false, "Only Admin can edit content.");
          return;
        }
        const locale = currentContentLocale;
        // Start from the full cached set so keys not shown in the form are kept.
        const payload = Object.assign({}, contentCache[locale] || {});
        // Drop legacy per-step keys; steps are managed as a list now.
        Object.keys(payload).forEach(function (key) {
          if (/^how\\.step\\d+\\./.test(key)) delete payload[key];
        });
        document
          .querySelectorAll("#contentFields [data-content-key]")
          .forEach(function (el) {
            payload[el.getAttribute("data-content-key")] = el.value;
          });
        const steps = collectSteps();
        if (steps) {
          payload["how.steps"] = steps;
        }
        try {
          const data = await request("PUT", "/admin/content/" + locale, {
            content: payload
          });
          contentCache[locale] = (data && data.content) || payload;
          renderContentFields();
          setStatus(true, "Saved — " + locale.toUpperCase() + " content is live");
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      const SETTINGS_SCHEMA = [
        {
          group: "Promo settings",
          help: "Used when creating referral promo codes via EventHub Organizer Promo API.",
          fields: [
            {
              key: "promo.discountType",
              label: "Discount type",
              help: "e.g. Percent or Fixed — mapped to Promo API unit."
            },
            {
              key: "promo.discountValue",
              label: "Discount value",
              help: "Sent as discount in Promo API.",
              type: "number"
            },
            {
              key: "promo.maxCount",
              label: "Max uses per code",
              help: "Sent as count in Promo API.",
              type: "number"
            },
            {
              key: "promo.validityDays",
              label: "Validity (days)",
              help: "How long each generated promo code stays valid.",
              type: "number"
            }
          ]
        },
        {
          group: "Mailing settings",
          help: "Sender identity for referral and promo notification emails.",
          fields: [
            {
              key: "mailing.from",
              label: "From address",
              help: "Must be allowed by your email provider."
            },
            {
              key: "mailing.bcc",
              label: "BCC address",
              help: "Optional copy to admin inbox."
            },
            {
              key: "mailing.displayName",
              label: "Display name",
              help: "Shown as the sender name in the inbox."
            }
          ]
        }
      ];

      function settingsNestedGet(obj, path) {
        return path.split(".").reduce(function (acc, part) {
          return acc && acc[part] != null ? acc[part] : "";
        }, obj);
      }

      function settingsFieldHtml(meta, val, isAdmin) {
        const disabled = isAdmin ? "" : "disabled ";
        const help = meta.help
          ? "<span class='field-help'>" + cText(meta.help) + "</span>"
          : "";
        const inputType = meta.type === "number" ? "number" : "text";
        const control =
          "<input data-settings-key='" +
          cAttr(meta.key) +
          "' type='" +
          inputType +
          "' " +
          disabled +
          "value='" +
          cAttr(val) +
          "' />";
        return (
          "<div class='content-field'><label>" +
          cText(meta.label) +
          "</label>" +
          help +
          control +
          "</div>"
        );
      }

      function renderSettingsFields() {
        const settings = settingsCache || { promo: {}, mailing: {} };
        const target = document.getElementById("settingsFields");
        const isAdmin = currentUser && currentUser.role === "Admin";
        target.innerHTML = SETTINGS_SCHEMA.map(function (group) {
          const inner = (group.fields || [])
            .map(function (meta) {
              const val = settingsNestedGet(settings, meta.key);
              return settingsFieldHtml(meta, val, isAdmin);
            })
            .join("");
          return (
            "<div class='content-group'><h3>" +
            cText(group.group) +
            "</h3>" +
            (group.help
              ? "<p class='group-help'>" + cText(group.help) + "</p>"
              : "") +
            inner +
            "</div>"
          );
        }).join("");
      }

      async function loadSettings() {
        try {
          const data = await request("GET", "/admin/settings");
          settingsCache = data || { promo: {}, mailing: {} };
          renderSettingsFields();
          setStatus(true, "Settings loaded");
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      async function saveSettings() {
        if (!currentUser || currentUser.role !== "Admin") {
          setStatus(false, "Only Admin can edit settings.");
          return;
        }
        const promo = Object.assign({}, (settingsCache && settingsCache.promo) || {});
        const mailing = Object.assign(
          {},
          (settingsCache && settingsCache.mailing) || {}
        );
        document
          .querySelectorAll("#settingsFields [data-settings-key]")
          .forEach(function (el) {
            const key = el.getAttribute("data-settings-key");
            const raw = el.value;
            if (key.indexOf("promo.") === 0) {
              const field = key.slice("promo.".length);
              promo[field] =
                el.type === "number" ? Number(raw) : raw;
            } else if (key.indexOf("mailing.") === 0) {
              const field = key.slice("mailing.".length);
              mailing[field] = raw;
            }
          });
        try {
          const data = await request("PUT", "/admin/settings", {
            promo: promo,
            mailing: mailing
          });
          settingsCache = data || { promo: promo, mailing: mailing };
          renderSettingsFields();
          setStatus(true, "Settings saved");
        } catch (e) {
          setStatus(false, String(e));
        }
      }

      async function initAfterAuth() {
        setAuthVisibility(!!currentUser);
        initNav();
        applyRoleUi();
        if (!currentUser) {
          return;
        }
        await loadEventsCatalog();
        listItems("events");
        listItems("promos");
        listItems("referrals");
        listItems("referred");
        if (currentUser.role === "Admin") {
          listUsers();
        }
      }

      (function bindCatalogSelectionHandlers() {
        const catalogRows = document.getElementById("eventsCatalogRows");
        if (catalogRows) {
          catalogRows.addEventListener("change", onCatalogCheckboxChange);
        }
      })();

      (async function bootstrap() {
        await me();
        await initAfterAuth();
      })();
    </script>
  </body>
</html>`;
  }
}
