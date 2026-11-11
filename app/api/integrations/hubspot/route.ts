import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const url = `https://app-na2.hubspot.com/oauth/authorize` +
    `?client_id=${process.env.HUBSPOT_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/hubspot/callback`)}` +
    `&scope=crm.objects.contacts.write+oauth+crm.objects.contacts.read` +
    `&state=${userId}`

  return NextResponse.redirect(url)
}