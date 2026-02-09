// src/UserAccessViewer.jsx
import React, { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";

const MOCK = {
  users: [
    {
      userId: "sandeep.g",
      displayName: "Sandeep Gajjala",
      email: "sandeep@example.com",
      status: "ACTIVE",
      lastLogon: "2026-01-15T14:21:00Z",
      pwdLastSet: "2025-12-01T09:00:00Z",
      adGroups: [
        {
          name: "BO_APPEALS_READ",
          membership: "DIRECT",
          dn: "CN=BO_APPEALS_READ,OU=HX,DC=example,DC=com",
        },
        {
          name: "BO_DOCS_VIEW",
          membership: "DIRECT",
          dn: "CN=BO_DOCS_VIEW,OU=HX,DC=example,DC=com",
        },
        {
          name: "BO_ADMIN_SUPPORT",
          membership: "NESTED",
          dn: "CN=BO_ADMIN_SUPPORT,OU=HX,DC=example,DC=com",
        },
      ],
      permissions: [
        {
          code: "APPEALS_VIEW",
          label: "View Appeals",
          category: "Appeals",
          risk: "LOW",
          grantedVia: ["BO_APPEALS_READ"],
        },
        {
          code: "APPEALS_SEARCH",
          label: "Search Appeals",
          category: "Appeals",
          risk: "LOW",
          grantedVia: ["BO_APPEALS_READ"],
        },
        {
          code: "DOCS_VIEW",
          label: "View Documents",
          category: "Documents",
          risk: "MED",
          grantedVia: ["BO_DOCS_VIEW"],
        },
        {
          code: "ADMIN_IMPERSONATE",
          label: "Impersonate User",
          category: "Admin",
          risk: "HIGH",
          grantedVia: ["BO_ADMIN_SUPPORT"],
        },
      ],
      groupToPermissions: [
        { group: "BO_APPEALS_READ", permissions: ["APPEALS_VIEW", "APPEALS_SEARCH"] },
        { group: "BO_DOCS_VIEW", permissions: ["DOCS_VIEW"] },
        { group: "BO_ADMIN_SUPPORT", permissions: ["ADMIN_IMPERSONATE"] },
      ],
    },
    {
      userId: "saritha.g",
      displayName: "Saritha Gajjala",
      email: "saritha@example.com",
      status: "ACTIVE",
      lastLogon: "2026-01-12T10:05:00Z",
      pwdLastSet: "2025-11-20T09:00:00Z",
      adGroups: [
        {
          name: "BO_APPEALS_READ",
          membership: "DIRECT",
          dn: "CN=BO_APPEALS_READ,OU=HX,DC=example,DC=com",
        },
      ],
      permissions: [
        {
          code: "APPEALS_VIEW",
          label: "View Appeals",
          category: "Appeals",
          risk: "LOW",
          grantedVia: ["BO_APPEALS_READ"],
        },
      ],
      groupToPermissions: [{ group: "BO_APPEALS_READ", permissions: ["APPEALS_VIEW"] }],
    },
  ],
};

function StatusChip({ status }) {
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

function RiskChip({ risk }) {
  const color = risk === "HIGH" ? "error" : risk === "MED" ? "warning" : "success";
  return <Chip size="small" label={risk} color={color} variant="outlined" sx={{ fontWeight: 700 }} />;
}

function KV({ k, v }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.6 }}>
      <Typography variant="body2" color="text.secondary">
        {k}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {v}
      </Typography>
    </Box>
  );
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function escapeCsv(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export default function UserAccessViewer() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(MOCK.users[0].userId);
  const [tab, setTab] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerGroup, setDrawerGroup] = useState({ group: "", permissions: [] });

  const [groupFilter, setGroupFilter] = useState("");
  const [permFilter, setPermFilter] = useState("");

  const users = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK.users;
    return MOCK.users.filter(
      (u) =>
        u.userId.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [query]);

  const user = useMemo(() => {
    return users.find((u) => u.userId === selectedId) || users[0] || MOCK.users[0];
  }, [users, selectedId]);

  const filteredGroups = useMemo(() => {
    const q = groupFilter.trim().toLowerCase();
    if (!q) return user.adGroups;
    return user.adGroups.filter((g) => g.name.toLowerCase().includes(q) || g.dn.toLowerCase().includes(q));
  }, [user, groupFilter]);

  const filteredPerms = useMemo(() => {
    const q = permFilter.trim().toLowerCase();
    if (!q) return user.permissions;
    return user.permissions.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.label.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.grantedVia.some((g) => g.toLowerCase().includes(q))
    );
  }, [user, permFilter]);

  function openGroupDrawer(groupName) {
    const mapping = user.groupToPermissions.find((m) => m.group === groupName);
    setDrawerGroup(mapping || { group: groupName, permissions: [] });
    setDrawerOpen(true);
  }

  function exportCsv() {
    const rows = [
      ["code", "label", "category", "risk", "grantedVia"].join(","),
      ...user.permissions.map((p) =>
        [p.code, p.label, p.category, p.risk, p.grantedVia.join("|")].map(escapeCsv).join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user.userId}_permissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, whiteSpace: "nowrap" }}>
            User Access Viewer
          </Typography>

          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search login / email / name"
            size="small"
            sx={{
              bgcolor: "white",
              borderRadius: 1,
              flex: 1,
              maxWidth: 760,
              minWidth: 320,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={exportCsv}
            sx={{ whiteSpace: "nowrap" }}
          >
            Export CSV
          </Button>
        </Toolbar>
      </AppBar>

      {/* Body */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          bgcolor: "#f5f7fb",
        }}
      >
        {/* Left: results */}
        <Paper
          square
          sx={{
            width: 360,
            borderRight: "1px solid #e0e0e0",
            overflow: "auto",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Results ({users.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Click a user to view groups and permissions
            </Typography>
          </Box>
          <Divider />

          <List disablePadding>
            {users.map((u) => (
              <ListItemButton
                key={u.userId}
                selected={u.userId === user.userId}
                onClick={() => {
                  setSelectedId(u.userId);
                  setTab(0);
                  setGroupFilter("");
                  setPermFilter("");
                }}
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

        {/* Right: details */}
        <Box sx={{ flex: 1, minWidth: 0, overflow: "auto" }}>
          <Box sx={{ p: 2 }}>
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
              {/* Header */}
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {user.displayName}
                  </Typography>
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

              {/* Tabs */}
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
                <Tab label="Overview" />
                <Tab label={`AD Groups (${user.adGroups.length})`} />
                <Tab label={`Permissions (${user.permissions.length})`} />
                <Tab label="Mapping (Debug)" />
              </Tabs>

              <Divider />

              {/* Content */}
              {tab === 0 && (
                <Box sx={{ p: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800 }}>
                      Identity
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <KV k="Display Name" v={user.displayName} />
                      <KV k="Login" v={user.userId} />
                      <KV k="Email" v={user.email} />
                      <KV k="Status" v={user.status} />
                    </Box>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800 }}>
                      Access Summary
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <KV k="AD Groups (memberOf)" v={String(user.adGroups.length)} />
                      <KV k="Effective permissions" v={String(user.permissions.length)} />
                      <KV k="High risk permissions" v={String(user.permissions.filter((p) => p.risk === "HIGH").length)} />
                    </Box>
                  </Paper>
                </Box>
              )}

              {tab === 1 && (
                <Box sx={{ p: 2 }}>
                  <TextField
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    placeholder="Filter groups (name or DN)"
                    size="small"
                    fullWidth
                  />

                  <Paper variant="outlined" sx={{ borderRadius: 2, mt: 2, overflow: "hidden" }}>
                    {/* Header row */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 160px 140px",
                        gap: 1,
                        p: 1.5,
                        bgcolor: "#fafafa",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        Group
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        Membership
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        Actions
                      </Typography>
                    </Box>
                    <Divider />

                    {filteredGroups.map((g, idx) => (
                      <Box key={g.dn}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 160px 140px",
                            gap: 1,
                            p: 1.5,
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 900 }}>
                              {g.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", wordBreak: "break-word" }}
                            >
                              {g.dn}
                            </Typography>
                          </Box>

                          <Box>
                            <Chip size="small" label={g.membership} variant="outlined" />
                          </Box>

                          <Box>
                            <Button size="small" variant="outlined" onClick={() => openGroupDrawer(g.name)}>
                              View perms
                            </Button>
                          </Box>
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
              )}

              {tab === 2 && (
                <Box sx={{ p: 2 }}>
                  <TextField
                    value={permFilter}
                    onChange={(e) => setPermFilter(e.target.value)}
                    placeholder="Filter permissions (code/label/category/group)"
                    size="small"
                    fullWidth
                  />

                  <Paper variant="outlined" sx={{ borderRadius: 2, mt: 2, overflow: "hidden" }}>
                    {/* Header row */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 0.8fr 120px 1fr",
                        gap: 1,
                        p: 1.5,
                        bgcolor: "#fafafa",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        Permission
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        Category
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        Risk
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        Granted via
                      </Typography>
                    </Box>
                    <Divider />

                    {filteredPerms.map((p, idx) => (
                      <Box key={p.code}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1.2fr 0.8fr 120px 1fr",
                            gap: 1,
                            p: 1.5,
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 950 }}>
                              {p.code}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              {p.label}
                            </Typography>
                          </Box>

                          <Typography variant="body2">{p.category}</Typography>

                          <RiskChip risk={p.risk} />

                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                            {p.grantedVia.map((g) => (
                              <Chip
                                key={g}
                                size="small"
                                label={g}
                                variant="outlined"
                                onClick={() => openGroupDrawer(g)}
                              />
                            ))}
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
              )}

              {tab === 3 && (
                <Box sx={{ p: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 900 }}>
                      Group → Permissions mapping (from DB)
                    </Typography>
                    <Divider sx={{ my: 2 }} />

                    {user.groupToPermissions.map((m) => (
                      <Box key={m.group} sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 950 }}>
                          {m.group}
                        </Typography>
                        <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                          {m.permissions.map((code) => (
                            <Chip key={code} size="small" label={code} variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Right drawer: group permissions */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
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
    </Box>
  );
}
