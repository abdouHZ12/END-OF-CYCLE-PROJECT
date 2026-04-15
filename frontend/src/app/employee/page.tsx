"use client";

import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";

export default function Page() {




  return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          marginTop: "70px",
        }}
      > 
      <p>Hello from main page</p>
      </Box>
  );
}
