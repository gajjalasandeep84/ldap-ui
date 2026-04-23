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
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";

import { searchUsers, permissionsToCsv, getPermissions } from "./api/userAccessApi";
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

  // full list loaded once from backend
  const [allUsers, setAllUsers] = useState([]);

  const [selectedId, setSelectedId] = useState("");
  const [tab, setTab] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [permLoading, setPermLoading] = useState(false);
  const [permError, setPermError] = useState("");
  const [permissionsData, setPermissionsData] = useState(null);

  const [env, setEnv] = useState("test"); // Environment: test, prod, default

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerGroup, setDrawerGroup] = useState({
    group: "",
    permissions: [],
  });

  const [groupFilter, setGroupFilter] = useState("");
  const [permFilter, setPermFilter] = useState("");

  // Load all users once on page load, and reload only when environment changes
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        // Expectation: backend returns the full list when query is empty
        const results = await searchUsers({
          query: "",
          signal: controller.signal,
          env,
        });

        setAllUsers(results);
        setSelectedId((prev) =>
          results.some((u) => u.userId === prev)
            ? prev
            : (results[0]?.userId ?? ""),
        );
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError("Failed to load users.", e);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [env]);

  // Fetch permissions when user is selected
  useEffect(() => {
    if (!selectedId) {
      setPermissionsData(null);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setPermLoading(true);
        setPermError("");

        const data = await getPermissions({
          userId: selectedId,
          env,
          roles: user?.adGroups?.map((g) => g.name) || [],
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setPermissionsData(data);
        }
      } catch (e) {
        if (e?.name === "AbortError") return;
        console.warn("Failed to load permissions, using mock data:", e);
        setPermError(e.message);
        // Note: Keep using mock data if API call fails
      } finally {
        if (!controller.signal.aborted) {
          setPermLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [selectedId, env, user?.adGroups]);

  // Client-side search only
  const users = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return allUsers;

    return allUsers.filter((u) => {
      return (
        u.displayName?.toLowerCase().includes(q) ||
        u.userId?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [allUsers, query]);

  // Keep selected user valid against filtered list
  const user = useMemo(() => {
    if (!users.length) return null;
    return users.find((u) => u.userId === selectedId) || users[0];
  }, [users, selectedId]);

  // Optional: if current selected user disappears from filtered results, select first visible one
  useEffect(() => {
    if (!users.length) {
      setSelectedId("");
      return;
    }

    if (!users.some((u) => u.userId === selectedId)) {
      setSelectedId(users[0].userId);
    }
  }, [users, selectedId]);

  const filteredGroups = useMemo(() => {
    if (!user) return [];
    const q = groupFilter.trim().toLowerCase();
    if (!q) return user.adGroups;
    return user.adGroups.filter(
      (g) => g.name.toLowerCase().includes(q) || g.dn.toLowerCase().includes(q),
    );
  }, [user, groupFilter]);

  const filteredPerms = useMemo(() => {
    if (!user) return [];
    
    // Use API permissions if available, otherwise fall back to mock
    const permissions = permissionsData?.items || user.permissions;
    
    const q = permFilter.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter(
      (p) =>{
        const code = (p.code || p.name || "").toLowerCase();
        const label = (p.label || p.name || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const grantedVia = (p.grantedVia || []).map(g => g.toLowerCase()).join(" ");
        
        return (
          code.includes(q) ||
          label.includes(q) ||
          category.includes(q) ||
          grantedVia.includes(q)
        );
      }
    );
  }, [user, permFilter, permissionsData]);

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
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, whiteSpace: "nowrap" }}
          >
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

          <FormControl
            size="small"
            sx={{ minWidth: 100, bgcolor: "white", borderRadius: 1 }}
          >
            <Select
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              displayEmpty
            >
              <MenuItem value="test">Test</MenuItem>
              <MenuItem value="prod">Production</MenuItem>
              <MenuItem value="default">Default</MenuItem>
            </Select>
          </FormControl>

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

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          bgcolor: "background.default",
        }}
      >
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
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  No user selected
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {query
                    ? "No users matched your search."
                    : "No users available."}
                </Typography>
              </Paper>
            ) : (
              <>
                <UserHeader user={user} formatDate={formatDate} />
                <Paper
                  variant="outlined"
                  sx={{ borderRadius: 2, overflow: "hidden", mt: 2 }}
                >
                  <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{ px: 2 }}
                  >
                    <Tab label="Overview" />
                    <Tab label={`AD Groups (${user.adGroups.length})`} />
                    <Tab label={`Permissions (${permissionsData?.items?.length ?? user.permissions.length})`} />
                    <Tab label="Mapping (Debug)" />
                  </Tabs>
                  <Divider />

                  {tab === 0 && (
                    <Box
                      sx={{
                        p: 2,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                      }}
                    >
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ fontWeight: 800 }}
                        >
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
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ fontWeight: 800 }}
                        >
                          Access Summary
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <KV
                            k="AD Groups (memberOf)"
                            v={String(user.adGroups.length)}
                          />
                          <KV
                            k="Effective permissions"
                            v={String(permissionsData?.count ?? user.permissions.length)}
                          />
                          <KV
                            k="High risk permissions"
                            v={String(
                              (permissionsData?.items || user.permissions).filter((p) => p.riskLevel === "HIGH" || p.risk === "HIGH")
                                .length,
                            )}
                          />
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
