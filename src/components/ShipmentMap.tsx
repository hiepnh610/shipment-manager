import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { Shipment } from "../types";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const selectedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

interface Props {
  shipments: Shipment[];
  selectedShipmentId?: string;
  showPolyline?: boolean;
}

export default function ShipmentMap({ shipments, selectedShipmentId, showPolyline }: Props) {
  const selected = shipments.find((s) => s.id === selectedShipmentId) || shipments[0];
  if (!selected) return null;

  const positions: [number, number][] = shipments.map((s) => [s.lat, s.lng]);

  return (
    <MapContainer center={[selected.lat, selected.lng]} zoom={11} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      />
      <MapUpdater lat={selected.lat} lng={selected.lng} />
      {shipments.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={s.id === selectedShipmentId ? selectedIcon : new L.Icon.Default()}
          opacity={s.id === selectedShipmentId ? 1 : 0.7}
        >
          <Popup>
            <strong>{s.label}</strong>
            <br />
            {s.client_name}
          </Popup>
        </Marker>
      ))}
      {showPolyline && positions.length > 1 && <Polyline positions={positions} color="#1976d2" weight={3} dashArray="8 4" />}
    </MapContainer>
  );
}
