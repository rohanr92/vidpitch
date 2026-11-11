import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Campaign from '@/lib/models/Campaign'
import mongoose from 'mongoose'

const VideoSchema = new mongoose.Schema({
  campaignId:   String,
  userId:       String,
  url:          String,
  status:       { type: String, default: 'queued' },
  outputUrl:    { type: String, default: '' },
  previewGif:   { type: String, default: '' },
  error:        { type: String, default: '' },
  prospectData: { type: Object, default: {} },
  createdAt:    { type: Date, default: Date.now },
})

const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema)

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }
    const campaigns = await Campaign.find({ userId }).sort({ createdAt: -1 })
    return NextResponse.json({ campaigns })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { userId, name, urls, videoUrl, prospectData } = await req.json()

    const campaign = await Campaign.create({
      userId,
      name,
      urls,
      videoUrl: videoUrl || '',
      totalVideos: urls.length,
      completedVideos: 0,
      status: 'queued',
    })

    // Create one Video doc per URL, with prospect data preserved
    const videos = urls.map((url: string, i: number) => ({
      campaignId: campaign._id.toString(),
      userId,
      url,
      status: 'queued',
      prospectData: prospectData?.[i] || {},
    }))

    await Video.insertMany(videos)

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}