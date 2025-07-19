# Manga Reader

A modern manga reading platform built with Laravel, React, and Inertia.js.

## Features

- Advanced manga search and filtering
- Chapter reader with keyboard navigation
- Responsive design
- SEO-friendly URLs

## Quick Start

```bash
# Install dependencies
composer install
bun run install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate

# Start development
composer run dev
```

## Production
```bash
# Install dependencies
composer install --no-dev --optimize-autoloader
bun run install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate

# Build SSR
bun run build

# Start SSR if you need
php artisan inertia:start-ssr --runtime=bun
# Im using bun so (--runtime=bun), if you install with npm or pnpm, no need --runtime=bun here:
php artisan inertia:start-ssr

# Start app with Octane
php artisan octane:start
```

## Tech Stack

- **Backend**: Laravel 12+ (PHP 8.3+)
- **Frontend**: React 18 + Inertia.js 2.0
- **Database**: MySQL
- **UI**: Tailwind CSS + Shadcn/ui
- **Build**: Vite with SSR

## Commands

```bash
# Testing
composer run test

# Build production
bun run build

# Clear caches
php artisan config:clear

# Optimize app
php artisan optimize:clear
```