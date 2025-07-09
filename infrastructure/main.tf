terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

# EC2 Monitoring Module
module "ec2_monitoring" {
  source = "./modules/ec2_monitoring"
  
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  security_groups = [module.vpc.default_security_group_id]
}

# RDS Monitoring Module
module "rds_monitoring" {
  source = "./modules/rds_monitoring"
  
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  security_groups = [module.vpc.default_security_group_id]
}

# EKS Monitoring Module
module "eks_monitoring" {
  source = "./modules/eks_monitoring"
  
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  security_groups = [module.vpc.default_security_group_id]
}

# IAM Module
module "iam" {
  source = "./modules/iam"
  
  environment = var.environment
}

# CloudWatch Module
module "cloudwatch" {
  source = "./modules/cloudwatch"
  
  environment = var.environment
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "ec2_monitoring_role_arn" {
  description = "EC2 monitoring IAM role ARN"
  value       = module.iam.ec2_monitoring_role_arn
}

output "rds_monitoring_role_arn" {
  description = "RDS monitoring IAM role ARN"
  value       = module.iam.rds_monitoring_role_arn
}

output "eks_monitoring_role_arn" {
  description = "EKS monitoring IAM role ARN"
  value       = module.iam.eks_monitoring_role_arn
} 