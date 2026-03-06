
# ldap-ui Kubernetes Deployment Demo

<<<<<<< HEAD
This project demonstrates how to take a React application and deploy it using a modern container-based architecture.

Local React App → Docker Container → Docker Hub → Kubernetes Deployment → Service → Ingress → Load Balanced Pods.

The purpose of this project is to understand containerization, orchestration, networking, and scaling in Kubernetes.

---

# Architecture Overview

=======
This repository demonstrates how to deploy a **React (Vite) application** using a modern container architecture:

React App → Docker Image → Docker Hub → Kubernetes Deployment → Service → Ingress → Load Balanced Pods

The goal of this project is to learn **containerization, orchestration, networking, scaling, and self‑healing** in Kubernetes.

---

# High Level Architecture

```
>>>>>>> 697c414 (Add detailed Kubernetes architecture and deployment documentation)
                ┌───────────────┐
                │    Browser     │
                └───────┬───────┘
                        │
                        ▼
                ldap-ui.local
                        │
                        ▼
              ┌─────────────────┐
              │  Ingress (NGINX) │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   Service       │
              │  ldap-ui-svc    │
              └────────┬────────┘
                       │
           ┌───────────┼───────────┐
           ▼           ▼           ▼
        ┌───────┐  ┌───────┐  ┌───────┐
        │ Pod 1 │  │ Pod 2 │  │ Pod 3 │
        └───┬───┘  └───┬───┘  └───┬───┘
            │           │           │
            ▼           ▼           ▼
          NGINX       NGINX       NGINX
            │           │           │
            ▼           ▼           ▼
        React App   React App   React App
<<<<<<< HEAD
=======
```

---

# Kubernetes Cluster Architecture

```
                Kubernetes Cluster
                ──────────────────

        ┌──────────────────────────────┐
        │        Control Plane         │
        │                              │
        │  API Server                  │
        │  Scheduler                   │
        │  Controller Manager          │
        │  etcd (cluster state DB)     │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │          Worker Node         │
        │                              │
        │   kubelet                    │
        │   kube-proxy                 │
        │   container runtime          │
        │                              │
        │   ┌───────┐ ┌───────┐        │
        │   │ Pod 1 │ │ Pod 2 │        │
        │   └───────┘ └───────┘        │
        └──────────────────────────────┘
```

---

# Request Flow Explained

When a user opens the application:

```
1 Browser sends request
        │
        ▼
2 Ingress receives HTTP request
        │
        ▼
3 Ingress forwards to Service
        │
        ▼
4 Service load balances traffic
        │
        ▼
5 One of the Pods receives request
        │
        ▼
6 NGINX serves the React application
```
>>>>>>> 697c414 (Add detailed Kubernetes architecture and deployment documentation)

---

# Technology Stack

<<<<<<< HEAD
Frontend: React + Vite  
Containerization: Docker  
Container Registry: Docker Hub  
Orchestration: Kubernetes  
Networking: Kubernetes Service, NGINX Ingress Controller

---

# Project Structure

ldap-ui
│
├── src/
├── public/
=======
Frontend  
React + Vite

Containerization  
Docker

Container Registry  
Docker Hub

Orchestration  
Kubernetes

Networking  
Kubernetes Service  
NGINX Ingress Controller

---

# Repository Structure

```
ldap-ui
│
├── src/
│    └── React source code
│
├── public/
│
>>>>>>> 697c414 (Add detailed Kubernetes architecture and deployment documentation)
├── Dockerfile
├── package.json
├── vite.config.js
│
├── k8s/
│    ├── ldap-ui-deploy.yaml
│    ├── ldap-ui-svc.yaml
│    └── ldap-ui-ingress.yaml
│
├── docs/
│
└── README.md
<<<<<<< HEAD
=======
```
>>>>>>> 697c414 (Add detailed Kubernetes architecture and deployment documentation)

---

# Docker

Build image

<<<<<<< HEAD
docker build -t ldap-ui:1.0 .

Run locally

docker run -p 3000:80 ldap-ui:1.0

Open

http://localhost:3000

---

# Push to Docker Hub

docker tag ldap-ui:1.0 gajjalasandeep/ldap-ui:1.0

docker push gajjalasandeep/ldap-ui:1.0
=======
```
docker build -t ldap-ui:1.0 .
```

Run locally

```
docker run -p 3000:80 ldap-ui:1.0
```

Access

```
http://localhost:3000
```

Port mapping

```
3000 → host port
80   → container NGINX port
```

---

# Push Image to Docker Hub

```
docker tag ldap-ui:1.0 gajjalasandeep/ldap-ui:1.0
docker push gajjalasandeep/ldap-ui:1.0
```

Docker Hub repository

```
https://hub.docker.com/r/gajjalasandeep/ldap-ui
```
>>>>>>> 697c414 (Add detailed Kubernetes architecture and deployment documentation)

---

# Kubernetes Deployment

<<<<<<< HEAD
kubectl apply -f k8s/ldap-ui-deploy.yaml

Check pods

kubectl get pods
=======
```
kubectl apply -f k8s/ldap-ui-deploy.yaml
```

Verify pods

```
kubectl get pods
```

Expected

```
ldap-ui-xxxx   Running
ldap-ui-xxxx   Running
ldap-ui-xxxx   Running
```
>>>>>>> 697c414 (Add detailed Kubernetes architecture and deployment documentation)

---

# Kubernetes Service

<<<<<<< HEAD
kubectl apply -f k8s/ldap-ui-svc.yaml

kubectl get svc
=======
```
kubectl apply -f k8s/ldap-ui-svc.yaml
kubectl get svc
```

Service distributes traffic across pods.

```
Service
  │
 ├── Pod 1
 ├── Pod 2
 └── Pod 3
```
>>>>>>> 697c414 (Add detailed Kubernetes architecture and deployment documentation)

---

# Kubernetes Ingress

<<<<<<< HEAD
kubectl apply -f k8s/ldap-ui-ingress.yaml

kubectl get ingress

---

# Local Domain Setup

Edit

C:\Windows\System32\drivers\etc\hosts

Add

127.0.0.1 ldap-ui.local

Open

http://ldap-ui.local

---

# Kubernetes Self Healing

kubectl delete pod <pod-name>

Deployment automatically recreates it.
=======
```
kubectl apply -f k8s/ldap-ui-ingress.yaml
kubectl get ingress
```

Domain used

```
ldap-ui.local
```

---

# Local Domain Configuration

Edit hosts file

Windows

```
C:\Windows\System32\drivers\etc\hosts
```

Add

```
127.0.0.1 ldap-ui.local
```

Then open

```
http://ldap-ui.local
```

---

# Kubernetes Self Healing Demo

Delete a pod

```
kubectl delete pod <pod-name>
```

Deployment controller automatically recreates it.

```
Pod deleted
     │
Deployment detects missing pod
     │
New pod created
```

---

# Load Balancing Demo

Traffic distributed across pods.

```
Browser
   │
Service
   │
 ├── Pod 1
 ├── Pod 2
 └── Pod 3
```

Benefits

High availability  
Fault tolerance  
Scalability
>>>>>>> 697c414 (Add detailed Kubernetes architecture and deployment documentation)

---

# Learning Outcomes

<<<<<<< HEAD
Containerizing React apps  
Publishing Docker images  
Running containers in Kubernetes  
Service load balancing  
Ingress routing  
Kubernetes self healing
=======
This project demonstrates

• Containerizing React applications  
• Publishing images to Docker Hub  
• Deploying containers to Kubernetes  
• Service based load balancing  
• Ingress based routing  
• Kubernetes self‑healing  
>>>>>>> 697c414 (Add detailed Kubernetes architecture and deployment documentation)

---

# Author

<<<<<<< HEAD
Sandeep Gajjala
=======
Sandeep Gajjala
>>>>>>> 697c414 (Add detailed Kubernetes architecture and deployment documentation)
