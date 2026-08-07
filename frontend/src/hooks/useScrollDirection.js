import { useState, useEffect, useRef } from "react";

function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const threshold = 10; // tránh header nhấp nháy khi cuộn nhẹ

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Luôn hiện header khi ở gần đầu trang
      if (currentScrollY < 80) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (Math.abs(currentScrollY - lastScrollY.current) < threshold) {
        return;
      }

      if (currentScrollY > lastScrollY.current) {
        // Cuộn xuống -> ẩn
        setIsVisible(false);
      } else {
        // Cuộn lên -> hiện
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isVisible;
}

export default useScrollDirection;