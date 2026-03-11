// src/layouts/MainLayout.tsx
/**
 * 🧭 MainLayout
 * ---------------------------------------------------
 * ✅ Menú responsive real
 * ✅ Móvil: drawer temporal con botón abrir/cerrar 🍔
 * ✅ Desktop: drawer expandible/colapsable
 * ✅ Modo mini con íconos + tooltip
 * ✅ Sin scroll raro para llegar a cerrar sesión
 * ✅ Más espacio para el contenido cuando el menú se colapsa
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
  Tooltip,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LogoutIcon from "@mui/icons-material/Logout";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import ConfirmDialog from "../components/ui/ConfirmDialog";
import { logout } from "../services/auth.service";
import { getUser } from "../store/auth.store";

const drawerWidth = 270;
const drawerCollapsedWidth = 82;
const appBarHeight = 64;

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const user = getUser();

  const menuItems = useMemo(
    () => [
      { label: "Dashboard", to: "/dashboard", icon: <DashboardIcon /> },
      { label: "Reuniones", to: "/meetings", icon: <EventNoteIcon /> },
    ],
    []
  );

  const currentDrawerWidth = desktopCollapsed ? drawerCollapsedWidth : drawerWidth;

  const handleToggleMobileDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleToggleDesktopDrawer = () => {
    setDesktopCollapsed((prev) => !prev);
  };

  const handleGlobalMenuClick = () => {
    if (isMobile) {
      handleToggleMobileDrawer();
      return;
    }

    handleToggleDesktopDrawer();
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* =========================================================
       * 🏷️ Header del menú
       * ========================================================= */}
      <Box
        sx={{
          px: desktopCollapsed && !isMobile ? 1.2 : 2.2,
          py: 2,
          minHeight: appBarHeight + 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {desktopCollapsed && !isMobile ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Tooltip title="Expandir menú 👉" placement="right">
              <IconButton onClick={handleToggleDesktopDrawer} color="primary">
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>

            <QrCode2Icon color="primary" />
          </Box>
        ) : (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                  Reuniones & Auditoría
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Evidencias · Asistencias · QR · Impacto 📸✅🔳
                </Typography>
              </Box>

              {/* ✅ botón para cerrar/colapsar */}
              <Tooltip
                title={
                  isMobile ? "Cerrar menú ✖️" : desktopCollapsed ? "Expandir menú 👉" : "Colapsar menú 👈"
                }
              >
                <IconButton
                  onClick={isMobile ? handleToggleMobileDrawer : handleToggleDesktopDrawer}
                  color="primary"
                >
                  {isMobile ? <ChevronLeftIcon /> : <ChevronLeftIcon />}
                </IconButton>
              </Tooltip>
            </Stack>

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
          </>
        )}
      </Box>

      <Divider />

      {/* =========================================================
       * 📚 Navegación
       * ========================================================= */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <List
          sx={{
            px: desktopCollapsed && !isMobile ? 1 : 1.2,
            py: 1,
          }}
        >
          {menuItems.map((item) => {
            const content = (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  my: 0.5,
                  minHeight: 48,
                  justifyContent: desktopCollapsed && !isMobile ? "center" : "flex-start",
                  px: desktopCollapsed && !isMobile ? 1.5 : 1.6,
                  borderRadius: 2,
                  "&.active": {
                    bgcolor: "rgba(108,56,65,0.10)",
                    color: "primary.main",
                    "& .MuiListItemIcon-root": { color: "primary.main" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: desktopCollapsed && !isMobile ? "auto" : 40,
                    mr: desktopCollapsed && !isMobile ? 0 : 0.5,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {!(desktopCollapsed && !isMobile) ? (
                  <ListItemText primary={item.label} />
                ) : null}
              </ListItemButton>
            );

            if (desktopCollapsed && !isMobile) {
              return (
                <Tooltip key={item.to} title={item.label} placement="right">
                  {content}
                </Tooltip>
              );
            }

            return content;
          })}
        </List>
      </Box>

      <Divider />

      {/* =========================================================
       * 🚪 Footer del menú
       * ========================================================= */}
      <Box
        sx={{
          p: desktopCollapsed && !isMobile ? 1.2 : 2,
        }}
      >
        {desktopCollapsed && !isMobile ? (
          <Tooltip title="Cerrar sesión 🚪" placement="right">
            <IconButton
              color="primary"
              onClick={() => setConfirmLogoutOpen(true)}
              sx={{
                width: "100%",
                border: "1px solid rgba(108,56,65,0.18)",
                borderRadius: 2,
                py: 1.2,
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={() => setConfirmLogoutOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Cerrar sesión
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      className="app-shell"
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",
      }}
    >
      {/* =========================================================
       * 🔝 Top bar
       * ========================================================= */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "rgba(0,0,0,0.08)",
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: `${appBarHeight}px !important` }}>
          {/* 🍔 Siempre visible */}
          <IconButton onClick={handleGlobalMenuClick} edge="start" aria-label="menu">
            <MenuIcon />
          </IconButton>

          <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>
            Control de Reuniones 🧭
          </Typography>

          <Tooltip title="Alta de reunión + QR 🔳">
            <IconButton
              aria-label="qr"
              onClick={() => navigate("/meetings/new")}
            >
              <QrCode2Icon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* =========================================================
       * 🧱 Layout principal
       * ========================================================= */}
      <Box
        className="app-content"
        sx={{
          display: "flex",
          minHeight: `calc(100dvh - ${appBarHeight}px)`,
        }}
      >
        {/* =========================
         * 💻 Desktop drawer
         * ========================= */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            open
            sx={{
              width: currentDrawerWidth,
              flexShrink: 0,
              transition: "width 0.25s ease",
              "& .MuiDrawer-paper": {
                width: currentDrawerWidth,
                boxSizing: "border-box",
                borderRight: "1px solid rgba(0,0,0,0.08)",
                overflow: "hidden",
                transition: "width 0.25s ease",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* =========================
         * 📱 Mobile drawer
         * ========================= */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleToggleMobileDrawer}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                maxWidth: "84vw",
                boxSizing: "border-box",
                overflow: "hidden",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* =========================
         * 📄 Main content
         * ========================= */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            transition: "all 0.25s ease",
          }}
        >
          <Box
            className="page-wrapper"
            sx={{
              p: { xs: 1.5, sm: 2, md: 2.5 },
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Cerrar sesión"
        description="¿Deseas cerrar sesión? Se limpiará el localStorage de la sesión actual. 🔐"
        confirmText="Sí, cerrar sesión 🚪"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onClose={() => setConfirmLogoutOpen(false)}
      />
    </Box>
  );
}