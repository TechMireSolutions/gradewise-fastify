#!/usr/bin/env bash
set -euo pipefail

echo "🌐 Configuring Web Server Reverse Proxy for gradewiseai.techmiresolutions.com..."

# 1. Firewall rules
echo "Ensuring ports 80 and 443 are open..."
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
firewall-cmd --add-port=80/tcp --permanent 2>/dev/null && firewall-cmd --reload 2>/dev/null || true
firewall-cmd --add-port=443/tcp --permanent 2>/dev/null && firewall-cmd --reload 2>/dev/null || true
iptables -I INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
iptables -I INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true

# Ensure webroot and ACME challenge directories exist
WEBROOT="/www/wwwroot/gradewiseai.techmiresolutions.com"
mkdir -p "${WEBROOT}/.well-known/acme-challenge" 2>/dev/null || true
chmod -R 755 "${WEBROOT}/.well-known" 2>/dev/null || true

# 2. Apache Configuration
if command -v apache2ctl >/dev/null 2>&1 || [ -d /etc/apache2 ]; then
  echo "Apache detected. Enabling proxy and ssl modules..."
  a2enmod proxy proxy_http proxy_wstunnel rewrite headers ssl socache_shmcb 2>/dev/null || true

  cat << 'EOF' > /etc/apache2/sites-available/gradewiseai.techmiresolutions.com.conf
<VirtualHost *:80>
    ServerName gradewiseai.techmiresolutions.com
    ServerAlias www.gradewiseai.techmiresolutions.com

    DocumentRoot /www/wwwroot/gradewiseai.techmiresolutions.com

    <Directory /www/wwwroot/gradewiseai.techmiresolutions.com/.well-known>
        Require all granted
    </Directory>

    ProxyPreserveHost On
    ProxyRequests Off

    RewriteEngine On

    # Exclude ACME challenge for Let's Encrypt / Certbot
    ProxyPass /.well-known/acme-challenge/ !

    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
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
    echo "✓ Apache port 80 site enabled and reloaded."
  else
    echo "⚠️ Apache configtest returned warnings."
  fi
fi

# 3. aaPanel Apache vhost directory mirror
if [ -d /www/server/panel/vhost/apache ]; then
  cp /etc/apache2/sites-available/gradewiseai.techmiresolutions.com.conf /www/server/panel/vhost/apache/gradewiseai.techmiresolutions.com.conf 2>/dev/null || true
fi

# 4. Nginx Configuration (if present)
if command -v nginx >/dev/null 2>&1 && [ -d /etc/nginx/sites-available ]; then
  cat << 'EOF' > /etc/nginx/sites-available/gradewiseai.techmiresolutions.com.conf
server {
    listen 80;
    server_name gradewiseai.techmiresolutions.com www.gradewiseai.techmiresolutions.com;

    location /.well-known/acme-challenge/ {
        root /www/wwwroot/gradewiseai.techmiresolutions.com;
    }

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

# 5. Attempt automated SSL certificate generation via Certbot
if command -v certbot >/dev/null 2>&1; then
  echo "Certbot detected. Ensuring SSL certificate for gradewiseai.techmiresolutions.com..."
  certbot certonly --webroot -w "${WEBROOT}" -d gradewiseai.techmiresolutions.com --non-interactive --agree-tos --register-unsafely-without-email 2>&1 || certbot --apache -d gradewiseai.techmiresolutions.com --non-interactive --agree-tos --register-unsafely-without-email 2>&1 || echo "Certbot attempt completed."
fi

# 6. Locate certificates and activate SSL VirtualHost
SSL_CERT=""
SSL_KEY=""
if [ -f /etc/letsencrypt/live/gradewiseai.techmiresolutions.com/fullchain.pem ]; then
  SSL_CERT="/etc/letsencrypt/live/gradewiseai.techmiresolutions.com/fullchain.pem"
  SSL_KEY="/etc/letsencrypt/live/gradewiseai.techmiresolutions.com/privkey.pem"
elif [ -f /www/server/panel/vhost/cert/gradewiseai.techmiresolutions.com/fullchain.pem ]; then
  SSL_CERT="/www/server/panel/vhost/cert/gradewiseai.techmiresolutions.com/fullchain.pem"
  SSL_KEY="/www/server/panel/vhost/cert/gradewiseai.techmiresolutions.com/privkey.pem"
fi

if [ -n "$SSL_CERT" ] && [ -n "$SSL_KEY" ] && [ -d /etc/apache2/sites-available ]; then
  echo "SSL certificates found ($SSL_CERT). Configuring port 443 VirtualHost..."
  cat << EOF > /etc/apache2/sites-available/gradewiseai.techmiresolutions.com-le-ssl.conf
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName gradewiseai.techmiresolutions.com
    ServerAlias www.gradewiseai.techmiresolutions.com

    DocumentRoot /www/wwwroot/gradewiseai.techmiresolutions.com

    <Directory /www/wwwroot/gradewiseai.techmiresolutions.com/.well-known>
        Require all granted
    </Directory>

    SSLEngine on
    SSLCertificateFile ${SSL_CERT}
    SSLCertificateKeyFile ${SSL_KEY}

    ProxyPreserveHost On
    ProxyRequests Off

    RewriteEngine On

    # Exclude ACME challenge for Let's Encrypt / Certbot
    ProxyPass /.well-known/acme-challenge/ !

    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule /(.*) ws://127.0.0.1:3000/\$1 [P,L]

    ProxyPass /api http://127.0.0.1:8000/api
    ProxyPassReverse /api http://127.0.0.1:8000/api

    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    ErrorLog \${APACHE_LOG_DIR}/gradewiseai_ssl_error.log
    CustomLog \${APACHE_LOG_DIR}/gradewiseai_ssl_access.log combined
</VirtualHost>
</IfModule>
EOF
  a2ensite gradewiseai.techmiresolutions.com-le-ssl.conf 2>/dev/null || true
  if apache2ctl configtest 2>/dev/null; then
    systemctl restart apache2 2>/dev/null || service apache2 restart 2>/dev/null || apache2ctl restart 2>/dev/null || true
    echo "✓ Apache restarted with port 443 SSL enabled."
  else
    echo "⚠️ Apache SSL configtest warning."
  fi
fi

# Print active ports for diagnostic confirmation
echo "Current listening web ports:"
ss -tulpn | grep -E ':(80|443|3000|8000)\b' || netstat -tulpn | grep -E ':(80|443|3000|8000)\b' || true

echo "✓ Reverse proxy setup finished."
