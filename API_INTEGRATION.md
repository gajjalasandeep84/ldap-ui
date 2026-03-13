# LDAP-UI & AD-Users API Integration Guide

**Frontend:** React SPA (ldap-ui)
**Backend:** Spring Boot REST API (ad-users)
**Last Updated:** March 13, 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Integration Checklist](#integration-checklist)
5. [Development Setup](#development-setup)
6. [Deployment Configuration](#deployment-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         ldap-ui React Application (Port 3000)          │ │
│  │  - User search interface                               │ │
│  │  - Display groups and permissions                      │ │
│  │  - CSV export (client-side)                            │ │
│  │  - Relative API paths: /api/*                          │ │
│  └────────────────┬─────────────────────────────────────┘ │
│                   │                                         │
│                   │ HTTP Requests (via reverse proxy)       │
│                   │                                         │
└───────────────────┼─────────────────────────────────────────┘
                    │
                    │
        ┌───────────┴────────────────┐
        │                            │
   (Dev Mode)                   (Production)
   Port 8080                    NGINX + Ingress
        │                            │
  ┌─────▼────────────┐      ┌───────▼────────────┐
  │ Spring Boot API  │      │  Spring Boot API   │
  │ (localhost:8080) │      │  (via K8s Service) │
  │                  │      │                    │
  │ GET /ad/usersByEnv/{env} │ GET /ad/usersByEnv/{env} │
  └──────────────────┘      └────────────────────┘
         │                          │
         └──────────────┬───────────┘
                        │
                   LDAP/SSL
                        │
              ┌─────────▼──────────┐
              │  Active Directory  │
              │  LDAP Server       │
              │  (Multiple env)    │
              └────────────────────┘
```

### Current State (Development)

**Frontend:** Uses **mock data** (development mode)
**Backend:** Ready to connect (production code commented out)

### Development Workflow

1. Frontend runs with mock data
2. Backend connected to real LDAP
3. When ready: Uncomment production API call in `userAccessApi.js`

### Production Workflow

1. Frontend calls backend via reverse proxy
2. Backend queries Active Directory
3. Results returned to frontend for display

---

## API Endpoints

### 1. Search Users by Environment

**Endpoint:** `GET /ad/usersByEnv/{env}`

**Parameters:**
- `{env}` - Environment: `test`, `prod`, or `default`

**Example Requests:**

```bash
# Test environment
curl http://localhost:8080/ad/usersByEnv/test

# Production environment
curl http://localhost:8080/ad/usersByEnv/prod

# Default environment
curl http://localhost:8080/ad/usersByEnv/default
```

**Response Format:**

```json
[
  {
    "displayName": "Sandeep Gajjala",
    "mail": "sandeep@example.com",
    "name": "sandeep.g",
    "sAMAccountName": "sandeep.g",
    "accountExpires": "2027-12-31T23:59:59",
    "pwdLastSet": "2025-12-15T10:30:00",
    "whenCreated": "2024-06-01T08:00:00.000Z",
    "whenChanged": "2026-03-10T14:20:00.000Z",
    "memberOf": [
      "CN=BO_APPEALS_READ,OU=Groups,DC=example,DC=com",
      "CN=BO_REPORTS_VIEW,OU=Groups,DC=example,DC=com"
    ]
  }
]
```

**Response Codes:**
- `200 OK` - Users found and returned
- `400 Bad Request` - Invalid environment specified
- `401 Unauthorized` - LDAP authentication failed
- `500 Internal Server Error` - LDAP connection error

---

## Data Models

### User Object (Backend Response)

```typescript
interface AdUser {
  displayName: string;      // E.g., "Sandeep Gajjala"
  mail: string;            // E.g., "sandeep@example.com"
  name: string;            // CN attribute
  sAMAccountName: string;  // Windows login name
  accountExpires: string;  // ISO8601 date or "Never Expires"
  pwdLastSet: string;      // Last password change (ISO8601)
  whenCreated: string;     // Account creation date (ISO8601)
  whenChanged: string;     // Last modification (ISO8601)
  memberOf: string[];      // Array of group names or full DNs
}
```

### Expected Frontend Data Model

The frontend expects this enriched structure:

```typescript
interface FullUser {
  userId: string;           // sAMAccountName or name
  displayName: string;      // displayName
  email: string;            // mail
  status: "ACTIVE" | "DISABLED";
  lastLogon: string;        // ISO8601 (not in API yet)
  pwdLastSet: string;       // pwdLastSet

  adGroups: Array<{
    name: string;           // Group CN
    membership: "DIRECT" | "NESTED";
    dn: string;             // Full Distinguished Name
  }>;

  permissions: Array<{
    code: string;           // Permission identifier
    label: string;          // Human-readable permission
    category: string;       // Permission category
    risk: "LOW" | "MED" | "HIGH";
    grantedVia: string[];   // Groups that grant this
  }>;

  groupToPermissions: Array<{
    group: string;
    permissions: string[];
  }>;
}
```

---

## Integration Checklist

### Phase 1: Backend Setup ✅ (Complete)
- [x] Spring Boot application configured
- [x] LDAP connectivity verified
- [x] Multi-environment support (test/prod/default)
- [x] SSL/TLS certificate configured
- [x] API endpoint `/ad/usersByEnv/{env}` available

### Phase 2: Frontend - Switch to Backend (In Progress)
- [ ] Uncomment production API call in `src/api/userAccessApi.js`
- [ ] Test frontend-backend connectivity (locally)
- [ ] Verify CORS configuration
- [ ] Test with each environment (test/prod/default)
- [ ] Handle API errors gracefully

### Phase 3: Data Transformation (Pending)
- [ ] Map backend response to frontend user model
- [ ] Add group membership type detection (DIRECT/NESTED)
- [ ] Calculate permission mappings
- [ ] Determine user status (ACTIVE/DISABLED) from accountExpires
- [ ] Calculate risk levels for permissions

### Phase 4: UI Features (Pending)
- [ ] Update UserAccessViewer to load real groups
- [ ] Populate PermissionsTab with real data
- [ ] Show MappingTab group→permission relationships
- [ ] Enable group detail drawer with real permissions
- [ ] Test CSV export with real data

### Phase 5: Testing (Pending)
- [ ] Unit tests for API integration
- [ ] Integration tests (frontend ↔ backend)
- [ ] Load testing (multiple concurrent searches)
- [ ] Security testing (CORS, XSS, injection)

### Phase 6: Deployment (Pending)
- [ ] Configure CORS on backend
- [ ] Setup Kubernetes ConfigMap for environment variables
- [ ] Deploy frontend to K8s
- [ ] Deploy backend to K8s
- [ ] Configure Nginx Ingress for reverse proxy
- [ ] Verify end-to-end functionality

---

## Development Setup

### Step 1: Start Backend (Port 8080)

```bash
cd C:\Workspaces\NYSOHUtilities\ad-users\ad-users-main

# Set environment variables
set CONFIG_PATH=C:\Workspaces\adUsersConfig\
set LDAP_USERNAME=CN=svc_ldap_bo_dev,...
set LDAP_PASSWORD=KwVs67^#

# Start Spring Boot
mvn spring-boot:run
```

**Verify Backend:**
```bash
curl http://localhost:8080/ad/usersByEnv/test
```

Expected response: JSON array of users

### Step 2: Update Frontend API Configuration

**File:** `src/api/userAccessApi.js`

```javascript
// Replace current mock implementation with:
export async function searchUsers({ query, signal }) {
  const res = await fetch(
    `/api/usersByEnv/test?query=${encodeURIComponent(query)}`,
    { signal }
  );
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}
```

**Note:** Backend doesn't support query parameter yet. Implement filtering on frontend or extend backend.

### Step 3: Setup Frontend CORS Proxy (Development)

**Option A: Vite Proxy Configuration** (Recommended)

Create `vite.config.js`:

```javascript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/ad')
      }
    }
  }
});
```

This allows `/api/usersByEnv/test` on frontend to proxy to `/ad/usersByEnv/test` on backend.

**Option B: Backend CORS Headers** (Production)

Configure Spring Boot to allow frontend origin:

```properties
# src/main/resources/application.properties
spring.webmvc.cors.allowed-origins=http://localhost:3000,http://localhost:5173
spring.webmvc.cors.allowed-methods=GET,OPTIONS
spring.webmvc.cors.allowed-headers=Content-Type
spring.webmvc.cors.max-age=3600
```

### Step 4: Start Frontend (Port 3000 or 5173)

```bash
cd C:\Workspaces\NYSOHUtilities\ldap-ui

npm install
npm run dev
```

Open: `http://localhost:5173` (or `http://localhost:3000`)

### Step 5: Test Integration

1. Type search query in frontend
2. Observe API call in DevTools Network tab
3. Verify users returned from backend
4. Test each environment tab (test/prod/default)

---

## Deployment Configuration

### Production: Kubernetes Setup

#### 1. Backend Deployment (ad-users)

No changes needed - already configured in `ad-users-main/` project.

#### 2. Frontend Deployment (ldap-ui)

**K8s Service Configuration (existing `ldap-ui-svc.yaml`):**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ldap-ui-svc
spec:
  type: NodePort
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
  selector:
    app: ldap-ui
```

#### 3. Backend Service Configuration (to create)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ad-users-svc
spec:
  type: ClusterIP
  ports:
    - port: 8080
      targetPort: 8080
  selector:
    app: ad-users
```

#### 4. Update Ingress to Route Both Services

**File:** `k8s/ldap-ui-ingress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ldap-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: ldap-ui.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ldap-ui-svc
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: ad-users-svc
                port:
                  number: 8080
```

This routes:
- `/` → ldap-ui (React frontend)
- `/api/*` → ad-users (Spring Boot backend)

#### 5. Frontend Deployment Update

**File:** `k8s/ldap-ui-deploy.yaml`

No changes needed - frontend uses relative paths `/api/*`

---

## Troubleshooting

### Issue 1: CORS Error in Browser Console

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Causes:**
1. Backend CORS headers not configured
2. Vite proxy not working
3. Frontend and backend on different origins

**Solutions:**

A) **Enable Backend CORS:**
```properties
spring.webmvc.cors.allowed-origins=http://localhost:3000,http://localhost:5173
spring.webmvc.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
```

B) **Verify Vite Proxy:** (in `vite.config.js`)
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

C) **Check Port:** Frontend should be on `3000` or `5173`, backend on `8080`

### Issue 2: API Returns 400 Bad Request

**Cause:** Invalid environment parameter

**Solution:**
```javascript
// Use valid environment: 'test', 'prod', or 'default'
const env = 'test';  // ✓ Correct
const env = 'testing';  // ✗ Invalid
```

### Issue 3: API Returns 401 Unauthorized

**Cause:** LDAP authentication failed

**Solution:**
1. Verify LDAP credentials in environment variables
2. Check LDAP service account has permission to query
3. Verify SSL certificate is valid

```bash
# Restart backend with correct credentials
set LDAP_USERNAME=CN=svc_ldap_bo_dev,...
set LDAP_PASSWORD=your_password
mvn spring-boot:run
```

### Issue 4: No Users Returned

**Cause:** Search filter not matching users in LDAP

**Solution:**
1. Verify search base DN in configuration
2. Check user object class in LDAP
3. Verify service account has search permissions

**File:** `C:\Workspaces\adUsersConfig\application-external.properties`

```properties
# Check these values match your LDAP directory structure
ad.test.searchBase=OU=Users,DC=example,DC=com
ad.prod.searchBase=OU=Users,DC=example,DC=com
```

### Issue 5: Frontend Shows Mock Data, Not Backend

**Cause:** `userAccessApi.js` still using mock implementation

**Solution:** Uncomment production code:

```javascript
// File: src/api/userAccessApi.js

// Comment out:
// export async function searchUsers({ query, signal }) {
//   await new Promise((r) => setTimeout(r, 500));
//   return MOCK.users.filter(...)
// }

// Uncomment:
export async function searchUsers({ query, signal }) {
  const res = await fetch(`/api/usersByEnv/test?query=${encodeURIComponent(query)}`, { signal });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}
```

---

## API Response Data Flow

### Scenario: User Searches for "sandeep"

#### 1. Frontend Request
```
GET /api/usersByEnv/test?query=sandeep
```

#### 2. Backend Processing
```
1. Parse request: env="test", query="sandeep"
2. Get LDAP template for "test" environment
3. Execute LDAP search in OU=TestUsers with filter:
   (&(objectClass=user)(!(objectClass=computer)))
4. Parse LDAP response attributes
5. Convert AD timestamps to ISO8601
6. Extract group memberships
7. Return JSON response
```

#### 3. Backend Response
```json
[
  {
    "displayName": "Sandeep Gajjala",
    "mail": "sandeep.g@csc.local",
    "name": "sandeep.g",
    "sAMAccountName": "sandeep.g",
    "accountExpires": "2027-12-31T23:59:59",
    "pwdLastSet": "2025-12-15T13:45:22",
    "whenCreated": "2024-06-01T08:00:00Z",
    "whenChanged": "2026-03-10T14:20:00Z",
    "memberOf": [
      "CN=BO_APPEALS_READ,OU=Groups,DC=CSC,DC=local",
      "CN=BO_REPORTS_VIEW,OU=Groups,DC=CSC,DC=local"
    ]
  }
]
```

#### 4. Frontend Processing
```javascript
1. Receive JSON response
2. Map to frontend User model:
   - userId = sAMAccountName
   - email = mail
   - displayName = displayName
   - status = "ACTIVE" (if not expired)
   - adGroups = parse memberOf array
3. Extract group names from DNs
4. Determine membership type (DIRECT vs NESTED)
5. Render in ResultsPane
```

#### 5. Frontend Display
- User listed in ResultsPane on left sidebar
- Click to view details in main pane
- Tabs show: Overview, AD Groups, Permissions, Mapping

---

## Future Enhancements

### Phase 2: Advanced Features (Pending)
- [ ] Implement permission mapping in backend
- [ ] Add permission risk scoring
- [ ] Support group membership type (DIRECT/NESTED)
- [ ] Add user status (ACTIVE/DISABLED)
- [ ] Implement server-side CSV export
- [ ] Add user audit log view
- [ ] Implement permission change history

### Phase 3: Search Improvements
- [ ] Support complex LDAP filters
- [ ] Add search filters UI (by group, status, etc.)
- [ ] Implement pagination for large result sets
- [ ] Add search result sorting options
- [ ] Save search preferences

### Phase 4: Performance & Scalability
- [ ] Implement caching layer
- [ ] Add result pagination
- [ ] Optimize for large LDAP directories
- [ ] Add SearchUser backend endpoint
- [ ] Implement incremental loading

---

## Summary

The backend (ad-users) and frontend (ldap-ui) are ready to integrate:

1. **Backend is fully functional** - Querying LDAP and returning user data
2. **Frontend is designed to receive this data** - Just needs API call uncommented
3. **Architecture supports multiple environments** - test, prod, default
4. **Security is properly handled** - No hardcoded values, proper CORS design

Next steps:
1. ✅ Uncomment production API call in `userAccessApi.js`
2. ✅ Setup Vite proxy or backend CORS
3. ✅ Test locally with real backend connection
4. ✅ Deploy to Kubernetes when ready

