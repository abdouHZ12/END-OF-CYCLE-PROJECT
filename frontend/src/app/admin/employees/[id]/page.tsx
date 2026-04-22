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

  useEffect(() => {
    fetchAll();
  }, [id]);

  async function fetchAll() {
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
  }

  async function handleSaveInfo() {
    setError(null);
    setSuccess(null);
    if (!name.trim()) return setError("Name is required.");
    if (!username.trim()) return setError("Username is required.");
    if (!email.trim()) return setError("Email is required.");
    if (!structureId) return setError("Department is required.");
    if (selectedRoleIds.length === 0) return setError("At least one role is required.");

    setIsSaving(true);
    try {
      await apiPut(`/api/admin/employees/${id}`, {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        structureId: parseInt(structureId),
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
      <Box sx={{ flexGrow: 1, mt: "70px", backgroundColor: "rgb(10, 22, 40)", padding: "36px" }}>
        <Typography sx={{ color: "gray", textAlign: "center", mt: 6 }}>
          Loading employee...
        </Typography>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ flexGrow: 1, mt: "70px", backgroundColor: "rgb(10, 22, 40)", padding: "36px" }}>
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
        backgroundColor: "rgb(10, 22, 40)",
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
          sx={{ color: "lightgray", textTransform: "none", "&:hover": { color: "#ffa500" } }}
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
              bgcolor: "darkorange",
              color: "#222",
              width: 56,
              height: 56,
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#fff" }}>
              {employee.name}
            </Typography>
            <Typography sx={{ color: "gray" }}>@{employee.username}</Typography>
          </Box>
        </Box>

        <IconButton
          onClick={() => setDeleteDialog(true)}
          sx={{
            color: "#f44336",
            border: "1px solid rgba(244,67,54,0.3)",
            borderRadius: 2,
            "&:hover": { bgcolor: "rgba(244,67,54,0.1)" },
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
            bgcolor: "rgba(244,67,54,0.1)",
            color: "#f44336",
            "& .MuiAlert-icon": { color: "#f44336" },
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
            bgcolor: "rgba(76,175,80,0.1)",
            color: "#4caf50",
            "& .MuiAlert-icon": { color: "#4caf50" },
          }}
        >
          {success}
        </Alert>
      )}

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
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Full Name"
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

        <Divider sx={{ bgcolor: "rgba(255,255,255,0.08)", my: 4 }} />

        <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 3 }}>
          Assignment
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel>Department</InputLabel>
              <Select
                value={structureId}
                label="Department"
                onChange={(e) => setStructureId(e.target.value)}
                MenuProps={{ sx: menuSx }}
              >
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
                {allRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Checkbox
                      checked={selectedRoleIds.includes(role.id)}
                      sx={{ color: "lightgray", "&.Mui-checked": { color: "#ffa500" } }}
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

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button
            onClick={() => router.push("/admin/employees")}
            sx={{ color: "lightgray", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={handleSaveInfo}
            disabled={isSaving}
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
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>

      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        slotProps={{
          paper: {
            sx: { backgroundColor: "#1a2942", color: "#fff", borderRadius: 2 },
          },
        }}
      >
        <DialogTitle sx={{ color: "#fff" }}>Delete Employee</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "lightgray" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "#fff" }}>{employee.name}</strong> (@{employee.username})?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
            sx={{ color: "lightgray", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="contained"
            sx={{
              backgroundColor: "#f44336",
              textTransform: "none",
              "&:hover": { backgroundColor: "#d32f2f" },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}