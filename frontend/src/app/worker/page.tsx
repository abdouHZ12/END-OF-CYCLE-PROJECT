"use client";

import {useEffect, useState} from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Stack from "@mui/material/Stack";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { apiGet , type ApiError} from "@/lib/api";
import { useRouter } from "next/navigation";
import {useMediaQuery , useTheme} from "@mui/material";
import { getStoredEmployeeId } from "@/lib/authStorage";

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Chip
} from "@mui/material";


export type Document = {
  id: number;
  type : string;
  createdAt : string ;
  status : string ;
  qrCode? : string ;
  managerComment?: string | null;
  issuedById? : number;
  authIssuedAt? : string;
  decisionMadeById?: number ;
  decisionMadeBy?: {
    id: number;
    name: string;
    username: string;
  } | null;
  exitSlip? : {
    exitTime :string;
    returnTime :string;
    gate : string ;
  } ;
  absenceAuth? : {
    endDate : string;
    startDate : string;
    reason : string;
  } ;
  missionOrder? :{
    duration :number;
    destination : string ;
    purpose : string ;
    travelMethod : string ;
  } ;
}

export type DocumentResponse = {
  [key: string]: Document; // The response is an object with dynamic keys, each containing a `Document`
};


export const getStatusChip = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Chip label={"Pending"} sx={{ backgroundColor: "rgba(255, 165, 0, 0.1)", color: "orange" ,fontWeight: "bold", border: "1px solid #ffa500" , borderRadius: "8px" }} />;
    case "APPROVED":
      return <Chip label={"Approved"} sx={{ backgroundColor: "rgba(0, 128, 0, 0.1)", color: "#4caf50"  , fontWeight: "bold", border: "1px solid #4caf50" , borderRadius: "8px" }} />;
    case "REJECTED":
      return <Chip label={"Rejected"} sx={{ backgroundColor: "rgba(255, 0, 0, 0.1)", color: "#f44336" , fontWeight: "bold", border: "1px solid #f44336" , borderRadius: "8px" }} />;
    default:
      return <Chip label={status} />;
  }
};
export const gettype = (type: string) => {
  switch (type) {
    case "MISSION_ORDER":
      return "Mission Order";
    case "ABSENCE_AUTH":
      return "Absence Authorization";
    case "EXIT_SLIP":
      return "Exit Slip";
    default:
      return type;
  }
}

export default function Page() {

  const [Rows , setRows] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empty , setEmpty] = useState(false);


const isSmallScreen = useMediaQuery(useTheme().breakpoints.down("sm")) ;
  
const router = useRouter() ;

  useEffect(() => {


    fetchDocuments();
  }, []);


  async function fetchDocuments() {
      setIsLoading(true);
      setError(null);
      try { 
        const employeeId = getStoredEmployeeId();
        if (!employeeId) {
          setError("You are not logged in.");
          return;
        }
        const res = await apiGet<DocumentResponse>(`/api/dAll/documents/${employeeId}`);
        const documentsArray = Object.values(res);
        if (documentsArray.length === 0) {
          setEmpty(true);
        } else {
          setRows(documentsArray);
        }
      }catch (err:unknown) {
        
        const apiErr = err as ApiError;
        setError(apiErr.message || "An error occurred while fetching documents.");
      }finally {
        setIsLoading(false);
      }
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
          }}
        >
          <Box sx={{width:"100% ", height: "100%"}}>
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
            <Grid container spacing={{ sm :3 ,md: 3, lg: 3 }} columns={{ sm : 8 , md:12, lg: 16 }}>
              <Grid size={{  sm : 4 , md: 6, lg: 4 }} >
                <Card
                sx={{
                  bgcolor:"#1a2942",
                  color: "#fff",
                  borderRadius: 2,
                  position: "relative",
                  boxShadow: "none",
                  p: 2,
                  width: "100%",
                  border: "0.1px solid transparent", // Initial border
                  transition: "transform 0.1s", // Smooth transition
                  "&:hover": {
                    borderColor: "darkorange", // Dark orange on hover
                    transform: "scale(1.01)", // Slightly scale up the card
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
                    {Rows.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Total demandes
                  </Typography>
                </CardContent>
                </Card>
              </Grid>

              <Grid size={{ sm : 4 , md: 6, lg: 4 }}>
                <Card
                sx={{
                  bgcolor:"#1a2942",
                  color: "#fff",
                  borderRadius: 2,
                  position: "relative",
                  boxShadow: "none",
                  p: 2,
                  width: "100%",
                  border: "0.1px solid transparent", // Initial border
                  transition: "transform 0.1s", // Smooth transition
                  "&:hover": {
                    borderColor: "darkorange", // Dark orange on hover
                    transform: "scale(1.01)", // Slightly scale up the card
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
                    {Rows.filter(row => row.status === "PENDING").length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Pending
                  </Typography>
                </CardContent>
                </Card>
              </Grid>  

              <Grid size={{ sm :4 , md: 6, lg: 4 }}>
                <Card
                sx={{
                  bgcolor:"#1a2942",
                  color: "#fff",
                  borderRadius: 2,
                  position: "relative",
                  boxShadow: "none",
                  p: 2,
                  width: "100%",
                  border: "0.1px solid transparent", // Initial border
                  transition: "transform 0.1s", // Smooth transition
                  "&:hover": {
                    borderColor: "darkorange", // Dark orange on hover
                    transform: "scale(1.01)", // Slightly scale up the card
                  },
                }}
              >
                <CardContent sx={{ p: 2
                  
                  }}>
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
                    {Rows.filter(row => row.status === "APPROVED").length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Approved
                  </Typography>
                </CardContent>
                </Card>
              </Grid>

              <Grid size={{ sm : 4 , md: 6, lg: 4 }}>
                <Card
                sx={{
                  bgcolor:"#1a2942",
                  color: "#fff",
                  borderRadius: 2,
                  position: "relative",
                  boxShadow: "none",
                  p: 2,
                  width: "100%",
                  border: "0.1px solid transparent", // Initial border
                  transition: "transform 0.1s", // Smooth transition
                  "&:hover": {
                    borderColor: "darkorange", // Dark orange on hover
                    transform: "scale(1.01)", // Slightly scale up the card
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
                    {Rows.filter(row => row.status === "REJECTED").length}
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
                justifyContent: "space-between", // Space between the heading and button
                alignItems: "center", // Align items vertically in the center
                marginTop: "30px",
                marginBottom: "30px",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontSize: "25px",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                Recent Requests
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  backgroundColor: "transparent",
                  color: "lightgray",
                  textTransform: "none",
                  borderRadius: 2,
                  padding: "8px 16px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  "&:hover": {
                    color: "orange",
                    backgroundColor: "rgba(255, 165, 0, 0.1)",
                    border: "1px solid orange",
                  },
                }}
              >
                See all
              </Button>
            </Box>
            {isLoading ? (
              <Typography variant="body1" sx={{ color: "gray", textAlign: "center", mt: 4 }}>
                Loading documents...
              </Typography>
            ) : error  ? (
              <Typography variant="body1" sx={{ color: "red", textAlign: "center", mt: 4 }}>
                {error}
              </Typography>) 
              : empty ? ( 
                <Box sx={{
                            backgroundColor: "#1a2942",
                            borderRadius: "12px",
                            padding: "30px 20px",
                                                  }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                         <Typography variant="h6" sx={{ color: "lightgray" ,fontSize:"20px" }}>
                             No documents found
                          </Typography>
                      </Box>
                  </Box>   ) 
             : !isSmallScreen ?( 
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
              <Table sx={{ }}>
                <TableHead sx={{bgcolor:"#10223A" , boxShadow:"0px 0px 1px 0px gray"}}>
                  <TableRow>
                    <TableCell sx={{ color: "lightgray" , border:"none" }}>Numéro</TableCell>
                    <TableCell sx={{ color: "lightgray" , border:"none" }}>Type de demande</TableCell>
                    <TableCell sx={{ color: "lightgray" , border:"none" }}>Destination / Motif</TableCell>
                    <TableCell sx={{ color: "lightgray" , border:"none" }}>Date de soumission</TableCell>
                    <TableCell sx={{ color: "lightgray" , border:"none" }}>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Rows.map((row) => (
                    <TableRow key={row.id} sx={{ boxShadow:"0px 0px 1px 0px gray" , "&:hover": { backgroundColor: "#1a2540" } }}>
                      <TableCell sx={{ color: "#ffa500", fontWeight: "bold", border: "none" }}>
                        {`REQ-${new Date(row.createdAt).getFullYear()}-${String(row.id).padStart(4, "0")}`}
                      </TableCell>
                      <TableCell sx={{ color: "#fff" , border:"none"}}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TextSnippetOutlinedIcon sx={{ color: "gray",width: "20px", marginRight: "8px" }} />
                          {gettype(row.type)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#fff" , border:"none"}}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LocationOnIcon sx={{ color: "gray", marginRight: "8px" }} />
                          <Typography sx={{color:"lightgray"}}>
                          {row.missionOrder?.destination || row.absenceAuth?.reason || "/"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#fff" , border:"none"}}>
                        <Box sx={{ display: "flex", alignItems: "center"  }}>
                          <CalendarTodayIcon sx={{ color: "gray", marginRight: "8px" }} />
                          <Typography sx={{color:"lightgray"}}>
                          {row.createdAt.split("T")[0]} {/* Display only the date part */}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ border:"none"}}>{getStatusChip(row.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer> 
            ):(
            <Grid container spacing={2}>
              {Rows.map((row) => (
                <Grid size={{ xs: 12 }} key={row.id}>
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
                    {`REQ-${new Date(row.createdAt).getFullYear()}-${String(row.id).padStart(4, "0")}`}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#fff" }}>
                    {gettype(row.type)}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <LocationOnIcon sx={{ color: "gray", marginRight: "8px" }} />
                    <Typography sx={{ color: "lightgray" }}>
                      {row.missionOrder?.destination ||
                        row.absenceAuth?.reason ||
                        "/"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <CalendarTodayIcon
                      sx={{ color: "gray", marginRight: "8px" }}
                    />
                    <Typography sx={{ color: "lightgray" }}>
                      {row.createdAt.split("T")[0]}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>{getStatusChip(row.status)}</Box>
                </Card>
              </Grid>
            ))}
            </Grid>) }
            <Box sx={{
                      position: "fixed",
                      bottom: "40px", 
                      right: "40px", 
                      zIndex: 1000, 
                  }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "orange",
                  color: "black",
                  textTransform: "none",
                  borderRadius: 10,
                  padding: "12px 25px",
                  fontWeight: "bold",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transition: "transform 0.3s ease",
                    transform: "scale(1.05)",
                    backgroundColor: "darkorange",
                  },
                }}

                onClick={() => {
                  router.push("/worker/fill-request");
                }}
              >
                <Typography sx={{mr:"15px"}}>
                  +
                </Typography>
                <Typography>
                  New request

                </Typography>                
              </Button>
            </Box>


          </Box>
        </Box>
  );
}
