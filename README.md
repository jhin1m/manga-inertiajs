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
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate --seed

# Start development
composer run dev
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
npm run build

# Clear caches
php artisan config:clear
```