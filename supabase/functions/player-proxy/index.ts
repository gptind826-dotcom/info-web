import { z } from 'npm:zod'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const QuerySchema = z.object({
  uid: z.string().trim().min(1).max(32),
})

const LEVEL_API = (uid: string) =>
  `https://mafuu-level-info.onrender.com/mafu-level?uid=${encodeURIComponent(uid)}&key=mafu`
const BANNER_API = (uid: string) =>
  `https://mafuuu-banner-api.onrender.com/profile?uid=${encodeURIComponent(uid)}`
const OUTFIT_API = (uid: string) =>
  `https://apioutfit.onrender.com/mafu-outfit?uid=${encodeURIComponent(uid)}&key=mafu`

const toBase64 = (bytes: Uint8Array) => {
  let binary = ''
  const chunkSize = 0x8000

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }

  return btoa(binary)
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const parsed = QuerySchema.safeParse({ uid: url.searchParams.get('uid') ?? body?.uid ?? '' })

    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400)
    }

    const { uid } = parsed.data
    const [levelRes, bannerRes, outfitRes] = await Promise.all([
      fetch(LEVEL_API(uid), { headers: { Accept: 'application/json' } }),
      fetch(BANNER_API(uid)),
      fetch(OUTFIT_API(uid)),
    ])

    if (!levelRes.ok) {
      return json({ error: `Level lookup failed (${levelRes.status})` }, 502)
    }

    const levelJson = await levelRes.json()
    if (!levelJson?.success || !levelJson?.player_info) {
      return json({ error: 'Player not found.' }, 404)
    }

    const bannerBytes = bannerRes.ok
      ? new Uint8Array(await bannerRes.arrayBuffer())
      : null
    const outfitBytes = outfitRes.ok
      ? new Uint8Array(await outfitRes.arrayBuffer())
      : null

    return json({
      level: levelJson,
      banner: bannerBytes ? `data:${bannerRes.headers.get('content-type') ?? 'image/png'};base64,${toBase64(bannerBytes)}` : null,
      outfit: outfitBytes ? `data:${outfitRes.headers.get('content-type') ?? 'image/png'};base64,${toBase64(outfitBytes)}` : null,
    })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, 500)
  }
})