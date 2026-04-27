"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FlightTakeoffOutlinedIcon from "@mui/icons-material/FlightTakeoffOutlined";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";

import { apiPost } from "@/lib/api";
import { getStoredEmployeeId } from "@/lib/authStorage";

type Employee = {
  id: number;
  name: string;
  username: string;
  issuedDocuments: Document[];
};

type Document = {
  id: number;
  status: string;
  type: string;
  createdAt: string;
  exitSlip?: { exitTime: string; returnTime: string; gate: string };
  absenceAuth?: { startDate: string; endDate: string; reason: string };
  missionOrder?: { destination: string; duration: number; purpose: string };
};

const typeLabel: Record<string, string> = {
  EXIT_SLIP: "Bon de sortie",
  ABSENCE_AUTH: "Autorisation d'absence",
  MISSION_ORDER: "Ordre de mission",
};

const getStatusChip = (status: string) => {
  switch (status) {
    case "PENDING":
      return (
        <Chip
          label={"EN ATTENTE"}
          size="small"
          sx={{
            backgroundColor: "rgba(255, 165, 0, 0.12)",
            color: "#ffa500",
            fontWeight: "bold",
            border: "1px solid #ffa500",
          }}
        />
      );
    case "APPROVED":
      return (
        <Chip
          label={"APPROUVÉ"}
          size="small"
          sx={{
            backgroundColor: "rgba(22, 163, 74, 0.12)",
            color: "#16a34a",
            fontWeight: "bold",
            border: "1px solid #16a34a",
          }}
        />
      );
    case "REJECTED":
      return (
        <Chip
          label={"REFUSÉ"}
          size="small"
          sx={{
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            color: "#ef4444",
            fontWeight: "bold",
            border: "1px solid #ef4444",
          }}
        />
      );
    default:
      return <Chip label={status} size="small" />;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "EXIT_SLIP":
      return <MeetingRoomOutlinedIcon fontSize="small" sx={{ color: "#ffa500" }} />;
    case "ABSENCE_AUTH":
      return <CalendarMonthOutlinedIcon fontSize="small" sx={{ color: "#ffa500" }} />;
    case "MISSION_ORDER":
      return <FlightTakeoffOutlinedIcon fontSize="small" sx={{ color: "#ffa500" }} />;
    default:
      return <TextSnippetOutlinedIcon fontSize="small" sx={{ color: "#ffa500" }} />;
  }
};

const getEmployeeInitials = (name: string) => {
  const parts = name
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean);
  const first = parts.at(0)?.[0] ?? "?";
  const last = parts.length > 1 ? parts.at(-1)?.[0] ?? "" : "";
  return (first + last).toUpperCase();
};

export default function EmployeesHistoryPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading]     = React.useState(true);
  const [error, setError]         = React.useState<string | null>(null);
  const [expanded, setExpanded]   = React.useState<number | null>(null);

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
        const data = await apiPost<Employee[]>("/api/manager/employees-history", {
          ManagerId: managerId,
        });
        setEmployees(data);
      } catch {
        setError("Impossible de charger l'historique.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-DZ", {
      day: "2-digit", month: "short", year: "numeric",
    });

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "70px",
        backgroundColor: "rgb(10, 22, 40)",
        minHeight: "100vh",
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#fff" }}>
          Historique des employés
        </Typography>
        <Typography sx={{ color: "gray", mb: 3 }}>
          Consulter historique des demandes de vos employés
        </Typography>

        {loading && (
          <Stack direction="row" spacing={1} sx={{ color: "lightgray", alignItems: "center" }}>
            <CircularProgress size={18} sx={{ color: "#ffa500" }} />
            <Typography>Chargement...</Typography>
          </Stack>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              "& .MuiAlert-icon": { color: "#ef4444" },
            }}
          >
            {error}
          </Alert>
        )}

        {!loading && employees.length === 0 && (
          <Paper
            sx={{
              mt: 6,
              p: 3,
              textAlign: "center",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: 2,
              color: "lightgray",
            }}
          >
            Aucun employé trouvé
          </Paper>
        )}

        <Stack spacing={2}>
          {employees.map((emp) => (
            <Accordion
              key={emp.id}
              expanded={expanded === emp.id}
              onChange={(_, isExpanded) => setExpanded(isExpanded ? emp.id : null)}
              disableGutters
              sx={{
                backgroundColor: "#20314E",
                borderRadius: 2,
                overflow: "hidden",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#ffa500" }} />}
                sx={{
                  px: 2.5,
                  py: 1,
                  "& .MuiAccordionSummary-content": { my: 0 },
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ width: "100%", alignItems: "center", justifyContent: "space-between" }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: "rgba(255, 165, 0, 0.18)",
                        color: "#ffa500",
                        fontWeight: "bold",
                        width: 38,
                        height: 38,
                      }}
                    >
                      {getEmployeeInitials(emp.name)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ color: "#fff", fontWeight: "bold", lineHeight: 1.2 }}>
                        {emp.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "gray" }}>
                        @{emp.username} · {emp.issuedDocuments.length} demande(s)
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    icon={<PersonOutlineOutlinedIcon />}
                    label={String(emp.issuedDocuments.length)}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      color: "#fff",
                      "& .MuiChip-icon": { color: "#ffa500" },
                    }}
                  />
                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.08)" }} />

                {emp.issuedDocuments.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "gray" }}>
                    Aucune demande
                  </Typography>
                ) : (
                  <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {emp.issuedDocuments.map((doc) => (
                      <ListItem
                        key={doc.id}
                        disableGutters
                        sx={{
                          p: 0,
                        }}
                      >
                        <Paper
                          sx={{
                            width: "100%",
                            p: 2,
                            backgroundColor: "rgba(255,255,255,0.04)",
                            borderRadius: 2,
                          }}
                        >
                          <Stack spacing={1.25}>
                            <Stack
                              direction="row"
                              spacing={2}
                              sx={{ alignItems: "center", justifyContent: "space-between" }}
                            >
                              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                {getTypeIcon(doc.type)}
                                <Typography sx={{ color: "#ffa500", fontWeight: "bold", fontSize: 13 }}>
                                  {typeLabel[doc.type] ?? doc.type}
                                </Typography>
                              </Stack>
                              {getStatusChip(doc.status)}
                            </Stack>

                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                              <AccessTimeOutlinedIcon sx={{ color: "gray" }} fontSize="small" />
                              <Typography variant="caption" sx={{ color: "gray" }}>
                                Soumis le {formatDate(doc.createdAt)}
                              </Typography>
                            </Stack>

                            {doc.exitSlip && (
                              <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                                <MeetingRoomOutlinedIcon sx={{ color: "lightgray", mt: "2px" }} fontSize="small" />
                                <Typography variant="body2" sx={{ color: "lightgray" }}>
                                  Sortie: {formatDate(doc.exitSlip.exitTime)} — Retour: {formatDate(doc.exitSlip.returnTime)} — Porte: {doc.exitSlip.gate}
                                </Typography>
                              </Stack>
                            )}

                            {doc.absenceAuth && (
                              <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                                <CalendarMonthOutlinedIcon sx={{ color: "lightgray", mt: "2px" }} fontSize="small" />
                                <Typography variant="body2" sx={{ color: "lightgray" }}>
                                  Du {formatDate(doc.absenceAuth.startDate)} au {formatDate(doc.absenceAuth.endDate)} — {doc.absenceAuth.reason}
                                </Typography>
                              </Stack>
                            )}

                            {doc.missionOrder && (
                              <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                                <FlightTakeoffOutlinedIcon sx={{ color: "lightgray", mt: "2px" }} fontSize="small" />
                                <Typography variant="body2" sx={{ color: "lightgray" }}>
                                  {doc.missionOrder.destination} — {doc.missionOrder.duration} jours — {doc.missionOrder.purpose}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Paper>
                      </ListItem>
                    ))}
                  </List>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}