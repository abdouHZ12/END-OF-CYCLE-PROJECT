"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { apiPost } from "@/lib/api";

type Employee = { id: number; name: string; username: string };

type Document = {
  id: number;
  status: string;
  type: string;
  createdAt: string;
  employee: Employee;
  exitSlip?: { exitTime: string; returnTime: string; gate: string };
  absenceAuth?: { startDate: string; endDate: string; reason: string };
  missionOrder?: { destination: string; duration: number; purpose: string };
};

type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  recentDocuments: Document[];
};

const typeLabel: Record<string, string> = {
  EXIT_SLIP: "Bon de sortie",
  ABSENCE_AUTH: "Autorisation d'absence",
  MISSION_ORDER: "Ordre de mission",
};

const statusStyle: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:  { color: "#ffa500", bg: "rgba(255,165,0,0.2)",  label: "En attente" },
  APPROVED: { color: "#16a34a", bg: "rgba(22,163,74,0.2)",  label: "Approuvée" },
  REJECTED: { color: "#ef4444", bg: "rgba(239,68,68,0.2)",  label: "Rejetée" },
};

const formatReqNumber = (id: number, createdAt: string) => {
  const year = new Date(createdAt).getFullYear();
  return `REQ-${year}-${String(id).padStart(4, "0")}`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-DZ", {
    day: "2-digit", month: "long", year: "numeric",
  });

const getDestinationOrMotif = (doc: Document) => {
  if (doc.missionOrder) return `${doc.missionOrder.destination} - ${doc.missionOrder.purpose}`;
  if (doc.absenceAuth)  return doc.absenceAuth.reason;
  if (doc.exitSlip)     return `Porte ${doc.exitSlip.gate}`;
  return "—";
};

const statCards = (stats: Stats) => [
  {
    icon: "📄",
    value: stats.total,
    label: "Total demandes",
    trend: "+3 ce mois",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
  },
  {
    icon: "🕐",
    value: stats.pending,
    label: "En attente",
    trend: "2 nouvelles",
    color: "#ffa500",
    bg: "rgba(255,165,0,0.1)",
  },
  {
    icon: "✅",
    value: stats.approved,
    label: "Approuvées",
    trend: "+67%",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.1)",
  },
  {
    icon: "❌",
    value: stats.rejected,
    label: "Rejetées",
    trend: "-12%",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
  },
];

export default function MyDashboardPage() {
  const [stats, setStats]     = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState<string | null>(null);

  const getManagerId = () => {
    const raw = localStorage.getItem("naftal.employee");
    if (!raw) return null;
    return JSON.parse(raw).id;
  };

  React.useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const managerId = getManagerId();
        const data = await apiPost<Stats>("/api/manager/dashboard-stats", {
          ManagerId: managerId,
        });
        setStats(data);
      } catch {
        setError("Impossible de charger le tableau de bord.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, mt: "70px", backgroundColor: "rgb(10, 22, 40)", padding: "20px", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "#fff" }}>
        Tableau de bord
      </h1>
      <p style={{ fontSize: "16px", color: "gray", marginBottom: "28px" }}>
        Vue ensemble des demandes de votre équipe
      </p>

      {loading && <p style={{ color: "lightgray" }}>Chargement...</p>}

      {error && (
        <div style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
            {statCards(stats).map((card) => (
              <div
                key={card.label}
                style={{
                  backgroundColor: "#20314E",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{
                    backgroundColor: card.bg,
                    borderRadius: "8px",
                    padding: "8px",
                    fontSize: "20px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {card.icon}
                  </div>
                  <span style={{ color: "gray", fontSize: "12px" }}>↗ {card.trend}</span>
                </div>
                <p style={{ color: "#fff", fontSize: "32px", fontWeight: "bold", margin: 0 }}>
                  {card.value}
                </p>
                <p style={{ color: "gray", fontSize: "14px", margin: 0 }}>
                  {card.label}
                </p>
              </div>
            ))}
          </div>

          {/* Recent Documents Table */}
          <div style={{ backgroundColor: "#20314E", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
              <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "bold", margin: 0 }}>
                Demandes récentes
              </h2>
              <button
                onClick={() => window.location.href = "/manager/employees-history"}
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Voir tout
              </button>
            </div>

            {/* Table Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1.5fr 2fr 1.5fr 1fr",
              padding: "12px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              {["Numéro", "Type de demande", "Destination / Motif", "Date de soumission", "Statut"].map((h) => (
                <span key={h} style={{ color: "gray", fontSize: "13px", fontWeight: "bold" }}>{h}</span>
              ))}
            </div>

            {/* Table Rows */}
            {stats.recentDocuments.length === 0 && (
              <p style={{ color: "gray", textAlign: "center", padding: "32px" }}>
                Aucune demande récente
              </p>
            )}
            {stats.recentDocuments.map((doc) => {
              const s = statusStyle[doc.status] ?? statusStyle.PENDING;
              return (
                <div
                  key={doc.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1.5fr 2fr 1.5fr 1fr",
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#ffa500", fontSize: "13px", fontWeight: "bold" }}>
                    {formatReqNumber(doc.id, doc.createdAt)}
                  </span>
                  <span style={{ color: "lightgray", fontSize: "13px" }}>
                    📄 {typeLabel[doc.type] ?? doc.type}
                  </span>
                  <span style={{ color: "lightgray", fontSize: "13px" }}>
                    📍 {getDestinationOrMotif(doc)}
                  </span>
                  <span style={{ color: "lightgray", fontSize: "13px" }}>
                    📅 {formatDate(doc.createdAt)}
                  </span>
                  <span style={{
                    backgroundColor: s.bg,
                    color: s.color,
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    display: "inline-block",
                  }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Box>
  );
}