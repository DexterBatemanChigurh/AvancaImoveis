"use client";

import Image from "next/image";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import type { PropertyPhoto } from "@/db/schema";
import {
  deletePhoto,
  movePhoto,
  setCoverPhoto,
  uploadPhotos,
  type PhotosState,
} from "@/features/properties/photos";
import { MAX_PHOTOS_PER_PROPERTY } from "@/lib/constants";
import { publicUrl } from "@/lib/storage/url";

const initial: PhotosState = { ok: false };

export function PropertyPhotos({
  propertyId,
  photos,
}: {
  propertyId: string;
  photos: PropertyPhoto[];
}) {
  const [state, formAction, pending] = useActionState(
    uploadPhotos.bind(null, propertyId),
    initial,
  );
  const full = photos.length >= MAX_PHOTOS_PER_PROPERTY;

  return (
    <fieldset className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
      <legend className="px-1 font-mono text-xs uppercase tracking-wide text-muted">
        Fotos ({photos.length}/{MAX_PHOTOS_PER_PROPERTY})
      </legend>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="flex flex-col gap-2 rounded-md border border-line p-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded bg-surface-2">
                <Image
                  src={publicUrl(photo.thumbKey ?? photo.storageKey)}
                  alt={photo.alt ?? "Foto do imóvel"}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {photo.isCover && (
                  <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
                    capa
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                <form action={movePhoto.bind(null, photo.id, propertyId, "up")}>
                  <Button type="submit" variant="outline" size="sm" disabled={i === 0}>
                    ↑
                  </Button>
                </form>
                <form action={movePhoto.bind(null, photo.id, propertyId, "down")}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={i === photos.length - 1}
                  >
                    ↓
                  </Button>
                </form>
                {!photo.isCover && (
                  <form action={setCoverPhoto.bind(null, photo.id, propertyId)}>
                    <Button type="submit" variant="outline" size="sm">
                      Capa
                    </Button>
                  </form>
                )}
                <form action={deletePhoto.bind(null, photo.id)}>
                  <Button type="submit" variant="danger" size="sm">
                    Remover
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        action={formAction}
        className="flex flex-wrap items-center gap-3 border-t border-line pt-4"
      >
        <input
          type="file"
          name="files"
          accept="image/png,image/jpeg,image/webp"
          multiple
          disabled={full}
          className="text-sm file:mr-3 file:rounded-md file:border file:border-line file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm"
        />
        <Button type="submit" size="sm" disabled={pending || full}>
          {pending ? "Enviando…" : "Adicionar fotos"}
        </Button>
      </form>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <p className="text-xs text-muted">
        JPG, PNG ou WebP — cada foto é redimensionada e otimizada automaticamente.
        Reordene com as setas; a foto marcada &ldquo;capa&rdquo; é a que aparece no catálogo.
      </p>
    </fieldset>
  );
}
