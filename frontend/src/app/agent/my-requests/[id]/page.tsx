"use client";

import {useEffect, useState} from "react";
import Grid from "@mui/material/Grid";
import { apiGet , type ApiError} from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Document } from "@/features/documents/types";
import { useParams } from "next/navigation";
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { getFullDate } from "@/lib/datetime";
import { getStoredEmployeeId } from "@/lib/authStorage";
import {
  Box,
  Card,
  Chip,
  Divider,
  Typography,
} from "@mui/material";




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
        if (!employeeId) {
          throw new Error("Employee ID is missing.");
        }
        const res = await apiGet<Document>(`/api/employee/${employeeId}/document/${id}`);
        setDocument(res); // Store the document in state
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
  }

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
              <Typography variant="body1" sx={{ color: "lightgray", textAlign: "center", mt: 4 }}>
                Chargement...
              </Typography>
            ) : error  ? (
                <Typography variant="body1" sx={{ color: "red", textAlign: "center", mt: 4 }}>
                      {error}
                </Typography>) :
                (<Grid container spacing={{ sm :3 ,md: 3, lg: 3 }} columns={{ sm : 8 , md:12, lg: 16 }}>

                      <Grid size={{ xs: 12, md: 8 }}>
                      {/* Exit Slip Card */}
                      <Card
                          sx={{
                          backgroundColor: "rgb(20, 30, 50)",
                          padding: "20px",
                          borderRadius: "12px",
                          color: "#fff",
                          }}
                      >
                          <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
                          {document.type === "EXIT_SLIP" ? "Bon de sortie" :
                          document.type === "ABSENCE_AUTH" ? "Autorisation d'absence" : 
                          document.type ==="MISSION_ORDER" ? "Ordre de mission" : "Document"}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "gray", marginBottom: "10px" }}>
                          Soumise le  {getFullDate(document.createdAt) }
                          </Typography>
                          <Chip
                          label={document.status}
                          sx={{
                              backgroundColor: "rgba(255, 165, 0, 0.1)",
                              color: "orange",
                              fontWeight: "bold",
                              border: "1px solid #ffa500",
                              borderRadius: "8px",
                              marginBottom: "20px",
                          }}
                          />

                          {document.managerComment ? (
                            <>
                              <Divider sx={{ margin: "12px 0", backgroundColor: "rgba(255, 255, 255, 0.08)" }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, marginBottom: "6px" }}>
                                Commentaire du manager
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "lightgray", whiteSpace: "pre-wrap" }}
                              >
                                {document.managerComment}
                              </Typography>
                            </>
                          ) : null}

                          <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                              {document.type === "EXIT_SLIP" && document.exitSlip?.exitTime ? "Exit Hour  : "+getFullDate(document.exitSlip.exitTime) : 
                              document.type === "ABSENCE_AUTH" && document.absenceAuth?.startDate ? "Start Date  : "+getFullDate(document.absenceAuth.startDate) : 
                              document.type ==="MISSION_ORDER" && document.missionOrder?.destination ? "Destination  : "+document.missionOrder.destination : "N/A"}
                          </Typography>
                          <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                          {document.type === "EXIT_SLIP" && document.exitSlip?.returnTime ? "Return Hour  : "+getFullDate(document.exitSlip.returnTime) :
                          document.type === "ABSENCE_AUTH" && document.absenceAuth?.endDate ? "End Date  : "+getFullDate(document.absenceAuth.endDate) : 
                          document.type ==="MISSION_ORDER" && document.missionOrder?.travelMethod ? "Travel Method  : "+document.missionOrder.travelMethod : "N/A"}
                          </Typography>
                          <Typography variant="body2">
                          {document.type === "EXIT_SLIP" && document.exitSlip?.gate ? "Gate  : "+ document.exitSlip.gate :
                          document.type === "ABSENCE_AUTH" && document.absenceAuth?.reason ? "Reason  : "+document.absenceAuth.reason : 
                          document.type ==="MISSION_ORDER" && document.missionOrder?.purpose ? "Purpose  : "+document.missionOrder.purpose : "N/A"}
                          </Typography>
                      </Card>

                      {/* Timeline Card */}
                      <Card
                          sx={{
                          backgroundColor: "rgb(20, 30, 50)",
                          padding: "20px",
                          borderRadius: "12px",
                          marginTop: "20px",
                          color: "#fff",
                          }}
                      >
                          <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
                          Chronologie
                          </Typography>
                          <Box sx={{ marginTop: "10px" }}>
                          <Typography variant="body2" sx={{ color: "orange", fontWeight: "bold" }}>
                              ● Soumise
                          </Typography>
                          <Typography variant="body2" sx={{ color: "gray", marginLeft: "20px" }}>
                              {document.createdAt ? getFullDate(document.createdAt) : "N/A"}
                          </Typography>
                          <Divider sx={{ margin: "10px 0", backgroundColor: "gray" }} />
                          <Typography variant="body2" sx={{ color: "gray" }}>
                              {"○ En cours d'examen"}
                          </Typography>
                          <Divider sx={{ margin: "10px 0", backgroundColor: "gray" }} />
                          <Typography variant="body2" sx={{ color: "gray" }}>
                              ○ En attente
                          </Typography>
                          </Box>
                      </Card>
                      </Grid>

                      {/* Right Section */}
                      <Grid size={{ xs: 12, md: 8 }}>
                      {/* QR Code Card */}
                      <Card
                          sx={{
                          backgroundColor: "rgb(20, 30, 50)",
                          padding: "20px",
                          borderRadius: "12px",
                          marginBottom: "20px",
                          textAlign: "center",
                          color: "#fff",
                          }}
                      >
                          <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
                          Code de vérification QR
                          </Typography>
                          <Box
                          sx={{
                              width: "100%",
                              height: "150px",
                              backgroundColor: "rgb(40, 50, 70)",
                              borderRadius: "8px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              marginBottom: "10px",
                          }}
                          >
                          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#fff" }}>
                              QR
                          </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {document.qrCode}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "gray", marginTop: "10px" }}>
                          Présentez ce code aux agents de sécurité
                          </Typography>
                      </Card>

                      {/* Employee Info Card */}
                      <Card
                          sx={{
                          backgroundColor: "rgb(20, 30, 50)",
                          padding: "20px",
                          borderRadius: "12px",
                          color: "#fff",
                          }}
                      >
                          <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
                          Informations employé
                          </Typography>
                          <Typography variant="body2">
                          <strong>Nom:</strong> not yet
                          </Typography>
                      </Card>
                      </Grid>

                  </Grid>)}            

        </Box>
    </Box>
)}        