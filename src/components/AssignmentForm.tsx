import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { label: string }) => void | Promise<void>;
}

export default function AssignmentForm({ open, onClose, onSubmit }: Props) {
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit({ label });
      setLabel("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>New Assignment</DialogTitle>
      <DialogContent>
        <TextField
          label="Label"
          fullWidth
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          sx={{ mt: 1 }}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!label.trim() || saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
