import { useMemo } from "react";
import { Box, Typography, Chip, List, ListItemButton, ListItemText, Divider } from "@mui/material";
import type { Assignment, Shipment, ShipmentStatus } from "../types";

const STATUS_COLOR: Record<ShipmentStatus, "info" | "warning" | "success"> = {
  OPEN: "info",
  IN_TRANSIT: "warning",
  DELIVERED: "success",
};

interface Props {
  assignment: Assignment | null;
  shipments: Shipment[];
  selectedShipmentId?: string;
  onShipmentSelect: (shipment: Shipment) => void;
}

export default function AssignmentDetail({ assignment, shipments, selectedShipmentId, onShipmentSelect }: Props) {
  const assignmentShipments = useMemo(
    () => (assignment ? shipments.filter((s) => s.assignment_id === assignment.id) : []),
    [assignment, shipments]
  );

  if (!assignment) {
    return (
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography color="text.secondary">Select an assignment</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">{assignment.label}</Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Chip label={assignment.status.replace(/_/g, " ")} size="small" color={STATUS_COLOR[assignment.status]} />
          <Chip label={`${assignmentShipments.length} shipments`} size="small" variant="outlined" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          ID: {assignment.id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Clients: {assignment.clients.join(", ") || "None"}
        </Typography>
      </Box>

      <Divider />

      <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        Shipments in this assignment
      </Typography>
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List dense>
          {assignmentShipments.map((s) => (
            <ListItemButton key={s.id} selected={s.id === selectedShipmentId} onClick={() => onShipmentSelect(s)}>
              <ListItemText
                primary={s.label}
                secondary={`${s.client_name} · ${s.status.replace(/_/g, " ")}`}
              />
            </ListItemButton>
          ))}
          {assignmentShipments.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
              No shipments assigned
            </Typography>
          )}
        </List>
      </Box>
    </Box>
  );
}
