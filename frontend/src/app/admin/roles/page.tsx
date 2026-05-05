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
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
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
  ADMIN: "#f44336",
  MANAGER: "#ffa500",
  WORKER: "#4caf50",
  AGENT: "#7fb3ff",
};

const roleTypeBg: Record<string, string> = {
  ADMIN: "rgba(244,67,54,0.1)",
  MANAGER: "rgba(255,165,0,0.1)",
  WORKER: "rgba(76,175,80,0.1)",
  AGENT: "rgba(127,179,255,0.1)",
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

const dialogPaperSx = {
  backgroundColor: "#1a2942",
  color: "#fff",
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
        bgcolor: "#1a2942",
        color: "#fff",
        borderRadius: 2,
        boxShadow: "none",
        p: 2,
        width: "100%",
        border: "0.1px solid transparent",
        transition: "transform 0.1s",
        "&:hover": { borderColor: "darkorange", transform: "scale(1.01)" },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Avatar sx={{ bgcolor: iconBg, width: 48, height: 48 }}>
            <Box sx={{ color: iconColor, display: "flex" }}>{icon}</Box>
          </Avatar>
        </Stack>
        <Typography variant="h3" sx={{ mt: 2, fontWeight: 700, color: "#fff", fontSize: 34 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
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
        color: roleTypeColor[type] ?? "#fff",
        fontWeight: "bold",
        border: `1px solid ${roleTypeColor[type] ?? "#fff"}`,
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
        backgroundColor: "rgb(10, 22, 40)",
        padding: "36px",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#fff" }}>
            Roles
          </Typography>
          <Typography sx={{ color: "gray", fontWeight: "bold", mt: 0.5 }}>
            {roles.length} role{roles.length !== 1 ? "s" : ""} definees
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={openCreate}
          sx={{
            backgroundColor: "orange",
            color: "black",
            textTransform: "none",
            borderRadius: 2,
            fontWeight: "bold",
            "&:hover": { backgroundColor: "darkorange" },
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
          sx={{ mb: 3, mt: 2, bgcolor: "rgba(244,67,54,0.1)", color: "#f44336", "& .MuiAlert-icon": { color: "#f44336" } }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 3, mt: 2, bgcolor: "rgba(76,175,80,0.1)", color: "#4caf50", "& .MuiAlert-icon": { color: "#4caf50" } }}
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
        <Typography sx={{ color: "gray", textAlign: "center", mt: 6 }}>
          Loading roles...
        </Typography>
      ) : roles.length === 0 ? (
        <Box sx={{ backgroundColor: "#1a2942", borderRadius: "12px", p: 4, textAlign: "center" }}>
          <Typography sx={{ color: "lightgray", fontSize: "20px" }}>No roles defined yet</Typography>
        </Box>
      ) : !isSmallScreen ? (
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "#1a2942",
            borderRadius: 2,
            boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#10223A" }}>
              <TableRow>
                <TableCell sx={{ color: "lightgray", border: "none" }}>ID</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Nom</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Type</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Permissions</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Employees</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow
                  key={role.id}
                  sx={{ boxShadow: "0px 0px 1px 0px gray", "&:hover": { backgroundColor: "#1a2540" } }}
                >
                  <TableCell sx={{ color: "#ffa500", fontWeight: "bold", border: "none" }}>
                    {role.id}
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", border: "none" }}>
                    {role.name}
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <RoleChip type={role.type} />
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "lightgray",
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
                        backgroundColor: "rgba(127,179,255,0.1)",
                        color: "#7fb3ff",
                        border: "1px solid #7fb3ff",
                        borderRadius: "8px",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ border: "none" }} align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(role)}
                      sx={{ color: "#7fb3ff", "&:hover": { color: "orange" } }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(role)}
                      sx={{ color: "#f44336", "&:hover": { color: "#ff7961" }, ml: 1 }}
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
              <Card sx={{ backgroundColor: "#1a2942", color: "#fff", borderRadius: 2, p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", color: "#ffa500" }}>#{role.id}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>{role.name}</Typography>
                    <Box sx={{ mt: 0.5 }}><RoleChip type={role.type} /></Box>
                    <Typography variant="body2" sx={{ color: "lightgray", mt: 0.5 }}>
                      {role.permissions || "No permissions set"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#7fb3ff", mt: 0.5 }}>
                      {empCount(role.id)} employee{empCount(role.id) !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => openEdit(role)} sx={{ color: "#7fb3ff" }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(role)} sx={{ color: "#f44336" }}>
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
        <DialogTitle sx={{ color: "#fff" }}>New Role</DialogTitle>
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
            slotProps={{ formHelperText: { sx: { color: "gray" } } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: "lightgray", textTransform: "none" }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={isCreating}
            sx={{
              backgroundColor: "orange", color: "black", textTransform: "none",
              fontWeight: "bold", "&:hover": { backgroundColor: "darkorange" },
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
        <DialogTitle sx={{ color: "#fff" }}>Edit Role</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          {editTarget && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography sx={{ color: "lightgray", fontSize: 14 }}>Type:</Typography>
              <RoleChip type={editTarget.type} />
              <Typography sx={{ color: "gray", fontSize: 12 }}>(ne peux pas t&apos;etre modifie)</Typography>
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
            helperText="Optional — decrivez ce que ce role peut faire"
            slotProps={{ formHelperText: { sx: { color: "gray" } } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setEditTarget(null)} sx={{ color: "lightgray", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
            sx={{
              backgroundColor: "orange", color: "black", textTransform: "none",
              fontWeight: "bold", "&:hover": { backgroundColor: "darkorange" },
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
        <DialogTitle sx={{ color: "#fff" }}>Delete Role</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "lightgray" }}>
            Are you sure you want to delete the role{" "}
            <strong style={{ color: "#fff" }}>{deleteTarget?.name}</strong>?
            {deleteTarget && empCount(deleteTarget.id) > 0 && (
              <Box
                component="span"
                sx={{ display: "block", mt: 1, color: "#f44336" }}
              >
                ⚠ This role is currently assigned to {empCount(deleteTarget.id)} employee(s) and cannot be deleted.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: "lightgray", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting || (!!deleteTarget && empCount(deleteTarget.id) > 0)}
            variant="contained"
            sx={{
              backgroundColor: "#f44336", textTransform: "none",
              "&:hover": { backgroundColor: "#d32f2f" },
              "&.Mui-disabled": { backgroundColor: "rgba(244,67,54,0.3)", color: "rgba(255,255,255,0.3)" },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}