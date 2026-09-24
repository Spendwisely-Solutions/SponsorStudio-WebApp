// Subscribes a reader to The Backdrop on Beehiiv. The API key stays on the server:
// set BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in .env.local (and in the host's
// environment variables). The "Audience" custom field must exist in Beehiiv under
// Audience → Custom fields, or Beehiiv ignores it.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUDIENCE_LABELS = { brand: 'Brand', organizer: 'Event organiser' } as const;

export async function POST(request: Request) {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) {
    return Response.json({ error: 'Newsletter is not configured' }, { status: 503 });
  }

  let body: { email?: unknown; audience?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const audience = body.audience === 'brand' || body.audience === 'organizer' ? body.audience : null;
  if (!EMAIL_PATTERN.test(email) || !audience) {
    return Response.json({ error: 'Invalid email or audience' }, { status: 400 });
  }

  const res = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      reactivate_existing: true,
      send_welcome_email: true,
      utm_source: 'sponsorstudio.in',
      utm_medium: 'website',
      referring_site: 'https://www.sponsorstudio.in',
      custom_fields: [{ name: 'Audience', value: AUDIENCE_LABELS[audience] }],
    }),
  });

  if (!res.ok) {
    console.error('Beehiiv subscription failed:', res.status, await res.text());
    return Response.json({ error: 'Subscription failed' }, { status: 502 });
  }
  return Response.json({ ok: true });
}
