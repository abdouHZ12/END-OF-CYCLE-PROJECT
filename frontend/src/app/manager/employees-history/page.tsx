"use client";
import Box from "@mui/material/Box";

export default function EmployeesHistoryPage() {
  return (
    <Box sx={{ flexGrow: 1, mt: "70px", backgroundColor: "rgb(10, 22, 40)", padding: "20px" }}>
      <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "#fff" }}>
        Historique des employés
      </h1>
      <p style={{ fontSize: "20px", color: "gray", fontWeight: "bold" }}>
        Consulter historique de vos employés
      </p>
    </Box>
  );
}