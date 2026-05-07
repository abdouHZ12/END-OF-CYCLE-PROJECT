"use client";

import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { apiGet, type ApiError } from "@/lib/api";
import { formatAlgeriaDateTime } from "@/lib/datetime";
import { getStoredEmployeeId } from "@/lib/authStorage";
import type { Document } from "@/features/documents/types";
import { useParams, useRouter } from "next/navigation";
import { Box, Card, Chip, Divider, Typography, CircularProgress } from "@mui/material";

const Row = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", spacing: 2 }}>
      <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)", flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-secondary)", textAlign: "right" }}>{value}</Typography>
    </Stack>
  ) : null;

const getStatusTone = (status?: string) => {
  if (status === "APPROVED") {
    return { bg: "var(--naftal-success-muted)", color: "var(--naftal-success)", border: "var(--naftal-success)" };
  }
  if (status === "REJECTED") {
    return { bg: "var(--naftal-error-muted)", color: "var(--naftal-error)", border: "var(--naftal-error)" };
  }
  return { bg: "var(--naftal-warning-muted)", color: "var(--naftal-warning)", border: "var(--naftal-warning)" };
};

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

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

  const handleBack = () => {
    router.back();
  };

  const typeLabel =
    document.type === "EXIT_SLIP" ? "Exit Slip" :
    document.type === "ABSENCE_AUTH" ? "Absence Authorization" :
    document.type === "MISSION_ORDER" ? "Mission Order" : "Document";

  const statusTone = getStatusTone(document.status);

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "70px",
        backgroundColor: "var(--naftal-bg)",
        display: "grid",
        gridTemplateRows: "1fr auto",
        padding: "36px",
        overflowY: "auto",
        overflowX: "hidden",
        width: "100%",
        height: "calc(100vh - 70px)",
      }}
    >
      <Box sx={{ width: "100%", height: "100%" }}>
        <ArrowBackOutlinedIcon
          onClick={handleBack}
          style={{ cursor: "pointer", color: "var(--naftal-text-secondary)" }}
        />
        <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "var(--naftal-text-primary)" }}>
          Request Details
        </h1>
        <p
          style={{
            fontSize: "20px",
            color: "var(--naftal-text-muted)",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Review your request details and status.
        </p>

        {isLoading ? (
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", color: "var(--naftal-text-muted)", mt: 4 }}>
            <CircularProgress size={18} sx={{ color: "var(--naftal-text-muted)" }} />
            <Typography variant="body2">Loading...</Typography>
          </Stack>
        ) : error ? (
          <Typography variant="body1" sx={{ color: "var(--naftal-error)", textAlign: "center", mt: 4 }}>
            {error}
          </Typography>
        ) : (
          <Grid container spacing={3} columns={{ xs: 12, md: 12, lg: 12 }}>
            <Grid size={{ xs: 12, md: 7, lg: 7 }}>
              <Card
                sx={{
                  backgroundColor: "var(--naftal-surface-2)",
                  border: "1px solid var(--naftal-border-subtle)",
                  borderRadius: "12px",
                  padding: "24px",
                  color: "var(--naftal-text-primary)",
                  boxShadow: "var(--naftal-shadow-soft)",
                  mb: 2.5,
                }}
              >
                <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: statusTone.color }} />
                  <Typography sx={{ fontSize: "11px", color: "var(--naftal-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {typeLabel}
                  </Typography>
                </Stack>

                <Typography sx={{ fontSize: "18px", fontWeight: 600, mt: 0.5, mb: 0.5 }}>
                  {typeLabel}
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)", mb: 2 }}>
                  Submitted on {formatAlgeriaDateTime(document.createdAt)}
                </Typography>

                <Chip
                  label={document.status}
                  size="small"
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    mb: 2.5,
                    backgroundColor: statusTone.bg,
                    color: statusTone.color,
                    border: `1px solid ${statusTone.border}`,
                  }}
                />

                <Divider sx={{ backgroundColor: "var(--naftal-border-subtle)", mb: 2.5 }} />

                <Stack spacing={1.5}>
                  {document.type === "EXIT_SLIP" ? (
                    <>
                      <Row label="Leave time" value={document.exitSlip?.exitTime ? formatAlgeriaDateTime(document.exitSlip.exitTime) : null} />
                      <Row label="Return time" value={document.exitSlip?.returnTime ? formatAlgeriaDateTime(document.exitSlip.returnTime) : null} />
                      <Row label="Gate" value={document.exitSlip?.gate} />
                    </>
                  ) : null}

                  {document.type === "ABSENCE_AUTH" ? (
                    <>
                      <Row label="Start date" value={document.absenceAuth?.startDate ? formatAlgeriaDateTime(document.absenceAuth.startDate) : null} />
                      <Row label="End date" value={document.absenceAuth?.endDate ? formatAlgeriaDateTime(document.absenceAuth.endDate) : null} />
                      <Row label="Reason" value={document.absenceAuth?.reason} />
                    </>
                  ) : null}

                  {document.type === "MISSION_ORDER" ? (
                    <>
                      <Row label="Destination" value={document.missionOrder?.destination} />
                      <Row label="Duration" value={document.missionOrder?.duration ? `${document.missionOrder.duration} day(s)` : null} />
                      <Row label="Travel method" value={document.missionOrder?.travelMethod} />
                      <Row label="Purpose" value={document.missionOrder?.purpose} />
                    </>
                  ) : null}

                  {document.decisionMadeBy ? (
                    <>
                      <Divider sx={{ backgroundColor: "var(--naftal-border-subtle)" }} />
                      <Row label="Decision by" value={document.decisionMadeBy.name} />
                      {document.authIssuedAt ? (
                        <Row label="Decision date" value={formatAlgeriaDateTime(document.authIssuedAt)} />
                      ) : null}
                    </>
                  ) : null}
                </Stack>

                {document.managerComment ? (
                  <>
                    <Divider sx={{ backgroundColor: "var(--naftal-border-subtle)", mt: 2.5, mb: 2 }} />
                    <Typography sx={{ fontSize: "11px", color: "var(--naftal-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
                      Manager comment
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {document.managerComment}
                    </Typography>
                  </>
                ) : null}
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 5, lg: 5 }}>
              <Card
                sx={{
                  backgroundColor: "var(--naftal-surface-2)",
                  border: "1px solid var(--naftal-border-subtle)",
                  borderRadius: "12px",
                  padding: "24px",
                  color: "var(--naftal-text-primary)",
                  boxShadow: "var(--naftal-shadow-soft)",
                  mb: 2.5,
                }}
              >
                <Typography sx={{ fontSize: "11px", color: "var(--naftal-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 2 }}>
                  Timeline
                </Typography>

                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--naftal-brand)", mt: "3px", flexShrink: 0 }} />
                    <Stack>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>Submitted</Typography>
                      <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)" }}>
                        {formatAlgeriaDateTime(document.createdAt)}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: document.status !== "PENDING" ? "var(--naftal-info)" : "var(--naftal-border)",
                        mt: "3px",
                        flexShrink: 0,
                      }}
                    />
                    <Stack>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: document.status !== "PENDING" ? "var(--naftal-text-primary)" : "var(--naftal-text-muted)",
                        }}
                      >
                        Under review
                      </Typography>
                      {document.status !== "PENDING" ? (
                        <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)" }}>In progress</Typography>
                      ) : null}
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor:
                          document.status === "APPROVED" ? "var(--naftal-success)" :
                          document.status === "REJECTED" ? "var(--naftal-error)" :
                          "var(--naftal-border)",
                        mt: "3px",
                        flexShrink: 0,
                      }}
                    />
                    <Stack>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color:
                            document.status === "APPROVED" ? "var(--naftal-success)" :
                            document.status === "REJECTED" ? "var(--naftal-error)" :
                            "var(--naftal-text-muted)",
                        }}
                      >
                        {document.status === "APPROVED" ? "Approved" : document.status === "REJECTED" ? "Rejected" : "Awaiting decision"}
                      </Typography>
                      {document.authIssuedAt ? (
                        <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)" }}>
                          {formatAlgeriaDateTime(document.authIssuedAt)}
                        </Typography>
                      ) : null}
                    </Stack>
                  </Stack>
                </Stack>
              </Card>

              <Card
                sx={{
                  backgroundColor: "var(--naftal-surface-2)",
                  border: "1px solid var(--naftal-border-subtle)",
                  borderRadius: "12px",
                  padding: "20px",
                  color: "var(--naftal-text-primary)",
                  boxShadow: "var(--naftal-shadow-soft)",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
                  QR Verification Code
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: "150px",
                    backgroundColor: "var(--naftal-surface-3)",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--naftal-text-primary)" }}>
                    QR
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {document.qrCode || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--naftal-text-muted)", marginTop: "10px" }}>
                  Present this code to security.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
