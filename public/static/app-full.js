// Full Meal Planner Application - Progressive Implementation
// Starting with working data loading

class MealPlannerApp {
  constructor() {
    this.currentWeekPlan = null
    this.children = []
    this.menuItems = []
    this.currentWeek = null
    this.pantryItems = []
    this.isLoading = false
    this.hasConsent = true // Always allow access for now
    
    this.init()
  }

  async init() {
    console.log('🚀 מאתחל את מתכנן הארוחות המלא...')
    
    try {
      // Skip privacy check for now - just load data
      await this.loadInitialData()
      this.renderMainInterface()
      this.renderDataSections()
      this.bindEvents()
    } catch (error) {
      console.error('שגיאה באתחול האפליקציה:', error)
      this.renderErrorState('שגיאה באתחול המערכת')
    }
  }

  async loadInitialData() {
    console.log('🔄 מתחיל לטעון נתונים מהשרת...')
    
    try {
      // Load children, menu items, and current week plan
      const [childrenRes, menuItemsRes, weekPlanRes] = await Promise.all([
        axios.get('/api/children'),
        axios.get('/api/menu-items?activeOnly=true'),
        axios.get('/api/week-plan/current')
      ])

      console.log('📡 קיבל תגובות מהשרת')
      console.log('👥 ילדים:', childrenRes.data.success ? childrenRes.data.data?.length : 'שגיאה')
      console.log('🍽️ מנות:', menuItemsRes.data.success ? menuItemsRes.data.data?.length : 'שגיאה')
      console.log('📅 תכנון שבוע:', weekPlanRes.data.success ? 'קיים' : 'לא קיים')

      // Process children data
      if (childrenRes.data.success) {
        this.children = childrenRes.data.data || []
        console.log('✅ טען', this.children.length, 'ילדים')
      } else {
        console.error('❌ שגיאה בטעינת ילדים:', childrenRes.data.error)
        this.children = []
      }

      // Process menu items data
      if (menuItemsRes.data.success) {
        this.menuItems = menuItemsRes.data.data || []
        console.log('✅ טען', this.menuItems.length, 'מנות')
      } else {
        console.error('❌ שגיאה בטעינת מנות:', menuItemsRes.data.error)
        this.menuItems = []
      }

      // Process week plan data
      if (weekPlanRes.data.success && weekPlanRes.data.data) {
        this.currentWeekPlan = weekPlanRes.data.data
        this.currentWeek = this.generateWeekDays(this.currentWeekPlan.days[0]?.date)
        console.log('✅ טען תכנון שבוע קיים')
      } else {
        this.currentWeek = this.generateWeekDays()
        console.log('📝 יצר שבוע חדש - התחלה מהתאריך הנוכחי')
      }

      console.log('🎉 כל הנתונים נטענו בהצלחה!')
      
    } catch (error) {
      console.error('❌ שגיאה בטעינת נתונים:', error)
      throw error
    }
  }

  renderMainInterface() {
    console.log('🎨 מרנדר ממשק ראשי...')
    const appContainer = document.getElementById('app')
    if (!appContainer) {
      console.error('❌ לא נמצא container #app')
      return
    }

    appContainer.innerHTML = `
      <!-- Status Bar -->
      <div id="status-bar" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-reverse space-x-2">
            <span class="text-blue-600 font-medium">מצב המערכת:</span>
            <span id="system-status" class="text-green-600">מוכן לעבודה ✅</span>
          </div>
          <div class="text-sm text-gray-600">
            נתונים: <span id="data-summary">טוען...</span>
          </div>
        </div>
      </div>

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
        <button id="btn-plan-week" class="btn btn-info">
          <i class="fas fa-calendar-alt ml-2"></i>
          תכנון שבוע
        </button>
        <button id="btn-grocery-list" class="btn btn-success">
          <i class="fas fa-shopping-cart ml-2"></i>
          רשימת מצרכים
        </button>
        <button id="btn-chat" class="btn btn-warning">
          <i class="fas fa-comments ml-2"></i>
          צ'אט חכם
        </button>
      </div>

      <!-- Main Content Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Children Section -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-center">👥 הילדים במשפחה</h2>
            <span id="children-count" class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">0</span>
          </div>
          <div id="children-list" class="space-y-2">
            <p class="text-gray-500 text-center">טוען ילדים...</p>
          </div>
        </div>

        <!-- Menu Items Section -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-center">🍽️ מנות זמינות</h2>
            <span id="meals-count" class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">0</span>
          </div>
          <div id="menu-items-list" class="space-y-2">
            <p class="text-gray-500 text-center">טוען מנות...</p>
          </div>
        </div>

        <!-- Week Plan Section -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-center">📅 תכנון השבוע</h2>
            <span id="week-status" class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">חדש</span>
          </div>
          <div id="week-plan-summary">
            <p class="text-gray-500 text-center">טוען תכנון...</p>
          </div>
        </div>
      </div>

      <!-- Debug Section (removable later) -->
      <div class="card bg-gray-50 border-gray-200">
        <h3 class="font-bold mb-2">🔧 מידע טכני (לפיתוח)</h3>
        <div id="debug-info" class="text-sm text-gray-600 font-mono">
          <div>נתונים: טוען...</div>
        </div>
      </div>

      <!-- Modals Container -->
      <div id="modals-container"></div>
    `
    
    console.log('✅ ממשק ראשי נוצר')
  }

  renderDataSections() {
    console.log('📊 מרנדר סקציות נתונים...')
    
    // Update system status
    this.updateSystemStatus()
    
    // Render children
    this.renderChildrenSection()
    
    // Render menu items
    this.renderMenuItemsSection()
    
    // Render week plan
    this.renderWeekPlanSection()
    
    // Update debug info
    this.updateDebugInfo()
  }

  updateSystemStatus() {
    const statusEl = document.getElementById('system-status')
    const summaryEl = document.getElementById('data-summary')
    
    if (statusEl) {
      statusEl.textContent = 'מוכן לעבודה ✅'
    }
    
    if (summaryEl) {
      summaryEl.textContent = `${this.children.length} ילדים, ${this.menuItems.length} מנות`
    }
  }

  renderChildrenSection() {
    const container = document.getElementById('children-list')
    const countEl = document.getElementById('children-count')
    
    if (!container) return
    
    if (countEl) {
      countEl.textContent = this.children.length.toString()
    }
    
    if (this.children.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center text-sm">עדיין לא הוספו ילדים<br><span class="text-xs">לחץ על "הוסף ילד/ה" כדי להתחיל</span></p>'
      return
    }
    
    container.innerHTML = this.children.map(child => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div class="flex items-center space-x-reverse space-x-2">
          <div class="w-4 h-4 rounded-full" style="background-color: ${child.color}"></div>
          <span class="font-medium">${child.name}</span>
        </div>
        <div class="flex flex-wrap gap-1">
          ${child.dietaryTags.map(tag => `
            <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">${tag}</span>
          `).join('')}
        </div>
      </div>
    `).join('')
  }

  renderMenuItemsSection() {
    const container = document.getElementById('menu-items-list')
    const countEl = document.getElementById('meals-count')
    
    if (!container) return
    
    if (countEl) {
      countEl.textContent = this.menuItems.length.toString()
    }
    
    if (this.menuItems.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center text-sm">עדיין לא הוגדרו מנות<br><span class="text-xs">לחץ על "הוסף מנה" כדי להתחיל</span></p>'
      return
    }
    
    const recentMeals = this.menuItems.slice(0, 5) // Show first 5
    container.innerHTML = recentMeals.map(meal => `
      <div class="p-2 bg-gray-50 rounded border">
        <div class="font-medium text-sm">${meal.name}</div>
        <div class="text-xs text-gray-600 mt-1">
          <span class="inline-block ml-2">🍽️ ${meal.mealTypes.join(', ')}</span>
          <span class="inline-block">👥 ${meal.defaultServings} מנות</span>
        </div>
      </div>
    `).join('') + (this.menuItems.length > 5 ? `
      <div class="text-center text-sm text-gray-500 mt-2">
        ועוד ${this.menuItems.length - 5} מנות...
      </div>
    ` : '')
  }

  renderWeekPlanSection() {
    const container = document.getElementById('week-plan-summary')
    const statusEl = document.getElementById('week-status')
    
    if (!container) return
    
    if (statusEl) {
      statusEl.textContent = this.currentWeekPlan ? 'קיים' : 'חדש'
    }
    
    if (!this.currentWeekPlan) {
      container.innerHTML = `
        <p class="text-gray-500 text-center text-sm">אין תכנון שבוע פעיל</p>
        <div class="text-center mt-3">
          <button class="btn btn-sm btn-primary">התחל תכנון חדש</button>
        </div>
      `
      return
    }
    
    // Show week plan summary
    container.innerHTML = `
      <div class="text-sm">
        <div class="font-medium mb-2">שבוע נוכחי</div>
        <div class="text-gray-600">
          <div>תאריכים: ${this.formatWeekRange()}</div>
          <div>ילדים: ${this.currentWeekPlan.children?.length || 0}</div>
          <div>ימים מתוכננים: ${this.currentWeekPlan.days?.length || 0}</div>
        </div>
      </div>
    `
  }

  updateDebugInfo() {
    const container = document.getElementById('debug-info')
    if (!container) return
    
    container.innerHTML = `
      <div>ילדים: ${this.children.length} (${this.children.map(c => c.name).join(', ') || 'אין'})</div>
      <div>מנות: ${this.menuItems.length} סוגים</div>
      <div>שבוע נוכחי: ${this.currentWeek ? this.currentWeek[0] + ' - ' + this.currentWeek[6] : 'לא מוגדר'}</div>
      <div>תכנון שבוע: ${this.currentWeekPlan ? 'קיים' : 'לא קיים'}</div>
      <div>זמן עדכון: ${new Date().toLocaleTimeString('he-IL')}</div>
    `
  }

  bindEvents() {
    console.log('🔗 מחבר אירועים לכפתורים...')
    
    // Button click handlers with basic functionality
    document.getElementById('btn-add-child')?.addEventListener('click', () => {
      console.log('🖱️ לחיצה על הוסף ילד')
      this.showAddChildModal()
    })
    
    document.getElementById('btn-add-meal')?.addEventListener('click', () => {
      console.log('🖱️ לחיצה על הוסף מנה')
      this.showAddMealModal()
    })
    
    document.getElementById('btn-plan-week')?.addEventListener('click', () => {
      console.log('🖱️ לחיצה על תכנון שבוע')
      alert('תכנון שבוע - בפיתוח\nיתווסף בקרוב!')
    })
    
    document.getElementById('btn-grocery-list')?.addEventListener('click', () => {
      console.log('🖱️ לחיצה על רשימת מצרכים')
      this.showGroceryListPreview()
    })
    
    document.getElementById('btn-chat')?.addEventListener('click', () => {
      console.log('🖱️ לחיצה על צ\'אט חכם')
      alert('צ\'אט חכם - בפיתוח\nיתווסף בקרוב!')
    })
    
    console.log('✅ כל האירועים חוברו')
  }

  showGroceryListPreview() {
    // Basic grocery list based on menu items
    const ingredients = []
    this.menuItems.forEach(meal => {
      meal.ingredients?.forEach(ing => {
        const existing = ingredients.find(i => i.name === ing.name)
        if (existing) {
          existing.quantity += ing.quantity
        } else {
          ingredients.push({...ing})
        }
      })
    })
    
    const message = ingredients.length > 0 
      ? `רשימת מצרכים בסיסית:\n\n${ingredients.slice(0, 10).map(ing => 
          `• ${ing.name} - ${ing.quantity} ${ing.unit}`
        ).join('\n')}\n${ingredients.length > 10 ? `\n... ועוד ${ingredients.length - 10} פריטים` : ''}`
      : 'אין מנות להכנת רשימת מצרכים'
    
    alert(message)
  }

  renderErrorState(message) {
    const appContainer = document.getElementById('app')
    if (!appContainer) return
    
    appContainer.innerHTML = `
      <div class="card bg-red-50 border-red-200 text-center">
        <div class="text-red-600 mb-4">
          <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <h2 class="text-xl font-bold">שגיאה במערכת</h2>
          <p class="text-sm">${message}</p>
        </div>
        <button onclick="location.reload()" class="btn btn-primary">
          <i class="fas fa-redo ml-2"></i>
          נסה שנית
        </button>
      </div>
    `
  }

  // Utility functions
  generateWeekDays(startDate) {
    if (!startDate) {
      // Default to current Saturday (start of Hebrew week)
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
    if (!this.currentWeek || this.currentWeek.length === 0) return 'לא מוגדר'
    
    const start = new Date(this.currentWeek[0])
    const end = new Date(this.currentWeek[6])
    
    return `${start.toLocaleDateString('he-IL')} - ${end.toLocaleDateString('he-IL')}`
  }

  // Modal Functions for Children Management
  showAddChildModal() {
    console.log('📝 מציג מודאל הוספת ילד')
    
    const modalHtml = `
      <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="add-child-modal">
        <div class="modal-content bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div class="modal-header flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">הוסף ילד/ה חדש/ה</h3>
            <button onclick="app.closeModal('add-child-modal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <form id="add-child-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">שם הילד/ה *</label>
              <input type="text" id="child-name" class="input w-full" placeholder="לדוגמה: נועה, דניאל, מיכל" required>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">צבע זיהוי</label>
              <div class="flex space-x-reverse space-x-2">
                <input type="color" id="child-color" class="w-12 h-8 rounded border" value="#ff6b6b">
                <span class="text-sm text-gray-600 flex-1">בחר צבע לזיהוי הילד בתכניות</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">תגיות תזונה (אופציונלי)</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input type="checkbox" value="צמחוני" class="ml-2">
                  <span>צמחוני</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="ללא גלוטן" class="ml-2">
                  <span>ללא גלוטן</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="ללא לקטוז" class="ml-2">
                  <span>ללא לקטוז</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="אלרגיה לאגוזים" class="ml-2">
                  <span>אלרגיה לאגוזים</span>
                </label>
              </div>
            </div>
          </form>
          
          <div class="modal-footer flex justify-end space-x-reverse space-x-2 mt-6">
            <button onclick="app.closeModal('add-child-modal')" class="btn btn-secondary">ביטול</button>
            <button onclick="app.submitAddChild()" class="btn btn-primary">
              <i class="fas fa-plus ml-2"></i>
              הוסף ילד/ה
            </button>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('modals-container').innerHTML = modalHtml
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.remove()
    }
  }

  async submitAddChild() {
    console.log('📤 שולח בקשת הוספת ילד')
    
    try {
      const name = document.getElementById('child-name').value.trim()
      const color = document.getElementById('child-color').value
      const dietaryTags = Array.from(document.querySelectorAll('#add-child-form input[type="checkbox"]:checked'))
        .map(cb => cb.value)

      if (!name) {
        alert('אנא הזן שם לילד/ה')
        return
      }

      // Check if name already exists
      if (this.children.find(child => child.name === name)) {
        alert('ילד/ה עם השם הזה כבר קיים/ת')
        return
      }
      
      console.log('📊 נתוני ילד חדש:', { name, color, dietaryTags })

      const response = await axios.post('/api/children', {
        name,
        color,
        dietaryTags
      })

      if (response.data.success) {
        console.log('✅ ילד נוסף בהצלחה:', response.data.data)
        
        // Add to local array
        this.children.push(response.data.data)
        
        // Re-render children section
        this.renderChildrenSection()
        this.updateSystemStatus()
        this.updateDebugInfo()
        
        // Close modal
        this.closeModal('add-child-modal')
        
        // Show success message
        alert(`${name} נוסף/ה בהצלחה! 🎉`)
        
      } else {
        console.error('❌ שגיאה בהוספת ילד:', response.data.error)
        alert('שגיאה בהוספת הילד/ה: ' + (response.data.error || 'שגיאה לא מוכרת'))
      }
      
    } catch (error) {
      console.error('❌ שגיאה בשליחת הבקשה:', error)
      alert('שגיאה בחיבור לשרת. אנא נסה שנית.')
    }
  }

  renderChildrenSection() {
    const container = document.getElementById('children-list')
    const countEl = document.getElementById('children-count')
    
    if (!container) return
    
    if (countEl) {
      countEl.textContent = this.children.length.toString()
    }
    
    if (this.children.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center text-sm">עדיין לא הוספו ילדים<br><span class="text-xs">לחץ על "הוסף ילד/ה" כדי להתחיל</span></p>'
      return
    }
    
    container.innerHTML = this.children.map(child => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
        <div class="flex items-center space-x-reverse space-x-3">
          <div class="w-4 h-4 rounded-full" style="background-color: ${child.color}"></div>
          <span class="font-medium">${child.name}</span>
        </div>
        <div class="flex items-center space-x-reverse space-x-2">
          ${child.dietaryTags.length > 0 ? `
            <div class="flex flex-wrap gap-1">
              ${child.dietaryTags.map(tag => `
                <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">${tag}</span>
              `).join('')}
            </div>
          ` : ''}
          <div class="flex space-x-reverse space-x-1">
            <button onclick="app.editChild('${child.id}')" class="text-blue-600 hover:text-blue-800 p-1" title="ערוך">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="app.deleteChild('${child.id}', '${child.name}')" class="text-red-600 hover:text-red-800 p-1" title="מחק">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('')
  }

  editChild(childId) {
    const child = this.children.find(c => c.id === childId)
    if (!child) {
      alert('ילד לא נמצא')
      return
    }
    
    console.log('✏️ עריכת ילד:', child.name)
    
    const modalHtml = `
      <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="edit-child-modal">
        <div class="modal-content bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div class="modal-header flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">ערוך פרטי ילד/ה</h3>
            <button onclick="app.closeModal('edit-child-modal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <form id="edit-child-form" class="space-y-4">
            <input type="hidden" id="edit-child-id" value="${child.id}">
            
            <div>
              <label class="block text-sm font-medium mb-1">שם הילד/ה *</label>
              <input type="text" id="edit-child-name" class="input w-full" value="${child.name}" required>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">צבע זיהוי</label>
              <div class="flex space-x-reverse space-x-2">
                <input type="color" id="edit-child-color" class="w-12 h-8 rounded border" value="${child.color}">
                <span class="text-sm text-gray-600 flex-1">בחר צבע לזיהוי הילד בתכניות</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">תגיות תזונה</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input type="checkbox" value="צמחוני" class="ml-2" ${child.dietaryTags.includes('צמחוני') ? 'checked' : ''}>
                  <span>צמחוני</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="ללא גלוטן" class="ml-2" ${child.dietaryTags.includes('ללא גלוטן') ? 'checked' : ''}>
                  <span>ללא גלוטן</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="ללא לקטוז" class="ml-2" ${child.dietaryTags.includes('ללא לקטוז') ? 'checked' : ''}>
                  <span>ללא לקטוז</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="אלרגיה לאגוזים" class="ml-2" ${child.dietaryTags.includes('אלרגיה לאגוזים') ? 'checked' : ''}>
                  <span>אלרגיה לאגוזים</span>
                </label>
              </div>
            </div>
          </form>
          
          <div class="modal-footer flex justify-end space-x-reverse space-x-2 mt-6">
            <button onclick="app.closeModal('edit-child-modal')" class="btn btn-secondary">ביטול</button>
            <button onclick="app.submitEditChild()" class="btn btn-primary">
              <i class="fas fa-save ml-2"></i>
              שמור שינויים
            </button>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('modals-container').innerHTML = modalHtml
  }

  async submitEditChild() {
    console.log('💾 שומר שינויים בילד')
    
    try {
      const id = document.getElementById('edit-child-id').value
      const name = document.getElementById('edit-child-name').value.trim()
      const color = document.getElementById('edit-child-color').value
      const dietaryTags = Array.from(document.querySelectorAll('#edit-child-form input[type="checkbox"]:checked'))
        .map(cb => cb.value)

      if (!name) {
        alert('אנא הזן שם לילד/ה')
        return
      }

      console.log('📊 נתונים מעודכנים:', { id, name, color, dietaryTags })

      const response = await axios.put(`/api/children/${id}`, {
        name,
        color,
        dietaryTags
      })

      if (response.data.success) {
        console.log('✅ ילד עודכן בהצלחה:', response.data.data)
        
        // Update in local array
        const index = this.children.findIndex(c => c.id === id)
        if (index !== -1) {
          this.children[index] = response.data.data
        }
        
        // Re-render children section
        this.renderChildrenSection()
        this.updateDebugInfo()
        
        // Close modal
        this.closeModal('edit-child-modal')
        
        // Show success message
        alert(`פרטי ${name} עודכנו בהצלחה! 💾`)
        
      } else {
        console.error('❌ שגיאה בעדכון ילד:', response.data.error)
        alert('שגיאה בעדכון הילד/ה: ' + (response.data.error || 'שגיאה לא מוכרת'))
      }
      
    } catch (error) {
      console.error('❌ שגיאה בשליחת הבקשה:', error)
      alert('שגיאה בחיבור לשרת. אנא נסה שנית.')
    }
  }

  async deleteChild(childId, childName) {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את ${childName}?\n\nפעולה זו תמחק את הילד/ה מכל התכניות השבועיות.`)) {
      return
    }
    
    console.log('🗑️ מוחק ילד:', childName)
    
    try {
      const response = await axios.delete(`/api/children/${childId}`)

      if (response.data.success) {
        console.log('✅ ילד נמחק בהצלחה')
        
        // Remove from local array
        this.children = this.children.filter(c => c.id !== childId)
        
        // Re-render children section
        this.renderChildrenSection()
        this.updateSystemStatus()
        this.updateDebugInfo()
        
        alert(`${childName} נמחק/ה בהצלחה 🗑️`)
        
      } else {
        console.error('❌ שגיאה במחיקת ילד:', response.data.error)
        alert('שגיאה במחיקת הילד/ה: ' + (response.data.error || 'שגיאה לא מוכרת'))
      }
      
    } catch (error) {
      console.error('❌ שגיאה בשליחת הבקשה:', error)
      alert('שגיאה בחיבור לשרת. אנא נסה שנית.')
    }
  }

  // Modal Functions for Menu Items Management
  showAddMealModal() {
    console.log('🍽️ מציג מודאל הוספת מנה')
    
    const modalHtml = `
      <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="add-meal-modal">
        <div class="modal-content bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="modal-header flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">הוסף מנה חדשה</h3>
            <button onclick="app.closeModal('add-meal-modal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <form id="add-meal-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">שם המנה *</label>
              <input type="text" id="meal-name" class="input w-full" placeholder="לדוגמה: פסטה בולונז, סלט ירוק, עוגת שוקולד" required>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">סוג ארוחה *</label>
              <div class="flex flex-wrap gap-3">
                <label class="flex items-center">
                  <input type="checkbox" value="breakfast" class="ml-2">
                  <span>ארוחת בוקר</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="lunch" class="ml-2">
                  <span>ארוחת צהריים</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="dinner" class="ml-2">
                  <span>ארוחת ערב</span>
                </label>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">כמות מנות ברירת מחדל</label>
              <input type="number" id="meal-servings" class="input w-32" value="4" min="1" max="20">
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">תגיות</label>
              <div class="flex flex-wrap gap-3">
                <label class="flex items-center">
                  <input type="checkbox" value="צמחוני" class="ml-2">
                  <span>צמחוני</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="חלבון" class="ml-2">
                  <span>חלבון</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="ירקות" class="ml-2">
                  <span>ירקות</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="מהיר" class="ml-2">
                  <span>הכנה מהירה</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="בריא" class="ml-2">
                  <span>בריא</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" value="ללא גלוטן" class="ml-2">
                  <span>ללא גלוטן</span>
                </label>
              </div>
            </div>
            
            <!-- Ingredients Section -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-medium">רכיבים *</label>
                <button type="button" onclick="app.addIngredientRow()" class="btn btn-sm bg-green-600 text-white hover:bg-green-700">
                  <i class="fas fa-plus text-xs ml-1"></i>
                  הוסף רכיב
                </button>
              </div>
              <div id="ingredients-container" class="space-y-2">
                <!-- Initial ingredient row -->
                <div class="ingredient-row flex gap-2 items-center">
                  <input type="text" class="ingredient-name input flex-1" placeholder="שם הרכיב (לדוגמה: עגבניות)" required>
                  <input type="number" class="ingredient-quantity input w-20" placeholder="כמות" min="0.1" step="0.1" required>
                  <select class="ingredient-unit input w-24">
                    <option value="גרם">גרם</option>
                    <option value="קילוגרם">קילוגרם</option>
                    <option value="מיליליטר">מ"ל</option>
                    <option value="ליטר">ליטר</option>
                    <option value="כוס">כוס</option>
                    <option value="כפות">כפות</option>
                    <option value="כפית">כפית</option>
                    <option value="יחידה" selected>יחידה</option>
                    <option value="יחידות">יחידות</option>
                    <option value="חבילה">חבילה</option>
                    <option value="פרוסה">פרוסה</option>
                    <option value="פרוסות">פרוסות</option>
                  </select>
                  <button type="button" onclick="app.removeIngredientRow(this)" class="text-red-600 hover:text-red-800 p-1" title="הסר רכיב">
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </form>
          
          <div class="modal-footer flex justify-end space-x-reverse space-x-2 mt-6">
            <button onclick="app.closeModal('add-meal-modal')" class="btn btn-secondary">ביטול</button>
            <button onclick="app.submitAddMeal()" class="btn btn-primary">
              <i class="fas fa-plus ml-2"></i>
              הוסף מנה
            </button>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('modals-container').innerHTML = modalHtml
  }

  addIngredientRow() {
    const container = document.getElementById('ingredients-container')
    const newRow = document.createElement('div')
    newRow.className = 'ingredient-row flex gap-2 items-center'
    newRow.innerHTML = `
      <input type="text" class="ingredient-name input flex-1" placeholder="שם הרכיב" required>
      <input type="number" class="ingredient-quantity input w-20" placeholder="כמות" min="0.1" step="0.1" required>
      <select class="ingredient-unit input w-24">
        <option value="גרם">גרם</option>
        <option value="קילוגרם">קילוגרם</option>
        <option value="מיליליטר">מ"ל</option>
        <option value="ליטר">ליטר</option>
        <option value="כוס">כוס</option>
        <option value="כפות">כפות</option>
        <option value="כפית">כפית</option>
        <option value="יחידה" selected>יחידה</option>
        <option value="יחידות">יחידות</option>
        <option value="חבילה">חבילה</option>
        <option value="פרוסה">פרוסה</option>
        <option value="פרוסות">פרוסות</option>
      </select>
      <button type="button" onclick="app.removeIngredientRow(this)" class="text-red-600 hover:text-red-800 p-1" title="הסר רכיב">
        <i class="fas fa-trash text-xs"></i>
      </button>
    `
    container.appendChild(newRow)
  }

  removeIngredientRow(button) {
    const container = document.getElementById('ingredients-container')
    const rows = container.querySelectorAll('.ingredient-row')
    
    // Don't allow removing the last row
    if (rows.length > 1) {
      button.closest('.ingredient-row').remove()
    } else {
      alert('חייב להיות לפחות רכיב אחד במנה')
    }
  }

  async submitAddMeal() {
    console.log('🍽️ שולח בקשת הוספת מנה')
    
    try {
      const name = document.getElementById('meal-name').value.trim()
      const servings = parseInt(document.getElementById('meal-servings').value) || 4
      
      const mealTypes = Array.from(document.querySelectorAll('#add-meal-form input[type="checkbox"][value="breakfast"], #add-meal-form input[type="checkbox"][value="lunch"], #add-meal-form input[type="checkbox"][value="dinner"]:checked'))
        .map(cb => cb.value)
      
      const tags = Array.from(document.querySelectorAll('#add-meal-form input[type="checkbox"]:checked'))
        .map(cb => cb.value)
        .filter(value => !['breakfast', 'lunch', 'dinner'].includes(value))

      // Collect ingredients
      const ingredientRows = document.querySelectorAll('.ingredient-row')
      const ingredients = []
      
      for (let row of ingredientRows) {
        const nameEl = row.querySelector('.ingredient-name')
        const quantityEl = row.querySelector('.ingredient-quantity')
        const unitEl = row.querySelector('.ingredient-unit')
        
        const name = nameEl.value.trim()
        const quantity = parseFloat(quantityEl.value)
        const unit = unitEl.value
        
        if (name && quantity && unit) {
          ingredients.push({ name, quantity, unit })
        }
      }

      // Validation
      if (!name) {
        alert('אנא הזן שם למנה')
        return
      }
      
      if (mealTypes.length === 0) {
        alert('אנא בחר לפחות סוג ארוחה אחד')
        return
      }
      
      if (ingredients.length === 0) {
        alert('אנא הוסף לפחות רכיב אחד')
        return
      }

      console.log('📊 נתוני מנה חדשה:', { name, mealTypes, tags, ingredients, servings })

      const response = await axios.post('/api/menu-items', {
        name,
        mealTypes,
        tags,
        ingredients,
        defaultServings: servings
      })

      if (response.data.success) {
        console.log('✅ מנה נוספה בהצלחה:', response.data.data)
        
        // Add to local array
        this.menuItems.push(response.data.data)
        
        // Re-render menu items section
        this.renderMenuItemsSection()
        this.updateSystemStatus()
        this.updateDebugInfo()
        
        // Close modal
        this.closeModal('add-meal-modal')
        
        // Show success message
        alert(`מנה "${name}" נוספה בהצלחה! 🍽️`)
        
      } else {
        console.error('❌ שגיאה בהוספת מנה:', response.data.error)
        alert('שגיאה בהוספת המנה: ' + (response.data.error || 'שגיאה לא מוכרת'))
      }
      
    } catch (error) {
      console.error('❌ שגיאה בשליחת הבקשה:', error)
      alert('שגיאה בחיבור לשרת. אנא נסה שנית.')
    }
  }

  renderMenuItemsSection() {
    const container = document.getElementById('menu-items-list')
    const countEl = document.getElementById('meals-count')
    
    if (!container) return
    
    if (countEl) {
      countEl.textContent = this.menuItems.length.toString()
    }
    
    if (this.menuItems.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center text-sm">עדיין לא הוגדרו מנות<br><span class="text-xs">לחץ על "הוסף מנה" כדי להתחיל</span></p>'
      return
    }
    
    const recentMeals = this.menuItems.slice(0, 5) // Show first 5
    container.innerHTML = recentMeals.map(meal => `
      <div class="p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="font-medium text-sm mb-1">${meal.name}</div>
            <div class="text-xs text-gray-600 mb-2">
              <span class="inline-block ml-3">🍽️ ${meal.mealTypes.map(type => {
                const typeNames = { breakfast: 'בוקר', lunch: 'צהריים', dinner: 'ערב' }
                return typeNames[type] || type
              }).join(', ')}</span>
              <span class="inline-block">👥 ${meal.defaultServings} מנות</span>
            </div>
            ${meal.tags.length > 0 ? `
              <div class="flex flex-wrap gap-1 mb-2">
                ${meal.tags.map(tag => `
                  <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">${tag}</span>
                `).join('')}
              </div>
            ` : ''}
            <div class="text-xs text-gray-500">
              ${meal.ingredients?.slice(0, 3).map(ing => `${ing.name}`).join(', ')}${meal.ingredients?.length > 3 ? '...' : ''}
            </div>
          </div>
          <div class="flex space-x-reverse space-x-1 ml-2">
            <button onclick="app.viewMeal('${meal.id}')" class="text-blue-600 hover:text-blue-800 p-1" title="צפה">
              <i class="fas fa-eye text-xs"></i>
            </button>
            <button onclick="app.editMeal('${meal.id}')" class="text-green-600 hover:text-green-800 p-1" title="ערוך">
              <i class="fas fa-edit text-xs"></i>
            </button>
            <button onclick="app.deleteMeal('${meal.id}', '${meal.name}')" class="text-red-600 hover:text-red-800 p-1" title="מחק">
              <i class="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('') + (this.menuItems.length > 5 ? `
      <div class="text-center text-sm text-gray-500 mt-2">
        ועוד ${this.menuItems.length - 5} מנות...
        <button onclick="app.showAllMeals()" class="text-blue-600 hover:text-blue-800 mr-2">צפה בכל המנות</button>
      </div>
    ` : '')
  }

  viewMeal(mealId) {
    const meal = this.menuItems.find(m => m.id === mealId)
    if (!meal) {
      alert('מנה לא נמצאה')
      return
    }
    
    console.log('👁️ צפיה במנה:', meal.name)
    
    const modalHtml = `
      <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="view-meal-modal">
        <div class="modal-content bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="modal-header flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">פרטי מנה</h3>
            <button onclick="app.closeModal('view-meal-modal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <div class="space-y-4">
            <div>
              <h4 class="font-medium text-lg">${meal.name}</h4>
              <p class="text-sm text-gray-600">
                ${meal.mealTypes.map(type => {
                  const typeNames = { breakfast: 'ארוחת בוקר', lunch: 'ארוחת צהריים', dinner: 'ארוחת ערב' }
                  return typeNames[type] || type
                }).join(' • ')} • ${meal.defaultServings} מנות
              </p>
            </div>
            
            ${meal.tags.length > 0 ? `
              <div>
                <label class="block text-sm font-medium mb-2">תגיות</label>
                <div class="flex flex-wrap gap-2">
                  ${meal.tags.map(tag => `
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">${tag}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <div>
              <label class="block text-sm font-medium mb-2">רכיבים</label>
              <div class="bg-gray-50 rounded-lg p-3">
                ${meal.ingredients?.map(ing => `
                  <div class="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                    <span>${ing.name}</span>
                    <span class="text-gray-600 text-sm">${ing.quantity} ${ing.unit}</span>
                  </div>
                `).join('') || '<p class="text-gray-500 text-center">אין רכיבים</p>'}
              </div>
            </div>
          </div>
          
          <div class="modal-footer flex justify-end space-x-reverse space-x-2 mt-6">
            <button onclick="app.closeModal('view-meal-modal')" class="btn btn-secondary">סגור</button>
            <button onclick="app.closeModal('view-meal-modal'); app.editMeal('${meal.id}')" class="btn btn-primary">
              <i class="fas fa-edit ml-2"></i>
              ערוך מנה
            </button>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('modals-container').innerHTML = modalHtml
  }

  async deleteMeal(mealId, mealName) {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את המנה "${mealName}"?\n\nפעולה זו תמחק את המנה מכל התכניות השבועיות.`)) {
      return
    }
    
    console.log('🗑️ מוחק מנה:', mealName)
    
    try {
      const response = await axios.delete(`/api/menu-items/${mealId}`)

      if (response.data.success) {
        console.log('✅ מנה נמחקה בהצלחה')
        
        // Remove from local array
        this.menuItems = this.menuItems.filter(m => m.id !== mealId)
        
        // Re-render menu items section
        this.renderMenuItemsSection()
        this.updateSystemStatus()
        this.updateDebugInfo()
        
        alert(`מנה "${mealName}" נמחקה בהצלחה 🗑️`)
        
      } else {
        console.error('❌ שגיאה במחיקת מנה:', response.data.error)
        alert('שגיאה במחיקת המנה: ' + (response.data.error || 'שגיאה לא מוכרת'))
      }
      
    } catch (error) {
      console.error('❌ שגיאה בשליחת הבקשה:', error)
      alert('שגיאה בחיבור לשרת. אנא נסה שנית.')
    }
  }

  editMeal(mealId) {
    alert('עריכת מנות תתווסף בקרוב! 🚧\n\nכרגע תוכל להוסיף מנות חדשות ולמחוק קיימות.')
  }

  showAllMeals() {
    alert('תצוגת כל המנות תתווסף בקרוב! 📋\n\nכרגע אתה רואה את 5 המנות הראשונות.')
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM מוכן - מאתחל אפליקציה מלאה...')
  window.app = new MealPlannerApp()
})