import { connectDB } from '@/lib/mongodb'
import Integration from '@/lib/models/Integration'

// ── HubSpot: find contact by website domain, log note ──
async function logToHubspot(integration: any, {
  prospectUrl, prospectName, videoUrl, watchSeconds, eventType,
}: any) {
  const token = integration.accessToken
  const domain = new URL(prospectUrl).hostname.replace('www.', '')

  const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filterGroups: [{
        filters: [{ propertyName: 'website', operator: 'CONTAINS_TOKEN', value: domain }]
      }],
      limit: 1,
    }),
  })

  const searchData = await searchRes.json()
  const contactId = searchData.results?.[0]?.id

  if (!contactId) {
    console.log(`⚠️  HubSpot: no contact found for domain ${domain}`)
    return
  }

  const noteBody = {
    properties: {
      hs_note_body: `🎬 VidPitch ${eventType === 'watched' ? 'Video Watched' : 'Video Sent'}\n\nProspect: ${prospectName || prospectUrl}\nVideo: ${videoUrl}\n${watchSeconds ? `Watch time: ${Math.floor(watchSeconds / 60)}m ${watchSeconds % 60}s` : ''}`,
      hs_timestamp: Date.now().toString(),
    },
    associations: [{
      to: { id: contactId },
      types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }]
    }],
  }

  await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(noteBody),
  })

  console.log(`✅ HubSpot: logged ${eventType} for contact ${contactId}`)
}

// ── Saleshandy: add prospect to sequence or move to hot sequence ──
async function logToSaleshandy(integration: any, {
  prospectUrl, prospectName, prospectEmail, prospectData, videoUrl, watchSeconds, eventType,
}: any) {
  const apiKey = integration.accessToken

  // Parse saved sequence step IDs
  let defaultSequenceStepId = ''
  let hotSequenceStepId = ''
  try {
    const parsed = JSON.parse(integration.portalId || '{}')
    defaultSequenceStepId = parsed.defaultSequenceStepId || ''
    hotSequenceStepId = parsed.hotSequenceStepId || ''
  } catch {}

  if (!prospectEmail) {
    console.log(`⚠️  Saleshandy: no email for prospect ${prospectUrl}`)
    return
  }

  // Choose which step to add to
  const stepId = eventType === 'watched' && hotSequenceStepId
    ? hotSequenceStepId
    : defaultSequenceStepId

  if (!stepId) {
    console.log(`⚠️  Saleshandy: no sequence step ID configured for ${eventType}`)
    return
  }

  // Build prospect fields
  const firstName = prospectName?.split(' ')?.[0] || prospectData?.['First Name'] || prospectData?.['first name'] || ''
  const lastName  = prospectName?.split(' ')?.[1] || prospectData?.['Last Name']  || prospectData?.['last name']  || ''
  const company   = prospectData?.['Company'] || prospectData?.['company'] || new URL(prospectUrl).hostname.replace('www.', '')

  const payload = {
    prospectList: [{
      fields: [
        { id: 'email',     value: prospectEmail },
        { id: 'firstName', value: firstName },
        { id: 'lastName',  value: lastName },
        { id: 'company',   value: company },
        { id: 'website',   value: prospectUrl },
      ].filter(f => f.value),
    }],
    stepId,
    verifyProspects: false,
    conflictAction: 'addMissingFields',
  }

  const res = await fetch('https://open-api.saleshandy.com/v1/prospect-sequences/import', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (res.ok) {
    console.log(`✅ Saleshandy: ${eventType === 'watched' ? 'moved to hot sequence' : 'added to sequence'} — ${prospectEmail}`)
  } else {
    console.error(`⚠️  Saleshandy API error:`, data)
  }
}

// ── Main export ──
export async function logCRMActivity({
  userId, prospectUrl, prospectName, prospectEmail, prospectData, videoUrl, watchSeconds, eventType,
}: {
  userId: string
  prospectUrl: string
  prospectName: string
  prospectEmail?: string
  prospectData?: Record<string, any>
  videoUrl: string
  watchSeconds?: number
  eventType: 'sent' | 'watched'
}) {
  try {
    await connectDB()
    const integrations = await Integration.find({ userId, connected: true })

    for (const integration of integrations) {
      try {
        if (integration.provider === 'hubspot') {
          await logToHubspot(integration, { prospectUrl, prospectName, videoUrl, watchSeconds, eventType })
        } else if (integration.provider === 'saleshandy') {
          await logToSaleshandy(integration, { prospectUrl, prospectName, prospectEmail, prospectData, videoUrl, watchSeconds, eventType })
        }
      } catch (err: any) {
        console.error(`CRM log error (${integration.provider}):`, err.message)
      }
    }
  } catch (err) {
    console.error('logCRMActivity error:', err)
  }
}