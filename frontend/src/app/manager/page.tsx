"use client";

import * as React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { useMediaQuery, useTheme } from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { apiPost } from "@/lib/api";
import { getStoredEmployeeId } from "@/lib/authStorage";

type Employee = { id: number; name: string; username: string };

type Document = {
  id: number;
  status: string;
  type: string;
  createdAt: string;
  employee: Employee;
  exitSlip?: { exitTime: string; returnTime: string; gate: string };
  absenceAuth?: { startDate: string; endDate: string; reason: string };
  missionOrder?: { destination: string; duration: number; purpose: string };
};

type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  recentDocuments: Document[];
};

const typeLabel: Record<string, string> = {
  EXIT_SLIP: "Bon de sortie",
  ABSENCE_AUTH: "Autorisation d'absence",
  MISSION_ORDER: "Ordre de mission",
};

const formatReqNumber = (id: number, createdAt: string) => {
  const year = new Date(createdAt).getFullYear();
  return `REQ-${year}-${String(id).padStart(4, "0")}`;
};

const getDestinationOrMotif = (doc: Document) => {
  if (doc.missionOrder) return `${doc.missionOrder.destination} - ${doc.missionOrder.purpose}`;
  if (doc.absenceAuth) return doc.absenceAuth.reason;
  if (doc.exitSlip) return `Porte ${doc.exitSlip.gate}`;
  return "—";
};

const getStatusChip = (status: string) => {
  switch (status) {
    case "PENDING":
      return (
        <Chip
          label={"En attente"}
          sx={{
            backgroundColor: "var(--naftal-brand-muted)",
            color: "var(--naftal-brand)",
            fontWeight: "bold",
            border: "1px solid var(--naftal-brand)",
            borderRadius: "8px",
          }}
        />
      );
    case "APPROVED":
      return (
        <Chip
          label={"Approuvé"}
          sx={{
            backgroundColor: "var(--naftal-success-muted)",
            color: "var(--naftal-success)",
            fontWeight: "bold",
            border: "1px solid var(--naftal-success)",
            borderRadius: "8px",
          }}
        />
      );
    case "REJECTED":
      return (
        <Chip
          label={"Rejeté"}
          sx={{
            backgroundColor: "var(--naftal-error-muted)",
            color: "var(--naftal-error)",
            fontWeight: "bold",
            border: "1px solid var(--naftal-error)",
            borderRadius: "8px",
          }}
        />
      );
    default:
      return <Chip label={status} />;
  }
};

export default function ManagerHomePage() {
  const isSmallScreen = useMediaQuery(useTheme().breakpoints.down("sm"));
  const [stats, setStats]     = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState<string | null>(null);

  const getManagerId = () => getStoredEmployeeId();

  React.useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const managerId = getManagerId();
        if (!managerId) {
          throw new Error("Not logged in");
        }
        const data = await apiPost<Stats>("/api/manager/dashboard-stats", {
          ManagerId: managerId,
        });
        setStats(data);
      } catch {
        setError("Impossible de charger le tableau de bord.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "70px", // push below navbar
        backgroundColor: "var(--naftal-bg)",
        display: "grid",
        gridTemplateRows: "1fr auto",
        padding: "36px",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Box sx={{ width: "100% ", height: "100%" }}>
        <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "var(--naftal-text-primary)" }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize: "16px", color: "var(--naftal-text-muted)", marginBottom: "28px" }}>
          Vue ensemble des demandes de votre équipe
        </p>

      {loading && <p style={{ color: "var(--naftal-text-secondary)" }}>Chargement...</p>}

      {error && (
        <div style={{ color: "var(--naftal-error)", backgroundColor: "var(--naftal-error-muted)", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {stats && (
        <>
          <Grid container spacing={{ sm: 3, md: 3, lg: 3 }} columns={{ sm: 8, md: 12, lg: 16 }}>
            <Grid size={{ sm: 4, md: 6, lg: 4 }}>
              <Card
                sx={{
                  bgcolor: "var(--naftal-surface-2)",
                  color: "var(--naftal-text-primary)",
                  borderRadius: 2,
                  position: "relative",
                  boxShadow: "none",
                  p: 2,
                  width: "100%",
                  border: "0.1px solid transparent",
                  transition: "transform 0.1s",
                  "&:hover": {
                    borderColor: "var(--naftal-brand-strong)",
                    transform: "scale(1.01)",
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Avatar sx={{ bgcolor: "var(--naftal-info-muted)", width: 48, height: 48 }}>
                      <TextSnippetOutlinedIcon sx={{ color: "var(--naftal-info)" }} />
                    </Avatar>

                    <Box sx={{ textAlign: "right" }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                        <ArrowUpwardIcon sx={{ fontSize: 14, color: "var(--naftal-info)" }} />
                        <Typography variant="caption" sx={{ color: "var(--naftal-text-secondary)" }}>
                          +3 ce mois
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography variant="h3" sx={{ mt: 2, fontWeight: 700, color: "var(--naftal-text-primary)", fontSize: 34 }}>
                    {stats.total}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "var(--naftal-text-muted)" }}>
                    Total demandes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 4, md: 6, lg: 4 }}>
              <Card
                sx={{
                  bgcolor: "var(--naftal-surface-2)",
                  color: "var(--naftal-text-primary)",
                  borderRadius: 2,
                  position: "relative",
                  boxShadow: "none",
                  p: 2,
                  width: "100%",
                  border: "0.1px solid transparent",
                  transition: "transform 0.1s",
                  "&:hover": {
                    borderColor: "var(--naftal-brand-strong)",
                    transform: "scale(1.01)",
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Avatar sx={{ bgcolor: "var(--naftal-brand-muted)", width: 48, height: 48 }}>
                      <AccessTimeIcon sx={{ color: "var(--naftal-brand)" }} />
                    </Avatar>

                    <Box sx={{ textAlign: "right" }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                        <ArrowUpwardIcon sx={{ fontSize: 14, color: "var(--naftal-info)" }} />
                        <Typography variant="caption" sx={{ color: "var(--naftal-text-secondary)" }}>
                          + 2 new
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography variant="h3" sx={{ mt: 2, fontWeight: 700, color: "var(--naftal-text-primary)", fontSize: 34 }}>
                    {stats.pending}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "var(--naftal-text-muted)" }}>
                    En attente
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 4, md: 6, lg: 4 }}>
              <Card
                sx={{
                  bgcolor: "var(--naftal-surface-2)",
                  color: "var(--naftal-text-primary)",
                  borderRadius: 2,
                  position: "relative",
                  boxShadow: "none",
                  p: 2,
                  width: "100%",
                  border: "0.1px solid transparent",
                  transition: "transform 0.1s",
                  "&:hover": {
                    borderColor: "var(--naftal-brand-strong)",
                    transform: "scale(1.01)",
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Avatar sx={{ bgcolor: "var(--naftal-success-muted)", width: 48, height: 48 }}>
                      <TaskAltOutlinedIcon sx={{ color: "var(--naftal-success)" }} />
                    </Avatar>

                    <Box sx={{ textAlign: "right" }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                        <ArrowUpwardIcon sx={{ fontSize: 14, color: "var(--naftal-info)" }} />
                        <Typography variant="caption" sx={{ color: "var(--naftal-text-secondary)" }}>
                          + 62%
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography variant="h3" sx={{ mt: 2, fontWeight: 700, color: "var(--naftal-text-primary)", fontSize: 34 }}>
                    {stats.approved}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "var(--naftal-text-muted)" }}>
                    Approuve
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 4, md: 6, lg: 4 }}>
              <Card
                sx={{
                  bgcolor: "var(--naftal-surface-2)",
                  color: "var(--naftal-text-primary)",
                  borderRadius: 2,
                  position: "relative",
                  boxShadow: "none",
                  p: 2,
                  width: "100%",
                  border: "0.1px solid transparent",
                  transition: "transform 0.1s",
                  "&:hover": {
                    borderColor: "var(--naftal-brand-strong)",
                    transform: "scale(1.01)",
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Avatar sx={{ bgcolor: "var(--naftal-error-muted)", width: 48, height: 48 }}>
                      <CancelOutlinedIcon sx={{ color: "var(--naftal-error)" }} />
                    </Avatar>

                    <Box sx={{ textAlign: "right" }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                        <ArrowUpwardIcon sx={{ fontSize: 14, color: "var(--naftal-info)" }} />
                        <Typography variant="caption" sx={{ color: "var(--naftal-text-secondary)" }}>
                          +12%
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography variant="h3" sx={{ mt: 2, fontWeight: 700, color: "var(--naftal-text-primary)", fontSize: 34 }}>
                    {stats.rejected}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "var(--naftal-text-muted)" }}>
                    Rejete
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "30px",
              marginBottom: "30px",
            }}
          >

            <Typography variant="h5" sx={{ fontSize: "25px", fontWeight: "bold", color: "var(--naftal-text-primary)" }}>
              Les demandes récentes
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

          {stats.recentDocuments.length === 0 ? (
            <Typography variant="body1" sx={{ color: "var(--naftal-text-muted)", textAlign: "center", mt: 4 }}>
              No documents found
            </Typography>
          ) : !isSmallScreen ? (
            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: "var(--naftal-surface-2)",
                borderRadius: 2,
                overflowY: "auto",
                boxShadow: "var(--naftal-shadow-strong)",
                border: "1px solid var(--naftal-border-subtle)",
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: "var(--naftal-surface-0)", boxShadow: "0px 0px 1px 0px var(--naftal-border)" }}>
                  <TableRow>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Numéro</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Employé</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Type de demande</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Destination / Motif</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Date de soumission</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentDocuments.map((doc) => (
                    <TableRow
                      key={doc.id}
                      sx={{ boxShadow: "0px 0px 1px 0px var(--naftal-border)", "&:hover": { backgroundColor: "var(--naftal-surface-2-hover)" } }}
                    >
                      <TableCell sx={{ color: "var(--naftal-brand)", fontWeight: "bold", border: "none" }}>
                        {formatReqNumber(doc.id, doc.createdAt)}
                      </TableCell>
                      <TableCell sx={{ color: "var(--naftal-text-primary)", border: "none" }}>
                        <Typography sx={{ color: "var(--naftal-text-secondary)", fontWeight: 600, lineHeight: 1.2 }}>
                          {doc.employee?.name ?? "—"}
                        </Typography>
                        {!!doc.employee?.username && (
                          <Typography variant="caption" sx={{ color: "var(--naftal-text-muted)" }}>
                            {doc.employee.username}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "var(--naftal-text-primary)", border: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TextSnippetOutlinedIcon sx={{ color: "var(--naftal-text-muted)", width: "20px", marginRight: "8px" }} />
                          {typeLabel[doc.type] ?? doc.type}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "var(--naftal-text-primary)", border: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LocationOnIcon sx={{ color: "var(--naftal-text-muted)", marginRight: "8px" }} />
                          <Typography sx={{ color: "var(--naftal-text-secondary)" }}>{getDestinationOrMotif(doc)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "var(--naftal-text-primary)", border: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CalendarTodayIcon sx={{ color: "var(--naftal-text-muted)", marginRight: "8px" }} />
                          <Typography sx={{ color: "var(--naftal-text-secondary)" }}>{doc.createdAt.split("T")[0]}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ border: "none" }}>{getStatusChip(doc.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Grid container spacing={2}>
              {stats.recentDocuments.map((doc) => (
                <Grid size={{ xs: 12 }} key={doc.id}>
                  <Card
                    sx={{
                      backgroundColor: "var(--naftal-surface-2)",
                      color: "var(--naftal-text-primary)",
                      borderRadius: 2,
                      boxShadow: "var(--naftal-shadow-strong)",
                      padding: "16px",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "var(--naftal-brand)" }}>
                      {formatReqNumber(doc.id, doc.createdAt)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--naftal-text-secondary)" }}>
                      {doc.employee?.name ?? "—"}
                      {!!doc.employee?.username && ` (${doc.employee.username})`}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "var(--naftal-text-primary)" }}>
                      {typeLabel[doc.type] ?? doc.type}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <LocationOnIcon sx={{ color: "var(--naftal-text-muted)", marginRight: "8px" }} />
                      <Typography sx={{ color: "var(--naftal-text-secondary)" }}>{getDestinationOrMotif(doc)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <CalendarTodayIcon sx={{ color: "var(--naftal-text-muted)", marginRight: "8px" }} />
                      <Typography sx={{ color: "var(--naftal-text-secondary)" }}>{doc.createdAt.split("T")[0]}</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>{getStatusChip(doc.status)}</Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      </Box>
    </Box>
  );
}