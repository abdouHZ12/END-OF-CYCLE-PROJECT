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
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { apiGet , type ApiError} from "@/lib/api";
import { useRouter } from "next/navigation";
import {useMediaQuery , useTheme} from "@mui/material";
import {type DocumentResponse , type Document , gettype , getStatusChip} from "../page";
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


export default function Page() {

  const [Rows , setRows] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empty , setEmpty] = useState(false);
  const [sort , setSort] = useState<string>("");
  const [status , setStatus] = useState<string >("");


  useEffect(() => {


    fetchDocuments();
  }, []);


  async function fetchDocuments() {
      setIsLoading(true);
      setError(null);
      try { 
        const res = await apiGet<DocumentResponse>("/api/dAll/documents/1",); // Assuming employee ID is 1 for testing
        const documentsArray = Object.values(res);
        if (documentsArray.length === 0) {
          setEmpty(true);
        } else {
          if(status == "")  
          setRows(documentsArray);
          else if(status == "PENDING") {
          setRows(documentsArray.filter(doc => doc.status === "PENDING"));  
          }
          else if(status == "APPROVED") {
            setRows(documentsArray.filter(doc => doc.status === "APPROVED"));  
          }
          else if(status == "REJECTED") {
            setRows(documentsArray.filter(doc => doc.status === "REJECTED"));  
          }
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
            <Box sx={{
                backgroundColor: "#1a2942",
                borderRadius: "12px",
                padding: "16px",
            }}>
                <Box>
                    <CancelOutlinedIcon />
                    <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
                        Filter
                    </Typography>
                </Box>
                <Grid container spacing={{ sm :3 ,md: 3, lg: 3 }} columns={{ sm : 8 , md:12, lg: 16 }}>

                    <Grid key={1} size={{ md: 6 , lg:8 }}>
                        <label htmlFor="" style={{color:"lightgray" }}>Status</label>
                        <select
                            id="sort"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            required
                            style={{
                                marginTop:"10px",
                                width: "100%",
                                padding: "12px",
                                borderRadius: "5px",
                                backgroundColor: "rgb(10, 22, 40)",
                                color: "white",
                        }}
                        >
                        <option value="" style={{color:"white"}} >All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        </select>
                    </Grid>

                    <Grid key={2} size={{ md: 6 , lg:8 }}>
                        <label htmlFor="" style={{color:"lightgray"}}>Sort By</label>
                        <select
                            id="sort"
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            required
                            style={{
                                marginTop:"10px",
                                width: "100%",
                                padding: "12px",
                                borderRadius: "5px",
                                backgroundColor: "rgb(10, 22, 40)",
                                color: "white",
                        }}
                        >
                        <option value="Recent" >Recent  -&gt; Oldest</option>
                        <option value="oldest">Oldest -&gt; Recent</option>
                        </select>

                        </Grid>
                                {isLoading ? (
                                  <Typography variant="body1" sx={{ color: "gray", textAlign: "center", mt: 4 }}>
                                    Loading documents...
                                  </Typography>
                                ) : error  ? (
                                  <Typography variant="body1" sx={{ color: "red", textAlign: "center", mt: 4 }}>
                                    {error}
                                  </Typography>) 
                                  : empty ? ( 
                                    <div>No documents found</div> ) 
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
                                        <TableCell sx={{ color: "lightgray" , border:"none" }}>Actions</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {Rows.map((row) => (
                                        <TableRow key={row.id} sx={{ boxShadow:"0px 0px 1px 0px gray" , "&:hover": { backgroundColor: "#1a2540" } }}>
                                          <TableCell sx={{ color: "#fff" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                              <TextSnippetOutlinedIcon sx={{ color: "gray",width: "20px", marginRight: "8px" }} />
                                              {gettype(row.type)}
                                            </Box>
                                          </TableCell>

                                          <TableCell sx={{ color: "#fff" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                              <Typography sx={{color:"lightgray"}}>
                                                informations 
                                              </Typography>
                                            </Box>
                                          </TableCell>

                                          <TableCell sx={{ color: "#fff" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center"  }}>
                                              <CalendarTodayIcon sx={{ color: "gray", marginRight: "8px" }} />
                                              <Typography sx={{color:"lightgray"}}>
                                              {row.createdAt} {/* Display only the date part */}
                                              </Typography>
                                            </Box>
                                          </TableCell>

                                          <TableCell sx={{ border:"none"}}>{getStatusChip(row.status)}</TableCell>

                                          <TableCell sx={{ color: "#fff" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center"  }}>
                                                <Button variant="contained" size="small" sx={{ textTransform: "none", backgroundColor: "#3f51b5" , "&:hover": { backgroundColor: "#303f9f" } }}>
                                                    <Avatar sx={{ bgcolor: "transparent", width: 48, height: 48 }}>
                                                        <RemoveRedEyeOutlinedIcon />
                                                    </Avatar>

                                                </Button>

                                                <Button>
                                                    <Avatar sx={{ bgcolor: "transparent", width: 48, height: 48  , "&:hover": { bgcolor: "rgba(244, 67, 54, 0.1)" } }}>
                                                        <CancelOutlinedIcon sx={{ color: "#f44336" }} />
                                                    </Avatar>
                                                </Button>
                                            </Box>
                                          </TableCell>

                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer> ) }

                </Grid>
            </Box>


        </Box>

        </Box>
  );
}