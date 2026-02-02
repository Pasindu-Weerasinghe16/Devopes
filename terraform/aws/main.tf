provider "aws" {
  region = var.region
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

locals {
  chosen_subnet_id = var.subnet_id != "" ? var.subnet_id : data.aws_subnets.default.ids[0]
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_security_group" "app" {
  name        = "${var.project_name}-app-sg"
  description = "Security group for Devopes app server"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    protocol    = "tcp"
    from_port   = 22
    to_port     = 22
    cidr_blocks = [var.ssh_cidr]
  }

  ingress {
    description = "HTTP (frontend)"
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = [var.app_http_cidr]
  }

  ingress {
    description = "Backend API"
    protocol    = "tcp"
    from_port   = 4000
    to_port     = 4000
    cidr_blocks = [var.app_api_cidr]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-app-sg"
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = local.chosen_subnet_id
  associate_public_ip_address = true
  vpc_security_group_ids = [aws_security_group.app.id]

  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Keep bootstrap minimal; Ansible installs Docker + Compose reliably.
    apt-get update -y
    apt-get install -y ca-certificates curl
  EOF

  tags = {
    Name = "${var.project_name}-app"
  }
}
