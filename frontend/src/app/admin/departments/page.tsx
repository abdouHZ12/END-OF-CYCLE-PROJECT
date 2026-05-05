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
      bgcolor: "#1a2942", color: "#fff", borderRadius: 2,
      boxShadow: "none", p: 2, width: "100%",
      border: "0.1px solid transparent", transition: "transform 0.1s",
      "&:hover": { borderColor: "darkorange", transform: "scale(1.01)" },
    }}>
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
          <Typography sx={{ color: "lightgray", fontStyle: "italic" }}>No manager</Typography>
        </MenuItem>
        {managers.map((m) => (
          <MenuItem key={m.id} value={String(m.id)}>{m.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{
      flexGrow: 1, mt: "70px", backgroundColor: "rgb(10, 22, 40)",
      padding: "36px", overflowY: "auto", overflowX: "hidden",
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#fff" }}>Departments</Typography>
          <Typography sx={{ color: "gray", fontWeight: "bold", mt: 0.5 }}>
            {structures.length} department{structures.length !== 1 ? "s" : ""} defined
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate}
          sx={{
            backgroundColor: "orange", color: "black", textTransform: "none",
            borderRadius: 2, fontWeight: "bold", "&:hover": { backgroundColor: "darkorange" },
          }}
        >
          New Department
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{
          mb: 3, mt: 2, bgcolor: "rgba(244,67,54,0.1)", color: "#f44336",
          "& .MuiAlert-icon": { color: "#f44336" },
        }}>{error}</Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{
          mb: 3, mt: 2, bgcolor: "rgba(76,175,80,0.1)", color: "#4caf50",
          "& .MuiAlert-icon": { color: "#4caf50" },
        }}>{success}</Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }} columns={{ sm: 8, md: 12 }}>
        <Grid size={{ sm: 4, md: 4 }}>
          <StatCard icon={<AccountTreeOutlinedIcon />} iconBg="rgba(127,179,255,0.1)"
            iconColor="#7fb3ff" value={structures.length} label="Departments" />
        </Grid>
        <Grid size={{ sm: 4, md: 4 }}>
          <StatCard icon={<CorporateFareOutlinedIcon />} iconBg="rgba(255,165,0,0.1)"
            iconColor="#ffa500" value={rootCount} label="Root Departments" />
        </Grid>
        <Grid size={{ sm: 4, md: 4 }}>
          <StatCard icon={<AccountTreeOutlinedIcon />} iconBg="rgba(76,175,80,0.1)"
            iconColor="#4caf50" value={subCount} label="Sous-Departments" />
        </Grid>
      </Grid>

      {isLoading ? (
        <Typography sx={{ color: "gray", textAlign: "center", mt: 6 }}>Loading departments...</Typography>
      ) : structures.length === 0 ? (
        <Box sx={{ backgroundColor: "#1a2942", borderRadius: "12px", p: 4, textAlign: "center" }}>
          <Typography sx={{ color: "lightgray", fontSize: "20px" }}>No departments defined yet</Typography>
        </Box>
      ) : !isSmallScreen ? (
        <TableContainer component={Paper} sx={{
          backgroundColor: "#1a2942", borderRadius: 2,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <Table>
            <TableHead sx={{ bgcolor: "#10223A" }}>
              <TableRow>
                <TableCell sx={{ color: "lightgray", border: "none" }}>ID</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Name</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Parent</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Manager</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Employees</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Type</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {structures.map((s) => (
                <TableRow key={s.id} sx={{ boxShadow: "0px 0px 1px 0px gray", "&:hover": { backgroundColor: "#1a2540" } }}>
                  <TableCell sx={{ color: "#ffa500", fontWeight: "bold", border: "none" }}>{s.id}</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", border: "none" }}>
                    {s.parentId && <Box component="span" sx={{ color: "gray", mr: 0.5 }}>└</Box>}
                    {s.name}
                  </TableCell>
                  <TableCell sx={{ color: "lightgray", border: "none" }}>
                    {s.parent ? (
                      <Chip label={s.parent.name} size="small" sx={{
                        backgroundColor: "rgba(255,165,0,0.1)", color: "#ffa500",
                        border: "1px solid #ffa500", borderRadius: "8px", fontWeight: "bold",
                      }} />
                    ) : (
                      <Chip label="Root" size="small" sx={{
                        backgroundColor: "rgba(127,179,255,0.1)", color: "#7fb3ff",
                        border: "1px solid #7fb3ff", borderRadius: "8px", fontWeight: "bold",
                      }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    {s.manager ? (
                      <Chip label={s.manager.name} size="small" sx={{
                        backgroundColor: "rgba(76,175,80,0.1)", color: "#4caf50",
                        border: "1px solid #4caf50", borderRadius: "8px", fontWeight: "bold",
                      }} />
                    ) : (
                      <Typography variant="caption" sx={{ color: "gray" }}>Unassigned</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <Chip
                      label={`${s._count.employees} employee${s._count.employees !== 1 ? "s" : ""}`}
                      size="small" sx={{
                        backgroundColor: "rgba(76,175,80,0.1)", color: "#4caf50",
                        border: "1px solid #4caf50", borderRadius: "8px", fontWeight: "bold",
                      }} />
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <Typography variant="caption" sx={{ color: "lightgray" }}>
                      {s.parentId === null ? "Root Department" : "Sub-Department"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ border: "none" }} align="right">
                    <IconButton size="small" onClick={() => openEdit(s)}
                      sx={{ color: "#7fb3ff", "&:hover": { color: "orange" } }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(s)}
                      sx={{ color: "#f44336", "&:hover": { color: "#ff7961" }, ml: 1 }}>
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
              <Card sx={{ backgroundColor: "#1a2942", color: "#fff", borderRadius: 2, p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", color: "#ffa500" }}>#{s.id}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {s.parentId && <span style={{ color: "gray", marginRight: 4 }}>└</span>}
                      {s.name}
                    </Typography>
                    <Box sx={{ mt: 0.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {s.parent ? (
                        <Chip label={s.parent.name} size="small" sx={{
                          backgroundColor: "rgba(255,165,0,0.1)", color: "#ffa500",
                          border: "1px solid #ffa500", borderRadius: "8px", fontWeight: "bold",
                        }} />
                      ) : (
                        <Chip label="Root" size="small" sx={{
                          backgroundColor: "rgba(127,179,255,0.1)", color: "#7fb3ff",
                          border: "1px solid #7fb3ff", borderRadius: "8px", fontWeight: "bold",
                        }} />
                      )}
                      {s.manager && (
                        <Chip label={s.manager.name} size="small" sx={{
                          backgroundColor: "rgba(76,175,80,0.1)", color: "#4caf50",
                          border: "1px solid #4caf50", borderRadius: "8px", fontWeight: "bold",
                        }} />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: "#4caf50", mt: 0.5 }}>
                      {s._count.employees} employee{s._count.employees !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => openEdit(s)} sx={{ color: "#7fb3ff" }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(s)} sx={{ color: "#f44336" }}>
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
        <DialogTitle sx={{ color: "#fff" }}>Nouveau Department</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "20px !important" }}>
          <TextField fullWidth label="Nom de Department" value={createName}
            onChange={(e) => setCreateName(e.target.value)} sx={fieldSx} />
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel> Department Parent (optional)</InputLabel>
            <Select value={createParentId} label="Parent Department (optional)"
              onChange={(e) => setCreateParentId(e.target.value)} MenuProps={{ sx: menuSx }}>
              <MenuItem value="">
                <Typography sx={{ color: "lightgray", fontStyle: "italic" }}>None ( Department d&apos;origine)</Typography>
              </MenuItem>
              {structures.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {managerDropdown(createManagerId, setCreateManagerId)}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: "lightgray", textTransform: "none" }}>Annuler</Button>
          <Button variant="contained" onClick={handleCreate} disabled={isCreating} sx={{
            backgroundColor: "orange", color: "black", textTransform: "none",
            fontWeight: "bold", "&:hover": { backgroundColor: "darkorange" },
          }}>
            {isCreating ? "Creating..." : "Creer Department"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} slotProps={{ paper: { sx: dialogPaperSx } }}>
        <DialogTitle sx={{ color: "#fff" }}>Edit Department</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "20px !important" }}>
          <TextField fullWidth label="Department Name" value={editName}
            onChange={(e) => setEditName(e.target.value)} sx={fieldSx} />
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Parent Department (optional)</InputLabel>
            <Select value={editParentId} label="Parent Department (optional)"
              onChange={(e) => setEditParentId(e.target.value)} MenuProps={{ sx: menuSx }}>
              <MenuItem value="">
                <Typography sx={{ color: "lightgray", fontStyle: "italic" }}>None (Root Department)</Typography>
              </MenuItem>
              {parentOptions(editTarget?.id).map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {managerDropdown(editManagerId, setEditManagerId)}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setEditTarget(null)} sx={{ color: "lightgray", textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaving} sx={{
            backgroundColor: "orange", color: "black", textTransform: "none",
            fontWeight: "bold", "&:hover": { backgroundColor: "darkorange" },
          }}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} slotProps={{ paper: { sx: dialogPaperSx } }}>
        <DialogTitle sx={{ color: "#fff" }}>Delete Department</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "lightgray" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "#fff" }}>{deleteTarget?.name}</strong>?
            {deleteTarget && deleteTarget._count.employees > 0 && (
              <Box component="span" sx={{ display: "block", mt: 1, color: "#f44336" }}>
                ⚠ This department has {deleteTarget._count.employees} employee(s) assigned and cannot be deleted.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: "lightgray", textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleDelete}
            disabled={isDeleting || (!!deleteTarget && deleteTarget._count.employees > 0)}
            variant="contained" sx={{
              backgroundColor: "#f44336", textTransform: "none",
              "&:hover": { backgroundColor: "#d32f2f" },
              "&.Mui-disabled": { backgroundColor: "rgba(244,67,54,0.3)", color: "rgba(255,255,255,0.3)" },
            }}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}