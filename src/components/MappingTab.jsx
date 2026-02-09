import React from "react";
import { Box, Chip, Divider, Paper, Typography } from "@mui/material";

export function MappingTab({ user }) {
  return (
    <Box sx={{ p: 2 }}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 900 }}>
          Group → Permissions mapping (from DB)
        </Typography>
        <Divider sx={{ my: 2 }} />

        {user.groupToPermissions.map((m) => (
          <Box key={m.group} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 950 }}>{m.group}</Typography>
            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {m.permissions.map((code) => (
                <Chip key={code} size="small" label={code} variant="outlined" />
              ))}
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
