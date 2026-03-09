// src/pages/auth/LoginPage.tsx
/**
 * 🔑 Login real con JWT
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

      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo iniciar sesión ❌";

      setErrorMsg(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {state.from && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Para acceder a <strong>{state.from}</strong>, inicia sesión 🔐
        </Alert>
      )}

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <TextField
        label="Usuario"
        placeholder="Ej: gsvopb"
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

      <Typography variant="caption" color="text.secondary">
        🔐 Acceso protegido con JWT
      </Typography>
    </Box>
  );
}