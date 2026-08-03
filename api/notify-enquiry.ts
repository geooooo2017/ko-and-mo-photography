import type { VercelRequest, VercelResponse } from "@vercel/node";

type EnquiryPayload = {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  type?: string;
  location?: string;
  message?: string;
  estimated_total?: number | null;
  extras?: string;
};

const PHOTOGRAPHER_EMAIL =
  process.env.ENQUIRY_TO_EMAIL || "konmophotography@gmail.com";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildHtml(payload: EnquiryPayload) {
  const rows: [string, string][] = [
    ["Name", payload.name || "—"],
    ["Email", payload.email || "—"],
    ["Phone", payload.phone || "—"],
    ["Session type", payload.type || "—"],
    ["Preferred date", payload.date || "—"],
    ["Location", payload.location || "—"],
    ["Extras", payload.extras || "None"],
    [
      "Estimated total",
      payload.estimated_total != null ? `£${payload.estimated_total}` : "—",
    ],
    ["Message", payload.message || "—"],
  ];

  return `
    <div style="font-family: Georgia, serif; color: #5C4B43; line-height: 1.6;">
      <h1 style="font-weight: 400; font-size: 24px;">New Ko&amp;Mo enquiry</h1>
      <p style="color: #8a7a6e;">A new booking enquiry was submitted on the website.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e2da; width: 160px; color: #8a7a6e; vertical-align: top;">${escapeHtml(label)}</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e2da; vertical-align: top;">${escapeHtml(value)}</td>
          </tr>`,
          )
          .join("")}
      </table>
      <p style="margin-top: 24px; color: #8a7a6e; font-size: 14px;">
        View and manage this enquiry in Admin → Enquiries.
      </p>
    </div>
  `;
}

async function sendWithResend(payload: EnquiryPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const from =
    process.env.ENQUIRY_FROM_EMAIL || "Ko&Mo Photography <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [PHOTOGRAPHER_EMAIL],
      reply_to: payload.email || undefined,
      subject: `New enquiry from ${payload.name || "website visitor"} — ${payload.type || "Session"}`,
      html: buildHtml(payload),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string" ? data.message : "Resend send failed",
    );
  }
  return { provider: "resend", id: data.id as string | undefined };
}

async function sendWithFormSubmit(payload: EnquiryPayload) {
  const response = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(PHOTOGRAPHER_EMAIL)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: `New Ko&Mo enquiry from ${payload.name || "website visitor"}`,
        _template: "table",
        _replyto: payload.email || PHOTOGRAPHER_EMAIL,
        name: payload.name || "",
        email: payload.email || "",
        phone: payload.phone || "",
        session_type: payload.type || "",
        preferred_date: payload.date || "",
        location: payload.location || "",
        extras: payload.extras || "None",
        estimated_total:
          payload.estimated_total != null ? `£${payload.estimated_total}` : "",
        message: payload.message || "",
      }),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "FormSubmit send failed",
    );
  }
  return { provider: "formsubmit", data };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = (req.body || {}) as EnquiryPayload;
  if (!payload.name || !payload.email || !payload.type) {
    return res.status(400).json({ error: "Missing required enquiry fields" });
  }

  try {
    const viaResend = await sendWithResend(payload);
    if (viaResend) {
      return res.status(200).json({ ok: true, ...viaResend });
    }

    const viaFormSubmit = await sendWithFormSubmit(payload);
    return res.status(200).json({ ok: true, ...viaFormSubmit });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send enquiry email";
    console.error("notify-enquiry:", message);
    return res.status(502).json({ error: message });
  }
}
