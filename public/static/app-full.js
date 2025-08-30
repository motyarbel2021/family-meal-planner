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
      statusEl.textContent = this.currentWeekPlan ? 'פעיל' : 'חדש'
      statusEl.className = this.currentWeekPlan 
        ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm'
        : 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm'
    }
    
    if (!this.currentWeekPlan) {
      container.innerHTML = `
        <p class="text-gray-500 text-center text-sm mb-3">אין תכנון שבוע פעיל</p>
        <div class="text-center">
          <button onclick="app.showWeekPlanningModal()" class="btn btn-sm btn-primary">
            <i class="fas fa-calendar-plus mr-1"></i>
            התחל תכנון חדש
          </button>
        </div>
      `
      return
    }
    
    // Calculate plan statistics
    let totalMeals = 0
    let plannedDays = 0
    
    this.currentWeekPlan.days?.forEach(day => {
      let dayHasMeals = false
      
      // Count breakfast meals
      Object.values(day.breakfast || {}).forEach(childMeals => {
        totalMeals += (childMeals || []).length
        if ((childMeals || []).length > 0) dayHasMeals = true
      })
      
      // Count lunch and dinner meals
      totalMeals += (day.lunch || []).length
      totalMeals += (day.dinner || []).length
      
      if ((day.lunch || []).length > 0 || (day.dinner || []).length > 0) {
        dayHasMeals = true
      }
      
      if (dayHasMeals) plannedDays++
    })
    
    // Show week plan summary
    container.innerHTML = `
      <div class="text-sm space-y-2">
        <div class="font-medium text-green-700">תכנון שבוע פעיל ✅</div>
        <div class="text-gray-600 space-y-1">
          <div class="flex justify-between">
            <span>תאריכים:</span>
            <span class="font-mono text-xs">${this.formatWeekRange()}</span>
          </div>
          <div class="flex justify-between">
            <span>ילדים:</span>
            <span>${this.currentWeekPlan.children?.length || 0}</span>
          </div>
          <div class="flex justify-between">
            <span>ימים מתוכננים:</span>
            <span>${plannedDays}/7</span>
          </div>
          <div class="flex justify-between">
            <span>סה"כ מנות:</span>
            <span>${totalMeals}</span>
          </div>
        </div>
        <div class="flex gap-1 mt-3">
          <button onclick="app.showWeekPlanningModal()" class="btn btn-xs bg-blue-500 text-white hover:bg-blue-600">
            <i class="fas fa-edit mr-1"></i>
            ערוך
          </button>
          <button onclick="app.viewWeekPlan()" class="btn btn-xs bg-green-500 text-white hover:bg-green-600">
            <i class="fas fa-eye mr-1"></i>
            צפה
          </button>
          <button onclick="app.clearWeekPlan()" class="btn btn-xs bg-red-500 text-white hover:bg-red-600">
            <i class="fas fa-trash mr-1"></i>
            נקה
          </button>
        </div>
      </div>
    `
  }

  viewWeekPlan() {
    if (!this.currentWeekPlan) {
      alert('אין תכנון שבוע פעיל')
      return
    }
    
    console.log('👁️ צפיה בתכנון שבוע')
    
    const dayNames = ['שבת', 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי']
    
    let planSummary = `📅 תכנון השבוע - ${this.formatWeekRange()}\n\n`
    
    this.currentWeekPlan.days?.forEach((day, index) => {
      const dayName = dayNames[index]
      const date = new Date(day.date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })
      
      planSummary += `${dayName} (${date}):\n`
      
      // Breakfast
      let hasBreakfast = false
      Object.entries(day.breakfast || {}).forEach(([childId, meals]) => {
        if (meals && meals.length > 0) {
          const child = this.children.find(c => c.id === childId)
          const childName = child ? child.name : 'ילד לא מוכר'
          planSummary += `  🌅 בוקר - ${childName}: ${meals.map(m => {
            const meal = this.menuItems.find(mi => mi.id === m.menuItemId)
            return meal ? `${meal.name} (${m.servings})` : 'מנה לא מוכרת'
          }).join(', ')}\n`
          hasBreakfast = true
        }
      })
      
      // Lunch
      if (day.lunch && day.lunch.length > 0) {
        planSummary += `  🍽️ צהריים: ${day.lunch.map(m => {
          const meal = this.menuItems.find(mi => mi.id === m.menuItemId)
          return meal ? `${meal.name} (${m.servings})` : 'מנה לא מוכרת'
        }).join(', ')}\n`
      }
      
      // Dinner
      if (day.dinner && day.dinner.length > 0) {
        planSummary += `  🌙 ערב: ${day.dinner.map(m => {
          const meal = this.menuItems.find(mi => mi.id === m.menuItemId)
          return meal ? `${meal.name} (${m.servings})` : 'מנה לא מוכרת'
        }).join(', ')}\n`
      }
      
      if (!hasBreakfast && (!day.lunch || day.lunch.length === 0) && (!day.dinner || day.dinner.length === 0)) {
        planSummary += `  ללא ארוחות מתוכננות\n`
      }
      
      planSummary += '\n'
    })
    
    alert(planSummary)
  }

  async clearWeekPlan() {
    if (!this.currentWeekPlan) {
      alert('אין תכנון שבוע פעיל למחיקה')
      return
    }
    
    if (!confirm('האם אתה בטוח שברצונך למחוק את תכנון השבוע?\n\nפעולה זו בלתי הפיכה.')) {
      return
    }
    
    console.log('🗑️ מוחק תכנון שבוע')
    
    try {
      const response = await axios.delete(`/api/week-plan/${this.currentWeekPlan.id}`)
      
      if (response.data.success) {
        console.log('✅ תכנון שבוע נמחק בהצלחה')
        
        // Clear local data
        this.currentWeekPlan = null
        
        // Update UI
        this.renderWeekPlanSection()
        this.updateDebugInfo()
        
        alert('תכנון השבוע נמחק בהצלחה 🗑️')
        
      } else {
        console.error('❌ שגיאה במחיקת תכנון:', response.data.error)
        alert('שגיאה במחיקת התכנון: ' + (response.data.error || 'שגיאה לא מוכרת'))
      }
      
    } catch (error) {
      console.error('❌ שגיאה בשליחת הבקשה:', error)
      alert('שגיאה בחיבור לשרת. אנא נסה שנית.')
    }
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

  // Grocery List Methods
  async showGroceryListModal() {
    try {
      this.showModal();
      this.modalContent.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-hidden">
          <h3 class="text-2xl font-bold mb-6 text-right">רשימת קניות</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-[70vh]">
            <div>
              <h4 class="text-lg font-semibold mb-3 text-right">שבועות זמינים</h4>
              <div id="available-weeks" class="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                <div class="text-gray-500 text-right">טוען...</div>
              </div>
              <button id="generate-grocery-btn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-4" disabled>
                צור רשימת קניות
              </button>
            </div>
            <div>
              <h4 class="text-lg font-semibold mb-3 text-right flex justify-between items-center">
                <span>רשימת הקניות</span>
                <span id="grocery-status" class="text-sm text-gray-500"></span>
              </h4>
              <div id="grocery-list" class="border rounded p-4 h-96 overflow-y-auto">
                <div class="text-gray-500 text-right">בחר שבוע כדי ליצור רשימת קניות</div>
              </div>
              <div class="flex gap-2 mt-4">
                <button id="edit-grocery-btn" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1" disabled>
                  ערוך רשימה
                </button>
                <button id="export-grocery-btn" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex-1" disabled>
                  ייצא רשימה
                </button>
                <button id="save-grocery-btn" class="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 flex-1 hidden">
                  שמור שינויים
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button onclick="familyMealPlanner.hideModal()" class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
              סגור
            </button>
          </div>
        </div>
      `;

      await this.loadAvailableWeeks();
      this.setupGroceryListEvents();
    } catch (error) {
      console.error('Error showing grocery list modal:', error);
      this.showError('שגיאה בפתיחת רשימת הקניות');
    }
  }

  async loadAvailableWeeks() {
    try {
      const response = await axios.get('/api/week-plan');
      const weekPlans = response.data;
      const container = document.getElementById('available-weeks');
      
      if (!weekPlans || weekPlans.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-right">אין תכניות שבוע זמינות</div>';
        return;
      }

      container.innerHTML = weekPlans.map(plan => `
        <div class="week-option border rounded p-3 hover:bg-gray-50 cursor-pointer" 
             data-week-id="${plan.week_id}">
          <div class="text-right font-medium">${this.formatWeekRange(plan.start_date, plan.end_date)}</div>
          <div class="text-right text-sm text-gray-600">
            ${JSON.parse(plan.children_data || '[]').length} ילדים
          </div>
        </div>
      `).join('');

      // Add click events to week options
      container.querySelectorAll('.week-option').forEach(option => {
        option.addEventListener('click', () => this.selectWeekForGrocery(option));
      });

    } catch (error) {
      console.error('Error loading available weeks:', error);
      document.getElementById('available-weeks').innerHTML = 
        '<div class="text-red-500 text-right">שגיאה בטעינת השבועות</div>';
    }
  }

  selectWeekForGrocery(weekElement) {
    // Remove selection from other weeks
    document.querySelectorAll('.week-option').forEach(el => {
      el.classList.remove('bg-blue-100', 'border-blue-500');
    });

    // Select current week
    weekElement.classList.add('bg-blue-100', 'border-blue-500');
    
    // Enable generate button
    const generateBtn = document.getElementById('generate-grocery-btn');
    generateBtn.disabled = false;
    generateBtn.dataset.weekId = weekElement.dataset.weekId;
  }

  setupGroceryListEvents() {
    document.getElementById('generate-grocery-btn').addEventListener('click', () => {
      this.generateGroceryList();
    });

    document.getElementById('edit-grocery-btn').addEventListener('click', () => {
      this.editGroceryList();
    });

    document.getElementById('export-grocery-btn').addEventListener('click', () => {
      this.exportGroceryList();
    });

    document.getElementById('save-grocery-btn')?.addEventListener('click', () => {
      this.saveGroceryChanges();
    });
  }

  async generateGroceryList() {
    try {
      const weekId = document.getElementById('generate-grocery-btn').dataset.weekId;
      if (!weekId) {
        alert('יש לבחור שבוע');
        return;
      }

      document.getElementById('grocery-status').textContent = 'יוצר רשימת קניות...';
      
      const response = await axios.post(`/api/grocery-list/${weekId}`);
      const groceryData = response.data;
      
      this.displayGroceryList(groceryData);
      
      // Enable action buttons
      document.getElementById('edit-grocery-btn').disabled = false;
      document.getElementById('export-grocery-btn').disabled = false;
      document.getElementById('grocery-status').textContent = 'רשימה מוכנה';

    } catch (error) {
      console.error('Error generating grocery list:', error);
      alert('שגיאה ביצירת רשימת הקניות');
      document.getElementById('grocery-status').textContent = 'שגיאה';
    }
  }

  displayGroceryList(groceryData) {
    const container = document.getElementById('grocery-list');
    
    if (!groceryData.ingredients || groceryData.ingredients.length === 0) {
      container.innerHTML = '<div class="text-gray-500 text-right">אין מרכיבים ברשימה</div>';
      return;
    }

    // Group ingredients by category
    const categories = {};
    groceryData.ingredients.forEach(item => {
      const category = item.category || 'כללי';
      if (!categories[category]) categories[category] = [];
      categories[category].push(item);
    });

    container.innerHTML = Object.entries(categories).map(([category, items]) => `
      <div class="grocery-category mb-4">
        <h5 class="font-bold text-right border-b pb-2 mb-2">${category}</h5>
        <div class="grocery-items space-y-1">
          ${items.map(item => `
            <div class="grocery-item flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                 data-ingredient="${item.ingredient}">
              <div class="flex items-center gap-2">
                <input type="checkbox" class="item-checkbox" ${item.purchased ? 'checked' : ''}>
                <span class="item-quantity text-sm text-gray-600">${item.quantity} ${item.unit}</span>
              </div>
              <span class="item-name ${item.purchased ? 'line-through text-gray-500' : ''}">${item.ingredient}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Add event listeners for checkboxes
    container.querySelectorAll('.item-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const item = e.target.closest('.grocery-item');
        const itemName = item.querySelector('.item-name');
        if (e.target.checked) {
          itemName.classList.add('line-through', 'text-gray-500');
        } else {
          itemName.classList.remove('line-through', 'text-gray-500');
        }
      });
    });

    // Store data for editing
    container.dataset.groceryData = JSON.stringify(groceryData);
  }

  editGroceryList() {
    const container = document.getElementById('grocery-list');
    const isEditing = container.classList.contains('editing');

    if (!isEditing) {
      // Enter edit mode
      container.classList.add('editing');
      container.querySelectorAll('.item-quantity').forEach(el => {
        const text = el.textContent.trim();
        const [quantity, unit] = text.split(' ');
        el.innerHTML = `
          <input type="number" class="quantity-input w-16 text-sm border rounded px-1" 
                 value="${quantity}" step="0.1" min="0">
          <select class="unit-input text-sm border rounded px-1">
            <option value="יח'" ${unit === "יח'" ? 'selected' : ''}>יח'</option>
            <option value="קג" ${unit === 'קג' ? 'selected' : ''}>קג</option>
            <option value="גר" ${unit === 'גר' ? 'selected' : ''}>גר</option>
            <option value="ליטר" ${unit === 'ליטר' ? 'selected' : ''}>ליטר</option>
            <option value="מ״ל" ${unit === 'מ״ל' ? 'selected' : ''}>מ״ל</option>
            <option value="כפות" ${unit === 'כפות' ? 'selected' : ''}>כפות</option>
            <option value="כוסות" ${unit === 'כוסות' ? 'selected' : ''}>כוסות</option>
          </select>
        `;
      });

      document.getElementById('edit-grocery-btn').textContent = 'בטל עריכה';
      document.getElementById('save-grocery-btn').classList.remove('hidden');
    } else {
      // Exit edit mode without saving
      this.cancelGroceryEdit();
    }
  }

  cancelGroceryEdit() {
    const container = document.getElementById('grocery-list');
    container.classList.remove('editing');
    
    // Restore original display
    const groceryData = JSON.parse(container.dataset.groceryData);
    this.displayGroceryList(groceryData);
    
    document.getElementById('edit-grocery-btn').textContent = 'ערוך רשימה';
    document.getElementById('save-grocery-btn').classList.add('hidden');
  }

  async saveGroceryChanges() {
    try {
      const container = document.getElementById('grocery-list');
      const updatedItems = [];

      container.querySelectorAll('.grocery-item').forEach(item => {
        const ingredient = item.dataset.ingredient;
        const quantityInput = item.querySelector('.quantity-input');
        const unitInput = item.querySelector('.unit-input');
        const checkbox = item.querySelector('.item-checkbox');

        if (quantityInput && unitInput) {
          updatedItems.push({
            ingredient,
            quantity: parseFloat(quantityInput.value) || 1,
            unit: unitInput.value,
            purchased: checkbox.checked
          });
        }
      });

      // Update the stored data
      const groceryData = JSON.parse(container.dataset.groceryData);
      groceryData.ingredients = updatedItems;
      
      // Update display
      this.displayGroceryList(groceryData);
      
      container.classList.remove('editing');
      document.getElementById('edit-grocery-btn').textContent = 'ערוך רשימה';
      document.getElementById('save-grocery-btn').classList.add('hidden');
      
      alert('השינויים נשמרו בהצלחה');

    } catch (error) {
      console.error('Error saving grocery changes:', error);
      alert('שגיאה בשמירת השינויים');
    }
  }

  exportGroceryList() {
    try {
      const container = document.getElementById('grocery-list');
      const groceryData = JSON.parse(container.dataset.groceryData);
      
      if (!groceryData.ingredients) {
        alert('אין רשימת קניות לייצוא');
        return;
      }

      // Create text format for export
      let exportText = `רשימת קניות - ${groceryData.weekRange}\n`;
      exportText += `נוצר בתאריך: ${new Date().toLocaleDateString('he-IL')}\n\n`;

      // Group by category
      const categories = {};
      groceryData.ingredients.forEach(item => {
        const category = item.category || 'כללי';
        if (!categories[category]) categories[category] = [];
        categories[category].push(item);
      });

      Object.entries(categories).forEach(([category, items]) => {
        exportText += `${category}:\n`;
        items.forEach(item => {
          const status = item.purchased ? '✓' : '☐';
          exportText += `${status} ${item.ingredient} - ${item.quantity} ${item.unit}\n`;
        });
        exportText += '\n';
      });

      // Download as text file
      const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `רשימת_קניות_${groceryData.weekId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('רשימת הקניות יוצאה בהצלחה');

    } catch (error) {
      console.error('Error exporting grocery list:', error);
      alert('שגיאה בייצוא הרשימה');
    }
  }

  formatWeekRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString('he-IL', options)} - ${end.toLocaleDateString('he-IL', options)}`;
  }

  // Chatbot Methods
  async showChatbotModal() {
    try {
      this.showModal();
      this.modalContent.innerHTML = `
        <div class="bg-white rounded-lg p-0 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <i class="fas fa-robot text-lg"></i>
                </div>
                <div>
                  <h3 class="text-xl font-bold">עוזר התזונה החכם</h3>
                  <p class="text-sm opacity-90">כאן לעזור לך עם תכנון ארוחות חכם</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div id="chat-status" class="flex items-center gap-1 text-sm">
                  <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>פעיל</span>
                </div>
                <button onclick="familyMealPlanner.hideModal()" class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex-1 flex flex-col min-h-0">
            <!-- Chat Messages Area -->
            <div id="chat-messages" class="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 min-h-96">
              <div class="chat-message bot-message flex gap-3">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                  <i class="fas fa-robot"></i>
                </div>
                <div class="bg-white rounded-lg p-3 shadow-sm max-w-xs">
                  <p class="text-sm text-right">
                    שלום! 👋 אני עוזר התזונה החכם שלך. 
                    <br><br>
                    אני יכול לעזור לך עם:
                    <br>• הצעות מנות מותאמות אישית
                    <br>• תכנון ארוחות חכם
                    <br>• עצות תזונה בריאה
                    <br>• שאלות על מרכיבים
                    <br><br>
                    איך אוכל לעזור לך היום? 😊
                  </p>
                  <div class="text-xs text-gray-500 mt-2 text-left">${new Date().toLocaleTimeString('he-IL')}</div>
                </div>
              </div>
            </div>
            
            <!-- Quick Action Buttons -->
            <div id="chat-quick-actions" class="p-3 bg-gray-100 border-t border-gray-200">
              <div class="flex gap-2 flex-wrap justify-center">
                <button class="quick-action-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm" 
                        data-action="suggest-meals">
                  הצע מנות לשבוע 🍽️
                </button>
                <button class="quick-action-btn bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm"
                        data-action="healthy-options">
                  אפשרויות בריאות 🥗
                </button>
                <button class="quick-action-btn bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm"
                        data-action="kids-friendly">
                  מנות לילדים 👶
                </button>
                <button class="quick-action-btn bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm"
                        data-action="quick-meals">
                  מנות מהירות ⚡
                </button>
              </div>
            </div>
            
            <!-- Chat Input Area -->
            <div class="p-4 bg-white border-t border-gray-200">
              <div class="flex gap-3">
                <div class="flex-1 relative">
                  <input 
                    type="text" 
                    id="chat-input" 
                    placeholder="הקלד את השאלה שלך כאן..." 
                    class="w-full border border-gray-300 rounded-lg px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    maxlength="500"
                  >
                  <div id="typing-indicator" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm hidden">
                    <i class="fas fa-circle animate-pulse"></i>
                    <i class="fas fa-circle animate-pulse animation-delay-200"></i>
                    <i class="fas fa-circle animate-pulse animation-delay-400"></i>
                  </div>
                </div>
                <button 
                  id="send-chat-btn" 
                  class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  disabled
                >
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
              <div class="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span id="char-count">0/500</span>
                <div class="flex gap-4">
                  <span>Enter - שלח</span>
                  <span>Ctrl+Enter - שורה חדשה</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      this.setupChatbotEvents();
      this.focusChatInput();
    } catch (error) {
      console.error('Error showing chatbot modal:', error);
      alert('שגיאה בפתיחת הצ\'אט החכם');
    }
  }

  setupChatbotEvents() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    const charCount = document.getElementById('char-count');
    
    // Input events
    chatInput.addEventListener('input', (e) => {
      const length = e.target.value.length;
      charCount.textContent = `${length}/500`;
      sendBtn.disabled = length === 0 || length > 500;
      
      // Show typing indicator
      if (length > 0) {
        this.showTypingIndicator();
      } else {
        this.hideTypingIndicator();
      }
    });
    
    // Enter key handling
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.ctrlKey && !sendBtn.disabled) {
        e.preventDefault();
        this.sendChatMessage();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        // Insert line break
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const value = e.target.value;
        e.target.value = value.substring(0, start) + '\n' + value.substring(end);
        e.target.selectionStart = e.target.selectionEnd = start + 1;
        e.preventDefault();
      }
    });
    
    // Send button
    sendBtn.addEventListener('click', () => {
      this.sendChatMessage();
    });
    
    // Quick action buttons
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      });
    });
  }

  focusChatInput() {
    setTimeout(() => {
      const chatInput = document.getElementById('chat-input');
      if (chatInput) {
        chatInput.focus();
      }
    }, 100);
  }

  showTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.classList.remove('hidden');
    }
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.classList.add('hidden');
    }
  }

  async sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Clear input
    chatInput.value = '';
    chatInput.dispatchEvent(new Event('input'));
    
    // Add user message to chat
    this.addChatMessage(message, 'user');
    
    // Show bot thinking
    this.showBotThinking();
    
    try {
      // Send to chatbot API
      const response = await axios.post('/api/chat', {
        message: message,
        context: await this.getChatContext()
      });
      
      // Hide thinking indicator
      this.hideBotThinking();
      
      // Add bot response
      this.addChatMessage(response.data.response, 'bot', response.data.suggestions);
      
    } catch (error) {
      console.error('Error sending chat message:', error);
      this.hideBotThinking();
      this.addChatMessage('מצטער, יש לי בעיה טכנית כרגע. אנא נסה שנית מאוחר יותר.', 'bot');
    }
  }

  addChatMessage(message, sender, suggestions = null) {
    const messagesContainer = document.getElementById('chat-messages');
    const timestamp = new Date().toLocaleTimeString('he-IL');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message flex gap-3 ${sender === 'user' ? 'flex-row-reverse' : ''}`;
    
    const avatar = sender === 'user' 
      ? '<div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm"><i class="fas fa-user"></i></div>'
      : '<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm"><i class="fas fa-robot"></i></div>';
    
    let suggestionsHtml = '';
    if (suggestions && suggestions.length > 0) {
      suggestionsHtml = `
        <div class="mt-3 space-y-2">
          <p class="text-xs font-semibold text-gray-600 text-right">הצעות:</p>
          ${suggestions.map(suggestion => `
            <button class="suggestion-btn block w-full text-right bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded p-2 text-sm transition-colors">
              ${suggestion.title}
            </button>
          `).join('')}
        </div>
      `;
    }
    
    messageDiv.innerHTML = `
      ${avatar}
      <div class="bg-${sender === 'user' ? 'green' : 'white'} rounded-lg p-3 shadow-sm max-w-sm ${sender === 'user' ? 'text-white' : ''}">
        <div class="text-sm text-right whitespace-pre-wrap">${message}</div>
        ${suggestionsHtml}
        <div class="text-xs ${sender === 'user' ? 'text-green-200' : 'text-gray-500'} mt-2 text-left">${timestamp}</div>
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Add suggestion click events
    messageDiv.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const suggestion = suggestions.find(s => s.title === e.target.textContent.trim());
        if (suggestion) {
          this.handleSuggestionClick(suggestion);
        }
      });
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showBotThinking() {
    const messagesContainer = document.getElementById('chat-messages');
    const thinkingDiv = document.createElement('div');
    thinkingDiv.id = 'thinking-indicator';
    thinkingDiv.className = 'chat-message bot-message flex gap-3';
    
    thinkingDiv.innerHTML = `
      <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
        <i class="fas fa-robot"></i>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm">
        <div class="flex gap-1">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-400"></div>
        </div>
      </div>
    `;
    
    messagesContainer.appendChild(thinkingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideBotThinking() {
    const thinkingIndicator = document.getElementById('thinking-indicator');
    if (thinkingIndicator) {
      thinkingIndicator.remove();
    }
  }

  async getChatContext() {
    return {
      children: this.children,
      menuItems: this.menuItems.slice(0, 5), // Send only recent meals
      currentWeek: this.currentWeek,
      hasWeekPlan: !!this.currentWeekPlan
    };
  }

  async handleQuickAction(action) {
    const actions = {
      'suggest-meals': 'הצע לי מנות מתאימות לשבוע הקרוב',
      'healthy-options': 'איזה מנות בריאות אתה ממליץ עליהן?',
      'kids-friendly': 'מה המנות הכי מתאימות לילדים?',
      'quick-meals': 'איזה מנות מהירות אני יכול להכין?'
    };
    
    const message = actions[action];
    if (message) {
      document.getElementById('chat-input').value = message;
      await this.sendChatMessage();
    }
  }

  handleSuggestionClick(suggestion) {
    if (suggestion.action === 'add_meal') {
      this.hideModal();
      setTimeout(() => this.showAddMealModal(), 300);
    } else if (suggestion.action === 'plan_week') {
      this.hideModal();
      setTimeout(() => this.showWeekPlanningModal(), 300);
    } else if (suggestion.action === 'view_recipes') {
      alert('תכונת מתכונים בפיתוח!');
    }
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
      this.showWeekPlanningModal()
    })
    
    document.getElementById('btn-grocery-list')?.addEventListener('click', () => {
      console.log('🖱️ לחיצה על רשימת מצרכים')
      this.showGroceryListModal()
    })
    
    document.getElementById('btn-chat')?.addEventListener('click', () => {
      console.log('🖱️ לחיצה על צ\'אט חכם')
      this.showChatbotModal()
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

  // Week Planning Functions
  showWeekPlanningModal() {
    console.log('📅 מציג מודאל תכנון שבועי')
    
    if (this.children.length === 0) {
      alert('עליך להוסיף לפחות ילד אחד כדי להתחיל תכנון שבועי.\n\nלחץ על "הוסף ילד/ה" כדי להתחיל.')
      return
    }
    
    if (this.menuItems.length === 0) {
      alert('עליך להוסיף לפחות מנה אחת כדי להתחיל תכנון שבועי.\n\nלחץ על "הוסף מנה" כדי להתחיל.')
      return
    }

    // Generate week days for the planning
    const weekDays = this.generateWeekDays()
    const dayNames = ['שבת', 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי']
    
    const modalHtml = `
      <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="week-planning-modal">
        <div class="modal-content bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto">
          <div class="modal-header flex justify-between items-center mb-6">
            <div>
              <h3 class="text-xl font-bold">תכנון שבוע חדש</h3>
              <p class="text-sm text-gray-600 mt-1">${this.formatWeekRange()}</p>
            </div>
            <button onclick="app.closeModal('week-planning-modal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <!-- Week Planning Grid -->
          <div class="week-planning-container">
            <div class="grid grid-cols-8 gap-2 mb-4">
              <!-- Header Row -->
              <div class="font-bold text-center py-2">ארוחה \\ יום</div>
              ${dayNames.map((day, index) => `
                <div class="font-bold text-center py-2 bg-blue-50 rounded">
                  ${day}<br>
                  <span class="text-xs text-gray-600">${new Date(weekDays[index]).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}</span>
                </div>
              `).join('')}
              
              <!-- Breakfast Row - Individual per child -->
              ${this.children.map(child => `
                <div class="font-medium py-2 flex items-center">
                  <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${child.color}"></div>
                  <span class="text-sm">בוקר - ${child.name}</span>
                </div>
                ${weekDays.map((date, dayIndex) => `
                  <div class="meal-slot border rounded-lg p-2 min-h-[80px] bg-gray-50" 
                       data-meal="breakfast" 
                       data-child="${child.id}" 
                       data-date="${date}" 
                       data-day="${dayIndex}">
                    <div class="meal-selections space-y-1">
                      <!-- Breakfast meals will be added here -->
                    </div>
                    <button onclick="app.addMealToSlot(this)" 
                            class="add-meal-btn w-full mt-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                      + הוסף ארוחת בוקר
                    </button>
                  </div>
                `).join('')}
              `).join('')}
              
              <!-- Lunch Row - Family meal -->
              <div class="font-medium py-2 bg-orange-50 text-orange-800">
                צהריים - משפחתי
              </div>
              ${weekDays.map((date, dayIndex) => `
                <div class="meal-slot border rounded-lg p-2 min-h-[80px] bg-orange-50" 
                     data-meal="lunch" 
                     data-date="${date}" 
                     data-day="${dayIndex}">
                  <div class="meal-selections space-y-1">
                    <!-- Lunch meals will be added here -->
                  </div>
                  <button onclick="app.addMealToSlot(this)" 
                          class="add-meal-btn w-full mt-2 py-1 text-xs bg-orange-200 text-orange-800 rounded hover:bg-orange-300 transition-colors">
                    + הוסף ארוחת צהריים
                  </button>
                </div>
              `).join('')}
              
              <!-- Dinner Row - Family meal -->
              <div class="font-medium py-2 bg-purple-50 text-purple-800">
                ערב - משפחתי
              </div>
              ${weekDays.map((date, dayIndex) => `
                <div class="meal-slot border rounded-lg p-2 min-h-[80px] bg-purple-50" 
                     data-meal="dinner" 
                     data-date="${date}" 
                     data-day="${dayIndex}">
                  <div class="meal-selections space-y-1">
                    <!-- Dinner meals will be added here -->
                  </div>
                  <button onclick="app.addMealToSlot(this)" 
                          class="add-meal-btn w-full mt-2 py-1 text-xs bg-purple-200 text-purple-800 rounded hover:bg-purple-300 transition-colors">
                    + הוסף ארוחת ערב
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="border-t pt-4 mb-4">
            <div class="flex flex-wrap gap-2 mb-4">
              <button onclick="app.clearAllMeals()" class="btn btn-sm bg-gray-500 text-white hover:bg-gray-600">
                נקה הכל
              </button>
              <button onclick="app.randomizeMeals()" class="btn btn-sm bg-blue-500 text-white hover:bg-blue-600">
                מילוי אקראי
              </button>
              <button onclick="app.copyFromLastWeek()" class="btn btn-sm bg-green-500 text-white hover:bg-green-600">
                העתק משבוע קודם
              </button>
            </div>
          </div>
          
          <div class="modal-footer flex justify-end space-x-reverse space-x-2 mt-6">
            <button onclick="app.closeModal('week-planning-modal')" class="btn btn-secondary">ביטול</button>
            <button onclick="app.saveWeekPlan()" class="btn btn-primary">
              <i class="fas fa-save ml-2"></i>
              שמור תכנון שבוע
            </button>
          </div>
        </div>
      </div>
    `
    
    document.getElementById('modals-container').innerHTML = modalHtml
    
    // Load existing week plan if available
    this.loadExistingWeekPlan()
  }

  addMealToSlot(button) {
    const slot = button.closest('.meal-slot')
    const mealType = slot.dataset.meal
    const childId = slot.dataset.child
    const date = slot.dataset.date
    
    console.log('🍽️ מוסיף מנה למשבצת:', { mealType, childId, date })
    
    // Filter meals by type
    const availableMeals = this.menuItems.filter(meal => 
      meal.mealTypes.includes(mealType)
    )
    
    if (availableMeals.length === 0) {
      alert(`אין מנות מתאימות לארוחת ${mealType === 'breakfast' ? 'בוקר' : mealType === 'lunch' ? 'צהריים' : 'ערב'}.\n\nהוסף מנות מתאימות במנהל המנות.`)
      return
    }
    
    // Show meal selection modal
    this.showMealSelectionModal(availableMeals, (selectedMeal, servings) => {
      this.addMealSelectionToSlot(slot, selectedMeal, servings)
    })
  }

  showMealSelectionModal(availableMeals, onSelect) {
    const modalHtml = `
      <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]" id="meal-selection-modal">
        <div class="modal-content bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="modal-header flex justify-between items-center mb-4">
            <h4 class="text-lg font-bold">בחר מנה</h4>
            <button onclick="app.closeModal('meal-selection-modal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <div class="meal-list space-y-3 mb-4">
            ${availableMeals.map(meal => `
              <div class="meal-option border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                   onclick="app.selectMealOption('${meal.id}')">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="font-medium">${meal.name}</div>
                    <div class="text-sm text-gray-600 mt-1">
                      ${meal.defaultServings} מנות • ${meal.tags.join(', ') || 'ללא תגיות'}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      ${meal.ingredients?.slice(0, 3).map(ing => ing.name).join(', ')}${meal.ingredients?.length > 3 ? '...' : ''}
                    </div>
                  </div>
                  <div class="mr-3">
                    <input type="radio" name="selected-meal" value="${meal.id}" class="meal-radio">
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="servings-section border-t pt-4">
            <label class="block text-sm font-medium mb-2">כמות מנות</label>
            <div class="flex items-center space-x-reverse space-x-2">
              <button onclick="app.adjustServings(-1)" class="btn btn-sm bg-gray-200 hover:bg-gray-300">-</button>
              <input type="number" id="meal-servings-input" class="input w-20 text-center" value="4" min="1" max="20">
              <button onclick="app.adjustServings(1)" class="btn btn-sm bg-gray-200 hover:bg-gray-300">+</button>
              <span class="text-sm text-gray-600 mr-2">מנות</span>
            </div>
          </div>
          
          <div class="modal-footer flex justify-end space-x-reverse space-x-2 mt-6">
            <button onclick="app.closeModal('meal-selection-modal')" class="btn btn-secondary">ביטול</button>
            <button onclick="app.confirmMealSelection()" class="btn btn-primary" disabled id="confirm-meal-btn">
              הוסף מנה
            </button>
          </div>
        </div>
      </div>
    `
    
    // Store callback for later use
    this.pendingMealSelection = onSelect
    
    document.getElementById('modals-container').innerHTML += modalHtml
  }

  selectMealOption(mealId) {
    // Update radio button
    document.querySelectorAll('.meal-radio').forEach(radio => {
      radio.checked = radio.value === mealId
    })
    
    // Enable confirm button
    document.getElementById('confirm-meal-btn').disabled = false
    
    // Store selected meal
    this.selectedMealId = mealId
  }

  adjustServings(delta) {
    const input = document.getElementById('meal-servings-input')
    const currentValue = parseInt(input.value) || 4
    const newValue = Math.max(1, Math.min(20, currentValue + delta))
    input.value = newValue
  }

  confirmMealSelection() {
    if (!this.selectedMealId || !this.pendingMealSelection) {
      alert('אנא בחר מנה')
      return
    }
    
    const selectedMeal = this.menuItems.find(m => m.id === this.selectedMealId)
    const servings = parseInt(document.getElementById('meal-servings-input').value) || 4
    
    console.log('✅ מנה נבחרה:', selectedMeal.name, 'מנות:', servings)
    
    // Call the callback
    this.pendingMealSelection(selectedMeal, servings)
    
    // Clean up
    this.selectedMealId = null
    this.pendingMealSelection = null
    
    // Close modal
    this.closeModal('meal-selection-modal')
  }

  addMealSelectionToSlot(slot, meal, servings) {
    const selectionsContainer = slot.querySelector('.meal-selections')
    
    // Create meal selection element
    const selectionEl = document.createElement('div')
    selectionEl.className = 'meal-selection bg-white border rounded p-2 text-sm'
    selectionEl.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="font-medium">${meal.name}</div>
          <div class="text-xs text-gray-600">${servings} מנות</div>
        </div>
        <button onclick="app.removeMealSelection(this)" class="text-red-500 hover:text-red-700 text-xs">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `
    
    // Store meal data
    selectionEl.dataset.mealId = meal.id
    selectionEl.dataset.servings = servings
    
    selectionsContainer.appendChild(selectionEl)
    
    console.log('✅ מנה נוספה למשבצת:', meal.name)
  }

  removeMealSelection(button) {
    const selection = button.closest('.meal-selection')
    selection.remove()
  }

  clearAllMeals() {
    if (!confirm('האם אתה בטוח שברצונך לנקות את כל המנות מהתכנון?')) {
      return
    }
    
    document.querySelectorAll('.meal-selection').forEach(el => el.remove())
    console.log('🧹 כל המנות נוקו מהתכנון')
  }

  randomizeMeals() {
    if (!confirm('האם אתה בטוח שברצונך למלא את התכנון במנות אקראיות?\n\nזה ימחק את התכנון הנוכחי.')) {
      return
    }
    
    console.log('🎲 מילוי אקראי של התכנון')
    
    // Clear existing meals
    document.querySelectorAll('.meal-selection').forEach(el => el.remove())
    
    // Get meals by type
    const breakfastMeals = this.menuItems.filter(m => m.mealTypes.includes('breakfast'))
    const lunchMeals = this.menuItems.filter(m => m.mealTypes.includes('lunch'))
    const dinnerMeals = this.menuItems.filter(m => m.mealTypes.includes('dinner'))
    
    // Fill slots randomly
    document.querySelectorAll('.meal-slot').forEach(slot => {
      const mealType = slot.dataset.meal
      let availableMeals = []
      
      if (mealType === 'breakfast' && breakfastMeals.length > 0) {
        availableMeals = breakfastMeals
      } else if (mealType === 'lunch' && lunchMeals.length > 0) {
        availableMeals = lunchMeals
      } else if (mealType === 'dinner' && dinnerMeals.length > 0) {
        availableMeals = dinnerMeals
      }
      
      if (availableMeals.length > 0 && Math.random() > 0.3) { // 70% chance to add meal
        const randomMeal = availableMeals[Math.floor(Math.random() * availableMeals.length)]
        const randomServings = Math.floor(Math.random() * 4) + 2 // 2-5 servings
        this.addMealSelectionToSlot(slot, randomMeal, randomServings)
      }
    })
    
    alert('התכנון מולא במנות אקראיות! 🎲')
  }

  copyFromLastWeek() {
    alert('העתקה משבוע קודם תתווסף בקרוב! 📋\n\nכרגע תוכל להשתמש במילוי אקראי או לתכנן ידנית.')
  }

  loadExistingWeekPlan() {
    // This will load existing week plan from the API
    // For now, we'll skip this as we're focusing on creation
    console.log('📖 טוען תכנון שבוע קיים (אם קיים)')
  }

  async saveWeekPlan() {
    console.log('💾 שומר תכנון שבוע')
    
    try {
      // Collect all meal selections
      const weekPlanData = {
        weekStartDate: this.currentWeek[0],
        children: this.children.map(child => ({
          id: child.id,
          name: child.name,
          color: child.color,
          dietaryTags: child.dietaryTags
        })),
        days: []
      }
      
      // Process each day
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = this.currentWeek[dayIndex]
        const dayData = {
          date: date,
          breakfast: {},
          lunch: [],
          dinner: []
        }
        
        // Collect breakfast meals (per child)
        this.children.forEach(child => {
          const childBreakfastSlot = document.querySelector(`[data-meal="breakfast"][data-child="${child.id}"][data-day="${dayIndex}"]`)
          if (childBreakfastSlot) {
            const selections = childBreakfastSlot.querySelectorAll('.meal-selection')
            dayData.breakfast[child.id] = Array.from(selections).map(sel => ({
              menuItemId: sel.dataset.mealId,
              servings: parseInt(sel.dataset.servings) || 1
            }))
          } else {
            dayData.breakfast[child.id] = []
          }
        })
        
        // Collect lunch meals (family)
        const lunchSlot = document.querySelector(`[data-meal="lunch"][data-day="${dayIndex}"]`)
        if (lunchSlot) {
          const selections = lunchSlot.querySelectorAll('.meal-selection')
          dayData.lunch = Array.from(selections).map(sel => ({
            menuItemId: sel.dataset.mealId,
            servings: parseInt(sel.dataset.servings) || 1
          }))
        }
        
        // Collect dinner meals (family)
        const dinnerSlot = document.querySelector(`[data-meal="dinner"][data-day="${dayIndex}"]`)
        if (dinnerSlot) {
          const selections = dinnerSlot.querySelectorAll('.meal-selection')
          dayData.dinner = Array.from(selections).map(sel => ({
            menuItemId: sel.dataset.mealId,
            servings: parseInt(sel.dataset.servings) || 1
          }))
        }
        
        weekPlanData.days.push(dayData)
      }
      
      console.log('📊 נתוני תכנון שבוע:', weekPlanData)
      
      // Save to server
      const response = await axios.post('/api/week-plan', weekPlanData)
      
      if (response.data.success) {
        console.log('✅ תכנון שבוע נשמר בהצלחה:', response.data.data)
        
        // Update local data
        this.currentWeekPlan = response.data.data
        
        // Update UI
        this.renderWeekPlanSection()
        this.updateDebugInfo()
        
        // Close modal
        this.closeModal('week-planning-modal')
        
        // Show success message
        alert('תכנון השבוע נשמר בהצלחה! 📅\n\nכעת תוכל ליצור רשימת מצרכים אוטומטית.')
        
      } else {
        console.error('❌ שגיאה בשמירת תכנון:', response.data.error)
        alert('שגיאה בשמירת התכנון: ' + (response.data.error || 'שגיאה לא מוכרת'))
      }
      
    } catch (error) {
      console.error('❌ שגיאה בשליחת הבקשה:', error)
      alert('שגיאה בחיבור לשרת. אנא נסה שנית.')
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM מוכן - מאתחל אפליקציה מלאה...')
  window.app = new MealPlannerApp()
})