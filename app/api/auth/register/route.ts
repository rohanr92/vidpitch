import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { firebaseUid, email, name } = await req.json()
    const existing = await User.findOne({ firebaseUid })
    if (existing) return NextResponse.json({ user: existing })
    const user = await User.create({ firebaseUid, email, name })
    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}