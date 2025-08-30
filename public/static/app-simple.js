// Simple test version of the app

class MealPlannerApp {
  constructor() {
    this.init()
  }

  async init() {
    console.log('מאתחל את מתכנן הארוחות...')
    this.renderMainInterface()
    this.bindEvents()
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
        <button id="btn-chat" class="btn btn-info">
          <i class="fas fa-comments ml-2"></i>
          צ'אט חכם
        </button>
      </div>

      <!-- Main Content Area -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Children Card -->
        <div class="card">
          <h2 class="text-xl font-bold mb-4 text-center">הילדים במשפחה</h2>
          <div id="children-list" class="space-y-2">
            <p class="text-gray-500 text-center">עדיין לא הוספו ילדים</p>
          </div>
        </div>

        <!-- Week Plan Card -->
        <div class="card">
          <h2 class="text-xl font-bold mb-4 text-center">תכנון השבוע</h2>
          <div id="week-summary">
            <p class="text-gray-500 text-center">לא נבחר תכנון שבוע</p>
          </div>
        </div>

        <!-- Menu Items Card -->
        <div class="card">
          <h2 class="text-xl font-bold mb-4 text-center">מנות זמינות</h2>
          <div id="menu-items-summary">
            <p class="text-gray-500 text-center">עדיין לא הוגדרו מנות</p>
          </div>
        </div>
      </div>

      <!-- Modals Container -->
      <div id="modals-container"></div>
    `
    
    console.log('הממשק הראשי נרנדר בהצלחה!')
  }

  bindEvents() {
    console.log('מחבר אירועים...')
    
    // Button click handlers
    document.getElementById('btn-add-child')?.addEventListener('click', () => {
      alert('הוסף ילד/ה - בפיתוח')
    })
    
    document.getElementById('btn-add-meal')?.addEventListener('click', () => {
      alert('הוסף מנה - בפיתוח')
    })
    
    document.getElementById('btn-grocery-list')?.addEventListener('click', () => {
      alert('רשימת מצרכים - בפיתוח')
    })
    
    document.getElementById('btn-chat')?.addEventListener('click', () => {
      alert('צ\'אט חכם - בפיתוח')
    })
    
    console.log('אירועים חוברו בהצלחה!')
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM מוכן, מאתחל אפליקציה...')
  window.app = new MealPlannerApp()
})