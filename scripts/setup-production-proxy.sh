#!/usr/bin/env bash
set -euo pipefail

echo "🌐 Configuring Web Server Reverse Proxy for gradewiseai.techmiresolutions.com..."

# 1. Apache Configuration
if command -v apache2ctl >/dev/null 2>&1 || [ -d /etc/apache2 ]; then
  echo "Apache detected. Enabling proxy modules..."
  a2enmod proxy proxy_http proxy_wstunnel rewrite headers 2>/dev/null || true

  cat << 'EOF' > /etc/apache2/sites-available/gradewiseai.techmiresolutions.com.conf
<VirtualHost *:80>
    ServerName gradewiseai.techmiresolutions.com
    ServerAlias www.gradewiseai.techmiresolutions.com

    ProxyPreserveHost On
    ProxyRequests Off

    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://127.0.0.1:3000/$1 [P,L]

    ProxyPass /api http://127.0.0.1:8000/api
    ProxyPassReverse /api http://127.0.0.1:8000/api

    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    ErrorLog ${APACHE_LOG_DIR}/gradewiseai_error.log
    CustomLog ${APACHE_LOG_DIR}/gradewiseai_access.log combined
</VirtualHost>
EOF

  a2ensite gradewiseai.techmiresolutions.com.conf 2>/dev/null || true
  if apache2ctl configtest 2>/dev/null; then
    systemctl reload apache2 2>/dev/null || service apache2 reload 2>/dev/null || /etc/init.d/apache2 reload 2>/dev/null || true
    echo "✓ Apache site enabled and reloaded."
  else
    echo "⚠️ Apache configtest returned warnings."
  fi
fi

# 2. aaPanel Apache vhost directory mirror
if [ -d /www/server/panel/vhost/apache ]; then
  cp /etc/apache2/sites-available/gradewiseai.techmiresolutions.com.conf /www/server/panel/vhost/apache/gradewiseai.techmiresolutions.com.conf 2>/dev/null || true
fi

# 3. Nginx Configuration
if command -v nginx >/dev/null 2>&1 && [ -d /etc/nginx/sites-available ]; then
  cat << 'EOF' > /etc/nginx/sites-available/gradewiseai.techmiresolutions.com.conf
server {
    listen 80;
    server_name gradewiseai.techmiresolutions.com www.gradewiseai.techmiresolutions.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
  ln -sf /etc/nginx/sites-available/gradewiseai.techmiresolutions.com.conf /etc/nginx/sites-enabled/ 2>/dev/null || true
  nginx -t 2>/dev/null && (systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || true) || true
fi

# 4. Attempt automated SSL certificate generation via Certbot
if command -v certbot >/dev/null 2>&1; then
  echo "Certbot detected. Ensuring SSL certificate for gradewiseai.techmiresolutions.com..."
  certbot --apache -d gradewiseai.techmiresolutions.com --non-interactive --agree-tos --register-unsafely-without-email --redirect 2>/dev/null || certbot --nginx -d gradewiseai.techmiresolutions.com --non-interactive --agree-tos --register-unsafely-without-email --redirect 2>/dev/null || true
fi

echo "✓ Reverse proxy setup finished."
