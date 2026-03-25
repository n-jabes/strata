"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { FarmMapMarkerData } from "./FarmMarker";
import { FarmMarker } from "./FarmMarker";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
) as any;

const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
) as any;

export function FarmMap({ farms }: { farms: FarmMapMarkerData[] }) {
  const markers = useMemo(
    () =>
      farms.map((farm) => (
        <FarmMarker key={farm.id} farm={farm} />
      )),
    [farms]
  );

  return (
    <div className="w-full rounded-xl shadow-md overflow-hidden bg-white">
      <MapContainer
        center={[-1.94, 30.06]} // Rwanda approx.
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: 580, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers}
      </MapContainer>
    </div>
  );
}

