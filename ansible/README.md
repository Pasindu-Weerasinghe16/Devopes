# Ansible

This folder deploys the application to an AWS EC2 host using `docker compose` and Docker Hub images.

## Run manually

```bash
cd ansible
ansible-playbook playbooks/deploy.yml
```

The inventory is in `ansible/inventory/hosts.ini`.

## Variables

The deploy playbook reads these environment variables (useful in Jenkins):
- `DOCKERHUB_USER` (default: `dockerpasindu`)
- `IMAGE_TAG` (default: `latest`)
