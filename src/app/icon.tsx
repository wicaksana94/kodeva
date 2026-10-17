import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

const jakartaExtraBold = await readFile(
  join(process.cwd(), 'assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
);

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: size.width / 3,
          background:
            'linear-gradient(135deg, #615fff 0%, #6b53ff 25%, #7347ff 50%, #7a37ff 75%, #7f22fe 100%)',
          color: '#ffffff',
          fontFamily: 'Plus Jakarta Sans',
          fontSize: size.width / 2,
          fontWeight: 800,
        }}
      >
        K
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Plus Jakarta Sans',
          data: jakartaExtraBold,
          style: 'normal',
          weight: 800,
        },
      ],
    },
  );
}
