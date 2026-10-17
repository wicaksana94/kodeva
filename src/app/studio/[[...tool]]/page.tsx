import { StudioSetupNotice } from '@/components/studio/studio-setup-notice';
import { StudioShell } from '@/components/studio/studio-shell';
import { isSanityConfigured } from '@/sanity/env';

export { metadata, viewport } from 'next-sanity/studio';

export default function StudioPage() {
  if (!isSanityConfigured) {
    return <StudioSetupNotice />;
  }

  return <StudioShell />;
}
