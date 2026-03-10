// src/layouts/MainLayout.tsx
/**
 * 🧱 Layout principal
 * Solo te dejo completo para evitar choques
 */

import React, { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LogoutIcon from "@mui/icons-material/Logout";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import QrCode2Icon from "@mui/icons-material/QrCode2";

import { logout } from "../services/auth.service";
import { getUser } from "../store/auth.store";

const drawerWidth = 270;

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getUser();

  const menuItems = useMemo(
    () => [
      { label: "Dashboard", to: "/dashboard", icon: <DashboardIcon /> },
      { label: "Reuniones", to: "/meetings", icon: <EventNoteIcon /> },
    ],
    []
  );

  const handleToggleDrawer = () => setMobileOpen((v) => !v);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2.2, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
          Reuniones & Auditoría
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Evidencias · Asistencias · QR · Impacto 📸✅🔳
        </Typography>

        {user ? (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {user.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{user.username}
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Divider />

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              my: 0.5,
              borderRadius: 2,
              "&.active": {
                bgcolor: "rgba(108,56,65,0.10)",
                color: "primary.main",
                "& .MuiListItemIcon-root": { color: "primary.main" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flex: 1 }} />

      <Divider />

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ borderRadius: 2 }}
        >
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box className="app-shell">
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton onClick={handleToggleDrawer} edge="start" aria-label="menu">
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>
            Control de Reuniones 🧭
          </Typography>

          <IconButton
            aria-label="qr"
            onClick={() => navigate("/meetings/new")}
            title="Alta de reunión + QR"
          >
            <QrCode2Icon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box className="app-content">
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                borderRight: "1px solid rgba(0,0,0,0.08)",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleToggleDrawer}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        <Box component="main" sx={{ flex: 1 }}>
          <div className="page-wrapper">
            <Outlet />
          </div>
        </Box>
      </Box>
    </Box>
  );
}