"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Fade-up ao entrar na viewport — sem dependência nova (Framer Motion/GSAP
 * não estão instalados). O estado inicial (opacity:0, translateY) vem do
 * CSS em globals.css ([data-reveal]); aqui só adiciona ".is-visible"
 * quando o elemento cruza a viewport, uma vez, via IntersectionObserver.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.style.transitionDelay = delay ? `${delay}ms` : "";
          target.classList.add("is-visible");
          observer.unobserve(target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  );
}
