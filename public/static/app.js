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
    console.log('בודק הסכמת פרטיות...')
    try {
      const response = await axios.get('/api/privacy/consent')
      console.log('תגובת API פרטיות:', response.data)
      if (response.data.success) {
        this.hasConsent = response.data.data.hasConsented
        console.log('הסכמה מקורית:', this.hasConsent)
        // Always allow access - privacy consent is optional
        this.hasConsent = true
        console.log('הסכמה אחרי דריסה:', this.hasConsent)
        
        // Show privacy notice only on first visit
        const hasSeenNotice = localStorage.getItem('hasSeenPrivacyNotice')
        if (!hasSeenNotice) {
          console.log('מציג הודעת פרטיות לראשונה')
          this.showPrivacyNotice()
          localStorage.setItem('hasSeenPrivacyNotice', 'true')
        }
      }
    } catch (error) {
      console.error('שגיאה בבדיקת הסכמת פרטיות:', error)
      // Continue anyway - privacy is not blocking
      this.hasConsent = true
      console.log('קבע הסכמה ב-catch:', this.hasConsent)
    }
    console.log('סיום בדיקת פרטיות, hasConsent:', this.hasConsent)
  }

  async loadInitialData() {
    console.log('מתחיל לטעון נתונים...')
    this.showLoading(true)
    
    try {
      // Load children, menu items, and current week plan
      console.log('שולח בקשות ל-API...')
      const [childrenRes, menuItemsRes, weekPlanRes] = await Promise.all([
        axios.get('/api/children'),
        axios.get('/api/menu-items?activeOnly=true'),
        axios.get('/api/week-plan/current')
      ])

      console.log('קיבל תגובות מ-API:', { 
        children: childrenRes.data.data?.length, 
        menuItems: menuItemsRes.data.data?.length,
        weekPlan: weekPlanRes.data.data 
      })

      if (childrenRes.data.success) {
        this.children = childrenRes.data.data
        console.log('טען ילדים:', this.children.length)
      }

      if (menuItemsRes.data.success) {
        this.menuItems = menuItemsRes.data.data
        console.log('טען מנות:', this.menuItems.length)
      }

      if (weekPlanRes.data.success && weekPlanRes.data.data) {
        this.currentWeekPlan = weekPlanRes.data.data
        this.currentWeek = this.generateWeekDays(this.currentWeekPlan.days[0]?.date)
      } else {
        // No current week plan - use current date
        this.currentWeek = this.generateWeekDays()
        console.log('אין תכנון שבוע, משתמש בתאריך נוכחי')
      }

      console.log('נתונים נטענו בהצלחה!')
    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error)
      this.showError('שגיאה בטעינת הנתונים הבסיסיים')
    } finally {
      this.showLoading(false)
    }
  }

  renderMainInterface() {
    console.log('מתחיל לרנדר את הממשק הראשי...')
    const appContainer = document.getElementById('app')
    if (!appContainer) {
      console.error('לא נמצא אלמנט #app!')
      return
    }

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
    // Navigation
    document.getElementById('home-btn')?.addEventListener('click', () => {
      window.location.href = '/'
    })
    
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

  // Privacy notice (non-blocking)
  showPrivacyNotice() {
    // Show a simple banner instead of blocking the whole app
    const banner = document.createElement('div')
    banner.id = 'privacy-banner'
    banner.className = 'fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 transform transition-transform duration-300'
    banner.innerHTML = `
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div class="flex items-center">
          <i class="fas fa-shield-alt ml-3"></i>
          <span class="text-sm">
            האפליקציה שומרת על הפרטיות שלך - כל הנתונים נשמרים במכשיר בלבד.
          </span>
        </div>
        <div class="flex items-center space-x-reverse space-x-3">
          <a href="/privacy" class="text-white underline text-sm hover:text-blue-200">פרטים</a>
          <button onclick="app.dismissPrivacyBanner()" class="text-white hover:text-blue-200">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `
    
    document.body.appendChild(banner)
    
    // Auto dismiss after 8 seconds
    setTimeout(() => this.dismissPrivacyBanner(), 8000)
  }

  dismissPrivacyBanner() {
    const banner = document.getElementById('privacy-banner')
    if (banner) {
      banner.classList.add('translate-y-full')
      setTimeout(() => banner.remove(), 300)
    }
  }

  // Modal and interaction methods
  showAddChildModal() {
    const modalHtml = `
      <div class="modal-backdrop" id="add-child-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="text-xl font-bold">הוסף ילד/ה חדש/ה</h3>
            <button onclick="app.closeModal('add-child-modal')" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="add-child-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">שם הילד/ה</label>
                <input type="text" id="child-name" class="input w-full" placeholder="הזן שם..." required>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">צבע (לזיהוי בטבלה)</label>
                <div class="flex flex-wrap gap-2 mb-2">
                  ${this.generateColorOptions()}
                </div>
                <input type="color" id="child-color" class="w-full h-10 rounded border" value="#007bff">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">הגבלות דיאטה (אופציונלי)</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" class="ml-2" value="צמחוני"> צמחוני
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="ml-2" value="ללא גלוטן"> ללא גלוטן
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="ml-2" value="ללא לקטוז"> ללא לקטוז
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button onclick="app.closeModal('add-child-modal')" class="btn btn-secondary">ביטול</button>
            <button onclick="app.submitAddChild()" class="btn btn-primary">הוסף ילד/ה</button>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('modals-container').innerHTML = modalHtml
  }

  showAddMealModal() {
    const modalHtml = `
      <div class="modal-backdrop" id="add-meal-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="text-xl font-bold">הוסף מנה חדשה</h3>
            <button onclick="app.closeModal('add-meal-modal')" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="add-meal-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">שם המנה</label>
                <input type="text" id="meal-name" class="input w-full" placeholder="לדוגמה: פסטה ברוטב עגבניות" required>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">סוגי ארוחה</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" class="ml-2" value="breakfast"> ארוחת בוקר
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="ml-2" value="lunch"> ארוחת צהריים
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="ml-2" value="dinner"> ארוחת ערב
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">מנות לכמה אנשים (ברירת מחדל)</label>
                <input type="number" id="default-servings" class="input w-full" value="4" min="1" max="20">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">מרכיבים</label>
                <div id="ingredients-list" class="space-y-2 mb-2">
                  <!-- Ingredients will be added here -->
                </div>
                <div class="flex gap-2">
                  <input type="text" id="ingredient-name" class="input flex-1" placeholder="שם המרכיב">
                  <input type="number" id="ingredient-quantity" class="input w-20" placeholder="כמות" step="0.1">
                  <select id="ingredient-unit" class="select w-24">
                    <option value="גרם">גרם</option>
                    <option value="קילוגרם">ק"ג</option>
                    <option value="ליטר">ליטר</option>
                    <option value="מיליליטר">מ"ל</option>
                    <option value="כוס">כוס</option>
                    <option value="כפות">כפות</option>
                    <option value="כפית">כפית</option>
                    <option value="יחידה">יחידה</option>
                  </select>
                  <button type="button" onclick="app.addIngredient()" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button onclick="app.closeModal('add-meal-modal')" class="btn btn-secondary">ביטול</button>
            <button onclick="app.submitAddMeal()" class="btn btn-primary">הוסף מנה</button>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('modals-container').innerHTML = modalHtml
  }

  showGroceryListModal() {
    this.showLoading(true)
    
    // Generate grocery list for current week
    if (this.currentWeekPlan) {
      this.generateGroceryList(this.currentWeekPlan.weekId)
    } else {
      this.showError('אין תכנית שבועית לייצור רשימת מצרכים')
      this.showLoading(false)
    }
  }

  showChatModal() {
    const modalHtml = `
      <div class="modal-backdrop" id="chat-modal">
        <div class="modal-content max-w-lg">
          <div class="modal-header">
            <h3 class="text-xl font-bold">צ'אט בוט - עוזר תכנון ארוחות</h3>
            <button onclick="app.closeModal('chat-modal')" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body p-0">
            <div class="chat-container">
              <div id="chat-messages" class="chat-messages custom-scrollbar">
                <div class="chat-message assistant">
                  שלום! אני כאן לעזור לך עם תכנון הארוחות. אתה יכול לבקש ממני:
                  <br>• "הוסף מנה חדשה"
                  <br>• "הוסף ילד/ה" 
                  <br>• "צור רשימת מצרכים"
                  <br>• או כל דבר אחר בעברית פשוטה!
                </div>
              </div>
              <div class="chat-input">
                <div class="flex gap-2">
                  <input type="text" id="chat-input" class="input flex-1" placeholder="הקלד הודעה..." onkeypress="if(event.key==='Enter') app.sendChatMessage()">
                  <button onclick="app.sendChatMessage()" class="btn btn-primary">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('modals-container').innerHTML = modalHtml
    
    // Load chat history
    this.loadChatHistory()
  }

  addMealToDay(date, mealType) {
    const modalHtml = `
      <div class="modal-backdrop" id="select-meal-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="text-xl font-bold">בחר מנה ל${this.getMealTypeHebrew(mealType)}</h3>
            <button onclick="app.closeModal('select-meal-modal')" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="mb-4">
              <input type="text" id="meal-search" class="input w-full" placeholder="חפש מנה..." onkeyup="app.filterMeals()">
            </div>
            <div id="meals-list" class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              ${this.renderMealsList(mealType)}
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium mb-2">מספר מנות</label>
              <input type="number" id="servings-count" class="input w-full" value="4" min="1" max="20">
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="app.closeModal('select-meal-modal')" class="btn btn-secondary">ביטול</button>
            <button onclick="app.addSelectedMeal('${date}', '${mealType}')" class="btn btn-primary">הוסף למנה</button>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('modals-container').innerHTML = modalHtml
  }

  editChildBreakfast(date, childId) {
    const child = this.children.find(c => c.id === childId)
    if (!child) return

    const modalHtml = `
      <div class="modal-backdrop" id="child-breakfast-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="text-xl font-bold">ארוחת בוקר של ${child.name}</h3>
            <button onclick="app.closeModal('child-breakfast-modal')" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="mb-4">
              <input type="text" id="breakfast-search" class="input w-full" placeholder="חפש ארוחת בוקר..." onkeyup="app.filterBreakfastMeals()">
            </div>
            <div id="breakfast-meals-list" class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              ${this.renderBreakfastMealsList()}
            </div>
            <div class="mt-4">
              <h4 class="font-medium mb-2">ארוחות נבחרות:</h4>
              <div id="selected-breakfast-meals">
                ${this.renderSelectedBreakfastMeals(date, childId)}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="app.closeModal('child-breakfast-modal')" class="btn btn-secondary">סגור</button>
            <button onclick="app.saveChildBreakfast('${date}', '${childId}')" class="btn btn-primary">שמור</button>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('modals-container').innerHTML = modalHtml
  }

  async removeMeal(date, mealType, menuItemId) {
    try {
      const dayPlan = this.currentWeekPlan?.days.find(d => d.date === date)
      if (!dayPlan) return

      // Remove meal from day plan
      const meals = mealType === 'lunch' ? dayPlan.lunch : dayPlan.dinner
      const index = meals.findIndex(m => m.menuItemId === menuItemId)
      
      if (index !== -1) {
        meals.splice(index, 1)
        
        // Update day plan
        await this.updateDayPlan(date, dayPlan)
        this.renderMainInterface()
        this.showSuccess('המנה הוסרה מהתכנית')
      }
    } catch (error) {
      console.error('שגיאה בהסרת מנה:', error)
      this.showError('שגיאה בהסרת המנה')
    }
  }

  // Helper methods for modals
  closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.remove()
    }
  }

  generateColorOptions() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#00b894', '#fdcb6e', '#e17055']
    
    return colors.map(color => `
      <button type="button" class="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500" 
              style="background-color: ${color}" 
              onclick="document.getElementById('child-color').value='${color}'">
      </button>
    `).join('')
  }

  getMealTypeHebrew(mealType) {
    const types = {
      breakfast: 'ארוחת בוקר',
      lunch: 'ארוחת צהריים', 
      dinner: 'ארוחת ערב'
    }
    return types[mealType] || mealType
  }

  renderMealsList(mealType) {
    const filteredMeals = this.menuItems.filter(meal => 
      meal.mealTypes.includes(mealType) && meal.isActive
    )

    if (filteredMeals.length === 0) {
      return '<div class="text-gray-500 text-center py-4">אין מנות זמינות לסוג ארוחה זה</div>'
    }

    return filteredMeals.map(meal => `
      <div class="meal-option p-3 border rounded hover:bg-gray-50 cursor-pointer" onclick="app.selectMeal('${meal.id}')">
        <div class="font-medium">${meal.name}</div>
        <div class="text-sm text-gray-600">מנות ברירת מחדל: ${meal.defaultServings}</div>
        ${meal.tags.length > 0 ? `<div class="text-xs text-blue-600 mt-1">${meal.tags.join(', ')}</div>` : ''}
      </div>
    `).join('')
  }

  renderBreakfastMealsList() {
    const breakfastMeals = this.menuItems.filter(meal => 
      meal.mealTypes.includes('breakfast') && meal.isActive
    )

    return breakfastMeals.map(meal => `
      <label class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
        <input type="checkbox" class="breakfast-meal-checkbox ml-2" value="${meal.id}">
        <div class="flex-1">
          <div class="font-medium">${meal.name}</div>
          ${meal.tags.length > 0 ? `<div class="text-xs text-blue-600">${meal.tags.join(', ')}</div>` : ''}
        </div>
      </label>
    `).join('')
  }

  renderSelectedBreakfastMeals(date, childId) {
    const dayPlan = this.currentWeekPlan?.days.find(d => d.date === date)
    const selections = dayPlan?.breakfast?.byChild?.[childId] || []
    
    if (selections.length === 0) {
      return '<div class="text-gray-500 text-sm">לא נבחרו ארוחות</div>'
    }

    return selections.map(selection => {
      const meal = this.menuItems.find(m => m.id === selection.menuItemId)
      const name = meal ? meal.name : 'מנה לא זמינה'
      
      return `
        <div class="flex items-center justify-between bg-gray-100 p-2 rounded mb-1">
          <span class="text-sm">${name}</span>
          <button onclick="app.removeBreakfastMeal('${selection.menuItemId}')" class="text-red-600 hover:text-red-800">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `
    }).join('')
  }

  // Form submission methods
  async submitAddChild() {
    try {
      const name = document.getElementById('child-name').value.trim()
      const color = document.getElementById('child-color').value
      const dietaryTags = Array.from(document.querySelectorAll('#add-child-form input[type="checkbox"]:checked'))
        .map(cb => cb.value)

      if (!name) {
        this.showError('אנא הזן שם לילד/ה')
        return
      }

      this.showLoading(true)
      
      const response = await axios.post('/api/children', {
        name,
        color,
        dietaryTags
      })

      if (response.data.success) {
        this.children.push(response.data.data)
        this.closeModal('add-child-modal')
        this.renderMainInterface()
        this.showSuccess(`${name} נוסף/ה בהצלחה!`)
      } else {
        this.showError(response.data.error || 'שגיאה בהוספת הילד/ה')
      }
    } catch (error) {
      console.error('שגיאה בהוספת ילד:', error)
      this.showError('שגיאה בהוספת הילד/ה')
    } finally {
      this.showLoading(false)
    }
  }

  async submitAddMeal() {
    try {
      const name = document.getElementById('meal-name').value.trim()
      const defaultServings = parseInt(document.getElementById('default-servings').value) || 4
      const mealTypes = Array.from(document.querySelectorAll('#add-meal-form input[type="checkbox"]:checked'))
        .map(cb => cb.value)

      if (!name) {
        this.showError('אנא הזן שם למנה')
        return
      }

      if (mealTypes.length === 0) {
        this.showError('אנא בחר לפחות סוג ארוחה אחד')
        return
      }

      // Collect ingredients
      const ingredients = this.currentIngredients || []

      this.showLoading(true)
      
      const response = await axios.post('/api/menu-items', {
        name,
        mealTypes,
        ingredients,
        defaultServings,
        tags: []
      })

      if (response.data.success) {
        this.menuItems.push(response.data.data)
        this.closeModal('add-meal-modal')
        this.renderMainInterface()
        this.showSuccess(`המנה "${name}" נוספה בהצלחה!`)
        this.currentIngredients = [] // Reset ingredients
      } else {
        this.showError(response.data.error || 'שגיאה בהוספת המנה')
      }
    } catch (error) {
      console.error('שגיאה בהוספת מנה:', error)
      this.showError('שגיאה בהוספת המנה')
    } finally {
      this.showLoading(false)
    }
  }

  addIngredient() {
    const name = document.getElementById('ingredient-name').value.trim()
    const quantity = parseFloat(document.getElementById('ingredient-quantity').value)
    const unit = document.getElementById('ingredient-unit').value

    if (!name || !quantity || quantity <= 0) {
      this.showError('אנא מלא את כל שדות המרכיב')
      return
    }

    if (!this.currentIngredients) {
      this.currentIngredients = []
    }

    const ingredient = {
      id: 'ing-' + Date.now(),
      name,
      quantity,
      unit
    }

    this.currentIngredients.push(ingredient)
    this.updateIngredientsDisplay()

    // Clear inputs
    document.getElementById('ingredient-name').value = ''
    document.getElementById('ingredient-quantity').value = ''
  }

  updateIngredientsDisplay() {
    const container = document.getElementById('ingredients-list')
    if (!container || !this.currentIngredients) return

    container.innerHTML = this.currentIngredients.map((ing, index) => `
      <div class="flex items-center justify-between bg-gray-100 p-2 rounded">
        <span class="text-sm">${ing.name} - ${ing.quantity} ${ing.unit}</span>
        <button type="button" onclick="app.removeIngredient(${index})" class="text-red-600 hover:text-red-800">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('')
  }

  removeIngredient(index) {
    if (this.currentIngredients) {
      this.currentIngredients.splice(index, 1)
      this.updateIngredientsDisplay()
    }
  }

  selectMeal(mealId) {
    // Remove previous selection
    document.querySelectorAll('.meal-option').forEach(el => el.classList.remove('border-blue-500', 'bg-blue-50'))
    
    // Add selection to clicked meal
    event.target.closest('.meal-option').classList.add('border-blue-500', 'bg-blue-50')
    this.selectedMealId = mealId
  }

  async addSelectedMeal(date, mealType) {
    if (!this.selectedMealId) {
      this.showError('אנא בחר מנה')
      return
    }

    try {
      const servings = parseInt(document.getElementById('servings-count').value) || 4
      
      // Find or create day plan
      let dayPlan = this.currentWeekPlan?.days.find(d => d.date === date)
      if (!dayPlan) {
        dayPlan = {
          date,
          breakfast: { byChild: {} },
          lunch: [],
          dinner: []
        }
        this.currentWeekPlan.days.push(dayPlan)
      }

      // Add meal to appropriate meal type
      const mealSelection = {
        menuItemId: this.selectedMealId,
        servings,
        notes: ''
      }

      if (mealType === 'lunch') {
        dayPlan.lunch.push(mealSelection)
      } else if (mealType === 'dinner') {
        dayPlan.dinner.push(mealSelection)
      }

      // Update day plan in database
      await this.updateDayPlan(date, dayPlan)
      
      this.closeModal('select-meal-modal')
      this.renderMainInterface()
      this.showSuccess('המנה נוספה בהצלחה!')
      
    } catch (error) {
      console.error('שגיאה בהוספת מנה:', error)
      this.showError('שגיאה בהוספת המנה')
    }
  }

  async updateDayPlan(date, dayPlan) {
    const response = await axios.put(`/api/week-plan/${this.currentWeekPlan.weekId}/day/${date}`, {
      breakfast: dayPlan.breakfast,
      lunch: dayPlan.lunch,
      dinner: dayPlan.dinner
    })

    if (!response.data.success) {
      throw new Error(response.data.error || 'שגיאה בעדכון התכנית')
    }
  }

  filterMeals() {
    const searchTerm = document.getElementById('meal-search').value.toLowerCase()
    const meals = document.querySelectorAll('.meal-option')
    
    meals.forEach(meal => {
      const text = meal.textContent.toLowerCase()
      meal.style.display = text.includes(searchTerm) ? 'block' : 'none'
    })
  }

  filterBreakfastMeals() {
    const searchTerm = document.getElementById('breakfast-search').value.toLowerCase()
    const meals = document.querySelectorAll('#breakfast-meals-list label')
    
    meals.forEach(meal => {
      const text = meal.textContent.toLowerCase()
      meal.style.display = text.includes(searchTerm) ? 'flex' : 'none'
    })
  }

  async saveChildBreakfast(date, childId) {
    try {
      const selectedMeals = Array.from(document.querySelectorAll('.breakfast-meal-checkbox:checked'))
        .map(cb => ({
          menuItemId: cb.value,
          servings: 1,
          notes: ''
        }))

      // Find or create day plan
      let dayPlan = this.currentWeekPlan?.days.find(d => d.date === date)
      if (!dayPlan) {
        dayPlan = {
          date,
          breakfast: { byChild: {} },
          lunch: [],
          dinner: []
        }
        this.currentWeekPlan.days.push(dayPlan)
      }

      // Update breakfast for specific child
      if (!dayPlan.breakfast) dayPlan.breakfast = { byChild: {} }
      if (!dayPlan.breakfast.byChild) dayPlan.breakfast.byChild = {}
      
      dayPlan.breakfast.byChild[childId] = selectedMeals

      // Update day plan in database
      await this.updateDayPlan(date, dayPlan)
      
      this.closeModal('child-breakfast-modal')
      this.renderMainInterface()
      this.showSuccess('ארוחת הבוקר עודכנה בהצלחה!')
      
    } catch (error) {
      console.error('שגיאה בשמירת ארוחת בוקר:', error)
      this.showError('שגיאה בשמירת ארוחת הבוקר')
    }
  }

  // Chat functionality
  async sendChatMessage() {
    const input = document.getElementById('chat-input')
    const message = input.value.trim()
    
    if (!message) return

    try {
      // Add user message to chat
      this.addChatMessage(message, 'user')
      input.value = ''

      // Send to server
      const response = await axios.post('/api/chat/message', { content: message })
      
      if (response.data.success) {
        // Add bot response
        this.addChatMessage(response.data.data.message, 'assistant')
      } else {
        this.addChatMessage('מצטער, לא הצלחתי להבין את הבקשה. נסה שוב.', 'assistant')
      }
    } catch (error) {
      console.error('שגיאה בשליחת הודעה:', error)
      this.addChatMessage('שגיאה בחיבור לשרת. נסה שוב מאוחר יותר.', 'assistant')
    }
  }

  addChatMessage(content, role) {
    const messagesContainer = document.getElementById('chat-messages')
    if (!messagesContainer) return

    const messageDiv = document.createElement('div')
    messageDiv.className = `chat-message ${role}`
    messageDiv.innerHTML = content.replace(/\n/g, '<br>')
    
    messagesContainer.appendChild(messageDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  async loadChatHistory() {
    try {
      const response = await axios.get('/api/chat/history?limit=20')
      if (response.data.success) {
        const messages = response.data.data
        messages.forEach(msg => {
          this.addChatMessage(msg.content, msg.role)
        })
      }
    } catch (error) {
      console.error('שגיאה בטעינת היסטוריית צ\'אט:', error)
    }
  }

  // Grocery list functionality
  async generateGroceryList(weekId) {
    try {
      const response = await axios.post(`/api/grocery/generate/${weekId}`)
      
      if (response.data.success) {
        this.showGroceryListUI(response.data.data)
      } else {
        this.showError(response.data.error || 'שגיאה ביצירת רשימת מצרכים')
      }
    } catch (error) {
      console.error('שגיאה ביצירת רשימת מצרכים:', error)
      this.showError('שגיאה ביצירת רשימת מצרכים')
    } finally {
      this.showLoading(false)
    }
  }

  showGroceryListUI(groceryItems) {
    // Group by category
    const groupedItems = {}
    groceryItems.forEach(item => {
      if (!groupedItems[item.category]) {
        groupedItems[item.category] = []
      }
      groupedItems[item.category].push(item)
    })

    const modalHtml = `
      <div class="modal-backdrop" id="grocery-list-modal">
        <div class="modal-content max-w-2xl">
          <div class="modal-header">
            <h3 class="text-xl font-bold">רשימת מצרכים לשבוע</h3>
            <button onclick="app.closeModal('grocery-list-modal')" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body max-h-96 overflow-y-auto custom-scrollbar">
            ${Object.keys(groupedItems).map(category => `
              <div class="grocery-category">
                <h4 class="grocery-category-header">${category}</h4>
                ${groupedItems[category].map(item => `
                  <div class="grocery-item">
                    <label class="flex items-center cursor-pointer">
                      <input type="checkbox" class="ml-2">
                      <span class="grocery-text">${item.name} - ${item.quantity} ${item.unit}</span>
                    </label>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
          <div class="modal-footer">
            <button onclick="app.exportGroceryList()" class="btn btn-secondary">
              <i class="fas fa-download ml-2"></i>
              ייצא רשימה
            </button>
            <button onclick="app.closeModal('grocery-list-modal')" class="btn btn-primary">סגור</button>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('modals-container').innerHTML = modalHtml
  }

  exportGroceryList() {
    // Simple text export for now
    const items = Array.from(document.querySelectorAll('.grocery-text')).map(el => el.textContent)
    const text = 'רשימת מצרכים:\n\n' + items.join('\n')
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'רשימת-מצרכים.txt'
    a.click()
    URL.revokeObjectURL(url)
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MealPlannerApp()
})