export const MOCK = {
  users: [
    {
      userId: "sandeep.g",
      displayName: "Sandeep Gajjala",
      email: "sandeep@example.com",
      status: "ACTIVE",
      lastLogon: "2026-01-15T14:21:00Z",
      pwdLastSet: "2025-12-01T09:00:00Z",
      adGroups: [
        { name: "BO_APPEALS_READ", membership: "DIRECT", dn: "CN=BO_APPEALS_READ,OU=HX,DC=example,DC=com" },
        { name: "BO_DOCS_VIEW", membership: "DIRECT", dn: "CN=BO_DOCS_VIEW,OU=HX,DC=example,DC=com" },
        { name: "BO_ADMIN_SUPPORT", membership: "NESTED", dn: "CN=BO_ADMIN_SUPPORT,OU=HX,DC=example,DC=com" },
      ],
      permissions: [
        { code: "APPEALS_VIEW", label: "View Appeals", category: "Appeals", risk: "LOW", grantedVia: ["BO_APPEALS_READ"] },
        { code: "APPEALS_SEARCH", label: "Search Appeals", category: "Appeals", risk: "LOW", grantedVia: ["BO_APPEALS_READ"] },
        { code: "DOCS_VIEW", label: "View Documents", category: "Documents", risk: "MED", grantedVia: ["BO_DOCS_VIEW"] },
        { code: "ADMIN_IMPERSONATE", label: "Impersonate User", category: "Admin", risk: "HIGH", grantedVia: ["BO_ADMIN_SUPPORT"] },
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
      adGroups: [{ name: "BO_APPEALS_READ", membership: "DIRECT", dn: "CN=BO_APPEALS_READ,OU=HX,DC=example,DC=com" }],
      permissions: [{ code: "APPEALS_VIEW", label: "View Appeals", category: "Appeals", risk: "LOW", grantedVia: ["BO_APPEALS_READ"] }],
      groupToPermissions: [{ group: "BO_APPEALS_READ", permissions: ["APPEALS_VIEW"] }],
    },
  ],
};