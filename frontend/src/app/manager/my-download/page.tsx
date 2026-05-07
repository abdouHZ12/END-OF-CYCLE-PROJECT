"use client";
import Box from "@mui/material/Box";

export default function Page() {
  return (
    <Box sx={{ flexGrow: 1, mt: "70px", backgroundColor: "var(--naftal-bg)", padding: "20px" }}>
      <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "var(--naftal-text-primary)" }}>
        My downloads
      </h1>
    </Box>
  );
}