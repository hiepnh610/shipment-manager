import axios from "axios";
import type { Shipment, Assignment } from "../types";
import {
  encodeId,
  isValidStatus,
  sanitizeShipmentInput,
  sanitizeAssignmentInput,
} from "../utils/sanitize";

const http = axios.create({ baseURL: "http://localhost:3001" });

let onErrorCallback: ((msg: string) => void) | null = null;

export function setApiErrorHandler(cb: (msg: string) => void) {
  onErrorCallback = cb;
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.statusText ||
      error.message ||
      "An unexpected error occurred";
    onErrorCallback?.(message);
    return Promise.reject(error);
  }
);

function validateShipment(raw: unknown): Shipment | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.label !== "string") return null;
  if (!isValidStatus(r.status)) return null;
  return raw as Shipment;
}

function validateShipments(data: unknown): Shipment[] {
  if (!Array.isArray(data)) return [];
  return data.map(validateShipment).filter((s): s is Shipment => s !== null);
}

function validateAssignments(data: unknown): Assignment[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (a): a is Assignment =>
      !!a &&
      typeof a === "object" &&
      typeof a.id === "string" &&
      typeof a.label === "string" &&
      isValidStatus(a.status)
  );
}

export const api = {
  getShipments: () =>
    http.get("/shipments").then((r) => validateShipments(r.data)),

  createShipment: (data: Omit<Shipment, "id">) =>
    http
      .post<Shipment>("/shipments", {
        ...sanitizeShipmentInput(data as Record<string, unknown>),
        id: `shp_${Date.now().toString(36)}`,
      })
      .then((r) => r.data),

  updateShipment: (id: string, data: Partial<Shipment>) =>
    http
      .put<Shipment>(
        `/shipments/${encodeId(id)}`,
        sanitizeShipmentInput(data as Record<string, unknown>)
      )
      .then((r) => r.data),

  deleteShipment: (id: string) =>
    http.delete(`/shipments/${encodeId(id)}`),

  getAssignments: () =>
    http.get("/assignments").then((r) => validateAssignments(r.data)),

  createAssignment: (data: Omit<Assignment, "id">) =>
    http
      .post<Assignment>("/assignments", {
        ...sanitizeAssignmentInput(data as Record<string, unknown>),
        id: `as_${Date.now().toString(36)}`,
      })
      .then((r) => r.data),

  deleteAssignment: (id: string) =>
    http.delete(`/assignments/${encodeId(id)}`),
};
