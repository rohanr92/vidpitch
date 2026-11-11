import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Integration from '@/lib/models/Integration'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const integration = await Integration.findOne({ userId, provider: 'saleshandy', connected: true })
    if (!integration) return NextResponse.json({ error: 'Not connected' }, { status: 400 })

    const res = await fetch('https://open-api.saleshandy.com/v1/sequences', {
      headers: { 'x-api-key': integration.accessToken },
    })
    const data = await res.json()

    const sequences = Array.isArray(data?.payload) ? data.payload : []

    // Steps are already inside each sequence — no separate API call needed
    const result = sequences.map((seq: any) => ({
      id: seq.id,
      title: seq.title,
      steps: (seq.steps || []).map((s: any, index: number) => ({
        id: s.id,
        number: index + 1,
        name: s.name,
      })),
    }))

    return NextResponse.json({ sequences: result })
  } catch (err) {
    console.error('Saleshandy sequences error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}