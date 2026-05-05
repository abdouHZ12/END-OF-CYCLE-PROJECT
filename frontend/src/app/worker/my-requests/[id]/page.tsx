"use client";

import {useEffect, useState} from "react";
import Grid from "@mui/material/Grid";
import { apiGet , type ApiError} from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Document } from "@/features/documents/types";
import { useParams } from "next/navigation";
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { formatAlgeriaDateTime } from "@/lib/datetime";
import { getStoredEmployeeId } from "@/lib/authStorage";
import {
  Box, Card, Chip, Divider, Typography, CircularProgress
} from "@mui/material";
import Stack from "@mui/material/Stack";
const DOT = ({ color = "rgba(255,255,255,0.2)" }: { color?: string }) => (
  <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, mt: "6px", flexShrink: 0 }} />
);

const Row = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", spacing: 2 }}>
      <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", textAlign: "right" }}>{value}</Typography>
    </Stack>
  ) : null;

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [document, setDocument] = useState<Document>({} as Document);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true);
      setError("");
      try {
        const employeeId = getStoredEmployeeId();
        if (!employeeId) throw new Error("Employee ID is missing.");
        const res = await apiGet<Document>(`/api/employee/${employeeId}/document/${id}`);
        setDocument(res);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setError(apiErr.message || "Failed to fetch the document.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  const typeLabel =
    document.type === "EXIT_SLIP" ? "Bon de sortie" :
    document.type === "ABSENCE_AUTH" ? "Autorisation d'absence" :
    document.type === "MISSION_ORDER" ? "Ordre de mission" : "Document";

  const statusColor =
    document.status === "APPROVED" ? { bg: "rgba(74,222,128,0.1)", color: "#4ade80", border: "rgba(74,222,128,0.3)" } :
    document.status === "REJECTED" ? { bg: "rgba(248,113,113,0.1)", color: "#f87171", border: "rgba(248,113,113,0.3)" } :
    { bg: "rgba(255,165,0,0.1)", color: "#ffa500", border: "rgba(255,165,0,0.35)" };

  return (
    <Box sx={{
      flexGrow: 1, mt: "70px",
      backgroundColor: "rgb(10, 22, 40)",
      padding: "36px", overflowY: "auto", overflowX: "hidden",
      width: "100%", height: "calc(100vh - 70px)",
    }}>
      <Box sx={{ width: "100%", height: "100%" }}>
        <ArrowBackOutlinedIcon onClick={() => router.back()} style={{ cursor: "pointer", color: "lightgray" }} />
        <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "#fff" }}>Détails de la demande</h1>
        <p style={{ fontSize: "20px", color: "gray", fontWeight: "bold", marginBottom: "20px" }}>
          Consultez les détails de votre demande et suivez son statut en temps réel.
        </p>

        {isLoading ? (
          <Stack direction="row" spacing={2}  sx={{ alignItems: "center", color: "rgba(255,255,255,0.5)", mt: 4 }}>
            <CircularProgress size={18} sx={{ color: "rgba(255,255,255,0.4)" }} />
            <Typography variant="body2">Chargement...</Typography>
          </Stack>
        ) : error ? (
          <Typography variant="body1" sx={{ color: "#f87171", textAlign: "center", mt: 4 }}>{error}</Typography>
        ) : (
          <Grid container spacing={3} columns={{ sm: 12, md: 12, lg: 12 }}>

            {/* Left column */}
            <Grid size={{ xs: 12, md: 12 }}>

              {/* Main document card */}
              <Card sx={{ backgroundColor: "rgb(20,30,50)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px", color: "#fff", mb: 2.5 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 0.5 ,alignItems:"center" }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#ffa500" }} />
                  <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {typeLabel}
                  </Typography>
                </Stack>

                <Typography sx={{ fontSize: "18px", fontWeight: 500, mt: 0.5, mb: 0.5 }}>{typeLabel}</Typography>
                <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", mb: 2 }}>
                  Soumise le {formatAlgeriaDateTime(document.createdAt)}
                </Typography>

                <Chip label={document.status} size="small" sx={{
                  fontSize: "12px", fontWeight: 500, borderRadius: "6px", mb: 2.5,
                  backgroundColor: statusColor.bg, color: statusColor.color,
                  border: `0.5px solid ${statusColor.border}`,
                }} />

                <Divider sx={{ backgroundColor: "rgba(255,255,255,0.07)", mb: 2.5 }} />

                <Stack spacing={1.5}>
                  {document.type === "EXIT_SLIP" && <>
                    <Row label="Heure de sortie" value={document.exitSlip?.exitTime ? formatAlgeriaDateTime(document.exitSlip.exitTime) : null} />
                    <Row label="Heure de retour" value={document.exitSlip?.returnTime ? formatAlgeriaDateTime(document.exitSlip.returnTime) : null} />
                    <Row label="Porte et la Raision" value={document.exitSlip?.gate} />
                  </>}

                  {document.type === "ABSENCE_AUTH" && <>
                    <Row label="Date de début" value={document.absenceAuth?.startDate ? formatAlgeriaDateTime(document.absenceAuth.startDate) : null} />
                    <Row label="Date de fin" value={document.absenceAuth?.endDate ? formatAlgeriaDateTime(document.absenceAuth.endDate) : null} />
                    <Row label="Motif" value={document.absenceAuth?.reason} />
                  </>}

                  {document.type === "MISSION_ORDER" && <>
                    <Row label="Destination" value={document.missionOrder?.destination} />
                    <Row label="Durée" value={document.missionOrder?.duration ? `${document.missionOrder.duration} jour(s)` : null} />
                    <Row label="Moyen de transport" value={document.missionOrder?.travelMethod} />
                    <Row label="Objet" value={document.missionOrder?.purpose} />
                  </>}

                  {document.decisionMadeBy && <>
                    <Divider sx={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
                    <Row label="Décision par" value={document.decisionMadeBy.name} />
                    {document.authIssuedAt && <Row label="Décidé le" value={formatAlgeriaDateTime(document.authIssuedAt)} />}
                  </>}
                </Stack>

                {document.managerComment && <>
                  <Divider sx={{ backgroundColor: "rgba(255,255,255,0.07)", mt: 2.5, mb: 2 }} />
                  <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
                    Commentaire du manager
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    {document.managerComment}
                  </Typography>
                </>}
              </Card>

              {/* Timeline card */}
              <Card sx={{ backgroundColor: "rgb(20,30,50)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px", color: "#fff" }}>
                <Stack direction="row"  spacing={1} sx={{ mb: 2,alignItems:"center" }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#7f77dd" }} />
                  <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Chronologie
                  </Typography>
                </Stack>

                <Stack spacing={0}>
                  {/* Submitted */}
                  <Stack direction="row" spacing={2}>
                    <Stack spacing={0} sx={{ alignItems: "center" }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ffa500", flexShrink: 0, mt: "3px" }} />
                      <Box sx={{ width: "1.5px", height: "36px", backgroundColor: "rgba(255,255,255,0.1)" }} />
                    </Stack>
                    <Stack sx={{ pb: 1 }}>
                      <Typography sx={{ fontSize: "13px", color: "#fff", fontWeight: 500 }}>Soumise</Typography>
                      <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{formatAlgeriaDateTime(document.createdAt)}</Typography>
                    </Stack>
                  </Stack>

                  {/* Under review */}
                  <Stack direction="row" spacing={2}>
                    <Stack spacing={0} sx={{ alignItems: "center" }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: document.status !== "PENDING" ? "#7f77dd" : "rgba(255,255,255,0.15)", flexShrink: 0, mt: "3px" }} />
                      <Box sx={{ width: "1.5px", height: "36px", backgroundColor: "rgba(255,255,255,0.1)" }} />
                    </Stack>
                    <Stack sx={{ pb: 1 }}>
                      <Typography sx={{ fontSize: "13px", color: document.status !== "PENDING" ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: 500 }}>En cours d&apos;examen</Typography>
                      {document.status !== "PENDING" && <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>En traitement</Typography>}
                    </Stack>
                  </Stack>

                  {/* Final decision */}
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", mt: "3px", flexShrink: 0,
                      backgroundColor: document.status === "APPROVED" ? "#4ade80" : document.status === "REJECTED" ? "#f87171" : "rgba(255,255,255,0.15)"
                    }} />
                    <Stack>
                      <Typography sx={{ fontSize: "13px", fontWeight: 500,
                        color: document.status === "APPROVED" ? "#4ade80" : document.status === "REJECTED" ? "#f87171" : "rgba(255,255,255,0.3)"
                      }}>
                        {document.status === "APPROVED" ? "Approuvée" : document.status === "REJECTED" ? "Rejetée" : "En attente de décision"}
                      </Typography>
                      {document.authIssuedAt && <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{formatAlgeriaDateTime(document.authIssuedAt)}</Typography>}
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </Grid>

          </Grid>
        )}
      </Box>
    </Box>
  );
}