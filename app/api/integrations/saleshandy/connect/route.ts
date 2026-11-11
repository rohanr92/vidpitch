import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Integration from '@/lib/models/Integration'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { userId, apiKey, defaultSequenceStepId, hotSequenceStepId } = await req.json()

    if (!userId || !apiKey) {
      return NextResponse.json({ error: 'userId and apiKey required' }, { status: 400 })
    }

    // Try both possible base URLs
    let testRes = await fetch('https://open-api.saleshandy.com/v1/sequences', {
      headers: { 'x-api-key': apiKey.trim() },
    })

    // If first URL fails, try the alternate gateway
    if (!testRes.ok) {
      console.log('First URL failed, status:', testRes.status, await testRes.text())
      testRes = await fetch('https://leo-open-api-gateway.saleshandy.com/v1/sequences', {
        headers: { 'x-api-key': apiKey.trim() },
      })
    }

    if (!testRes.ok) {
      const errorText = await testRes.text()
      console.log('Both URLs failed. Status:', testRes.status, 'Body:', errorText)
      return NextResponse.json({
        error: `Invalid API key — status ${testRes.status}: ${errorText}`
      }, { status: 400 })
    }

    await Integration.findOneAndUpdate(
      { userId, provider: 'saleshandy' },
      {
        userId,
        provider: 'saleshandy',
        accessToken: apiKey.trim(),
        connected: true,
        portalId: JSON.stringify({ defaultSequenceStepId, hotSequenceStepId }),
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Saleshandy connect error:', err)
    return NextResponse.json({ error: err.message || 'Failed to connect' }, { status: 500 })
  }
}