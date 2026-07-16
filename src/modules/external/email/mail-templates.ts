import type { MailKind } from "./mail.types";

type TemplateInput = {
  promoCode: string;
  referralCode: string;
};

function layout(title: string, content: string): string {
  return `<!doctype html>
<html lang="hy">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;background:#1a63f5;color:#ffffff;">
                <div style="font-size:22px;font-weight:700;">Eventhub</div>
                <div style="font-size:14px;opacity:0.9;margin-top:4px;">${title}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
                Այս նամակն ուղարկվել է Eventhub-ի կողմից։ Եթե այս նամակը ձեզ ծանոթ չէ, կարող եք անտեսել այն։
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function promoBlock(promoCode: string): string {
  return `<div style="margin:20px 0;padding:16px 20px;border:1px dashed #1a63f5;border-radius:10px;background:#eaf1ff;text-align:center;">
    <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0f4cd2;margin-bottom:8px;">Պրոմո կոդ</div>
    <div style="font-size:28px;font-weight:700;letter-spacing:0.12em;color:#0f4cd2;">${promoCode}</div>
  </div>`;
}

export function buildMailSubject(kind: MailKind): string {
  if (kind === "signup_promo") {
    return "Ձեր Eventhub պրոմո կոդը";
  }

  return "Ձեր Eventhub ռեֆերալ պարգևը";
}

export function buildMailHtml(kind: MailKind, input: TemplateInput): string {
  if (kind === "signup_promo") {
    return layout(
      "Ձեր պրոմո կոդը",
      `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
          Շնորհակալություն ռեֆերալ հղումով միանալու համար։
        </p>
        <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
          Օգտագործեք ստորև բերված պրոմո կոդը ձեր հաջորդ Eventhub գնման ժամանակ։
        </p>
        ${promoBlock(input.promoCode)}
        <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">
          Ռեֆերալ կոդ՝ <strong>${input.referralCode}</strong>
        </p>`
    );
  }

  return layout(
    "Ռեֆերալ պարգև",
    `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
        Հիանալի նորություն՝ ձեր հրավիրած օգտատերը կատարել է վճարում։
      </p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
        Ահա ձեր պարգևի պրոմո կոդը՝
      </p>
      ${promoBlock(input.promoCode)}
      <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">
        Ձեր ռեֆերալ կոդը՝ <strong>${input.referralCode}</strong>
      </p>`
  );
}
