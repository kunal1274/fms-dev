# 🚀 Deployment Guide

## Overview

This guide covers the deployment of both the frontend (React Vite) and backend (Node.js Express) applications for the FMS ERP system.

## Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Git
- PM2 (for production backend)
- Nginx (for production frontend)

## Development Deployment

### 1. Backend Setup

```bash
# Navigate to backend directory
cd launch_app_fms

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

**Backend will run on:** http://localhost:3000

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd fms-dev

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

**Frontend will run on:** http://localhost:5173

## Production Deployment

### 1. Backend Production Setup

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Navigate to backend directory
cd launch_app_fms

# Install dependencies
npm install --production

# Create production environment file
cp .env.example .env.production
# Edit .env.production with production values

# Build the application (if needed)
npm run build

# Start with PM2
pm2 start index.js --name "fms-backend" --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using Docker

```bash
# Create Dockerfile in launch_app_fms directory
cat > Dockerfile << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
EOF

# Build Docker image
docker build -t fms-backend .

# Run Docker container
docker run -d -p 3000:3000 --name fms-backend fms-backend
```

### 2. Frontend Production Setup

#### Build and Deploy

```bash
# Navigate to frontend directory
cd fms-dev

# Install dependencies
npm install

# Create production environment file
cp .env.example .env.production
# Edit .env.production with production values

# Build for production
npm run build

# The build files will be in the 'dist' directory
```

#### Using Nginx

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/fms-frontend

# Add the following configuration:
cat > /etc/nginx/sites-available/fms-frontend << EOF
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/fms-dev/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/fms-frontend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Using Docker

```bash
# Create Dockerfile in fms-dev directory
cat > Dockerfile << EOF
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Create nginx.conf
cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files \$uri \$uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
    }
}
EOF

# Build Docker image
docker build -t fms-frontend .

# Run Docker container
docker run -d -p 80:80 --name fms-frontend fms-frontend
```

## Environment Configuration

### Backend Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
ATLAS_URI=mongodb://your-mongodb-connection-string

# Authentication
JWT_SECRET=your-super-secure-jwt-secret
SESSION_SECRET=your-super-secure-session-secret

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=31457280

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

```bash
# .env.production
VITE_API_URL=https://your-backend-domain.com/fms/api/v0
VITE_API_TIMEOUT=30000
VITE_APP_NAME=FMS ERP System
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

## Database Setup

### MongoDB Atlas (Cloud)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get the connection string
4. Update `ATLAS_URI` in your environment file

### Local MongoDB

```bash
# Install MongoDB
sudo apt update
sudo apt install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
use fms_db
db.createUser({
  user: "fms_user",
  pwd: "your_password",
  roles: ["readWrite"]
})
```

## SSL/HTTPS Setup

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### PM2 Monitoring

```bash
# Monitor PM2 processes
pm2 monit

# View logs
pm2 logs fms-backend

# Restart application
pm2 restart fms-backend
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## Backup and Recovery

### Database Backup

```bash
# MongoDB backup
mongodump --uri="mongodb://your-connection-string" --out=/backup/$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="mongodb://your-connection-string" /backup/20240101
```

### Application Backup

```bash
# Backup application files
tar -czf fms-backup-$(date +%Y%m%d).tar.gz /path/to/launch_app_fms

# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz /path/to/launch_app_fms/uploads
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` in backend environment
   - Ensure frontend URL is included

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network connectivity
   - Ensure database user has proper permissions

3. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Ensure disk space is available

4. **Authentication Issues**
   - Verify JWT secret is consistent
   - Check token expiration settings
   - Ensure proper headers are sent

### Performance Optimization

1. **Backend**
   - Enable gzip compression
   - Use Redis for caching
   - Optimize database queries
   - Implement rate limiting

2. **Frontend**
   - Enable gzip compression in Nginx
   - Use CDN for static assets
   - Implement lazy loading
   - Optimize bundle size

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure JWT secrets
- [ ] Configure proper CORS
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] File upload validation
- [ ] Input sanitization
- [ ] Error message sanitization

## Maintenance

### Regular Tasks

1. **Daily**
   - Monitor application logs
   - Check system resources
   - Verify backup completion

2. **Weekly**
   - Review error logs
   - Check database performance
   - Update dependencies

3. **Monthly**
   - Security updates
   - Performance review
   - Backup testing
   - Disaster recovery testing
