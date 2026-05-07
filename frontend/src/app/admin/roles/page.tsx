"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Avatar,
  Stack,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import { apiGet, apiPost, apiPut, apiDelete, type ApiError } from "@/lib/api";
import { useMediaQuery, useTheme } from "@mui/material";

// ── Types ─────────────────────────────────────────────────────────────────────

type Role = {
  id: number;
  name: string;
  type: string;
  permissions: string;
};

type Employee = {
  id: number;
  roles: { role: { id: number; type: string } }[];
};

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_TYPES = ["ADMIN", "MANAGER", "WORKER", "AGENT"] as const;

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

const roleTypeBg: Record<string, string> = {
  ADMIN: "var(--naftal-error-muted)",
  MANAGER: "var(--naftal-brand-muted)",
  WORKER: "var(--naftal-success-muted)",
  AGENT: "var(--naftal-info-muted)",
};

const roleTypeIcon: Record<string, React.ReactNode> = {
  ADMIN: <AdminPanelSettingsOutlinedIcon />,
  MANAGER: <ManageAccountsOutlinedIcon />,
  WORKER: <EngineeringOutlinedIcon />,
  AGENT: <SupportAgentOutlinedIcon />,
};

// ── Shared styles ─────────────────────────────────────────────────────────────

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

const dialogPaperSx = {
  backgroundColor: "var(--naftal-surface-2)",
  color: "var(--naftal-text-primary)",
  borderRadius: 2,
  minWidth: 400,
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: number | string;
  label: string;
}) {
  return (
    <Card
      sx={{
        bgcolor: "var(--naftal-surface-2)",
        color: "var(--naftal-text-primary)",
        borderRadius: 2,
        boxShadow: "none",
        p: 2,
        width: "100%",
        border: "0.1px solid transparent",
        transition: "transform 0.1s",
        "&:hover": { borderColor: "var(--naftal-brand-strong)", transform: "scale(1.01)" },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Avatar sx={{ bgcolor: iconBg, width: 48, height: 48 }}>
            <Box sx={{ color: iconColor, display: "flex" }}>{icon}</Box>
          </Avatar>
        </Stack>
        <Typography variant="h3" sx={{ mt: 2, fontWeight: 700, color: "var(--naftal-text-primary)", fontSize: 34 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--naftal-text-muted)" }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ── Role Chip ─────────────────────────────────────────────────────────────────

function RoleChip({ type }: { type: string }) {
  return (
    <Chip
      label={roleTypeLabel[type] ?? type}
      size="small"
      sx={{
        backgroundColor: roleTypeBg[type] ?? "transparent",
        color: roleTypeColor[type] ?? "var(--naftal-text-primary)",
        fontWeight: "bold",
        border: `1px solid ${roleTypeColor[type] ?? "var(--naftal-text-primary)"}`,
        borderRadius: "8px",
      }}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createType, setCreateType] = useState("");
  const [createPerms, setCreatePerms] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // ── Edit dialog
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [editName, setEditName] = useState("");
  const [editPerms, setEditPerms] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ── Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSmallScreen = useMediaQuery(useTheme().breakpoints.down("sm"));

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const [r, e] = await Promise.all([
        apiGet<Role[]>("/api/admin/roles"),
        apiGet<Employee[]>("/api/admin/employees"),
      ]);
      setRoles(r);
      setEmployees(e);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }

  // count employees per role id
  function empCount(roleId: number) {
    return employees.filter((e) => e.roles.some((r) => r.role.id === roleId)).length;
  }

  // count roles per type
  function typeCount(type: string) {
    return roles.filter((r) => r.type === type).length;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  function openCreate() {
    setCreateName("");
    setCreateType("");
    setCreatePerms("");
    setError(null);
    setCreateOpen(true);
  }

  async function handleCreate() {
    if (!createName.trim()) return setError("Name is required.");
    if (!createType) return setError("Type is required.");
    setIsCreating(true);
    setError(null);
    try {
      await apiPost("/api/admin/roles", {
        name: createName.trim(),
        type: createType,
        permissions: createPerms.trim(),
      });
      setSuccess("Role created successfully.");
      setCreateOpen(false);
      await fetchData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to create role.");
    } finally {
      setIsCreating(false);
    }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────

  function openEdit(role: Role) {
    setEditTarget(role);
    setEditName(role.name);
    setEditPerms(role.permissions);
    setError(null);
  }

  async function handleSave() {
    if (!editTarget) return;
    if (!editName.trim()) return setError("Name is required.");
    setIsSaving(true);
    setError(null);
    try {
      await apiPut(`/api/admin/roles/${editTarget.id}`, {
        name: editName.trim(),
        permissions: editPerms.trim(),
      });
      setSuccess("Role updated successfully.");
      setEditTarget(null);
      await fetchData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to update role.");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await apiDelete(`/api/admin/roles/${deleteTarget.id}`);
      setSuccess("Role deleted successfully.");
      setDeleteTarget(null);
      await fetchData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const msg = apiErr.message || "Failed to delete role.";
      setError(
        msg === "Cannot delete a role that is assigned to employees"
          ? `Cannot delete "${deleteTarget.name}" — it is assigned to ${empCount(deleteTarget.id)} employee(s).`
          : msg
      );
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

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
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--naftal-text-primary)" }}>
            Roles
          </Typography>

          <Typography sx={{ color: "var(--naftal-text-muted)", fontWeight: "bold", mt: 0.5 }}>
            {roles.length} role{roles.length !== 1 ? "s" : ""} defined
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={openCreate}
          sx={{
            backgroundColor: "var(--naftal-brand)",
            color: "black",
            textTransform: "none",
            borderRadius: 2,
            fontWeight: "bold",
            "&:hover": { backgroundColor: "var(--naftal-brand-strong)" },
          }}
        >
          Nouveau Role
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 3, mt: 2, bgcolor: "var(--naftal-error-muted)", color: "var(--naftal-error)", "& .MuiAlert-icon": { color: "var(--naftal-error)" } }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 3, mt: 2, bgcolor: "var(--naftal-success-muted)", color: "var(--naftal-success)", "& .MuiAlert-icon": { color: "var(--naftal-success)" } }}
        >
          {success}
        </Alert>
      )}

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }} columns={{ sm: 8, md: 12, lg: 16 }}>
        {ROLE_TYPES.map((type) => (
          <Grid size={{ sm: 4, md: 3, lg: 4 }} key={type}>
            <StatCard
              icon={roleTypeIcon[type]}
              iconBg={roleTypeBg[type]}
              iconColor={roleTypeColor[type]}
              value={typeCount(type)}
              label={`${roleTypeLabel[type]} Roles`}
            />
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      {isLoading ? (
        <Typography sx={{ color: "var(--naftal-text-muted)", textAlign: "center", mt: 6 }}>
          Loading roles...
        </Typography>
      ) : roles.length === 0 ? (
        <Box sx={{ backgroundColor: "var(--naftal-surface-2)", borderRadius: "12px", p: 4, textAlign: "center" }}>
          <Typography sx={{ color: "var(--naftal-text-secondary)", fontSize: "20px" }}>No roles defined yet</Typography>
        </Box>
      ) : !isSmallScreen ? (
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "var(--naftal-surface-2)",
            borderRadius: 2,
            boxShadow: "var(--naftal-shadow-strong)",
            border: "1px solid var(--naftal-border-subtle)",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "var(--naftal-surface-0)" }}>
              <TableRow>

                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>ID</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Name</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Type</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Permissions</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Employees</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow
                  key={role.id}
                  sx={{ boxShadow: "0px 0px 1px 0px var(--naftal-border)", "&:hover": { backgroundColor: "var(--naftal-surface-2-hover)" } }}
                >
                  <TableCell sx={{ color: "var(--naftal-brand)", fontWeight: "bold", border: "none" }}>
                    {role.id}
                  </TableCell>
                  <TableCell sx={{ color: "var(--naftal-text-primary)", fontWeight: "bold", border: "none" }}>
                    {role.name}
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <RoleChip type={role.type} />
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "var(--naftal-text-secondary)",
                      border: "none",
                      maxWidth: 260,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {role.permissions || "—"}
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <Chip
                      label={`${empCount(role.id)} employee${empCount(role.id) !== 1 ? "s" : ""}`}
                      size="small"
                      sx={{
                        backgroundColor: "var(--naftal-info-muted)",
                        color: "var(--naftal-info)",
                        border: "1px solid var(--naftal-info)",
                        borderRadius: "8px",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ border: "none" }} align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(role)}
                      sx={{ color: "var(--naftal-info)", "&:hover": { color: "var(--naftal-brand)" } }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(role)}
                      sx={{ color: "var(--naftal-error)", "&:hover": { color: "var(--naftal-error)" }, ml: 1 }}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // Mobile cards
        <Grid container spacing={2}>
          {roles.map((role) => (
            <Grid size={{ xs: 12 }} key={role.id}>
              <Card sx={{ backgroundColor: "var(--naftal-surface-2)", color: "var(--naftal-text-primary)", borderRadius: 2, p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", color: "var(--naftal-brand)" }}>#{role.id}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>{role.name}</Typography>
                    <Box sx={{ mt: 0.5 }}><RoleChip type={role.type} /></Box>
                    <Typography variant="body2" sx={{ color: "var(--naftal-text-secondary)", mt: 0.5 }}>
                      {role.permissions || "No permissions set"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--naftal-info)", mt: 0.5 }}>
                      {empCount(role.id)} employee{empCount(role.id) !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => openEdit(role)} sx={{ color: "var(--naftal-info)" }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(role)} sx={{ color: "var(--naftal-error)" }}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Create Dialog ── */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        slotProps={{ paper: { sx: dialogPaperSx } }}
      >
        <DialogTitle sx={{ color: "var(--naftal-text-primary)" }}>New Role</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          <TextField
            fullWidth
            label="Role Name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            sx={fieldSx}
          />
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Type</InputLabel>
            <Select
              value={createType}
              label="Type"
              onChange={(e) => setCreateType(e.target.value)}
              MenuProps={{ sx: menuSx }}
            >
              {ROLE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ color: roleTypeColor[t], display: "flex" }}>{roleTypeIcon[t]}</Box>
                    <Typography sx={{ color: roleTypeColor[t], fontWeight: "bold" }}>
                      {roleTypeLabel[t]}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Permissions"
            value={createPerms}
            onChange={(e) => setCreatePerms(e.target.value)}
            placeholder="e.g. read:documents, approve:requests"
            sx={fieldSx}
            helperText="Optional — describe what this role can do"
            slotProps={{ formHelperText: { sx: { color: "var(--naftal-text-muted)" } } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>

          <Button onClick={() => setCreateOpen(false)} sx={{ color: "var(--naftal-text-secondary)", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={isCreating}
            sx={{
              backgroundColor: "var(--naftal-brand)", color: "black", textTransform: "none",
              fontWeight: "bold", "&:hover": { backgroundColor: "var(--naftal-brand-strong)" },
            }}
          >
            {isCreating ? "Creating..." : "Create Role"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        slotProps={{ paper: { sx: dialogPaperSx } }}
      >
        <DialogTitle sx={{ color: "var(--naftal-text-primary)" }}>Edit Role</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          {editTarget && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography sx={{ color: "var(--naftal-text-secondary)", fontSize: 14 }}>Type:</Typography>
              <RoleChip type={editTarget.type} />

              <Typography sx={{ color: "var(--naftal-text-muted)", fontSize: 12 }}>(cannot be changed)</Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Nom du Role"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={fieldSx}
          />
          <TextField
            fullWidth
            label="Permissions"
            value={editPerms}
            onChange={(e) => setEditPerms(e.target.value)}
            placeholder="e.g. read:documents, approve:requests"
            sx={fieldSx}

            helperText="Optional — describe what this role can do"
            slotProps={{ formHelperText: { sx: { color: "var(--naftal-text-muted)" } } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setEditTarget(null)} sx={{ color: "var(--naftal-text-secondary)", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
            sx={{
              backgroundColor: "var(--naftal-brand)", color: "black", textTransform: "none",
              fontWeight: "bold", "&:hover": { backgroundColor: "var(--naftal-brand-strong)" },
            }}
          >
            {isSaving ? "Saving..." : "Enregistrer les Modifications"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        slotProps={{ paper: { sx: dialogPaperSx } }}
      >
        <DialogTitle sx={{ color: "var(--naftal-text-primary)" }}>Delete Role</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "var(--naftal-text-secondary)" }}>
            Are you sure you want to delete the role{" "}
            <strong style={{ color: "var(--naftal-text-primary)" }}>{deleteTarget?.name}</strong>?
            {deleteTarget && empCount(deleteTarget.id) > 0 && (
              <Box
                component="span"
                sx={{ display: "block", mt: 1, color: "var(--naftal-error)" }}
              >
                ⚠ This role is currently assigned to {empCount(deleteTarget.id)} employee(s) and cannot be deleted.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: "var(--naftal-text-secondary)", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting || (!!deleteTarget && empCount(deleteTarget.id) > 0)}
            variant="contained"
            sx={{
              backgroundColor: "var(--naftal-error)", textTransform: "none",
              "&:hover": { backgroundColor: "var(--naftal-error)" },
              "&.Mui-disabled": { backgroundColor: "var(--naftal-error-muted)", color: "var(--naftal-text-muted)" },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}