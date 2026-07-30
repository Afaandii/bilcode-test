# Dockerfile for Laravel 13 Backend (ProjectPulse)

FROM php:8.4-cli-alpine

# Install system dependencies & PHP extensions
RUN apk add --no-cache \
    git \
    unzip \
    zip \
    libzip-dev \
    postgresql-dev \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# 1. Copy SELURUH source code terlebih dahulu (agar file artisan & bootstrap sudah ada)
COPY . .

# 2. Tambahkan opsi --no-scripts agar composer tidak memanggil artisan sebelum vendor siap,
#    atau jalankan composer install biasa karena artisan sudah ter-copy
RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction

# 3. Buat folder bootstrap/cache dan storage jika belum ada, lalu atur permission
RUN mkdir -p storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose Laravel port
EXPOSE 8000

# Start Laravel development server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]