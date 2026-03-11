import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  CssBaseline,
  Box,
  CircularProgress,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ToastProvider, { useToast } from "./components/ToastProvider";
import { setApiErrorHandler } from "./api";

const ShipmentsPage = lazy(() => import("./pages/ShipmentsPage"));
const AssignmentsPage = lazy(() => import("./pages/AssignmentsPage"));

function PageLoader() {
  return (
    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress />
    </Box>
  );
}

function AppContent() {
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    setApiErrorHandler((msg) => showToast(msg, "error"));
  }, [showToast]);

  return (
    <>
      <CssBaseline />
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <LocalShippingIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Shipment Manager
          </Typography>
          <Button
            color="inherit"
            component={Link}
            to="/shipments"
            variant={
              location.pathname.startsWith("/shipments") ? "outlined" : "text"
            }
            sx={{ mr: 1 }}
          >
            Shipments
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/assignments"
            variant={
              location.pathname.startsWith("/assignments")
                ? "outlined"
                : "text"
            }
          >
            Assignments
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ height: "calc(100vh - 64px)" }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="*" element={<Navigate to="/shipments" replace />} />
          </Routes>
        </Suspense>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
