import { useEffect, useState } from "react";
import { analytics } from "@/app/lib/analytics";

export default function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      analytics.track('network_status_change', { status: 'online' });
    };
    const handleOffline = () => {
      setIsOnline(false);
      analytics.track('network_status_change', { status: 'offline' });
    };

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
