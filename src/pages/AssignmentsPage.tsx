import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography, IconButton, Tooltip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { Shipment, Assignment } from "../types";
import { api } from "../api";
import { useToast } from "../components/ToastProvider";
import GroupedStatusList from "../components/GroupedStatusList";
import AssignmentDetail from "../components/AssignmentDetail";
import ShipmentDetail from "../components/ShipmentDetail";
import AssignmentForm from "../components/AssignmentForm";
import ConfirmDialog from "../components/ConfirmDialog";

export default function AssignmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    const [s, a] = await Promise.all([api.getShipments(), api.getAssignments()]);
    setShipments(s);
    setAssignments(a);
    return { s, a };
  }, []);

  useEffect(() => {
    loadData()
      .then(({ s, a }) => {
        if (a.length > 0) {
          const aParamId = searchParams.get("assignment");
          const sParamId = searchParams.get("shipment");
          const fromUrlA = aParamId ? a.find((x) => x.id === aParamId) : null;
          const picked = fromUrlA ?? a.find((x) => x.status === "OPEN") ?? a[0];
          setSelectedAssignment(picked);

          const assignedShipments = s.filter((sh) => sh.assignment_id === picked.id);
          const fromUrlS = sParamId ? assignedShipments.find((sh) => sh.id === sParamId) : null;
          setSelectedShipment(fromUrlS ?? assignedShipments[0] ?? null);
        }
      })
      .finally(() => setLoading(false));
  }, [loadData]);

  const shipmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    shipments.forEach((s) => {
      if (s.assignment_id) counts[s.assignment_id] = (counts[s.assignment_id] || 0) + 1;
    });
    return counts;
  }, [shipments]);

  const assignmentShipments = useMemo(
    () => (selectedAssignment ? shipments.filter((s) => s.assignment_id === selectedAssignment.id) : []),
    [selectedAssignment, shipments]
  );

  const updateParams = (aId?: string, sId?: string) => {
    const params: Record<string, string> = {};
    if (aId) params.assignment = aId;
    if (sId) params.shipment = sId;
    setSearchParams(params, { replace: true });
  };

  const selectAssignment = (a: Assignment) => {
    setSelectedAssignment(a);
    const first = shipments.find((s) => s.assignment_id === a.id) ?? null;
    setSelectedShipment(first);
    updateParams(a.id, first?.id);
  };

  const selectShipment = (s: Shipment) => {
    setSelectedShipment(s);
    updateParams(selectedAssignment?.id, s.id);
  };

  const handleShipmentSave = async (shipment: Shipment) => {
    try {
      await api.updateShipment(shipment.id, shipment);
      await loadData();
      setSelectedShipment(shipment);
      showToast("Shipment updated successfully", "success");
    } catch {
      /* interceptor handles toast */
    }
  };

  const handleDeleteAssignment = async () => {
    if (!deleteId) return;
    try {
      await api.deleteAssignment(deleteId);
      if (selectedAssignment?.id === deleteId) {
        setSelectedAssignment(null);
        setSelectedShipment(null);
        setSearchParams({}, { replace: true });
      }
      await loadData();
      showToast("Assignment deleted", "success");
    } catch {
      /* interceptor handles toast */
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreateAssignment = async (data: { label: string }) => {
    try {
      await api.createAssignment({ ...data, status: "OPEN", clients: [], shipment_count: 0 });
      await loadData();
      showToast("Assignment created", "success");
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
      <Box sx={{ width: 300, borderRight: 1, borderColor: "divider", flexShrink: 0 }}>
        <GroupedStatusList
          items={assignments}
          selectedId={selectedAssignment?.id}
          entityLabel="assignments"
          filterFn={(a, q) => a.label.toLowerCase().includes(q.toLowerCase())}
          onSelect={selectAssignment}
          onAdd={() => setFormOpen(true)}
          renderItem={(assignment) => {
            const count = shipmentCounts[assignment.id] || 0;
            return (
              <>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {assignment.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap component="div">
                    {assignment.clients.join(", ") || "No clients"} &middot; {count} shipments
                  </Typography>
                </Box>
                <Tooltip title={count > 0 ? "Cannot delete: has shipments" : "Delete"}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={count > 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(assignment.id);
                      }}
                      sx={{
                        opacity: count > 0 ? 0.2 : 0.4,
                        "&:hover": { opacity: 1, color: "error.main" },
                        flexShrink: 0,
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            );
          }}
        />
      </Box>
      <Box sx={{ width: 320, borderRight: 1, borderColor: "divider", flexShrink: 0 }}>
        <AssignmentDetail
          assignment={selectedAssignment}
          shipments={shipments}
          selectedShipmentId={selectedShipment?.id}
          onShipmentSelect={selectShipment}
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <ShipmentDetail
          shipment={selectedShipment}
          assignments={assignments}
          allShipments={assignmentShipments}
          onSave={handleShipmentSave}
          showAllPins
        />
      </Box>
      <AssignmentForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreateAssignment} />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment?"
        onConfirm={handleDeleteAssignment}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
