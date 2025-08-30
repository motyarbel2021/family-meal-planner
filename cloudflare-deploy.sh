#!/bin/bash

# מתכנן הארוחות המשפחתי - סקריפט פרסום ל-Cloudflare Pages
echo "🍽️ מפרסם מתכנן הארוחות המשפחתי ל-Cloudflare Pages..."

# Build the project
echo "🏗️ בונה את הפרויקט..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ בנייה הושלמה בהצלחה"
    
    echo "📦 יוצר חבילת פרסום..."
    # Create deployment package
    cd dist
    tar -czf ../cloudflare-pages-deploy.tar.gz *
    cd ..
    
    echo "✅ חבילת הפרסום נוצרה: cloudflare-pages-deploy.tar.gz"
    echo ""
    echo "📋 להעלאה ידנית ל-Cloudflare Pages:"
    echo "1. לך ל-https://dash.cloudflare.com/"
    echo "2. בחר את הפרויקט: family-meal-planner-hebrew"
    echo "3. לחץ על 'Create deployment'"
    echo "4. העלה את הקובץ: cloudflare-pages-deploy.tar.gz"
    echo "   או העלה את כל התוכן מתיקיית dist/"
    echo ""
    echo "📂 קבצים להעלאה:"
    ls -la dist/
    
else
    echo "❌ שגיאה בבנייה"
    exit 1
fi