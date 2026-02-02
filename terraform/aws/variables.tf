variable "region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Name prefix for AWS resources"
  default     = "devopes"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type"
  default     = "t3.micro"
}

variable "key_name" {
  type        = string
  description = "Existing EC2 key pair name (must already exist in AWS)"
}

variable "ssh_cidr" {
  type        = string
  description = "CIDR allowed to SSH (recommend: your IP/32)"
  default     = "0.0.0.0/0"
}

variable "app_http_cidr" {
  type        = string
  description = "CIDR allowed to access the app HTTP (port 80)"
  default     = "0.0.0.0/0"
}

variable "app_api_cidr" {
  type        = string
  description = "CIDR allowed to access the backend API (port 4000)"
  default     = "0.0.0.0/0"
}

variable "subnet_id" {
  type        = string
  description = "Subnet ID to place the instance in (leave empty to use default VPC first subnet)"
  default     = ""
}
