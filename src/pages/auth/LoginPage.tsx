// src/pages/auth/LoginPage.tsx
/**
 * 🔑 Login Page
 * - Sin registro (solo credenciales dadas) ✅
 * - UX profesional: loading, error, redirección 🔁
 */

import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { login } from "../../services/auth.service";

type LocationState = {
  from?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state || {}) as LocationState;
  const redirectTo = useMemo(() => state.from || "/dashboard", [state.from]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!canSubmit) {
      setErrorMsg("Completa usuario y contraseña ✍️");
      return;
    }

    try {
      setLoading(true);

      await login({
        username: username.trim(),
        password,
      });

      // ✅ Redirige a donde intentaba entrar
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      // ❌ Mensaje humano
      const msg =
        err?.message ||
        "No se pudo iniciar sesión. Verifica tus credenciales y conexión.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* 🧠 Mensaje si viene de ruta protegida */}
      {state.from && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Para acceder a <strong>{state.from}</strong>, inicia sesión 🔐
        </Alert>
      )}

      {/* ❌ Error */}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* 👤 Usuario */}
      <TextField
        label="Usuario"
        placeholder="Ej: admin"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* 🔒 Password */}
      <TextField
        label="Contraseña"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPass ? "text" : "password"}
        autoComplete="current-password"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPass((v) => !v)}
                edge="end"
                aria-label="toggle password visibility"
              >
                {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* ✅ Botón */}
      <Button
        type="submit"
        variant="contained"
        disabled={!canSubmit}
        fullWidth
        sx={{ py: 1.2, borderRadius: 2 }}
      >
        {loading ? "Ingresando... ⏳" : "Iniciar sesión 🔑"}
      </Button>

      <Divider sx={{ my: 2.5 }} />

      {/* 🧪 Credenciales mock (solo para desarrollo) */}
      <Typography variant="caption" color="text.secondary">
        🧪 Modo Mock (desarrollo):
        <br />
        • admin / admin123
        <br />
        • organizador / org123
      </Typography>
    </Box>
  );
}
