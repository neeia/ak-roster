import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

const USE_TEMP_PATHS = ["/data/profile", "/data/view", "/data/input"];

function useTemporaryProfileUrl(username?: string | null) {
  const router = useRouter();
  const hasAppliedFakeUrl = useRef(false);

  useEffect(() => {
    if (!username || hasAppliedFakeUrl.current) return;   
    
    const currentPath = router.asPath.split("?")[0];
    if (!USE_TEMP_PATHS.includes(currentPath)) return;

    const fakePath = `/u/${username}`;
    
    // Only apply once
    router.replace(router.asPath, fakePath, { shallow: true });
    hasAppliedFakeUrl.current = true;

    // Restore when navigating away
    const handleRouteChange = (url: string) => {
      if (!url.startsWith('/u/') && hasAppliedFakeUrl.current) {
        // Don't restore immediately - let the navigation happen naturally
        hasAppliedFakeUrl.current = false;
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [username, router, router.asPath]); // Only run when username or path changes
}

export default useTemporaryProfileUrl;