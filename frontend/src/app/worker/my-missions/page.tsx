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
import { getStatusChip } from "../page";
import { getFullDate } from "../my-requests/page";

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
      const raw = localStorage.getItem("naftal.employee");
      const employeeId = raw ? JSON.parse(raw).id : null;
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
        backgroundColor: "rgb(10, 22, 40)",
        display: "grid",
        gridTemplateRows: "1fr auto",
        padding: "36px",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Box sx={{ width: "100%", height: "100%" }}>
        <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "#fff" }}>
          My Missions
        </h1>
        <p
          style={{
            fontSize: "20px",
            color: "gray",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Mission orders assigned to you
        </p>

        <Box sx={{ mt: 2 }}>
          {isLoading ? (
            <Typography variant="body1" sx={{ color: "gray", textAlign: "center", mt: 4 }}>
              Loading missions...
            </Typography>
          ) : error ? (
            <Typography variant="body1" sx={{ color: "red", textAlign: "center", mt: 4 }}>
              {error}
            </Typography>
          ) : empty ? (
            <Box
              sx={{
                backgroundColor: "#1a2942",
                borderRadius: "12px",
                padding: "30px 20px",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="h6" sx={{ color: "lightgray", fontSize: "20px" }}>
                  No mission orders assigned to you yet
                </Typography>
              </Box>
            </Box>
          ) : (
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
              <Table>
                <TableHead sx={{ bgcolor: "#10223A", boxShadow: "0px 0px 1px 0px gray" }}>
                  <TableRow>
                    <TableCell sx={{ color: "lightgray", border: "none" }}>Destination</TableCell>
                    <TableCell sx={{ color: "lightgray", border: "none" }}>Purpose</TableCell>
                    <TableCell sx={{ color: "lightgray", border: "none" }}>Duration</TableCell>
                    <TableCell sx={{ color: "lightgray", border: "none" }}>Travel</TableCell>
                    <TableCell sx={{ color: "lightgray", border: "none" }}>Assigned On</TableCell>
                    <TableCell sx={{ color: "lightgray", border: "none" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {missions.map((mission) => (
                    <TableRow
                      key={mission.id}
                      sx={{
                        boxShadow: "0px 0px 1px 0px gray",
                        "&:hover": { backgroundColor: "#1a2540" },
                      }}
                    >
                      <TableCell sx={{ color: "#fff", border: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TextSnippetOutlinedIcon
                            sx={{ color: "gray", width: "20px", marginRight: "8px" }}
                          />
                          {mission.missionOrder?.destination ?? "N/A"}
                        </Box>
                      </TableCell>

                      <TableCell sx={{ border: "none" }}>
                        <Typography sx={{ color: "lightgray" }}>
                          {mission.missionOrder?.purpose ?? "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ border: "none" }}>
                        <Typography sx={{ color: "lightgray" }}>
                          {mission.missionOrder?.duration
                            ? `${mission.missionOrder.duration} day(s)`
                            : "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ border: "none" }}>
                        <Typography sx={{ color: "lightgray" }}>
                          {mission.missionOrder?.travelMethod
                            ? travelMethodLabel[mission.missionOrder.travelMethod] ?? mission.missionOrder.travelMethod
                            : "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ border: "none" }}>
                        <Typography sx={{ color: "lightgray" }}>
                          {getFullDate(mission.createdAt)}
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