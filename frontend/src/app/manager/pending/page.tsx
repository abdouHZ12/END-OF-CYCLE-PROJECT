"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { apiPost, apiPut } from "@/lib/api";
import { getStoredEmployeeId } from "@/lib/authStorage";
import { formatAlgeriaDate, formatAlgeriaDateTime } from "@/lib/datetime";
import { useRouter } from "next/navigation";

type Employee = { id: number; name: string; username: string };

type Document = {
  id: number;
  status: string;
  type: string;
  createdAt: string;
  employee: Employee;
  exitSlip?: { exitTime: string; returnTime: string; gate: string };
  absenceAuth?: { startDate: string; endDate: string; reason: string };
  missionOrder?: { destination: string; duration: number; purpose: string; travelMethod: string };
};

type Decision = "APPROVED" | "REJECTED";

type DecisionDialogState =
  | {
      open: true;
      document: Document;
      decision: Decision;
    }
  | { open: false };

export default function PendingPage() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<number | null>(null);

  const [dialog, setDialog] = React.useState<DecisionDialogState>({ open: false });
  const [comment, setComment] = React.useState("");

  const router = useRouter();

  // get current manager id from localStorage
  const getManagerId = () => getStoredEmployeeId();

  const fetchPending = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const managerId = getManagerId();
      if (!managerId) {
        throw new Error("Not logged in");
      }
      const data = await apiPost<Document[]>("/api/manager/pending-documents", {
        ManagerId: managerId,
      });
      setDocuments(data);
    } catch {
      setError("Impossible de charger les demandes.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleDecision = async (documentId: number, decision: Decision, managerComment?: string) => {
    setActionLoading(documentId);
    try {
      const managerId = getManagerId();
      if (!managerId) {
        setError("Session manager invalide. Veuillez vous reconnecter.");
        return;
      }
      await apiPut(`/api/document/State/${documentId}`, {
        state: decision,
        ManagerId: managerId,
        managerComment: managerComment?.trim() ? managerComment.trim() : null,
      });
      // remove from list after decision
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    } catch {
      setError("Erreur lors de la décision.");
    } finally {
      setActionLoading(null);
    }
  };

  const typeLabel: Record<string, string> = {
    EXIT_SLIP: "Bon de sortie",
    ABSENCE_AUTH: "Autorisation d'absence",
    MISSION_ORDER: "Ordre de mission",
  };

  const titleForDecision = (decision: Decision) =>
    decision === "APPROVED" ? "Approuver la demande" : "Refuser la demande";

  const openDecisionDialog = (doc: Document, decision: Decision) => {
    setError(null);
    setComment("");
    setDialog({ open: true, document: doc, decision });
  };

  const closeDecisionDialog = () => {
    if (actionLoading) return;
    setDialog({ open: false });
    setComment("");
  };

  const confirmDecision = async () => {
    if (!dialog.open) return;
    await handleDecision(dialog.document.id, dialog.decision, comment);
    setDialog({ open: false });
    setComment("");
  };

  const renderDetails = (doc: Document) => {
    if (doc.exitSlip) {
      return (
        <Stack spacing={0.25}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Sortie: {formatAlgeriaDateTime(doc.exitSlip.exitTime)}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Retour: {formatAlgeriaDateTime(doc.exitSlip.returnTime)}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Porte: {doc.exitSlip.gate}
          </Typography>
        </Stack>
      );
    }

    if (doc.absenceAuth) {
      return (
        <Stack spacing={0.25}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Du {formatAlgeriaDate(doc.absenceAuth.startDate)} au {formatAlgeriaDate(doc.absenceAuth.endDate)}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Motif: {doc.absenceAuth.reason}
          </Typography>
        </Stack>
      );
    }

    if (doc.missionOrder) {
      return (
        <Stack spacing={0.25}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Destination: {doc.missionOrder.destination}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Durée: {doc.missionOrder.duration} jours
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Objet: {doc.missionOrder.purpose}
          </Typography>
        </Stack>
      );
    }

    return (
      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
        Aucun détail disponible.
      </Typography>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, mt: "70px", backgroundColor: "rgb(10, 22, 40)", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box>
            <Stack
              direction="row"
              sx={{ alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
                Demandes en attente
              </Typography>
              <Chip
                label={`${documents.length} en attente`}
                sx={{ backgroundColor: "rgba(255,165,0,0.15)", color: "#ffa500", fontWeight: 800 }}
              />
            </Stack>
            <Typography variant="body2" sx={{ mt: 1, color: "rgba(255,255,255,0.65)" }}>
              Approuver ou refuser les demandes de vos employés (commentaire optionnel).
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {loading ? (
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", color: "rgba(255,255,255,0.75)" }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Chargement…</Typography>
            </Stack>
          ) : null}

          {!loading && documents.length === 0 ? <Alert severity="info">Aucune demande en attente.</Alert> : null}

          <Grid container spacing={2}>
            {documents.map((doc) => (
              <Grid key={doc.id} size={{ xs: 12, md: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    backgroundColor: "#20314E",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
                      >
                        <Box>
                          <Typography variant="overline" sx={{ color: "#ffa500", fontWeight: 800 }}>
                            {typeLabel[doc.type] ?? doc.type}
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2 }}>
                            {doc.employee.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)" }}>
                            Soumis le {formatAlgeriaDateTime(doc.createdAt)}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label="EN ATTENTE"
                          sx={{ backgroundColor: "rgba(255,165,0,0.15)", color: "#ffa500", fontWeight: 800 }}
                        />
                      </Stack>

                      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

                      {renderDetails(doc)}
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                  <Stack direction="column" spacing={1.5} sx={{ width: "100%" }}>
                    <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<TaskAltOutlinedIcon />}
                        onClick={() => openDecisionDialog(doc, "APPROVED")}
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? "…" : "Approuver"}
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<CancelOutlinedIcon />}
                        onClick={() => openDecisionDialog(doc, "REJECTED")}
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? "…" : "Refuser"}
                      </Button>
                    </Stack>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={() => router.push(`/manager/pending/${doc.id}`)}
                      sx={{textTransform: "none"}}
                    >
                      Voir les détails
                    </Button>
                  </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>

      <Dialog open={dialog.open} onClose={closeDecisionDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6 }}>
          <Box component="span" sx={{ display: "block", fontWeight: 800 }}>
            {dialog.open ? titleForDecision(dialog.decision) : ""}
          </Box>
          <Box component="span" sx={{ display: "block", typography: "body2", color: "text.secondary" }}>
            {dialog.open
              ? `${typeLabel[dialog.document.type] ?? dialog.document.type} • ${dialog.document.employee.name}`
              : ""}
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="info">
              Vous pouvez laisser un commentaire (optionnel). Il sera associé à cette décision.
            </Alert>

            <TextField
              label="Commentaire (optionnel)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex: Merci de joindre un justificatif…"
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDecisionDialog} disabled={Boolean(actionLoading)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color={dialog.open && dialog.decision === "REJECTED" ? "error" : "success"}
            onClick={confirmDecision}
            disabled={dialog.open ? actionLoading === dialog.document.id : Boolean(actionLoading)}
          >
            {dialog.open
              ? actionLoading === dialog.document.id
                ? "…"
                : dialog.decision === "APPROVED"
                  ? "Confirmer l’approbation"
                  : "Confirmer le refus"
              : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}