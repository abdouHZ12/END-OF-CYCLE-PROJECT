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
            backgroundColor: "rgb(10, 22, 40)",
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
            <ArrowBackOutlinedIcon onClick={handleBack} style={{ cursor: "pointer" , color:"lightgray"}} />
            <h1 style={{ fontSize: "35px", fontWeight: "bold" , color:"#fff" }}>
              Dashboard
            </h1>
            <p
              style={{
                fontSize: "20px ",
                color: "gray",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Welcome to your dashboard
            </p>

            {isLoading ? (
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", color: "rgba(255,255,255,0.75)" }}>
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
                      backgroundColor: "rgb(20, 30, 50)",
                      border: "0.5px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      padding: "24px",
                      color: "#fff",
                    }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 0.5, alignItems: "center" }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#ffa500" }} />
                        <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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

                      <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", mb: 2.5 }}>
                        Soumise le {formatAlgeriaDateTime(document.createdAt)}
                      </Typography>

                      <Divider sx={{ backgroundColor: "rgba(255,255,255,0.07)", mb: 2.5 }} />

                      <Stack spacing={1.5}>
                        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Statut</Typography>
                          <Chip label={document.status} size="small" sx={{
                            fontSize: "12px", fontWeight: 500,
                            backgroundColor: "rgba(255,165,0,0.12)",
                            color: "#ffa500",
                            border: "0.5px solid rgba(255,165,0,0.35)",
                            borderRadius: "6px",
                          }} />
                        </Stack>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Référence</Typography>
                          <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                            {`REQ-${new Date(document.createdAt).getFullYear()}-${String(document.id).padStart(4, "0")}`}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>

                  {/* DSS Card */}
                  <Grid size={{ xs: 12, md: 12, lg: 8 }}>
                    <Card sx={{
                      backgroundColor: "rgb(20, 30, 50)",
                      border: "0.5px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      padding: "24px",
                      color: "#fff",
                    }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 0.5, alignItems: "center" }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#7f77dd" }} />
                        <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
                                  ? { backgroundColor: "rgba(34,197,94,0.12)", color: "#4ade80", border: "0.5px solid rgba(74,222,128,0.3)" }
                                  : dssRecommendation.recommendation === "REJECT"
                                  ? { backgroundColor: "rgba(239,68,68,0.12)", color: "#f87171", border: "0.5px solid rgba(248,113,113,0.3)" }
                                  : { backgroundColor: "rgba(251,146,60,0.12)", color: "#fb923c", border: "0.5px solid rgba(251,146,60,0.3)" })
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                                <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>Score</Typography>
                                <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{dssRecommendation.score} / 100</Typography>
                              </Stack>
                              <Box sx={{ height: "4px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "2px" }}>
                                <Box sx={{
                                  width: `${dssRecommendation.score}%`, height: "100%", borderRadius: "2px",
                                  backgroundColor: dssRecommendation.recommendation === "APPROVE" ? "#4ade80"
                                    : dssRecommendation.recommendation === "REJECT" ? "#f87171" : "#fb923c",
                                  transition: "width 0.6s ease",
                                }} />
                              </Box>
                            </Box>
                          </Stack>

                          <Divider sx={{ backgroundColor: "rgba(255,255,255,0.07)", mb: 2 }} />

                          <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
                            Reasons
                          </Typography>

                          {dssRecommendation.reasons.length === 0 ? (
                            <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                              No flags raised.
                            </Typography>
                          ) : (
                            <Stack spacing={1}>
                              {dssRecommendation.reasons.map((reason, i) => (
                                <Stack key={i} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", mt: "6px", flexShrink: 0 }} />
                                  <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 , fontWeight:"bold" }}>
                                    {reason}
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>
                          )}
                        </>
                      ) : (
                        <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", fontStyle: "italic", mt: 1 }}>
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
                      backgroundColor: "rgb(20, 30, 50)",
                      border: "0.5px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      padding: "24px",
                      color: "#fff",
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#60a5fa" }} />
                      <Typography
                        sx={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.35)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Signals / History
                      </Typography>
                    </Stack>

                    <Divider sx={{ backgroundColor: "rgba(255,255,255,0.07)", mb: 2 }} />

                    <Grid container spacing={2} columns={{ sm: 8, md: 16, lg: 16 }}>
                      {/* Not Returned */}
                      <Grid size={{ xs: 12, md: 16, lg: 5 }}>
                        <Stack spacing={1.25}>
                          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                            <Typography sx={{ fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                              Leave sessions not returned
                            </Typography>
                            <Chip
                              size="small"
                              label={`${notReturned.length}`}
                              sx={{
                                backgroundColor: "rgba(239,68,68,0.12)",
                                color: "#f87171",
                                border: "0.5px solid rgba(248,113,113,0.25)",
                                fontWeight: 800,
                              }}
                            />
                          </Stack>

                          {notReturned.length === 0 ? (
                            <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                              Aucun.
                            </Typography>
                          ) : (
                            <Stack spacing={1}>
                              {notReturned.slice(0, 6).map((ls) => (
                                <Box
                                  key={ls.id}
                                  sx={{
                                    border: "0.5px solid rgba(255,255,255,0.08)",
                                    borderRadius: "10px",
                                    p: 1.25,
                                    backgroundColor: "rgba(255,255,255,0.02)",
                                  }}
                                >
                                  <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
                                      Session #{ls.id}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={ls.status ?? "—"}
                                      sx={{
                                        backgroundColor: "rgba(255,255,255,0.06)",
                                        color: "rgba(255,255,255,0.75)",
                                        border: "0.5px solid rgba(255,255,255,0.1)",
                                      }}
                                    />
                                  </Stack>
                                  <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", mt: 0.5 }}>
                                    Sortie: {formatDateTime(ls.leaveTime)} • Retour: {formatDateTime(ls.returnTime)}
                                  </Typography>
                                  <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", mt: 0.25 }}>
                                    Créée: {formatDateTime(ls.createdAt)} • DocumentId: {ls.documentId}
                                  </Typography>
                                </Box>
                              ))}

                              {notReturned.length > 6 ? (
                                <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
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
                            <Typography sx={{ fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                              Previous rejections
                            </Typography>
                            <Chip
                              size="small"
                              label={`${rejections.length}`}
                              sx={{
                                backgroundColor: "rgba(239,68,68,0.12)",
                                color: "#f87171",
                                border: "0.5px solid rgba(248,113,113,0.25)",
                                fontWeight: 800,
                              }}
                            />
                          </Stack>

                          {rejections.length === 0 ? (
                            <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                              Aucun.
                            </Typography>
                          ) : (
                            <Stack spacing={1}>
                              {rejections.slice(0, 6).map((doc) => (
                                <Box
                                  key={doc.id}
                                  sx={{
                                    border: "0.5px solid rgba(255,255,255,0.08)",
                                    borderRadius: "10px",
                                    p: 1.25,
                                    backgroundColor: "rgba(255,255,255,0.02)",
                                  }}
                                >
                                  <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontWeight: 800 }}>
                                      {typeLabel[doc.type as string] ?? (doc.type as string) ?? "Document"} • #{doc.id}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={doc.status}
                                      sx={{
                                        backgroundColor: "rgba(239,68,68,0.12)",
                                        color: "#f87171",
                                        border: "0.5px solid rgba(248,113,113,0.25)",
                                      }}
                                    />
                                  </Stack>
                                  <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", mt: 0.5 }}>
                                    Soumis: {formatAlgeriaDateTime(doc.createdAt)}
                                  </Typography>
                                </Box>
                              ))}

                              {rejections.length > 6 ? (
                                <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
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
                            <Typography sx={{ fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                              Recent approved documents this last 90 days
                            </Typography>
                            <Chip
                              size="small"
                              label={`${approvedDocs.length}`}
                              sx={{
                                backgroundColor: "rgba(34,197,94,0.12)",
                                color: "#4ade80",
                                border: "0.5px solid rgba(74,222,128,0.25)",
                                fontWeight: 800,
                              }}
                            />
                          </Stack>

                          {approvedDocs.length === 0 ? (
                            <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                              Aucun.
                            </Typography>
                          ) : (
                            <Stack spacing={1}>
                              {approvedDocs.slice(0, 6).map((doc) => (
                                <Box
                                  key={doc.id}
                                  sx={{
                                    border: "0.5px solid rgba(255,255,255,0.08)",
                                    borderRadius: "10px",
                                    p: 1.25,
                                    backgroundColor: "rgba(255,255,255,0.02)",
                                  }}
                                >
                                  <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontWeight: 800 }}>
                                      {typeLabel[doc.type as string] ?? (doc.type as string) ?? "Document"} • #{doc.id}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={doc.status}
                                      sx={{
                                        backgroundColor: "rgba(34,197,94,0.12)",
                                        color: "#4ade80",
                                        border: "0.5px solid rgba(74,222,128,0.25)",
                                      }}
                                    />
                                  </Stack>
                                  <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", mt: 0.5 }}>
                                    Soumis: {formatAlgeriaDateTime(doc.createdAt)}
                                  </Typography>
                                </Box>
                              ))}

                              {approvedDocs.length > 6 ? (
                                <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
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

                  <CardActions sx={{ px: 2, pb: 2 }}>
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
                                  {request ? "Review" : "Request employee details"} les détails
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

