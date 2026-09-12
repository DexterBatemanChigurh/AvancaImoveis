"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";

import { publicUrl } from "@/lib/storage/url";

type Photo = { storageKey: string; thumbKey: string | null; alt: string | null };

export function PropertyCardMedia({
  title,
  photos,
  badges,
  aspectClassName = "aspect-[4/3]",
}: {
  title: string;
  photos: Photo[];
  badges: string[];
  /** Proporção da moldura — cards do catálogo usam algo mais quadrado, a
   * home usa um recorte mais editorial/vertical (ver property-card.tsx). */
  aspectClassName?: string;
}) {
  const [active, setActive] = useState(0);
  const hasMultiple = photos.length > 1;

  function step(dir: -1 | 1, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setActive((i) => (i + dir + photos.length) % photos.length);
  }

  return (
    <div
      className={`relative overflow-hidden bg-surface-2 ${aspectClassName}`}
      onMouseMove={(e) => {
        if (!hasMultiple) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const index = Math.min(
          photos.length - 1,
          Math.max(0, Math.floor(ratio * photos.length)),
        );
        setActive(index);
      }}
      onMouseLeave={() => setActive(0)}
    >
      {photos.length > 0 ? (
        photos.map((photo, i) => (
          <Image
            key={photo.storageKey}
            src={publicUrl(photo.thumbKey ?? photo.storageKey)}
            alt={photo.alt ?? title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
            className="object-cover transition-opacity duration-150"
            style={{ opacity: i === active ? 1 : 0 }}
            priority={i === 0}
          />
        ))
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted">
          sem foto
        </div>
      )}

      {photos.length > 0 && (
        <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-medium text-bg backdrop-blur">
          <Camera className="h-3.5 w-3.5" />
          {photos.length}
        </span>
      )}

      {badges.length > 0 && (
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {badges.map((b) => (
            <span
              key={b}
              className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-bg"
            >
              {b}
            </span>
          ))}
        </div>
      )}

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(e) => step(-1, e)}
            className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/85 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={(e) => step(1, e)}
            className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/85 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-3 bottom-3 flex gap-1.5">
            {photos.map((photo, i) => (
              <span
                key={photo.storageKey}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i === active ? "bg-bg" : "bg-bg/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
