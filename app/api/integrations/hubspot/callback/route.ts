import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Integration from '@/lib/models/Integration'

export async function GET(req: NextRequest) {
  const code   = req.nextUrl.searchParams.get('code')
  const userId = req.nextUrl.searchParams.get('state')

  if (!code || !userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=hubspot_failed`)
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        client_id:     process.env.HUBSPOT_CLIENT_ID!,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
        redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/hubspot/callback`,
        code,
      }),
    })

    const tokens = await tokenRes.json()
    if (!tokens.access_token) throw new Error('No access token')

    // Get portal ID
    const infoRes = await fetch('https://api.hubapi.com/oauth/v1/access-tokens/' + tokens.access_token)
    const info = await infoRes.json()

    await connectDB()
    await Integration.findOneAndUpdate(
      { userId, provider: 'hubspot' },
      {
        userId,
        provider:     'hubspot',
        accessToken:  tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt:    new Date(Date.now() + tokens.expires_in * 1000),
        portalId:     String(info.hub_id || ''),
        connected:    true,
      },
      { upsert: true, new: true }
    )

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?connected=hubspot`
    )
  } catch (err) {
    console.error('HubSpot OAuth error:', err)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=hubspot_failed`
    )
  }
}