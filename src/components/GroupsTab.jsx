import React from "react";
import { Box, Button, Chip, Divider, Paper, TextField, Typography } from "@mui/material";

export function GroupsTab({ user, groupFilter, setGroupFilter, filteredGroups, openGroupDrawer }) {
  return (
    <Box sx={{ p: 2 }}>
      <TextField
        value={groupFilter}
        onChange={(e) => setGroupFilter(e.target.value)}
        placeholder="Filter groups (name or DN)"
        size="small"
        fullWidth
      />

      <Paper variant="outlined" sx={{ borderRadius: 2, mt: 2, overflow: "hidden" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 160px 140px", gap: 1, p: 1.5, bgcolor: "#fafafa" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Group</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Membership</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Actions</Typography>
        </Box>
        <Divider />

        {filteredGroups.map((g, idx) => (
          <Box key={g.dn}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 160px 140px", gap: 1, p: 1.5, alignItems: "center" }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 900 }}>{g.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", wordBreak: "break-word" }}>
                  {g.dn}
                </Typography>
              </Box>

              <Chip size="small" label={g.membership} variant="outlined" />

              <Button size="small" variant="outlined" onClick={() => openGroupDrawer(g.name)}>
                View perms
              </Button>
            </Box>
            {idx !== filteredGroups.length - 1 && <Divider />}
          </Box>
        ))}

        {filteredGroups.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography color="text.secondary">No groups match that filter.</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
