export function videoWatchedEmail({
  userName,
  prospectName,
  prospectUrl,
  watchSeconds,
  videoId,
  campaignId,
  appUrl,
}: {
  userName: string
  prospectName: string
  prospectUrl: string
  watchSeconds: number
  videoId: string
  campaignId: string
  appUrl: string
}) {
  const mins = Math.floor(watchSeconds / 60)
  const secs = watchSeconds % 60
  const watchTime = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">

    <div style="margin-bottom:40px;">
      <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
        Vid<span style="color:#00E5A0;">Pitch</span>
      </span>
    </div>

    <div style="background:#111;border:1px solid #1f1f1f;border-radius:16px;padding:36px;">
      <div style="font-size:40px;margin-bottom:16px;">👀</div>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.5px;">
        Someone watched your video!
      </h1>
      <p style="color:#6B7280;font-size:15px;margin:0 0 24px;line-height:1.6;">
        Hey ${userName}, a prospect just watched your personalized video.
      </p>

      <!-- Prospect info -->
      <div style="background:#0a0a0a;border:1px solid #1f1f1f;border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="margin-bottom:12px;">
          <span style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Prospect</span>
          <p style="color:#fff;font-size:15px;font-weight:600;margin:4px 0 0;">${prospectName || prospectUrl}</p>
        </div>
        <div style="margin-bottom:12px;">
          <span style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Website</span>
          <p style="color:#6B7280;font-size:14px;margin:4px 0 0;">${prospectUrl}</p>
        </div>
        <div>
          <span style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Watch time</span>
          <p style="color:#00E5A0;font-size:18px;font-weight:700;margin:4px 0 0;">⏱ ${watchTime}</p>
        </div>
      </div>

      <a href="${appUrl}/campaign/${campaignId}"
        style="display:inline-block;padding:14px 28px;background:#00E5A0;color:#000;font-weight:700;font-size:15px;border-radius:10px;text-decoration:none;">
        View Campaign →
      </a>
    </div>

    <p style="color:#374151;font-size:12px;text-align:center;margin-top:32px;">
      Sent by VidPitch · <a href="${appUrl}" style="color:#374151;">vidpitch.com</a>
    </p>
  </div>
</body>
</html>`
}