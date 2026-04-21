"use client"

import {useEffect, useState , useCallback} from "react";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { getDate } from "../my-requests/page";
import { apiGet ,apiGetBinary ,type ApiError} from "@/lib/api";
import { getFullDate } from "../my-requests/page";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import {type DocumentResponse , type Document , gettype } from "../page";


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
} from "@mui/material";





export default function Page() {

  const [Rows , setRows] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empty , setEmpty] = useState(false);
  const [type , setType] = useState<string >("");
  
  const downloadPDF = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {

      const response = await apiGetBinary(`/api/document/${id}/pdf`);

      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = `document_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "An error occurred while downloading the PDF.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      try { 
        const raw = localStorage.getItem("naftal.employee");
        const employeeId = raw ? JSON.parse(raw).id : null;
        const res = await apiGet<DocumentResponse>(`/api/dAll/documents/${employeeId}`);
        let documentsArray = Object.values(res);
        documentsArray = documentsArray.filter(doc => doc.status === "APPROVED");
        if (documentsArray.length === 0) {
          setEmpty(true);
        } else {
          setEmpty(false);
        }
        if(type!== "")  {
            documentsArray = documentsArray.filter(doc => doc.type === type);
           }
            setRows(documentsArray);
      } catch (err:unknown) {
              const apiErr = err as ApiError;
              setError(apiErr.message || "An error occurred while fetching documents.");
            }finally {
              setIsLoading(false);
            }
            }, [type]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);



return(
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
              Download Authorization
            </h1>
            <p
              style={{
                fontSize: "20px ",
                color: "gray",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              You can download authorization of all your documents 
            </p>
            <Box sx={{
                backgroundColor: "#1a2942",
                borderRadius: "12px",
                padding: "16px",
                mt:3,
            }}>
                <Box>
                    <FilterAltOutlinedIcon />
                    <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
                        Filter
                    </Typography>
                </Box>
                <Grid container spacing={{ sm :3 ,md: 2, lg: 3 }} columns={{ sm : 8 , md:12, lg: 12 }}>

                    <Grid key={1} size={{ md: 12 , lg:12 }}>
                        <label htmlFor="" style={{color:"lightgray" }}>Sort By Type</label>
                        <select
                            id="sort"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            style={{
                                marginTop:"10px",
                                width: "100%",
                                padding: "12px",
                                borderRadius: "5px",
                                backgroundColor: "rgb(10, 22, 40)",
                                color: "white",
                        }}
                        >
                        <option value="" style={{color:"white"}} >All Types</option>
                        <option value="EXIT_SLIP">Exit Slip</option>
                        <option value="ABSENCE_AUTH">Absence Authorization</option>
                        <option value="MISSION_ORDER">Mission Order</option>
                        </select>
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
                                        <TableCell sx={{ color: "lightgray" , border:"none" }}>Actions</TableCell>

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
                                                {row.type === "EXIT_SLIP" && row.exitSlip?.exitTime ? getFullDate(row.exitSlip.exitTime)+" "+" -> "+getDate(row.exitSlip.returnTime) : 
                                                 row.type === "ABSENCE_AUTH" && row.absenceAuth?.startDate ? getFullDate(row.absenceAuth.startDate)+" "+" -> "+getFullDate(row.absenceAuth.endDate) : 
                                                 row.type ==="MISSION_ORDER" && row.missionOrder?.destination ? row.missionOrder.destination : "N/A"}
                                              </Typography>
                                            </Box>
                                          </TableCell>

                                          <TableCell sx={{ color: "#fff" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center"  }}>
                                              <Typography sx={{color:"lightgray"}}>
                                              {getDate(row.createdAt)}  {/* Display only the date part */}
                                              </Typography>
                                            </Box>
                                          </TableCell>

                                          <TableCell sx={{ color: "#fff" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center"  }}>
                                              <Avatar onClick={() => downloadPDF(row.id)}  sx={{ bgcolor: "darkorange", width: 40, height: 40 , "&:hover": { bgcolor: "gray" } }}>
                                                    <FileDownloadOutlinedIcon sx={{color: "black" , "&:hover": { color: "white" } }}/>
                                                </Avatar>
                                            </Box>
                                          </TableCell>


                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer> ) }                
            </Box>
                        
          </Box>  
         </Box> 
)}         