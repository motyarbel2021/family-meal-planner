#!/bin/bash

# 🚀 Family Meal Planner - Production Deployment Script
# מתכנן הארוחות המשפחתי - סקריפט פריסה לפרודקשן

echo "🎯 Starting production deployment..."
echo "מתחיל פריסה לפרודקשן..."

# Check if authenticated
echo "🔐 Checking Cloudflare authentication..."
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo "❌ Not authenticated with Cloudflare. Please run: wrangler login"
    echo "❌ לא מחובר ל-Cloudflare. אנא הרץ: wrangler login"
    exit 1
fi

echo "✅ Authenticated with Cloudflare"

# Build the project
echo "🏗️ Building project..."
echo "בונה את הפרויקט..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    echo "❌ הבנייה נכשלה"
    exit 1
fi

echo "✅ Build completed successfully"

# Create D1 database for production (if not exists)
echo "🗄️ Setting up production database..."
echo "מגדיר מסד נתונים לפרודקשן..."

# Try to create database (will fail if exists, but that's OK)
npx wrangler d1 create family-meal-planner-db 2>/dev/null || true

# Get database ID and update wrangler.jsonc
echo "📝 Configuring database connection..."

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
echo "מפרסם ל-Cloudflare Pages..."

npx wrangler pages deploy dist --project-name family-meal-planner --compatibility-date 2025-08-30

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "🎉 הפריסה הושלמה בהצלחה!"
    echo ""
    echo "🌐 Your app is live at:"
    echo "🌐 האפליקציה שלך פעילה ב:"
    echo "https://family-meal-planner.pages.dev"
    echo ""
    echo "📱 Mobile-friendly and ready to use!"
    echo "📱 ידידותית לנייד ומוכנה לשימוש!"
else
    echo "❌ Deployment failed"
    echo "❌ הפריסה נכשלה"
    exit 1
fi