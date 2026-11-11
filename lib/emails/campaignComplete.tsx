export function campaignCompleteEmail({
  userName,
  campaignName,
  totalVideos,
  campaignId,
  appUrl,
}: {
  userName: string
  campaignName: string
  totalVideos: number
  campaignId: string
  appUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">

    <!-- Logo -->
    <div style="margin-bottom:40px;">
      <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
        Vid<span style="color:#00E5A0;">Pitch</span>
      </span>
    </div>

    <!-- Card -->
    <div style="background:#111;border:1px solid #1f1f1f;border-radius:16px;padding:36px;">
      <div style="font-size:40px;margin-bottom:16px;">🎉</div>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.5px;">
        Campaign complete!
      </h1>
      <p style="color:#6B7280;font-size:15px;margin:0 0 24px;line-height:1.6;">
        Hey ${userName}, your campaign <strong style="color:#fff;">"${campaignName}"</strong> has finished processing.
        All <strong style="color:#00E5A0;">${totalVideos} personalized videos</strong> are ready to send.
      </p>

      <a href="${appUrl}/campaign/${campaignId}"
        style="display:inline-block;padding:14px 28px;background:#00E5A0;color:#000;font-weight:700;font-size:15px;border-radius:10px;text-decoration:none;">
        View Campaign →
      </a>
    </div>

    <!-- Footer -->
    <p style="color:#374151;font-size:12px;text-align:center;margin-top:32px;">
      Sent by VidPitch · <a href="${appUrl}" style="color:#374151;">vidpitch.com</a>
    </p>
  </div>
</body>
</html>`
}