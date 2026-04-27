'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { scanPost, type ApiError } from '@/lib/api';
import type { Html5Qrcode as Html5QrcodeType } from 'html5-qrcode';
import {
  Avatar, Alert, Box, Button, Card, CardContent,
  Chip, CircularProgress, Divider, Stack, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import { apiGet } from '@/lib/api';

type DocumentType = 'MISSION_ORDER' | 'ABSENCE_AUTH' | 'EXIT_SLIP' | string;

type SessionFromApi = {
  id: number;
  status: string | null;
  leaveTime: string | null;
  returnTime: string | null;
  createdAt: string;
  employeeId: number;
  document: {
    id: number;
    type: string;
    status: string;
    qrCode: string | null;
    managerComment: string | null;
    createdAt: string;
    employee: { 
      id: number; 
      name: string; 
      username: string; 
      email: string;                                    // ← add
      structure: { id: number; name: string } | null;  // ← add
    } | null;
    missionOrder: { destination: string; duration: number; purpose: string; travelMethod: string } | null;
    absenceAuth: { startDate: string; endDate: string; reason: string } | null;
    exitSlip: { gate: string; exitTime: string; returnTime: string } | null;
  } | null;
};

type ScanResponse = {
  message?: string;
  Document: {
    id: number;
    type: DocumentType;
    status?: string;
    managerComment?: string | null;
    createdAt?: string;
    qrCode?: string | null;
    employee?: {
      id: number;
      name: string;
      username: string;
      email: string;
      structure?: { id: number; name: string } | null;
    } | null;
    decisionMadeBy?: { id: number; name: string; username: string } | null;
    leaveSession?: {
      status?: string | null;
      leaveTime?: string | null;
      returnTime?: string | null;
      employeeId?: number;
    } | null;
    exitSlip?: { gate: string; exitTime: string; returnTime: string } | null;
    absenceAuth?: { startDate: string; endDate: string; reason: string } | null;
    missionOrder?: { destination: string; duration: number; purpose: string; travelMethod: string } | null;
  };
};

type ScanRecord = {
  key: string;
  token: string;
  scannedAt: string;
  response?: ScanResponse;
  error?: string;
  loading?: boolean;
};

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function extractToken(scannedText: string): string {
  const raw = (scannedText ?? '').trim();
  if (!raw) return raw;
  try {
    const token = new URL(raw).searchParams.get('token');
    if (token) return token;
  } catch { /* not a URL */ }
  const m = raw.match(/[?&]token=([^&]+)/i);
  if (m?.[1]) return decodeURIComponent(m[1]);
  return raw;
}

function getTypeLabel(type?: string) {
  switch (type) {
    case 'MISSION_ORDER': return 'Mission Order';
    case 'ABSENCE_AUTH':  return 'Absence Authorization';
    case 'EXIT_SLIP':     return 'Exit Slip';
    default:              return type ?? '—';
  }
}

function getStatusChip(status?: string) {
  if (!status) return null;
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDING:  { label: 'Pending',  color: 'orange',  bg: 'rgba(255,165,0,0.1)', border: '#ffa500' },
    APPROVED: { label: 'Approved', color: '#4caf50', bg: 'rgba(0,128,0,0.1)',   border: '#4caf50' },
    REJECTED: { label: 'Rejected', color: '#f44336', bg: 'rgba(255,0,0,0.1)',   border: '#f44336' },
  };
  const s = map[status];
  if (!s) return <Chip label={status} size="small" variant="outlined" />;
  return <Chip label={s.label} size="small" sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 'bold', border: `1px solid ${s.border}`, borderRadius: '8px' }} />;
}

// ─── main component ────────────────────────────────────────────────────────────

function AgentScanPageInner() {
  const [cameraOpen, setCameraOpen]             = useState(false);
  const [cameraError, setCameraError]           = useState<string | null>(null);
  const [scanError, setScanError]               = useState<string | null>(null);
  const [busy, setBusy]                         = useState(false);
  const [records, setRecords]                   = useState<ScanRecord[]>([]);

  const [scannerKey, setScannerKey] = useState(0);

  const lastTokenRef   = useRef<string | null>(null);
  const scannerRef     = useRef<Html5QrcodeType | null>(null);
  const startingRef    = useRef(false); // prevents double-click race
  const stoppingRef    = useRef(false);

  const sortedRecords = useMemo(() => records, [records]);

  useEffect(() => {
    const load = async () => {
      try {
        const sessions = await apiGet<SessionFromApi[]>('/api/documents/sessions');

        const loaded: ScanRecord[] = sessions.map((s: SessionFromApi) => ({
          key: `session-${s.id}`,
          token: s.document?.qrCode ?? '',
          scannedAt: s.leaveTime ?? s.createdAt,
          response: s.document ? {
            message: `Session ${s.status}`,
            Document: {
              ...s.document,
              employee: s.document.employee ?? null,
              leaveSession: {
                status: s.status,
                leaveTime: s.leaveTime,
                returnTime: s.returnTime,
                employeeId: s.employeeId,
              },
            },
          } : undefined,
        }));

        setRecords(loaded);
      } catch { /* ignore */ }
    };
    void load();
  }, []);
  // ─── stop ──────────────────────────────────────────────────────────────────

  const stopCamera = useCallback(async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;

    const scanner = scannerRef.current;
    if (scanner) {
      try { await scanner.stop();  } catch { /* ignore */ }
      try { await scanner.clear(); } catch { /* ignore */ }
      scannerRef.current = null;
    }

    startingRef.current = false;
    stoppingRef.current = false;
    setCameraOpen(false);
    // bump key so next open gets a clean DOM node
    setScannerKey((k) => k + 1);
  }, []);

  // ─── records ───────────────────────────────────────────────────────────────

  const addRecord    = useCallback((r: ScanRecord) => setRecords((p) => [r, ...p]), []);
  const updateRecord = useCallback((key: string, patch: Partial<ScanRecord>) =>
    setRecords((p) => p.map((r) => (r.key === key ? { ...r, ...patch } : r))), []);

  // ─── verify token ──────────────────────────────────────────────────────────

  const verifyToken = useCallback(async (token: string) => {
    const trimmed = token.trim();
    if (!trimmed) return;
    if (lastTokenRef.current === trimmed) return; // debounce
    lastTokenRef.current = trimmed;
    setTimeout(() => { if (lastTokenRef.current === trimmed) lastTokenRef.current = null; }, 1500);

    setScanError(null);
    setBusy(true);
    const key = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    addRecord({ key, token: trimmed, scannedAt: new Date().toISOString(), loading: true });

    try {
      const res = await scanPost<ScanResponse>('/api/scan', { token: trimmed });
      updateRecord(key, { response: res, loading: false });
    } catch (err) {
      const msg = (err as ApiError).message || 'Scan failed.';
      updateRecord(key, { error: msg, loading: false });
      setScanError(msg);
    } finally {
      setBusy(false);
    }
  }, [addRecord, updateRecord]);

  // ─── start camera ──────────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    if (startingRef.current || cameraOpen) return;
    startingRef.current = true;
    setCameraError(null);
    setScanError(null);

    // Security / API checks
    if (typeof window !== 'undefined') {
      if (!window.isSecureContext) {
        setCameraError('Camera requires HTTPS. Use USB (adb reverse) so localhost is served securely.');
        startingRef.current = false;
        return;
      }
      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraError('Camera API unavailable. Try Chrome/Edge on Android or Safari on iOS.');
        startingRef.current = false;
        return;
      }
    }

    setCameraOpen(true);

    // Wait for the freshly-mounted DOM node
    let mount: HTMLElement | null = null;
    const deadline = Date.now() + 2000;
    while (!mount && Date.now() < deadline) {
      mount = document.getElementById(`qr-reader-${scannerKey}`);
      if (!mount) await new Promise<void>((r) => requestAnimationFrame(() => r()));
    }

    if (!mount) {
      setCameraError('Camera element not ready. Please try again.');
      setCameraOpen(false);
      startingRef.current = false;
      return;
    }

    const { Html5Qrcode } = await import('html5-qrcode');
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    const attempts: Array<Parameters<InstanceType<typeof Html5Qrcode>['start']>[0]> = [
      { facingMode: { ideal: 'environment' } },
      { facingMode: 'environment' },
      {},
    ];

    let started = false;
    for (const cam of attempts) {
      // Fresh instance per attempt — avoids stale internal state
      const scanner = new Html5Qrcode(`qr-reader-${scannerKey}`);
      try {
        await scanner.start(cam, config,
          async (text) => { await verifyToken(extractToken(text)); },
          () => {}
        );
        scannerRef.current = scanner; // only assign on success
        started = true;
        break;
      } catch {
        try { await scanner.clear(); } catch { /* ignore */ }
      }
    }

    if (!started) {
      setCameraError('Could not access camera. Check permissions and try again.');
      setCameraOpen(false);
      setScannerKey((k) => k + 1);
    }
    startingRef.current = false;
  }, [cameraOpen, scannerKey, verifyToken]);

  // ─── cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => { void stopCamera(); };
  }, [stopCamera]);

  // ─── render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ flexGrow: 1, mt: '70px', backgroundColor: 'rgb(10,22,40)', padding: { xs: '16px', sm: '24px', md: '36px' }, overflowY: 'auto', overflowX: 'hidden' }}>

      <h1 style={{ fontSize: '35px', fontWeight: 'bold', color: '#fff' }}>Scanner</h1>
      <p style={{ fontSize: '20px', color: 'gray', fontWeight: 'bold', marginBottom: '20px' }}>
        Scan QR codes to validate requests
      </p>

      <Grid container spacing={{ xs: 2, sm: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

        {/* ── Camera card ─────────────────────────────────────────────────── */}
        <Grid size={{ xs: 4, sm: 8, md: 5 }}>
          <Card sx={{ bgcolor: '#1a2942', color: '#fff', borderRadius: 2, boxShadow: 'none', p: 2, border: '0.1px solid transparent', transition: 'transform 0.1s', '&:hover': { borderColor: 'darkorange', transform: 'scale(1.01)' } }}>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={2}>

                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,165,0,0.12)', width: 48, height: 48 }}>
                    <QrCodeScannerOutlinedIcon sx={{ color: '#ffa500' }} />
                  </Avatar>
                  {busy ? <CircularProgress size={20} sx={{ color: '#ffa500' }} /> : null}
                </Stack>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Camera</Typography>
                  <Typography variant="body2" sx={{ color: 'lightgray' }}>Open the camera and scan a QR code</Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button variant="contained" startIcon={<CameraAltOutlinedIcon />}
                    onClick={() => void startCamera()} disabled={cameraOpen} fullWidth
                    sx={{ backgroundColor: 'orange', color: 'black', textTransform: 'none', borderRadius: '10px', fontWeight: 'bold', '&:hover': { backgroundColor: 'darkorange' } }}>
                    Open camera
                  </Button>
                  <Button variant="outlined" startIcon={<StopCircleOutlinedIcon />}
                    onClick={() => void stopCamera()} disabled={!cameraOpen} fullWidth
                    sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 'bold', borderColor: 'rgba(239,68,68,0.7)', color: '#ef4444', '&:hover': { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.14)' } }}>
                    Stop
                  </Button>
                </Stack>

                {cameraError ? <Alert severity="error"   variant="filled">{cameraError}</Alert> : null}
                {scanError   ? <Alert severity="warning" variant="outlined" sx={{ borderColor: 'rgba(255,165,0,0.45)', color: '#fff' }}>{scanError}</Alert> : null}

                <Card sx={{ backgroundColor: 'rgb(20,30,50)', padding: '14px', borderRadius: '12px', border: cameraOpen ? '1px solid #ffa500' : '1px solid rgba(255,255,255,0.10)' }}>
                  <Box sx={{ position: 'relative', width: '100%', minHeight: { xs: '240px', sm: '280px', md: '320px' }, overflow: 'hidden', borderRadius: '8px', backgroundColor: !cameraOpen ? 'rgb(40,50,70)' : 'transparent' }}>
                    {/* key prop = fresh DOM node every open, html5-qrcode never sees stale state */}
                    <Box key={scannerKey} id={`qr-reader-${scannerKey}`}
                      sx={{ width: '100%', height: '100%', '& video': { width: '100% !important', maxHeight: '70dvh', objectFit: 'cover' } }}
                    />
                    {!cameraOpen ? (
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>Camera preview</Typography>
                      </Box>
                    ) : null}
                  </Box>
                </Card>

              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Records card ────────────────────────────────────────────────── */}
        <Grid size={{ xs: 4, sm: 8, md: 7 }}>
          <Card sx={{ bgcolor: '#1a2942', color: '#fff', borderRadius: 2, boxShadow: 'none', p: 2, border: '0.1px solid transparent', transition: 'transform 0.1s', '&:hover': { borderColor: 'darkorange', transform: 'scale(1.01)' } }}>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={2}>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Scanned employees</Typography>
                  <Typography variant="body2" sx={{ color: 'lightgray' }}>Latest scans first</Typography>
                </Box>

                <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />

                {sortedRecords.length === 0
                  ? <Typography variant="body2" sx={{ color: 'lightgray' }}>No scans yet.</Typography>
                  : (
                    <Stack spacing={1.5}>
                      {sortedRecords.map((r) => {
                        const doc      = r.response?.Document;
                        const employee = doc?.employee;
                        const type     = doc?.type;
                        const initials = employee?.name
                          ? employee.name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
                          : '—';

                        return (
                          <Card key={r.key} sx={{ backgroundColor: 'rgb(20,30,50)', padding: '16px', borderRadius: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.10)' }}>
                            <Stack spacing={1.25}>

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                                <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
                                  <Avatar sx={{ bgcolor: 'darkorange', color: '#222', width: 38, height: 38, fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>{initials}</Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{employee?.name ?? 'Unknown employee'}</Typography>
                                    <Typography variant="body2" sx={{ color: 'lightgray' }} noWrap>
                                      {employee ? `${employee.username} • ${employee.email}${employee.structure?.name ? ` • ${employee.structure.name}` : ''}` : '—'}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                  <Typography variant="caption" sx={{ color: 'lightgray', fontWeight: 'bold' }}>{formatDateTime(r.scannedAt)}</Typography>
                                  <Box sx={{ mt: 0.75 }}>{getStatusChip(doc?.status)}</Box>
                                </Box>
                              </Stack>

                              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                                <Chip label={`Document #${doc?.id ?? '—'}`} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff' }} />
                                <Chip label={getTypeLabel(type)} size="small" sx={{ backgroundColor: 'rgba(255,165,0,0.12)', color: '#ffa500', fontWeight: 'bold' }} />
                                <Chip label={`Token: ${r.token.slice(0, 12)}…`} size="small" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.25)', color: 'lightgray' }} />
                              </Stack>

                              {r.loading ? (
                                <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                                  <CircularProgress size={18} sx={{ color: '#ffa500' }} />
                                  <Typography variant="body2" sx={{ color: 'lightgray', fontWeight: 'bold' }}>Verifying…</Typography>
                                </Stack>
                              ) : null}

                              {r.error             ? <Alert severity="error"   variant="outlined">{r.error}</Alert> : null}
                              {r.response?.message ? <Alert severity="success" variant="outlined">{r.response.message}</Alert> : null}

                              {type === 'EXIT_SLIP' && (
                                <Stack spacing={0.5}>
                                  <Typography variant="body2" sx={{ color: 'lightgray' }}>Gate: <b style={{ color: '#fff' }}>{doc?.exitSlip?.gate ?? '—'}</b></Typography>
                                  <Typography variant="body2" sx={{ color: 'lightgray' }}>Leave time: <b style={{ color: '#fff' }}>{formatDateTime(doc?.leaveSession?.leaveTime)}</b></Typography>
                                  <Typography variant="body2" sx={{ color: 'lightgray' }}>Return time: <b style={{ color: '#fff' }}>{formatDateTime(doc?.leaveSession?.returnTime)}</b></Typography>
                                  <Typography variant="body2" sx={{ color: 'lightgray' }}>Session status: <b style={{ color: '#fff' }}>{doc?.leaveSession?.status ?? '—'}</b></Typography>
                                </Stack>
                              )}
                              {type === 'ABSENCE_AUTH' && (
                                <Stack spacing={0.5}>
                                  <Typography variant="body2" sx={{ color: 'lightgray' }}>Start: <b style={{ color: '#fff' }}>{formatDateTime(doc?.absenceAuth?.startDate)}</b></Typography>
                                  <Typography variant="body2" sx={{ color: 'lightgray' }}>End: <b style={{ color: '#fff' }}>{formatDateTime(doc?.absenceAuth?.endDate)}</b></Typography>
                                  <Typography variant="body2" sx={{ color: 'lightgray' }}>Reason: <b style={{ color: '#fff' }}>{doc?.absenceAuth?.reason ?? '—'}</b></Typography>
                                </Stack>
                              )}
                              {type === 'MISSION_ORDER' && (
                                <Stack spacing={0.5}>
                                  <Typography variant="body2" sx={{ color: 'lightgray' }}>Destination: <b style={{ color: '#fff' }}>{doc?.missionOrder?.destination ?? '—'}</b></Typography>
                                  <Typography variant="body2" sx={{ color: 'lightgray' }}>Duration: <b style={{ color: '#fff' }}>{doc?.missionOrder?.duration ?? '—'} day(s)</b></Typography>
                                  <Typography variant="body2" sx={{ color: 'lightgray' }}>Travel: <b style={{ color: '#fff' }}>{doc?.missionOrder?.travelMethod ?? '—'}</b></Typography>
                                  <Typography variant="body2" sx={{ color: 'lightgray' }}>Purpose: <b style={{ color: '#fff' }}>{doc?.missionOrder?.purpose ?? '—'}</b></Typography>
                                </Stack>
                              )}
                              {doc?.managerComment ? (
                                <Typography variant="body2" sx={{ color: 'lightgray' }}>Manager comment: <b style={{ color: '#fff' }}>{doc.managerComment}</b></Typography>
                              ) : null}

                            </Stack>
                          </Card>
                        );
                      })}
                    </Stack>
                  )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}

export default dynamic(() => Promise.resolve(AgentScanPageInner), { ssr: false });