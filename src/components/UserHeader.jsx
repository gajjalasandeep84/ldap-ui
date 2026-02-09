import React from "react";
import { Box, Divider, Paper, Typography } from "@mui/material";
import { StatusChip } from "./chips";

export function UserHeader({ user, formatDate }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>{user.displayName}</Typography>
          <StatusChip status={user.status} />
          <Typography variant="body2" color="text.secondary">
            {user.userId} • {user.email}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Last logon: {formatDate(user.lastLogon)} • pwdLastSet: {formatDate(user.pwdLastSet)}
        </Typography>
      </Box>

      <Divider />
    </Paper>
  );
}
