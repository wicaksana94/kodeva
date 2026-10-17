import { ImageResponse } from 'next/og';

export const alt = 'Kodeva — Software bisnis untuk UMKM Indonesia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 60%, #7c3aed 100%)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.16)',
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            K
          </div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700 }}>Kodeva</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
            Software bisnis lengkap untuk UMKM yang siap tumbuh
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: 'rgba(255,255,255,0.85)' }}>
            Kasir · HR &amp; Payroll · Add-on — diskon hingga 25%
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.7)' }}>
          kodeva.example — situs demo technical skill test
        </div>
      </div>
    ),
    { ...size },
  );
}
