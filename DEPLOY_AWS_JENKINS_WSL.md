# Deploy to AWS using WSL + Jenkins + Terraform + Ansible + Docker Hub

Goal: when you `git push` to GitHub, Jenkins runs automatically:
1) Build Docker images (frontend + backend)
2) Push images to Docker Hub
3) Provision/update an EC2 server (Terraform)
4) Deploy containers to EC2 (Ansible + `docker compose`)

This repo already contains:
- `docker-compose.prod.yml` (production compose pulling images from Docker Hub)
- `terraform/aws/` (creates 1 EC2 + security group)
- `ansible/playbooks/deploy.yml` (cleans old images + deploys)
- `Jenkinsfile` (pipeline)

---

## Step 0 — Check tools in WSL (where Jenkins runs)

Run these commands (expected: versions print, no errors):

```bash
terraform -version
ansible --version
docker --version
aws --version
```

Expected output example:
- `Terraform v1.x.x`
- `ansible [core 2.x.x]`
- `Docker version ...`
- `aws-cli/2.x.x ...`

If `docker` fails inside WSL, enable Docker Desktop → WSL Integration.

---

## Step 1 — Create and download the EC2 SSH key pair (.pem)

You need a key pair so Ansible can SSH into the EC2 server.

### 1.1 Create key pair (AWS Console)
1) AWS Console → EC2
2) **Network & Security → Key pairs**
3) **Create key pair**
4) Name: `devopes-key` (example)
5) Type: `RSA`
6) Format: **PEM**
7) Click **Create key pair** → downloads `devopes-key.pem`

Expected result:
- You can see the key pair name in EC2 → Key pairs.
- You have the file `devopes-key.pem` on your computer.

Important:
- AWS lets you download the `.pem` only once. If you lose it, create a new key pair.

### 1.2 Copy `.pem` into WSL and fix permissions
If the file is in Windows Downloads:

```bash
mkdir -p ~/.ssh
cp "/mnt/c/Users/ASUS/Downloads/devopes-key.pem" ~/.ssh/devopes-key.pem
chmod 600 ~/.ssh/devopes-key.pem
ls -l ~/.ssh/devopes-key.pem
```

Expected output:
- Permissions look like `-rw-------`.

---

## Step 2 — Configure Jenkins credentials (one-time)

Jenkins → **Manage Jenkins → Credentials → (Global)** add:

### 2.1 Docker Hub token
- Type: **Secret text**
- ID: `docker-secret`
- Value: your Docker Hub access token/password

### 2.2 AWS keys (simple project option)
If Jenkins is not using an IAM Role, add:
- **Secret text** ID `aws-access-key-id`
- **Secret text** ID `aws-secret-access-key`

Expected result:
- Jenkins pipeline can run `terraform apply` without “AccessDenied”.

### 2.3 EC2 SSH private key (for Ansible)
- Type: **SSH Username with private key**
- ID: `aws-ec2-ssh-key`
- Username: `ubuntu` (for Ubuntu 22.04)
- Private key: paste `devopes-key.pem`

Expected result:
- Jenkins can SSH to EC2 during the Ansible stage.

---

## Step 3 — Terraform configuration (AWS)

### 3.1 Choose safe CIDRs (recommended)
Create a local file (do NOT commit) `terraform/aws/terraform.tfvars`:

```hcl
ssh_cidr      = "YOUR_PUBLIC_IP/32"
app_http_cidr = "0.0.0.0/0"
app_api_cidr  = "YOUR_PUBLIC_IP/32"
```

Expected result:
- Only you can SSH (22) and access the API (4000).

### 3.2 Required Jenkins parameter
Your Jenkins pipeline requires the EC2 key pair name:
- `EC2_KEY_NAME` must match the key pair name in AWS (example: `devopes-key`).

---

## Step 4 — Create the Jenkins Pipeline job

1) Jenkins → **New Item** → **Pipeline**
2) Select **Pipeline script from SCM**
3) SCM: Git
4) Repo URL: your GitHub repo
5) Branch: `main`
6) Script Path: `Jenkinsfile`
7) Save

Expected result:
- Job loads pipeline stages from repo.

---

## Step 5 — Make GitHub “git push” trigger Jenkins

You have 2 options.

### Option A (recommended): GitHub webhook to Jenkins
Works only if GitHub can reach your Jenkins URL.

GitHub repo → **Settings → Webhooks → Add webhook**
- Payload URL: `http://YOUR_PUBLIC_JENKINS_HOST:8080/github-webhook/`
- Content type: `application/json`
- Events: **Just the push event**

In Jenkins job config enable:
- **GitHub hook trigger for GITScm polling**

Expected result:
- You push to GitHub → build starts automatically.

### Option B: If Jenkins is only inside WSL on your laptop
GitHub cannot reach `localhost`.
Use one of:
- ngrok (`ngrok http 8080`)
- Cloudflare Tunnel
- Run Jenkins on an EC2 instance

Expected result:
- Webhook uses the public tunnel URL.

---

## Step 6 — First run (manual) + expected outputs

Run the Jenkins job once manually:
- `EC2_KEY_NAME` = your key pair name (example: `devopes-key`)
- `SSH_USER` = `ubuntu`

Expected outputs in Jenkins console:
- Docker builds and pushes:
	- `docker push .../devopes-fe:<gitsha>`
	- `docker push .../devopes-be:<gitsha>`
- Terraform apply:
	- output includes EC2 public IP
- Ansible deploy:
	- `docker image prune -af`
	- `docker compose pull`
	- `docker compose up -d`

After success, open:
- Frontend: `http://EC2_PUBLIC_IP/`
- Backend: `http://EC2_PUBLIC_IP:4000/`

---

## What “clean old images before deploy” means here

The Ansible playbook does:
- Stop the running stack: `docker compose down`
- Remove unused images: `docker image prune -af`
- Pull new images: `docker compose pull`
- Start containers: `docker compose up -d`

This prevents the EC2 disk filling up over multiple deployments.

---

## Notes

- For production, use remote Terraform state (S3 + DynamoDB lock). For LMS/simple project, local Jenkins workspace state is OK.
- Frontend API calls now use `http://<current-hostname>:4000` by default, so the same build works on AWS.
