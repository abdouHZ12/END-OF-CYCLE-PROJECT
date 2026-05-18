"use client";

import { useCallback, useEffect, useState } from "react";
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
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import { apiGet, type ApiError } from "@/lib/api";
import { getStatusChip } from "@/features/documents/ui";
import { formatAlgeriaDateTime} from "@/lib/datetime";
import { getStoredEmployeeId } from "@/lib/authStorage";

type MissionOrder = {
  id: number;
  destination: string;
  duration: number;
  purpose: string;
  travelMethod: string;
};

type Mission = {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  type: string;
  missionOrder: MissionOrder | null;
  decisionMadeBy?: { name: string } | null;
  managerComment?: string | null;
};

export default function MyMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);

  const fetchMissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const employeeId = getStoredEmployeeId();
      if (!employeeId) {
        setError("You are not logged in.");
        return;
      }
      const res = await apiGet<Mission[]>(`/api/employees/${employeeId}/mission-orders`);
      if (!res || res.length === 0) {
        setEmpty(true);
      } else {
        setMissions(res);
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "An error occurred while fetching mission orders.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const travelMethodLabel: Record<string, string> = {
    PERSONAL: "Personal",
    COMPANY: "Company",
    AIRPLANE: "Airplane",
  };

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
          My Missions
        </h1>
        <p
          style={{
            fontSize: "20px",
            color: "var(--naftal-text-muted)",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Order de Mission qui vous sont assignés 
        </p>

        <Box sx={{ mt: 2 }}>
          {isLoading ? (
            <Typography variant="body1" sx={{ color: "var(--naftal-text-muted)", textAlign: "center", mt: 4 }}>
              Loading missions...
            </Typography>
          ) : error ? (
            <Typography variant="body1" sx={{ color: "red", textAlign: "center", mt: 4 }}>
              {error}
            </Typography>
          ) : empty ? (
            <Box
              sx={{
                backgroundColor: "var(--naftal-surface-2)",
                borderRadius: "12px",
                padding: "30px 20px",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

                <Typography variant="h6" sx={{ color: "var(--naftal-text-secondary)", fontSize: "20px" }}>
                  aucun ordre de mssion n&apos;est assigné à vous pour le moment.
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
                <TableHead sx={{ bgcolor: "var(--naftal-surface-0)", boxShadow: "0px 0px 1px 0px var(--naftal-border)" }}>
                  <TableRow>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Destination</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Purpose</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Duration</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Travel</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Assigned On</TableCell>
                    <TableCell sx={{ color: "var(--naftal-text-secondary)", border: "none" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {missions.map((mission) => (
                    <TableRow
                      key={mission.id}
                      sx={{
                        boxShadow: "0px 0px 1px 0px var(--naftal-border)",
                        "&:hover": { backgroundColor: "var(--naftal-surface-2-hover)" },
                      }}
                    >
                      <TableCell sx={{ color: "var(--naftal-text-primary)", border: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TextSnippetOutlinedIcon
                            sx={{ color: "var(--naftal-text-muted)", width: "20px", marginRight: "8px" }}
                          />
                          {mission.missionOrder?.destination ?? "N/A"}
                        </Box>
                      </TableCell>

                      <TableCell sx={{ border: "none" }}>
                        <Typography sx={{ color: "var(--naftal-text-secondary)" }}>
                          {mission.missionOrder?.purpose ?? "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ border: "none" }}>
                        <Typography sx={{ color: "var(--naftal-text-secondary)" }}>
                          {mission.missionOrder?.duration
                            ? `${mission.missionOrder.duration} day(s)`
                            : "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ border: "none" }}>
                        <Typography sx={{ color: "var(--naftal-text-secondary)" }}>
                          {mission.missionOrder?.travelMethod
                            ? travelMethodLabel[mission.missionOrder.travelMethod] ?? mission.missionOrder.travelMethod
                            : "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ border: "none" }}>

                        <Typography sx={{ color: "var(--naftal-text-secondary)" }}>
                          {formatAlgeriaDateTime(mission.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ border: "none" }}>
                        {getStatusChip(mission.status)}
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