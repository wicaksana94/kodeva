import { StudioShell } from '@/components/studio/studio-shell';

export { metadata, viewport } from 'next-sanity/studio';

export default function StudioPage() {
  return <StudioShell />;
}
