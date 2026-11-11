import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { sendEmail } from '@/lib/sendEmail'
import { campaignCompleteEmail } from '@/lib/emails/campaignComplete'

const CampaignSchema = new mongoose.Schema({
  userId: String, name: String, totalVideos: Number,
  completedVideos: Number, status: String, createdAt: Date,
})
const UserSchema = new mongoose.Schema({
  firebaseUid: String, name: String, email: String,
})
const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema)
const User = mongoose.models.User || mongoose.model('User', UserSchema)

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { campaignId, secret } = await req.json()

    // Verify worker secret
    if (secret !== (process.env.WORKER_SECRET || 'vidpitch-worker')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaign = await Campaign.findById(campaignId)
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Check all videos are done before sending
    if (campaign.completedVideos < campaign.totalVideos) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const user = await User.findOne({ firebaseUid: campaign.userId })
    if (!user?.email) return NextResponse.json({ error: 'No user email' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    await sendEmail({
      to: user.email,
      subject: `✅ "${campaign.name}" is ready — ${campaign.totalVideos} videos done`,
      html: campaignCompleteEmail({
        userName: user.name || 'there',
        campaignName: campaign.name,
        totalVideos: campaign.totalVideos,
        campaignId: campaign._id.toString(),
        appUrl,
      }),
    })

    console.log(`📧 Campaign complete email sent to ${user.email}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}