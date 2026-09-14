"use client";

import dynamic from "next/dynamic";

const PropertyMapLeaflet = dynamic(
  () => import("./property-map-leaflet").then((m) => m.PropertyMapLeaflet),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-surface-2" />,
  },
);

export function PropertyMap({ lat, lng }: { lat: number; lng: number }) {
  return <PropertyMapLeaflet lat={lat} lng={lng} />;
}
