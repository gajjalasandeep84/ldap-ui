
# ldap-ui Kubernetes Deployment Demo

This project demonstrates how to take a React application and deploy it using a modern container-based architecture.

Local React App → Docker Container → Docker Hub → Kubernetes Deployment → Service → Ingress → Load Balanced Pods.

The purpose of this project is to understand containerization, orchestration, networking, and scaling in Kubernetes.

---

# Architecture Overview

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

---

# Technology Stack

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

---

# Docker

Build image

docker build -t ldap-ui:1.0 .

Run locally

docker run -p 3000:80 ldap-ui:1.0

Open

http://localhost:3000

---

# Push to Docker Hub

docker tag ldap-ui:1.0 gajjalasandeep/ldap-ui:1.0

docker push gajjalasandeep/ldap-ui:1.0

---

# Kubernetes Deployment

kubectl apply -f k8s/ldap-ui-deploy.yaml

Check pods

kubectl get pods

---

# Kubernetes Service

kubectl apply -f k8s/ldap-ui-svc.yaml

kubectl get svc

---

# Kubernetes Ingress

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

---

# Learning Outcomes

Containerizing React apps  
Publishing Docker images  
Running containers in Kubernetes  
Service load balancing  
Ingress routing  
Kubernetes self healing

---

# Author

Sandeep Gajjala
