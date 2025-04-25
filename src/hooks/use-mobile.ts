
import { useEffect, useState } from "react";

/**
 * Hook to detect if the current device is a mobile device.
 * This is used by the sidebar component to adjust its behavior on mobile screens.
 * 
 * @returns {boolean} Whether the current device is a mobile device
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if the window's width is that of a mobile device
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return isMobile;
}
