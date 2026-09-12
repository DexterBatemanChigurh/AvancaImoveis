"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

import { publicUrl } from "@/lib/storage/url";

type Photo = { id: string; storageKey: string; thumbKey: string | null; alt: string | null };

export function PropertyGallery({ title, photos }: { title: string; photos: Photo[] }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const hasMultiple = photos.length > 1;

  function go(dir: -1 | 1) {
    setActive((i) => (i + dir + photos.length) % photos.length);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && lightboxOpen) setLightboxOpen(false);
      if (!hasMultiple) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, lightboxOpen]);

  // Trava o scroll da página por trás enquanto a foto em tela cheia está aberta.
  useEffect(() => {
    if (!lightboxOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lightboxOpen]);

  if (photos.length === 0) return null;
  const current = photos[active]!;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-brand bg-surface-2 sm:aspect-[16/9]"
        onClick={() => setLightboxOpen(true)}
        onTouchStart={(e: TouchEvent) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e: TouchEvent) => {
          if (touchStartX.current == null) return;
          const delta = e.changedTouches[0]!.clientX - touchStartX.current;
          if (Math.abs(delta) > 50) go(delta > 0 ? -1 : 1);
          touchStartX.current = null;
        }}
      >
        <Image
          key={current.storageKey}
          src={publicUrl(current.storageKey)}
          alt={current.alt ?? `${title} — foto ${active + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
          priority={active === 0}
        />

        <span className="pointer-events-none absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-bg/85 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100">
          <Expand className="h-4 w-4" />
        </span>

        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/85 shadow-sm backdrop-blur transition-transform hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/85 shadow-sm backdrop-blur transition-transform hover:scale-105"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-medium text-bg backdrop-blur">
              {active + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              aria-label={`Ver foto ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition-opacity ${
                i === active ? "ring-ink" : "opacity-70 ring-transparent hover:opacity-100"
              }`}
            >
              <Image
                src={publicUrl(photo.thumbKey ?? photo.storageKey)}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — foto em tela cheia`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative h-[85vh] w-[92vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={current.storageKey}
              src={publicUrl(current.storageKey)}
              alt={current.alt ?? `${title} — foto ${active + 1}`}
              fill
              sizes="92vw"
              className="object-contain"
            />
          </div>

          {hasMultiple && (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Próxima foto"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                {active + 1} / {photos.length}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
