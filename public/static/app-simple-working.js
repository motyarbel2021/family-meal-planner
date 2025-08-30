// Simple Working Meal Planner Application
// This version works without backend database

class SimpleMealPlannerApp {
  constructor() {
    this.currentWeekPlan = null
    this.children = []
    this.menuItems = []
    this.currentWeek = null
    this.hasConsent = true
    
    this.init()
  }

  async init() {
    console.log('🚀 מאתחל את מתכנן הארוחות הפשוט...')
    
    try {
      // Load from localStorage instead of server
      this.loadLocalData()
      this.renderMainInterface()
      this.renderDataSections()
      this.bindEvents()
      console.log('✅ האפליקציה נטענה בהצלחה!')
    } catch (error) {
      console.error('שגיאה באתחול האפליקציה:', error)
      this.renderErrorState('שגיאה באתחול המערכת')
    }
  }

  loadLocalData() {
    console.log('🔄 טוען נתונים מהאחסון המקומי...')
    
    // Load data from localStorage or use defaults
    this.children = JSON.parse(localStorage.getItem('children') || '[]')
    this.menuItems = JSON.parse(localStorage.getItem('menuItems') || '[]')
    this.currentWeekPlan = JSON.parse(localStorage.getItem('currentWeekPlan') || 'null')
    
    // Initialize current week if needed
    if (!this.currentWeek) {
      this.currentWeek = this.getCurrentWeekData()
    }
    
    console.log('📊 נתונים נטענו:', {
      children: this.children.length,
      menuItems: this.menuItems.length,
      weekPlan: this.currentWeekPlan ? 'קיים' : 'לא קיים'
    })
  }

  getCurrentWeekData() {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date.toISOString().split('T')[0])
    }
    
    return {
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: days[6],
      days: days
    }
  }

  renderMainInterface() {
    console.log('🎨 מציג ממשק ראשי...')
    
    const appContainer = document.getElementById('app')
    if (!appContainer) return

    appContainer.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <!-- Header Actions -->
        <div class="mb-6 flex flex-wrap gap-4 justify-center">
          <button id="add-child-btn" class="btn btn-primary">
            <i class="fas fa-child ml-2"></i>
            הוסף ילד
          </button>
          <button id="add-menu-item-btn" class="btn btn-success">
            <i class="fas fa-utensils ml-2"></i>
            הוסף מנה חדשה
          </button>
          <button id="chatbot-btn" class="btn btn-secondary">
            <i class="fas fa-robot ml-2"></i>
            צ'אט חכם
          </button>
          <button id="grocery-list-btn" class="btn btn-primary">
            <i class="fas fa-shopping-cart ml-2"></i>
            רשימת קניות
          </button>
        </div>

        <!-- Week Planning Grid -->
        <div class="card mb-6">
          <h2 class="text-xl font-bold mb-4 text-center">תכנון שבועי</h2>
          <div id="week-grid" class="overflow-x-auto">
            <!-- Week grid will be rendered here -->
          </div>
        </div>

        <!-- Data Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card">
            <h3 class="text-lg font-bold mb-4">ילדים במשפחה</h3>
            <div id="children-list"></div>
          </div>
          <div class="card">
            <h3 class="text-lg font-bold mb-4">מנות זמינות</h3>
            <div id="menu-items-list"></div>
          </div>
        </div>
      </div>
    `
  }

  renderDataSections() {
    this.renderChildrenList()
    this.renderMenuItemsList()
    this.renderWeekGrid()
  }

  renderChildrenList() {
    const container = document.getElementById('children-list')
    if (!container) return

    if (this.children.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-4">אין ילדים רשומים עדיין</p>'
      return
    }

    container.innerHTML = this.children.map(child => `
      <div class="flex justify-between items-center p-3 border rounded mb-2">
        <div>
          <span class="font-medium">${child.name}</span>
          <span class="text-sm text-gray-500 mr-2">(גיל ${child.age || 'לא צוין'})</span>
        </div>
        <button onclick="app.removeChild('${child.id}')" class="text-red-500 hover:text-red-700">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('')
  }

  renderMenuItemsList() {
    const container = document.getElementById('menu-items-list')
    if (!container) return

    if (this.menuItems.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-4">אין מנות זמינות עדיין</p>'
      return
    }

    container.innerHTML = this.menuItems.map(item => `
      <div class="flex justify-between items-center p-3 border rounded mb-2">
        <div>
          <span class="font-medium">${item.name}</span>
          <div class="text-sm text-gray-500">${(item.mealTypes || []).join(', ')}</div>
        </div>
        <button onclick="app.removeMenuItem('${item.id}')" class="text-red-500 hover:text-red-700">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('')
  }

  renderWeekGrid() {
    const container = document.getElementById('week-grid')
    if (!container) return

    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    const mealTypes = ['ארוחת בוקר', 'ארוחת צהריים', 'ארוחת ערב']

    container.innerHTML = `
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="border p-2 bg-gray-50">יום</th>
            ${mealTypes.map(meal => `<th class="border p-2 bg-gray-50">${meal}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${days.map((day, index) => `
            <tr>
              <td class="border p-2 font-medium bg-gray-50">${day}</td>
              ${mealTypes.map(meal => `
                <td class="border p-2 min-w-[150px] h-20">
                  <div class="meal-slot" data-day="${index}" data-meal="${meal}">
                    <button class="w-full h-full border-2 border-dashed border-gray-300 rounded text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors">
                      <i class="fas fa-plus"></i>
                      הוסף מנה
                    </button>
                  </div>
                </td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  bindEvents() {
    console.log('🔗 מחבר אירועים...')

    // Add child button
    const addChildBtn = document.getElementById('add-child-btn')
    if (addChildBtn) {
      addChildBtn.addEventListener('click', () => this.showAddChildModal())
    }

    // Add menu item button
    const addMenuItemBtn = document.getElementById('add-menu-item-btn')
    if (addMenuItemBtn) {
      addMenuItemBtn.addEventListener('click', () => this.showAddMenuItemModal())
    }

    // Chatbot button
    const chatbotBtn = document.getElementById('chatbot-btn')
    if (chatbotBtn) {
      chatbotBtn.addEventListener('click', () => this.showChatbotModal())
    }

    // Grocery list button
    const groceryListBtn = document.getElementById('grocery-list-btn')
    if (groceryListBtn) {
      groceryListBtn.addEventListener('click', () => this.showGroceryListModal())
    }

    // Meal slot clicks
    document.querySelectorAll('.meal-slot button').forEach(button => {
      button.addEventListener('click', (e) => {
        const slot = e.target.closest('.meal-slot')
        const day = slot.dataset.day
        const meal = slot.dataset.meal
        this.showAddMealModal(day, meal)
      })
    })
  }

  showAddChildModal() {
    const modal = this.createModal('הוסף ילד חדש', `
      <form id="add-child-form">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">שם הילד</label>
          <input type="text" id="child-name" class="input w-full" required>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">גיל</label>
          <input type="number" id="child-age" class="input w-full" min="0" max="25">
        </div>
        <div class="flex gap-3">
          <button type="submit" class="btn btn-primary flex-1">הוסף ילד</button>
          <button type="button" class="btn btn-secondary flex-1" onclick="app.closeModal()">ביטול</button>
        </div>
      </form>
    `)

    document.getElementById('add-child-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const name = document.getElementById('child-name').value
      const age = document.getElementById('child-age').value
      
      this.addChild(name, age)
      this.closeModal()
    })
  }

  showAddMenuItemModal() {
    const modal = this.createModal('הוסף מנה חדשה', `
      <form id="add-menu-item-form">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">שם המנה</label>
          <input type="text" id="menu-item-name" class="input w-full" required>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">סוג הארוחה</label>
          <div class="grid grid-cols-3 gap-2">
            <label class="flex items-center">
              <input type="checkbox" value="ארוחת בוקר" class="ml-2"> ארוחת בוקר
            </label>
            <label class="flex items-center">
              <input type="checkbox" value="ארוחת צהריים" class="ml-2"> ארוחת צהריים
            </label>
            <label class="flex items-center">
              <input type="checkbox" value="ארוחת ערב" class="ml-2"> ארוחת ערב
            </label>
          </div>
        </div>
        <div class="flex gap-3">
          <button type="submit" class="btn btn-primary flex-1">הוסף מנה</button>
          <button type="button" class="btn btn-secondary flex-1" onclick="app.closeModal()">ביטול</button>
        </div>
      </form>
    `)

    document.getElementById('add-menu-item-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const name = document.getElementById('menu-item-name').value
      const mealTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)
      
      this.addMenuItem(name, mealTypes)
      this.closeModal()
    })
  }

  showChatbotModal() {
    const modal = this.createModal('צ'אט חכם - עוזר תכנון ארוחות', `
      <div class="mb-4">
        <div id="chat-messages" class="bg-gray-50 p-4 rounded h-64 overflow-y-auto mb-4">
          <div class="text-center text-gray-500">שלום! אני כאן לעזור לך לתכנן ארוחות. איך אוכל לעזור?</div>
        </div>
        <div class="flex gap-2">
          <input type="text" id="chat-input" class="input flex-1" placeholder="הקלד הודעה...">
          <button id="send-message" class="btn btn-primary">שלח</button>
        </div>
      </div>
      <button class="btn btn-secondary w-full" onclick="app.closeModal()">סגור</button>
    `)

    // Simple chatbot responses
    document.getElementById('send-message').addEventListener('click', () => {
      const input = document.getElementById('chat-input')
      const message = input.value.trim()
      if (message) {
        this.addChatMessage('אתה', message)
        this.addChatMessage('עוזר', this.getChatbotResponse(message))
        input.value = ''
      }
    })

    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('send-message').click()
      }
    })
  }

  showGroceryListModal() {
    const modal = this.createModal('רשימת קניות', `
      <div class="mb-4">
        <h4 class="font-medium mb-2">רשימה בסיסית לקניות:</h4>
        <div class="bg-gray-50 p-4 rounded">
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>לחם</li>
            <li>חלב</li>
            <li>ביצים</li>
            <li>פירות וירקות</li>
            <li>בשר או דגים</li>
            <li>אורז או פסטה</li>
          </ul>
          <p class="text-xs text-gray-500 mt-2">
            הוסף מנות ותכנן שבוע כדי לקבל רשימת קניות מותאמת!
          </p>
        </div>
      </div>
      <button class="btn btn-secondary w-full" onclick="app.closeModal()">סגור</button>
    `)
  }

  addChild(name, age) {
    const child = {
      id: Date.now().toString(),
      name: name,
      age: parseInt(age) || null,
      createdAt: new Date().toISOString()
    }
    
    this.children.push(child)
    this.saveToLocalStorage()
    this.renderChildrenList()
  }

  addMenuItem(name, mealTypes) {
    const menuItem = {
      id: Date.now().toString(),
      name: name,
      mealTypes: mealTypes,
      createdAt: new Date().toISOString()
    }
    
    this.menuItems.push(menuItem)
    this.saveToLocalStorage()
    this.renderMenuItemsList()
  }

  removeChild(id) {
    this.children = this.children.filter(child => child.id !== id)
    this.saveToLocalStorage()
    this.renderChildrenList()
  }

  removeMenuItem(id) {
    this.menuItems = this.menuItems.filter(item => item.id !== id)
    this.saveToLocalStorage()
    this.renderMenuItemsList()
  }

  saveToLocalStorage() {
    localStorage.setItem('children', JSON.stringify(this.children))
    localStorage.setItem('menuItems', JSON.stringify(this.menuItems))
    localStorage.setItem('currentWeekPlan', JSON.stringify(this.currentWeekPlan))
  }

  createModal(title, content) {
    const modal = document.createElement('div')
    modal.id = 'modal'
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50'
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4 modal-content">
        <h3 class="text-lg font-bold mb-4">${title}</h3>
        ${content}
      </div>
    `
    
    document.body.appendChild(modal)
    return modal
  }

  closeModal() {
    const modal = document.getElementById('modal')
    if (modal) {
      modal.remove()
    }
  }

  addChatMessage(sender, message) {
    const messagesContainer = document.getElementById('chat-messages')
    if (messagesContainer) {
      const messageDiv = document.createElement('div')
      messageDiv.className = `mb-2 ${sender === 'אתה' ? 'text-left' : 'text-right'}`
      messageDiv.innerHTML = `
        <div class="inline-block p-2 rounded ${sender === 'אתה' ? 'bg-blue-100' : 'bg-green-100'} max-w-xs">
          <strong>${sender}:</strong> ${message}
        </div>
      `
      messagesContainer.appendChild(messageDiv)
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  getChatbotResponse(message) {
    const responses = [
      'זה נשמע נהדר! איך אוכל לעזור לך יותר?',
      'רעיון מעולה לתכנון הארוחות!',
      'המליץ להוסיף ירקות ופירות לתפריט',
      'אל תשכח לשתות הרבה מים!',
      'מה דעתך על ארוחה בריאה יותר?'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  renderErrorState(message) {
    const appContainer = document.getElementById('app')
    if (appContainer) {
      appContainer.innerHTML = `
        <div class="text-center py-12">
          <div class="text-red-500 text-6xl mb-4">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h2 class="text-2xl font-bold text-red-600 mb-2">שגיאה במערכת</h2>
          <p class="text-gray-600 mb-6">${message}</p>
          <button onclick="location.reload()" class="btn btn-primary">
            <i class="fas fa-sync-alt ml-2"></i>
            נסה שנית
          </button>
        </div>
      `
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM מוכן - מאתחל אפליקציה פשוטה...')
  window.app = new SimpleMealPlannerApp()
})