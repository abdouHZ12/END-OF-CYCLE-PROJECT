"use client"

import {useEffect, useState} from "react";
import Grid from "@mui/material/Grid";
import { apiGet , type ApiError} from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Document } from "@/features/documents/types";
import { useParams } from "next/navigation";
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { getFullDate } from "@/lib/datetime";
import {
  Box,
  Card,
  Chip,
  Divider,
  Typography,
  CircularProgress,
} from "@mui/material";
import Stack from "@mui/material/Stack";

type DSSRecommendation = {
  suggestion:{
      recommendation: string;
      score: number;
      reasons: string[];
  },
  document : Document;

};


export default function Page() {

  const router = useRouter();  
  const params = useParams();
  const id = parseInt(params.id as string);

  const [document, setDocument] = useState<Document>({} as Document);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [dssRecommendation, setDssRecommendation] = useState<{ recommendation: string; score: number; reasons: string[] } | null>(null);  

const handleBack = () => {
    router.back();
  }


  useEffect(() => {
    const fetchDocumentAndRecommendation = async () => {
      try {
        setIsLoading(true);
        setError("");

        console.log("Fetching document and DSS recommendation for document ID:", id , typeof id);
        const dss = await apiGet<DSSRecommendation>(`/api/document/suggestion/${id}`);
        setDssRecommendation(dss.suggestion);
        setDocument(dss.document);
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
                (
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
                        Soumise le {getFullDate(document.createdAt)}
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
                )}            

        </Box>
    </Box>
)}        

