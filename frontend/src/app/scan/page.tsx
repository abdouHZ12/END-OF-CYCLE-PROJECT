'use client';

import { useEffect , useCallback , useState } from "react";
import dynamic from 'next/dynamic';
import { useSearchParams } from "next/navigation";
import {scanPost , type ApiError} from "@/lib/api";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

type ScanResponse = {
  message?: string;
  Document : {
    id: number;
    type: string;
    leaveSession?: {
      status: string;
      leaveTime: string;
      returnTime: string;
      employeeId : number;
    }
  }
}
function formatAlgeriaDateTime(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value; // fallback if backend sends non-ISO
  return d.toLocaleString();
}


function ScanPageInner() {
  const params = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ScanResponse | null>(null);

const scan = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        setData(null);

        const token = params.get("token");
        if (!token) throw new Error("Missing token in URL");

        const res = await scanPost<ScanResponse>(`/api/scan`, { token });
        setData(res);
    } catch(err) {
        const apiError = err as ApiError;
        setError(apiError.message || "An error occurred during scanning.");
    } finally {
        setLoading(false);
    }
}, [params]);

  useEffect(() => {

    scan();

  }, [scan]);

  const doc = data?.Document;
  const leaveSession = doc?.leaveSession;

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Scan Result
              </Typography>
              <Typography variant="body2" color="text.secondary">
                QR token verification and document lookup
              </Typography>
            </Box>

            <Divider />

            {loading && (
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <CircularProgress size={22} />
                <Typography variant="body2" color="text.secondary">
                  Scanning…
                </Typography>
              </Stack>
            )}

            {!loading && error && (
              <Alert severity="error" variant="filled">
                {error}
              </Alert>
            )}

            {!loading && !error && (
              <>
                <Alert severity="success" variant="outlined">
                  {data?.message || "Scan completed successfully."}
                </Alert>

                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                    <Chip label={`Document ID: ${doc?.id ?? "—"}`} />
                    <Chip label={`Type: ${doc?.type ?? "—"}`} color="primary" variant="outlined" />
                    {leaveSession?.employeeId ? <Chip label={`Employee ID: ${leaveSession?.employeeId}`} variant="outlined" /> : null}
                  </Stack>

                  <Card variant="outlined" sx={{ bgcolor: "background.default" }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
                        Leave Session Details
                      </Typography>

                      <Stack spacing={1}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Temp de sortie
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatAlgeriaDateTime(leaveSession?.leaveTime)}
                          </Typography>
                        </Stack>

                        <Divider />

                        <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Temp de retour
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatAlgeriaDateTime(leaveSession?.returnTime)}
                          </Typography>
                        </Stack>

                        <Divider />

                        <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            State
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {leaveSession?.status ?? "—"}
                          </Typography>
                        </Stack>

                        
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default dynamic(() => Promise.resolve(ScanPageInner), { ssr: false });