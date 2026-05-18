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

const DOT = ({ color = "var(--naftal-border)" }: { color?: string }) => (
  <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, mt: "6px", flexShrink: 0 }} />
);

const Row = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", spacing: 2 }}>
      <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)", flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-secondary)", textAlign: "right" }}>{value}</Typography>
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
    document.status === "APPROVED" ? { bg: "var(--naftal-success-muted)", color: "var(--naftal-success)", border: "var(--naftal-success)" } :
    document.status === "REJECTED" ? { bg: "var(--naftal-error-muted)", color: "var(--naftal-error)", border: "var(--naftal-error)" } :
    { bg: "var(--naftal-warning-muted)", color: "var(--naftal-warning)", border: "var(--naftal-warning)" };
  const statusText =
    document.status === "APPROVED" ? "Approuvée" :
    document.status === "REJECTED" ? "Rejetée" :
    "En attente";
  return (
    <Box sx={{
      flexGrow: 1, mt: "70px",
      backgroundColor: "var(--naftal-bg)",
      padding: "36px", overflowY: "auto", overflowX: "hidden",
      width: "100%", height: "calc(100vh - 70px)",
    }}>
      <Box sx={{ width: "100%", height: "100%" }}>
        <ArrowBackOutlinedIcon onClick={() => router.back()} style={{ cursor: "pointer", color: "var(--naftal-text-secondary)" }} />
        <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "var(--naftal-text-primary)" }}>Détails de la demande</h1>
        <p style={{ fontSize: "20px", color: "var(--naftal-text-muted)", fontWeight: "bold", marginBottom: "20px" }}>
          Consultez les détails de votre demande et suivez son statut en temps réel.
        </p>

        {isLoading ? (
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", color: "var(--naftal-text-muted)", mt: 4 }}>
            <CircularProgress size={18} sx={{ color: "var(--naftal-text-muted)" }} />
            <Typography variant="body2">Chargement...</Typography>
          </Stack>
        ) : error ? (
          <Typography variant="body1" sx={{ color: "var(--naftal-error)", textAlign: "center", mt: 4 }}>{error}</Typography>
        ) : (
          <Grid container spacing={3} columns={{ sm: 12, md: 12, lg: 12 }}>

            {/* Left column */}
            <Grid size={{ xs: 12, md: 12 }}>

              {/* Main document card */}
              <Card sx={{ backgroundColor: "var(--naftal-surface-2)", border: "0.5px solid var(--naftal-border-subtle)", borderRadius: "12px", padding: "24px", color: "var(--naftal-text-primary)", mb: 2.5 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 0.5, alignItems: "center" }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "var(--naftal-warning)" }} />
                  <Typography sx={{ fontSize: "11px", color: "var(--naftal-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {typeLabel}
                  </Typography>
                </Stack>

                <Typography sx={{ fontSize: "18px", fontWeight: 500, mt: 0.5, mb: 0.5 }}>{typeLabel}</Typography>
                <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)", mb: 2 }}>
                  Soumise le {formatAlgeriaDateTime(document.createdAt)}
                </Typography>

                <Chip label={statusText} size="small" sx={{
                  fontSize: "12px", fontWeight: 500, borderRadius: "6px", mb: 2.5,
                  backgroundColor: statusColor.bg, color: statusColor.color,
                  border: `0.5px solid ${statusColor.border}`,
                }} />

                <Divider sx={{ backgroundColor: "var(--naftal-border-subtle)", mb: 2.5 }} />

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
                    <Divider sx={{ backgroundColor: "var(--naftal-border-subtle)" }} />
                    <Row label="Décision par" value={document.decisionMadeBy.name} />
                    {document.authIssuedAt && <Row label="Décidé le" value={formatAlgeriaDateTime(document.authIssuedAt)} />}
                  </>}
                </Stack>

                {document.managerComment && <>
                  <Divider sx={{ backgroundColor: "var(--naftal-border-subtle)", mt: 2.5, mb: 2 }} />
                  <Typography sx={{ fontSize: "11px", color: "var(--naftal-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
                    Commentaire du manager
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    {document.managerComment}
                  </Typography>
                </>}
              </Card>

              {/* Timeline card */}
              <Card sx={{ backgroundColor: "var(--naftal-surface-2)", border: "0.5px solid var(--naftal-border-subtle)", borderRadius: "12px", padding: "24px", color: "var(--naftal-text-primary)" }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "var(--naftal-info)" }} />
                  <Typography sx={{ fontSize: "11px", color: "var(--naftal-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Chronologie
                  </Typography>
                </Stack>

                <Stack spacing={0}>
                  {/* Submitted */}
                  <Stack direction="row" spacing={2}>
                    <Stack spacing={0} sx={{ alignItems: "center" }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--naftal-warning)", flexShrink: 0, mt: "3px" }} />
                      <Box sx={{ width: "1.5px", height: "36px", backgroundColor: "var(--naftal-border-subtle)" }} />
                    </Stack>
                    <Stack sx={{ pb: 1 }}>
                      <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-primary)", fontWeight: 500 }}>Soumise</Typography>
                      <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)" }}>{formatAlgeriaDateTime(document.createdAt)}</Typography>
                    </Stack>
                  </Stack>

                  {/* Under review */}
                  <Stack direction="row" spacing={2}>
                    <Stack spacing={0} sx={{ alignItems: "center" }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: document.status !== "PENDING" ? "var(--naftal-info)" : "var(--naftal-border)", flexShrink: 0, mt: "3px" }} />
                      <Box sx={{ width: "1.5px", height: "36px", backgroundColor: "var(--naftal-border-subtle)" }} />
                    </Stack>
                    <Stack sx={{ pb: 1 }}>
                      <Typography sx={{ fontSize: "13px", color: document.status !== "PENDING" ? "var(--naftal-text-primary)" : "var(--naftal-text-muted)", fontWeight: 500 }}>En cours d&apos;examen</Typography>
                      {document.status !== "PENDING" && <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)" }}>En traitement</Typography>}
                    </Stack>
                  </Stack>

                  {/* Final decision */}
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", mt: "3px", flexShrink: 0,
                      backgroundColor: document.status === "APPROVED" ? "var(--naftal-success)" : document.status === "REJECTED" ? "var(--naftal-error)" : "var(--naftal-border)"
                    }} />
                    <Stack>
                      <Typography sx={{ fontSize: "13px", fontWeight: 500,
                        color: document.status === "APPROVED" ? "var(--naftal-success)" : document.status === "REJECTED" ? "var(--naftal-error)" : "var(--naftal-text-muted)"
                      }}>
                        {document.status === "APPROVED" ? "Approuvée" : document.status === "REJECTED" ? "Rejetée" : "En attente de décision"}
                      </Typography>
                      {document.authIssuedAt && <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)" }}>{formatAlgeriaDateTime(document.authIssuedAt)}</Typography>}
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