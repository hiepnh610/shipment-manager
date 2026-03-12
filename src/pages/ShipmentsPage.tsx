import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography, IconButton } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { Shipment, Assignment } from "../types";
import { api } from "../api";
import { useToast } from "../components/ToastProvider";
import GroupedStatusList from "../components/GroupedStatusList";
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
        <GroupedStatusList
          items={shipments}
          selectedId={selected?.id}
          entityLabel="shipments"
          filterFn={(s, q) => {
            const lower = q.toLowerCase();
            return s.label.toLowerCase().includes(lower) || s.client_name.toLowerCase().includes(lower);
          }}
          onSelect={selectShipment}
          onAdd={() => setFormOpen(true)}
          renderItem={(shipment) => (
            <>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {shipment.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap component="div">
                  {shipment.client_name} &middot; {new Date(shipment.arrival_date).toLocaleDateString()}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(shipment.id);
                }}
                sx={{
                  opacity: 0.4,
                  "&:hover": { opacity: 1, color: "error.main" },
                  flexShrink: 0,
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </>
          )}
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
