import { useState, useMemo, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Fab,
  InputAdornment,
  Collapse,
  alpha,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { Shipment, ShipmentStatus } from "../types";
import { STATUS_PALETTE } from "../theme";

const STATUS_ORDER: ShipmentStatus[] = ["OPEN", "IN_TRANSIT", "DELIVERED"];

interface Props {
  shipments: Shipment[];
  selectedId?: string;
  onSelect: (shipment: Shipment) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function ShipmentList({ shipments, selectedId, onSelect, onDelete, onAdd }: Props) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    () => Object.fromEntries(STATUS_ORDER.map((s) => [s, false]))
  );

  const toggleGroup = (status: string) =>
    setExpanded((prev) => ({ ...prev, [status]: !prev[status] }));

  useEffect(() => {
    if (!selectedId) return;
    const match = shipments.find((s) => s.id === selectedId);
    if (match) setExpanded((prev) => ({ ...prev, [match.status]: true }));
  }, [selectedId, shipments]);

  const filtered = useMemo(
    () =>
      shipments.filter(
        (s) =>
          s.label.toLowerCase().includes(search.toLowerCase()) ||
          s.client_name.toLowerCase().includes(search.toLowerCase())
      ),
    [shipments, search]
  );

  const grouped = useMemo(
    () => STATUS_ORDER.map((status) => ({ status, items: filtered.filter((s) => s.status === status) })),
    [filtered]
  );

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search shipments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "grey.50",
                "&:hover": { bgcolor: "grey.100" },
                "&.Mui-focused": { bgcolor: "#fff" },
              },
            }}
          />
          <Fab size="small" color="primary" onClick={onAdd} sx={{ flexShrink: 0 }}>
            <AddIcon />
          </Fab>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          {filtered.length} of {shipments.length} shipments
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", px: 1 }}>
        {grouped.map((group) => {
          const palette = STATUS_PALETTE[group.status];
          const isOpen = expanded[group.status];
          return (
            <Box key={group.status} sx={{ mb: 1.5 }}>
              <Box
                onClick={() => toggleGroup(group.status)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  py: 0.75,
                  cursor: "pointer",
                  borderRadius: 1.5,
                  userSelect: "none",
                  transition: "background 0.15s",
                  "&:hover": { bgcolor: alpha(palette.main, 0.06) },
                }}
              >
                {isOpen ? (
                  <ExpandMoreIcon sx={{ fontSize: 18, color: palette.main }} />
                ) : (
                  <ChevronRightIcon sx={{ fontSize: 18, color: palette.main }} />
                )}
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: palette.main }} />
                <Typography variant="subtitle2" sx={{ color: palette.dark, flex: 1 }}>
                  {group.status.replace(/_/g, " ")}
                </Typography>
                <Box
                  sx={{
                    bgcolor: palette.light,
                    color: palette.dark,
                    px: 0.8,
                    py: 0.1,
                    borderRadius: 1,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                  }}
                >
                  {group.items.length}
                </Box>
              </Box>
              <Collapse in={isOpen} timeout="auto">
                {group.items.map((shipment) => {
                  const isSelected = shipment.id === selectedId;
                  return (
                    <Box
                      key={shipment.id}
                      onClick={() => onSelect(shipment)}
                      sx={{
                        mx: 0.5,
                        mb: 0.5,
                        p: 1.5,
                        borderRadius: 0,
                        cursor: "pointer",
                        borderLeft: "4px solid",
                        borderColor: palette.main,
                        bgcolor: isSelected ? alpha(palette.main, 0.08) : "#fff",
                        boxShadow: isSelected
                          ? `0 0 0 1px ${alpha(palette.main, 0.3)}`
                          : "0 1px 2px rgba(0,0,0,0.04)",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          bgcolor: isSelected ? alpha(palette.main, 0.1) : alpha(palette.main, 0.04),
                          transform: "translateX(2px)",
                          boxShadow: isSelected
                            ? `0 0 0 1px ${alpha(palette.main, 0.4)}`
                            : "0 2px 8px rgba(0,0,0,0.08)",
                        },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
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
                          onDelete(shipment.id);
                        }}
                        sx={{
                          opacity: 0.4,
                          "&:hover": { opacity: 1, color: "error.main" },
                          flexShrink: 0,
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
                {group.items.length === 0 && (
                  <Typography variant="caption" color="text.disabled" sx={{ px: 2, py: 1, display: "block" }}>
                    No shipments
                  </Typography>
                )}
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
