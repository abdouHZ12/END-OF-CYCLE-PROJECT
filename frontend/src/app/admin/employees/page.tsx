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
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import { apiGet, apiDelete, type ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useMediaQuery, useTheme } from "@mui/material";
import { getRoleChip } from "@/features/admin/ui";


type Role = { role: { id: number; name: string; type: string } };

type Employee = {
  id: number;
  name: string;
  username: string;
  email: string;
  structure: { id: number; name: string };
  roles: Role[];
};

type Structure = { id: number; name: string };


const menuSx = {
  "& .MuiPaper-root": {
    bgcolor: "#1a2942",
    color: "#fff",
  },
  "& .MuiMenuItem-root:hover": {
    bgcolor: "rgba(255,165,0,0.1)",
  },
};


export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const isSmallScreen = useMediaQuery(useTheme().breakpoints.down("sm"));

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const [emps, structs] = await Promise.all([
        apiGet<Employee[]>("/api/admin/employees"),
        apiGet<Structure[]>("/api/admin/structures"),
      ]);
      setEmployees(emps);
      setStructures(structs);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiDelete(`/api/admin/employees/${deleteTarget.id}`);
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to delete employee.");
    } finally {
      setIsDeleting(false);
    }
  }

  const filtered = employees.filter((emp) => {
    const matchSearch =
      search === "" ||
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.username.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());

    const matchRole =
      roleFilter === "ALL" ||
      emp.roles.some((r) => r.role.type === roleFilter);

    const matchDept =
      deptFilter === "ALL" ||
      String(emp.structure?.id) === deptFilter;

    return matchSearch && matchRole && matchDept;
  });

  const filterSx = {
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

      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#fff" }}>
            Employees
          </Typography>
          <Typography sx={{ color: "gray", fontWeight: "bold", mt: 0.5 }}>
            {filtered.length} employee{filtered.length !== 1 ? "s" : ""} found
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          sx={{
            backgroundColor: "orange",
            color: "black",
            textTransform: "none",
            borderRadius: 2,
            fontWeight: "bold",
            "&:hover": { backgroundColor: "darkorange" },
          }}
          onClick={() => router.push("/admin/employees/register")}
        >
          New Employee
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 5 }}>
          <TextField
            fullWidth
            placeholder="Search by name, username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={filterSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "lightgray" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 3, md: 3 }}>
          <FormControl fullWidth sx={filterSx}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
              MenuProps={{ sx: menuSx }}
            >
              <MenuItem value="ALL">All Roles</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="MANAGER">Manager</MenuItem>
              <MenuItem value="WORKER">Worker</MenuItem>
              <MenuItem value="AGENT">Agent</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, sm: 3, md: 4 }}>
          <FormControl fullWidth sx={filterSx}>
            <InputLabel>Department</InputLabel>
            <Select
              value={deptFilter}
              label="Department"
              onChange={(e) => setDeptFilter(e.target.value)}
              MenuProps={{ sx: menuSx }}
            >
              <MenuItem value="ALL">All Departments</MenuItem>
              {structures.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {isLoading ? (
        <Typography sx={{ color: "gray", textAlign: "center", mt: 6 }}>
          Loading employees...
        </Typography>
      ) : error ? (
        <Typography sx={{ color: "red", textAlign: "center", mt: 6 }}>
          {error}
        </Typography>
      ) : filtered.length === 0 ? (
        <Box
          sx={{ backgroundColor: "#1a2942", borderRadius: "12px", p: 4, textAlign: "center" }}
        >
          <Typography sx={{ color: "lightgray", fontSize: "20px" }}>
            No employees match your filters
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
                <TableCell sx={{ color: "lightgray", border: "none" }}>Username</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Email</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Department</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }}>Roles</TableCell>
                <TableCell sx={{ color: "lightgray", border: "none" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((emp) => (
                <TableRow
                  key={emp.id}
                  sx={{
                    boxShadow: "0px 0px 1px 0px gray",
                    "&:hover": { backgroundColor: "#1a2540" },
                  }}
                >
                  <TableCell sx={{ color: "#ffa500", fontWeight: "bold", border: "none" }}>
                    {emp.id}
                  </TableCell>
                  <TableCell sx={{ color: "#fff", border: "none" }}>{emp.name}</TableCell>
                  <TableCell sx={{ color: "lightgray", border: "none" }}>
                    @{emp.username}
                  </TableCell>
                  <TableCell sx={{ color: "lightgray", border: "none" }}>
                    {emp.email}
                  </TableCell>
                  <TableCell sx={{ color: "lightgray", border: "none" }}>
                    {emp.structure?.name ?? "—"}
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    {emp.roles.map((r) => (
                      <span key={r.role.id}>{getRoleChip(r.role.type)}</span>
                    ))}
                  </TableCell>
                  <TableCell sx={{ border: "none" }} align="right">
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/admin/employees/${emp.id}`)}
                      sx={{ color: "#7fb3ff", "&:hover": { color: "orange" } }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(emp)}
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
        <Grid container spacing={2}>
          {filtered.map((emp) => (
            <Grid size={{ xs: 12 }} key={emp.id}>
              <Card
                sx={{ backgroundColor: "#1a2942", color: "#fff", borderRadius: 2, p: 2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: "bold", color: "#ffa500" }}>
                      #{emp.id}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {emp.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "lightgray" }}>
                      @{emp.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "lightgray" }}>
                      {emp.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "lightgray", mt: 0.5 }}>
                      {emp.structure?.name ?? "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/admin/employees/${emp.id}`)}
                      sx={{ color: "#7fb3ff" }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(emp)}
                      sx={{ color: "#f44336" }}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ mt: 1 }}>
                  {emp.roles.map((r) => (
                    <span key={r.role.id}>{getRoleChip(r.role.type)}</span>
                  ))}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
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
            <strong style={{ color: "#fff" }}>{deleteTarget?.name}</strong> (@
            {deleteTarget?.username})? This action cannot be undone.
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