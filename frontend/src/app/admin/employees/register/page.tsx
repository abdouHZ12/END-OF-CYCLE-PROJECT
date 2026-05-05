"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import { apiGet, apiPost, type ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

type Role = { id: number; name: string; type: string };
type Structure = { id: number; name: string };

// ── Shared styles ─────────────────────────────────────────────────────────────

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: "10px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
    "&:hover fieldset": { borderColor: "#ffa500" },
    "&.Mui-focused fieldset": { borderColor: "#ffa500" },
  },
  "& .MuiInputLabel-root": { color: "lightgray" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ffa500" },
  "& .MuiSvgIcon-root": { color: "lightgray" },
};

const menuSx = {
  "& .MuiPaper-root": { bgcolor: "#1a2942", color: "#fff" },
  "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,165,0,0.1)" },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RegisterEmployeePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [structureId, setStructureId] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const router = useRouter();

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [r, s] = await Promise.all([
          apiGet<Role[]>("/api/admin/roles"),
          apiGet<Structure[]>("/api/admin/structures"),
        ]);
        setRoles(r);
        setStructures(s);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setError(apiErr.message || "Failed to load form options.");
      }
    }
    fetchOptions();
  }, []);

  async function handleSubmit() {
    setError(null);
    setSuccess(false);

    // basic validation
    if (!name.trim()) return setError("Name is required.");
    if (!username.trim()) return setError("Username is required.");
    if (!email.trim()) return setError("Email is required.");
    if (!password.trim()) return setError("Password is required.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (selectedRoleIds.length === 0) return setError("At least one role is required.");

    setIsLoading(true);
    try {
      await apiPost("/api/admin/employees", {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        ...(structureId ? { structureId: parseInt(structureId) } : {}),
        roleIds: selectedRoleIds,
      });
      setSuccess(true);
      // reset form
      setName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setStructureId("");
      setSelectedRoleIds([]);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to register employee.");
    } finally {
      setIsLoading(false);
    }
  }

  const roleTypeLabel: Record<string, string> = {
    ADMIN: "Admin",
    MANAGER: "Manager",
    WORKER: "Worker",
    AGENT: "Agent",
  };

  const roleTypeColor: Record<string, string> = {
    ADMIN: "#f44336",
    MANAGER: "#ffa500",
    WORKER: "#4caf50",
    AGENT: "#7fb3ff",
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "70px",
        backgroundColor: "rgb(10, 22, 40)",
        padding: "36px",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Button
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => router.push("/admin/employees")}
          sx={{ color: "lightgray", textTransform: "none", "&:hover": { color: "#ffa500" } }}
        >
          Back
        </Button>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#fff" }}>
        Enregistrer Employee
      </Typography>
      <Typography sx={{ color: "gray", fontWeight: "bold", mb: 4 }}>
        Creer un nouveau compte employee
      </Typography>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 3, bgcolor: "rgba(244,67,54,0.1)", color: "#f44336",
            "& .MuiAlert-icon": { color: "#f44336" } }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(false)}
          sx={{ mb: 3, bgcolor: "rgba(76,175,80,0.1)", color: "#4caf50",
            "& .MuiAlert-icon": { color: "#4caf50" } }}
        >
          Employee registered successfully!{" "}
          <Button
            size="small"
            sx={{ color: "#4caf50", textTransform: "none", p: 0, ml: 1 }}
            onClick={() => router.push("/admin/employees")}
          >
            View all employees →
          </Button>
        </Alert>
      )}

      {/* Form */}
      <Box
        sx={{
          backgroundColor: "#1a2942",
          borderRadius: 3,
          p: 4,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 3 }}>
          Personal Information
        </Typography>

        <Grid container spacing={3}>
          {/* Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Nom Complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={fieldSx}
            />
          </Grid>

          {/* Username */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={fieldSx}
            />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={fieldSx}
            />
          </Grid>

          {/* Password */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Mot de Passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={fieldSx}
              helperText="Minimum 8 characters"
              slotProps={{
                formHelperText: { sx: { color: "gray" } },
              }}
            />
          </Grid>
        </Grid>

        {/* Divider */}
        <Box
          sx={{ width: "100%", height: "1px", bgcolor: "rgba(255,255,255,0.08)", my: 4 }}
        />

        <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 3 }}>
          Assignement
        </Typography>

        <Grid container spacing={3}>
          {/* Department */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel>Departement</InputLabel>
              <Select
                  value={structureId}
                  label="Department"
                  onChange={(e) => setStructureId(e.target.value)}
                  MenuProps={{ sx: menuSx }}
                >
                  <MenuItem value="">
                    <Typography sx={{ color: "lightgray", fontStyle: "italic" }}>
                      No department
                    </Typography>
                  </MenuItem>
                  {structures.map((s) => (
                    <MenuItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>
          </Grid>

          {/* Roles — multi select */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={selectedRoleIds}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedRoleIds(typeof val === "string" ? [] : (val as number[]));
                }}
                input={<OutlinedInput label="Roles" />}
                MenuProps={{ sx: menuSx }}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as number[]).map((id) => {
                      const role = roles.find((r) => r.id === id);
                      return (
                        <Chip
                          key={id}
                          label={role ? roleTypeLabel[role.type] ?? role.name : id}
                          size="small"
                          sx={{
                            backgroundColor: role
                              ? `${roleTypeColor[role.type]}22`
                              : "transparent",
                            color: role ? roleTypeColor[role.type] : "#fff",
                            border: `1px solid ${role ? roleTypeColor[role.type] : "#fff"}`,
                            borderRadius: "8px",
                            fontWeight: "bold",
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Checkbox
                      checked={selectedRoleIds.includes(role.id)}
                      sx={{
                        color: "lightgray",
                        "&.Mui-checked": { color: "#ffa500" },
                      }}
                    />
                    <ListItemText
                      primary={roleTypeLabel[role.type] ?? role.name}
                      sx={{ color: roleTypeColor[role.type] ?? "#fff" }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Submit */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button
            onClick={() => router.push("/admin/employees")}
            sx={{ color: "lightgray", textTransform: "none" }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddOutlinedIcon />}
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{
              backgroundColor: "orange",
              color: "black",
              textTransform: "none",
              fontWeight: "bold",
              borderRadius: 2,
              px: 4,
              "&:hover": { backgroundColor: "darkorange" },
            }}
          >
            {isLoading ? "Registering..." : "Enregistrer Employee"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}