import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Integration from '@/lib/models/Integration'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const integrations = await Integration.find({ userId, connected: true })
    const result: Record<string, boolean> = { hubspot: false, salesforce: false }
    integrations.forEach(i => { result[i.provider] = true })

    return NextResponse.json({ integrations: result })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB()
    const { userId, provider } = await req.json()
    await Integration.findOneAndUpdate({ userId, provider }, { connected: false })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}