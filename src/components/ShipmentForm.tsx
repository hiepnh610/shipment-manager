import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, CircularProgress } from "@mui/material";
import type { Shipment } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Shipment, "id">) => void | Promise<void>;
}

const INITIAL = {
  client_name: "",
  label: "",
  warehouse_id: "581",
  lat: "",
  lng: "",
  arrival_date: new Date().toISOString().slice(0, 10),
  delivery_by_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
};

type Errors = Partial<Record<keyof typeof INITIAL, string>>;

function validate(form: typeof INITIAL): Errors {
  const errors: Errors = {};
  if (!form.client_name.trim()) errors.client_name = "Client name is required";
  if (!form.label.trim()) errors.label = "Label is required";
  if (!form.warehouse_id.trim()) errors.warehouse_id = "Warehouse ID is required";
  const lat = parseFloat(String(form.lat));
  const lng = parseFloat(String(form.lng));
  if (!form.lat || isNaN(lat) || lat === 0) errors.lat = "Valid non-zero latitude is required";
  if (!form.lng || isNaN(lng) || lng === 0) errors.lng = "Valid non-zero longitude is required";
  if (!form.arrival_date) errors.arrival_date = "Arrival date is required";
  if (!form.delivery_by_date) errors.delivery_by_date = "Delivery date is required";
  return errors;
}

export default function ShipmentForm({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const handleBlur = (field: string) => {
    setTouched((prev) => new Set(prev).add(field));
    setErrors(validate(form));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    setErrors(errs);
    setTouched(new Set(Object.keys(INITIAL)));
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      await onSubmit({
        ...form,
        lat: parseFloat(String(form.lat)),
        lng: parseFloat(String(form.lng)),
        status: "OPEN",
        arrival_date: new Date(form.arrival_date).toISOString(),
        delivery_by_date: new Date(form.delivery_by_date).toISOString(),
        eta: new Date(form.delivery_by_date).toISOString(),
      });
      setForm(INITIAL);
      setErrors({});
      setTouched(new Set());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL);
    setErrors({});
    setTouched(new Set());
    onClose();
  };

  const showError = (field: keyof typeof INITIAL) => touched.has(field) && errors[field];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Shipment</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Client Name"
            value={form.client_name}
            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
            onBlur={() => handleBlur("client_name")}
            error={!!showError("client_name")}
            helperText={showError("client_name") || ""}
          />
          <TextField
            label="Label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            onBlur={() => handleBlur("label")}
            error={!!showError("label")}
            helperText={showError("label") || ""}
          />
          <TextField
            label="Warehouse ID"
            value={form.warehouse_id}
            onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}
            onBlur={() => handleBlur("warehouse_id")}
            error={!!showError("warehouse_id")}
            helperText={showError("warehouse_id") || ""}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Latitude"
              type="number"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              onBlur={() => handleBlur("lat")}
              error={!!showError("lat")}
              helperText={showError("lat") || ""}
              fullWidth
            />
            <TextField
              label="Longitude"
              type="number"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              onBlur={() => handleBlur("lng")}
              error={!!showError("lng")}
              helperText={showError("lng") || ""}
              fullWidth
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Arrival Date"
              type="date"
              value={form.arrival_date}
              onChange={(e) => setForm({ ...form, arrival_date: e.target.value })}
              onBlur={() => handleBlur("arrival_date")}
              error={!!showError("arrival_date")}
              helperText={showError("arrival_date") || ""}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Delivery By"
              type="date"
              value={form.delivery_by_date}
              onChange={(e) => setForm({ ...form, delivery_by_date: e.target.value })}
              onBlur={() => handleBlur("delivery_by_date")}
              error={!!showError("delivery_by_date")}
              helperText={showError("delivery_by_date") || ""}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
