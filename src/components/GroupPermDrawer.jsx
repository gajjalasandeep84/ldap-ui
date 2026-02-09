import React from "react";
import { Box, Chip, Divider, Drawer, Typography } from "@mui/material";

export function GroupPermDrawer({ open, onClose, drawerGroup }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 380, p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 950 }}>
          {drawerGroup.group}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Permissions granted by this AD group (DB mapping)
        </Typography>

        <Divider sx={{ my: 2 }} />

        {drawerGroup.permissions?.length ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {drawerGroup.permissions.map((code) => (
              <Chip key={code} label={code} size="small" variant="outlined" />
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">No permissions found for this group.</Typography>
        )}
      </Box>
    </Drawer>
  );
}
