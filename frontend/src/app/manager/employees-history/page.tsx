"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { apiPost } from "@/lib/api";

type Employee = {
  id: number;
  name: string;
  username: string;
  issuedDocuments: Document[];
};

type Document = {
  id: number;
  status: string;
  type: string;
  createdAt: string;
  exitSlip?: { exitTime: string; returnTime: string; gate: string };
  absenceAuth?: { startDate: string; endDate: string; reason: string };
  missionOrder?: { destination: string; duration: number; purpose: string };
};

const typeLabel: Record<string, string> = {
  EXIT_SLIP: "Bon de sortie",
  ABSENCE_AUTH: "Autorisation d'absence",
  MISSION_ORDER: "Ordre de mission",
};

const statusStyle: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:  { color: "#ffa500", bg: "rgba(255,165,0,0.15)",   label: "EN ATTENTE" },
  APPROVED: { color: "#16a34a", bg: "rgba(22,163,74,0.15)",   label: "APPROUVÉ" },
  REJECTED: { color: "#ef4444", bg: "rgba(239,68,68,0.15)",   label: "REFUSÉ" },
};

export default function EmployeesHistoryPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading]     = React.useState(true);
  const [error, setError]         = React.useState<string | null>(null);
  const [expanded, setExpanded]   = React.useState<number | null>(null);

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
        const data = await apiPost<Employee[]>("/api/manager/employees-history", {
          ManagerId: managerId,
        });
        setEmployees(data);
      } catch {
        setError("Impossible de charger l'historique.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-DZ", {
      day: "2-digit", month: "short", year: "numeric",
    });

  return (
    <Box sx={{ flexGrow: 1, mt: "70px", backgroundColor: "rgb(10, 22, 40)", padding: "20px", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "#fff" }}>
        Historique des employés
      </h1>
      <p style={{ fontSize: "16px", color: "gray", marginBottom: "24px" }}>
        Consulter historique des demandes de vos employés
      </p>

      {loading && <p style={{ color: "lightgray" }}>Chargement...</p>}

      {error && (
        <div style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {!loading && employees.length === 0 && (
        <div style={{ color: "lightgray", textAlign: "center", marginTop: "60px", fontSize: "18px" }}>
          Aucun employé trouvé
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {employees.map((emp) => (
          <div key={emp.id} style={{ backgroundColor: "#20314E", borderRadius: "12px", overflow: "hidden" }}>

            {/* Employee header — click to expand */}
            <div
              onClick={() => setExpanded(expanded === emp.id ? null : emp.id)}
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <div>
                <p style={{ color: "#fff", fontWeight: "bold", fontSize: "17px", margin: 0 }}>
                  {emp.name}
                </p>
                <p style={{ color: "gray", fontSize: "13px", margin: "2px 0 0" }}>
                  @{emp.username} · {emp.issuedDocuments.length} demande(s)
                </p>
              </div>
              <span style={{ color: "#ffa500", fontSize: "20px" }}>
                {expanded === emp.id ? "▲" : "▼"}
              </span>
            </div>

            {/* Documents list — shown when expanded */}
            {expanded === emp.id && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {emp.issuedDocuments.length === 0 && (
                  <p style={{ color: "gray", fontSize: "14px" }}>Aucune demande</p>
                )}
                {emp.issuedDocuments.map((doc) => {
                  const s = statusStyle[doc.status] ?? statusStyle.PENDING;
                  return (
                    <div key={doc.id} style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ color: "#ffa500", fontWeight: "bold", fontSize: "13px" }}>
                          {typeLabel[doc.type] ?? doc.type}
                        </span>
                        <span style={{ backgroundColor: s.bg, color: s.color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" }}>
                          {s.label}
                        </span>
                      </div>

                      <p style={{ color: "gray", fontSize: "12px", margin: "0 0 6px" }}>
                        Soumis le {formatDate(doc.createdAt)}
                      </p>

                      {doc.exitSlip && (
                        <p style={{ color: "lightgray", fontSize: "13px", margin: 0 }}>
                          🚪 Sortie: {formatDate(doc.exitSlip.exitTime)} — Retour: {formatDate(doc.exitSlip.returnTime)} — Porte: {doc.exitSlip.gate}
                        </p>
                      )}
                      {doc.absenceAuth && (
                        <p style={{ color: "lightgray", fontSize: "13px", margin: 0 }}>
                          📅 Du {formatDate(doc.absenceAuth.startDate)} au {formatDate(doc.absenceAuth.endDate)} — {doc.absenceAuth.reason}
                        </p>
                      )}
                      {doc.missionOrder && (
                        <p style={{ color: "lightgray", fontSize: "13px", margin: 0 }}>
                          ✈️ {doc.missionOrder.destination} — {doc.missionOrder.duration} jours — {doc.missionOrder.purpose}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </Box>
  );
}