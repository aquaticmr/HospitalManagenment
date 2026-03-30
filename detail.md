This prompt is optimized for the **H2 (In-memory) setup**. It tells the AI exactly how to configure the database so it works inside a container without any extra setup, and it ensures the GitHub Actions workflow handles the build because you don't have Docker locally.

Copy and paste this into your AI:

***

### **The "H2-Simplicity" Hospital System Prompt**

"I want to build a **Hospital Management System** using **Spring Boot (Java 17)** and **React (Vite + Tailwind CSS)**. 

**Infrastructure Constraints:**
1. **No Local Docker:** All Docker images must be built and pushed using **GitHub Actions**.
2. **Database:** Use **H2 In-Memory Database** (no external Postgres) to simplify the initial cloud deployment.
3. **Deployment:** Deploy to **AWS EKS** (Cluster name: `hospital-cluster`).
4. **Domain:** I will point my **Hostinger Domain** to the AWS Load Balancer URL.

**Please provide the complete code for:**

### **1. Folder Structure**
Create three main folders: `/backend`, `/frontend`, and `/k8s`.

### **2. Backend (Spring Boot)**
*   **Dependencies:** Spring Web, Spring Data JPA, H2 Database, Spring Security, JWT.
*   **Features:** 
    *   **Role-Based Access:** 'DOCTOR' and 'PATIENT' roles.
    *   **Logic:** Doctors can set availability slots. Patients can view doctors and book those slots. Doctors can 'Approve' or 'Reject' appointments.
    *   **H2 Config:** Configure `application.properties` for an in-memory database with the H2 console enabled and accessible at `/h2-console`.
    *   **CORS:** Enable CORS so the React frontend (running on a different URL) can call the API.
    *   **Dockerfile:** A multi-stage Dockerfile to build the JAR and run it on OpenJDK 17.

### **3. Frontend (React + Vite)**
*   **Styling:** Use **Tailwind CSS**.
*   **UI Components:** 
    *   Login/Register page with a role selector.
    *   **Patient Dashboard:** Searchable list of doctors and a slot-booking system.
    *   **Doctor Dashboard:** A screen to manage their own time slots and a table to see appointment requests.
*   **API Connection:** Use Axios. Ensure the Backend URL is read from an environment variable (`VITE_API_URL`).
*   **Dockerfile:** A multi-stage Dockerfile using Nginx to serve the build.

### **4. GitHub Actions CI/CD**
*   Provide `.github/workflows/deploy.yml`. 
*   It should: 
    1. Build and push the backend/frontend images to Docker Hub (use secrets `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`).
    2. Configure AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`).
    3. Update the `kubeconfig` for `hospital-cluster`.
    4. Apply the Kubernetes manifests.

### **5. Kubernetes (EKS Manifests)**
*   **backend.yaml:** Deployment and a **Service (Type: LoadBalancer)** so I can get a public API URL.
*   **frontend.yaml:** Deployment and a **Service (Type: LoadBalancer)** so I can point my Hostinger domain to it.

Please ensure the code is production-ready for a student project and all files are clearly labeled with their directory paths."

***

### **Your Execution Checklist (Once you have the code):**

1.  **GitHub Secrets:**
    Go to your GitHub Repository -> Settings -> Secrets -> Actions. Add these:
    *   `DOCKERHUB_USERNAME`
    *   `DOCKERHUB_TOKEN`
    *   `AWS_ACCESS_KEY_ID`
    *   `AWS_SECRET_ACCESS_KEY`
    *   `AWS_REGION` (e.g., `us-east-1`)

2.  **AWS EKS Setup:**
    Open AWS CloudShell (the terminal icon in the top right of your AWS console) and run this one command to create your cluster:
    ```bash
    eksctl create cluster --name hospital-cluster --region us-east-1 --nodes 2 --node-type t3.medium
    ```

3.  **The "URL Update" Step (Crucial):**
    *   After your first GitHub Action runs, you will have two Load Balancers in AWS.
    *   Run `kubectl get svc` in AWS CloudShell.
    *   **Backend URL:** Copy the `EXTERNAL-IP` for `backend-service`.
    *   **Frontend URL:** Copy the `EXTERNAL-IP` for `frontend-service`.
    *   **Crucial:** You must go back to your React code (or K8s config) and update the `VITE_API_URL` to point to the **Backend's External IP**, then push to GitHub again.

4.  **Hostinger:**
    *   Go to Hostinger DNS.
    *   Add a **CNAME** record.
    *   **Host:** `www`
    *   **Target:** Paste the **Frontend's External IP** (The long Amazon URL).

Now, when you visit `www.yourdomain.com`, you will see your Hospital Management System live!