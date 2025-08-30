// Family Meal Planner - Individual Child Planning
console.log('🚀 מאתחל את מתכנן הארוחות המשפחתי...')

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM מוכן - מציג ממשק משפחתי...')
  
  // Get the app container
  const appContainer = document.getElementById('app')
  if (!appContainer) {
    console.error('לא נמצא מכל האפליקציה')
    return
  }

  // Render the main interface
  renderMainInterface()
  
  // Load saved data and refresh display
  loadAndRefreshData()
  
  console.log('✅ האפליקציה המשפחתית נטענה בהצלחה!')
})

function renderMainInterface() {
  const appContainer = document.getElementById('app')
  appContainer.innerHTML = `
    <div class="max-w-7xl mx-auto p-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-blue-600 mb-4">
          <i class="fas fa-utensils mr-3"></i>
          מתכנן הארוחות המשפחתי
        </h1>
        <p class="text-gray-600">תכנן ארוחות אישיות לכל ילד במשפחה</p>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button onclick="showAddChildModal()" class="text-center p-4 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all">
          <i class="fas fa-child text-2xl mb-2 block text-blue-600"></i>
          <span class="font-medium">הוסף ילד</span>
          <div class="text-sm text-gray-500 mt-1">ניהול ילדי המשפחה</div>
        </button>

        <button onclick="showAddMenuModal()" class="text-center p-4 rounded-lg border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all">
          <i class="fas fa-utensils text-2xl mb-2 block text-green-600"></i>
          <span class="font-medium">הוסף מנה</span>
          <div class="text-sm text-gray-500 mt-1">מנות חדשות לתפריט</div>
        </button>

        <button onclick="showChatModal()" class="text-center p-4 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all">
          <i class="fas fa-robot text-2xl mb-2 block text-purple-600"></i>
          <span class="font-medium">צ'אט חכם</span>
          <div class="text-sm text-gray-500 mt-1">עוזר תכנון ארוחות</div>
        </button>

        <button onclick="showGroceryModal()" class="text-center p-4 rounded-lg border-2 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all">
          <i class="fas fa-shopping-cart text-2xl mb-2 block text-yellow-600"></i>
          <span class="font-medium">רשימת קניות</span>
          <div class="text-sm text-gray-500 mt-1">מה צריך לקנות השבוע</div>
        </button>
      </div>

      <!-- Weekly Planner by Children -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-bold mb-4 text-center">
          <i class="fas fa-calendar-week mr-2"></i>
          תכנון שבועי לפי ילדים
        </h2>
        <div id="weekly-planner">
          <!-- Will be filled by JavaScript -->
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
}

// Load saved data and refresh all displays
function loadAndRefreshData() {
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  const weekPlan = JSON.parse(localStorage.getItem('mealPlannerWeekPlan') || '{}')
  
  updateChildrenList(children)
  updateMenuList(menuItems)
  renderWeeklyPlannerByChildren(children, menuItems, weekPlan)
}

// Render weekly planner organized by children
function renderWeeklyPlannerByChildren(children, menuItems, weekPlan) {
  const container = document.getElementById('weekly-planner')
  if (!container) return
  
  if (children.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-child text-4xl mb-4 block"></i>
        <p class="text-lg">עדיין לא נוספו ילדים למשפחה</p>
        <p class="text-sm">הוסף ילדים כדי להתחיל לתכנן ארוחות אישיות</p>
      </div>
    `
    return
  }
  
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
  const meals = [
    { key: 'breakfast', name: 'בוקר', icon: 'fa-coffee', color: 'orange' },
    { key: 'lunch', name: 'צהריים', icon: 'fa-hamburger', color: 'blue' },
    { key: 'dinner', name: 'ערב', icon: 'fa-pizza-slice', color: 'green' }
  ]

  container.innerHTML = `
    <div class="overflow-x-auto">
      <div class="min-w-max">
        <!-- Header Row -->
        <div class="grid grid-cols-${1 + (days.length * meals.length)} gap-2 mb-2">
          <div class="font-bold text-center p-3 bg-gray-100 rounded">ילדים</div>
          ${days.map(day => `
            <div class="col-span-${meals.length} font-bold text-center p-2 bg-gray-100 rounded">${day}</div>
          `).join('')}
        </div>

        <!-- Meals Header -->
        <div class="grid grid-cols-${1 + (days.length * meals.length)} gap-2 mb-4">
          <div></div>
          ${days.map(() => 
            meals.map(meal => `
              <div class="text-center p-2 bg-${meal.color}-50 rounded text-sm">
                <i class="fas ${meal.icon} text-${meal.color}-600 mb-1 block"></i>
                ${meal.name}
              </div>
            `).join('')
          ).join('')}
        </div>

        <!-- Children Rows -->
        ${children.map(child => `
          <div class="grid grid-cols-${1 + (days.length * meals.length)} gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <!-- Child Name -->
            <div class="flex items-center font-medium p-3 bg-white rounded border">
              <i class="fas fa-child mr-2 text-blue-500"></i>
              <div>
                <div>${child.name}</div>
                ${child.age ? `<div class="text-xs text-gray-500">גיל ${child.age}</div>` : ''}
              </div>
            </div>

            <!-- Meal Slots for each day -->
            ${days.map(day => 
              meals.map(meal => {
                const mealKey = `${child.id}_${day}_${meal.key}`
                const currentMeal = weekPlan[mealKey]
                return `
                  <div class="meal-slot bg-white rounded border p-2 min-h-[80px] hover:shadow-md transition-shadow">
                    ${currentMeal ? `
                      <div class="text-sm font-medium text-gray-800 mb-1">${currentMeal.name}</div>
                      <div class="flex justify-between items-center">
                        <div class="text-xs text-gray-500">${currentMeal.time || ''}</div>
                        <button onclick="removeMeal('${mealKey}')" class="text-red-500 hover:text-red-700 text-xs">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    ` : `
                      <button onclick="addMealForChild('${child.id}', '${child.name}', '${day}', '${meal.key}', '${meal.name}')" 
                              class="w-full h-full border-2 border-dashed border-gray-300 rounded text-gray-400 hover:border-${meal.color}-400 hover:text-${meal.color}-600 transition-colors text-sm">
                        <i class="fas fa-plus mb-1 block"></i>
                        הוסף ארוחה
                      </button>
                    `}
                  </div>
                `
              }).join('')
            ).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `
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
      <div>
        <span class="font-medium">${child.name}</span>
        ${child.age ? `<span class="text-sm text-gray-500 mr-2">(גיל ${child.age})</span>` : ''}
        ${child.preferences ? `<div class="text-xs text-gray-500">העדפות: ${child.preferences}</div>` : ''}
      </div>
      <button onclick="removeChild('${child.id}')" class="text-red-500 hover:text-red-700">
        <i class="fas fa-trash"></i>
      </button>
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
        ${item.prepTime ? `<div class="text-xs text-gray-500">זמן הכנה: ${item.prepTime} דקות</div>` : ''}
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
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">העדפות מזון (אופציונלי)</label>
        <input type="text" id="child-preferences" class="w-full p-2 border border-gray-300 rounded" placeholder="למשל: לא אוהב ירקות, צמחוני...">
      </div>
      <div class="flex gap-3">
        <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">הוסף ילד</button>
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
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">זמן הכנה (דקות, אופציונלי)</label>
        <input type="number" id="prep-time" class="w-full p-2 border border-gray-300 rounded" min="1" max="300">
      </div>
      <div class="flex gap-3">
        <button type="submit" class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">הוסף מנה</button>
        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">ביטול</button>
      </div>
    </form>
  `)
}

// Add meal for specific child
function addMealForChild(childId, childName, day, mealKey, mealName) {
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  
  if (menuItems.length === 0) {
    alert('נא הוסף מנות למאגר תחילה')
    return
  }
  
  // Filter meals appropriate for this meal type
  const relevantMeals = menuItems.filter(item => 
    item.mealTypes.includes(mealKey) || item.mealTypes.length === 0
  )
  
  if (relevantMeals.length === 0) {
    alert(`אין מנות מתאימות לארוחת ${mealName}`)
    return
  }
  
  const mealOptions = relevantMeals.map(meal => 
    `<option value="${meal.id}" data-name="${meal.name}" data-preptime="${meal.prepTime || ''}">${meal.name}${meal.prepTime ? ` (${meal.prepTime} דקות)` : ''}</option>`
  ).join('')
  
  showModal(`הוסף ארוחה ל${childName}`, `
    <div class="mb-4">
      <h4 class="font-medium text-gray-800">${childName} - יום ${day}, ארוחת ${mealName}</h4>
    </div>
    <form onsubmit="saveMealForChild(event, '${childId}', '${day}', '${mealKey}')">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">בחר מנה:</label>
        <select id="meal-select" class="w-full p-2 border border-gray-300 rounded" required>
          <option value="">בחר מנה...</option>
          ${mealOptions}
        </select>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">שעת הארוחה (אופציונלי):</label>
        <input type="time" id="meal-time" class="w-full p-2 border border-gray-300 rounded">
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">הערות (אופציונלי):</label>
        <input type="text" id="meal-notes" class="w-full p-2 border border-gray-300 rounded" placeholder="למשל: בלי בצל, עם קטשופ...">
      </div>
      <div class="flex gap-3">
        <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">הוסף ארוחה</button>
        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">ביטול</button>
      </div>
    </form>
  `)
}

// Save meal for specific child
function saveMealForChild(event, childId, day, mealKey) {
  event.preventDefault()
  
  const mealSelect = document.getElementById('meal-select')
  const selectedOption = mealSelect.options[mealSelect.selectedIndex]
  const mealTime = document.getElementById('meal-time').value
  const mealNotes = document.getElementById('meal-notes').value
  
  if (!selectedOption.value) return
  
  const weekPlan = JSON.parse(localStorage.getItem('mealPlannerWeekPlan') || '{}')
  const mealPlanKey = `${childId}_${day}_${mealKey}`
  
  weekPlan[mealPlanKey] = {
    id: selectedOption.value,
    name: selectedOption.dataset.name,
    time: mealTime,
    notes: mealNotes,
    prepTime: selectedOption.dataset.preptime
  }
  
  localStorage.setItem('mealPlannerWeekPlan', JSON.stringify(weekPlan))
  closeModal()
  loadAndRefreshData() // Refresh the display
}

// Remove meal from plan
function removeMeal(mealKey) {
  const weekPlan = JSON.parse(localStorage.getItem('mealPlannerWeekPlan') || '{}')
  delete weekPlan[mealKey]
  localStorage.setItem('mealPlannerWeekPlan', JSON.stringify(weekPlan))
  loadAndRefreshData() // Refresh the display
}

// Generate smart grocery list based on weekly plan
function showGroceryModal() {
  const weekPlan = JSON.parse(localStorage.getItem('mealPlannerWeekPlan') || '{}')
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  
  // Count meals and analyze what's needed
  const mealCounts = {}
  const mealsByDay = {}
  
  Object.values(weekPlan).forEach(meal => {
    mealCounts[meal.name] = (mealCounts[meal.name] || 0) + 1
    
    // Group by day for display
    const dayInfo = Object.keys(weekPlan).find(key => weekPlan[key] === meal)
    if (dayInfo) {
      const [childId, day] = dayInfo.split('_')
      if (!mealsByDay[day]) mealsByDay[day] = []
      mealsByDay[day].push(meal.name)
    }
  })
  
  const groceryItems = [
    'לחם', 'חלב', 'ביצים', 'גבינה', 'חמאה', 'יוגורט',
    'פירות עונה', 'בננות', 'תפוחים', 'ירקות עלים',
    'עגבניות', 'מלפפונים', 'גזר', 'בצל', 'שום',
    'בשר בקר/עוף', 'דגים', 'אורז', 'פסטה', 'לחם מקמח מלא',
    'דגנים לארוחת בוקר', 'שמן זית', 'מלח', 'פלפל', 'סוכר'
  ]
  
  showModal('רשימת קניות חכמה', `
    <div class="mb-4">
      <h4 class="font-medium mb-3">מבוסס על התכנון השבועי:</h4>
      
      ${Object.keys(mealCounts).length > 0 ? `
        <div class="bg-blue-50 p-3 rounded mb-4">
          <h5 class="font-medium text-blue-800 mb-2">מנות מתוכננות השבוע:</h5>
          <div class="text-sm text-blue-700">
            ${Object.entries(mealCounts).map(([meal, count]) => 
              `<div>• ${meal} (${count} פעמים)</div>`
            ).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
        <h5 class="font-medium mb-2">רשימת קניות מוצעת:</h5>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          ${groceryItems.map(item => `
            <div class="flex items-center">
              <input type="checkbox" class="ml-2" id="grocery-${item}">
              <label for="grocery-${item}">${item}</label>
            </div>
          `).join('')}
        </div>
        
        <div class="mt-4 p-3 bg-yellow-50 rounded">
          <div class="flex items-center text-sm text-yellow-800">
            <i class="fas fa-lightbulb mr-2"></i>
            <span>💡 רמזים:</span>
          </div>
          <div class="text-xs text-yellow-700 mt-1">
            • קנה ${children.length} כמויות של מוצרי בסיס<br>
            • ${Object.keys(mealCounts).length > 0 ? 'בדוק מרכיבים ספציפיים למנות המתוכננות' : 'תכנן מנות קודם לרשימה מדויקת יותר'}<br>
            • אל תשכח חטיפים בריאים לילדים
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex gap-3">
      <button onclick="printGroceryList()" class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        <i class="fas fa-print mr-1"></i>
        הדפס רשימה
      </button>
      <button onclick="closeModal()" class="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">סגור</button>
    </div>
  `)
}

// Print grocery list function
function printGroceryList() {
  const checkedItems = Array.from(document.querySelectorAll('#modal input[type="checkbox"]:checked'))
    .map(checkbox => checkbox.nextElementSibling.textContent)
  
  if (checkedItems.length === 0) {
    alert('נא בחר פריטים ברשימה')
    return
  }
  
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html dir="rtl">
    <head><title>רשימת קניות משפחתית</title></head>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>🛒 רשימת קניות משפחתית</h2>
      <p><strong>תאריך:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
      <ul>
        ${checkedItems.map(item => `<li>☐ ${item}</li>`).join('')}
      </ul>
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

// Show chat modal with family-specific responses
function showChatModal() {
  showModal('צ\'אט חכם - עוזר תכנון משפחתי', `
    <div class="mb-4">
      <div id="chat-messages" class="bg-gray-50 p-4 rounded h-48 overflow-y-auto mb-4">
        <div class="text-center text-gray-600 py-4">
          <i class="fas fa-robot text-2xl mb-2 block"></i>
          שלום! אני עוזר תכנון הארוחות המשפחתי. אוכל לעזור לך עם:<br>
          • הצעות מנות לילדים<br>
          • איזון תזונתי<br>
          • חיסכון בזמן ובכסף<br>
          • רעיונות לארוחות מהירות
        </div>
      </div>
      <div class="flex gap-2">
        <input type="text" id="chat-input" class="flex-1 p-2 border border-gray-300 rounded" placeholder="איך אוכל לעזור? נסה: 'מה לתת לילד בן 5 לארוחת בוקר?'">
        <button onclick="sendFamilyMessage()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">שלח</button>
      </div>
    </div>
    <button onclick="closeModal()" class="w-full bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">סגור</button>
  `)
  
  // Add enter key listener
  document.getElementById('chat-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendFamilyMessage()
    }
  })
}

// Send family-oriented chat message
function sendFamilyMessage() {
  const input = document.getElementById('chat-input')
  const message = input.value.trim()
  
  if (!message) return
  
  addChatMessage('אתה', message)
  input.value = ''
  
  // Family-specific chatbot responses
  setTimeout(() => {
    const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
    const response = getFamilyResponse(message, children)
    addChatMessage('עוזר משפחתי', response)
  }, 1000)
}

// Get family-specific response
function getFamilyResponse(message, children) {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('בוקר') || lowerMessage.includes('ארוחת בוקר')) {
    return 'לארוחת בוקר אני ממליץ: דגנים עם חלב, ביצה רכה עם לחם, יוגורט עם פירות, או טוסט עם גבינה. מה הילדים הכי אוהבים?'
  }
  
  if (lowerMessage.includes('צהריים') || lowerMessage.includes('ארוחת צהריים')) {
    return 'לארוחת צהריים נהדר: פסטה עם רוטב עגבניות, אורז עם עוף וירקות, סנדוויץ\' טונה, או קציצות עם פירה. חשוב להוסיף ירקות!'
  }
  
  if (lowerMessage.includes('ערב') || lowerMessage.includes('ארוחת ערב')) {
    return 'לארוחת ערב אני מציע: דג עם אורז, עוף בתנור עם ירקות, חביתה עם סלט, או מרק עם לחם. בערב עדיף משהו קל יותר.'
  }
  
  if (lowerMessage.includes('ילדים') || lowerMessage.includes('ילד')) {
    if (children.length > 0) {
      return `יש לך ${children.length} ילדים במערכת: ${children.map(c => c.name).join(', ')}. כל ילד יכול לקבל מנה שונה! מה הם הכי אוהבים לאכול?`
    }
    return 'עדיין לא הוספת ילדים למערכת. הוסף אותם כדי שאוכל לתת עצות מותאמות!'
  }
  
  if (lowerMessage.includes('בריא') || lowerMessage.includes('תזונה')) {
    return 'לתזונה בריאה חשוב: ירקות וFruitsפירות מגוונים, חלבונים (ביצים, דגים, עוף), דגנים מלאים, ומעט מתוקים. האם יש ילדים שלא אוהבים ירקות?'
  }
  
  if (lowerMessage.includes('מהיר') || lowerMessage.includes('זמן')) {
    return 'למנות מהירות: ביצים (5 דק\'), פסטה (10 דק\'), סנדוויצ\'ים, קורנפלקס, או פירות. אפשר להכין מראש ולאחסן במקרר!'
  }
  
  if (lowerMessage.includes('לא אוהב') || lowerMessage.includes('בררן')) {
    return 'לילדים בררנים: תתחיל עם מה שהם אוהבים ותוסיף בהדרגה דברים חדשים. ערבב ירקות במנות שהם אוהבים, ותן להם לבחור בין 2-3 אפשרויות.'
  }
  
  // Default responses
  const responses = [
    'זה נשמע מעניין! ספר לי יותר על ההעדפות של הילדים',
    'רעיון נהדר! האם כל הילדים אוהבים את זה?',
    'מה דעתך לנסות גם משהו חדש השבוע?',
    'חשוב שכל ילד יקבל מה שהוא אוהב. איך אוכל לעזור עוד?',
    'אולי כדאי להכין רשימת קניות מהמנות שתכננת?'
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

// Standard functions (addChild, addMenuItem, etc.) remain the same
function addChild(event) {
  event.preventDefault()
  const name = document.getElementById('child-name').value
  const age = document.getElementById('child-age').value
  const preferences = document.getElementById('child-preferences').value
  
  const children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  const newChild = {
    id: Date.now().toString(),
    name: name,
    age: age ? parseInt(age) : null,
    preferences: preferences || null
  }
  
  children.push(newChild)
  localStorage.setItem('mealPlannerChildren', JSON.stringify(children))
  closeModal()
  loadAndRefreshData()
}

function addMenuItem(event) {
  event.preventDefault()
  const name = document.getElementById('menu-name').value
  const prepTime = document.getElementById('prep-time').value
  const checkboxes = document.querySelectorAll('#menu-form input[type="checkbox"]:checked')
  const mealTypes = Array.from(checkboxes).map(cb => cb.value)
  
  const menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  const newItem = {
    id: Date.now().toString(),
    name: name,
    mealTypes: mealTypes,
    prepTime: prepTime ? parseInt(prepTime) : null
  }
  
  menuItems.push(newItem)
  localStorage.setItem('mealPlannerMenuItems', JSON.stringify(menuItems))
  closeModal()
  loadAndRefreshData()
}

function removeChild(id) {
  let children = JSON.parse(localStorage.getItem('mealPlannerChildren') || '[]')
  children = children.filter(child => child.id !== id)
  localStorage.setItem('mealPlannerChildren', JSON.stringify(children))
  
  // Also remove all meals for this child
  let weekPlan = JSON.parse(localStorage.getItem('mealPlannerWeekPlan') || '{}')
  Object.keys(weekPlan).forEach(key => {
    if (key.startsWith(id + '_')) {
      delete weekPlan[key]
    }
  })
  localStorage.setItem('mealPlannerWeekPlan', JSON.stringify(weekPlan))
  
  loadAndRefreshData()
}

function removeMenuItem(id) {
  let menuItems = JSON.parse(localStorage.getItem('mealPlannerMenuItems') || '[]')
  menuItems = menuItems.filter(item => item.id !== id)
  localStorage.setItem('mealPlannerMenuItems', JSON.stringify(menuItems))
  loadAndRefreshData()
}

// Generic modal functions
function showModal(title, content) {
  const modal = document.createElement('div')
  modal.id = 'modal'
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <h3 class="text-lg font-bold mb-4">${title}</h3>
      ${content}
    </div>
  `
  document.body.appendChild(modal)
}

function closeModal() {
  const modal = document.getElementById('modal')
  if (modal) {
    modal.remove()
  }
}

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

console.log('👨‍👩‍👧‍👦 מתכנן הארוחות המשפחתי נטען בהצלחה!')