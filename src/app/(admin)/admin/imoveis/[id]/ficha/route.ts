import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { requireUser } from "@/features/auth/session";
import { getPropertyById } from "@/features/properties/queries";
import { PropertySheetDocument, type PropertySheetData } from "@/lib/pdf/property-sheet";
import { publicUrl } from "@/lib/storage/url";

type Params = Promise<{ id: string }>;

/**
 * Ficha em PDF sob demanda — nunca salva no Storage, gerada a cada request.
 * Exige sessão (mesma proteção do resto do /admin): a ficha em si é segura
 * de compartilhar com um cliente, mas a ROTA fica atrás de login porque é
 * disparada de dentro do painel, não pensada como link público.
 */
export async function GET(_request: Request, { params }: { params: Params }) {
  await requireUser();

  const { id } = await params;
  const property = await getPropertyById(id).catch(() => null);
  if (!property) {
    return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });
  }

  const cover = property.photos.find((p) => p.isCover) ?? property.photos[0];

  const data: PropertySheetData = {
    code: property.code,
    title: property.title,
    kind: property.kind,
    district: property.district,
    city: property.city,
    state: property.state,
    salePrice: property.salePrice,
    condoFee: property.condoFee,
    iptuYearly: property.iptuYearly,
    usableArea: property.usableArea,
    totalArea: property.totalArea,
    bedrooms: property.bedrooms,
    suites: property.suites,
    bathrooms: property.bathrooms,
    parkingSpots: property.parkingSpots,
    description: property.description,
    features: property.features,
    condoFeatures: property.condoFeatures,
    highlights: property.highlights,
    coverPhotoUrl: cover ? publicUrl(cover.storageKey) : null,
  };

  const buffer = await renderToBuffer(PropertySheetDocument({ property: data }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ficha-${property.code}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
