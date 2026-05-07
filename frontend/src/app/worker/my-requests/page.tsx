"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { apiGet ,apiDelete, apiPut, type ApiError} from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import type { DocumentResponse, Document } from "@/features/documents/types";
import { gettype, getStatusChip } from "@/features/documents/ui";
import { getFullDate } from "@/lib/datetime";
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
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Divider,
} from "@mui/material";

export default function Page() {        

  const [Rows , setRows] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empty , setEmpty] = useState(false);
  const [sort , setSort] = useState<string>("");
  const [status , setStatus] = useState<string >("");
  const [toast , setToast] = useState<string | null>(null) ;

  const [editOpen, setEditOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [editExitTime, setEditExitTime] = useState("");
  const [editReturnTime, setEditReturnTime] = useState("");
  const [editGate, setEditGate] = useState("");

  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editReason, setEditReason] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const routePrefix = pathname?.startsWith("/manager") ? "/manager" : "/worker";

  const toastTimerRef = useRef<number | null>(null) ;

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const toLocalDateTimeInput = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

  const toLocalDateInput = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  };

  const parseLocalDate = (value: string): Date | null => {
    // expects YYYY-MM-DD
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const da = Number(m[3]);
    if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(da)) return null;
    return new Date(y, mo - 1, da, 0, 0, 0, 0);
  };

  const openEdit = (doc: Document) => {
    if (doc.status !== "PENDING") return;
    if (doc.type === "MISSION_ORDER") return;

    setEditingDoc(doc);
    setError(null);

    if (doc.type === "EXIT_SLIP") {
      setEditExitTime(doc.exitSlip?.exitTime ? toLocalDateTimeInput(doc.exitSlip.exitTime) : "");
      setEditReturnTime(doc.exitSlip?.returnTime ? toLocalDateTimeInput(doc.exitSlip.returnTime) : "");
      setEditGate(doc.exitSlip?.gate ?? "");
    }

    if (doc.type === "ABSENCE_AUTH") {
      setEditStartDate(doc.absenceAuth?.startDate ? toLocalDateInput(doc.absenceAuth.startDate) : "");
      setEditEndDate(doc.absenceAuth?.endDate ? toLocalDateInput(doc.absenceAuth.endDate) : "");
      setEditReason(doc.absenceAuth?.reason ?? "");
    }

    setEditOpen(true);
  };

  const closeEdit = () => {
    if (isSaving) return;
    setEditOpen(false);
    setEditingDoc(null);
  };

  const handleSaveEdit = async () => {
    if (!editingDoc) return;
    if (editingDoc.status !== "PENDING") return;
    if (editingDoc.type === "MISSION_ORDER") return;

    setIsSaving(true);
    setError(null);

    try {
      if (editingDoc.type === "EXIT_SLIP") {
        if (!editExitTime || !editReturnTime || !editGate.trim()) {
          setError("Please fill all fields.");
          return;
        }

        await apiPut(`/api/document/ExitSlip/${editingDoc.id}`, {
          Type: "EXIT_SLIP",
          exitTime: new Date(editExitTime),
          returnTime: new Date(editReturnTime),
          gate: editGate,
        });
      } else if (editingDoc.type === "ABSENCE_AUTH") {
        const start = parseLocalDate(editStartDate);
        const end = parseLocalDate(editEndDate);
        if (!start || !end || !editReason.trim()) {
          setError("Please fill all fields.");
          return;
        }
        if (end.getTime() < start.getTime()) {
          setError("End date must be after start date.");
          return;
        }

        await apiPut(`/api/document/AbsenceAuth/${editingDoc.id}`, {
          Type: "ABSENCE_AUTH",
          startDate: start,
          endDate: end,
          reason: editReason,
        });
      }

      showToast("Request updated successfully", 2500);
      setEditOpen(false);
      setEditingDoc(null);
      await fetchDocuments();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "An error occurred while updating the document.");
    } finally {
      setIsSaving(false);
    }
  };


  const handleDelete = async (id: number) => {
    try {
      const employeeId = getStoredEmployeeId();
      if (!employeeId) {
        setError("You are not logged in.");
        return;
      }
      await apiDelete(`/api/employee/${employeeId}/document/${id}`);
      setRows(prevRows => prevRows.filter(row => row.id !== id));
      showToast("Document deleted successfully" , 2500) ;

    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "An error occurred while deleting the document.");
    }
  };


  function showToast(message: string, durationMs: number) {
        if (toastTimerRef.current) {
          window.clearTimeout(toastTimerRef.current);
          toastTimerRef.current = null;
        }
        setToast(message);
        toastTimerRef.current = window.setTimeout(() => {
          setToast(null);
          toastTimerRef.current = null;
        }, durationMs);
      }

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
        const documentsArray = Object.values(res);
        
        // Filter documents from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const filteredByDate = documentsArray.filter(doc => {
          const docDate = new Date(doc.createdAt);
          return docDate >= thirtyDaysAgo;
        });
        
        if (filteredByDate.length === 0) {
          setEmpty(true);
        } else {
          if(status == "")  
          setRows(filteredByDate);
          else if(status == "PENDING") {
          setRows(filteredByDate.filter(doc => doc.status === "PENDING"));  
          }
          else if(status == "APPROVED") {
            setRows(filteredByDate.filter(doc => doc.status === "APPROVED"));  
          }
          else if(status == "REJECTED") {
            setRows(filteredByDate.filter(doc => doc.status === "REJECTED"));  
          }
        }
      }catch (err:unknown) {
        
        const apiErr = err as ApiError;
        setError(apiErr.message || "An error occurred while fetching documents.");
      }finally {
        setIsLoading(false);
      }
      }, [status]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
          }}
        >
        <Box sx={{width:"100% ", height: "100%"}}>
                    {toast ? (
                      <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {toast}
                      </div>
                    ) : null}

            <h1 style={{ fontSize: "35px", fontWeight: "bold" , color:"var(--naftal-text-primary)" }}>
              Mes demandes
            </h1>
            <p
              style={{
                fontSize: "20px ",
                color: "var(--naftal-text-muted)",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Consultez et gérez vos demandes de documents administratifs des 30 derniers jours.
            </p>
            <Box
              sx={{
                backgroundColor: "var(--naftal-surface-2)",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid var(--naftal-border-subtle)",
                boxShadow: "var(--naftal-shadow-soft)",
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>

                <FilterAltOutlinedIcon sx={{ color: "var(--naftal-text-secondary)" }} />
                <Typography variant="h6" sx={{ color: "var(--naftal-text-primary)", fontWeight: 800 }}>
                  Filter
                </Typography>
                <Typography sx={{ color: "var(--naftal-text-muted)", fontSize: 13 }}>
                  Affinez la liste par statut et tri
                </Typography>
              </Stack>

              <Grid container spacing={{ sm: 3, md: 3, lg: 3 }} columns={{ sm: 8, md: 12, lg: 16 }}>
                <Grid key={1} size={{ md: 6, lg: 8 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel
                      id="status-label"
                      sx={{
                        color: "var(--naftal-text-secondary)",
                        "&.Mui-focused": { color: "var(--naftal-brand)" },
                      }}
                    >
                      Status
                    </InputLabel>

                    <Select
                      labelId="status-label"
                      id="status-select"
                      value={status}
                      label="Status"
                      onChange={(e) => setStatus(e.target.value)}
                      sx={{
                        color: "var(--naftal-text-primary)",
                        backgroundColor: "var(--naftal-bg)",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--naftal-border-subtle)" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--naftal-border)" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--naftal-brand)" },
                        "& .MuiSelect-icon": { color: "var(--naftal-text-secondary)" },
                      }}
                      MenuProps={{
                        slotProps: {
                          paper: {
                            sx: {
                              mt: 1,
                              backgroundColor: "var(--naftal-surface-0)",
                              color: "var(--naftal-text-primary)",
                              border: "1px solid var(--naftal-border-subtle)",
                              borderRadius: 2,
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <Typography sx={{ color: "var(--naftal-text-primary)" }}>All Status</Typography>
                      </MenuItem>
                      <MenuItem value="PENDING">En attente</MenuItem>
                      <MenuItem value="APPROVED">Approuvé</MenuItem>
                      <MenuItem value="REJECTED">Rejeté</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid key={2} size={{ md: 6, lg: 8 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel
                      id="sort-label"
                      sx={{
                        color: "var(--naftal-text-secondary)",
                        "&.Mui-focused": { color: "var(--naftal-brand)" },
                      }}
                    >
                      Trie par
                    </InputLabel>

                    <Select
                      labelId="sort-label"
                      id="sort-select"
                      value={sort}
                      label="Sort By"
                      onChange={(e) => setSort(e.target.value)}
                      sx={{
                        color: "var(--naftal-text-primary)",
                        backgroundColor: "var(--naftal-bg)",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--naftal-border-subtle)" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--naftal-border)" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--naftal-brand)" },
                        "& .MuiSelect-icon": { color: "var(--naftal-text-secondary)" },
                      }}
                      MenuProps={{
                        slotProps: {
                          paper: {
                            sx: {
                              mt: 1,
                              backgroundColor: "var(--naftal-surface-0)",
                              color: "var(--naftal-text-primary)",
                              border: "1px solid var(--naftal-border-subtle)",
                              borderRadius: 2,
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="Recent">Nouveaux → Anciens</MenuItem>
                      <MenuItem value="oldest">Anciens → Nouveaux</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{mt:4}}>
                    {isLoading ? (
                                  <Typography variant="body1" sx={{ color: "var(--naftal-text-muted)", textAlign: "center", mt: 4 }}>
                                    Loading documents...
                                  </Typography>
                        ) : error  ? (
                                <Typography variant="body1" sx={{ color: "red", textAlign: "center", mt: 4 }}>
                                    {error}
                                </Typography>) 
                            : empty ? ( 
                                <Box sx={{
                                    backgroundColor: "var(--naftal-surface-2)",
                                    borderRadius: "12px",
                                    padding: "30px 20px",
                                    }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

                                        <Typography variant="h6" sx={{ color: "var(--naftal-text-secondary)" ,fontSize:"20px" }}>
                                            No documents found
                                        </Typography>
                                    </Box>
                                 </Box>   ) 
                        : ( 
                                  <TableContainer
                                  component={Paper}
                                  sx={{
                                    backgroundColor: "var(--naftal-surface-2)",
                                    borderRadius: 2,
                                    overflowY: "auto",
                                    boxShadow: "var(--naftal-shadow-strong)",
                                    border: "1px solid var(--naftal-border-subtle)",
                                  }}
                                >
                                  <Table sx={{ }}>
                                    <TableHead sx={{bgcolor:"var(--naftal-surface-0)" , boxShadow:"0px 0px 1px 0px gray"}}>
                                      <TableRow>

                                        <TableCell sx={{ color: "var(--naftal-text-secondary)" , border:"none" }}>Type</TableCell>
                                        <TableCell sx={{ color: "var(--naftal-text-secondary)" , border:"none" }}>Informations</TableCell>
                                        <TableCell sx={{ color: "var(--naftal-text-secondary)" , border:"none" }}>Submission Date</TableCell>
                                        <TableCell sx={{ color: "var(--naftal-text-secondary)" , border:"none" }}>Statut</TableCell>
                                        <TableCell sx={{ color: "var(--naftal-text-secondary)" , border:"none" }}>Actions</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {Rows.map((row) => (
                                        <TableRow key={row.id} sx={{ boxShadow:"0px 0px 1px 0px gray" , "&:hover": { backgroundColor: "var(--naftal-surface-2-hover)" } }}>
                                          <TableCell sx={{ color: "var(--naftal-text-primary)" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                              <TextSnippetOutlinedIcon sx={{ color: "var(--naftal-text-muted)",width: "20px", marginRight: "8px" }} />
                                              {gettype(row.type)}
                                            </Box>
                                          </TableCell>

                                          <TableCell sx={{ color: "var(--naftal-text-primary)" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>

                                              <Typography sx={{color:"var(--naftal-text-secondary)"}}>
                                                {row.type === "EXIT_SLIP" && row.exitSlip?.exitTime ? getFullDate(row.exitSlip.exitTime)+" "+" -> "+ row.exitSlip.returnTime.substring(11,16) : 
                                                 row.type === "ABSENCE_AUTH" && row.absenceAuth?.startDate ? getFullDate(row.absenceAuth.startDate)+" "+" -> "+getFullDate(row.absenceAuth.endDate) : 
                                                 row.type ==="MISSION_ORDER" && row.missionOrder?.destination ? row.missionOrder.destination : "N/A"}
                                              </Typography>
                                            </Box>
                                          </TableCell>

                                          <TableCell sx={{ color: "var(--naftal-text-primary)" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center"  }}>

                                              <Typography sx={{color:"var(--naftal-text-secondary)"}}>
                                              {getFullDate(row.createdAt)}  {/* Display only the date part */}
                                              </Typography>
                                            </Box>
                                          </TableCell>

                                          <TableCell sx={{ border:"none"}}>{getStatusChip(row.status)}</TableCell>

                                          <TableCell sx={{ color: "var(--naftal-text-primary)" , border:"none"}}>
                                            <Box sx={{ display: "flex", alignItems: "center"  }}>
                                              {row.status === "PENDING" && row.type !== "MISSION_ORDER" ? (
                                                <Avatar
                                                  onClick={() => openEdit(row)}
                                                  sx={{
                                                    bgcolor: "transparent",
                                                    width: 40,
                                                    height: 40,
                                                    "&:hover": { backgroundColor: "var(--naftal-info-muted)" },
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <EditOutlinedIcon sx={{ color: "var(--naftal-info)" }} />
                                                </Avatar>
                                              ) : null}
                                              <Avatar
                                                onClick={() => { router.push(`${routePrefix}/my-requests/${row.id}`) }}
                                                sx={{ bgcolor: "transparent", width: 40, height: 40, "&:hover": { backgroundColor: "var(--naftal-info-muted)" }, cursor: "pointer" }}
                                              >
                                                <VisibilityOutlinedIcon sx={{ color: "var(--naftal-info)" }} />
                                              </Avatar>

                                              {row.status === "PENDING" ? (
                                                <Avatar
                                                  onClick={() => {handleDelete(row.id)}}
                                                  sx={{ bgcolor: "transparent", width: 40, height: 40, "&:hover": { bgcolor: "rgba(244, 67, 54, 0.1)" } }}
                                                >
                                                  <CancelOutlinedIcon sx={{ color: "var(--naftal-error)" }} />
                                                </Avatar>
                                              ) : null}

                                            </Box>
                                          </TableCell>

                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer> ) }                
            </Box>



            <Dialog
              open={editOpen}
              onClose={closeEdit}
              fullWidth
              maxWidth="sm"
              slotProps={{
                paper: {
                  sx: {
                    backgroundColor: "var(--naftal-surface-2)",
                    color: "var(--naftal-text-primary)",
                    borderRadius: 3,
                    border: "1px solid var(--naftal-border-subtle)",
                    overflow: "hidden",
                    boxShadow: "var(--naftal-shadow-strong)",
                    "&:before": {
                      content: '""',
                      display: "block",
                      height: "4px",
                      backgroundColor: "var(--naftal-brand)",
                    },
                  },
                },
              }}
            >
              <DialogTitle
                sx={{
                  fontWeight: 900,
                  py: 2,
                  backgroundColor: "var(--naftal-surface-0)",
                  borderBottom: "1px solid var(--naftal-border-subtle)",
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: "var(--naftal-brand)" }} />
                  <Box>
                    <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>Modify request</Typography>
                  </Box>
                </Stack>
              </DialogTitle>
              <Divider sx={{ borderColor: "var(--naftal-border-subtle)" }} />
              <DialogContent sx={{ pt: 2 }}>
                {editingDoc?.type === "EXIT_SLIP" ? (
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                      label="Leave time"
                      type="datetime-local"
                      value={editExitTime}
                      onChange={(e) => setEditExitTime(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-input": { color: "var(--naftal-text-primary)" },
                        "& .MuiOutlinedInput-root": { backgroundColor: "var(--naftal-bg)" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--naftal-border-subtle)",
                          transition: "border-color 160ms ease, box-shadow 160ms ease",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--naftal-border)" },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--naftal-brand)",
                          boxShadow: "0 0 0 3px var(--naftal-brand-muted)",
                        },
                        "& .MuiInputLabel-root": { color: "var(--naftal-text-secondary)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "var(--naftal-brand)" },
                      }}
                    />
                    <TextField
                      label="Return time"
                      type="datetime-local"
                      value={editReturnTime}
                      onChange={(e) => setEditReturnTime(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-input": { color: "var(--naftal-text-primary)" },
                        "& .MuiOutlinedInput-root": { backgroundColor: "var(--naftal-bg)" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--naftal-border-subtle)",
                          transition: "border-color 160ms ease, box-shadow 160ms ease",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--naftal-border)" },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--naftal-brand)",
                          boxShadow: "0 0 0 3px var(--naftal-brand-muted)",
                        },
                        "& .MuiInputLabel-root": { color: "var(--naftal-text-secondary)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "var(--naftal-brand)" },
                      }}
                    />
                    <TextField
                      label="Gate"
                      value={editGate}
                      onChange={(e) => setEditGate(e.target.value)}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-input": { color: "var(--naftal-text-primary)" },
                        "& .MuiOutlinedInput-root": { backgroundColor: "var(--naftal-bg)" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--naftal-border-subtle)",
                          transition: "border-color 160ms ease, box-shadow 160ms ease",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--naftal-border)" },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--naftal-brand)",
                          boxShadow: "0 0 0 3px var(--naftal-brand-muted)",
                        },
                        "& .MuiInputLabel-root": { color: "var(--naftal-text-secondary)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "var(--naftal-brand)" },
                      }}
                    />
                  </Stack>
                ) : null}

                {editingDoc?.type === "ABSENCE_AUTH" ? (
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                      label="Start date"
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-input": { color: "var(--naftal-text-primary)" },
                        "& .MuiOutlinedInput-root": { backgroundColor: "var(--naftal-bg)" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--naftal-border-subtle)",
                          transition: "border-color 160ms ease, box-shadow 160ms ease",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--naftal-border)" },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--naftal-brand)",
                          boxShadow: "0 0 0 3px var(--naftal-brand-muted)",
                        },
                        "& .MuiInputLabel-root": { color: "var(--naftal-text-secondary)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "var(--naftal-brand)" },
                      }}
                    />
                    <TextField
                      label="End date"
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-input": { color: "var(--naftal-text-primary)" },
                        "& .MuiOutlinedInput-root": { backgroundColor: "var(--naftal-bg)" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--naftal-border-subtle)",
                          transition: "border-color 160ms ease, box-shadow 160ms ease",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--naftal-border)" },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--naftal-brand)",
                          boxShadow: "0 0 0 3px var(--naftal-brand-muted)",
                        },
                        "& .MuiInputLabel-root": { color: "var(--naftal-text-secondary)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "var(--naftal-brand)" },
                      }}
                    />
                    <TextField
                      label="Reason"
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                      multiline
                      minRows={3}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-input": { color: "var(--naftal-text-primary)" },
                        "& .MuiOutlinedInput-root": { backgroundColor: "var(--naftal-bg)" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--naftal-border-subtle)",
                          transition: "border-color 160ms ease, box-shadow 160ms ease",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--naftal-border)" },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--naftal-brand)",
                          boxShadow: "0 0 0 3px var(--naftal-brand-muted)",
                        },
                        "& .MuiInputLabel-root": { color: "var(--naftal-text-secondary)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "var(--naftal-brand)" },
                      }}
                    />
                  </Stack>
                ) : null}

              </DialogContent>
              <DialogActions
                sx={{
                  px: 3,
                  pb: 2,
                  pt: 1.5,
                  backgroundColor: "var(--naftal-surface-2)",
                  borderTop: "1px solid var(--naftal-border-subtle)",
                }}
              >
                <Button
                  onClick={closeEdit}
                  disabled={isSaving}
                  sx={{
                    color: "var(--naftal-text-primary)",
                    border: "1px solid var(--naftal-border)",
                    borderRadius: 2,
                    textTransform: "none",
                    px: 2,
                    "&:hover": { backgroundColor: "var(--naftal-hover)", borderColor: "var(--naftal-text-muted)" },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  sx={{
                    backgroundColor: "var(--naftal-brand)",
                    color: "var(--naftal-on-brand)",
                    fontWeight: 900,
                    borderRadius: 2,
                    textTransform: "none",
                    px: 2,
                    "&:hover": { backgroundColor: "var(--naftal-brand-hover)" },
                  }}
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </DialogActions>
            </Dialog>


        </Box>

    </Box>
  );
} 