"use client"

import {useCallback, useEffect, useState} from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Stack from "@mui/material/Stack";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { apiGet , type ApiError} from "@/lib/api";
import type { DocumentResponse, Document } from "@/features/documents/types";
import { gettype, getStatusChip } from "@/features/documents/ui";
import { getDate, getFullDate } from "@/lib/datetime";
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
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";


export default function Page() {

  const [Rows , setRows] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empty , setEmpty] = useState(false);
  const [year , setYear] = useState<string>("");
  const [type , setType] = useState<string >("");
  const [Rows1 , setRows1] = useState<Document[]>([]);
  const [month , setMonth] = useState<string>(""); 
  
  const fetchDocuments = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      try { 
        const employeeId = getStoredEmployeeId();
        if (!employeeId) {
          setError("You are not logged in.");
          return;
        }
        const res = await apiGet<DocumentResponse>(`/api/dAll/documents/${employeeId}`);
        let documentsArray = Object.values(res);
          setEmpty(false);
          setRows1(documentsArray);
          if(type!== "")  {
            documentsArray = documentsArray.filter(doc => doc.type === type);
           }
          if(year!==""){
            documentsArray = documentsArray.filter(doc => getDate(doc.createdAt).split("/")[0] === year);
          }
          if(month!==""){
            documentsArray = documentsArray.filter(doc => getDate(doc.createdAt).split("/")[1] === month);
          }
          if(documentsArray.length === 0) {
            setEmpty(true);
          }
            setRows(documentsArray);
 } catch (err:unknown) {
        const apiErr = err as ApiError;
        setError(apiErr.message || "An error occurred while fetching documents.");
      }finally {
        setIsLoading(false);
      }
      }, [month, type, year]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
              History
            </h1>
            <p
              style={{
                fontSize: "20px ",
                color: "gray",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              View and filter your request history
            </p>
            <Grid container spacing={{ sm :3 ,md: 3, lg: 3 }} columns={{ sm : 8 , md:9, lg: 9 }}>

              <Grid size={{ sm :8 , md: 3, lg: 3 }}>
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
                    {Rows1.filter(row => row.status === "APPROVED").length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Approved
                  </Typography>
                </CardContent>
                </Card>
              </Grid>

              <Grid size={{ sm : 8 , md: 3, lg: 3 }}>
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
                    {Rows1.filter(row => row.status === "REJECTED").length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Rejected
                  </Typography>
                </CardContent>
                </Card>
              </Grid>  

              <Grid size={{ sm : 8 , md: 3, lg: 3 }}>
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
                    {Rows1.filter(row => row.status === "PENDING").length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Pending
                  </Typography>
                </CardContent>
                </Card>
              </Grid>              
            </Grid>

            <Box sx={{
                backgroundColor: "#1a2942",
                borderRadius: "12px",
                padding: "16px",
                mt:3,
            }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
                  <FilterAltOutlinedIcon sx={{ color: "rgba(255,255,255,0.65)" }} />
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800 }}>
                    Filter
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                    Affinez la liste par type, année et mois
                  </Typography>
                </Stack>
                <Grid container spacing={{ sm :3 ,md: 2, lg: 3 }} columns={{ sm : 8 , md:12, lg: 12 }}>

                    <Grid key={1} size={{ md: 6 , lg:4 }}>
                      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                        <InputLabel
                          id="type-label"
                          sx={{
                            color: "rgba(255,255,255,0.65)",
                            transition: "color 160ms ease",
                            "&.Mui-focused": { color: "#ffa500" },
                          }}
                        >
                          Sort By Type
                        </InputLabel>
                        <Select
                          labelId="type-label"
                          id="type-select"
                          value={type}
                          label="Sort By Type"
                          onChange={(e) => setType(e.target.value)}
                          sx={{
                            color: "#fff",
                            backgroundColor: "rgb(10, 22, 40)",
                            borderRadius: 2,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(255,255,255,0.12)",
                              transition: "border-color 160ms ease, box-shadow 160ms ease",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.22)" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#ffa500",
                              boxShadow: "0 0 0 3px rgba(255, 165, 0, 0.12)",
                            },
                            "& .MuiSelect-icon": { color: "rgba(255,255,255,0.65)" },
                          }}
                          MenuProps={{
                            slotProps: {
                              paper: {
                                sx: {
                                  mt: 1,
                                  backgroundColor: "#10223A",
                                  color: "#fff",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: 2,
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="">All Types</MenuItem>
                          <MenuItem value="EXIT_SLIP">Exit Slip</MenuItem>
                          <MenuItem value="ABSENCE_AUTH">Absence Authorization</MenuItem>
                          <MenuItem value="MISSION_ORDER">Mission Order</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid key={2} size={{ md: 6 , lg:4 }}>
                      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                        <InputLabel
                          id="year-label"
                          sx={{
                            color: "rgba(255,255,255,0.65)",
                            transition: "color 160ms ease",
                            "&.Mui-focused": { color: "#ffa500" },
                          }}
                        >
                          Sort By Year
                        </InputLabel>
                        <Select
                          labelId="year-label"
                          id="year-select"
                          value={year}
                          label="Sort By Year"
                          onChange={(e) => setYear(e.target.value)}
                          sx={{
                            color: "#fff",
                            backgroundColor: "rgb(10, 22, 40)",
                            borderRadius: 2,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(255,255,255,0.12)",
                              transition: "border-color 160ms ease, box-shadow 160ms ease",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.22)" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#ffa500",
                              boxShadow: "0 0 0 3px rgba(255, 165, 0, 0.12)",
                            },
                            "& .MuiSelect-icon": { color: "rgba(255,255,255,0.65)" },
                          }}
                          MenuProps={{
                            slotProps: {
                              paper: {
                                sx: {
                                  mt: 1,
                                  backgroundColor: "#10223A",
                                  color: "#fff",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: 2,
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="">All Years</MenuItem>
                          <MenuItem value="2026">2026</MenuItem>
                          <MenuItem value="2025">2025</MenuItem>
                          <MenuItem value="2024">2024</MenuItem>
                          <MenuItem value="2023">2023</MenuItem>
                        </Select>
                      </FormControl>

                    </Grid>
                    <Grid key={3} size={{ md: 6 , lg:4 }}>
                      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                        <InputLabel
                          id="month-label"
                          sx={{
                            color: "rgba(255,255,255,0.65)",
                            transition: "color 160ms ease",
                            "&.Mui-focused": { color: "#ffa500" },
                          }}
                        >
                          Sort By Month
                        </InputLabel>
                        <Select
                          labelId="month-label"
                          id="month-select"
                          value={month}
                          label="Sort By Month"
                          onChange={(e) => setMonth(e.target.value)}
                          sx={{
                            color: "#fff",
                            backgroundColor: "rgb(10, 22, 40)",
                            borderRadius: 2,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(255,255,255,0.12)",
                              transition: "border-color 160ms ease, box-shadow 160ms ease",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.22)" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#ffa500",
                              boxShadow: "0 0 0 3px rgba(255, 165, 0, 0.12)",
                            },
                            "& .MuiSelect-icon": { color: "rgba(255,255,255,0.65)" },
                          }}
                          MenuProps={{
                            slotProps: {
                              paper: {
                                sx: {
                                  mt: 1,
                                  backgroundColor: "#10223A",
                                  color: "#fff",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: 2,
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="">All months</MenuItem>
                          <MenuItem value="1">January</MenuItem>
                          <MenuItem value="2">February</MenuItem>
                          <MenuItem value="3">March</MenuItem>
                          <MenuItem value="4">April</MenuItem>
                          <MenuItem value="5">May</MenuItem>
                          <MenuItem value="6">June</MenuItem>
                          <MenuItem value="7">July</MenuItem>
                          <MenuItem value="8">August</MenuItem>
                          <MenuItem value="9">September</MenuItem>
                          <MenuItem value="10">October</MenuItem>
                          <MenuItem value="11">November</MenuItem>
                          <MenuItem value="12">December</MenuItem>
                        </Select>
                      </FormControl>

                    </Grid>                    

                </Grid>
            </Box>
            
            <Box sx={{mt:4}}>
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
                        : ( 
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
                                        <TableCell sx={{ color: "lightgray" , border:"none" }}>Type</TableCell>
                                        <TableCell sx={{ color: "lightgray" , border:"none" }}>Informations</TableCell>
                                        <TableCell sx={{ color: "lightgray" , border:"none" }}>Submission Date</TableCell>
                                        <TableCell sx={{ color: "lightgray" , border:"none" }}>Statut</TableCell>
                                        <TableCell sx={{ color: "lightgray" , border:"none" }}>Decision Made By</TableCell>
                                        <TableCell sx={{ color: "lightgray" , border:"none" }}>Decision Date</TableCell>

                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {Rows.map((row) => (
                                        <TableRow key={row.id} sx={{ boxShadow:"0px 0px 1px 0px gray" , "&:hover": { backgroundColor: "#1a2540" } }}>
                                          <TableCell sx={{ color: "#fff" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                              <TextSnippetOutlinedIcon sx={{ color: "skyblue",width: "20px",height:"20px", marginRight: "8px" }} />
                                              {gettype(row.type)}
                                            </Box>
                                          </TableCell>

                                          <TableCell sx={{ color: "#fff" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                              <Typography sx={{color:"lightgray"}}>
                                                {row.type === "EXIT_SLIP" && row.exitSlip?.exitTime ? getFullDate(row.exitSlip.exitTime)+" "+" -> "+row.exitSlip.returnTime.substring(11,16) : 
                                                 row.type === "ABSENCE_AUTH" && row.absenceAuth?.startDate ? getFullDate(row.absenceAuth.startDate)+" "+" -> "+getFullDate(row.absenceAuth.endDate) : 
                                                 row.type ==="MISSION_ORDER" && row.missionOrder?.destination ? row.missionOrder.destination : "N/A"}
                                              </Typography>
                                            </Box>
                                          </TableCell>

                                          <TableCell sx={{ color: "#fff" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center"  }}>
                                              <Typography sx={{color:"lightgray"}}>
                                              {getFullDate(row.createdAt)}  {/* Display only the date part */}
                                              </Typography>
                                            </Box>
                                          </TableCell>

                                          <TableCell sx={{ border:"none"}}>{getStatusChip(row.status)}</TableCell>
                                          <TableCell sx={{ color: "#fff" , fontweight: "bold", border:"none"}}>
                                            {row.decisionMadeBy?.username || row.decisionMadeBy?.name || "N/A"}
                                          </TableCell>


                                          <TableCell sx={{ color: "#fff" , border:"none"}}>
                                            <Typography>{getDate(row.authIssuedAt) || "N/A"}</Typography>
                                          </TableCell>

                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer> ) }                
            </Box>

           </Box>
        </Box>
  );
} 