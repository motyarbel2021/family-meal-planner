import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import { childrenRoutes } from './routes/children'
import { menuItemsRoutes } from './routes/menu-items'
import { weekPlanRoutes } from './routes/week-plan'
import { groceryRoutes } from './routes/grocery'
import { chatRoutes } from './routes/chat'
import { privacyRoutes } from './routes/privacy'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Use renderer for HTML pages
app.use(renderer)

// API Routes
app.route('/api/children', childrenRoutes)
app.route('/api/menu-items', menuItemsRoutes)  
app.route('/api/week-plan', weekPlanRoutes)
app.route('/api/grocery', groceryRoutes)
app.route('/api/chat', chatRoutes)
app.route('/api/privacy', privacyRoutes)

// Main application page
app.get('/', (c) => {
  return c.render(
    <div>
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        מתכנן הארוחות המשפחתי
      </h1>
      <div id="app" className="container mx-auto px-4"></div>
    </div>
  )
})

// Privacy policy page
app.get('/privacy', (c) => {
  return c.render(
    <div>
      <h1 className="text-2xl font-bold mb-6">מדיניות פרטיות</h1>
      <div id="privacy-content" className="max-w-4xl mx-auto px-4"></div>
    </div>
  )
})

export default app
