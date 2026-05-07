"use client";

import { useCallback, useEffect, useState } from "react";
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
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { apiGet, apiPost, apiPut, apiDelete, type ApiError } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";


type Role = { id: number; name: string; type: string };
type Structure = { id: number; name: string };
type EmployeeRole = { role: Role };

type Employee = {
  id: number;
  name: string;
  username: string;
  email: string;
  structure: Structure;
  roles: EmployeeRole[];
};


const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "var(--naftal-text-primary)",
    borderRadius: "10px",
    "& fieldset": { borderColor: "var(--naftal-border-subtle)" },
    "&:hover fieldset": { borderColor: "var(--naftal-brand)" },
    "&.Mui-focused fieldset": { borderColor: "var(--naftal-brand)" },
  },
  "& .MuiInputLabel-root": { color: "var(--naftal-text-secondary)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--naftal-brand)" },
  "& .MuiSvgIcon-root": { color: "var(--naftal-text-secondary)" },
};

const menuSx = {
  "& .MuiPaper-root": { bgcolor: "var(--naftal-surface-2)", color: "var(--naftal-text-primary)" },
  "& .MuiMenuItem-root:hover": { bgcolor: "var(--naftal-brand-muted)" },
};

const roleTypeLabel: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  WORKER: "Worker",
  AGENT: "Agent",
};

const roleTypeColor: Record<string, string> = {
  ADMIN: "var(--naftal-error)",
  MANAGER: "var(--naftal-brand)",
  WORKER: "var(--naftal-success)",
  AGENT: "var(--naftal-info)",
};


export default function ManageEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [structureId, setStructureId] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [emp, roles, structs] = await Promise.all([
        apiGet<Employee>(`/api/admin/employees/${id}`),
        apiGet<Role[]>("/api/admin/roles"),
        apiGet<Structure[]>("/api/admin/structures"),
      ]);
      setEmployee(emp);
      setAllRoles(roles);
      setStructures(structs);
      setName(emp.name);
      setUsername(emp.username);
      setEmail(emp.email);
      setStructureId(String(emp.structure?.id ?? ""));
      setSelectedRoleIds(emp.roles.map((r) => r.role.id));
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to load employee.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  async function handleSaveInfo() {
    setError(null);
    setSuccess(null);
    if (!name.trim()) return setError("Name is required.");
    if (!username.trim()) return setError("Username is required.");
    if (!email.trim()) return setError("Email is required.");
    if (selectedRoleIds.length === 0) return setError("At least one role is required.");

    setIsSaving(true);
    try {
      console.log('PUT payload:', {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        ...(structureId ? { structureId: parseInt(structureId) } : { structureId: null }),
      });
      await apiPut(`/api/admin/employees/${id}`, {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        ...(structureId ? { structureId: parseInt(structureId) } : { structureId: null }),
      });

      const currentIds = employee!.roles.map((r) => r.role.id);
      const toAssign = selectedRoleIds.filter((rid) => !currentIds.includes(rid));
      const toRevoke = currentIds.filter((rid) => !selectedRoleIds.includes(rid));

      await Promise.all([
        ...toAssign.map((roleId) =>
          apiPost(`/api/admin/employees/${id}/roles`, { roleId })
        ),
        ...toRevoke.map((roleId) =>
          apiDelete(`/api/admin/employees/${id}/roles/${roleId}`)
        ),
      ]);

      await fetchAll();
      setSuccess("Employee updated successfully.");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to update employee.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await apiDelete(`/api/admin/employees/${id}`);
      router.push("/admin/employees");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to delete employee.");
      setDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <Box sx={{ flexGrow: 1, mt: "70px", backgroundColor: "var(--naftal-bg)", padding: "36px" }}>
        <Typography sx={{ color: "var(--naftal-text-muted)", textAlign: "center", mt: 6 }}>
          Loading employee...
        </Typography>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ flexGrow: 1, mt: "70px", backgroundColor: "var(--naftal-bg)", padding: "36px" }}>
        <Typography sx={{ color: "red", textAlign: "center", mt: 6 }}>
          Employee not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "70px",
        backgroundColor: "var(--naftal-bg)",
        padding: "36px",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Back */}
      <Box sx={{ mb: 1 }}>
        <Button
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => router.push("/admin/employees")}
          sx={{ color: "var(--naftal-text-secondary)", textTransform: "none", "&:hover": { color: "var(--naftal-brand)" } }}
        >
          Back
        </Button>
      </Box>

      {/* Title row */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "var(--naftal-brand-strong)",
              color: "var(--naftal-on-brand)",
              width: 56,
              height: 56,
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--naftal-text-primary)" }}>
              {employee.name}
            </Typography>
            <Typography sx={{ color: "var(--naftal-text-muted)" }}>@{employee.username}</Typography>
          </Box>
        </Box>

        <IconButton
          onClick={() => setDeleteDialog(true)}
          sx={{
            color: "var(--naftal-error)",
            border: "1px solid var(--naftal-error-muted)",
            borderRadius: 2,
            "&:hover": { bgcolor: "var(--naftal-error-muted)" },
          }}
        >
          <DeleteOutlinedIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            mb: 3,
            bgcolor: "var(--naftal-error-muted)",
            color: "var(--naftal-error)",
            "& .MuiAlert-icon": { color: "var(--naftal-error)" },
          }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{
            mb: 3,
            bgcolor: "var(--naftal-success-muted)",
            color: "var(--naftal-success)",
            "& .MuiAlert-icon": { color: "var(--naftal-success)" },
          }}
        >
          {success}
        </Alert>
      )}

      <Box
        sx={{
          backgroundColor: "var(--naftal-surface-2)",
          borderRadius: 3,
          p: 4,
          border: "1px solid var(--naftal-border-subtle)",
        }}
      >
        <Typography variant="h6" sx={{ color: "var(--naftal-text-primary)", fontWeight: "bold", mb: 3 }}>
          Personal Information
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Nom Complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={fieldSx}
            />
          </Grid>
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
        </Grid>

        <Divider sx={{ bgcolor: "var(--naftal-border-subtle)", my: 4 }} />


        <Typography variant="h6" sx={{ color: "var(--naftal-text-primary)", fontWeight: "bold", mb: 3 }}>
          Assignment
        </Typography>

        <Grid container spacing={3}>
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
                  <Typography sx={{ color: "var(--naftal-text-secondary)", fontStyle: "italic" }}>
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
                    {(selected as number[]).map((rid) => {
                      const role = allRoles.find((r) => r.id === rid);
                      return (
                        <Chip
                          key={rid}
                          label={role ? roleTypeLabel[role.type] ?? role.name : rid}
                          size="small"
                          sx={{
                            backgroundColor: role ? `${roleTypeColor[role.type]}22` : "transparent",
                            color: role ? roleTypeColor[role.type] : "var(--naftal-text-primary)",
                            border: `1px solid ${role ? roleTypeColor[role.type] : "var(--naftal-text-primary)"}`,
                            borderRadius: "8px",
                            fontWeight: "bold",
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {allRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Checkbox
                      checked={selectedRoleIds.includes(role.id)}
                      sx={{ color: "var(--naftal-text-secondary)", "&.Mui-checked": { color: "var(--naftal-brand)" } }}
                    />
                    <ListItemText
                      primary={roleTypeLabel[role.type] ?? role.name}
                      sx={{ color: roleTypeColor[role.type] ?? "var(--naftal-text-primary)" }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button
            onClick={() => router.push("/admin/employees")}
            sx={{ color: "var(--naftal-text-secondary)", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={handleSaveInfo}
            disabled={isSaving}
            sx={{
              backgroundColor: "var(--naftal-brand)",
              color: "black",
              textTransform: "none",
              fontWeight: "bold",
              borderRadius: 2,
              px: 4,
              "&:hover": { backgroundColor: "var(--naftal-brand-strong)" },
            }}
          >
            {isSaving ? "Saving..." : "Enregistrer les Modifications"}
          </Button>
        </Box>
      </Box>

      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        slotProps={{
          paper: {
            sx: { backgroundColor: "var(--naftal-surface-2)", color: "var(--naftal-text-primary)", borderRadius: 2 },
          },
        }}
      >
        <DialogTitle sx={{ color: "var(--naftal-text-primary)" }}>Delete Employee</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "var(--naftal-text-secondary)" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "var(--naftal-text-primary)" }}>{employee.name}</strong> (@{employee.username})?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
            sx={{ color: "var(--naftal-text-secondary)", textTransform: "none" }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="contained"
            sx={{
              backgroundColor: "var(--naftal-error)",
              textTransform: "none",
              "&:hover": { backgroundColor: "var(--naftal-error)" },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}