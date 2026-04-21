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

// ── Types ─────────────────────────────────────────────────────────────────────

type Structure = {
  id: number;
  name: string;
  parentId: number | null;
  parent: { id: number; name: string } | null;
  _count: { employees: number };
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
  minWidth: 420,
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DepartmentsPage() {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createParentId, setCreateParentId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // ── Edit dialog
  const [editTarget, setEditTarget] = useState<Structure | null>(null);
  const [editName, setEditName] = useState("");
  const [editParentId, setEditParentId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ── Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Structure | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSmallScreen = useMediaQuery(useTheme().breakpoints.down("sm"));

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<Structure[]>("/api/admin/structures");
      setStructures(data);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to load departments.");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Stats
  const totalEmployees = structures.reduce((sum, s) => sum + s._count.employees, 0);
  const rootCount = structures.filter((s) => s.parentId === null).length;
  const subCount = structures.filter((s) => s.parentId !== null).length;

  // ── Create ────────────────────────────────────────────────────────────────

  function openCreate() {
    setCreateName("");
    setCreateParentId("");
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

  // ── Edit ──────────────────────────────────────────────────────────────────

  function openEdit(s: Structure) {
    setEditTarget(s);
    setEditName(s.name);
    setEditParentId(s.parentId ? String(s.parentId) : "");
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

  // ── Delete ────────────────────────────────────────────────────────────────

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

  // ── parent options for dropdowns (exclude self on edit)
  function parentOptions(excludeId?: number) {
    return structures.filter((s) => s.id !== excludeId);
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
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#fff" }}>
            Departments
          </Typography>
          <Typography sx={{ color: "gray", fontWeight: "bold", mt: 0.5 }}>
            {structures.length} department{structures.length !== 1 ? "s" : ""} defined
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
          New Department
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            mb: 3, mt: 2,
            bgcolor: "rgba(244,67,54,0.1)", color: "#f44336",
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
            mb: 3, mt: 2,
            bgcolor: "rgba(76,175,80,0.1)", color: "#4caf50",
            "& .MuiAlert-icon": { color: "#4caf50" },
          }}
        >
          {success}
        </Alert>
      )}

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }} columns={{ sm: 8, md: 12 }}>
        <Grid size={{ sm: 4, md: 4 }}>
          <StatCard
            icon={<AccountTreeOutlinedIcon />}
            iconBg="rgba(127,179,255,0.1)"
            iconColor="#7fb3ff"
            value={structures.length}
            label="Total Departments"
          />
        </Grid>
        <Grid size={{ sm: 4, md: 4 }}>
          <StatCard
            icon={<CorporateFareOutlinedIcon />}
            iconBg="rgba(255,165,0,0.1)"
            iconColor="#ffa500"
            value={rootCount}
            label="Root Departments"
          />
        </Grid>
        <Grid size={{ sm: 4, md: 4 }}>
          <StatCard
            icon={<AccountTreeOutlinedIcon />}
            iconBg="rgba(76,175,80,0.1)"
            iconColor="#4caf50"
            value={subCount}
            label="Sub-Departments"
          />
        </Grid>
      </Grid>

      {/* Table */}
      {isLoading ? (
        <Typography sx={{ color: "gray", textAlign: "center", mt: 6 }}>
          Loading departments...
        </Typography>
      ) : structures.length === 0 ? (
        <Box
          sx={{ backgroundColor: "#1a2942", borderRadius: "12px", p: 4, textAlign: "center" }}
        >
          <Typography sx={{ color: "lightgray", fontSize: "20px" }}>
            No departments defined yet
          </Typography>
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
                <TableCell sx={{ color: "lightgray", border: "none" }}>Name</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Parent</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Employees</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Type</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {structures.map((s) => (
                <TableRow
                  key={s.id}
                  sx={{
                    boxShadow: "0px 0px 1px 0px gray",
                    "&:hover": { backgroundColor: "#1a2540" },
                  }}
                >
                  <TableCell sx={{ color: "#ffa500", fontWeight: "bold", border: "none" }}>
                    {s.id}
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", border: "none" }}>
                    {s.parentId && (
                      <Box component="span" sx={{ color: "gray", mr: 0.5 }}>└</Box>
                    )}
                    {s.name}
                  </TableCell>
                  <TableCell sx={{ color: "lightgray", border: "none" }}>
                    {s.parent ? (
                      <Chip
                        label={s.parent.name}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(255,165,0,0.1)",
                          color: "#ffa500",
                          border: "1px solid #ffa500",
                          borderRadius: "8px",
                          fontWeight: "bold",
                        }}
                      />
                    ) : (
                      <Chip
                        label="Root"
                        size="small"
                        sx={{
                          backgroundColor: "rgba(127,179,255,0.1)",
                          color: "#7fb3ff",
                          border: "1px solid #7fb3ff",
                          borderRadius: "8px",
                          fontWeight: "bold",
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <Chip
                      label={`${s._count.employees} employee${s._count.employees !== 1 ? "s" : ""}`}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(76,175,80,0.1)",
                        color: "#4caf50",
                        border: "1px solid #4caf50",
                        borderRadius: "8px",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    {s.parentId === null ? (
                      <Typography variant="caption" sx={{ color: "lightgray" }}>
                        Root Department
                      </Typography>
                    ) : (
                      <Typography variant="caption" sx={{ color: "lightgray" }}>
                        Sub-Department
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ border: "none" }} align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(s)}
                      sx={{ color: "#7fb3ff", "&:hover": { color: "orange" } }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(s)}
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
          {structures.map((s) => (
            <Grid size={{ xs: 12 }} key={s.id}>
              <Card sx={{ backgroundColor: "#1a2942", color: "#fff", borderRadius: 2, p: 2 }}>
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: "bold", color: "#ffa500" }}>#{s.id}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {s.parentId && <span style={{ color: "gray", marginRight: 4 }}>└</span>}
                      {s.name}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {s.parent ? (
                        <Chip
                          label={s.parent.name}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(255,165,0,0.1)",
                            color: "#ffa500",
                            border: "1px solid #ffa500",
                            borderRadius: "8px",
                            fontWeight: "bold",
                          }}
                        />
                      ) : (
                        <Chip
                          label="Root"
                          size="small"
                          sx={{
                            backgroundColor: "rgba(127,179,255,0.1)",
                            color: "#7fb3ff",
                            border: "1px solid #7fb3ff",
                            borderRadius: "8px",
                            fontWeight: "bold",
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: "#4caf50", mt: 0.5 }}>
                      {s._count.employees} employee{s._count.employees !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => openEdit(s)}
                      sx={{ color: "#7fb3ff" }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(s)}
                      sx={{ color: "#f44336" }}
                    >
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
        <DialogTitle sx={{ color: "#fff" }}>New Department</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "20px !important" }}>
          <TextField
            fullWidth
            label="Department Name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            sx={fieldSx}
          />
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Parent Department (optional)</InputLabel>
            <Select
              value={createParentId}
              label="Parent Department (optional)"
              onChange={(e) => setCreateParentId(e.target.value)}
              MenuProps={{ sx: menuSx }}
            >
              <MenuItem value="">
                <Typography sx={{ color: "lightgray", fontStyle: "italic" }}>
                  None (Root Department)
                </Typography>
              </MenuItem>
              {structures.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setCreateOpen(false)}
            sx={{ color: "lightgray", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={isCreating}
            sx={{
              backgroundColor: "orange", color: "black",
              textTransform: "none", fontWeight: "bold",
              "&:hover": { backgroundColor: "darkorange" },
            }}
          >
            {isCreating ? "Creating..." : "Create Department"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        slotProps={{ paper: { sx: dialogPaperSx } }}
      >
        <DialogTitle sx={{ color: "#fff" }}>Edit Department</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "20px !important" }}>
          <TextField
            fullWidth
            label="Department Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={fieldSx}
          />
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Parent Department (optional)</InputLabel>
            <Select
              value={editParentId}
              label="Parent Department (optional)"
              onChange={(e) => setEditParentId(e.target.value)}
              MenuProps={{ sx: menuSx }}
            >
              <MenuItem value="">
                <Typography sx={{ color: "lightgray", fontStyle: "italic" }}>
                  None (Root Department)
                </Typography>
              </MenuItem>
              {parentOptions(editTarget?.id).map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setEditTarget(null)}
            sx={{ color: "lightgray", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
            sx={{
              backgroundColor: "orange", color: "black",
              textTransform: "none", fontWeight: "bold",
              "&:hover": { backgroundColor: "darkorange" },
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        slotProps={{ paper: { sx: dialogPaperSx } }}
      >
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
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{ color: "lightgray", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting || (!!deleteTarget && deleteTarget._count.employees > 0)}
            variant="contained"
            sx={{
              backgroundColor: "#f44336", textTransform: "none",
              "&:hover": { backgroundColor: "#d32f2f" },
              "&.Mui-disabled": {
                backgroundColor: "rgba(244,67,54,0.3)",
                color: "rgba(255,255,255,0.3)",
              },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}