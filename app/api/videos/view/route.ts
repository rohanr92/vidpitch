import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { sendEmail } from '@/lib/sendEmail'
import { videoWatchedEmail } from '@/lib/emails/videoWatched'

const VideoSchema = new mongoose.Schema({
  campaignId: String, userId: String, url: String,
  status: String, outputUrl: String, previewGif: String,
  prospectData: Object,
  views: { type: Number, default: 0 },
  lastViewedAt: { type: Date, default: null },
  watchSeconds: { type: Number, default: 0 },
  notifiedWatch: { type: Boolean, default: false },
  createdAt: Date,
})
const UserSchema = new mongoose.Schema({
  firebaseUid: String, name: String, email: String,
})
const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema)
const User = mongoose.models.User || mongoose.model('User', UserSchema)

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Handle both JSON and beacon (plain text) requests
    let body: any = {}
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      const text = await req.text()
      try { body = JSON.parse(text) } catch {}
    }

    const { videoId, watchSeconds } = body
    if (!videoId) return NextResponse.json({ error: 'videoId required' }, { status: 400 })

    const video = await Video.findByIdAndUpdate(videoId, {
      $inc: {
        views: watchSeconds ? 0 : 1,
        watchSeconds: watchSeconds || 0,
      },
      lastViewedAt: new Date(),
    }, { new: true })

    // Send "prospect watched" email — only once per video, only if watched > 5s
    if (video && watchSeconds > 5 && !video.notifiedWatch) {
      await Video.findByIdAndUpdate(videoId, { notifiedWatch: true })

      const user = await User.findOne({ firebaseUid: video.userId })
      if (user?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const prospectName =
          video.prospectData?.['first name'] ||
          video.prospectData?.['First Name'] ||
          video.prospectData?.['name'] ||
          video.prospectData?.['Name'] || ''

        await sendEmail({
          to: user.email,
          subject: `👀 Someone watched your video — ${Math.floor(watchSeconds / 60)}m ${watchSeconds % 60}s`,
          html: videoWatchedEmail({
            userName: user.name || 'there',
            prospectName,
            prospectUrl: video.url,
            watchSeconds,
            videoId,
            campaignId: video.campaignId,
            appUrl,
          }),
        })
        console.log(`📧 Watch notification sent to ${user.email}`)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}