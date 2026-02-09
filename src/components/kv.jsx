import React from "react";
import { Box, Typography } from "@mui/material";

export function KV({ k, v }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.6 }}>
      <Typography variant="body2" color="text.secondary">{k}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{v}</Typography>
    </Box>
  );
}
