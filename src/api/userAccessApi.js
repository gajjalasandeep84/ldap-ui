import { MOCK } from "./mockData";

/**
 * Later: replace this with a real fetch to your backend.
 * Keep the function signature the same.
 */
export async function searchUsers({ query, signal }) {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const q = query.trim().toLowerCase();
  if (!q) return MOCK.users;

  return MOCK.users.filter(
    (u) =>
      u.userId.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  );
}

//When you’re ready to switch to backend
//export async function searchUsers({ query, signal }) {
//  const res = await fetch(`/api/users?query=${encodeURIComponent(query)}`, { signal });
//  if (!res.ok) throw new Error("HTTP " + res.status);
//  return res.json();
//}

/**
 * CSV export stays UI-side for now.
 * Later: you can call an API endpoint to export server-side.
 */
export function permissionsToCsv(user) {
  const escapeCsv = (val) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };

  const rows = [
    ["code", "label", "category", "risk", "grantedVia"].join(","),
    ...user.permissions.map((p) =>
      [p.code, p.label, p.category, p.risk, p.grantedVia.join("|")].map(escapeCsv).join(",")
    ),
  ];

  return rows.join("\n");
}
