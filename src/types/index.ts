export type ShipmentStatus = "OPEN" | "IN_TRANSIT" | "DELIVERED";

export interface Shipment {
  id: string;
  client_name: string;
  label: string;
  status: ShipmentStatus;
  arrival_date: string;
  delivery_by_date: string;
  eta: string;
  warehouse_id: string;
  assignment_id?: string;
  lat: number;
  lng: number;
}

export interface Assignment {
  id: string;
  label: string;
  status: ShipmentStatus;
  clients: string[];
  shipment_count: number;
}
