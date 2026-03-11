import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import type { Shipment, Assignment, ShipmentStatus } from "../types";
import ShipmentMap from "./ShipmentMap";

const STATUSES: ShipmentStatus[] = ["OPEN", "IN_TRANSIT", "DELIVERED"];

interface Props {
  shipment: Shipment | null;
  assignments: Assignment[];
  allShipments?: Shipment[];
  onSave: (shipment: Shipment) => void | Promise<void>;
  showAllPins?: boolean;
}

type FieldErrors = Partial<Record<string, string>>;

function validateDetail(s: Shipment, needsAssignment: boolean): FieldErrors {
  const errors: FieldErrors = {};
  if (!s.lat || s.lat === 0) errors.lat = "Valid non-zero latitude is required";
  if (!s.lng || s.lng === 0) errors.lng = "Valid non-zero longitude is required";
  if (needsAssignment && !s.assignment_id) errors.assignment_id = "Assignment is required";
  return errors;
}

export default function ShipmentDetail({ shipment, assignments, allShipments, onSave, showAllPins }: Props) {
  const [edited, setEdited] = useState<Shipment | null>(null);
  const [needsAssignment, setNeedsAssignment] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shipment) {
      setEdited({ ...shipment });
      setNeedsAssignment(false);
      setErrors({});
    } else {
      setEdited(null);
    }
  }, [shipment]);

  if (!edited) {
    return (
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography color="text.secondary">Select a shipment to view details</Typography>
      </Box>
    );
  }

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    const wasOpen = shipment?.status === "OPEN";
    const goingToOpen = newStatus === "OPEN";

    setEdited((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, status: newStatus };
      if (goingToOpen) {
        delete updated.assignment_id;
        setNeedsAssignment(false);
      } else if (wasOpen) {
        setNeedsAssignment(true);
      }
      return updated;
    });
  };

  const handleSave = async () => {
    const errs = validateDetail(edited, needsAssignment);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      await onSave(edited);
    } finally {
      setSaving(false);
    }
  };

  const mapShipments = showAllPins && allShipments?.length ? allShipments : [edited];

  return (
    <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column", overflow: "auto" }}>
      <Typography variant="h6" gutterBottom>
        {edited.label}
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
        <TextField label="Client" value={edited.client_name} size="small" disabled />

        <FormControl size="small">
          <InputLabel>Status</InputLabel>
          <Select value={edited.status} label="Status" onChange={(e) => handleStatusChange(e.target.value as ShipmentStatus)}>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {edited.status !== "OPEN" && (
          <FormControl size="small" error={!!errors.assignment_id}>
            <InputLabel>Assignment</InputLabel>
            <Select
              value={edited.assignment_id || ""}
              label="Assignment"
              onChange={(e) => setEdited({ ...edited, assignment_id: e.target.value || undefined })}
            >
              <MenuItem value="">None</MenuItem>
              {assignments.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.label} ({a.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField label="Arrival Date" value={new Date(edited.arrival_date).toLocaleDateString()} size="small" disabled />

        <TextField
          label="Delivery By"
          type="date"
          size="small"
          value={edited.delivery_by_date.slice(0, 10)}
          onChange={(e) => setEdited({ ...edited, delivery_by_date: new Date(e.target.value).toISOString() })}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField label="Warehouse" value={edited.warehouse_id} size="small" disabled />
        <TextField label="ETA" value={new Date(edited.eta).toLocaleString()} size="small" disabled />

        <TextField
          label="Latitude"
          type="number"
          size="small"
          value={edited.lat}
          onChange={(e) => setEdited({ ...edited, lat: parseFloat(e.target.value) || 0 })}
          error={!!errors.lat}
          helperText={errors.lat}
          slotProps={{ htmlInput: { step: 0.001 } }}
        />
        <TextField
          label="Longitude"
          type="number"
          size="small"
          value={edited.lng}
          onChange={(e) => setEdited({ ...edited, lng: parseFloat(e.target.value) || 0 })}
          error={!!errors.lng}
          helperText={errors.lng}
          slotProps={{ htmlInput: { step: 0.001 } }}
        />
      </Box>

      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Please fix the errors above before saving
        </Alert>
      )}

      <Button
        variant="contained"
        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
        onClick={handleSave}
        disabled={saving}
        sx={{ mb: 2, alignSelf: "flex-start" }}
      >
        Save Changes
      </Button>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flex: 1, minHeight: 200, borderRadius: 1, overflow: "hidden" }}>
        <ShipmentMap shipments={mapShipments} selectedShipmentId={edited.id} showPolyline={showAllPins} />
      </Box>
    </Box>
  );
}
