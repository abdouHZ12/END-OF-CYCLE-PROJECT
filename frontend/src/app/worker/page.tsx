"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import { apiGet, type ApiError } from "@/lib/api";
import { getStoredEmployeeId } from "@/lib/authStorage";
import { formatAlgeriaDate } from "@/lib/datetime";

import Button from "@/components/naftal/Button";
import Badge from "@/components/naftal/Badge";
import Table from "@/components/naftal/Table";
import { Card } from "@/components/naftal/Card";

export type Document = {
  id: number;
  type: string;
  createdAt: string;
  status: string;
  qrCode?: string;
  managerComment?: string | null;
  issuedById?: number;
  authIssuedAt?: string;
  decisionMadeById?: number;
  decisionMadeBy?: {
    id: number;
    name: string;
    username: string;
  } | null;
  exitSlip?: {
    exitTime: string;
    returnTime: string;
    gate: string;
  };
  absenceAuth?: {
    endDate: string;
    startDate: string;
    reason: string;
  };
  missionOrder?: {
    duration: number;
    destination: string;
    purpose: string;
    travelMethod: string;
  };
};

export type DocumentResponse = {
  [key: string]: Document;
};

export function gettype(type: string) {
  switch (type) {
    case "MISSION_ORDER":
      return "Mission Order";
    case "ABSENCE_AUTH":
      return "Absence Authorization";
    case "EXIT_SLIP":
      return "Exit Slip";
    default:
      return type;
  }
}

function reqNumber(row: Document) {
  return `REQ-${new Date(row.createdAt).getFullYear()}-${String(row.id).padStart(4, "0")}`;
}


export default function Page() {
  const [rows, setRows] = useState<Document[]>([]);
  const [cardDeltas, setCardDeltas] = useState<{
    totalDelta: number;
    pendingDelta: number;
    approvedRateDeltaPct: number;
    rejectedRateDeltaPct: number;
  }>({ totalDelta: 0, pendingDelta: 0, approvedRateDeltaPct: 0, rejectedRateDeltaPct: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);

  function formatSigned(value: number): string {
    if (value > 0) return `+${value}`;
    return String(value);
  }

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const employeeId = getStoredEmployeeId();
      if (!employeeId) {
        setError("You are not logged in.");
        setEmpty(true);
        setRows([]);
        return;
      }


      const res = await apiGet<DocumentResponse>(`/api/dAll/documents/${employeeId}`);
      const documentsArray = Object.values(res);

      const now = Date.now();
      const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
      const currentStart = new Date(now - tenDaysMs);
      const prevStart = new Date(now - 2 * tenDaysMs);

      const withinLast10Days = documentsArray.filter((doc) => {
        const created = new Date(doc.createdAt);
        if (Number.isNaN(created.getTime())) return false;
        return created.getTime() >= currentStart.getTime();
      });

      const withinPrev10Days = documentsArray.filter((doc) => {
        const created = new Date(doc.createdAt);
        if (Number.isNaN(created.getTime())) return false;
        return created.getTime() >= prevStart.getTime() && created.getTime() < currentStart.getTime();
      });

      const currentPending = withinLast10Days.filter((d) => d.status === "PENDING").length;
      const prevPending = withinPrev10Days.filter((d) => d.status === "PENDING").length;

      const currentApproved = withinLast10Days.filter((d) => d.status === "APPROVED").length;
      const currentRejected = withinLast10Days.filter((d) => d.status === "REJECTED").length;
      const prevApproved = withinPrev10Days.filter((d) => d.status === "APPROVED").length;
      const prevRejected = withinPrev10Days.filter((d) => d.status === "REJECTED").length;

      const currentDecided = currentApproved + currentRejected;
      const prevDecided = prevApproved + prevRejected;

      const currentApprovedRate = currentDecided > 0 ? currentApproved / currentDecided : 0;
      const prevApprovedRate = prevDecided > 0 ? prevApproved / prevDecided : 0;
      const currentRejectedRate = currentDecided > 0 ? currentRejected / currentDecided : 0;
      const prevRejectedRate = prevDecided > 0 ? prevRejected / prevDecided : 0;

      setCardDeltas({
        totalDelta: withinLast10Days.length - withinPrev10Days.length,
        pendingDelta: currentPending - prevPending,
        approvedRateDeltaPct: Math.round((currentApprovedRate - prevApprovedRate) * 100),
        rejectedRateDeltaPct: Math.round((currentRejectedRate - prevRejectedRate) * 100),
      });

      if (withinLast10Days.length === 0) {
        setEmpty(true);
        setRows([]);
      } else {
        setEmpty(false);
        setRows(withinLast10Days);
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "An error occurred while fetching documents.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);


  const pendingCount = rows.filter((r) => r.status === "PENDING").length;
  const approvedCount = rows.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = rows.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="min-h-dvh bg-(--naftal-bg) pt-17.5 px-4 sm:px-8 lg:px-10 pb-12">
      <div className="mx-auto w-full">
        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-(--naftal-text-primary)">
          Tableu de bord
        </h1>
        <p className="mt-1 text-base sm:text-lg font-semibold text-(--naftal-text-muted)">
            Bienvenue sur votre tableau de bord
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 hover:border-(--naftal-brand-border-strong) transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--naftal-info-muted)">
                <TextSnippetOutlinedIcon className="text-(--naftal-info)" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-(--naftal-text-secondary)">
                <ArrowUpwardIcon sx={{ fontSize: 14, color: "var(--naftal-info)" }} />
                {formatSigned(cardDeltas.totalDelta)} 10d
              </div>
            </div>
            <div className="mt-4 text-4xl font-extrabold text-(--naftal-text-primary)">
              {rows.length}
            </div>
            <div className="mt-1 text-sm font-semibold text-(--naftal-text-muted)">
              Total documents in last 10 days
            </div>
          </Card>

          <Card className="p-5 hover:border-(--naftal-brand-border-strong) transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--naftal-warning-muted)">
                <AccessTimeIcon className="text-(--naftal-warning)" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-(--naftal-text-secondary)">
                <ArrowUpwardIcon sx={{ fontSize: 14, color: "var(--naftal-info)" }} />
                {formatSigned(cardDeltas.pendingDelta)} new
              </div>
            </div>
            <div className="mt-4 text-4xl font-extrabold text-(--naftal-text-primary)">
              {pendingCount}
            </div>
            <div className="mt-1 text-sm font-semibold text-(--naftal-text-muted)">
              En attente
            </div>
          </Card>

          <Card className="p-5 hover:border-(--naftal-brand-border-strong) transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--naftal-success-muted)">
                <TaskAltOutlinedIcon className="text-(--naftal-success)" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-(--naftal-text-secondary)">
                <ArrowUpwardIcon sx={{ fontSize: 14, color: "var(--naftal-info)" }} />
                {formatSigned(cardDeltas.approvedRateDeltaPct)}%
              </div>
            </div>
            <div className="mt-4 text-4xl font-extrabold text-(--naftal-text-primary)">
              {approvedCount}
            </div>
            <div className="mt-1 text-sm font-semibold text-(--naftal-text-muted)">
              Approuve
            </div>
          </Card>


          <Card className="p-5 hover:border-(--naftal-brand-border-strong) transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--naftal-error-muted)">
                <CancelOutlinedIcon className="text-(--naftal-error)" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-(--naftal-text-secondary)">
                <ArrowUpwardIcon sx={{ fontSize: 14, color: "var(--naftal-info)" }} />
                {formatSigned(cardDeltas.rejectedRateDeltaPct)}%
              </div>
            </div>
            <div className="mt-4 text-4xl font-extrabold text-(--naftal-text-primary)">
              {rejectedCount}
            </div>
            <div className="mt-1 text-sm font-semibold text-(--naftal-text-muted)">
              Rejete
            </div>
          </Card>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-(--naftal-text-primary)">
            Les demandes récentes
          </h2>
          <Link href="/worker/my-requests">
          <Button
            variant="outline"
            className="hover:bg-(--naftal-brand) hover:text-(--naftal-on-brand) hover:border-(--naftal-brand)"
          >
            Tout voir
          </Button>
          </Link>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <div className="py-10 text-center text-sm font-semibold text-(--naftal-text-muted)">
              Loading documents...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-sm font-semibold text-(--naftal-error)">
              {error}
            </div>
          ) : empty ? (
            <Card className="p-8 text-center">
              <div className="text-base font-semibold text-(--naftal-text-secondary)">
                No documents found in the last 10 days
              </div>
            </Card>
          ) : (
            <>
              <div className="hidden md:block">
                <Table
                  rows={rows}
                  getRowKey={(r) => r.id}
                  columns={[
                    {
                      header: "Numéro",
                      cell: (row) => (
                        <span className="font-extrabold text-(--naftal-brand)">
                          {reqNumber(row)}
                        </span>
                      ),
                    },
                    {
                      header: "Type de demande",
                      cell: (row) => (
                        <span className="inline-flex items-center gap-2 text-(--naftal-text-primary)">
                          <TextSnippetOutlinedIcon
                            className="text-(--naftal-text-muted)"
                            fontSize="small"
                          />
                          {gettype(row.type)}
                        </span>
                      ),
                    },
                    {
                      header: "Destination / Motif",
                      cell: (row) => (
                        <span className="inline-flex items-center gap-2 text-(--naftal-text-secondary)">
                          <LocationOnIcon
                            className="text-(--naftal-text-muted)"
                            fontSize="small"
                          />
                          {row.missionOrder?.destination ||
                            row.absenceAuth?.reason ||
                            "/"}
                        </span>
                      ),
                    },
                    {
                      header: "Date de soumission",
                      cell: (row) => (
                        <span className="inline-flex items-center gap-2 text-(--naftal-text-secondary)">
                          <CalendarTodayIcon
                            className="text-(--naftal-text-muted)"
                            fontSize="small"
                          />
                          {formatAlgeriaDate(row.createdAt)}
                        </span>
                      ),
                    },
                    {
                      header: "Statut",
                      cell: (row) => <Badge status={row.status} />,
                    },
                  ]}
                />
              </div>

              <div className="md:hidden space-y-3">
                {rows.map((row) => (
                  <Card key={row.id} className="p-5">
                    <div className="text-sm font-extrabold text-(--naftal-brand)">
                      {reqNumber(row)}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-(--naftal-text-primary)">
                      {gettype(row.type)}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm text-(--naftal-text-secondary)">
                      <LocationOnIcon
                        className="text-(--naftal-text-muted)"
                        fontSize="small"
                      />
                      {row.missionOrder?.destination ||
                        row.absenceAuth?.reason ||
                        "/"}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-(--naftal-text-secondary)">
                      <CalendarTodayIcon
                        className="text-(--naftal-text-muted)"
                        fontSize="small"
                      />
                      {formatAlgeriaDate(row.createdAt)}
                    </div>

                    <div className="mt-4">
                      <Badge status={row.status} />
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="fixed bottom-10 right-6 sm:right-10 z-30">
        <Link href="/worker/fill-request">
          <Button
            variant="primary"
            className="rounded-full px-6 py-3 shadow-(--naftal-shadow-strong)"
          >
            + Nouvelle demande
          </Button>
        </Link>
      </div>
    </div>
  );
}
