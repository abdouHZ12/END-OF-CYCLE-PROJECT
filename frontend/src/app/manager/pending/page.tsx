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
  missionOrder?: { destination: string; duration: number; purpose: string; travelMethod: string };
};

export default function PendingPage() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<number | null>(null);

  // get current manager id from localStorage
  const getManagerId = () => {
    const raw = localStorage.getItem("naftal.employee");
    if (!raw) return null;
    return JSON.parse(raw).id;
  };

  const fetchPending = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const managerId = getManagerId();
      const data = await apiPost<Document[]>("/api/manager/pending-documents", {
        ManagerId: managerId,
      });
      setDocuments(data);
    } catch {
      setError("Impossible de charger les demandes.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleDecision = async (documentId: number, decision: "APPROVED" | "REJECTED") => {
    setActionLoading(documentId);
    try {
      const managerId = getManagerId();
      await apiPost(`/api/document/State/${documentId}`, {
        state: decision,
        ManagerId: managerId,
      });
      // remove from list after decision
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    } catch {
      setError("Erreur lors de la décision.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-DZ", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const typeLabel: Record<string, string> = {
    EXIT_SLIP: "Bon de sortie",
    ABSENCE_AUTH: "Autorisation d'absence",
    MISSION_ORDER: "Ordre de mission",
  };

  return (
    <Box sx={{ flexGrow: 1, mt: "70px", backgroundColor: "rgb(10, 22, 40)", padding: "20px", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "#fff" }}>
        Demandes en attente
      </h1>
      <p style={{ fontSize: "16px", color: "gray", marginBottom: "24px" }}>
        Approuver ou refuser les demandes de vos employés
      </p>

      {loading && (
        <p style={{ color: "lightgray" }}>Chargement...</p>
      )}

      {error && (
        <div style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {!loading && documents.length === 0 && (
        <div style={{ color: "lightgray", textAlign: "center", marginTop: "60px", fontSize: "18px" }}>
          ✅ Aucune demande en attente
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            style={{
              backgroundColor: "#20314E",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ color: "#ffa500", fontWeight: "bold", fontSize: "14px" }}>
                  {typeLabel[doc.type] ?? doc.type}
                </span>
                <p style={{ color: "#fff", fontWeight: "bold", fontSize: "18px", margin: "4px 0 0" }}>
                  {doc.employee.name}
                </p>
                <p style={{ color: "gray", fontSize: "13px" }}>
                  Soumis le {formatDate(doc.createdAt)}
                </p>
              </div>
              <span style={{
                backgroundColor: "rgba(255,165,0,0.15)",
                color: "#ffa500",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
              }}>
                EN ATTENTE
              </span>
            </div>

            {/* Details */}
            {doc.exitSlip && (
              <div style={{ color: "lightgray", fontSize: "14px" }}>
                🚪 Sortie: {formatDate(doc.exitSlip.exitTime)} — Retour: {formatDate(doc.exitSlip.returnTime)} — Porte: {doc.exitSlip.gate}
              </div>
            )}
            {doc.absenceAuth && (
              <div style={{ color: "lightgray", fontSize: "14px" }}>
                📅 Du {formatDate(doc.absenceAuth.startDate)} au {formatDate(doc.absenceAuth.endDate)} — {doc.absenceAuth.reason}
              </div>
            )}
            {doc.missionOrder && (
              <div style={{ color: "lightgray", fontSize: "14px" }}>
                ✈️ Destination: {doc.missionOrder.destination} — {doc.missionOrder.duration} jours — {doc.missionOrder.purpose}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={() => handleDecision(doc.id, "APPROVED")}
                disabled={actionLoading === doc.id}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  opacity: actionLoading === doc.id ? 0.6 : 1,
                }}
              >
                {actionLoading === doc.id ? "..." : "✓ Approuver"}
              </button>
              <button
                onClick={() => handleDecision(doc.id, "REJECTED")}
                disabled={actionLoading === doc.id}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "transparent",
                  color: "#ef4444",
                  border: "1px solid #ef4444",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  opacity: actionLoading === doc.id ? 0.6 : 1,
                }}
              >
                {actionLoading === doc.id ? "..." : "✗ Refuser"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
}