import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NyaySaathi — Matter-Based Legal Action Navigator for India';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, rgba(0,0,0,0) 70%)',
          }}
        />

        {/* Top bar: Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: '#0c0a09',
              fontWeight: 'bold',
            }}
          >
            ⚖
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
              NyaySaathi
            </span>
            <span style={{ fontSize: '16px', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
              Legal Action Navigator • India
            </span>
          </div>
        </div>

        {/* Center: Title & Value Prop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '950px' }}>
          <h1
            style={{
              fontSize: '54px',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#fafaf9',
              margin: 0,
            }}
          >
            Structured Evidence. Verifiable Timelines. Decisive Legal Action.
          </h1>
          <p style={{ fontSize: '22px', color: '#a8a29e', margin: 0, lineHeight: 1.4 }}>
            Transform unstructured legal disputes into disciplined matters under Indian law. Automatic limitation checks, formal pre-litigation notices, and Advocate Case Packs.
          </p>
        </div>

        {/* Bottom bar: Trust Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            borderTop: '1px solid #292524',
            paddingTop: '24px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#fbbf24', fontSize: '18px' }}>✓</span>
            <span style={{ color: '#d6d3d1', fontSize: '16px', fontWeight: 600 }}>Urban Tenancy Deposit Recovery</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#fbbf24', fontSize: '18px' }}>✓</span>
            <span style={{ color: '#d6d3d1', fontSize: '16px', fontWeight: 600 }}>BNS / Limitation Act 1963</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#fbbf24', fontSize: '18px' }}>✓</span>
            <span style={{ color: '#d6d3d1', fontSize: '16px', fontWeight: 600 }}>Advocate Hand-off Pack</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
