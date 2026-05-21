import { useState, useEffect, useRef } from "react";

export function useInView(thresh = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: thresh }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [thresh]);

  return [ref, visible];
}
