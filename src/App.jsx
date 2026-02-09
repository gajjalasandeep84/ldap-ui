//import UserAccessViewer from "./UserAccessViewer";

//Day 6
//export default function App() {
//  return <UserAccessViewer />;
//}
import { useEffect, useMemo, useState } from "react";
import UserRow from "./UserRow";

export default function App() {
  const [query, setQuery] = useState("");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Day 7: fetch users (simulated async)
  useEffect(() => {
    console.log("inside Use Effect");
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");
        //const count=0;
        // Simulate network delay
        let count = 0; // Use 'let' so you can change the value

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 2000)).then(() => {
          // Wrapped in an arrow function
          count = count + 1;
          console.log("After promise returns");
          console.log("Current count:", count);
        });
        console.log("Count value is :" + count);
        const data = [
          {
            dn: "uid=mmohan" + count + "ou=people,dc=example,dc=com",
            username: "mmohan",
            name: "Mohan M" + count,
            role: "BROKER",
          },
          {
            dn: "uid=rkumar,ou=people,dc=example,dc=com",
            username: "rkumar",
            name: "Raj Kumar",
            role: "ASSISTOR",
          },
          {
            dn: "uid=sgajjala,ou=people,dc=example,dc=com",
            username: "sgajjala",
            name: "Srinivas Gajjala",
            role: "ADMIN",
          },
        ];
        console.log("inside async loadusers outside IF");
        if (!cancelled) {
          setUsers(data);
          console.log("inside async loadusers IF");
        }
      } catch (e) {
        if (!cancelled) setError("Failed to load users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    console.log("Filtered users");
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      return (
        u.username.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );

    });
  }, [query, users]);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h2>LDAP User Search</h2>

      <input
        type="text"
        placeholder="Search by username"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 8, width: 320 }}
      />

      <div style={{ marginTop: 16 }}>
        {loading && <div>Loading users...</div>}

        {!loading && error && (
          <div style={{ color: "crimson" }}>{error}</div>
        )}

        {!loading && !error && filteredUsers.length === 0 && (
          <div>No users found</div>
        )}

        {!loading && !error && filteredUsers.length > 0 && (
          <ul style={{ paddingLeft: 18 }}>
            {filteredUsers.map((u) => (
              <UserRow key={u.dn} user={u} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
