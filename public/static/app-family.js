// Basic Working Meal Planner Application
console.log('🚀 מאתחל את מתכנן הארוחות...')

// Global state for week management
let currentWeekOffset = 0 // 0 = current week, 1 = next week
let weekStartDate = new Date()

// Hebrew day names
const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

// Get current week start date (Sunday)
function getCurrentWeekStart(offset = 0) {
  const today = new Date()
  const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - currentDay + (offset * 7))
  return weekStart
}

// Format date to Hebrew DD/MM format
function formatHebrewDate(date) {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${day}/${month}`
}

// Get week dates with Hebrew day names
function getWeekDatesWithNames(offset = 0) {
  const weekStart = getCurrentWeekStart(offset)
  return hebrewDays.map((dayName, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    return {
      name: dayName,
      date: date,
      formatted: formatHebrewDate(date),
      fullDisplay: `${dayName} ${formatHebrewDate(date)}`
    }
  })
}

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

        <button onclick="toggleWeekView()" class="btn btn-info text-center p-4 rounded-lg border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all">
          <i class="fas fa-calendar-alt text-2xl mb-2 block"></i>
          <span class="font-medium" id="week-toggle-text">השבוע הבא</span>
          <div class="text-sm text-gray-500 mt-1" id="week-toggle-desc">תכנון לשבוע הבא</div>
        </button>
      </div>

      <!-- Weekly Planner -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">
            <i class="fas fa-calendar-week mr-2"></i>
            <span id="week-title">תכנון שבועי</span>
          </h2>
          <div class="flex flex-col items-end">
            <div id="week-dates" class="text-sm text-gray-600 mb-1">
              <!-- Week range will be displayed here -->
            </div>
            <div id="week-summary" class="text-sm text-gray-500">
              <!-- Week summary will be updated by JavaScript -->
            </div>
          </div>
        </div>
        <div class="overflow-x-auto bg-white rounded-lg shadow-sm border">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gradient-to-l from-blue-50 to-blue-100" id="week-table-header">
                <th class="border border-gray-200 p-3 font-medium text-blue-800 min-w-[80px]">ארוחה</th>
                <th class="border border-gray-200 p-3 font-medium text-blue-800 min-w-[100px]">ילד</th>
                <!-- Day headers will be updated by JavaScript -->
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
  
  // Update week summary
  updateWeekSummary()
  
  console.log('✅ האפליקציה נטענה בהצלחה!')
})

// Initialize weekly planning table
function initWeekTable() {
  const weekDates = getWeekDatesWithNames(currentWeekOffset)
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  const weekTable = document.getElementById('week-table')
  
  // Update week title and date range
  updateWeekDisplay()
  
  if (!weekTable) return
  
  let tableHTML = ''
  
  // If no children, show message to add children first
  if (children.length === 0) {
    tableHTML = `
      <tr>
        <td colspan="${weekDates.length + 2}" class="text-center p-8 text-gray-500">
          <i class="fas fa-users text-3xl mb-2 block"></i>
          <div class="mb-2">נא הוסף ילדים למשפחה תחילה</div>
          <button onclick="showAddChildModal()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <i class="fas fa-plus mr-1"></i>
            הוסף ילד ראשון
          </button>
        </td>
      </tr>
    `
  } else {
    // Create table exactly like the image: merged cells for meal types
    const mealTypes = [
      { name: 'בוקר', displayName: 'ארוחת בוקר', icon: 'fas fa-coffee', color: 'bg-yellow-50' },
      { name: 'צהריים', displayName: 'ארוחת צהריים', icon: 'fas fa-sun', color: 'bg-orange-50' },
      { name: 'ערב', displayName: 'ארוחת ערב', icon: 'fas fa-moon', color: 'bg-blue-50' }
    ]
    
    mealTypes.forEach((meal, mealIndex) => {
      children.forEach((child, childIndex) => {
        if (childIndex === 0) {
          // First row for each meal type - includes merged cell
          tableHTML += `
            <tr class="border-t-2 border-gray-300">
              <td class="border border-gray-200 p-3 font-bold text-center ${meal.color} align-middle" rowspan="${children.length}">
                <div class="flex flex-col items-center justify-center">
                  <i class="${meal.icon} text-xl mb-2 text-gray-700"></i>
                  <span class="text-sm font-medium text-gray-800 writing-mode-vertical whitespace-nowrap">${meal.displayName}</span>
                </div>
              </td>
              <td class="border border-gray-200 p-2 bg-gray-100 font-medium text-center min-w-[80px]">
                ${child.name}
              </td>
              ${weekDates.map(dayInfo => `
                <td class="border border-gray-200 p-1 min-w-[100px] h-12" id="cell-${dayInfo.name}-${meal.name}-${child.id}">
                  <button onclick="addMealForChild('${dayInfo.name}', '${meal.name}', '${child.id}', '${child.name}')" 
                          class="w-full h-full border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-xs flex items-center justify-center">
                    <i class="fas fa-plus"></i>
                  </button>
                </td>
              `).join('')}
            </tr>
          `
        } else {
          // Subsequent rows for other children in same meal type
          tableHTML += `
            <tr>
              <td class="border border-gray-200 p-2 bg-gray-100 font-medium text-center">
                ${child.name}
              </td>
              ${weekDates.map(dayInfo => `
                <td class="border border-gray-200 p-1 h-12" id="cell-${dayInfo.name}-${meal.name}-${child.id}">
                  <button onclick="addMealForChild('${dayInfo.name}', '${meal.name}', '${child.id}', '${child.name}')" 
                          class="w-full h-full border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-xs flex items-center justify-center">
                    <i class="fas fa-plus"></i>
                  </button>
                </td>
              `).join('')}
            </tr>
          `
        }
      })
    })
  }
  
  weekTable.innerHTML = tableHTML
}

// Update week display (title, dates, header)
function updateWeekDisplay() {
  const weekDates = getWeekDatesWithNames(currentWeekOffset)
  const isCurrentWeek = currentWeekOffset === 0
  
  // Update week title and toggle button
  const weekTitle = document.getElementById('week-title')
  const weekToggleText = document.getElementById('week-toggle-text')
  const weekToggleDesc = document.getElementById('week-toggle-desc')
  
  if (weekTitle) {
    weekTitle.textContent = isCurrentWeek ? 'תכנון השבוע הנוכחי' : 'תכנון לשבוע הבא'
  }
  
  if (weekToggleText && weekToggleDesc) {
    if (isCurrentWeek) {
      weekToggleText.textContent = 'השבוע הבא'
      weekToggleDesc.textContent = 'תכנון לשבוע הבא'
    } else {
      weekToggleText.textContent = 'השבוע הנוכחי'
      weekToggleDesc.textContent = 'חזרה לשבוע הנוכחי'
    }
  }
  
  // Update week date range display
  const weekDatesElement = document.getElementById('week-dates')
  if (weekDatesElement) {
    const startDate = weekDates[0].date
    const endDate = weekDates[6].date
    weekDatesElement.textContent = `${formatHebrewDate(startDate)} - ${formatHebrewDate(endDate)}`
  }
  
  // Update table headers with dates
  const tableHeader = document.getElementById('week-table-header')
  if (tableHeader) {
    // Keep the first two headers (ארוחה, ילד) and update day headers
    const dayHeaders = weekDates.map(dayInfo => 
      `<th class="border border-gray-200 p-3 font-medium text-blue-800 min-w-[120px]">
        <div class="flex flex-col">
          <span class="font-bold">${dayInfo.name}</span>
          <span class="text-xs font-normal text-blue-600">${dayInfo.formatted}</span>
        </div>
      </th>`
    ).join('')
    
    tableHeader.innerHTML = `
      <th class="border border-gray-200 p-3 font-medium text-blue-800 min-w-[80px]">ארוחה</th>
      <th class="border border-gray-200 p-3 font-medium text-blue-800 min-w-[100px]">ילד</th>
      ${dayHeaders}
    `
  }
}

// Toggle between current week and next week
function toggleWeekView() {
  currentWeekOffset = currentWeekOffset === 0 ? 1 : 0
  
  // Reinitialize the table with new week data
  initWeekTable()
  
  // Reload meal data for the new week
  loadWeeklyPlan()
  
  console.log(`🗓️ הוחלף לתצוגת ${currentWeekOffset === 0 ? 'השבוע הנוכחי' : 'השבוע הבא'}`)
}

// Get storage key for specific week
function getWeekStorageKey(offset = 0) {
  const weekStart = getCurrentWeekStart(offset)
  const year = weekStart.getFullYear()
  const month = (weekStart.getMonth() + 1).toString().padStart(2, '0')
  const day = weekStart.getDate().toString().padStart(2, '0')
  return `week_${year}_${month}_${day}`
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
        <button onclick="removeChild('${child.id}')" class="text-red-500 hover:text-red-700" title="מחק ילד">
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
  refreshAllDisplays() // This will recreate the table with new child
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
  console.log('🗑️ removeChild called with id:', id)
  
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  console.log('👥 Current children:', children)
  
  const child = children.find(c => c.id === id)
  
  if (!child) {
    console.error('❌ Child not found for id:', id)
    alert('לא נמצא ילד למחיקה')
    return
  }
  
  console.log('👶 Found child to delete:', child)
  
  // Ask for confirmation
  if (!confirm(`האם אתה בטוח שברצונך למחוק את ${child.name} מהמערכת?\n\nזה גם ימחק את כל הארוחות המתוכננות עבורו.`)) {
    console.log('🚫 User cancelled deletion')
    return
  }
  
  // Remove child from children list
  const updatedChildren = children.filter(child => child.id !== id)
  localStorage.setItem('mealPlannerChildren', JSON.stringify(updatedChildren))
  
  // Remove all meals for this child from all weeks
  const weeklyMenus = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenus') || '{}')
  let menusUpdated = false
  
  Object.keys(weeklyMenus).forEach(weekKey => {
    const weekMenu = weeklyMenus[weekKey]
    Object.keys(weekMenu).forEach(mealKey => {
      if (mealKey.endsWith(`_${id}`)) {
        delete weekMenu[mealKey]
        menusUpdated = true
      }
    })
  })
  
  if (menusUpdated) {
    localStorage.setItem('mealPlannerWeeklyMenus', JSON.stringify(weeklyMenus))
  }
  
  // Refresh all displays
  refreshAllDisplays()
  
  console.log('✅ Child deletion completed successfully')
  alert(`${child.name} נמחק מהמערכת בהצלחה`)
}

// Remove menu item
function removeMenuItem(id) {
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  const item = menuItems.find(m => m.id === id)
  
  if (!item) {
    alert('לא נמצאה מנה למחיקה')
    return
  }
  
  // Ask for confirmation
  if (!confirm(`האם אתה בטוח שברצונך למחוק את המנה "${item.name}"?\n\nזה גם ימחק אותה מכל התכניות השבועיות.`)) {
    return
  }
  
  // Remove menu item
  const updatedMenuItems = menuItems.filter(item => item.id !== id)
  localStorage.setItem('mealPlannerMenuItems', JSON.stringify(updatedMenuItems))
  
  // Remove this meal from all weekly plans
  const weeklyMenus = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenus') || '{}')
  let menusUpdated = false
  
  Object.keys(weeklyMenus).forEach(weekKey => {
    const weekMenu = weeklyMenus[weekKey]
    Object.keys(weekMenu).forEach(mealKey => {
      if (weekMenu[mealKey].mealId === id) {
        delete weekMenu[mealKey]
        menusUpdated = true
      }
    })
  })
  
  if (menusUpdated) {
    localStorage.setItem('mealPlannerWeeklyMenus', JSON.stringify(weeklyMenus))
  }
  
  // Update displays
  updateMenuList(updatedMenuItems)
  loadWeeklyPlan() // Refresh the weekly table
  updateWeekSummary()
  
  alert(`המנה "${item.name}" נמחקה בהצלחה`)
}

// Add meal for specific child
function addMealForChild(day, mealTime, childId, childName) {
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  const child = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]').find(c => c.id === childId)
  
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
  
  // Show child preferences if available
  const childPreferences = child?.preferences || []
  const mealOptions = relevantMeals.map(meal => {
    const isPreferred = childPreferences.includes(meal.name)
    return `<option value="${meal.id}" ${isPreferred ? 'class="bg-green-100"' : ''}>${meal.name}${isPreferred ? ' ❤️' : ''}</option>`
  }).join('')
  
  showModal(`הוסף ארוחה עבור ${childName} - יום ${day}, ארוחת ${mealTime}`, `
    <form onsubmit="saveMealForChild(event, '${day}', '${mealTime}', '${childId}')">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">בחר מנה עבור ${childName}:</label>
        <select id="meal-select" class="w-full p-2 border border-gray-300 rounded" required>
          <option value="">בחר מנה...</option>
          ${mealOptions}
        </select>
        ${childPreferences.length > 0 ? 
          '<p class="text-xs text-green-600 mt-1">❤️ מנות שהילד אוהב מסומנות בלב</p>' : 
          '<p class="text-xs text-gray-500 mt-1">לא הוגדרו העדפות לילד זה</p>'
        }
      </div>
      <div class="flex gap-3">
        <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">הוסף</button>
        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">ביטול</button>
      </div>
    </form>
  `)
}

// Legacy function for backward compatibility
function addMeal(day, mealTime) {
  addMealForChild(day, mealTime, null, 'כללי')
}

// Save meal for specific child
function saveMealForChild(event, day, mealTime, childId) {
  event.preventDefault()
  const mealId = document.getElementById('meal-select').value
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  const selectedMeal = menuItems.find(item => item.id === mealId)
  const child = children.find(c => c.id === childId)
  
  if (selectedMeal && child) {
    // Save to weekly menu structure with week offset and child info
    const weekKey = getWeekStorageKey(currentWeekOffset)
    let weeklyMenus = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenus') || '{}')
    
    if (!weeklyMenus[weekKey]) {
      weeklyMenus[weekKey] = {}
    }
    
    const mealKey = `${day}_${mealTime}_${childId}`
    
    weeklyMenus[weekKey][mealKey] = {
      mealId: selectedMeal.id,
      mealName: selectedMeal.name,
      childId: childId,
      childName: child.name,
      addedAt: new Date().toISOString(),
      isPreferred: child.preferences && child.preferences.includes(selectedMeal.name)
    }
    
    localStorage.setItem('mealPlannerWeeklyMenus', JSON.stringify(weeklyMenus))
    
    const weekDisplayText = currentWeekOffset === 0 ? 'השבוע הנוכחי' : 'השבוע הבא'
    alert(`נוסף: ${selectedMeal.name} עבור ${child.name} ביום ${day}, ארוחת ${mealTime} ב${weekDisplayText}`)
    
    // Update the visual cell and summary
    updateMealCellForChild(day, mealTime, childId)
    updateWeekSummary()
  }
  
  closeModal()
}

// Legacy function for backward compatibility
function saveMeal(event, day, mealTime) {
  saveMealForChild(event, day, mealTime, null)
}

// Update meal cell display for specific child
function updateMealCellForChild(day, mealTime, childId) {
  const weekKey = getWeekStorageKey(currentWeekOffset)
  const weeklyMenus = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenus') || '{}')
  const weeklyMenu = weeklyMenus[weekKey] || {}
  const key = `${day}_${mealTime}_${childId}`
  const mealData = weeklyMenu[key]
  
  // Find the specific cell by ID
  const cell = document.getElementById(`cell-${day}-${mealTime}-${childId}`)
  if (!cell) return
  
  if (mealData) {
    // Show the meal in a compact format suitable for table cells
    cell.innerHTML = `
      <div class="bg-blue-100 border border-blue-200 rounded p-1 text-center h-full flex flex-col justify-center relative group">
        <div class="font-medium text-blue-800 text-xs leading-tight">${mealData.mealName}</div>
        ${mealData.isPreferred ? 
          '<div class="text-xs text-green-600 mt-1">❤️</div>' : 
          '<div class="text-xs text-gray-500 mt-1">🤷‍♂️</div>'
        }
        <button onclick="removeMealForChild('${day}', '${mealTime}', '${childId}')" 
                class="absolute top-0 right-0 text-red-500 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full w-4 h-4 flex items-center justify-center -mt-1 -mr-1">
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>
    `
  } else {
    // Show empty state with add button
    const child = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]').find(c => c.id === childId)
    cell.innerHTML = `
      <button onclick="addMealForChild('${day}', '${mealTime}', '${childId}', '${child?.name || ''}')" 
              class="w-full h-full border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-xs flex items-center justify-center">
        <i class="fas fa-plus"></i>
      </button>
    `
  }
}

// Legacy function - now updates all children for a meal type
function updateMealCell(day, mealTime) {
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  children.forEach(child => {
    updateMealCellForChild(day, mealTime, child.id)
  })
}

// Remove meal for specific child
function removeMealForChild(day, mealTime, childId) {
  const weekKey = getWeekStorageKey(currentWeekOffset)
  let weeklyMenus = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenus') || '{}')
  const key = `${day}_${mealTime}_${childId}`
  
  if (weeklyMenus[weekKey] && weeklyMenus[weekKey][key]) {
    delete weeklyMenus[weekKey][key]
  }
  
  localStorage.setItem('mealPlannerWeeklyMenus', JSON.stringify(weeklyMenus))
  updateMealCellForChild(day, mealTime, childId)
  updateWeekSummary()
}

// Legacy function for backward compatibility
function removeMealFromPlan(day, mealTime, mealId) {
  removeMealForChild(day, mealTime, mealId)
}

// Load and display existing weekly plan
function loadWeeklyPlan() {
  const weekKey = getWeekStorageKey(currentWeekOffset)
  const weeklyMenus = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenus') || '{}')
  const weeklyMenu = weeklyMenus[weekKey] || {}
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
  const mealTypes = ['בוקר', 'צהריים', 'ערב']
  
  // Update all cells to show current state
  days.forEach(day => {
    mealTypes.forEach(mealTime => {
      children.forEach(child => {
        updateMealCellForChild(day, mealTime, child.id)
      })
    })
  })
}

// Refresh all data displays
function refreshAllDisplays() {
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  
  updateChildrenList(children)
  updateMenuList(menuItems)
  loadWeeklyPlan()
  updateWeekSummary()
}

// Update week summary
function updateWeekSummary() {
  const weekKey = getWeekStorageKey(currentWeekOffset)
  const weeklyMenus = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenus') || '{}')
  const weeklyMenu = weeklyMenus[weekKey] || {}
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  
  const totalMeals = Object.keys(weeklyMenu).length
  const summaryEl = document.getElementById('week-summary')
  
  if (summaryEl) {
    if (totalMeals > 0) {
      const weekDisplayText = currentWeekOffset === 0 ? 'השבוע הנוכחי' : 'השבוע הבא'
      summaryEl.innerHTML = `
        <div class="flex items-center gap-4 text-sm">
          <div class="bg-blue-100 px-2 py-1 rounded">
            <i class="fas fa-utensils mr-1"></i>
            ${totalMeals} ארוחות ב${weekDisplayText}
          </div>
          <div class="bg-green-100 px-2 py-1 rounded">
            <i class="fas fa-users mr-1"></i>
            ${children.length} ילדים
          </div>
        </div>
      `
    } else {
      const weekDisplayText = currentWeekOffset === 0 ? 'השבוע הנוכחי' : 'השבוע הבא'
      summaryEl.innerHTML = `
        <div class="text-gray-500 text-sm">
          <i class="fas fa-info-circle mr-1"></i>
          לא נוספו ארוחות ב${weekDisplayText}
        </div>
      `
    }
  }
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
  refreshAllDisplays() // Update everything including weekly view
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
  
  // Try to parse Hebrew meal assignment commands
  setTimeout(() => {
    const result = parseHebrewMealCommand(message)
    
    if (result.success) {
      // Execute the meal assignment
      executeMealAssignment(result)
    } else {
      // Default chatbot responses if no command recognized
      const responses = [
        'אני כאן לעזור! נסה לכתוב בצורה: "תשבץ ל[שם ילד] בימים [ימים] [שם מנה]"',
        'אני יכול לעזור לך לשבץ מנות! למשל: "תשבץ לאורי בימים ראשון ושלישי חביתה"',
        'האם אתה רוצה לשבץ מנה? כתוב לי בצורה: "תשבץ ל[שם] ביום [יום] [מנה]"',
        'אני מבין פקודות שיבוץ. נסה לשאול: "תשבץ למיה ביום שבת מרק"'
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      addChatMessage('עוזר', randomResponse)
    }
  }, 500)
}

// Parse Hebrew meal assignment commands
function parseHebrewMealCommand(message) {
  // Normalize message - remove extra spaces and convert to lowercase
  const normalized = message.trim().replace(/\s+/g, ' ')
  
  // Pattern: "תשבץ ל<שם ילד> בימים <ימים> <שם מנה>"
  // Examples: "תשבץ לאורי בימים ראשון ושלישי חביתה"
  //          "תשבץ למיה ביום שבת מרק"
  
  // Regular expression to match the pattern
  const patterns = [
    // תשבץ ל<שם> בימים <ימים> <מנה>
    /תשבץ\s+ל(\S+)\s+בימים\s+(.+?)\s+(.+)/,
    // תשבץ ל<שם> ביום <יום> <מנה>
    /תשבץ\s+ל(\S+)\s+ביום\s+(\S+)\s+(.+)/,
    // שבץ ל<שם> <ימים> <מנה>
    /שבץ\s+ל(\S+)\s+(.+?)\s+(.+)/
  ]
  
  for (const pattern of patterns) {
    const match = normalized.match(pattern)
    if (match) {
      const childName = match[1]
      let daysText = match[2]
      const dishName = match[3]
      
      // Handle single day case ("ביום")
      if (pattern.source.includes('ביום')) {
        daysText = match[2] // Single day
      }
      
      // Parse days
      const days = parseDays(daysText)
      
      if (days.length > 0) {
        return {
          success: true,
          childName: childName,
          days: days,
          dishName: dishName
        }
      }
    }
  }
  
  return { success: false }
}

// Parse Hebrew day names and combinations
function parseDays(daysText) {
  const dayMappings = {
    'ראשון': 'ראשון',
    'שני': 'שני',
    'שלישי': 'שלישי',
    'רביעי': 'רביעי',
    'חמישי': 'חמישי',
    'שישי': 'שישי',
    'שבת': 'שבת'
  }
  
  const days = []
  
  // Split by "ו" (and) and other separators
  const parts = daysText.split(/\s*[ו,]\s*|\s+ו\s+/)
  
  for (const part of parts) {
    const trimmed = part.trim()
    if (dayMappings[trimmed]) {
      days.push(dayMappings[trimmed])
    }
  }
  
  return days
}

// Execute meal assignment from chatbot command
function executeMealAssignment(result) {
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  
  // Find child by name (case-insensitive)
  const child = children.find(c => 
    c.name.toLowerCase() === result.childName.toLowerCase()
  )
  
  if (!child) {
    addChatMessage('עוזר', `לא מצאתי ילד בשם "${result.childName}". הילדים הרשומים: ${children.map(c => c.name).join(', ')}`)
    return
  }
  
  // Find dish by name (case-insensitive, partial match)
  const dish = menuItems.find(item => 
    item.name.toLowerCase().includes(result.dishName.toLowerCase()) ||
    result.dishName.toLowerCase().includes(item.name.toLowerCase())
  )
  
  if (!dish) {
    addChatMessage('עוזר', `לא מצאתי מנה בשם "${result.dishName}". המנות הזמינות: ${menuItems.map(m => m.name).join(', ')}`)
    return
  }
  
  // Assign meal for each day
  const weekKey = getWeekStorageKey(currentWeekOffset)
  let weeklyMenus = JSON.parse(localStorage.getItem('mealPlannerWeeklyMenus') || '{}')
  
  if (!weeklyMenus[weekKey]) {
    weeklyMenus[weekKey] = {}
  }
  
  let assignedCount = 0
  const weekDisplayText = currentWeekOffset === 0 ? 'השבוע הנוכחי' : 'השבוע הבא'
  
  // Try to assign to lunch time first, then dinner, then breakfast
  const mealTimes = ['צהריים', 'ערב', 'בוקר']
  
  for (const day of result.days) {
    let assigned = false
    
    // Check if dish is suitable for specific meal times
    for (const mealTime of mealTimes) {
      if (dish.mealTypes.length === 0 || dish.mealTypes.includes(mealTime)) {
        const mealKey = `${day}_${mealTime}_${child.id}`
        
        weeklyMenus[weekKey][mealKey] = {
          mealId: dish.id,
          mealName: dish.name,
          childId: child.id,
          childName: child.name,
          addedAt: new Date().toISOString(),
          isPreferred: child.preferences && child.preferences.includes(dish.name),
          assignedByChat: true
        }
        
        assignedCount++
        assigned = true
        
        // Update visual display
        updateMealCellForChild(day, mealTime, child.id)
        break // Only assign to one meal time per day
      }
    }
    
    if (!assigned) {
      addChatMessage('עוזר', `לא יכולתי לשבץ את "${dish.name}" ליום ${day} - המנה לא מתאימה לארוחות הזמינות`)
    }
  }
  
  localStorage.setItem('mealPlannerWeeklyMenus', JSON.stringify(weeklyMenus))
  updateWeekSummary()
  
  if (assignedCount > 0) {
    const daysText = result.days.join(' ו')
    addChatMessage('עוזר', `מעולה! שיבצתי את "${dish.name}" ל${child.name} בימים ${daysText} ב${weekDisplayText} (סך הכל ${assignedCount} שיבוצים) ✓`)
  } else {
    addChatMessage('עוזר', 'לא הצלחתי לשבץ את המנה. בדוק שהמנה מתאימה לארוחות הנדרשות.')
  }
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