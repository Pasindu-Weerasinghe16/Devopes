# Terraform (AWS)

Provisions a single EC2 instance for the Devopes app.

## Usage

```bash
cd terraform/aws
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars (set key_name at minimum)
terraform init
terraform apply -auto-approve
terraform output
```

Destroy:

```bash
cd terraform/aws
terraform destroy -auto-approve
```
