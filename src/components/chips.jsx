import React from "react";
import { Chip } from "@mui/material";

export function StatusChip({ status }) {
  const color = status === "ACTIVE" ? "success" : status === "DISABLED" ? "default" : "warning";
  return (
    <Chip
      size="small"
      label={status}
      color={color}
      variant={status === "DISABLED" ? "outlined" : "filled"}
      sx={{ fontWeight: 700 }}
    />
  );
}

export function RiskChip({ risk }) {
  const color = risk === "HIGH" ? "error" : risk === "MED" ? "warning" : "success";
  return <Chip size="small" label={risk} color={color} variant="outlined" sx={{ fontWeight: 700 }} />;
}
