# Devopes

React (frontend) + Node/Express (backend) + MongoDB, Dockerized.

This repo also includes a full AWS deployment pipeline:

`git push`  Jenkins (WSL)  Docker build + push (Docker Hub)  Terraform (EC2)  Ansible (install Docker + deploy via docker compose)

## Quick links

- Local development: see `DEVELOPMENT.md`
- Full step-by-step AWS + Jenkins + WSL guide: see `DEPLOY_AWS_JENKINS_WSL.md`

## What we implemented (high level)

- **Terraform** in `terraform/aws/`
  - Provisions 1 Ubuntu 22.04 EC2 instance + Security Group
  - Outputs `app_public_ip` and `app_public_dns`
  - Default region is `us-east-1` (can be changed via `-var region=...` or `terraform.tfvars`)

- **Ansible** in `ansible/`
  - Installs Docker Engine + Compose plugin from Docker official apt repo
  - Deploys `docker-compose.prod.yml` to `/opt/devopes` on EC2
  - Cleans old images before pulling new ones (`docker image prune -af`)

- **Jenkins pipeline** in `Jenkinsfile`
  - Builds FE/BE images and tags them with the current git short SHA
  - Pushes to Docker Hub as `${DOCKERHUB_USER}/devopes-fe:<sha>` and `${DOCKERHUB_USER}/devopes-be:<sha>`
  - Runs `terraform apply`, captures the EC2 public IP
  - Runs `ansible-playbook` and deploys the new images to the EC2 host

## Repository layout

- `Back-end/`  Express API (port 4000)
- `Frount-end/`  React build served by Nginx (port 80 in production, port 3000 in dev compose)
- `docker-compose.dev.yml`  development stack (builds locally)
- `docker-compose.prod.yml`  production stack (pulls images from Docker Hub)
- `terraform/aws/`  AWS infrastructure (EC2 + SG)
- `ansible/playbooks/deploy.yml`  provisioning + deployment on EC2
- `Jenkinsfile`  CI/CD pipeline

## One-time setup (required)

### 1) Install tools inside WSL (where Jenkins runs)

You need:

- Docker (usually via Docker Desktop WSL integration)
- Terraform
- Ansible
- AWS CLI

Verify:

```bash
terraform -version
ansible --version
docker --version
aws --version
```

### 2) AWS EC2 key pair (PEM)

Create a key pair in AWS Console and download the `.pem`. Example name: `devopes-key`.

Copy into WSL:

```bash
mkdir -p ~/.ssh
cp "/mnt/c/Users/<YOUR_WINDOWS_USER>/Downloads/devopes-key.pem" ~/.ssh/devopes-key.pem
chmod 600 ~/.ssh/devopes-key.pem
```

### 3) Jenkins credentials (IDs must match)

In Jenkins: **Manage Jenkins  Credentials  (Global)** add:

- Docker Hub token/password
  - Type: `Secret text`
  - ID: `docker-secret`

- AWS access keys (simple option)
  - Type: `Secret text`
  - ID: `aws-access-key-id`
  - Type: `Secret text`
  - ID: `aws-secret-access-key`

- EC2 SSH private key (for Ansible)
  - Type: `SSH Username with private key`
  - ID: `aws-ec2-ssh-key`
  - Username: `ubuntu`
  - Private key: paste your `.pem`

### 4) Create Jenkins pipeline job

- New Item  **Pipeline**
- Pipeline script from SCM  Git
- Branch: `main`
- Script path: `Jenkinsfile`

### 5) GitHub webhook (push  Jenkins)

In the Jenkins job config enable:
- **GitHub hook trigger for GITScm polling**

In GitHub repo:
- Settings  Webhooks  Add webhook
- Payload URL:
  - If Jenkins is public: `http://YOUR_JENKINS_HOST:8080/github-webhook/`
  - If Jenkins is local in WSL: use a tunnel URL (ngrok / Cloudflare) like `https://xxxxx.ngrok-free.app/github-webhook/`
- Content type: `application/json`
- Events: **Just the push event**

## Deploying new changes (every time)

This is the correct workflow to see updates:

1) Make a code change.
2) Commit + push:

```bash
git status
git add .
git commit -m "Update UI"
git push
```

3) Jenkins runs automatically via webhook.
4) In Jenkins console output, confirm:
   - It builds & pushes a **new tag** (the tag is the git SHA)
   - The **Deploy with Ansible** stage runs
5) Open the app:
   - Frontend: `http://<EC2_PUBLIC_IP>/`
   - Backend: `http://<EC2_PUBLIC_IP>:4000/`

Important: If you push but there is **no new commit** (same git SHA), the Docker image tag is the same and you will not see changes.

## After PC OFF/ON (daily restart checklist)

When your laptop restarts, GitHub cannot trigger Jenkins until Jenkins + tunnel are running again.

### 1) Start Docker Desktop (Windows)

- Open Docker Desktop
- Ensure **WSL Integration** for Ubuntu is enabled

### 2) Open WSL and go to project

```bash
cd ~/Devopes
```

### 3) Start Jenkins

How you start Jenkins depends on how you installed it.

First check if Jenkins is already running:

```bash
curl -I http://localhost:8080/login
```

If you installed Jenkins as a service (systemd enabled in WSL):

```bash
sudo systemctl start jenkins
sudo systemctl status jenkins --no-pager
```

If you run Jenkins in Docker (example container name `jenkins`):

```bash
docker ps -a | grep jenkins
docker start jenkins
```

Then verify again:

```bash
curl -I http://localhost:8080/login
```

### 4) Start a tunnel for GitHub webhooks (ngrok or Cloudflare)

GitHub webhooks cannot reach `localhost`, so you must expose Jenkins.

#### Option A: ngrok

One-time:

```bash
ngrok config add-authtoken <YOUR_NGROK_TOKEN>
```

Every restart:

```bash
ngrok http 8080
```

Copy the **Forwarding** HTTPS URL (example: `https://xxxxx.ngrok-free.app`).

Update GitHub webhook Payload URL to:

`https://xxxxx.ngrok-free.app/github-webhook/`

#### Option B: Cloudflare Tunnel (no rotating URL)

If you use Cloudflare Tunnel, you can get a stable URL.

Typical flow (high level):

```bash
cloudflared login
cloudflared tunnel create devopes-jenkins
cloudflared tunnel route dns devopes-jenkins <YOUR_SUBDOMAIN>
cloudflared tunnel run devopes-jenkins --url http://localhost:8080
```

## Checking what is deployed on EC2

SSH to the instance:

```bash
ssh -i ~/.ssh/devopes-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Then verify:

```bash
sudo cat /opt/devopes/.env
sudo docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

The `.env` should show the latest `IMAGE_TAG=<gitsha>`.

## Common problems / fixes

###  "I pushed but I can’t see new updates"

Most common causes:

1) **No new commit** (same SHA)
   - Fix: ensure you actually committed changes before pushing.

2) **Browser cache**
   - Fix: hard refresh (`Ctrl+F5`) or use Incognito.

3) **Containers still running old image tag**
   - Fix: SSH to EC2 and check `/opt/devopes/.env` and `docker ps` (commands above).

###  "permission denied" for Docker on EC2

Use `sudo docker ...`.

If you want to avoid sudo (optional):

```bash
sudo usermod -aG docker ubuntu
newgrp docker
```

Log out and back in.

###  "Terraform created an IP but I can’t see the instance in AWS Console"

Almost always one of these:

- Wrong **AWS region** (default is `us-east-1` in `terraform/aws/variables.tf`)
- Wrong **AWS account** (Jenkins credentials are for a different account)

Quick checks (inside WSL where Jenkins runs):

```bash
aws sts get-caller-identity
aws configure list
```

In AWS Console, switch to the same region and ensure it’s the same account.

## IPs / URLs (fill this table)

Keep your current deployment addresses here so you don’t lose them.

| Name | Where it comes from | Value |
|------|----------------------|-------|
| Jenkins (local) | Always | http://localhost:8080 |
| Jenkins webhook URL | ngrok / Cloudflare | https://<YOUR_TUNNEL_HOST>/github-webhook/ |
| AWS EC2 Public IP | Terraform output `app_public_ip` | <FILL_ME> |
| AWS EC2 Public DNS | Terraform output `app_public_dns` | <FILL_ME> |
| Frontend URL | EC2 IP | http://<EC2_PUBLIC_IP>/ |
| Backend URL | EC2 IP | http://<EC2_PUBLIC_IP>:4000/ |

How to get the EC2 IP from Terraform (from the same workspace where terraform state exists):

```bash
cd terraform/aws
terraform output app_public_ip
terraform output app_public_dns
```

How to get the EC2 IP from a Jenkins workspace (from the pipeline run):

- Jenkins stores it in `.app_ip` during the run.

---

If you want, I can also add a small `scripts/` helper (like `scripts/start-jenkins.sh` + `scripts/start-ngrok.sh`) so after reboot you just run 2 commands.
