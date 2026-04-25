# LDAP UI - Complete Technical Documentation

**Last Updated:** April 24, 2026  
**Purpose:** In-depth reference for React component architecture, state management, hooks, and data flow in the LDAP UI application.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Structure](#component-structure)
3. [State Management](#state-management)
4. [Hooks & Effects](#hooks--effects)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Component Specifications](#component-specifications)
7. [API Integration](#api-integration)
8. [Styling & Theme](#styling--theme)
9. [Performance Optimization](#performance-optimization)
10. [Debugging & Common Issues](#debugging--common-issues)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     LDAP UI Application                         │
│                    React 19 + Material-UI                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         index.html / main.jsx                          │    │
│  │         Vite application entry point                   │    │
│  └──────────────────────┬─────────────────────────────────┘    │
│                         │                                       │
│  ┌──────────────────────▼─────────────────────────────────┐    │
│  │         App.jsx                                        │    │
│  │         Routes, navigation, global styling             │    │
│  └──────────────────────┬─────────────────────────────────┘    │
│                         │                                       │
│  ┌──────────────────────▼─────────────────────────────────┐    │
│  │    UserAccessViewer.jsx (Main Container)              │    │
│  │  - Global state management                            │    │
│  │  - User loading & search                              │    │
│  │  - Permission fetching                                │    │
│  │  - Tab coordination                                   │    │
│  └──────────────────────┬─────────────────────────────────┘    │
│         ┌───────────────┼──────────────┬────────────────┐      │
│         │               │              │                │      │
│    ┌────▼────┐    ┌─────▼──────┐ ┌───▼────────┐   ┌───▼───┐   │
│    │ Overview │    │  GroupsTab │ │Permissions│   │Mapping│   │
│    │  Tab     │    │    Tab     │ │    Tab     │   │ Tab   │   │
│    └────┬────┘    └─────┬──────┘ └───┬────────┘   └───┬───┘   │
│         │               │            │                │       │
│    ┌────▼─────────────────────────────────────────────┴────┐  │
│    │             Shared Sub-Components                      │  │
│    │  - UserHeader: Selected user display                  │  │
│    │  - ResultsPane: User search results                   │  │
│    │  - GroupPermDrawer: Permission details modal          │  │
│    │  - Chips, KV: UI elements                            │  │
│    └─────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │   API Integration Layer (src/api/userAccessApi.js)    │  │
│  │  - searchUsers()                                       │  │
│  │  - getPermissions()                                    │  │
│  │  - permissionsToCsv()                                 │  │
│  │  - transformPermissionsResponse()                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                         │                                     │
│  ┌──────────────────────▼──────────────────────────────┐    │
│  │        Vite Proxy Routes                           │    │
│  │  /ad → http://localhost:8080                       │    │
│  │  /api → http://localhost:8081                      │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         │                                     │
│         ┌───────────────┴────────────────┐                   │
│         │                                │                   │
│    ┌────▼──────────────┐     ┌──────────▼───────┐          │
│    │ AD Users Service  │     │ Permission       │          │
│    │ :8080             │     │ Service :8081    │          │
│    └───────────────────┘     └──────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Structure

### Directory Layout

```
ldap-ui/
├── src/
│   ├── main.jsx                          # Entry point
│   ├── App.jsx                           # Root component
│   ├── App.css                           # Global styles
│   ├── index.css                         # Global CSS
│   ├── UserAccessViewer.jsx              # Main container (460 lines)
│   │
│   ├── api/
│   │   ├── userAccessApi.js              # API client functions (299 lines)
│   │   └── mockData.js                   # Fallback mock data
│   │
│   ├── components/
│   │   ├── UserHeader.jsx                # User info display
│   │   ├── ResultsPane.jsx               # Search results list
│   │   ├── GroupsTab.jsx                 # AD groups tab
│   │   ├── PermissionsTab.jsx            # Permissions tab
│   │   ├── MappingTab.jsx                # Mapping/debug tab
│   │   ├── GroupPermDrawer.jsx           # Permission details modal
│   │   ├── chips.jsx                     # Chip UI component
│   │   ├── kv.jsx                        # Key-value display
│   │
│   ├── hooks/
│   │   └── useDebouncedValue.js          # Search debounce hook
│   │
│   ├── theme/
│   │   └── nsyohTheme.js                 # Material-UI theme config
│   │
│   ├── assets/                           # Static images, fonts
│
├── public/                               # Static files (favicon, etc.)
│
├── index.html                            # HTML entry point
├── vite.config.js                        # Vite configuration
├── package.json                          # Dependencies
└── eslint.config.js                      # Linting rules
```

---

## State Management

### UserAccessViewer.jsx - Central State Hub

The main component manages all application state:

```javascript
// 1. QUERY & SEARCH STATE
const [query, setQuery] = useState("");                    // Search box input
const [allUsers, setAllUsers] = useState([]);              // Full user list from backend

// 2. SELECTION STATE
const [selectedId, setSelectedId] = useState("");          // Currently selected user ID
const [tab, setTab] = useState(0);                         // Active tab (0-3)

// 3. LOADING & ERROR STATE
const [loading, setLoading] = useState(false);             // Users fetch loading
const [error, setError] = useState("");                    // Users fetch error
const [permLoading, setPermLoading] = useState(false);     // Permissions fetch loading
const [permError, setPermError] = useState("");            // Permissions fetch error

// 4. PERMISSIONS STATE
const [permissionsData, setPermissionsData] = useState(null); // Fetched permissions response

// 5. ENVIRONMENT STATE
const [env, setEnv] = useState("test");                    // test, prod, default

// 6. FILTER STATE
const [groupFilter, setGroupFilter] = useState("");        // AD groups filter
const [permFilter, setPermFilter] = useState("");          // Permissions filter

// 7. DRAWER STATE (Modal for permission details)
const [drawerOpen, setDrawerOpen] = useState(false);       // Modal open/closed
const [drawerGroup, setDrawerGroup] = useState({           // Modal data
  group: "",
  permissions: []
});
```

### State Type Mapping

| State Variable | Type | Purpose | Scope |
|---|---|---|---|
| `query` | string | Search box text | UI input |
| `allUsers` | Array<AdUser> | Full user list from AD | Backend response |
| `selectedId` | string | Currently selected user | Selection |
| `tab` | number | Active tab (0-3) | Navigation |
| `loading` | boolean | User fetch in progress | UX indicator |
| `error` | string | User fetch error message | UX error display |
| `permLoading` | boolean | Permission fetch in progress | UX indicator |
| `permError` | string | Permission fetch error | UX error display |
| `permissionsData` | Object / null | Permission API response | Permissions tab data |
| `env` | string | Environment selector | Backend routing |
| `groupFilter` | string | AD groups filter text | Filter UI |
| `permFilter` | string | Permissions filter text | Filter UI |
| `drawerOpen` | boolean | Permission drawer visible | Modal state |
| `drawerGroup` | Object | Permission details for modal | Modal data |

---

## Hooks & Effects

### 1. Environment Change Effect

```javascript
useEffect(() => {
  // Triggered when: env changes (test → prod)
  
  const controller = new AbortController();
  (async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch all users for new environment
      const results = await searchUsers({
        query: "",
        signal: controller.signal,
        env,  // NEW environment
      });
      
      setAllUsers(results);
      
      // Reset selected user to first in new list
      setSelectedId(
        results.some((u) => u.userId === selectedId)
          ? selectedId
          : results[0]?.userId ?? ""
      );
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError("Failed to load users.", e);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  })();

  return () => controller.abort();
}, [env]);  // ← Dependency: Only runs when env changes

// BEHAVIOR:
// - Load trigger: Component mount OR env state change
// - API call: GET /ad/usersByEnv/{env}
// - Response: List of users for selected environment
// - State updates: allUsers, selectedId
// - Error handling: Catches LDAP connection failures
// - Cleanup: Aborts pending requests if unmounted
```

**Performance Notes:**
- AbortController prevents race conditions (multiple env changes)
- Full list loaded once, cached in `allUsers`
- No repeated calls for same environment during same session

---

### 2. Client-Side Search Memoization

```javascript
// Computed: Filtered user list based on search query
const users = useMemo(() => {
  const q = query.trim().toLowerCase();
  
  if (!q) return allUsers;  // No filter if empty query
  
  // Search across displayName, email, userId
  return allUsers.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.userId?.toLowerCase().includes(q)
  );
}, [query, allUsers]);  // Recalculate only if query or allUsers change

// BEHAVIOR:
// - Instant filtering (0-5ms for 16 users)
// - No API calls (all computation in-memory)
// - Triggered on: search box input change
// - Returns: Filtered user list for ResultsPane display
```

**Performance Optimization:**
- `useMemo` prevents unnecessary recalculations
- Filter logic only runs when dependencies change
- 16 users is small enough for in-memory filtering (negligible CPU)

---

### 3. Current User Selection

```javascript
// Computed: Currently selected user object
const user = useMemo(() => {
  return users.find((u) => u.userId === selectedId);
}, [users, selectedId]);  // Recalculate if users or selectedId changes

// Result: { userId: "...", displayName: "...", email: "...", groups: [...] }
//         Used by UserHeader, GroupsTab, PermissionsTab components
```

---

### 4. Filtered AD Groups

```javascript
// Computed: Groups for current user, filtered by groupFilter
const filteredGroups = useMemo(() => {
  if (!user?.groups) return [];
  
  const q = groupFilter.trim().toLowerCase();
  
  return user.groups
    .filter((g) => {
      if (!q) return true;
      return g.name?.toLowerCase().includes(q) ||
             g.dn?.toLowerCase().includes(q);
    })
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}, [user, groupFilter]);

// BEHAVIOR:
// - Filter & sort AD groups for current user
// - Updates: When user changes or groupFilter changes
// - Used by: GroupsTab component for display
```

**Data Structure:**
```javascript
// Each group in user.groups:
{
  dn: "CN=ROLE_SES_SHOP,OU=Roles,DC=test,DC=local",  // Distinguished Name
  name: "ROLE_SES_SHOP",                              // Role name
  membership: "DIRECT" | "INDIRECT"                   // How assigned
}
```

---

### 5. Filtered Permissions

```javascript
// Computed: Permissions from API response, filtered by permFilter
const filteredPerms = useMemo(() => {
  if (!permissionsData?.items) return [];
  
  const q = permFilter.trim().toLowerCase();
  
  return permissionsData.items
    .filter((p) => {
      if (!q) return true;
      return p.name?.toLowerCase().includes(q) ||
             p.code?.toLowerCase().includes(q) ||
             p.category?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      // Risk priority: HIGH > MEDIUM > LOW
      const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return (riskOrder[a.riskLevel] ?? 3) - (riskOrder[b.riskLevel] ?? 3);
    });
}, [permissionsData, permFilter]);

// BEHAVIOR:
// - Filter permissions and sort by risk level
// - Updates: When permissionsData arrives or permFilter changes
// - Used by: PermissionsTab component
```

---

### 6. Tab-Triggered Permission Fetch

```javascript
// Effect: Fetch permissions when Permissions tab is clicked
useEffect(() => {
  // Triggered when: tab changes OR user changes (only fetch if tab===2)
  
  if (tab !== 2 || permissionsData) return;  // Skip if not on Permissions tab or already loaded
  if (!user) return;                         // Skip if no user selected
  
  // Fetch using ALL user's groups as roles
  fetchPermissions();
  
}, [tab, user]);  // Dependency: Fetch when tab changes or user changes

// Function: fetchPermissions()
const fetchPermissions = async () => {
  if (!user) return;
  
  try {
    setPermLoading(true);
    setPermError("");
    
    console.log("Fetching permissions for user:", {
      userId: user.userId,
      env,
      roles: user.groups?.map(g => g.name) || []
    });
    
    // Call API with ALL user's AD groups as roles
    const data = await getPermissions({
      userId: user.userId,
      env,
      roles: user.groups?.map(g => g.name) || [],
    });
    
    setPermissionsData(data);
  } catch (e) {
    console.error("Failed to load permissions:", e);
    setPermError(e.message || "Failed to load permissions");
  } finally {
    setPermLoading(false);
  }
};

// BEHAVIOR:
// - Triggered: User clicks Permissions tab (index 2)
// - Fetches: Permissions for all user's roles
// - Stores: Response in permissionsData state
// - UI Update: PermissionsTab renders permissions
```

**Key Design Decision:**
- Permissions only fetched ON-DEMAND (tab click) not on load
- Reduces API calls and improves perceived performance
- User can avoid fetching if they only need user info

---

### 7. Group-Specific Permission Fetch

```javascript
// Function: fetchPermissionsForGroup(groupName)
// Triggered by: "View perms" button click in GroupsTab
const fetchPermissionsForGroup = async (groupName) => {
  if (!user) return;
  
  try {
    setPermLoading(true);
    setPermError("");
    
    console.log("Fetching permissions for group:", {
      userId: user.userId,
      env,
      role: groupName
    });
    
    // Call API with ONLY this single group as role
    const data = await getPermissions({
      userId: user.userId,
      env,
      roles: [groupName],  // ← Single role instead of all
    });
    
    setPermissionsData(data);
    setTab(2);  // Switch to Permissions tab to show results
  } catch (e) {
    console.error("Failed to load permissions for group:", e);
    setPermError(e.message);
  } finally {
    setPermLoading(false);
  }
};

// BEHAVIOR:
// - Triggered: User clicks "View perms" on specific AD group
// - Example: Click "View perms" on ROLE_SES_SHOP
// - Fetches: Permissions attributed ONLY to ROLE_SES_SHOP
// - Displays: Switches to Permissions tab with single-role results
// - Use Case: Debug specific role permissions vs all permissions
```

**Comparison:**
```
fetchPermissions() → roles: [all user's groups]
Example: roles: ["ROLE_SES_SHOP", "PlanAdmin", "ROLE_ADMIN"]
Result: All permissions from all three roles combined

fetchPermissionsForGroup("ROLE_SES_SHOP") → roles: [single group]
Example: roles: ["ROLE_SES_SHOP"]
Result: ONLY permissions from ROLE_SES_SHOP (for comparison)
```

---

## Data Flow Diagrams

### Flow 1: Initial Page Load

```
User opens http://localhost:5173
│
├─> React mounts UserAccessViewer
│   └─> useEffect([env]) triggers
│       └─> searchUsers("", env="test")
│           └─> HTTP GET /ad/usersByEnv/test
│               └─> Spring Cache (adUsersByEnv::test)
│                   ├─> Cache HIT? Return cached
│                   └─> Cache MISS? Query LDAP
│                       ├─> LdapRouter.routeToLdap("test")
│                       │   └─> SSL LDAP conn → Test env
│                       └─> SELECT * FROM users
│                           └─> Returns: List<AdUser> = 16 users
│
├─> setAllUsers(results)
│   └─> users = useMemo filter([]) = all 16 users
│
├─> selectedId defaults to first user
│   └─> user = useMemo find → first user object
│
└─> UI renders
    ├─> UserHeader shows selected user
    ├─> GroupsTab shows user's AD groups
    ├─> PermissionsTab shows "Click to refresh" (empty)
    ├─> ResultsPane shows 16 users in list
    └─> SearchBox ready for input
```

---

### Flow 2: Search User

```
User types "John" in search box
│
├─> setQuery("John")
│   └─> re-render triggered
│
├─> users = useMemo([query, allUsers])
│   └─> Execute filter:
│       allUsers.filter(u =>
│         u.displayName.includes("John") OR
│         u.email.includes("John") OR
│         u.userId.includes("john")
│       )
│   └─> Result: [1-3 matching users]
│
└─> UI updates ResultsPane with filtered users
    (No API call, instant feedback)
```

---

### Flow 3: Select Different User

```
User clicks on "John Smith" in ResultsPane
│
├─> onClick={setSelectedId("jsmith")}
│
├─> selectedId state change triggers:
│   ├─> user = useMemo re-runs
│   │   └─> Finds matching user from users array
│   │       └─> Returns new user object
│   │
│   └─> Tab dependency re-check
│       ├─> if tab === 2: clear permissionsData
│       ├─> if tab === 2 and user changed: fetch new permissions
│       └─> else: just update UI
│
└─> UI updates
    ├─> UserHeader shows John Smith's info
    ├─> GroupsTab shows John's groups (different from previous)
    └─> PermissionsTab clears (permissions not needed yet)
```

---

### Flow 4: View Permissions

```
User clicks "Permissions" tab (tab index 2)
│
├─> setTab(2)
│   └─> Tab dependency: [tab, user] triggers
│
├─> Check: if (tab !== 2 || permissionsData) return
│   └─> Condition: tab IS 2 AND permissionsData IS null
│       └─> Proceed to fetch
│
├─> fetchPermissions() called
│   └─> HTTP POST /api/users/permissions
│       {
│         "userId": "jsmith",
│         "env": "test",
│         "roles": ["ROLE_SES_SHOP", "PlanAdmin"]  // All user's groups
│       }
│       └─> Vite proxy routes to :8081
│           └─> PermissionService.getPermissions()
│               ├─> Try Redis cache: "jsmith::test::<hash>"
│               │   ├─> HIT? Return cached permissions
│               │   └─> MISS? Continue
│               │
│               ├─> DB2 Query 1: Get role perms
│               │   WHERE role IN (ROLE_SES_SHOP, PlanAdmin)
│               │
│               ├─> DB2 Query 2: Get user overrides
│               │   WHERE userId=jsmith AND env=test
│               │
│               ├─> Merge permissions
│               │   └─> Combined set
│               │
│               ├─> Cache to Redis + Local
│               │   └─> TTL: 1 hour
│               │
│               └─> HTTP 200 + PermissionResponse
│                   {
│                     "permissionCount": 42,
│                     "permissions": [
│                       {"name": "FUND_APPROVE", "riskLevel": "HIGH", ...},
│                       {"name": "REPORT_VIEW", "riskLevel": "MEDIUM", ...},
│                       ...
│                     ]
│                   }
│
├─> setPermissionsData(transformedResponse)
│   └─> Transform API response to UI format
│       └─> filteredPerms = useMemo re-runs
│           └─> Sort permissions by risk level
│
└─> UI renders PermissionsTab
    ├─> Display permission table
    ├─> Show "42 total permissions"
    ├─> Filter by name/category available
```

---

### Flow 5: View Single Group Permissions

```
User clicks "View perms" button on ROLE_SES_SHOP group
│
├─> onClick={() => onViewPerms("ROLE_SES_SHOP")}
│   └─> Calls fetchPermissionsForGroup("ROLE_SES_SHOP")
│
├─> fetchPermissionsForGroup("ROLE_SES_SHOP")
│   ├─> setPermLoading(true)
│   ├─> HTTP POST /api/users/permissions
│   │   {
│   │     "userId": "jsmith",
│   │     "env": "test",
│   │     "roles": ["ROLE_SES_SHOP"]  // ← Only this group
│   │   }
│   │
│   ├─> setPermissionsData(response)
│   ├─> setTab(2)  // Switch to Permissions tab
│   └─> setPermLoading(false)
│
└─> UI updates
    ├─> Switch to Permissions tab
    └─> Show only ROLE_SES_SHOP permissions (subset of all)
        └─> User can compare vs Step 4 (all permissions)
```

---

## Component Specifications

### UserAccessViewer.jsx (Main Container - 460 lines)

**Role:** Central state manager and layout orchestrator

**Props:** None (top-level component)

**State:** 14 state variables (see State Management section)

**Key Methods:**
- `fetchPermissions()`: Fetch all user permissions
- `fetchPermissionsForGroup(groupName)`: Fetch single-role permissions
- `handleExport()`: Export permissions to CSV

**Renders:**
```jsx
<Box>  {/* Main layout container */}
  <AppBar>  {/* Header with search, env dropdown, export button */}
  <Box>  {/* Tabs container */}
    <Tabs value={tab} onChange={}>
      <Tab label="Overview" />
      <Tab label="AD Groups" />
      <Tab label="Permissions" />
      <Tab label="Mapping" />
    </Tabs>
  <Box>  {/* Main content area */}
    {tab === 0 && <UserHeader user={user} />}
    {tab === 1 && <GroupsTab ... onViewPerms={fetchPermissionsForGroup} />}
    {tab === 2 && <PermissionsTab ... />}
    {tab === 3 && <MappingTab ... />}
  <ResultsPane {/* User search results */}
  <GroupPermDrawer /> {/* Permission details modal */}
</Box>
```

---

### GroupsTab.jsx (AD Groups Display)

**Role:** Display and manage user's AD group memberships

**Props:**
```javascript
{
  user,              // Selected user object (or null)
  groupFilter,       // Filter text
  setGroupFilter,    // Update filter
  filteredGroups,    // Filtered groups array
  onViewPerms        // Callback: (groupName) => void
}
```

**State:** None (all state in parent)

**Key Features:**
- Display each AD group with Distinguished Name (DN)
- Show group membership type (DIRECT/INDIRECT)
- "View perms" button triggers permission fetch for single role
- Filter groups by name or DN
- Sort alphabetically

**Renders:**
```jsx
<Box>
  <TextField />  {/* Filter input */}
  <Paper>  {/* Groups list */}
    {filteredGroups.map(group =>
      <Box key={group.dn}>
        <Typography>{group.name}</Typography>  {/* Group name */}
        <Typography>{group.dn}</Typography>    {/* DN */}
        <Chip label={group.membership} />      {/* DIRECT/INDIRECT */}
        <Button onClick={() => onViewPerms(group.name)}>
          View perms
        </Button>
      </Box>
    )}
  </Paper>
</Box>
```

---

### PermissionsTab.jsx (Permissions Display)

**Role:** Display computed permissions for selected user/role

**Props:**
```javascript
{
  loading,           // Boolean - API loading state
  error,            // String - Error message
  permissionsData,  // API response object
  filteredPerms,    // Filtered permissions array
  permFilter,       // Filter text
  setPermFilter,    // Update filter
  onDrawerOpen      // Callback: open permission details modal
}
```

**State:** None

**Features:**
- Display permission table with columns:
  - Name (permission code)
  - Risk Level (HIGH/MEDIUM/LOW)
  - Source (ROLE or USER override)
  - Category
- Filter permissions by name, code, or category
- Sort by risk level (HIGH → MEDIUM → LOW)
- Click permission to open details drawer
- Show loading spinner during fetch
- Display error if fetch fails
- Show permission count summary

**Renders:**
```jsx
<Box>
  {loading && <CircularProgress />}
  {error && <Alert severity="error">{error}</Alert>}
  <TextField />  {/* Filter input */}
  <Table>  {/* Permissions table */}
    <TableBody>
      {filteredPerms.map(perm =>
        <TableRow onClick={() => onDrawerOpen(perm)}>
          <TableCell>{perm.name}</TableCell>
          <TableCell><Chip label={perm.riskLevel} /></TableCell>
          <TableCell>{perm.source}</TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
  <Typography>Total: {filteredPerms.length}</Typography>
</Box>
```

---

### ResultsPane.jsx (User Search Results)

**Role:** Display filtered user search results

**Props:**
```javascript
{
  data,          // Array of AdUser objects
  selectedId,    // Currently selected user ID
  onSelect,      // Callback: (userId) => void
  loading,       // Boolean
  error,         // String
  count          // Number of results
}
```

**Renders:**
```jsx
<Paper>
  <List>
    {data.map(user =>
      <ListItem
        key={user.userId}
        selected={user.userId === selectedId}
        onClick={() => onSelect(user.userId)}
      >
        <ListItemText
          primary={user.displayName}
          secondary={user.email}
        />
      </ListItem>
    )}
  </List>
</Paper>
```

---

### UserHeader.jsx (Selected User Info)

**Role:** Display detailed information about selected user

**Props:**
```javascript
{
  user          // AdUser object
}
```

**Displays:**
- User ID
- Display Name
- Email
- Account Expiration Date (formatted)
- Last Login (formatted)
- Group Count
- Permission indicators

---

### GroupPermDrawer.jsx (Permission Details Modal)

**Role:** Display detailed information about selected permission

**Props:**
```javascript
{
  open,           // Boolean
  onClose,        // Callback: () => void
  permission,     // Permission object
  user            // Associated user
}
```

**Features:**
- Modal drawer with full permission details
- Show all attributes (name, risk level, category, source)
- Display affected roles/users
- Audit trail (if available)

---

## API Integration

### userAccessApi.js (299 lines)

**Location:** `src/api/userAccessApi.js`

**Purpose:** Centralized API client for backend communication

#### 1. searchUsers()

```javascript
async function searchUsers(options) {
  const { query = "", env = "test", signal } = options;
  
  try {
    // GET /ad/usersByEnv/{env}
    const response = await fetch(`/ad/usersByEnv/${env}`, {
      signal  // AbortController support
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const users = await response.json();
    
    if (!Array.isArray(users)) {
      throw new Error("Invalid response format");
    }
    
    // Transform LDAP response to UI format
    return users.map(u => ({
      userId: u.userId,
      displayName: u.displayName,
      email: u.email,
      groups: (u.groups || []).map(g => ({
        dn: g.dn || g.distinguishedName,
        name: g.name || extractNameFromDN(g.dn),
        membership: g.membership || "DIRECT"
      })),
      accountExpiration: u.accountExpiration,
      lastLogin: u.lastLogin,
      status: u.status || "ACTIVE"
    }));
    
  } catch (error) {
    console.error("searchUsers failed:", error);
    throw error;
  }
}
```

**Request:** `GET /ad/usersByEnv/{env}`
- `env`: test, prod, default

**Response:** Array of AdUser objects

**Error Handling:**
- HTTP errors → throw error
- Invalid JSON → throw error
- AbortError → silently ignore (cleanup from unmount)

---

#### 2. getPermissions()

```javascript
async function getPermissions(request) {
  const {
    userId,      // User ID: "DevCsc_SESS"
    env,         // Environment: "test"
    roles = []   // AD group/role names: ["ROLE_SES_SHOP", "PlanAdmin"]
  } = request;

  try {
    // POST /api/users/permissions
    const response = await fetch("/api/users/permissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        env,
        roles
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const apiResponse = await response.json();
    
    // Transform API response to UI format
    return transformPermissionsResponse(apiResponse);
    
  } catch (error) {
    console.error("getPermissions failed:", error);
    throw error;
  }
}
```

**Request:**
```json
{
  "userId": "DevCsc_SESS",
  "env": "test",
  "roles": ["ROLE_SES_SHOP", "PlanAdmin"]
}
```

**Response:**
```json
{
  "userId": "DevCsc_SESS",
  "env": "test",
  "permissionCount": 42,
  "permissions": [
    {
      "name": "FUND_APPROVE",
      "riskLevel": "HIGH",
      "source": "ROLE_SES_SHOP"
    },
    ...
  ]
}
```

---

#### 3. transformPermissionsResponse()

```javascript
function transformPermissionsResponse(apiResponse) {
  try {
    const items = apiResponse.permissions || 
                  apiResponse.items || [];
    
    if (!Array.isArray(items)) {
      console.warn("Items not an array");
      return null;
    }
    
    // Transform each permission
    const transformedItems = items.map(item => ({
      code: item.name || "UNKNOWN",
      name: item.name || "UNKNOWN",
      label: item.name || "UNKNOWN",
      category: "System",
      risk: item.riskLevel || "LOW",
      riskLevel: item.riskLevel || "LOW",
      source: item.source || "ROLE",
      grantedVia: []
    }));
    
    return {
      ...apiResponse,
      items: transformedItems,
      count: apiResponse.permissionCount || transformedItems.length
    };
    
  } catch (error) {
    console.error("Transform failed:", error);
    return null;
  }
}
```

**Purpose:** Convert API response to UI data format

**Key Transformations:**
- Map `permissions` array to `items`
- Extract and normalize permission properties
- Set defaults for missing values
- Calculate count

---

#### 4. permissionsToCsv()

```javascript
function permissionsToCsv(permissions) {
  if (!permissions || !Array.isArray(permissions.items)) {
    return "";
  }
  
  // Create CSV header
  const headers = [
    "Permission Name",
    "Risk Level",
    "Source",
    "Category"
  ].join(",");
  
  // Transform rows
  const rows = permissions.items.map(p =>
    [
      `"${p.name || ""}"`,
      p.riskLevel || "",
      p.source || "",
      p.category || ""
    ].join(",")
  );
  
  return [headers, ...rows].join("\n");
}
```

**Usage:** Export permissions to CSV file for external analysis

---

### Mock Data Fallback

```javascript
// api/mockData.js
export const MOCK = {
  users: [
    {
      userId: "DevCsc_SESS",
      displayName: "Dev Csc Sess",
      email: "devcsc.sess@example.com",
      groups: [...],
      status: "ACTIVE"
    }
  ]
};
```

**Usage:** Fallback if API unavailable for demo/testing

---

## Styling & Theme

### Material-UI Theme Configuration

**File:** `src/theme/nsyohTheme.js`

**Customizations:**
```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2"  // Material-UI blue
    },
    secondary: {
      main: "#dc004e"  // Pink
    },
    error: {
      main: "#f44336"  // Red
    },
    warning: {
      main: "#ff9800"  // Orange
    },
    success: {
      main: "#4caf50"  // Green
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  }
});
```

**Application:** Used in App.jsx via `<ThemeProvider theme={theme}>`

### Global Styles

**File:** `src/index.css`

**Includes:**
- Typography defaults
- Link styling
- Body background
- Scrollbar styling

### Component-Level Styles

**Inline sx Prop:**
```jsx
<Box sx={{
  display: "grid",
  gridTemplateColumns: "1fr 160px 140px",
  gap: 1,
  p: 1.5,
  bgcolor: "background.default"
}}>
```

---

## Performance Optimization

### 1. Client-Side Search Optimization

**Problem:** Re-filtering 16 users on every keystroke would be expensive at scale

**Solution:** 
- `useMemo` caches filter results
- Only recalculates if `query` or `allUsers` changes
- For 16 users: negligible cost (< 1ms)

```javascript
const users = useMemo(() => {
  // Only filter when needed
  return allUsers.filter(u => ...);
}, [query, allUsers]);
```

---

### 2. Lazy Permission Loading

**Problem:** Fetching permissions on every user change would overwhelm backend and users

**Solution:**
- Only fetch on Permissions tab click
- Cache response in state
- Don't refetch for same user (unless tab changes)

```javascript
useEffect(() => {
  if (tab !== 2 || permissionsData) return;  // Skip if not needed
  fetchPermissions();
}, [tab, user]);
```

**Result:**
- Cold load (first permission fetch): 500-1000ms
- Subsequent views of same user: instant (cached)
- Limit: One fetch per tab click per user

---

### 3. Request Cancellation with AbortController

**Problem:** User changes environment quickly → multiple LDAP queries in flight

**Solution:**
- AbortController cancels previous requests
- React cleanup prevents state updates on unmounted component

```javascript
return () => controller.abort();
```

---

### 4. Memoization for Computed Properties

**Problem:** Re-computing filtered lists on every render

**Solution:** `useMemo` for derived state
- `users` - filtered search results
- `user` - current selected user
- `filteredGroups` - filtered AD groups for current user
- `filteredPerms` - filtered permissions with sorting

---

### 5. Virtual Scrolling (Future Enhancement)

If user list grows beyond 16 users:
- Implement react-window for virtual scrolling
- Only render visible rows in ResultsPane
- Memory efficient for 1000+ users

---

## Debugging & Common Issues

### Issue 1: "Cannot access 'user' before initialization"

**Symptom:** Browser console error in UserAccessViewer

**Root Cause:** 
- `user` variable used in effect before `useMemo` defines it
- Effect ran before memoized computed values

**Solution:**
- Move `user` and `users` `useMemo` declarations BEFORE useEffect that uses them
- Ensure effects reference computed values defined above them

**Code Order (Correct):**
```javascript
const [query, setQuery] = useState("");
const [allUsers, setAllUsers] = useState([]);
// ↓ MEMOIZED VALUES BEFORE EFFECTS
const users = useMemo(() => { ... }, [query, allUsers]);
const user = useMemo(() => { ... }, [users, selectedId]);
// ↓ EFFECTS THAT USE COMPUTED VALUES
useEffect(() => {
  if (tab !== 2 || permissionsData) return;
  if (!user) return;  // Safe to check user now
  fetchPermissions();
}, [tab, user]);
```

---

### Issue 2: "Failed to fetch: 404 Not Found on /api/users/permissions"

**Symptom:** Permission fetch fails with 404

**Root Cause:**
- Vite proxy not configured or restarted
- Backend service not running on port 8081

**Solution:**
1. Check `vite.config.js` has `/api` proxy configured
2. Restart dev server: `npm run dev`
3. Verify backend: `curl http://localhost:8081/swagger-ui.html` (should return HTML)
4. Check Network tab in DevTools: see what URL is being hit

```javascript
// vite.config.js - correct configuration
proxy: {
  "/api": {
    target: "http://localhost:8081",
    changeOrigin: true
  }
}
```

---

### Issue 3: "HTTP 400: Invalid request userId is required"

**Symptom:** Permission fetch returns 400 error

**Root Cause:**
- userId is empty string or null
- roles array is empty

**Solution:**
1. Check selectedId state: `console.log("Selected user:", selectedId)`
2. Check user object: `console.log("User:", user)`
3. Ensure user has groups: `console.log("User groups:", user?.groups)`

---

### Issue 4: Permissions take too long to load (> 1 second)

**Symptom:** Slow initial permission fetch

**Root Cause:**
- Redis cache miss (first query)
- Database query on large permission set
- Network latency

**Solution:**
1. Check backend logs: `tail -f application.log`
2. Monitor Redis: `redis-cli monitor`
3. Profile database query: Check execution plan
4. Measure: Second load should be instant if cached

---

### Issue 5: Search results don't update after typing

**Symptom:** Search box accepts input but results don't change

**Root Cause:**
- `setQuery` not fired (unlikely)
- `useMemo` dependency missing
- Filter logic bug

**Debug:**
```javascript
// Add logging in UserAccessViewer
useEffect(() => {
  console.log("Query changed:", query);
  console.log("Filtered users:", users);
}, [query, users]);
```

**Check:** DevTools React Profiler to see state changes

---

### Issue 6: Wrong permissions displayed (cached from different user)

**Symptom:** View User A permissions, switch to User B, User A's permissions still showing

**Root Cause:**
- User changed but `permissionsData` not cleared
- Effect dependency missing `user` in array

**Solution:**
```javascript
useEffect(() => {
  // WRONG - missing user dependency
  if (tab !== 2) return;
  fetchPermissions();
}, [tab]);  // ❌ User not included

// CORRECT - user dependency included
if (tab !== 2 || permissionsData) return;
if (!user) return;
useEffect(() => {
  fetchPermissions();
}, [tab, user]);  // ✅ User included
```

---

### Debugging Tips

**1. Check Component Render Count:**
```javascript
useEffect(() => {
  console.log("UserAccessViewer rendered");
}, []);
```

**2. Log State Changes:**
```javascript
useEffect(() => {
  console.log("State:", {
    query, selectedId, tab, env,
    loading, permLoading,
    userCount: allUsers.length,
    hasPermissions: !!permissionsData
  });
}, [query, selectedId, tab, env, loading, permLoading, allUsers, permissionsData]);
```

**3. Monitor API Calls:**
Open DevTools → Network tab
- Filter by XHR/Fetch
- Check request/response headers
- Verify payload format

**4. Check React DevTools:**
- Components tab: Inspect component tree
- Hooks tab: Monitor state/effect execution
- Profiler tab: Measure render performance

**5. Use Browser DevTools Console:**
```javascript
// In console, access global React Dev Tools
// Inspect prop values of components
// Call component methods
```

---

## Browser DevTools Console Examples

```javascript
// Get all state from UserAccessViewer
// (requires installing React DevTools)

// Check if user is loaded
allUsers.length  // Should be > 0

// Check current selected user
selectedId  // Should be non-empty string

// Check permissions data
permissionsData  // Should be object with items array

// Manually trigger permission fetch (if debugging)
// In console: search for fetchPermissions call
```

---

## Summary: Component Communication Flow

```
User Interaction (UI Event)
  ↓
Event Handler (onClick, onChange, useEffect)
  ↓
setState() [e.g., setTab(2)]
  ↓
Component Re-render (React reconciliation)
  ↓
useMemo/useEffect Dependencies Evaluated
  ↓
Computed State Updated [e.g., user, filteredGroups]
  ↓
API Call (if needed) [e.g., fetchPermissions()]
  ↓
HTTP Request to Backend
  ↓
Backend Processing (Cache/Database)
  ↓
Response Received
  ↓
setState() with Response [e.g., setPermissionsData()]
  ↓
Component Re-render with New Data
  ↓
UI Update (User sees results)
```

---

**Document Version:** 1.0  
**Last Modified:** April 24, 2026  
**Author:** Technical Documentation Team  
**Audience:** React developers, Frontend engineers, Full-stack developers, QA engineers
