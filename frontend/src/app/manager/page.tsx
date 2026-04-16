"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
          label={"Pending"}
          sx={{
            backgroundColor: "rgba(255, 165, 0, 0.1)",
            color: "orange",
            fontWeight: "bold",
            border: "1px solid #ffa500",
            borderRadius: "8px",
          }}
        />
      );
    case "APPROVED":
      return (
        <Chip
          label={"Approved"}
          sx={{
            backgroundColor: "rgba(0, 128, 0, 0.1)",
            color: "#4caf50",
            fontWeight: "bold",
            border: "1px solid #4caf50",
            borderRadius: "8px",
          }}
        />
      );
    case "REJECTED":
      return (
        <Chip
          label={"Rejected"}
          sx={{
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            color: "#f44336",
            fontWeight: "bold",
            border: "1px solid #f44336",
            borderRadius: "8px",
          }}
        />
      );
    default:
      return <Chip label={status} />;
  }
};

export default function ManagerHomePage() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery(useTheme().breakpoints.down("sm"));
  const [stats, setStats]     = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState<string | null>(null);

  const getManagerId = () => {
    const raw = localStorage.getItem("naftal.employee");
    if (!raw) return null;
    return JSON.parse(raw).id;
  };

  React.useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const managerId = getManagerId();
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
        backgroundColor: "rgb(10, 22, 40)",
        display: "grid",
        gridTemplateRows: "1fr auto",
        padding: "36px",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Box sx={{ width: "100% ", height: "100%" }}>
        <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "#fff" }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize: "16px", color: "gray", marginBottom: "28px" }}>
          Vue ensemble des demandes de votre équipe
        </p>

      {loading && <p style={{ color: "lightgray" }}>Chargement...</p>}

      {error && (
        <div style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {stats && (
        <>
          <Grid container spacing={{ sm: 3, md: 3, lg: 3 }} columns={{ sm: 8, md: 12, lg: 16 }}>
            <Grid size={{ sm: 4, md: 6, lg: 4 }}>
              <Card
                sx={{
                  bgcolor: "#1a2942",
                  color: "#fff",
                  borderRadius: 2,
                  position: "relative",
                  boxShadow: "none",
                  p: 2,
                  width: "100%",
                  border: "0.1px solid transparent",
                  transition: "transform 0.1s",
                  "&:hover": {
                    borderColor: "darkorange",
                    transform: "scale(1.01)",
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Avatar sx={{ bgcolor: "rgba(0, 0, 255, 0.1)", width: 48, height: 48 }}>
                      <TextSnippetOutlinedIcon sx={{ color: "#7fb3ff" }} />
                    </Avatar>

                    <Box sx={{ textAlign: "right" }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                        <ArrowUpwardIcon sx={{ fontSize: 14, color: "#7fb3ff" }} />
                        <Typography variant="caption" sx={{ color: "lightgray" }}>
                          +3 ce mois
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography variant="h3" sx={{ mt: 2, fontWeight: 700, color: "#fff", fontSize: 34 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Total demandes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 4, md: 6, lg: 4 }}>
              <Card
                sx={{
                  bgcolor: "#1a2942",
                  color: "#fff",
                  borderRadius: 2,
                  position: "relative",
                  boxShadow: "none",
                  p: 2,
                  width: "100%",
                  border: "0.1px solid transparent",
                  transition: "transform 0.1s",
                  "&:hover": {
                    borderColor: "darkorange",
                    transform: "scale(1.01)",
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Avatar sx={{ bgcolor: "rgba(255, 165, 0, 0.1)", width: 48, height: 48 }}>
                      <AccessTimeIcon sx={{ color: "#ffa500" }} />
                    </Avatar>

                    <Box sx={{ textAlign: "right" }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                        <ArrowUpwardIcon sx={{ fontSize: 14, color: "#7fb3ff" }} />
                        <Typography variant="caption" sx={{ color: "lightgray" }}>
                          + 2 new
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography variant="h3" sx={{ mt: 2, fontWeight: 700, color: "#fff", fontSize: 34 }}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 4, md: 6, lg: 4 }}>
              <Card
                sx={{
                  bgcolor: "#1a2942",
                  color: "#fff",
                  borderRadius: 2,
                  position: "relative",
                  boxShadow: "none",
                  p: 2,
                  width: "100%",
                  border: "0.1px solid transparent",
                  transition: "transform 0.1s",
                  "&:hover": {
                    borderColor: "darkorange",
                    transform: "scale(1.01)",
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Avatar sx={{ bgcolor: "rgba(0, 128, 0, 0.1)", width: 48, height: 48 }}>
                      <TaskAltOutlinedIcon sx={{ color: "#4caf50" }} />
                    </Avatar>

                    <Box sx={{ textAlign: "right" }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                        <ArrowUpwardIcon sx={{ fontSize: 14, color: "#7fb3ff" }} />
                        <Typography variant="caption" sx={{ color: "lightgray" }}>
                          + 62%
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography variant="h3" sx={{ mt: 2, fontWeight: 700, color: "#fff", fontSize: 34 }}>
                    {stats.approved}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Approved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 4, md: 6, lg: 4 }}>
              <Card
                sx={{
                  bgcolor: "#1a2942",
                  color: "#fff",
                  borderRadius: 2,
                  position: "relative",
                  boxShadow: "none",
                  p: 2,
                  width: "100%",
                  border: "0.1px solid transparent",
                  transition: "transform 0.1s",
                  "&:hover": {
                    borderColor: "darkorange",
                    transform: "scale(1.01)",
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Avatar sx={{ bgcolor: "rgba(255, 0, 0, 0.1)", width: 48, height: 48 }}>
                      <CancelOutlinedIcon sx={{ color: "#f44336" }} />
                    </Avatar>

                    <Box sx={{ textAlign: "right" }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                        <ArrowUpwardIcon sx={{ fontSize: 14, color: "#7fb3ff" }} />
                        <Typography variant="caption" sx={{ color: "lightgray" }}>
                          +12%
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography variant="h3" sx={{ mt: 2, fontWeight: 700, color: "#fff", fontSize: 34 }}>
                    {stats.rejected}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Rejected
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
            <Typography variant="h5" sx={{ fontSize: "25px", fontWeight: "bold", color: "#fff" }}>
              Recent Requests
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "white",
                color: "gray",
                textTransform: "none",
                borderRadius: 2,
                padding: "8px 16px",
                border: "1px solid gray",
                "&:hover": {
                  color: "orange",
                  backgroundColor: "rgba(255, 165, 0, 0.2)",
                  border: "1px solid orange",
                },
              }}
              onClick={() => {
                router.push("/manager/employees-history");
              }}
            >
              See all
            </Button>
          </Box>

          {stats.recentDocuments.length === 0 ? (
            <Typography variant="body1" sx={{ color: "gray", textAlign: "center", mt: 4 }}>
              No documents found
            </Typography>
          ) : !isSmallScreen ? (
            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: "#1a2942",
                borderRadius: 2,
                overflowY: "auto",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: "#10223A", boxShadow: "0px 0px 1px 0px gray" }}>
                  <TableRow>
                    <TableCell sx={{ color: "lightgray", border: "none" }}>Numéro</TableCell>
                    <TableCell sx={{ color: "lightgray", border: "none" }}>Employé</TableCell>
                    <TableCell sx={{ color: "lightgray", border: "none" }}>Type de demande</TableCell>
                    <TableCell sx={{ color: "lightgray", border: "none" }}>Destination / Motif</TableCell>
                    <TableCell sx={{ color: "lightgray", border: "none" }}>Date de soumission</TableCell>
                    <TableCell sx={{ color: "lightgray", border: "none" }}>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentDocuments.map((doc) => (
                    <TableRow
                      key={doc.id}
                      sx={{ boxShadow: "0px 0px 1px 0px gray", "&:hover": { backgroundColor: "#1a2540" } }}
                    >
                      <TableCell sx={{ color: "#ffa500", fontWeight: "bold", border: "none" }}>
                        {formatReqNumber(doc.id, doc.createdAt)}
                      </TableCell>
                      <TableCell sx={{ color: "#fff", border: "none" }}>
                        <Typography sx={{ color: "lightgray", fontWeight: 600, lineHeight: 1.2 }}>
                          {doc.employee?.name ?? "—"}
                        </Typography>
                        {!!doc.employee?.username && (
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                            {doc.employee.username}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "#fff", border: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TextSnippetOutlinedIcon sx={{ color: "gray", width: "20px", marginRight: "8px" }} />
                          {typeLabel[doc.type] ?? doc.type}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#fff", border: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LocationOnIcon sx={{ color: "gray", marginRight: "8px" }} />
                          <Typography sx={{ color: "lightgray" }}>{getDestinationOrMotif(doc)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#fff", border: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CalendarTodayIcon sx={{ color: "gray", marginRight: "8px" }} />
                          <Typography sx={{ color: "lightgray" }}>{doc.createdAt.split("T")[0]}</Typography>
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
                      backgroundColor: "#1a2942",
                      color: "#fff",
                      borderRadius: 2,
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                      padding: "16px",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffa500" }}>
                      {formatReqNumber(doc.id, doc.createdAt)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
                      {doc.employee?.name ?? "—"}
                      {!!doc.employee?.username && ` (${doc.employee.username})`}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#fff" }}>
                      {typeLabel[doc.type] ?? doc.type}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <LocationOnIcon sx={{ color: "gray", marginRight: "8px" }} />
                      <Typography sx={{ color: "lightgray" }}>{getDestinationOrMotif(doc)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <CalendarTodayIcon sx={{ color: "gray", marginRight: "8px" }} />
                      <Typography sx={{ color: "lightgray" }}>{doc.createdAt.split("T")[0]}</Typography>
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