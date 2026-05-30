import { ImageResponse } from 'next/og'
import { SITE_NAME, SITE_SHORT_NAME, SITE_TAGLINE } from '@/lib/site-config'

export const runtime = 'edge'
export const alt = `${SITE_SHORT_NAME} — Start, Restart, Explore`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f0f0f',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 700, color: '#ffffff', letterSpacing: '-2px' }}>
          {SITE_SHORT_NAME}
        </div>
        <div style={{ fontSize: 28, color: '#888888', marginTop: 16 }}>
          {SITE_TAGLINE}
        </div>
        <div style={{ fontSize: 20, color: '#555555', marginTop: 12, maxWidth: 700, textAlign: 'center' }}>
          Self-growth ecosystem for learning, fitness &amp; creator progression
        </div>
      </div>
    ),
    size
  )
}
