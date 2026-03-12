import { useState, useMemo, useEffect, type ReactNode } from "react";
import {
  Box,
  TextField,
  Typography,
  Fab,
  InputAdornment,
  Collapse,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { ShipmentStatus } from "../types";
import { STATUS_PALETTE } from "../theme";

const STATUS_ORDER: ShipmentStatus[] = ["OPEN", "IN_TRANSIT", "DELIVERED"];

export interface StatusItem {
  id: string;
  status: ShipmentStatus;
}

interface Props<T extends StatusItem> {
  items: T[];
  selectedId?: string;
  entityLabel: string;
  filterFn: (item: T, query: string) => boolean;
  onSelect: (item: T) => void;
  onAdd: () => void;
  renderItem: (item: T, opts: { isSelected: boolean; palette: (typeof STATUS_PALETTE)[ShipmentStatus] }) => ReactNode;
}

export default function GroupedStatusList<T extends StatusItem>({
  items,
  selectedId,
  entityLabel,
  filterFn,
  onSelect,
  onAdd,
  renderItem,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    () => Object.fromEntries(STATUS_ORDER.map((s) => [s, false]))
  );

  const toggleGroup = (status: string) =>
    setExpanded((prev) => ({ ...prev, [status]: !prev[status] }));

  useEffect(() => {
    if (!selectedId) return;
    const match = items.find((i) => i.id === selectedId);
    if (match) setExpanded((prev) => ({ ...prev, [match.status]: true }));
  }, [selectedId, items]);

  const filtered = useMemo(
    () => items.filter((i) => filterFn(i, search)),
    [items, search, filterFn]
  );

  const grouped = useMemo(
    () => STATUS_ORDER.map((status) => ({ status, items: filtered.filter((i) => i.status === status) })),
    [filtered]
  );

  useEffect(() => {
    if (!search) return;
    setExpanded(
      Object.fromEntries(grouped.map((g) => [g.status, g.items.length > 0]))
    );
  }, [search, grouped]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <TextField
            fullWidth
            size="small"
            placeholder={`Search ${entityLabel}...`}
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
          {filtered.length} of {items.length} {entityLabel}
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
                {group.items.map((item) => {
                  const isSelected = item.id === selectedId;
                  return (
                    <Box
                      key={item.id}
                      onClick={() => onSelect(item)}
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
                      {renderItem(item, { isSelected, palette })}
                    </Box>
                  );
                })}
                {group.items.length === 0 && (
                  <Typography variant="caption" color="text.disabled" sx={{ px: 2, py: 1, display: "block" }}>
                    No {entityLabel}
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
