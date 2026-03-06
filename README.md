
# ldap-ui Kubernetes Deployment Demo

This project demonstrates how to deploy a **React (Vite) application** using a modern container-based architecture.

Pipeline:

Developer → Docker Build → Docker Hub → Kubernetes Deployment → Pods → Service → Ingress → Browser

The goal of this project is to understand **containerization, orchestration, networking, scaling, and debugging in Kubernetes**.

---

# DevOps Deployment Pipeline

```
Developer
   │
   ▼
Docker Build
   │
   ▼
Docker Image
   │
   ▼
Docker Hub
   │
   ▼
Kubernetes Deployment
   │
   ▼
Pods
   │
   ▼
Service
   │
   ▼
Ingress
   │
   ▼
Browser
```

---

# High Level Architecture

```
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
```

---

# Kubernetes Cluster Architecture

```
                    Kubernetes Cluster
                    ──────────────────

        ┌────────────────────────────────────┐
        │            Control Plane           │
        │                                    │
        │  API Server                        │
        │  Scheduler                         │
        │  Controller Manager                │
        │  etcd (cluster state database)     │
        └───────────────┬────────────────────┘
                        │
                        ▼
        ┌────────────────────────────────────┐
        │             Worker Node            │
        │                                    │
        │  kubelet                           │
        │  kube-proxy                        │
        │  container runtime                 │
        │                                    │
        │     ┌─────────┐   ┌─────────┐      │
        │     │  Pod 1  │   │  Pod 2  │      │
        │     └─────────┘   └─────────┘      │
        │                                    │
        │     ┌─────────┐                    │
        │     │  Pod 3  │                    │
        │     └─────────┘                    │
        └────────────────────────────────────┘
```

---

# Technology Stack

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
├── public/
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
```

---

# Docker

Build image

docker build -t ldap-ui:1.0 .

Run locally

docker run -p 3000:80 ldap-ui:1.0

Open

http://localhost:3000

Port mapping

3000 → host port  
80 → container NGINX port

---

# Push Image to Docker Hub

docker tag ldap-ui:1.0 gajjalasandeep/ldap-ui:1.0

docker push gajjalasandeep/ldap-ui:1.0

Docker Hub

https://hub.docker.com/r/gajjalasandeep/ldap-ui

---

# Kubernetes Deployment

kubectl apply -f k8s/ldap-ui-deploy.yaml

Check pods

kubectl get pods

Expected

ldap-ui-xxxxx Running

---

# Kubernetes Service

kubectl apply -f k8s/ldap-ui-svc.yaml

kubectl get svc

Service load balances traffic across pods.

---

# Kubernetes Ingress

kubectl apply -f k8s/ldap-ui-ingress.yaml

kubectl get ingress

Domain used

ldap-ui.local

---

# Local Domain Configuration

Edit hosts file

C:\Windows\System32\drivers\etc\hosts

Add

127.0.0.1 ldap-ui.local

Then open

http://ldap-ui.local

---

# Request Flow Debugging

Check running pods

kubectl get pods

Describe pod

kubectl describe pod <pod-name>

Check service endpoints

kubectl get endpoints ldap-ui-svc

Example

10.1.0.21:80  
10.1.0.22:80  
10.1.0.23:80  

Check ingress

kubectl describe ingress ldap-ui-ingress

View logs

kubectl logs <pod-name>

---

# Kubernetes Self Healing

Delete a pod

kubectl delete pod <pod-name>

Deployment controller recreates it automatically.

---

# Load Balancing

Traffic distributed across pods

Browser
   │
Service
   │
├── Pod 1
├── Pod 2
└── Pod 3

Benefits

High availability  
Fault tolerance  
Scalability

---

# Learning Outcomes

Containerizing React applications  
Publishing Docker images  
Deploying containers in Kubernetes  
Service-based load balancing  
Ingress-based HTTP routing  
Kubernetes self-healing

---

# Author

Sandeep Gajjala
