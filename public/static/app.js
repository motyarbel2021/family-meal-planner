// Meal Planner Application - Frontend JavaScript
// RTL-aware interface for Hebrew family meal planning

class MealPlannerApp {
  constructor() {
    this.currentWeekPlan = null
    this.children = []
    this.menuItems = []
    this.currentWeek = null
    this.pantryItems = []
    this.isLoading = false
    
    this.init()
  }

  async init() {
    console.log('מאתחל את מתכנן הארוחות...')
    
    // Check privacy consent first
    await this.checkPrivacyConsent()
    
    // Initialize the app if consent is given
    if (this.hasConsent) {
      await this.loadInitialData()
      this.renderMainInterface()
      this.bindEvents()
    }
  }

  async checkPrivacyConsent() {
    try {
      const response = await axios.get('/api/privacy/consent')
      if (response.data.success) {
        this.hasConsent = response.data.data.hasConsented
        if (!this.hasConsent) {
          this.renderPrivacyConsent()
          return
        }
      }
    } catch (error) {
      console.error('שגיאה בבדיקת הסכמת פרטיות:', error)
      this.showError('שגיאה בטעינת הגדרות הפרטיות')
    }
  }

  async loadInitialData() {
    this.showLoading(true)
    
    try {
      // Load children, menu items, and current week plan
      const [childrenRes, menuItemsRes, weekPlanRes] = await Promise.all([
        axios.get('/api/children'),
        axios.get('/api/menu-items?activeOnly=true'),
        axios.get('/api/week-plan/current')
      ])

      if (childrenRes.data.success) {
        this.children = childrenRes.data.data
      }

      if (menuItemsRes.data.success) {
        this.menuItems = menuItemsRes.data.data
      }

      if (weekPlanRes.data.success) {
        this.currentWeekPlan = weekPlanRes.data.data
        this.currentWeek = this.generateWeekDays(this.currentWeekPlan.days[0]?.date)
      }

    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error)
      this.showError('שגיאה בטעינת הנתונים הבסיסיים')
    } finally {
      this.showLoading(false)
    }
  }

  renderMainInterface() {
    const appContainer = document.getElementById('app')
    if (!appContainer) return

    appContainer.innerHTML = `
      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-4 mb-6 justify-center">
        <button id="btn-add-child" class="btn btn-primary">
          <i class="fas fa-plus ml-2"></i>
          הוסף ילד/ה
        </button>
        <button id="btn-add-meal" class="btn btn-secondary">
          <i class="fas fa-utensils ml-2"></i>
          הוסף מנה
        </button>
        <button id="btn-grocery-list" class="btn btn-success">
          <i class="fas fa-shopping-cart ml-2"></i>
          רשימת מצרכים
        </button>
        <button id="btn-chat" class="btn bg-purple-600 text-white hover:bg-purple-700">
          <i class="fas fa-comments ml-2"></i>
          צ'אט בוט
        </button>
      </div>

      <!-- Weekly Planner Grid -->
      <div class="card mb-6">
        <h2 class="text-2xl font-bold mb-4 text-center">
          תכנון שבועי
          <span class="text-sm font-normal text-gray-600 block mt-1">
            ${this.formatWeekRange()}
          </span>
        </h2>
        
        <div id="weekly-planner" class="overflow-x-auto">
          ${this.renderWeeklyPlannerGrid()}
        </div>
      </div>

      <!-- Modals -->
      <div id="modals-container"></div>

      <!-- Loading overlay -->
      <div id="loading-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg text-center">
          <i class="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
          <p class="text-lg">טוען...</p>
        </div>
      </div>

      <!-- Error/Success Messages -->
      <div id="messages-container" class="fixed bottom-4 left-4 z-40 space-y-2"></div>
    `
  }

  renderWeeklyPlannerGrid() {
    if (!this.currentWeek || !this.currentWeekPlan) {
      return '<div class="text-center text-gray-500">טוען את התכנית השבועית...</div>'
    }

    const hebrewDays = ['שבת', 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי']
    
    return `
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 p-3 font-bold">יום</th>
            <th class="border border-gray-300 p-3 font-bold">ארוחת בוקר</th>
            <th class="border border-gray-300 p-3 font-bold">ארוחת צהריים</th>
            <th class="border border-gray-300 p-3 font-bold">ארוחת ערב</th>
          </tr>
        </thead>
        <tbody>
          ${this.currentWeek.map((date, index) => `
            <tr class="hover:bg-gray-50">
              <td class="border border-gray-300 p-3 font-semibold text-center bg-blue-50">
                <div>${hebrewDays[index]}</div>
                <div class="text-sm text-gray-600">${this.formatHebrewDate(date)}</div>
              </td>
              <td class="border border-gray-300 p-2">
                ${this.renderBreakfastCell(date)}
              </td>
              <td class="border border-gray-300 p-2">
                ${this.renderMealCell(date, 'lunch')}
              </td>
              <td class="border border-gray-300 p-2">
                ${this.renderMealCell(date, 'dinner')}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  renderBreakfastCell(date) {
    const dayPlan = this.currentWeekPlan?.days.find(d => d.date === date)
    if (!dayPlan || !dayPlan.breakfast) return this.renderEmptyCell(date, 'breakfast')

    const breakfastByChild = dayPlan.breakfast.byChild || {}
    
    return `
      <div class="space-y-2">
        ${this.children.map(child => `
          <div class="flex items-center space-x-reverse space-x-2">
            <div class="w-4 h-4 rounded-full" style="background-color: ${child.color}"></div>
            <span class="font-medium text-sm">${child.name}:</span>
            <div class="flex-1">
              ${this.renderChildBreakfastMeals(breakfastByChild[child.id] || [])}
            </div>
            <button class="text-blue-600 hover:text-blue-800" onclick="app.editChildBreakfast('${date}', '${child.id}')">
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>
        `).join('')}
        ${this.children.length === 0 ? '<div class="text-gray-500 text-sm text-center">הוסף ילדים כדי לתכנן ארוחות בוקר</div>' : ''}
      </div>
    `
  }

  renderChildBreakfastMeals(selections) {
    if (!selections || selections.length === 0) {
      return '<span class="text-gray-400 text-sm">לא נבחר</span>'
    }

    return selections.map(selection => {
      const menuItem = this.menuItems.find(m => m.id === selection.menuItemId)
      const name = menuItem ? menuItem.name : 'מנה לא זמינה'
      const servings = selection.servings > 1 ? ` (x${selection.servings})` : ''
      
      return `<span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs ml-1 mb-1">${name}${servings}</span>`
    }).join('')
  }

  renderMealCell(date, mealType) {
    const dayPlan = this.currentWeekPlan?.days.find(d => d.date === date)
    const meals = dayPlan ? (mealType === 'lunch' ? dayPlan.lunch : dayPlan.dinner) : []

    if (!meals || meals.length === 0) {
      return this.renderEmptyCell(date, mealType)
    }

    return `
      <div class="space-y-1">
        ${meals.map(selection => {
          const menuItem = this.menuItems.find(m => m.id === selection.menuItemId)
          const name = menuItem ? menuItem.name : 'מנה לא זמינה'
          const servings = selection.servings > 1 ? ` (x${selection.servings})` : ''
          
          return `
            <div class="flex items-center justify-between">
              <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">${name}${servings}</span>
              <button class="text-red-600 hover:text-red-800 ml-2" onclick="app.removeMeal('${date}', '${mealType}', '${selection.menuItemId}')">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
          `
        }).join('')}
        <button class="text-blue-600 hover:text-blue-800 text-sm w-full text-center py-1 border border-dashed border-blue-300 rounded" onclick="app.addMealToDay('${date}', '${mealType}')">
          <i class="fas fa-plus ml-1"></i>
          הוסף מנה
        </button>
      </div>
    `
  }

  renderEmptyCell(date, mealType) {
    return `
      <button class="w-full h-16 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded text-gray-500 hover:text-blue-600 transition-colors" onclick="app.addMealToDay('${date}', '${mealType}')">
        <i class="fas fa-plus mb-1"></i><br>
        <span class="text-xs">הוסף מנה</span>
      </button>
    `
  }

  bindEvents() {
    // Action buttons
    document.getElementById('btn-add-child')?.addEventListener('click', () => this.showAddChildModal())
    document.getElementById('btn-add-meal')?.addEventListener('click', () => this.showAddMealModal())
    document.getElementById('btn-grocery-list')?.addEventListener('click', () => this.showGroceryListModal())
    document.getElementById('btn-chat')?.addEventListener('click', () => this.showChatModal())
  }

  // Utility functions
  generateWeekDays(startDate) {
    if (!startDate) {
      // Default to current Saturday
      const now = new Date()
      const dayOfWeek = now.getDay()
      const daysToSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek + 7) % 7
      const saturday = new Date(now)
      saturday.setDate(now.getDate() - daysToSaturday)
      startDate = saturday.toISOString().split('T')[0]
    }
    
    const start = new Date(startDate + 'T00:00:00')
    const days = []
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day.toISOString().split('T')[0])
    }
    
    return days
  }

  formatWeekRange() {
    if (!this.currentWeek || this.currentWeek.length === 0) return ''
    
    const start = this.formatHebrewDate(this.currentWeek[0])
    const end = this.formatHebrewDate(this.currentWeek[6])
    
    return `${start} - ${end}`
  }

  formatHebrewDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short'
    })
  }

  showLoading(show) {
    const overlay = document.getElementById('loading-overlay')
    if (overlay) {
      overlay.classList.toggle('hidden', !show)
    }
    this.isLoading = show
  }

  showMessage(message, type = 'info') {
    const container = document.getElementById('messages-container')
    if (!container) return

    const messageId = 'msg-' + Date.now()
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }

    const messageEl = document.createElement('div')
    messageEl.id = messageId
    messageEl.className = `${colors[type] || colors.info} text-white px-4 py-2 rounded shadow-lg transform transition-all duration-300 translate-x-full`
    messageEl.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button onclick="document.getElementById('${messageId}').remove()" class="mr-2 hover:text-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `

    container.appendChild(messageEl)
    
    // Animate in
    setTimeout(() => messageEl.classList.remove('translate-x-full'), 100)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (document.getElementById(messageId)) {
        messageEl.classList.add('translate-x-full')
        setTimeout(() => messageEl.remove(), 300)
      }
    }, 5000)
  }

  showError(message) {
    this.showMessage(message, 'error')
  }

  showSuccess(message) {
    this.showMessage(message, 'success')
  }

  // Privacy consent methods
  renderPrivacyConsent() {
    const appContainer = document.getElementById('app')
    if (!appContainer) return

    appContainer.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <div class="card">
          <div class="text-center mb-6">
            <i class="fas fa-shield-alt text-4xl text-blue-600 mb-4"></i>
            <h2 class="text-2xl font-bold">ברוכים הבאים למתכנן הארוחות המשפחתי</h2>
            <p class="text-gray-600 mt-2">לפני שנתחיל, חשוב לנו שתדע כיצד אנו שומרים על הפרטיות שלך</p>
          </div>

          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 class="font-bold mb-3"><i class="fas fa-info-circle ml-2"></i>תקציר מהיר (TL;DR)</h3>
            <ul class="text-sm space-y-2">
              <li>• <strong>אין חשבון, אין ענן</strong> - הכל נשמר במכשיר שלך בלבד</li>
              <li>• <strong>מינימום נתונים</strong> - רק מה שנחוץ לתכנון ארוחות</li>  
              <li>• <strong>שליטה מלאה</strong> - אפשר למחוק הכל בכל רגע</li>
              <li>• <strong>אין שיתוף</strong> - הנתונים לא עוזבים את המכשיר</li>
            </ul>
          </div>

          <div class="text-center">
            <div class="flex items-center justify-center mb-4">
              <input type="checkbox" id="privacy-consent" class="ml-3">
              <label for="privacy-consent" class="text-sm">
                קראתי והבנתי את עקרונות הפרטיות. אני מסכים/ה להתחיל להשתמש באפליקציה
              </label>
            </div>
            
            <div class="space-x-reverse space-x-4">
              <button id="btn-accept-privacy" class="btn btn-primary" disabled>
                <i class="fas fa-check ml-2"></i>
                מסכים ומתחיל
              </button>
              <a href="/privacy" class="btn btn-secondary">
                <i class="fas fa-scroll ml-2"></i>
                קרא מדיניות מלאה
              </a>
            </div>
          </div>
        </div>
      </div>
    `

    // Bind privacy consent events
    const checkbox = document.getElementById('privacy-consent')
    const acceptBtn = document.getElementById('btn-accept-privacy')
    
    checkbox?.addEventListener('change', () => {
      acceptBtn.disabled = !checkbox.checked
    })

    acceptBtn?.addEventListener('click', async () => {
      if (checkbox?.checked) {
        await this.acceptPrivacyConsent()
      }
    })
  }

  async acceptPrivacyConsent() {
    try {
      this.showLoading(true)
      
      const response = await axios.post('/api/privacy/consent', {
        hasConsented: true,
        version: '1.0'
      })

      if (response.data.success) {
        this.hasConsent = true
        await this.loadInitialData()
        this.renderMainInterface()
        this.bindEvents()
        this.showSuccess('ברוכים הבאים! אפשר להתחיל בתכנון')
      } else {
        this.showError('שגיאה ברישום ההסכמה')
      }
    } catch (error) {
      console.error('שגיאה בהסכמת פרטיות:', error)
      this.showError('שגיאה ברישום ההסכמה')
    } finally {
      this.showLoading(false)
    }
  }

  // Modal and interaction methods will be added in part 2...
  showAddChildModal() {
    // TODO: Implement add child modal
    console.log('Opening add child modal')
  }

  showAddMealModal() {
    // TODO: Implement add meal modal  
    console.log('Opening add meal modal')
  }

  showGroceryListModal() {
    // TODO: Implement grocery list modal
    console.log('Opening grocery list modal')
  }

  showChatModal() {
    // TODO: Implement chat modal
    console.log('Opening chat modal')
  }

  addMealToDay(date, mealType) {
    // TODO: Implement add meal to day
    console.log('Adding meal to', date, mealType)
  }

  editChildBreakfast(date, childId) {
    // TODO: Implement edit child breakfast
    console.log('Editing breakfast for', childId, 'on', date)
  }

  removeMeal(date, mealType, menuItemId) {
    // TODO: Implement remove meal
    console.log('Removing meal', menuItemId, 'from', date, mealType)
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MealPlannerApp()
})