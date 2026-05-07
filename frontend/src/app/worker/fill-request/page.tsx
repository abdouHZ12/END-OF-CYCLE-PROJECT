"use client"

import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import { useRef } from "react";
import { apiPost, type ApiError } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

type DocumentResponse = {
  message?: string;
  document: {
    id: number;
    type: string;
    status: string;
  };
};

export default function Page() {
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");

  const [returnTime, setReturnTime] = React.useState<string>("");
  const [exitTime, setExitTime] = React.useState<string>("");
  const [gate, setGate] = React.useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isSelected, setIsSelected] = useState("ExitSlip");

  const toastTimerRef = useRef<number | null>(null);

  const user = useCurrentUser();
  const employeeId = user ? Number(user.id) : null;

  async function handleExitSlipSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) { setError("Please sign in"); return; }

    const parseTodayTime = (time: string): Date | null => {
      const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
      if (!match) return null;
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate(), Number(match[1]), Number(match[2]), 0, 0);
    };

    const exitDateTime = parseTodayTime(exitTime);
    const returnDateTime = parseTodayTime(returnTime);
    if (!exitDateTime) { setError("Leave time is invalid"); return; }
    if (!returnDateTime) { setError("Return time is invalid"); return; }
    if (returnDateTime.getTime() < exitDateTime.getTime()) {
      setError("Return time must be after leave time (same day)");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await apiPost<DocumentResponse>("/api/documents/ExitSlip", {
        Type: "EXIT_SLIP",
        EmployeeId: employeeId,
        exitTime: exitDateTime,
        returnTime: returnDateTime,
        gate,
      });
      showToast("Exit Slip created successfully", 2500);
      setExitTime("");
      setReturnTime("");
      setGate("");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || "An error occurred while submitting the exit slip");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAbsenceAuthorizationSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) { setError("Please sign in"); return; }
    setIsLoading(true);
    setError(null);
    try {
      await apiPost<DocumentResponse>("/api/documents/AbsenceAuth", {
        Type: "ABSENCE_AUTH",
        EmployeeId: employeeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      });
      showToast("Absence Authorization created successfully", 2500);
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || "An error occurred while submitting the absence authorization");
    } finally {
      setIsLoading(false);
    }
  }

  const router = useRouter();
  const handleCancel = () => { router.push("/worker"); };

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

  // Shared input style — consumes CSS vars, no hardcoded colors
  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "var(--naftal-bg)",
    border: "1px solid var(--naftal-border)",
    borderRadius: "5px",
    fontSize: "16px",
    marginTop: "2px",
    marginBottom: "10px",
    padding: "8px",
    color: "var(--naftal-text-primary)",
    outline: "none",
  };

  const toastBox = toast ? (
    <Box sx={{
      mt: 1, mb: 1,
      borderRadius: 2,
      border: "1px solid var(--naftal-success)",
      backgroundColor: "var(--naftal-success-muted)",
      px: 2, py: 1.5,
      fontSize: 14,
      color: "var(--naftal-success)",
    }}>
      {toast}
    </Box>
  ) : null;

  const errorBox = error ? (
    <Box sx={{
      mt: 1, mb: 1,
      borderRadius: 2,
      border: "1px solid var(--naftal-error)",
      backgroundColor: "var(--naftal-error-muted)",
      px: 2, py: 1.5,
      fontSize: 14,
      color: "var(--naftal-error)",
    }}>
      {error}
    </Box>
  ) : null;

  const submitButton = (
    <Button
      disabled={isLoading}
      type="submit"
      sx={{
        backgroundColor: "var(--naftal-brand)",
        color: "var(--naftal-on-brand)", // ← was hardcoded "black"
        fontWeight: "bold",
        padding: "12px 24px",
        borderRadius: "8px",
        width: "100%",
        textTransform: "none",
        "&:hover": { backgroundColor: "var(--naftal-brand-hover)" },
      }}
    >
      {isLoading ? "Submitting..." : "Submit Request"}
    </Button>
  );

  const cancelButton = (
    <Button
      onClick={handleCancel}
      sx={{
        backgroundColor: "transparent",
        color: "var(--naftal-text-primary)",        // ← was hardcoded "white"
        fontWeight: "bold",
        padding: "12px 24px",
        border: "1px solid var(--naftal-border)",   // ← was hardcoded "1px solid white"
        borderRadius: "8px",
        width: "100%",
        textTransform: "none",
        "&:hover": { backgroundColor: "var(--naftal-hover)" },
      }}
    >
      Cancel
    </Button>
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "70px",
        backgroundColor: "var(--naftal-bg)",
        display: "grid",
        gridTemplateRows: "1fr auto",
        pt: "20px",
        pb: "20px",
        pr: { md: "20px", lg: "350px" },
        pl: { md: "20px", lg: "350px" },
      }}
    >
      <Box sx={{ width: "100%" }}>
        <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "var(--naftal-text-primary)" }}>
          New Request
        </h1>
        <p style={{ fontSize: "20px", color: "var(--naftal-text-muted)", fontWeight: "bold", marginBottom: "20px" }}>
          Submit a new authorization request
        </p>


        <Grid container spacing={{ md: 1, lg: 1 }} columns={{ md: 12, lg: 16 }}>
          <Grid key={1} size={{ md: 6, lg: 8 }}>
            <Button
              fullWidth
              onClick={() => setIsSelected("ExitSlip")}
              sx={{
                height: "100%",
                color: isSelected === "ExitSlip" ? "var(--naftal-text-primary)" : "var(--naftal-text-secondary)",
                backgroundColor: isSelected === "ExitSlip" ? "var(--naftal-surface-3)" : "var(--naftal-surface-1)",
                borderRadius: "12px 12px 0 0",
                borderBottom: isSelected === "ExitSlip" ? "2px solid var(--naftal-brand)" : "none",
                textTransform: "none",
                padding: "12px 16px",
              }}
            >
              Exit Slip
            </Button>
          </Grid>
          <Grid key={2} size={{ md: 6, lg: 8 }}>
            <Button
              fullWidth
              onClick={() => setIsSelected("AbsenceAuthorization")}
              sx={{
                height: "100%",
                color: isSelected === "AbsenceAuthorization" ? "var(--naftal-text-primary)" : "var(--naftal-text-secondary)",
                backgroundColor: isSelected === "AbsenceAuthorization" ? "var(--naftal-surface-3)" : "var(--naftal-surface-1)",
                borderRadius: "12px 12px 0 0",
                borderBottom: isSelected === "AbsenceAuthorization" ? "2px solid var(--naftal-brand)" : "none",
                textTransform: "none",
                padding: "12px 16px",
              }}
            >
              Absence Authorization
            </Button>
          </Grid>
        </Grid>

        {isSelected === "ExitSlip" && (
          <Grid container columns={{ md: 12, lg: 12 }} sx={{ width: "100%" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              style={{ width: "100%" }}
            >
              <Box
                component="form"
                onSubmit={handleExitSlipSubmit}
                sx={{
                  padding: "24px",
                  backgroundColor: "var(--naftal-surface-3)",
                  borderRadius: "0 0 12px 12px",
                  border: "1px solid var(--naftal-border-subtle)",
                  width: "100%",
                }}
              >
                {toastBox}
                {errorBox}


                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <label style={{ color: "var(--naftal-text-primary)" }}>Leave Hour *</label>
                    <input
                      type="time"
                      step={60}
                      required
                      value={exitTime}
                      onChange={(e) => setExitTime(e.target.value)}
                      style={inputStyle}
                    />

                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <label style={{ color: "var(--naftal-text-primary)" }}>Return Hour *</label>
                    <input
                      type="time"
                      step={60}
                      required
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      style={inputStyle}
                    />
                  </Grid>
                </Grid>


                <label style={{ color: "var(--naftal-text-primary)" }}>Gate of leave *</label>
                <input
                  type="text"
                  placeholder="Gate"
                  required
                  value={gate}
                  onChange={(e) => setGate(e.target.value)}
                  style={inputStyle}
                />

                <Grid container spacing={2} sx={{ marginTop: "20px" }}>
                  <Grid size={{ xs: 12, md: 6 }}>{submitButton}</Grid>
                  <Grid size={{ xs: 12, md: 6 }}>{cancelButton}</Grid>
                </Grid>
              </Box>
            </motion.div>
          </Grid>
        )}

        {isSelected === "AbsenceAuthorization" && (
          <Grid container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              style={{ width: "100%" }}
            >
              <Box
                component="form"
                onSubmit={handleAbsenceAuthorizationSubmit}
                sx={{
                  padding: "24px",
                  backgroundColor: "var(--naftal-surface-3)",
                  borderRadius: "0 0 12px 12px",
                  border: "1px solid var(--naftal-border-subtle)",
                  width: "100%",
                }}
              >
                {toastBox}
                {errorBox}

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <label style={{ color: "var(--naftal-text-primary)" }}>Start Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={inputStyle}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <label style={{ color: "var(--naftal-text-primary)" }}>End Date *</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={inputStyle}
                    />
                  </Grid>
                </Grid>

                <label style={{ color: "var(--naftal-text-primary)" }}>Absence Reason *</label>
                <textarea
                  placeholder="Please describe the Absence Reason"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />

                <Grid container spacing={2} sx={{ marginTop: "20px" }}>
                  <Grid size={{ xs: 12, md: 6 }}>{submitButton}</Grid>
                  <Grid size={{ xs: 12, md: 6 }}>{cancelButton}</Grid>
                </Grid>
              </Box>
            </motion.div>
          </Grid>
        )}
      </Box>
    </Box>
  );
}