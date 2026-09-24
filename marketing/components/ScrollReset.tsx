'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Opens every page at the top, including after Back and Forward. The browser's own
 * restoration would jump to the old position while the homepage is still loading its
 * sections, landing somewhere in the middle. Links to an anchor (#id) are left alone.
 */
export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
