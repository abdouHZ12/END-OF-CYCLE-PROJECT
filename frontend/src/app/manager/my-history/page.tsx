"use client";
import Box from "@mui/material/Box";

export default function Page() {
  return (
    <Box sx={{ flexGrow: 1, mt: "70px", backgroundColor: "rgb(10, 22, 40)", padding: "20px" }}>
      <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "#fff" }}>
        My Requests
      </h1>
    </Box>
  );
}