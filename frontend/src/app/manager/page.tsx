"use client";
import Box from "@mui/material/Box";

export default function ManagerPage() {
  return (
    <Box sx={{ flexGrow: 1, mt: "70px", backgroundColor: "rgb(10, 22, 40)", padding: "20px" }}>
      <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "#fff" }}>
        Espace Manager
      </h1>
      <p style={{ fontSize: "20px", color: "gray", fontWeight: "bold" }}>
        Bienvenue dans votre tableau de bord
      </p>
    </Box>
  );
}