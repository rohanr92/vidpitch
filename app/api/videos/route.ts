import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

const VideoSchema = new mongoose.Schema({
  campaignId:   String,
  userId:       String,
  url:          String,
  status:       String,
  outputUrl:    { type: String, default: '' },
  previewGif:   { type: String, default: '' },
  error:        { type: String, default: '' },
  prospectData: { type: Object, default: {} },
  views:        { type: Number, default: 0 },
  lastViewedAt: { type: Date, default: null },
  watchSeconds: { type: Number, default: 0 },
  createdAt:    { type: Date, default: Date.now },
})
const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema)

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const videoId    = req.nextUrl.searchParams.get('videoId')
    const campaignId = req.nextUrl.searchParams.get('campaignId')

    if (videoId) {
      const video = await Video.findById(videoId)
      if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ video })
    }

    if (campaignId) {
      const videos = await Video.find({ campaignId }).sort({ createdAt: 1 })
      return NextResponse.json({ videos })
    }

    return NextResponse.json({ error: 'videoId or campaignId required' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}