# 🏥 MediCare – Hospital Management System

A full-stack Hospital Management System with **Spring Boot** backend and **React** (Vite + Tailwind) frontend, deployed to **AWS EKS** via **GitHub Actions**.

## 📁 Project Structure
```
HospitalManagenment/
├── backend/              # Spring Boot (Java 17)
├── frontend/             # React + Vite + Tailwind CSS
├── k8s/                  # Kubernetes manifests (EKS)
│   ├── backend.yaml
│   └── frontend.yaml
└── .github/workflows/    # GitHub Actions CI/CD
    └── deploy.yml
```

## 🚀 Local Development

### Prerequisites
- Java 17 + Maven
- Node.js 20+

### Run Backend
```bash
cd backend
mvn spring-boot:run
# API: http://localhost:8080
# H2 Console: http://localhost:8080/h2-console
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register |
| POST | `/api/auth/login` | ❌ | Login (returns JWT) |
| GET | `/api/patient/doctors` | ✅ PATIENT | List doctors |
| GET | `/api/patient/doctors/{id}/slots` | ✅ PATIENT | Available slots |
| POST | `/api/patient/book/{slotId}` | ✅ PATIENT | Book slot |
| GET | `/api/patient/appointments` | ✅ PATIENT | My appointments |
| POST | `/api/doctor/slots` | ✅ DOCTOR | Add slot |
| GET | `/api/doctor/slots` | ✅ DOCTOR | My slots |
| DELETE | `/api/doctor/slots/{id}` | ✅ DOCTOR | Delete slot |
| GET | `/api/doctor/appointments` | ✅ DOCTOR | View requests |
| PUT | `/api/doctor/appointments/{id}` | ✅ DOCTOR | Approve/Reject |

## ☁️ Deployment (AWS EKS)

### 1. GitHub Secrets Required
Go to **Settings → Secrets → Actions** and add:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g., `us-east-1`)

### 2. Create EKS Cluster (AWS CloudShell)
```bash
eksctl create cluster --name hospital-cluster --region us-east-1 --nodes 2 --node-type t3.medium
```

### 3. Push to `main` branch → GitHub Actions deploys automatically

### 4. Get Load Balancer URLs
```bash
kubectl get svc
```
Copy `EXTERNAL-IP` for `backend-service` and update `VITE_API_URL` in the workflow, then push again.

### 5. Point Hostinger Domain
Add a **CNAME** record → Host: `www`, Target: Frontend Load Balancer URL.
