import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

const SettingsSchema = new mongoose.Schema({
  userId:       { type: String, required: true, unique: true },
  displayName:  { type: String, default: '' },
  calendlyUrl:  { type: String, default: '' },
  updatedAt:    { type: Date, default: Date.now },
})
const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema)

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    const settings = await Settings.findOne({ userId })
    return NextResponse.json({ settings })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { userId, displayName, calendlyUrl } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    const settings = await Settings.findOneAndUpdate(
      { userId },
      { displayName, calendlyUrl, updatedAt: new Date() },
      { upsert: true, new: true }
    )
    return NextResponse.json({ settings })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}