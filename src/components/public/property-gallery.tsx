"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { publicUrl } from "@/lib/storage/url";

type Photo = { id: string; storageKey: string; thumbKey: string | null; alt: string | null };

/**
 * Faixa horizontal com as fotos lado a lado (não mais 1 foto grande + tira
 * de miniaturas embaixo) — cerca de metade da altura de antes, pra ocupar
 * menos espaço na página. Clicar numa foto abre ela em tela cheia
 * (lightbox), que é onde a navegação por setas/teclado/toque continua.
 */
export function PropertyGallery({ title, photos }: { title: string; photos: Photo[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hasMultiple = photos.length > 1;

  function scrollStrip(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  function go(dir: -1 | 1) {
    setLightboxIndex((i) => (i == null ? i : (i + dir + photos.length) % photos.length));
  }

  useEffect(() => {
    if (lightboxIndex == null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex]);

  // Trava o scroll da página por trás enquanto a foto em tela cheia está
  // aberta — precisa travar tanto <html> quanto <body> porque, dependendo
  // do navegador/CSS, qualquer um dos dois pode ser o elemento que rola de
  // verdade; travar só um deixa o outro ainda deslizando por baixo.
  useEffect(() => {
    if (lightboxIndex == null) return;
    const html = document.documentElement;
    const body = document.body;
    const previousHtml = html.style.overflow;
    const previousBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtml;
      body.style.overflow = previousBody;
    };
  }, [lightboxIndex]);

  if (photos.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            aria-label={`Ampliar foto ${i + 1}`}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-[4/3] h-[391px] shrink-0 cursor-zoom-in overflow-hidden bg-surface-2 sm:h-[548px]"
            style={{ scrollSnapAlign: "start" }}
          >
            <Image
              src={publicUrl(photo.thumbKey ?? photo.storageKey)}
              alt={photo.alt ?? `${title} — foto ${i + 1}`}
              fill
              sizes="(max-width: 640px) 45vw, 320px"
              className="object-cover"
              priority={i === 0}
            />
          </button>
        ))}
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Rolar fotos pra esquerda"
            onClick={() => scrollStrip(-1)}
            className="absolute left-3 top-1/2 hidden h-[45px] w-[45px] -translate-y-1/2 place-items-center rounded-full border border-line bg-bg shadow-sm transition-transform hover:scale-105 sm:grid"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Rolar fotos pra direita"
            onClick={() => scrollStrip(1)}
            className="absolute right-3 top-1/2 hidden h-[45px] w-[45px] -translate-y-1/2 place-items-center rounded-full border border-line bg-bg shadow-sm transition-transform hover:scale-105 sm:grid"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {lightboxIndex != null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — foto em tela cheia`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative h-[96vh] w-[98vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              key={photos[lightboxIndex]!.storageKey}
              src={publicUrl(photos[lightboxIndex]!.storageKey)}
              alt={photos[lightboxIndex]!.alt ?? `${title} — foto ${lightboxIndex + 1}`}
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
                {lightboxIndex + 1} / {photos.length}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
