// Basic Working Meal Planner Application
console.log('🚀 מאתחל את מתכנן הארוחות...')

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM מוכן - מציג ממשק...')
  
  // Get the app container
  const appContainer = document.getElementById('app')
  if (!appContainer) {
    console.error('לא נמצא מכל האפליקציה')
    return
  }

  // Render the main interface
  appContainer.innerHTML = `
    <div class="max-w-6xl mx-auto p-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-blue-600 mb-4">
          <i class="fas fa-utensils mr-3"></i>
          מתכנן הארוחות המשפחתי
        </h1>
        <p class="text-gray-600">תכנן את הארוחות השבועיות של המשפחה בקלות</p>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <button onclick="showAddChildModal()" class="btn btn-primary text-center p-4 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all">
          <i class="fas fa-child text-2xl mb-2 block"></i>
          <span class="font-medium">הוסף ילד</span>
          <div class="text-sm text-gray-500 mt-1">ניהול ילדי המשפחה</div>
        </button>

        <button onclick="showAddMenuModal()" class="btn btn-success text-center p-4 rounded-lg border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all">
          <i class="fas fa-utensils text-2xl mb-2 block"></i>
          <span class="font-medium">הוסף מנה</span>
          <div class="text-sm text-gray-500 mt-1">מנות חדשות לתפריט</div>
        </button>

        <button onclick="showChatModal()" class="btn btn-secondary text-center p-4 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all">
          <i class="fas fa-robot text-2xl mb-2 block"></i>
          <span class="font-medium">צ'אט חכם</span>
          <div class="text-sm text-gray-500 mt-1">עוזר תכנון ארוחות</div>
        </button>

        <button onclick="showGroceryModal()" class="btn btn-warning text-center p-4 rounded-lg border-2 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all">
          <i class="fas fa-shopping-cart text-2xl mb-2 block"></i>
          <span class="font-medium">רשימת קניות</span>
          <div class="text-sm text-gray-500 mt-1">מה צריך לקנות</div>
        </button>

        <button onclick="showWeeklyMenuModal()" class="btn btn-info text-center p-4 rounded-lg border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all">
          <i class="fas fa-calendar-alt text-2xl mb-2 block"></i>
          <span class="font-medium">התפריט השבועי</span>
          <div class="text-sm text-gray-500 mt-1">מה מתוכנן השבוע</div>
        </button>
      </div>

      <!-- Weekly Planner -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-bold mb-4 text-center">
          <i class="fas fa-calendar-week mr-2"></i>
          תכנון שבועי
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-200">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-3 font-medium">יום</th>
                <th class="border border-gray-200 p-3 font-medium">ארוחת בוקר</th>
                <th class="border border-gray-200 p-3 font-medium">ארוחת צהריים</th>
                <th class="border border-gray-200 p-3 font-medium">ארוחת ערב</th>
              </tr>
            </thead>
            <tbody id="week-table">
              <!-- Will be filled by JavaScript -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Data Display -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Children List -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-bold mb-4">
            <i class="fas fa-users mr-2"></i>
            ילדים במשפחה
          </h3>
          <div id="children-list" class="space-y-2">
            <p class="text-gray-500 text-center py-4">עדיין לא נוספו ילדים</p>
          </div>
        </div>

        <!-- Menu Items -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-bold mb-4">
            <i class="fas fa-list mr-2"></i>
            מנות במאגר
          </h3>
          <div id="menu-list" class="space-y-2">
            <p class="text-gray-500 text-center py-4">עדיין לא נוספו מנות</p>
          </div>
        </div>
      </div>
    </div>
  `

  // Initialize the weekly table
  initWeekTable()
  
  // Load saved data
  loadSavedData()
  
  // Load existing weekly plan
  loadWeeklyPlan()
  
  console.log('✅ האפליקציה נטענה בהצלחה!')
})

// Initialize weekly planning table
function initWeekTable() {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
  const weekTable = document.getElementById('week-table')
  
  if (!weekTable) return
  
  weekTable.innerHTML = days.map(day => `
    <tr>
      <td class="border border-gray-200 p-3 font-medium bg-gray-50">${day}</td>
      <td class="border border-gray-200 p-3">
        <button onclick="addMeal('${day}', 'בוקר')" class="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
          <i class="fas fa-plus mr-1"></i>
          הוסף ארוחה
        </button>
      </td>
      <td class="border border-gray-200 p-3">
        <button onclick="addMeal('${day}', 'צהריים')" class="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
          <i class="fas fa-plus mr-1"></i>
          הוסף ארוחה
        </button>
      </td>
      <td class="border border-gray-200 p-3">
        <button onclick="addMeal('${day}', 'ערב')" class="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
          <i class="fas fa-plus mr-1"></i>
          הוסף ארוחה
        </button>
      </td>
    </tr>
  `).join('')
}

// Load saved data from localStorage
function loadSavedData() {
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  const weeklyMenu = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenu') || '{}')
  
  updateChildrenList(children)
  updateMenuList(menuItems)
}

// Update children list display
function updateChildrenList(children) {
  const container = document.getElementById('children-list')
  if (!container) return
  
  if (children.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">עדיין לא נוספו ילדים</p>'
    return
  }
  
  container.innerHTML = children.map(child => `
    <div class="flex justify-between items-center p-3 bg-gray-50 rounded border">
      <div class="flex-1">
        <span class="font-medium">${child.name}</span>
        ${child.age ? `<span class="text-sm text-gray-500 mr-2">(גיל ${child.age})</span>` : ''}
        ${child.preferences && child.preferences.length > 0 ? 
          `<div class="text-xs text-blue-600 mt-1">העדפות: ${child.preferences.join(', ')}</div>` : 
          '<div class="text-xs text-gray-400 mt-1">אין העדפות</div>'
        }
      </div>
      <div class="flex gap-2">
        <button onclick="manageChildPreferences('${child.id}')" class="text-blue-500 hover:text-blue-700 text-sm">
          <i class="fas fa-heart"></i>
        </button>
        <button onclick="removeChild('${child.id}')" class="text-red-500 hover:text-red-700">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('')
}

// Update menu list display
function updateMenuList(menuItems) {
  const container = document.getElementById('menu-list')
  if (!container) return
  
  if (menuItems.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">עדיין לא נוספו מנות</p>'
    return
  }
  
  container.innerHTML = menuItems.map(item => `
    <div class="flex justify-between items-center p-3 bg-gray-50 rounded border">
      <div>
        <span class="font-medium">${item.name}</span>
        <div class="text-sm text-gray-500">${(item.mealTypes || []).join(', ')}</div>
      </div>
      <button onclick="removeMenuItem('${item.id}')" class="text-red-500 hover:text-red-700">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('')
}

// Show add child modal
function showAddChildModal() {
  showModal('הוסף ילד חדש', `
    <form id="child-form" onsubmit="addChild(event)">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">שם הילד</label>
        <input type="text" id="child-name" class="w-full p-2 border border-gray-300 rounded" required>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">גיל (אופציונלי)</label>
        <input type="number" id="child-age" class="w-full p-2 border border-gray-300 rounded" min="0" max="25">
      </div>
      <div class="flex gap-3">
        <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">הוסף</button>
        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">ביטול</button>
      </div>
    </form>
  `)
}

// Show add menu item modal
function showAddMenuModal() {
  showModal('הוסף מנה חדשה', `
    <form id="menu-form" onsubmit="addMenuItem(event)">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">שם המנה</label>
        <input type="text" id="menu-name" class="w-full p-2 border border-gray-300 rounded" required>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">מתאים לארוחות:</label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input type="checkbox" value="בוקר" class="ml-2">ארוחת בוקר
          </label>
          <label class="flex items-center">
            <input type="checkbox" value="צהריים" class="ml-2">ארוחת צהריים
          </label>
          <label class="flex items-center">
            <input type="checkbox" value="ערב" class="ml-2">ארוחת ערב
          </label>
        </div>
      </div>
      <div class="flex gap-3">
        <button type="submit" class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">הוסף</button>
        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">ביטול</button>
      </div>
    </form>
  `)
}

// Show chat modal
function showChatModal() {
  showModal('צ\'אט חכם - עוזר תכנון ארוחות', `
    <div class="mb-4">
      <div id="chat-messages" class="bg-gray-50 p-4 rounded h-48 overflow-y-auto mb-4">
        <div class="text-center text-gray-600 py-4">
          <i class="fas fa-robot text-2xl mb-2 block"></i>
          שלום! אני עוזר תכנון הארוחות שלך. איך אוכל לעזור היום?
        </div>
      </div>
      <div class="flex gap-2">
        <input type="text" id="chat-input" class="flex-1 p-2 border border-gray-300 rounded" placeholder="הקלד הודעה...">
        <button onclick="sendMessage()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">שלח</button>
      </div>
    </div>
    <button onclick="closeModal()" class="w-full bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">סגור</button>
  `)
  
  // Add enter key listener
  document.getElementById('chat-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage()
    }
  })
}

// Show grocery list modal
function showGroceryModal() {
  showModal('רשימת קניות', `
    <div class="mb-4">
      <h4 class="font-medium mb-3">רשימת קניות בסיסית:</h4>
      <div class="bg-gray-50 p-4 rounded">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="flex items-center">
            <input type="checkbox" class="ml-2">
            <span>לחם</span>
          </div>
          <div class="flex items-center">
            <input type="checkbox" class="ml-2">
            <span>חלב</span>
          </div>
          <div class="flex items-center">
            <input type="checkbox" class="ml-2">
            <span>ביצים</span>
          </div>
          <div class="flex items-center">
            <input type="checkbox" class="ml-2">
            <span>גבינה</span>
          </div>
          <div class="flex items-center">
            <input type="checkbox" class="ml-2">
            <span>פירות</span>
          </div>
          <div class="flex items-center">
            <input type="checkbox" class="ml-2">
            <span>ירקות</span>
          </div>
          <div class="flex items-center">
            <input type="checkbox" class="ml-2">
            <span>בשר/דגים</span>
          </div>
          <div class="flex items-center">
            <input type="checkbox" class="ml-2">
            <span>אורז/פסטה</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-3">
          💡 הוסף מנות ותכנן שבוע כדי לקבל רשימת קניות מותאמת!
        </p>
      </div>
    </div>
    <button onclick="closeModal()" class="w-full bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">סגור</button>
  `)
}

// Generic modal function
function showModal(title, content) {
  const modal = document.createElement('div')
  modal.id = 'modal'
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
      <h3 class="text-lg font-bold mb-4">${title}</h3>
      ${content}
    </div>
  `
  document.body.appendChild(modal)
}

// Close modal
function closeModal() {
  const modal = document.getElementById('modal')
  if (modal) {
    modal.remove()
  }
}

// Add child function
function addChild(event) {
  event.preventDefault()
  const name = document.getElementById('child-name').value
  const age = document.getElementById('child-age').value
  
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  const newChild = {
    id: Date.now().toString(),
    name: name,
    age: age ? parseInt(age) : null
  }
  
  children.push(newChild)
  localStorage.setItem('mealPlannerChildren', JSON.stringify(children))
  updateChildrenList(children)
  closeModal()
}

// Add menu item function
function addMenuItem(event) {
  event.preventDefault()
  const name = document.getElementById('menu-name').value
  const checkboxes = document.querySelectorAll('#menu-form input[type="checkbox"]:checked')
  const mealTypes = Array.from(checkboxes).map(cb => cb.value)
  
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  const newItem = {
    id: Date.now().toString(),
    name: name,
    mealTypes: mealTypes
  }
  
  menuItems.push(newItem)
  localStorage.setItem('mealPlannerMenuItems', JSON.stringify(menuItems))
  updateMenuList(menuItems)
  closeModal()
}

// Remove child
function removeChild(id) {
  let children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  children = children.filter(child => child.id !== id)
  localStorage.setItem('mealPlannerChildren', JSON.stringify(children))
  updateChildrenList(children)
}

// Remove menu item
function removeMenuItem(id) {
  let menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  menuItems = menuItems.filter(item => item.id !== id)
  localStorage.setItem('mealPlannerMenuItems', JSON.stringify(menuItems))
  updateMenuList(menuItems)
}

// Add meal to weekly planner
function addMeal(day, mealTime) {
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  
  if (menuItems.length === 0) {
    alert('נא הוסף מנות למאגר תחילה')
    return
  }
  
  const relevantMeals = menuItems.filter(item => 
    item.mealTypes.includes(mealTime) || item.mealTypes.length === 0
  )
  
  if (relevantMeals.length === 0) {
    alert(`אין מנות מתאימות לארוחת ${mealTime}`)
    return
  }
  
  const mealOptions = relevantMeals.map(meal => 
    `<option value="${meal.id}">${meal.name}</option>`
  ).join('')
  
  showModal(`הוסף ארוחה - יום ${day}, ארוחת ${mealTime}`, `
    <form onsubmit="saveMeal(event, '${day}', '${mealTime}')">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">בחר מנה:</label>
        <select id="meal-select" class="w-full p-2 border border-gray-300 rounded" required>
          <option value="">בחר מנה...</option>
          ${mealOptions}
        </select>
      </div>
      <div class="flex gap-3">
        <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">הוסף</button>
        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">ביטול</button>
      </div>
    </form>
  `)
}

// Save meal to weekly plan
function saveMeal(event, day, mealTime) {
  event.preventDefault()
  const mealId = document.getElementById('meal-select').value
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  const selectedMeal = menuItems.find(item => item.id === mealId)
  
  if (selectedMeal) {
    // Save to weekly menu structure
    let weeklyMenu = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenu') || '{}')
    const key = `${day}_${mealTime}`
    
    if (!weeklyMenu[key]) {
      weeklyMenu[key] = []
    }
    
    weeklyMenu[key].push({
      id: selectedMeal.id,
      name: selectedMeal.name,
      addedAt: new Date().toISOString()
    })
    
    localStorage.setItem('mealPlannerWeeklyMenu', JSON.stringify(weeklyMenu))
    alert(`נוסף: ${selectedMeal.name} ליום ${day}, ארוחת ${mealTime}`)
    
    // Update the visual cell
    updateMealCell(day, mealTime)
  }
  
  closeModal()
}

// Update meal cell display
function updateMealCell(day, mealTime) {
  const weeklyMenu = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenu') || '{}')
  const key = `${day}_${mealTime}`
  const meals = weeklyMenu[key] || []
  
  // Find the cell and update it
  const cells = document.querySelectorAll('td')
  cells.forEach(cell => {
    const button = cell.querySelector('button')
    if (button && button.getAttribute('onclick') && button.getAttribute('onclick').includes(`'${day}', '${mealTime}'`)) {
      if (meals.length > 0) {
        cell.innerHTML = `
          <div class="text-sm">
            ${meals.map(meal => `
              <div class="bg-blue-100 p-1 rounded mb-1 flex justify-between items-center">
                <span>${meal.name}</span>
                <button onclick="removeMealFromPlan('${day}', '${mealTime}', '${meal.id}')" class="text-red-500 text-xs">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            `).join('')}
            <button onclick="addMeal('${day}', '${mealTime}')" class="w-full p-1 border border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 text-xs">
              <i class="fas fa-plus mr-1"></i>
              הוסף עוד
            </button>
          </div>
        `
      }
    }
  })
}

// Remove meal from weekly plan
function removeMealFromPlan(day, mealTime, mealId) {
  let weeklyMenu = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenu') || '{}')
  const key = `${day}_${mealTime}`
  
  if (weeklyMenu[key]) {
    weeklyMenu[key] = weeklyMenu[key].filter(meal => meal.id !== mealId)
    if (weeklyMenu[key].length === 0) {
      delete weeklyMenu[key]
    }
  }
  
  localStorage.setItem('mealPlannerWeeklyMenu', JSON.stringify(weeklyMenu))
  updateMealCell(day, mealTime)
  
  // If cell is now empty, restore the add button
  if (!weeklyMenu[key] || weeklyMenu[key].length === 0) {
    initWeekTable()
    loadWeeklyPlan()
  }
}

// Load and display existing weekly plan
function loadWeeklyPlan() {
  const weeklyMenu = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenu') || '{}')
  
  Object.keys(weeklyMenu).forEach(key => {
    const [day, mealTime] = key.split('_')
    updateMealCell(day, mealTime)
  })
}

// Manage child preferences
function manageChildPreferences(childId) {
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  const child = children.find(c => c.id === childId)
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  
  if (!child) return
  
  const currentPreferences = child.preferences || []
  
  const menuOptions = menuItems.map(item => 
    `<label class="flex items-center p-2 hover:bg-gray-50 rounded">
      <input type="checkbox" value="${item.id}" ${currentPreferences.includes(item.name) ? 'checked' : ''} class="ml-2">
      <span>${item.name}</span>
    </label>`
  ).join('')
  
  showModal(`העדפות אוכל עבור ${child.name}`, `
    <form onsubmit="saveChildPreferences(event, '${childId}')">
      <div class="mb-4">
        <p class="text-sm text-gray-600 mb-3">בחר את המנות שהילד אוהב:</p>
        <div class="max-h-48 overflow-y-auto border border-gray-200 rounded p-2">
          ${menuOptions || '<p class="text-gray-500">אין מנות במאגר עדיין</p>'}
        </div>
      </div>
      <div class="flex gap-3">
        <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">שמור</button>
        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">ביטול</button>
      </div>
    </form>
  `)
}

// Save child preferences
function saveChildPreferences(event, childId) {
  event.preventDefault()
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  const childIndex = children.findIndex(c => c.id === childId)
  
  if (childIndex === -1) return
  
  const checkedItems = document.querySelectorAll('input[type="checkbox"]:checked')
  const selectedItemIds = Array.from(checkedItems).map(cb => cb.value)
  const selectedItemNames = selectedItemIds.map(id => {
    const item = menuItems.find(m => m.id === id)
    return item ? item.name : null
  }).filter(name => name)
  
  children[childIndex].preferences = selectedItemNames
  localStorage.setItem('mealPlannerChildren', JSON.stringify(children))
  updateChildrenList(children)
  closeModal()
}

// Show weekly menu modal
function showWeeklyMenuModal() {
  const weeklyMenu = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenu') || '{}')
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
  const mealTypes = ['בוקר', 'צהריים', 'ערב']
  
  let menuContent = '<div class="text-center text-gray-500 py-4">לא נוסף תפריט עדיין</div>'
  
  if (Object.keys(weeklyMenu).length > 0) {
    menuContent = `
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th class="border border-gray-200 p-2">יום</th>
              <th class="border border-gray-200 p-2">ארוחת בוקר</th>
              <th class="border border-gray-200 p-2">ארוחת צהריים</th>
              <th class="border border-gray-200 p-2">ארוחת ערב</th>
            </tr>
          </thead>
          <tbody>
            ${days.map(day => `
              <tr>
                <td class="border border-gray-200 p-2 font-medium bg-gray-50">${day}</td>
                ${mealTypes.map(mealTime => {
                  const key = `${day}_${mealTime}`
                  const meals = weeklyMenu[key] || []
                  return `<td class="border border-gray-200 p-2">
                    ${meals.length > 0 ? 
                      meals.map(meal => `<div class="bg-blue-100 p-1 rounded mb-1 text-xs">${meal.name}</div>`).join('') :
                      '<span class="text-gray-400 text-xs">לא נבחר</span>'
                    }
                  </td>`
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }
  
  showModal('התפריט השבועי המתוכנן', `
    <div class="mb-4">
      <h4 class="font-medium mb-3">סקירת התפריט השבועי:</h4>
      ${menuContent}
    </div>
    <div class="flex gap-3">
      <button onclick="generateGroceryList()" class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        <i class="fas fa-shopping-cart mr-1"></i>
        צור רשימת קניות
      </button>
      <button onclick="closeModal()" class="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">סגור</button>
    </div>
  `)
}

// Generate smart grocery list based on weekly menu
function generateGroceryList() {
  const weeklyMenu = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenu') || '{}')
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  
  // Count meal occurrences
  const mealCounts = {}
  Object.values(weeklyMenu).forEach(meals => {
    meals.forEach(meal => {
      mealCounts[meal.name] = (mealCounts[meal.name] || 0) + 1
    })
  })
  
  // Basic grocery mapping
  const groceryMapping = {
    'פסטה': ['פסטה', 'רוטב עגבניות', 'גבינה מגוררת'],
    'אורז': ['אורז', 'ירקות מעורבים'],
    'סלט': ['מלפפון', 'עגבניות', 'חסה', 'בצל'],
    'פיתה': ['פיתה', 'חומוס', 'טחינה'],
    'ביצים': ['ביצים', 'לחם', 'חמאה'],
    'דגים': ['דגים', 'לימון', 'תבלינים'],
    'עוף': ['עוף', 'בצל', 'שמן'],
    'מרק': ['ירקות למרק', 'קוביות מרק'],
  }
  
  let groceryList = new Set()
  
  // Add basic staples
  ['לחם', 'חלב', 'ביצים', 'שמן', 'מלח', 'פלפל'].forEach(item => groceryList.add(item))
  
  // Add items based on planned meals
  Object.keys(mealCounts).forEach(mealName => {
    const count = mealCounts[mealName]
    
    // Try to match with grocery mapping
    Object.keys(groceryMapping).forEach(key => {
      if (mealName.includes(key) || key.includes(mealName)) {
        groceryMapping[key].forEach(item => {
          groceryList.add(`${item}${count > 1 ? ` (x${count})` : ''}`)
        })
      }
    })
  })
  
  closeModal()
  
  // Show enhanced grocery list
  showModal('רשימת קניות חכמה', `
    <div class="mb-4">
      <h4 class="font-medium mb-3">רשימת קניות מבוססת על התפריט השבועי:</h4>
      <div class="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
        ${groceryList.size > 0 ? `
          <div class="grid grid-cols-1 gap-2">
            ${Array.from(groceryList).map(item => `
              <label class="flex items-center p-1 hover:bg-white rounded">
                <input type="checkbox" class="ml-2">
                <span class="text-sm">${item}</span>
              </label>
            `).join('')}
          </div>
        ` : '<p class="text-gray-500 text-center">לא נמצאו פריטים לרשימת קניות</p>'}
      </div>
      <p class="text-xs text-gray-500 mt-3">
        💡 הרשימה מבוססת על המנות שתכננת השבוע
      </p>
    </div>
    <button onclick="closeModal()" class="w-full bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">סגור</button>
  `)
}

// Send chat message
function sendMessage() {
  const input = document.getElementById('chat-input')
  const message = input.value.trim()
  
  if (!message) return
  
  addChatMessage('אתה', message)
  input.value = ''
  
  // Simple chatbot responses
  setTimeout(() => {
    const responses = [
      'זה נשמע נהדר! מה עוד תרצה לתכנן?',
      'רעיון מעולה! אולי כדאי להוסיף גם ירקות?',
      'נחמד! האם יש העדפות מיוחדות לילדים?',
      'מושלם! אל תשכח לשתות הרבה מים',
      'איך אוכל לעזור לך עוד בתכנון?'
    ]
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    addChatMessage('עוזר', randomResponse)
  }, 1000)
}

// Add chat message
function addChatMessage(sender, message) {
  const container = document.getElementById('chat-messages')
  if (!container) return
  
  const messageDiv = document.createElement('div')
  messageDiv.className = `mb-2 ${sender === 'אתה' ? 'text-left' : 'text-right'}`
  messageDiv.innerHTML = `
    <div class="inline-block p-2 rounded max-w-xs ${sender === 'אתה' ? 'bg-blue-100' : 'bg-green-100'}">
      <strong>${sender}:</strong> ${message}
    </div>
  `
  container.appendChild(messageDiv)
  container.scrollTop = container.scrollHeight
}

// Home button functionality
document.addEventListener('DOMContentLoaded', function() {
  const homeBtn = document.getElementById('home-btn')
  if (homeBtn) {
    homeBtn.addEventListener('click', function() {
      location.reload()
    })
  }
})

console.log('📱 קובץ JavaScript נטען בהצלחה')