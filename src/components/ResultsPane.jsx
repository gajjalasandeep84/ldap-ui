import React from "react";
import { Box, Divider, List, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { StatusChip } from "./chips";

export function ResultsPane({
  users,
  selectedId,
  onSelect,
  loading,
  error,
  query,
}) {
  return (
    <Paper square sx={{ width: 360, borderRight: "1px solid #e0e0e0", overflow: "auto" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Results ({users.length}) {loading ? "• Searching..." : ""}
        </Typography>

        {error && (
          <Typography variant="body2" sx={{ mt: 0.5, color: "crimson" }}>
            {error}
          </Typography>
        )}
      </Box>

      <Divider />

      {!loading && !error && users.length === 0 && query.trim() && (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">No users found</Typography>
        </Box>
      )}

      <List disablePadding>
        {users.map((u) => (
          <ListItemButton
            key={u.userId}
            selected={u.userId === selectedId}
            onClick={() => onSelect(u.userId)}
            sx={{ py: 1.25 }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 800, flex: 1 }}>
                    {u.displayName}
                  </Typography>
                  <StatusChip status={u.status} />
                </Box>
              }
              secondary={
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {u.userId} • {u.email}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
