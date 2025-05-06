# Farm2Fork Deployment Guide

## Table of Contents
- [Introduction](#introduction)
- [System Requirements](#system-requirements)
- [Environment Setup](#environment-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [External Services Configuration](#external-services-configuration)
- [Continuous Integration/Continuous Deployment](#continuous-integrationcontinuous-deployment)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

## Introduction

This guide provides detailed instructions for deploying the Farm2Fork application to production environments. It covers both manual deployment procedures and automated CI/CD pipelines.

## System Requirements

### Hardware Requirements
- **Backend Server**: 
  - Minimum: 2 CPU cores, 4GB RAM
  - Recommended: 4 CPU cores, 8GB RAM
  - Storage: 20GB+ SSD
  
- **Database Server**:
  - Minimum: 2 CPU cores, 4GB RAM
  - Recommended: 4 CPU cores, 8GB RAM
  - Storage: 50GB+ SSD (scalable based on data growth)

- **Frontend Hosting**:
  - Static file hosting with CDN capabilities

### Software Requirements
- **Backend**:
  - Node.js v14.x or higher
  - npm v6.x or higher
  - MongoDB v4.4 or higher
  - Redis (optional, for caching)
  
- **Frontend**:
  - Node.js v14.x or higher (for build process)
  - npm v6.x or higher
  
- **DevOps**:
  - Docker v20.x or higher
  - Docker Compose v1.29.x or higher
  - Git

## Environment Setup

### Development Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Server Configuration
NODE_ENV=development
PORT=5000
API_BASE_URL=/api

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/farm2fork
MONGODB_USER=
MONGODB_PASSWORD=

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Email Configuration
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=Farm2Fork <noreply@farm2fork.com>

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=farm2fork-uploads

# Shippo Configuration
SHIPPO_API_KEY=your_shippo_api_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Production Environment Variables

For production, update the values accordingly and ensure secure storage of sensitive information using environment management tools or secrets managers.

## Backend Deployment

### Option 1: Manual Deployment

1. **Prepare the server**:
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js and npm
   curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/farm2fork.git
   cd farm2fork
   ```

3. **Install dependencies**:
   ```bash
   cd backend
   npm ci --production
   ```

4. **Set up environment variables**:
   ```bash
   # Create .env file with production values
   nano .env
   ```

5. **Start the application**:
   ```bash
   # Install PM2 process manager
   sudo npm install -g pm2
   
   # Start the application with PM2
   pm2 start server.js --name farm2fork-backend
   
   # Ensure PM2 starts on system boot
   pm2 startup
   pm2 save
   ```

6. **Set up Nginx as a reverse proxy**:
   ```bash
   # Install Nginx
   sudo apt install -y nginx
   
   # Create Nginx configuration
   sudo nano /etc/nginx/sites-available/farm2fork
   ```
   
   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name api.farm2fork.com;
   
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable the configuration:
   ```bash
   sudo ln -s /etc/nginx/sites-available/farm2fork /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Set up SSL with Let's Encrypt**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d api.farm2fork.com
   ```

### Option 2: Docker Deployment

1. **Prepare the server**:
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker and Docker Compose
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
   sudo apt update
   sudo apt install -y docker-ce docker-compose
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/farm2fork.git
   cd farm2fork
   ```

3. **Create docker-compose.yml**:
   ```yaml
   version: '3'
   
   services:
     backend:
       build: ./backend
       restart: always
       ports:
         - "5000:5000"
       env_file:
         - ./backend/.env
       depends_on:
         - mongo
         - redis
       networks:
         - farm2fork-network
   
     mongo:
       image: mongo:4.4
       restart: always
       volumes:
         - mongo-data:/data/db
       networks:
         - farm2fork-network
   
     redis:
       image: redis:6
       restart: always
       volumes:
         - redis-data:/data
       networks:
         - farm2fork-network
   
   networks:
     farm2fork-network:
   
   volumes:
     mongo-data:
     redis-data:
   ```

4. **Create backend Dockerfile**:
   ```dockerfile
   FROM node:14-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   
   RUN npm ci --production
   
   COPY . .
   
   EXPOSE 5000
   
   CMD ["node", "server.js"]
   ```

5. **Set up environment variables**:
   ```bash
   # Create .env file with production values
   nano backend/.env
   ```

6. **Build and start the containers**:
   ```bash
   docker-compose up -d
   ```

7. **Set up Nginx as a reverse proxy**:
   Follow steps 6-7 from the Manual Deployment section.

## Frontend Deployment

### Option 1: Netlify Deployment

1. **Build the frontend**:
   ```bash
   cd frontend
   npm ci
   npm run build
   ```

2. **Deploy to Netlify**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy to Netlify
   netlify deploy --prod
   ```

3. **Configure environment variables in Netlify**:
   - Go to Netlify dashboard > Site settings > Build & deploy > Environment
   - Add the following variables:
     - `REACT_APP_API_URL=https://api.farm2fork.com/api`
     - `REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key`

### Option 2: AWS S3 and CloudFront Deployment

1. **Build the frontend**:
   ```bash
   cd frontend
   npm ci
   npm run build
   ```

2. **Create S3 bucket**:
   - Go to AWS Management Console > S3
   - Create a new bucket (e.g., `farm2fork-frontend`)
   - Enable static website hosting
   - Set the index document to `index.html`
   - Set the error document to `index.html` (for SPA routing)

3. **Upload build files to S3**:
   ```bash
   # Install AWS CLI
   pip install awscli
   
   # Configure AWS CLI
   aws configure
   
   # Upload build files to S3
   aws s3 sync build/ s3://farm2fork-frontend
   ```

4. **Create CloudFront distribution**:
   - Go to AWS Management Console > CloudFront
   - Create a new distribution
   - Set the origin domain to your S3 bucket website endpoint
   - Configure cache behavior:
     - Redirect HTTP to HTTPS
     - Allow all HTTP methods
     - Forward all query strings and cookies
   - Set the default root object to `index.html`
   - Add a custom error response for 404 errors:
     - Error code: 404
     - Response page path: `/index.html`
     - HTTP response code: 200

5. **Set up custom domain (optional)**:
   - Go to AWS Management Console > Route 53
   - Create a new record set for your domain
   - Set the record type to A
   - Enable Alias and point to your CloudFront distribution

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for an account or log in

2. **Create a new cluster**:
   - Choose a cloud provider and region
   - Select cluster tier (M10 or higher recommended for production)
   - Configure additional settings as needed

3. **Set up database access**:
   - Create a database user with appropriate permissions
   - Set a strong password

4. **Configure network access**:
   - Add IP addresses that should have access to the database
   - For production, add the IP address of your backend server

5. **Get connection string**:
   - Go to Clusters > Connect > Connect your application
   - Copy the connection string
   - Update the `MONGODB_URI` in your backend environment variables

## External Services Configuration

### Stripe Integration

1. **Create Stripe account**:
   - Go to [Stripe](https://stripe.com)
   - Sign up for an account or log in

2. **Get API keys**:
   - Go to Developers > API keys
   - Copy the publishable key and secret key
   - Update environment variables:
     - Backend: `STRIPE_SECRET_KEY`
     - Frontend: `REACT_APP_STRIPE_PUBLIC_KEY`

3. **Set up webhook**:
   - Go to Developers > Webhooks
   - Add endpoint: `https://api.farm2fork.com/api/payments/webhook`
   - Select events to listen for (e.g., `payment_intent.succeeded`, `payment_intent.failed`)
   - Copy the webhook signing secret
   - Update the `STRIPE_WEBHOOK_SECRET` in your backend environment variables

### AWS S3 Integration

1. **Create AWS account**:
   - Go to [AWS](https://aws.amazon.com)
   - Sign up for an account or log in

2. **Create S3 bucket**:
   - Go to AWS Management Console > S3
   - Create a new bucket (e.g., `farm2fork-uploads`)
   - Configure bucket settings as needed

3. **Create IAM user**:
   - Go to AWS Management Console > IAM
   - Create a new user with programmatic access
   - Attach the `AmazonS3FullAccess` policy
   - Copy the access key ID and secret access key
   - Update environment variables:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_REGION`
     - `AWS_S3_BUCKET`

### Shippo Integration

1. **Create Shippo account**:
   - Go to [Shippo](https://goshippo.com)
   - Sign up for an account or log in

2. **Get API key**:
   - Go to API > API Keys
   - Copy the API key
   - Update the `SHIPPO_API_KEY` in your backend environment variables

## Continuous Integration/Continuous Deployment

### GitHub Actions CI/CD Pipeline

The repository includes a GitHub Actions workflow file (`.github/workflows/ci-cd.yml`) that automates testing, building, and deployment.

To use this pipeline:

1. **Set up GitHub repository**:
   - Push your code to GitHub
   - Go to Settings > Secrets
   - Add the following secrets:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `STRIPE_SECRET_KEY`
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `NETLIFY_AUTH_TOKEN`
     - `NETLIFY_SITE_ID`

2. **Configure deployment targets**:
   - Update the deployment steps in the workflow file to match your hosting providers
   - For Netlify, use the Netlify GitHub Action
   - For AWS, use the AWS GitHub Action

3. **Enable GitHub Actions**:
   - Go to Actions tab in your GitHub repository
   - Enable workflows

4. **Trigger the pipeline**:
   - Push to the `develop` branch to deploy to staging
   - Push to the `main` branch to deploy to production

## Monitoring and Logging

### Application Monitoring

1. **Set up Prometheus and Grafana**:
   ```bash
   # Create docker-compose.monitoring.yml
   nano docker-compose.monitoring.yml
   ```
   
   Add the following configuration:
   ```yaml
   version: '3'
   
   services:
     prometheus:
       image: prom/prometheus
       ports:
         - "9090:9090"
       volumes:
         - ./prometheus.yml:/etc/prometheus/prometheus.yml
         - prometheus-data:/prometheus
       networks:
         - monitoring-network
   
     grafana:
       image: grafana/grafana
       ports:
         - "3000:3000"
       volumes:
         - grafana-data:/var/lib/grafana
       networks:
         - monitoring-network
   
   networks:
     monitoring-network:
   
   volumes:
     prometheus-data:
     grafana-data:
   ```

2. **Create Prometheus configuration**:
   ```bash
   nano prometheus.yml
   ```
   
   Add the following configuration:
   ```yaml
   global:
     scrape_interval: 15s
   
   scrape_configs:
     - job_name: 'farm2fork-backend'
       static_configs:
         - targets: ['backend:5000']
   ```

3. **Start monitoring services**:
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

4. **Configure Grafana**:
   - Access Grafana at http://your-server-ip:3000
   - Default login: admin/admin
   - Add Prometheus as a data source
   - Import Node.js dashboard templates

### Log Management

1. **Set up ELK Stack**:
   ```bash
   # Create docker-compose.elk.yml
   nano docker-compose.elk.yml
   ```
   
   Add the following configuration:
   ```yaml
   version: '3'
   
   services:
     elasticsearch:
       image: docker.elastic.co/elasticsearch/elasticsearch:7.10.0
       environment:
         - discovery.type=single-node
       ports:
         - "9200:9200"
       volumes:
         - elasticsearch-data:/usr/share/elasticsearch/data
       networks:
         - elk-network
   
     logstash:
       image: docker.elastic.co/logstash/logstash:7.10.0
       ports:
         - "5044:5044"
       volumes:
         - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
       networks:
         - elk-network
       depends_on:
         - elasticsearch
   
     kibana:
       image: docker.elastic.co/kibana/kibana:7.10.0
       ports:
         - "5601:5601"
       networks:
         - elk-network
       depends_on:
         - elasticsearch
   
   networks:
     elk-network:
   
   volumes:
     elasticsearch-data:
   ```

2. **Create Logstash configuration**:
   ```bash
   nano logstash.conf
   ```
   
   Add the following configuration:
   ```
   input {
     tcp {
       port => 5044
       codec => json
     }
   }
   
   output {
     elasticsearch {
       hosts => ["elasticsearch:9200"]
       index => "farm2fork-%{+YYYY.MM.dd}"
     }
   }
   ```

3. **Start ELK services**:
   ```bash
   docker-compose -f docker-compose.elk.yml up -d
   ```

4. **Configure Winston to send logs to Logstash**:
   Update the logging configuration in the backend to send logs to Logstash.

## Backup and Recovery

### Database Backup

1. **Set up automated MongoDB backups**:
   ```bash
   # Create backup script
   nano backup-mongodb.sh
   ```
   
   Add the following script:
   ```bash
   #!/bin/bash
   
   # Set variables
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/var/backups/mongodb"
   S3_BUCKET="farm2fork-backups"
   
   # Create backup directory if it doesn't exist
   mkdir -p $BACKUP_DIR
   
   # Dump MongoDB database
   mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$TIMESTAMP"
   
   # Compress backup
   tar -czf "$BACKUP_DIR/$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "$TIMESTAMP"
   
   # Upload to S3
   aws s3 cp "$BACKUP_DIR/$TIMESTAMP.tar.gz" "s3://$S3_BUCKET/mongodb/$TIMESTAMP.tar.gz"
   
   # Clean up local files
   rm -rf "$BACKUP_DIR/$TIMESTAMP"
   rm -f "$BACKUP_DIR/$TIMESTAMP.tar.gz"
   
   # Delete backups older than 30 days
   find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +30 -delete
   ```

2. **Make the script executable**:
   ```bash
   chmod +x backup-mongodb.sh
   ```

3. **Schedule the backup with cron**:
   ```bash
   crontab -e
   ```
   
   Add the following line to run the backup daily at 2 AM:
   ```
   0 2 * * * /path/to/backup-mongodb.sh
   ```

### Recovery Procedure

1. **Restore MongoDB from backup**:
   ```bash
   # Download backup from S3
   aws s3 cp "s3://farm2fork-backups/mongodb/TIMESTAMP.tar.gz" .
   
   # Extract backup
   tar -xzf TIMESTAMP.tar.gz
   
   # Restore database
   mongorestore --uri="$MONGODB_URI" TIMESTAMP/
   ```

## Troubleshooting

### Common Issues and Solutions

1. **Backend server not starting**:
   - Check environment variables
   - Verify MongoDB connection
   - Check for port conflicts
   - Review application logs

2. **Database connection issues**:
   - Verify MongoDB is running
   - Check connection string
   - Ensure network access is configured correctly
   - Check database user credentials

3. **Frontend build failures**:
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm ci`
   - Check for dependency conflicts

4. **API errors**:
   - Check backend logs
   - Verify API endpoints are correct
   - Ensure CORS is configured properly
   - Check authentication tokens

5. **Deployment failures**:
   - Review CI/CD logs
   - Verify deployment credentials
   - Check for build errors
   - Ensure environment variables are set correctly

### Support Resources

- **Documentation**: Refer to the project documentation in the `docs` directory
- **GitHub Issues**: Check existing issues or create new ones
- **Contact**: Email the development team at dev@farm2fork.com

---

This deployment guide provides a comprehensive overview of deploying the Farm2Fork application. For specific questions or issues, please contact the development team.