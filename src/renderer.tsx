import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>מתכנן הארוחות המשפחתי</title>
        <meta name="description" content="מערכת לתכנון ארוחות שבועיות למשפחה עם רשימת מצרכים אוטומטית" />
        
        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{__html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#007bff',
                  secondary: '#6c757d',
                  success: '#28a745',
                  danger: '#dc3545',
                  warning: '#ffc107',
                  info: '#17a2b8',
                  light: '#f8f9fa',
                  dark: '#343a40'
                }
              }
            }
          }
        `}} />
        
        {/* Font Awesome Icons */}
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        
        {/* Chart.js for potential analytics */}
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        
        {/* Axios for HTTP requests */}
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        
        {/* Day.js for date handling */}
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
        
        {/* Custom styles */}
        <link href="/static/style.css" rel="stylesheet" />
        
        <style dangerouslySetInnerHTML={{__html: `
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
          }
          .rtl { direction: rtl; }
          .btn {
            @apply px-4 py-2 rounded-lg font-medium transition-colors;
          }
          .btn-primary {
            @apply bg-blue-600 text-white hover:bg-blue-700;
          }
          .btn-secondary {
            @apply bg-gray-600 text-white hover:bg-gray-700;
          }
          .btn-success {
            @apply bg-green-600 text-white hover:bg-green-700;
          }
          .btn-danger {
            @apply bg-red-600 text-white hover:bg-red-700;
          }
          .card {
            @apply bg-white rounded-lg shadow-md p-6;
          }
          .input {
            @apply border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
          }
        `}} />
      </head>
      <body className="bg-gray-50 rtl">
        <nav className="bg-white shadow-sm border-b mb-6">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-reverse space-x-4">
                <i className="fas fa-utensils text-2xl text-blue-600"></i>
                <span className="text-xl font-bold text-gray-800">מתכנן הארוחות</span>
              </div>
              <div className="flex items-center space-x-reverse space-x-4">
                <button id="home-btn" className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0">
                  <i className="fas fa-home ml-1"></i>
                  בית
                </button>
                <a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <i className="fas fa-shield-alt ml-1"></i>  
                  פרטיות
                </a>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="container mx-auto px-4 pb-8">
          {children}
        </main>
        
        <footer className="bg-gray-800 text-white text-center py-4 mt-8">
          <div className="container mx-auto px-4">
            <p>&copy; 2024 מתכנן הארוחות המשפחתי</p>
            <p className="text-sm text-gray-400 mt-1">
              <a href="/privacy" className="hover:text-white underline">מדיניות פרטיות</a>
              <span className="mx-2">•</span>
              <span>כל הנתונים נשמרים במכשיר שלך בלבד</span>
            </p>
          </div>
        </footer>

        {/* Main Application JavaScript */}
        <script src="/static/app.js"></script>
        <script src="/static/privacy.js"></script>
      </body>
    </html>
  )
})
