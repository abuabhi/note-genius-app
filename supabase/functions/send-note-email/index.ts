import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { marked } from "https://esm.sh/marked@12.0.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configure marked: GFM, line breaks within paragraphs.
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Lightweight HTML sanitizer for email bodies.
 * Strips <script>/<style>, on* handlers, and javascript: URLs.
 * (Notes are user/AI generated so this is defence-in-depth.)
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed)\b[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"(?:[^"]*)"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'(?:[^']*)'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*"(\s*javascript:[^"]*)"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'(\s*javascript:[^']*)'/gi, "$1='#'");
}

/** Strip markdown to a readable plain-text fallback. */
function markdownToPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```\w*\n?|```/g, ""))
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, (m) => m)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripMarkdownInline(s: string): string {
  return s.replace(/[#*_`>]/g, "").replace(/\s+/g, " ").trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, message, noteTitle, contentType, content } = await req.json();

    if (!to || !noteTitle || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!to.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid recipient email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const safeTitle = stripMarkdownInline(String(noteTitle));
    const emailSubject = subject?.trim() || `${safeTitle} — ${contentType}`;

    // Render markdown -> HTML, then sanitize.
    const renderedBody = sanitizeHtml(marked.parse(String(content)) as string);

    // Optional personal message: render as markdown too (people often write *italics*).
    const renderedMessage = message
      ? sanitizeHtml(marked.parse(String(message)) as string)
      : "";

    const emailBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2933;">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;">
    <div style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <h1 style="margin:0 0 4px;font-size:24px;line-height:1.3;color:#0f766e;">${safeTitle}</h1>
      <div style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:24px;">${contentType}</div>

      ${
        renderedMessage
          ? `<div style="background:#ecfdf5;border-left:4px solid #14b8a6;border-radius:6px;padding:14px 16px;margin:0 0 24px;color:#115e59;font-size:14px;line-height:1.6;">
              <div style="font-weight:600;margin-bottom:6px;color:#0f766e;">Personal message</div>
              ${renderedMessage}
            </div>`
          : ""
      }

      <div class="note-content" style="font-size:15px;line-height:1.65;color:#1f2933;">
        ${renderedBody}
      </div>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px;" />
      <div style="font-size:12px;color:#94a3b8;text-align:center;">
        Shared from <strong style="color:#0f766e;">PrepGenie</strong> — your smart study companion.
      </div>
    </div>
  </div>
  <style>
    .note-content h1 { font-size:22px; line-height:1.3; margin:24px 0 12px; color:#0f766e; }
    .note-content h2 { font-size:19px; line-height:1.3; margin:22px 0 10px; color:#0f766e; }
    .note-content h3 { font-size:17px; line-height:1.3; margin:20px 0 8px; color:#115e59; }
    .note-content h4, .note-content h5, .note-content h6 { font-size:15px; margin:18px 0 8px; color:#115e59; }
    .note-content p { margin:0 0 14px; }
    .note-content ul, .note-content ol { margin:0 0 14px; padding-left:22px; }
    .note-content li { margin:4px 0; }
    .note-content strong { color:#0f172a; }
    .note-content em { color:#334155; }
    .note-content blockquote { border-left:4px solid #14b8a6; padding:6px 14px; margin:14px 0; background:#f0fdfa; color:#115e59; border-radius:4px; }
    .note-content code { background:#f1f5f9; padding:2px 6px; border-radius:4px; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:0.9em; }
    .note-content pre { background:#0f172a; color:#e2e8f0; padding:14px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; }
    .note-content pre code { background:transparent; color:inherit; padding:0; }
    .note-content a { color:#0d9488; text-decoration:underline; }
    .note-content hr { border:none; border-top:1px solid #e2e8f0; margin:18px 0; }
    .note-content table { border-collapse:collapse; width:100%; margin:14px 0; }
    .note-content th, .note-content td { border:1px solid #e2e8f0; padding:8px 10px; text-align:left; font-size:14px; }
    .note-content th { background:#f8fafc; }
  </style>
</body>
</html>`;

    const emailText = `${safeTitle}\n${contentType}\n\n${
      message ? `Personal message:\n${message}\n\n` : ""
    }${markdownToPlainText(String(content))}\n\n— Shared from PrepGenie`;

    const emailResponse = await resend.emails.send({
      from: "PrepGenie <noreply@prepgenie.io>",
      to: [to],
      subject: emailSubject,
      html: emailBody,
      text: emailText,
    });

    if ((emailResponse as any)?.error) {
      console.error("Resend returned error:", emailResponse);
      return new Response(
        JSON.stringify({
          error: (emailResponse as any).error?.message || "Resend rejected the email",
          details: (emailResponse as any).error,
        }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        emailData: {
          subject: emailSubject,
          recipient: to,
          status: "sent",
          timestamp: new Date().toISOString(),
          id: (emailResponse as any).data?.id,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error in send-note-email function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to send email",
        details: "Please check your email configuration and try again",
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
