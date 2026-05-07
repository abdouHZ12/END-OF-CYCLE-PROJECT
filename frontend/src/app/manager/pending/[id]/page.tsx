"use client"

import {useEffect, useState} from "react";
import Grid from "@mui/material/Grid";
import { apiGet , type ApiError} from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Document } from "@/features/documents/types";
import { useParams } from "next/navigation";
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { formatAlgeriaDateTime } from "@/lib/datetime";
import { getStoredEmployeeId } from "@/lib/authStorage";
import {  apiPut } from "@/lib/api";
import {
  Box,
  Card,
  Chip,
  Divider,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CardActions
} from "@mui/material";
import Stack from "@mui/material/Stack";
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

type LeaveSession = {
  id: number;
  status : string;
  leaveTime: string;
  returnTime:  string;
  createdAt: string;
  documentId: number;
};
type DSSRecommendation = {
  suggestion:{
      recommendation: string;
      score: number;
      reasons: string[];
      notReturned?: LeaveSession[];
      rejections?: Document[];
      approvedDocs?: Document[];
  },
  document : Document;

};

type Decision = "APPROVED" | "REJECTED";

type DecisionDialogState =
  | {
      open: true;
      document: Document;
      decision: Decision;
    }
  | { open: false };


export default function Page() {

  const router = useRouter();  
  const params = useParams();
  const id = parseInt(params.id as string);
  const getManagerId = () => getStoredEmployeeId();


  const [document, setDocument] = useState<Document>({} as Document);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dssRecommendation, setDssRecommendation] = useState<{ recommendation: string; score: number; reasons: string[] } | null>(null);  
  const [dialog, setDialog] = useState<DecisionDialogState>({ open: false });
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [request , setRequest] = useState<boolean>(false);
  const [notReturned, setNotReturned] = useState<LeaveSession[]>([]);
  const [rejections, setRejections] = useState<Document[]>([]);
  const [approvedDocs, setApprovedDocs] = useState<Document[]>([]);

    const typeLabel: Record<string, string> = {
    EXIT_SLIP: "Bon de sortie",
    ABSENCE_AUTH: "Autorisation d'absence",
    MISSION_ORDER: "Ordre de mission",
  };

const handleBack = () => {
    router.back();
  }

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("fr-DZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


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
      // go back from list after decision
      handleBack();
    } catch {
      setError("Erreur lors de la décision.");
    } finally {
      setActionLoading(null);
    }
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


  useEffect(() => {
    const fetchDocumentAndRecommendation = async () => {
      try {
        setIsLoading(true);
        setError("");

        console.log("Fetching document and DSS recommendation for document ID:", id , typeof id);
        const dss = await apiGet<DSSRecommendation>(`/api/document/suggestion/${id}`);
        setDssRecommendation(dss.suggestion);
        setDocument(dss.document);
        setNotReturned(dss.suggestion.notReturned || []);
        setRejections(dss.suggestion.rejections || []);
        setApprovedDocs(dss.suggestion.approvedDocs || []);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentAndRecommendation();
  }, [id]);
  

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
            width: "100%",
            height: "calc(100vh - 70px)",
          }}
        >
        <Box sx={{width:"100% ", height: "100%"}}>

            <ArrowBackOutlinedIcon onClick={handleBack} style={{ cursor: "pointer" , color:"var(--naftal-text-secondary)"}} />
            <h1 style={{ fontSize: "35px", fontWeight: "bold" , color:"var(--naftal-text-primary)" }}>
              Dashboard
            </h1>
            <p
              style={{
                fontSize: "20px ",
                color: "var(--naftal-text-muted)",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              vous pouvez approuver ou refuser cette demande après avoir consulté les détails et la recommendation de system d&apos;aide
            </p>

            {isLoading ? (
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", color: "var(--naftal-text-secondary)" }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Chargement…</Typography>
                </Stack>
            ) : error  ? (
                <Typography variant="body1" sx={{ color: "red", textAlign: "center", mt: 4 }}>
                      {error}
                </Typography>) :
                !request ? (
                <Grid container spacing={3} columns={{ sm: 8, md: 16, lg: 16 }}>

                  {/* Document Card */}
                  <Grid size={{ xs: 12, md: 12, lg: 8 }}>
                    <Card sx={{
                      backgroundColor: "var(--naftal-surface-2)",
                      border: "0.5px solid var(--naftal-border-subtle)",
                      borderRadius: "12px",
                      padding: "24px",
                      color: "var(--naftal-text-primary)",
                    }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 0.5, alignItems: "center" }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--naftal-brand)" }} />
                        <Typography sx={{ fontSize: "11px", color: "var(--naftal-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          Document
                        </Typography>
                      </Stack>

                      <Typography variant="h6" sx={{ fontWeight: 500, fontSize: "18px", mt: 0.5 }}>
                        {document.type === "EXIT_SLIP" ? "Bon de sortie"
                          : document.type === "ABSENCE_AUTH" ? "Autorisation d'absence"
                          : document.type === "MISSION_ORDER" ? "Ordre de mission"
                          : "Document"}
                      </Typography>

                      <Typography variant="h6" sx={{ fontWeight: 500, fontSize: "18px", mt: 0.5 }}>
                        {document.type === "ABSENCE_AUTH" ? document.absenceAuth &&  document.absenceAuth.reason
                          : null}
                      </Typography>


                      <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)", mb: 2.5 }}>
                        Soumise le {getFullDate(document.createdAt)}
                      </Typography>

                      <Divider sx={{ backgroundColor: "var(--naftal-border-subtle)", mb: 2.5 }} />

                      <Stack spacing={1.5}>
                        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)" }}>Statut</Typography>
                          <Chip label={document.status} size="small" sx={{
                            fontSize: "12px", fontWeight: 500,
                            backgroundColor: "var(--naftal-brand-muted)",
                            color: "var(--naftal-brand)",
                            border: "0.5px solid var(--naftal-brand-border)",
                            borderRadius: "6px",
                          }} />
                        </Stack>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)" }}>Référence</Typography>
                          <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-secondary)" }}>
                            {`REQ-${new Date(document.createdAt).getFullYear()}-${String(document.id).padStart(4, "0")}`}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>

                  {/* DSS Card */}
                  <Grid size={{ xs: 12, md: 12, lg: 8 }}>
                    <Card sx={{
                      backgroundColor: "var(--naftal-surface-2)",
                      border: "0.5px solid var(--naftal-border-subtle)",
                      borderRadius: "12px",
                      padding: "24px",
                      color: "var(--naftal-text-primary)",
                    }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 0.5, alignItems: "center" }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--naftal-info)" }} />
                        <Typography sx={{ fontSize: "11px", color: "var(--naftal-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          DSS Recommendation
                        </Typography>
                      </Stack>

                      {dssRecommendation ? (
                        <>
                          <Stack direction="row" spacing={2} sx={{ mt: 1.5, mb: 2.5, alignItems: "center" }}>
                            <Chip
                              label={dssRecommendation.recommendation}
                              sx={{
                                fontSize: "15px", fontWeight: 500, borderRadius: "8px", px: 1,
                                ...(dssRecommendation.recommendation === "APPROVE"
                                  ? { backgroundColor: "var(--naftal-success-muted)", color: "var(--naftal-success)", border: "0.5px solid var(--naftal-success-muted)" }
                                  : dssRecommendation.recommendation === "REJECT"
                                  ? { backgroundColor: "var(--naftal-error-muted)", color: "var(--naftal-error)", border: "0.5px solid var(--naftal-error-muted)" }
                                  : { backgroundColor: "var(--naftal-warning-muted)", color: "var(--naftal-warning)", border: "0.5px solid var(--naftal-warning-muted)" })
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                                <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)" }}>Score</Typography>
                                <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)" }}>{dssRecommendation.score} / 100</Typography>
                              </Stack>
                              <Box sx={{ height: "4px", backgroundColor: "var(--naftal-border-subtle)", borderRadius: "2px" }}>
                                <Box sx={{
                                  width: `${dssRecommendation.score}%`, height: "100%", borderRadius: "2px",
                                  backgroundColor: dssRecommendation.recommendation === "APPROVE" ? "var(--naftal-success)"
                                    : dssRecommendation.recommendation === "REJECT" ? "var(--naftal-error)" : "var(--naftal-warning)",
                                  transition: "width 0.6s ease",
                                }} />
                              </Box>
                            </Box>
                          </Stack>

                          <Divider sx={{ backgroundColor: "var(--naftal-border-subtle)", mb: 2 }} />

                          <Typography sx={{ fontSize: "11px", color: "var(--naftal-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
                            Reasons
                          </Typography>

                          {dssRecommendation.reasons.length === 0 ? (
                            <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)", fontStyle: "italic" }}>
                              No flags raised.
                            </Typography>
                          ) : (
                            <Stack spacing={1}>
                              {dssRecommendation.reasons.map((reason, i) => (
                                <Stack key={i} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--naftal-text-muted)", mt: "6px", flexShrink: 0 }} />
                                  <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)", lineHeight: 1.5 , fontWeight:"bold" }}>
                                    {reason}
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>
                          )}
                        </>
                      ) : (
                        <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)", fontStyle: "italic", mt: 1 }}>
                          No recommendation available.
                        </Typography>
                      )}
                    </Card>
                  </Grid>

                </Grid>

                )
                :(
                <Grid size={{ xs: 12, md: 16, lg: 16 }}>
                  <Card
                    sx={{
                      backgroundColor: "var(--naftal-surface-2)",
                      border: "0.5px solid var(--naftal-border-subtle)",
                      borderRadius: "12px",
                      padding: "24px",
                      color: "var(--naftal-text-primary)",
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--naftal-info)" }} />
                      <Typography
                        sx={{
                          fontSize: "11px",
                          color: "var(--naftal-text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Signals / History
                      </Typography>
                    </Stack>

                    <Divider sx={{ backgroundColor: "var(--naftal-border-subtle)", mb: 2 }} />

                    <Grid container spacing={2} columns={{ sm: 8, md: 16, lg: 16 }}>
                      {/* Not Returned */}
                      <Grid size={{ xs: 12, md: 16, lg: 5 }}>
                        <Stack spacing={1.25}>
                          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>

                            <Typography sx={{ fontWeight: 700, color: "var(--naftal-text-primary)" }}>
                              Leave sessions not returned
                            </Typography>
                            <Chip
                              size="small"
                              label={`${notReturned.length}`}
                              sx={{
                                backgroundColor: "var(--naftal-error-muted)",
                                color: "var(--naftal-error)",
                                border: "0.5px solid var(--naftal-error-muted)",
                                fontWeight: 800,
                              }}
                            />
                          </Stack>

                          {notReturned.length === 0 ? (
                            <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)", fontStyle: "italic" }}>
                              Aucun.
                            </Typography>
                          ) : (
                            <Stack spacing={1}>
                              {notReturned.slice(0, 6).map((ls) => (
                                <Box
                                  key={ls.id}
                                  sx={{
                                    border: "0.5px solid var(--naftal-border-subtle)",
                                    borderRadius: "10px",
                                    p: 1.25,
                                    backgroundColor: "var(--naftal-hover)",
                                  }}
                                >
                                  <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-secondary)", fontWeight: 700 }}>
                                      Session #{ls.id}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={ls.status ?? "—"}
                                      sx={{
                                        backgroundColor: "var(--naftal-hover)",
                                        color: "var(--naftal-text-secondary)",
                                        border: "0.5px solid var(--naftal-border-subtle)",
                                      }}
                                    />
                                  </Stack>
                                  <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)", mt: 0.5 }}>
                                    Sortie: {formatDateTime(ls.leaveTime)} • Retour: {formatDateTime(ls.returnTime)}
                                  </Typography>
                                  <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)", mt: 0.25 }}>
                                    Créée: {formatDateTime(ls.createdAt)} • DocumentId: {ls.documentId}
                                  </Typography>
                                </Box>
                              ))}

                              {notReturned.length > 6 ? (
                                <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)" }}>
                                  +{notReturned.length - 6} autre(s)
                                </Typography>
                              ) : null}
                            </Stack>
                          )}
                        </Stack>
                      </Grid>

                      {/* Rejections */}
                      <Grid size={{ xs: 12, md: 8, lg: 5 }}>
                        <Stack spacing={1.25}>
                          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>

                            <Typography sx={{ fontWeight: 700, color: "var(--naftal-text-primary)" }}>
                              Previous rejections
                            </Typography>
                            <Chip
                              size="small"
                              label={`${rejections.length}`}
                              sx={{
                                backgroundColor: "var(--naftal-error-muted)",
                                color: "var(--naftal-error)",
                                border: "0.5px solid var(--naftal-error-muted)",
                                fontWeight: 800,
                              }}
                            />
                          </Stack>

                          {rejections.length === 0 ? (
                            <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)", fontStyle: "italic" }}>
                              Aucun.
                            </Typography>
                          ) : (
                            <Stack spacing={1}>
                              {rejections.slice(0, 6).map((doc) => (
                                <Box
                                  key={doc.id}
                                  sx={{
                                    border: "0.5px solid var(--naftal-border-subtle)",
                                    borderRadius: "10px",
                                    p: 1.25,
                                    backgroundColor: "var(--naftal-hover)",
                                  }}
                                >
                                  <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-primary)", fontWeight: 800 }}>
                                      {typeLabel[doc.type as string] ?? (doc.type as string) ?? "Document"} • #{doc.id}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={doc.status}
                                      sx={{
                                        backgroundColor: "var(--naftal-error-muted)",
                                        color: "var(--naftal-error)",
                                        border: "0.5px solid var(--naftal-error-muted)",
                                      }}
                                    />
                                  </Stack>

                                  <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)", mt: 0.5 }}>
                                    Soumis: {getFullDate(doc.createdAt)}
                                  </Typography>
                                </Box>
                              ))}

                              {rejections.length > 6 ? (
                                <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)" }}>
                                  +{rejections.length - 6} autre(s)
                                </Typography>
                              ) : null}
                            </Stack>
                          )}
                        </Stack>
                      </Grid>

                      {/* Approved docs */}
                      <Grid size={{ xs: 12, md: 8, lg: 6 }}>
                        <Stack spacing={1.25}>
                          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>

                            <Typography sx={{ fontWeight: 700, color: "var(--naftal-text-primary)" }}>
                              Recent approved documents this last 90 days
                            </Typography>
                            <Chip
                              size="small"
                              label={`${approvedDocs.length}`}
                              sx={{
                                backgroundColor: "var(--naftal-success-muted)",
                                color: "var(--naftal-success)",
                                border: "0.5px solid var(--naftal-success-muted)",
                                fontWeight: 800,
                              }}
                            />
                          </Stack>

                          {approvedDocs.length === 0 ? (
                            <Typography sx={{ fontSize: "13px", color: "var(--naftal-text-muted)", fontStyle: "italic" }}>
                              Aucun.
                            </Typography>
                          ) : (
                            <Stack spacing={1}>
                              {approvedDocs.slice(0, 6).map((doc) => (
                                <Box
                                  key={doc.id}
                                  sx={{
                                    border: "0.5px solid var(--naftal-border-subtle)",
                                    borderRadius: "10px",
                                    p: 1.25,
                                    backgroundColor: "var(--naftal-hover)",
                                  }}
                                >
                                  <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-primary)", fontWeight: 800 }}>
                                      {typeLabel[doc.type as string] ?? (doc.type as string) ?? "Document"} • #{doc.id}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={doc.status}
                                      sx={{
                                        backgroundColor: "var(--naftal-success-muted)",
                                        color: "var(--naftal-success)",
                                        border: "0.5px solid var(--naftal-success-muted)",
                                      }}
                                    />
                                  </Stack>

                                  <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)", mt: 0.5 }}>
                                    Soumis: {getFullDate(doc.createdAt)}
                                  </Typography>
                                </Box>
                              ))}

                              {approvedDocs.length > 6 ? (
                                <Typography sx={{ fontSize: "12px", color: "var(--naftal-text-muted)" }}>
                                  +{approvedDocs.length - 6} autre(s)
                                </Typography>
                              ) : null}
                            </Stack>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
            
                 )
              }            

                  <CardActions sx={{  pb: 2 }}>
                              <Stack direction="column" spacing={1.5} sx={{ width: "100%" }}>
                                <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    startIcon={<TaskAltOutlinedIcon />}
                                    onClick={() => openDecisionDialog(document, "APPROVED")}
                                    disabled={actionLoading === document.id}
                                  >
                                    {actionLoading === document.id ? "…" : "Approuver"}
                                  </Button>
                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CancelOutlinedIcon />}
                                    onClick={() => openDecisionDialog(document, "REJECTED")}
                                    disabled={actionLoading === document.id}
                                  >
                                    {actionLoading === document.id ? "…" : "Refuser"}
                                  </Button>
                                </Stack>
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => setRequest(prev => !prev)}
                                >
                                  {request ? "Reviser la recommendation de system d'analyse " : "Voir l'analyse de ce employee"}
                                </Button>
                              </Stack>
                  </CardActions>

                  <Dialog open={dialog.open} onClose={closeDecisionDialog} fullWidth maxWidth="sm">
                                      <DialogTitle sx={{ pr: 6 }}>
                                        <Box component="span" sx={{ display: "block", fontWeight: 800 }}>
                                          {dialog.open ? titleForDecision(dialog.decision) : ""}
                                        </Box>
                                        <Box component="span" sx={{ display: "block", typography: "body2", color: "text.secondary" }}>
                                          {dialog.open
                                            ? `${typeLabel[dialog.document.type] ?? dialog.document.type} `
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
    </Box>
)}        

