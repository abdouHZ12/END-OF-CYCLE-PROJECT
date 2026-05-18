"use client"

import {useEffect, useState , useCallback} from "react";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { apiGet ,apiGetBinary ,type ApiError} from "@/lib/api";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { formatAlgeriaDateTime,formatAlgeriaTime,formatAlgeriaDate } from "@/lib/datetime";
import type { DocumentResponse, Document } from "@/features/documents/types";
import { gettype } from "@/features/documents/ui";
import { getStoredEmployeeId } from "@/lib/authStorage";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
      const employeeId = getStoredEmployeeId();
      if (!employeeId) {
        setError("You are not logged in.");
        return;
      }
      const res = await apiGet<DocumentResponse>(`/api/dAll/documents/${employeeId}`);
      let documentsArray = Object.values(res);
      documentsArray = documentsArray.filter(doc => doc.status === "APPROVED");
      if (documentsArray.length === 0) {
        setEmpty(true);
      } else {
        setEmpty(false);
      }
      if (type !== "") {
        documentsArray = documentsArray.filter(doc => doc.type === type);
      }
      setRows(documentsArray);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "An error occurred while fetching documents.");
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "70px",
        backgroundColor: "var(--naftal-bg)",
        display: "grid",
        gridTemplateRows: "1fr auto",
        padding: "36px",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Box sx={{ width: "100%", height: "100%" }}>
        <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "var(--naftal-text-primary)" }}>
          Telecharger Autorisation
        </h1>
        <p style={{ fontSize: "20px", color: "var(--naftal-text-muted)", fontWeight: "bold", marginBottom: "20px" }}>
          Vous pouver telecharger vos autorisations approuvées ici
        </p>

        <Box
          sx={{
            backgroundColor: "var(--naftal-surface-2)",
            borderRadius: "12px",
            padding: "16px",
            mt: 3,
            border: "1px solid var(--naftal-border-subtle)",
            boxShadow: "var(--naftal-shadow-soft)",
          }}
        >

          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
            <FilterAltOutlinedIcon sx={{ color: "var(--naftal-text-secondary)" }} />
            <Typography variant="h6" sx={{ color: "var(--naftal-text-primary)", fontWeight: 800 }}>
              Filter
            </Typography>
          </Stack>

          <Grid container spacing={{ sm: 3, md: 2, lg: 3 }} columns={{ sm: 8, md: 12, lg: 12 }}>
            <Grid key={1} size={{ md: 12, lg: 12 }}>
              <label htmlFor="sort" style={{ color: "var(--naftal-text-secondary)" }}>
                Filtrer par type de document
              </label>
              <select
                id="sort"
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "12px",
                  borderRadius: "5px",
                  backgroundColor: "var(--naftal-bg)",
                  color: "var(--naftal-text-primary)",       // ← was hardcoded "white"
                  border: "1px solid var(--naftal-border)",
                  outline: "none",
                }}
              >
                <option value="" style={{ backgroundColor: "var(--naftal-bg)", color: "var(--naftal-text-primary)" }}>
                  Tout les types
                </option>
                <option value="EXIT_SLIP" style={{ backgroundColor: "var(--naftal-bg)", color: "var(--naftal-text-primary)" }}>
                  Bon de sortie
                </option>
                <option value="ABSENCE_AUTH" style={{ backgroundColor: "var(--naftal-bg)", color: "var(--naftal-text-primary)" }}>
                  Autorisation d&apos;absence
                </option>
                <option value="MISSION_ORDER" style={{ backgroundColor: "var(--naftal-bg)", color: "var(--naftal-text-primary)" }}>
                  Ordre de mission
                </option>
              </select>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4 }}>
          {isLoading ? (
            <Typography variant="body1" sx={{ color: "var(--naftal-text-muted)", textAlign: "center", mt: 4 }}>
              Loading documents...
            </Typography>
          ) : error ? (
            <Typography variant="body1" sx={{ color: "var(--naftal-error)", textAlign: "center", mt: 4 }}>
              {error}
            </Typography>
          ) : empty ? (
            <Box sx={{ backgroundColor: "var(--naftal-surface-2)", borderRadius: "12px", padding: "30px 20px" }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="h6" sx={{ color: "var(--naftal-text-secondary)", fontSize: "20px" }}>
                  No documents found
                </Typography>
              </Box>
            </Box>
          ) : (
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
              <Table>
                <TableHead sx={{ bgcolor: "var(--naftal-surface-0)", boxShadow: "0px 0px 1px 0px gray" }}>
                  <TableRow>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Type</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Informations</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Date de soumission</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Rows.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ boxShadow: "0px 0px 1px 0px gray", "&:hover": { backgroundColor: "var(--naftal-surface-2-hover)" } }}
                    >
                      <TableCell sx={{ color: "var(--naftal-text-primary)", border: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TextSnippetOutlinedIcon sx={{ color: "var(--naftal-info)", width: "20px", height: "20px", marginRight: "8px" }} />
                          {gettype(row.type)}
                        </Box>
                      </TableCell>

                      <TableCell sx={{ color: "var(--naftal-text-primary)", border: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography sx={{ color: "var(--naftal-text-secondary)" }}>
                            {row.type === "EXIT_SLIP" && row.exitSlip?.exitTime
                              ? formatAlgeriaDateTime(row.exitSlip.exitTime) + " -> " + formatAlgeriaTime(row.exitSlip.returnTime)
                              : row.type === "ABSENCE_AUTH" && row.absenceAuth?.startDate
                              ? formatAlgeriaDate(row.absenceAuth.startDate) + " -> " + formatAlgeriaDate(row.absenceAuth.endDate)
                              : row.type === "MISSION_ORDER" && row.missionOrder?.destination
                              ? row.missionOrder.destination
                              : "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ color: "var(--naftal-text-primary)", border: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography sx={{ color: "var(--naftal-text-secondary)" }}>
                            {formatAlgeriaDateTime(row.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ color: "var(--naftal-text-primary)", border: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            onClick={() => downloadPDF(row.id)}
                            sx={{
                              bgcolor: "var(--naftal-brand-strong)",
                              width: 40,
                              height: 40,
                              cursor: "pointer",
                              "&:hover": { bgcolor: "var(--naftal-brand-hover)" },
                            }}
                          >
                            <FileDownloadOutlinedIcon sx={{ color: "var(--naftal-on-brand)" }} />
                          </Avatar>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
}
