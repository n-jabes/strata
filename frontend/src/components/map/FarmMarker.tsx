"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

export type FarmLatestAnalysis = {
  slope: number;
  soilType: string;
  rainfall: string;
  recommendedCrops: string[];
};

export type FarmMapMarkerData = {
  id: string;
  name: string;
  location: string;
  size: number;
  latitude: number;
  longitude: number;
  latestAnalysis?: FarmLatestAnalysis | null;
};

// Forest-aligned custom marker icon.
const FOREST = "#007E6E";

const farmIcon = L.divIcon({
  className: "farm-map-marker",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: ${FOREST};
      border: 2px solid rgba(255,255,255,0.95);
      box-shadow: 0 10px 24px rgba(0,0,0,0.28);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: rgba(255,255,255,0.95);
      " />
    </div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function FarmMarker({ farm }: { farm: FarmMapMarkerData }) {
  const position: [number, number] = [farm.latitude, farm.longitude];

  return (
    <Marker position={position} icon={farmIcon as any}>
      <Popup>
        <div className="min-w-[230px] max-w-[270px]">
          <div className="font-semibold text-gray-900">
            {farm.name}
          </div>
          <div className="text-sm text-gray-600 mt-0.5">
            {farm.location}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Size: <span className="font-medium">{farm.size}</span> ha
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            {farm.latestAnalysis ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  <div>
                    <div className="text-[11px] text-gray-400">
                      Slope
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {farm.latestAnalysis.slope}°
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400">
                      Soil Type
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {farm.latestAnalysis.soilType}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-gray-400">
                    Rainfall
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {farm.latestAnalysis.rainfall}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-gray-400">
                    Recommended Crops
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {farm.latestAnalysis.recommendedCrops
                      .slice(0, 4)
                      .map((crop) => (
                        <span
                          key={crop}
                          className="inline-flex px-2 py-1 rounded-full text-[11px] font-medium bg-leaf/15 text-forest border border-forest/10"
                        >
                          {crop}
                        </span>
                      ))}
                    {farm.latestAnalysis.recommendedCrops.length > 4 && (
                      <span className="text-[11px] text-gray-500 self-center">
                        +{farm.latestAnalysis.recommendedCrops.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No analysis yet for this farm.
              </div>
            )}

            <div className="mt-3">
              <a
                href={`/farms/${farm.id}`}
                className="farm-map-popup-cta"
              >
                View Details
              </a>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

