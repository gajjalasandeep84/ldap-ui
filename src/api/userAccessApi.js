import { MOCK } from "./mockData";

/**
 * Transform backend permission response to frontend format
 * Maps /api/users/permissions response to UI data structure
 */
function transformPermissionsResponse(apiResponse) {
  if (!apiResponse || !apiResponse.items) {
    return null;
  }

  // Transform each permission item
  const transformedItems = apiResponse.items.map((item) => ({
    code: item.name || "UNKNOWN",
    name: item.name || "UNKNOWN",
    label: item.name || "UNKNOWN",
    category: "System", // API doesn't provide category, default to "System"
    risk: item.riskLevel || "LOW",
    riskLevel: item.riskLevel || "LOW",
    source: item.source || "ROLE",
    grantedVia: [], // API doesn't provide direct mapping, frontend will use roles
  }));

  return {
    ...apiResponse,
    items: transformedItems,
    count: apiResponse.permissionCount || transformedItems.length,
  };
}

/**
 * Transform backend AD user response to frontend format
 * Maps LDAP/Active Directory response to UI data structure
 */
function transformAdUserToFrontend(adUser) {
  //console.log("RAW AD USER:", adUser);
  // Parse memberOf DNs to extract group names and determine membership type
  const adGroups = (adUser.memberOf || []).map((dn) => {
    // Extract CN=GroupName from DN
    const cnMatch = dn.match(/^CN=([^,]+)/i);
    const groupName = cnMatch ? cnMatch[1] : dn;

    return {
      name: groupName,
      // TODO: Determine DIRECT vs NESTED membership
      // For now, default to DIRECT (requires backend enhancement)
      membership: "DIRECT",
      dn: dn,
    };
  });

  // Determine status from accountExpires
  // "Never Expires" or no expires date = ACTIVE
  // Expired date = DISABLED
  const isExpired =
    adUser.accountExpires &&
    adUser.accountExpires !== "Never Expires" &&
    new Date(adUser.accountExpires) < new Date();

  const status = isExpired ? "DISABLED" : "ACTIVE";

  // Mock permissions data (from groupToPermissions mapping)
  // TODO: Replace with real data from backend when available
  const mockPermissionsForUser = getMockPermissionsForGroups(
    adGroups.map((g) => g.name),
  );

  return {
    userId: adUser.samaccountName || adUser.name,
    displayName: adUser.displayName,
    email: adUser.mail,
    status: status,
    lastLogon: null, // Not available from LDAP, would need from Windows event logs or DB
    pwdLastSet: adUser.pwdLastSet,
    adGroups: adGroups,
    permissions: mockPermissionsForUser.permissions,
    groupToPermissions: mockPermissionsForUser.groupToPermissions,
  };
}

/**
 * Mock permissions based on group membership
 * Later: retrieve from backend database/API
 */
function getMockPermissionsForGroups(groupNames) {
  // Mock permission database
  const groupPermissionMap = {
    BO_APPEALS_READ: ["APPEALS_VIEW", "APPEALS_SEARCH"],
    BO_DOCS_VIEW: ["DOCS_VIEW"],
    BO_REPORTS_VIEW: ["REPORTS_VIEW", "REPORTS_EXPORT"],
    BO_ADMIN_SUPPORT: ["ADMIN_IMPERSONATE", "USER_UNLOCK"],
  };

  const permissionDetails = {
    APPEALS_VIEW: { label: "View Appeals", category: "Appeals", risk: "LOW" },
    APPEALS_SEARCH: {
      label: "Search Appeals",
      category: "Appeals",
      risk: "LOW",
    },
    DOCS_VIEW: { label: "View Documents", category: "Documents", risk: "MED" },
    REPORTS_VIEW: { label: "View Reports", category: "Reports", risk: "MED" },
    REPORTS_EXPORT: {
      label: "Export Reports",
      category: "Reports",
      risk: "HIGH",
    },
    ADMIN_IMPERSONATE: {
      label: "Impersonate User",
      category: "Admin",
      risk: "HIGH",
    },
    USER_UNLOCK: {
      label: "Unlock User Account",
      category: "Admin",
      risk: "MED",
    },
  };

  // Build permissions array
  const permissionsMap = new Map();
  const groupToPermissions = [];

  groupNames.forEach((groupName) => {
    const perms = groupPermissionMap[groupName] || [];
    const groupPerms = [];

    perms.forEach((code) => {
      const detail = permissionDetails[code];
      if (!permissionsMap.has(code)) {
        permissionsMap.set(code, {
          code,
          label: detail?.label || code,
          category: detail?.category || "General",
          risk: detail?.risk || "LOW",
          grantedVia: [groupName],
        });
      } else {
        // Add to existing permission's grantedVia
        const existing = permissionsMap.get(code);
        if (!existing.grantedVia.includes(groupName)) {
          existing.grantedVia.push(groupName);
        }
      }
      groupPerms.push(code);
    });

    if (perms.length > 0) {
      groupToPermissions.push({
        group: groupName,
        permissions: groupPerms,
      });
    }
  });

  return {
    permissions: Array.from(permissionsMap.values()),
    groupToPermissions: groupToPermissions,
  };
}

/**
 * Search users from backend LDAP API
 * Integrates with ad-users Spring Boot backend
 */
export async function searchUsers({ query, signal, env = "test" }) {
  try {
    // Call backend API endpoint
    const endpoint = `/ad/usersByEnv/${env}`;
    const res = await fetch(endpoint, { signal });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const adUsers = await res.json();

    // Transform backend response to frontend format
    const transformedUsers = adUsers.map(transformAdUserToFrontend);

    // Filter by query if provided
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      return transformedUsers.filter(
        (u) =>
          u.userId.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    return transformedUsers;
  } catch (error) {
    // Log error but don't throw - let caller handle
    console.error("Failed to fetch users:", error);
    throw error;
  }
}

/**
 * Fetch user permissions from backend
 * Calls /api/users/permissions endpoint
 */
export async function getPermissions({ userId, env = "test", roles = [], signal }) {
  try {
    const endpoint = `/api/users/permissions`;
    
    const requestBody = {
      userId,
      env,
      roles: Array.isArray(roles) ? roles : []
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return transformPermissionsResponse(data);
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
    throw error;
  }
}

/**
 * CSV export stays UI-side for now.
 * Later: you can call an API endpoint to export server-side.
 */
export function permissionsToCsv(user) {
  const escapeCsv = (val) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n"))
      return `"${s.replaceAll('"', '""')}"`;
    return s;
  };

  const rows = [
    ["code", "label", "category", "risk", "grantedVia"].join(","),
    ...user.permissions.map((p) =>
      [p.code, p.label, p.category, p.risk, p.grantedVia.join("|")]
        .map(escapeCsv)
        .join(","),
    ),
  ];

  return rows.join("\n");
}
