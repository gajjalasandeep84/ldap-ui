import React, { useMemo, useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Button,
  Divider,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";

import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { searchUsers, permissionsToCsv } from "./api/userAccessApi";
import { KV } from "./components/kv";
import { ResultsPane } from "./components/ResultsPane";
import { UserHeader } from "./components/UserHeader";
import { GroupsTab } from "./components/GroupsTab";
import { PermissionsTab } from "./components/PermissionsTab";
import { MappingTab } from "./components/MappingTab";
import { GroupPermDrawer } from "./components/GroupPermDrawer";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function UserAccessViewer() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [tab, setTab] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerGroup, setDrawerGroup] = useState({ group: "", permissions: [] });

  const [groupFilter, setGroupFilter] = useState("");
  const [permFilter, setPermFilter] = useState("");

  // Day 8: debounced search + cancellation
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        const results = await searchUsers({ query: debouncedQuery, signal: controller.signal });

        setUsers(results);
        setSelectedId((prev) => (results.some((u) => u.userId === prev) ? prev : results[0]?.userId ?? ""));
      } catch (e) {
        if (e?.name !== "AbortError") setError("Search failed. Try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debouncedQuery]);

  const user = useMemo(() => {
    return users.find((u) => u.userId === selectedId) || users[0];
  }, [users, selectedId]);

  const filteredGroups = useMemo(() => {
    if (!user) return [];
    const q = groupFilter.trim().toLowerCase();
    if (!q) return user.adGroups;
    return user.adGroups.filter((g) => g.name.toLowerCase().includes(q) || g.dn.toLowerCase().includes(q));
  }, [user, groupFilter]);

  const filteredPerms = useMemo(() => {
    if (!user) return [];
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
    if (!user) return;
    const mapping = user.groupToPermissions.find((m) => m.group === groupName);
    setDrawerGroup(mapping || { group: groupName, permissions: [] });
    setDrawerOpen(true);
  }

  function exportCsv() {
    if (!user) return;
    const csv = permissionsToCsv(user);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user.userId}_permissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
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
            sx={{ bgcolor: "white", borderRadius: 1, flex: 1, maxWidth: 760, minWidth: 320 }}
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
            disabled={!user}
          >
            Export CSV
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, minHeight: 0, display: "flex", bgcolor: "background.default"}}>
        <ResultsPane
          users={users}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setTab(0);
            setGroupFilter("");
            setPermFilter("");
          }}
          loading={loading}
          error={error}
          query={query}
        />

        <Box sx={{ flex: 1, minWidth: 0, overflow: "auto" }}>
          <Box sx={{ p: 2 }}>
            {!user ? (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>No user selected</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Type a query to load users.
                </Typography>
              </Paper>
            ) : (
              <>
                <UserHeader user={user} formatDate={formatDate} />
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mt: 2 }}>
                  <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
                    <Tab label="Overview" />
                    <Tab label={`AD Groups (${user.adGroups.length})`} />
                    <Tab label={`Permissions (${user.permissions.length})`} />
                    <Tab label="Mapping (Debug)" />
                  </Tabs>
                  <Divider />

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
                    <GroupsTab
                      user={user}
                      groupFilter={groupFilter}
                      setGroupFilter={setGroupFilter}
                      filteredGroups={filteredGroups}
                      openGroupDrawer={openGroupDrawer}
                    />
                  )}

                  {tab === 2 && (
                    <PermissionsTab
                      user={user}
                      permFilter={permFilter}
                      setPermFilter={setPermFilter}
                      filteredPerms={filteredPerms}
                      openGroupDrawer={openGroupDrawer}
                    />
                  )}

                  {tab === 3 && <MappingTab user={user} />}
                </Paper>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <GroupPermDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        drawerGroup={drawerGroup}
      />
    </Box>
  );
}
