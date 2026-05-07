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
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import { apiGet, apiPost, apiPut, apiDelete, type ApiError } from "@/lib/api";
import { useMediaQuery, useTheme } from "@mui/material";

type Structure = {
  id: number;
  name: string;
  parentId: number | null;
  parent: { id: number; name: string } | null;
  manager: { id: number; name: string; username: string } | null;
  _count: { employees: number };
};

type Manager = { id: number; name: string; username: string };

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
  minWidth: 420,
};

function StatCard({
  icon, iconBg, iconColor, value, label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: number | string;
  label: string;
}) {
  return (
    <Card sx={{
      bgcolor: "var(--naftal-surface-2)", color: "var(--naftal-text-primary)", borderRadius: 2,
      boxShadow: "none", p: 2, width: "100%",
      border: "0.1px solid transparent", transition: "transform 0.1s",
      "&:hover": { borderColor: "var(--naftal-brand-strong)", transform: "scale(1.01)" },
    }}>
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

export default function DepartmentsPage() {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createParentId, setCreateParentId] = useState("");
  const [createManagerId, setCreateManagerId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [editTarget, setEditTarget] = useState<Structure | null>(null);
  const [editName, setEditName] = useState("");
  const [editParentId, setEditParentId] = useState("");
  const [editManagerId, setEditManagerId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Structure | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSmallScreen = useMediaQuery(useTheme().breakpoints.down("sm"));

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const [data, mgrs] = await Promise.all([
        apiGet<Structure[]>("/api/admin/structures"),
        apiGet<Manager[]>("/api/admin/managers"),
      ]);
      setStructures(data);
      setManagers(mgrs);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to load departments.");
    } finally {
      setIsLoading(false);
    }
  }

  const rootCount = structures.filter((s) => s.parentId === null).length;
  const subCount = structures.filter((s) => s.parentId !== null).length;

  function openCreate() {
    setCreateName("");
    setCreateParentId("");
    setCreateManagerId("");
    setError(null);
    setCreateOpen(true);
  }

  async function handleCreate() {
    if (!createName.trim()) return setError("Name is required.");
    setIsCreating(true);
    setError(null);
    try {
      await apiPost("/api/admin/structures", {
        name: createName.trim(),
        parentId: createParentId ? parseInt(createParentId) : undefined,
        managerId: createManagerId ? parseInt(createManagerId) : undefined,
      });
      setSuccess("Department created successfully.");
      setCreateOpen(false);
      await fetchData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to create department.");
    } finally {
      setIsCreating(false);
    }
  }

  function openEdit(s: Structure) {
    setEditTarget(s);
    setEditName(s.name);
    setEditParentId(s.parentId ? String(s.parentId) : "");
    setEditManagerId(s.manager ? String(s.manager.id) : "");
    setError(null);
  }

  async function handleSave() {
    if (!editTarget) return;
    if (!editName.trim()) return setError("Name is required.");
    setIsSaving(true);
    setError(null);
    try {
      await apiPut(`/api/admin/structures/${editTarget.id}`, {
        name: editName.trim(),
        parentId: editParentId ? parseInt(editParentId) : null,
        managerId: editManagerId ? parseInt(editManagerId) : null,
      });
      setSuccess("Department updated successfully.");
      setEditTarget(null);
      await fetchData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to update department.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await apiDelete(`/api/admin/structures/${deleteTarget.id}`);
      setSuccess("Department deleted successfully.");
      setDeleteTarget(null);
      await fetchData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const msg = apiErr.message || "Failed to delete department.";
      setError(
        msg === "Cannot delete a department that has employees"
          ? `Cannot delete "${deleteTarget.name}" — it has ${deleteTarget._count.employees} employee(s) assigned.`
          : msg
      );
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  function parentOptions(excludeId?: number) {
    return structures.filter((s) => s.id !== excludeId);
  }

  const managerDropdown = (value: string, onChange: (v: string) => void) => (
    <FormControl fullWidth sx={fieldSx}>
      <InputLabel>Manager (optional)</InputLabel>
      <Select
        value={value}
        label="Manager (optional)"
        onChange={(e) => onChange(e.target.value)}
        MenuProps={{ sx: menuSx }}
      >
        <MenuItem value="">
          <Typography sx={{ color: "var(--naftal-text-secondary)", fontStyle: "italic" }}>No manager</Typography>
        </MenuItem>
        {managers.map((m) => (
          <MenuItem key={m.id} value={String(m.id)}>{m.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{
      flexGrow: 1, mt: "70px", backgroundColor: "var(--naftal-bg)",
      padding: "36px", overflowY: "auto", overflowX: "hidden",
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--naftal-text-primary)" }}>Departments</Typography>
          <Typography sx={{ color: "var(--naftal-text-muted)", fontWeight: "bold", mt: 0.5 }}>
            {structures.length} department{structures.length !== 1 ? "s" : ""} defined
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate}
          sx={{
            backgroundColor: "var(--naftal-brand)", color: "black", textTransform: "none",
            borderRadius: 2, fontWeight: "bold", "&:hover": { backgroundColor: "var(--naftal-brand-strong)" },
          }}
        >
          New Department
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{
          mb: 3, mt: 2, bgcolor: "var(--naftal-error-muted)", color: "var(--naftal-error)",
          "& .MuiAlert-icon": { color: "var(--naftal-error)" },
        }}>{error}</Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{
          mb: 3, mt: 2, bgcolor: "var(--naftal-success-muted)", color: "var(--naftal-success)",
          "& .MuiAlert-icon": { color: "var(--naftal-success)" },
        }}>{success}</Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }} columns={{ sm: 8, md: 12 }}>
        <Grid size={{ sm: 4, md: 4 }}>

          <StatCard icon={<AccountTreeOutlinedIcon />} iconBg="var(--naftal-info-muted)"
            iconColor="var(--naftal-info)" value={structures.length} label="Total Departments" />
        </Grid>
        <Grid size={{ sm: 4, md: 4 }}>
          <StatCard icon={<CorporateFareOutlinedIcon />} iconBg="var(--naftal-brand-muted)"
            iconColor="var(--naftal-brand)" value={rootCount} label="Root Departments" />
        </Grid>
        <Grid size={{ sm: 4, md: 4 }}>

          <StatCard icon={<AccountTreeOutlinedIcon />} iconBg="var(--naftal-success-muted)"
            iconColor="var(--naftal-success)" value={subCount} label="Sub-Departments" />
        </Grid>
      </Grid>

      {isLoading ? (
        <Typography sx={{ color: "var(--naftal-text-muted)", textAlign: "center", mt: 6 }}>Loading departments...</Typography>
      ) : structures.length === 0 ? (
        <Box sx={{ backgroundColor: "var(--naftal-surface-2)", borderRadius: "12px", p: 4, textAlign: "center" }}>
          <Typography sx={{ color: "var(--naftal-text-secondary)", fontSize: "20px" }}>No departments defined yet</Typography>
        </Box>
      ) : !isSmallScreen ? (
        <TableContainer component={Paper} sx={{
          backgroundColor: "var(--naftal-surface-2)", borderRadius: 2,
          boxShadow: "var(--naftal-shadow-strong)", border: "1px solid var(--naftal-border-subtle)",
        }}>
          <Table>
            <TableHead sx={{ bgcolor: "var(--naftal-surface-0)" }}>
              <TableRow>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>ID</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Name</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Parent</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Manager</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Employees</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Type</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {structures.map((s) => (
                <TableRow key={s.id} sx={{ boxShadow: "0px 0px 1px 0px var(--naftal-border)", "&:hover": { backgroundColor: "var(--naftal-surface-2-hover)" } }}>
                  <TableCell sx={{ color: "var(--naftal-brand)", fontWeight: "bold", border: "none" }}>{s.id}</TableCell>
                  <TableCell sx={{ color: "var(--naftal-text-primary)", fontWeight: "bold", border: "none" }}>
                    {s.parentId && <Box component="span" sx={{ color: "var(--naftal-text-muted)", mr: 0.5 }}>└</Box>}
                    {s.name}
                  </TableCell>
                  <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>
                    {s.parent ? (
                      <Chip label={s.parent.name} size="small" sx={{
                        backgroundColor: "var(--naftal-brand-muted)", color: "var(--naftal-brand)",
                        border: "1px solid var(--naftal-brand)", borderRadius: "8px", fontWeight: "bold",
                      }} />
                    ) : (
                      <Chip label="Root" size="small" sx={{
                        backgroundColor: "var(--naftal-info-muted)", color: "var(--naftal-info)",
                        border: "1px solid var(--naftal-info)", borderRadius: "8px", fontWeight: "bold",
                      }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    {s.manager ? (
                      <Chip label={s.manager.name} size="small" sx={{
                        backgroundColor: "var(--naftal-success-muted)", color: "var(--naftal-success)",
                        border: "1px solid var(--naftal-success)", borderRadius: "8px", fontWeight: "bold",
                      }} />
                    ) : (
                      <Typography variant="caption" sx={{ color: "var(--naftal-text-muted)" }}>Unassigned</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <Chip
                      label={`${s._count.employees} employee${s._count.employees !== 1 ? "s" : ""}`}
                      size="small" sx={{
                        backgroundColor: "var(--naftal-success-muted)", color: "var(--naftal-success)",
                        border: "1px solid var(--naftal-success)", borderRadius: "8px", fontWeight: "bold",
                      }} />
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <Typography variant="caption" sx={{ color: "var(--naftal-text-secondary)" }}>
                      {s.parentId === null ? "Root Department" : "Sub-Department"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ border: "none" }} align="right">
                    <IconButton size="small" onClick={() => openEdit(s)}
                      sx={{ color: "var(--naftal-info)", "&:hover": { color: "var(--naftal-brand)" } }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(s)}
                      sx={{ color: "var(--naftal-error)", "&:hover": { color: "var(--naftal-error)" }, ml: 1 }}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={2}>
          {structures.map((s) => (
            <Grid size={{ xs: 12 }} key={s.id}>
              <Card sx={{ backgroundColor: "var(--naftal-surface-2)", color: "var(--naftal-text-primary)", borderRadius: 2, p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", color: "var(--naftal-brand)" }}>#{s.id}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {s.parentId && <span style={{ color: "var(--naftal-text-muted)", marginRight: 4 }}>└</span>}
                      {s.name}
                    </Typography>
                    <Box sx={{ mt: 0.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {s.parent ? (
                        <Chip label={s.parent.name} size="small" sx={{
                          backgroundColor: "var(--naftal-brand-muted)", color: "var(--naftal-brand)",
                          border: "1px solid var(--naftal-brand)", borderRadius: "8px", fontWeight: "bold",
                        }} />
                      ) : (
                        <Chip label="Root" size="small" sx={{
                          backgroundColor: "var(--naftal-info-muted)", color: "var(--naftal-info)",
                          border: "1px solid var(--naftal-info)", borderRadius: "8px", fontWeight: "bold",
                        }} />
                      )}
                      {s.manager && (
                        <Chip label={s.manager.name} size="small" sx={{
                          backgroundColor: "var(--naftal-success-muted)", color: "var(--naftal-success)",
                          border: "1px solid var(--naftal-success)", borderRadius: "8px", fontWeight: "bold",
                        }} />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: "var(--naftal-success)", mt: 0.5 }}>
                      {s._count.employees} employee{s._count.employees !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => openEdit(s)} sx={{ color: "var(--naftal-info)" }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(s)} sx={{ color: "var(--naftal-error)" }}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} slotProps={{ paper: { sx: dialogPaperSx } }}>

        <DialogTitle sx={{ color: "var(--naftal-text-primary)" }}>New Department</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "20px !important" }}>
          <TextField fullWidth label="Nom de Department" value={createName}
            onChange={(e) => setCreateName(e.target.value)} sx={fieldSx} />
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel> Department Parent (optional)</InputLabel>
            <Select value={createParentId} label="Parent Department (optional)"
              onChange={(e) => setCreateParentId(e.target.value)} MenuProps={{ sx: menuSx }}>
              <MenuItem value="">

                <Typography sx={{ color: "var(--naftal-text-secondary)", fontStyle: "italic" }}>None (Root Department)</Typography>
              </MenuItem>
              {structures.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {managerDropdown(createManagerId, setCreateManagerId)}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>

          <Button onClick={() => setCreateOpen(false)} sx={{ color: "var(--naftal-text-secondary)", textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={isCreating} sx={{
            backgroundColor: "var(--naftal-brand)", color: "black", textTransform: "none",
            fontWeight: "bold", "&:hover": { backgroundColor: "var(--naftal-brand-strong)" },
          }}>
            {isCreating ? "Creating..." : "Creer Department"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} slotProps={{ paper: { sx: dialogPaperSx } }}>
        <DialogTitle sx={{ color: "var(--naftal-text-primary)" }}>Edit Department</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "20px !important" }}>
          <TextField fullWidth label="Department Name" value={editName}
            onChange={(e) => setEditName(e.target.value)} sx={fieldSx} />
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Parent Department (optional)</InputLabel>
            <Select value={editParentId} label="Parent Department (optional)"
              onChange={(e) => setEditParentId(e.target.value)} MenuProps={{ sx: menuSx }}>
              <MenuItem value="">
                <Typography sx={{ color: "var(--naftal-text-secondary)", fontStyle: "italic" }}>None (Root Department)</Typography>
              </MenuItem>
              {parentOptions(editTarget?.id).map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {managerDropdown(editManagerId, setEditManagerId)}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setEditTarget(null)} sx={{ color: "var(--naftal-text-secondary)", textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaving} sx={{
            backgroundColor: "var(--naftal-brand)", color: "black", textTransform: "none",
            fontWeight: "bold", "&:hover": { backgroundColor: "var(--naftal-brand-strong)" },
          }}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} slotProps={{ paper: { sx: dialogPaperSx } }}>
        <DialogTitle sx={{ color: "var(--naftal-text-primary)" }}>Delete Department</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "var(--naftal-text-secondary)" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "var(--naftal-text-primary)" }}>{deleteTarget?.name}</strong>?
            {deleteTarget && deleteTarget._count.employees > 0 && (
              <Box component="span" sx={{ display: "block", mt: 1, color: "var(--naftal-error)" }}>
                ⚠ This department has {deleteTarget._count.employees} employee(s) assigned and cannot be deleted.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: "var(--naftal-text-secondary)", textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleDelete}
            disabled={isDeleting || (!!deleteTarget && deleteTarget._count.employees > 0)}
            variant="contained" sx={{
              backgroundColor: "var(--naftal-error)", textTransform: "none",
              "&:hover": { backgroundColor: "var(--naftal-error)" },
              "&.Mui-disabled": { backgroundColor: "var(--naftal-error-muted)", color: "var(--naftal-text-muted)" },
            }}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}