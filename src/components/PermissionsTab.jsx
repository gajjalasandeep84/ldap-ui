import React from "react";
import { Box, Chip, Divider, Paper, TextField, Typography } from "@mui/material";
import { RiskChip } from "./chips";

export function PermissionsTab({ user, permFilter, setPermFilter, filteredPerms, openGroupDrawer }) {
  return (
    <Box sx={{ p: 2 }}>
      <TextField
        value={permFilter}
        onChange={(e) => setPermFilter(e.target.value)}
        placeholder="Filter permissions (code/label/category/group)"
        size="small"
        fullWidth
      />

      <Paper variant="outlined" sx={{ borderRadius: 2, mt: 2, overflow: "hidden" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 120px 1fr", gap: 1, p: 1.5, bgcolor: "background.default"}}>
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Permission</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Category</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Risk</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Granted via</Typography>
        </Box>
        <Divider />

        {filteredPerms.map((p, idx) => (
          <Box key={p.code || p.name}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 120px 1fr", gap: 1, p: 1.5, alignItems: "center" }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 950 }}>{p.code || p.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{p.label || p.name}</Typography>
              </Box>

              <Typography variant="body2">{p.category || "System"}</Typography>
              <RiskChip risk={p.risk || p.riskLevel} />

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {(p.grantedVia && p.grantedVia.length > 0) ? (
                  p.grantedVia.map((g) => (
                    <Chip key={g} size="small" label={g} variant="outlined" onClick={() => openGroupDrawer(g)} />
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">From roles</Typography>
                )}
              </Box>
            </Box>
            {idx !== filteredPerms.length - 1 && <Divider />}
          </Box>
        ))}

        {filteredPerms.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography color="text.secondary">No permissions match that filter.</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
