"use client";

import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

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
  Chip,
} from "@mui/material";
import { apiGet, type ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useMediaQuery, useTheme } from "@mui/material";


type Role = {
  role: {
    id: number;
    name: string;
    type: string;
  };
};

type Employee = {
  id: number;
  name: string;
  username: string;
  email: string;
  structure: { id: number; name: string };
  roles: Role[];
};

type Structure = {
  id: number;
  name: string;
  _count: { employees: number };
};


export const getRoleChip = (type: string) => {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    ADMIN:   { label: "Admin",   color: "var(--naftal-error)", bg: "var(--naftal-error-muted)",  border: "var(--naftal-error)" },
    MANAGER: { label: "Manager", color: "var(--naftal-brand)", bg: "var(--naftal-brand-muted)", border: "var(--naftal-brand)" },
    WORKER:  { label: "Worker",  color: "var(--naftal-success)", bg: "var(--naftal-success-muted)", border: "var(--naftal-success)" },
    AGENT:   { label: "Agent",   color: "var(--naftal-info)", bg: "var(--naftal-info-muted)", border: "var(--naftal-info)" },
  };
  const s = map[type] ?? { label: type, color: "var(--naftal-text-primary)", bg: "transparent", border: "var(--naftal-text-primary)" };
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{
        backgroundColor: s.bg,
        color: s.color,
        fontWeight: "bold",
        border: `1px solid ${s.border}`,
        borderRadius: "8px",
        mr: 0.5,
      }}
    />
  );
};


function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  trend,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: number | string;
  label: string;
  trend: string;
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
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <ArrowUpwardIcon sx={{ fontSize: 14, color: "var(--naftal-info)" }} />
            <Typography variant="caption" sx={{ color: "var(--naftal-text-secondary)" }}>
              {trend}
            </Typography>
          </Stack>
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


export default function AdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const adminCount   = employees.filter(e => e.roles.some(r => r.role.type === "ADMIN")).length;
  const managerCount = employees.filter(e => e.roles.some(r => r.role.type === "MANAGER")).length;

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

      <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--naftal-text-primary)" }}>
        Admin Dashboard
      </Typography>
      <Typography sx={{ fontSize: "20px", color: "var(--naftal-text-muted)", fontWeight: "bold", mb: 3 }}>
        Manage employees, roles and departments
      </Typography>


      <Grid container spacing={{ sm: 3, md: 3 }} columns={{ sm: 8, md: 12, lg: 16 }}>
        <Grid size={{ sm: 4, md: 6, lg: 4 }}>
          <StatCard
            icon={<PeopleOutlinedIcon />}
            iconBg="var(--naftal-info-muted)"
            iconColor="var(--naftal-info)"
            value={employees.length}
            label="Employees Totales"
            trend="+2 this month"
          />
        </Grid>
        <Grid size={{ sm: 4, md: 6, lg: 4 }}>
          <StatCard
            icon={<AdminPanelSettingsOutlinedIcon />}
            iconBg="var(--naftal-error-muted)"
            iconColor="var(--naftal-error)"
            value={adminCount}
            label="Admins"
            trend="stable"
          />
        </Grid>
        <Grid size={{ sm: 4, md: 6, lg: 4 }}>
          <StatCard
            icon={<ManageAccountsOutlinedIcon />}
            iconBg="var(--naftal-brand-muted)"
            iconColor="var(--naftal-brand)"
            value={managerCount}
            label="Managers"
            trend="+1 this month"
          />
        </Grid>
        <Grid size={{ sm: 4, md: 6, lg: 4 }}>
          <StatCard
            icon={<AccountTreeOutlinedIcon />}
            iconBg="var(--naftal-success-muted)"
            iconColor="var(--naftal-success)"
            value={structures.length}
            label="Departments"
            trend="stable"
          />
        </Grid>
      </Grid>


      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4, mb: 3 }}>

        <Typography variant="h5" sx={{ fontWeight: "bold", color: "var(--naftal-text-primary)" }}>
          Recent Employees
        </Typography>
              <Button
                variant="outlined"
                sx={{
                  backgroundColor: "transparent",
                  color: "var(--naftal-text-secondary)",
                  textTransform: "none",
                  borderRadius: 2,
                  padding: "8px 16px",
                  border: "1px solid var(--naftal-border-subtle)",
                  "&:hover": {
                    color: "var(--naftal-brand)",
                    backgroundColor: "var(--naftal-brand-muted)",
                    border: "1px solid var(--naftal-brand)",
                  },
                }}
              >
                Voir tout
              </Button>
      </Box>

      {isLoading ? (
        <Typography sx={{ color: "var(--naftal-text-muted)", textAlign: "center", mt: 4 }}>
          Loading...
        </Typography>
      ) : error ? (
        <Typography sx={{ color: "red", textAlign: "center", mt: 4 }}>
          {error}
        </Typography>
      ) : employees.length === 0 ? (
        <Box sx={{ backgroundColor: "var(--naftal-surface-2)", borderRadius: "12px", p: 4, textAlign: "center" }}>
          <Typography sx={{ color: "var(--naftal-text-secondary)", fontSize: "20px" }}>No employees found</Typography>
        </Box>
      ) : !isSmallScreen ? (
        // ── Desktop Table ──
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
            <TableHead sx={{ bgcolor: "var(--naftal-surface-0)", boxShadow: "0px 0px 1px 0px var(--naftal-border)" }}>
              <TableRow>

                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>ID</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Name</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Username</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Department</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Roles</TableCell>
                <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.slice(0, 8).map((emp) => (
                <TableRow
                  key={emp.id}
                  sx={{ boxShadow: "0px 0px 1px 0px var(--naftal-border)", "&:hover": { backgroundColor: "var(--naftal-surface-2-hover)" } }}
                >
                  <TableCell sx={{ color: "var(--naftal-brand)", fontWeight: "bold", border: "none" }}>
                    {emp.id}
                  </TableCell>
                  <TableCell sx={{ color: "var(--naftal-text-primary)", border: "none" }}>{emp.name}</TableCell>
                  <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>@{emp.username}</TableCell>
                  <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>
                    {emp.structure?.name ?? "—"}
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    {emp.roles.map((r) => (
                      <span key={r.role.id}>{getRoleChip(r.role.type)}</span>
                    ))}
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <Button
                      size="small"
                      sx={{
                        color: "var(--naftal-info)",
                        textTransform: "none",
                        "&:hover": { color: "var(--naftal-brand)" },
                      }}
                      onClick={() => router.push(`/admin/employees/${emp.id}`)}
                    >
                      gerer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        
        <Grid container spacing={2}>
          {employees.slice(0, 8).map((emp) => (
            <Grid size={{ xs: 12 }} key={emp.id}>
              <Card sx={{ backgroundColor: "var(--naftal-surface-2)", color: "var(--naftal-text-primary)", borderRadius: 2, p: 2 }}>
                <Typography sx={{ fontWeight: "bold", color: "var(--naftal-brand)" }}>#{emp.id}</Typography>
                <Typography variant="body1">{emp.name}</Typography>
                <Typography variant="body2" sx={{ color: "var(--naftal-text-secondary)" }}>
                  @{emp.username}
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--naftal-text-secondary)", mt: 0.5 }}>
                  {emp.structure?.name ?? "—"}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {emp.roles.map((r) => (
                    <span key={r.role.id}>{getRoleChip(r.role.type)}</span>
                  ))}
                </Box>
                <Button
                  size="small"
                  sx={{ mt: 1, color: "var(--naftal-info)", textTransform: "none" }}
                  onClick={() => router.push(`/admin/employees/${emp.id}`)}
                >
                  Manage
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ position: "fixed", bottom: "40px", right: "40px", zIndex: 1000 }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "var(--naftal-brand)",
            color: "black",
            textTransform: "none",
            borderRadius: 10,
            padding: "12px 25px",
            fontWeight: "bold",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.05)", backgroundColor: "var(--naftal-brand-strong)" },
          }}
          onClick={() => router.push("/admin/employees/register")}
        >
          <Typography sx={{ mr: "15px" }}>+</Typography>
          <Typography>Nouveau Employee</Typography>
        </Button>
      </Box>
    </Box>
  );
}