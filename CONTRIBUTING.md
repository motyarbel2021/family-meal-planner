# Contributing to Family Meal Planner / תרומה למתכנן הארוחות המשפחתי

Thank you for your interest in contributing! / תודה על ההתעניינות שלך לתרום!

## 🌍 Languages / שפות

This project supports both English and Hebrew. Documentation and issues can be submitted in either language.

הפרויקט תומך באנגלית ובעברית. ניתן להגיש תיעוד ובעיות בשתי השפות.

## 🚀 Getting Started / התחלה

### Prerequisites / דרישות מקדימות

- Node.js 18+ 
- npm or yarn
- Git
- Wrangler CLI for Cloudflare development

### Local Development / פיתוח מקומי

```bash
# Clone the repository / שכפול המאגר
git clone https://github.com/YOUR-USERNAME/family-meal-planner.git
cd family-meal-planner

# Install dependencies / התקנת חבילות
npm install

# Set up local database / הגדרת מסד נתונים מקומי
npm run db:migrate:local
npm run db:seed

# Start development server / הפעלת שרת פיתוח
npm run dev:sandbox
```

## 📝 How to Contribute / איך לתרום

### 1. Bug Reports / דיווח על באגים

- Check existing issues first / בדוק בעיות קיימות תחילה
- Use descriptive titles / השתמש בכותרות מתארות
- Include steps to reproduce / כלול שלבי שחזור
- Add screenshots if relevant / הוסף צילומי מסך אם רלוונטי

### 2. Feature Requests / בקשות תכונה

- Describe the use case / תאר את מקרה השימוש
- Explain why it's valuable / הסבר למה זה שווה
- Consider implementation impact / שקול השפעת היישום

### 3. Code Contributions / תרומות קוד

1. **Fork the repository / צור fork של המאגר**
2. **Create feature branch / צור branch לתכונה**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make changes / בצע שינויים**
4. **Follow coding standards / עקוב אחר תקני הקוד**
5. **Write tests / כתוב בדיקות**
6. **Commit with descriptive messages / בצע commit עם הודעות מתארות**
7. **Push and create Pull Request / דחוף וצור Pull Request**

## 🎯 Development Guidelines / קווים מנחים לפיתוח

### Code Style / סגנון קוד

- Use TypeScript for type safety / השתמש ב-TypeScript לבטיחות סוגים
- Follow RTL design principles for Hebrew / עקוב אחר עקרונות RTL לעברית  
- Write clear, descriptive variable names / כתוב שמות משתנים ברורים ומתארים
- Add comments for complex logic / הוסף הערות ללוגיקה מורכבת

### Testing / בדיקות

- Test new features thoroughly / בדוק תכונות חדשות ביסודיות
- Include both Hebrew and English test cases / כלול מקרי בדיקה בעברית ובאנגלית
- Verify responsive design on different screen sizes / וודא עיצוב רספונסיבי במסכים שונים

### Commit Messages / הודעות commit

Use conventional commits with emojis:
```
✨ feat: add grocery list export functionality
🐛 fix: resolve Hebrew text alignment issue  
📝 docs: update API documentation
🎨 style: improve button hover effects
```

## 🌟 Areas for Contribution / תחומים לתרומה

### High Priority / עדיפות גבוהה
- 🔧 **Performance optimizations** / אופטימיזציות ביצועים
- 🌐 **Accessibility improvements** / שיפורי נגישות
- 📱 **Mobile experience enhancements** / שיפורי חוויית מובייל
- 🔍 **Search and filtering** / חיפוש וסינון

### Medium Priority / עדיפות בינונית  
- 📊 **Analytics and insights** / אנליטיקה ותובנות
- 🎨 **Theme customization** / התאמת נושאים
- 📤 **Export/import features** / תכונות ייצוא/ייבוא
- 🔔 **Notifications system** / מערכת התראות

### Nice to Have / כדאי לוסיף
- 🍴 **Recipe integration** / אינטגרציה עם מתכונים
- 🛒 **Shopping app integration** / אינטגרציה עם אפליקציות קניות
- 📈 **Nutrition tracking** / מעקב תזונתי
- 👥 **Family sharing features** / תכונות שיתוף משפחתי

## 🏗️ Project Structure / מבנה הפרויקט

```
webapp/
├── src/
│   ├── index.tsx           # Main application entry
│   ├── renderer.tsx        # HTML renderer and styles  
│   ├── routes/            # API route handlers
│   ├── lib/               # Utility functions
│   └── types.ts           # TypeScript type definitions
├── public/
│   └── static/            # Frontend JavaScript and CSS
├── migrations/            # Database migration files
└── README.md             # Project documentation
```

## 🐛 Debugging / איתור באגים

### Common Issues / בעיות נפוצות

1. **Database connection errors** / שגיאות חיבור למסד נתונים
   ```bash
   npm run db:reset
   ```

2. **Build failures** / כשלים בבנייה
   ```bash
   rm -rf node_modules .wrangler
   npm install
   npm run build
   ```

3. **Hebrew text display issues** / בעיות הצגת טקסט עברי
   - Check RTL CSS classes / בדוק מחלקות CSS של RTL
   - Verify font loading / וודא טעינת גופנים

## 📞 Getting Help / קבלת עזרה

- 💬 **Discussions**: For general questions / לשאלות כלליות
- 🐛 **Issues**: For bugs and feature requests / לבאגים ובקשות תכונה
- 📧 **Email**: For private inquiries / לפניות פרטיות

## 📋 Code of Conduct / קוד התנהגות

Be respectful, inclusive, and constructive in all interactions.

היו מכבדים, מכילים ובונים בכל האינטראקציות.

## 🙏 Recognition / הכרה

All contributors will be acknowledged in our README and releases.

כל התורמים יוכרו ב-README ובהוצאות שלנו.

---

**Happy Contributing! / תרומה שמחה!** 🎉