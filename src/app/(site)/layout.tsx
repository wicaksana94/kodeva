import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { CartHydrator } from '@/components/cart/cart-hydrator';
import { AttributionCapture } from '@/components/analytics/attribution-capture';
import { DebugEventsPanel } from '@/components/analytics/debug-events-panel';
import { ToastViewport } from '@/components/ui/toast-viewport';

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <AttributionCapture />
      <CartHydrator />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartDrawer />
      <ToastViewport />
      <DebugEventsPanel />
    </>
  );
}
