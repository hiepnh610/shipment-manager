import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import type { Shipment, Assignment } from "../types";
import { api } from "../api";
import { useToast } from "../components/ToastProvider";
import ShipmentList from "../components/ShipmentList";
import ShipmentDetail from "../components/ShipmentDetail";
import ShipmentForm from "../components/ShipmentForm";
import ConfirmDialog from "../components/ConfirmDialog";

export default function ShipmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    const [s, a] = await Promise.all([api.getShipments(), api.getAssignments()]);
    setShipments(s);
    setAssignments(a);
    return s;
  }, []);

  useEffect(() => {
    loadData()
      .then((s) => {
        if (s.length > 0) {
          const paramId = searchParams.get("shipment");
          const fromUrl = paramId ? s.find((sh) => sh.id === paramId) : null;
          setSelected(fromUrl ?? s.find((sh) => sh.status === "OPEN") ?? s[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [loadData]);

  const selectShipment = (shipment: Shipment | null) => {
    setSelected(shipment);
    setSearchParams(shipment ? { shipment: shipment.id } : {}, { replace: true });
  };

  const handleSave = async (shipment: Shipment) => {
    try {
      await api.updateShipment(shipment.id, shipment);
      await loadData();
      selectShipment(shipment);
      showToast("Shipment updated successfully", "success");
    } catch {
      /* interceptor handles toast */
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteShipment(deleteId);
      if (selected?.id === deleteId) selectShipment(null);
      await loadData();
      showToast("Shipment deleted", "success");
    } catch {
      /* interceptor handles toast */
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreate = async (data: Omit<Shipment, "id">) => {
    try {
      await api.createShipment(data);
      await loadData();
      showToast("Shipment created", "success");
    } catch {
      /* interceptor handles toast */
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Box sx={{ width: 380, borderRight: 1, borderColor: "divider", flexShrink: 0 }}>
        <ShipmentList
          shipments={shipments}
          selectedId={selected?.id}
          onSelect={selectShipment}
          onDelete={setDeleteId}
          onAdd={() => setFormOpen(true)}
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <ShipmentDetail shipment={selected} assignments={assignments} onSave={handleSave} />
      </Box>
      <ShipmentForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Shipment"
        message="Are you sure you want to delete this shipment?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
