// Privacy Policy Page JavaScript
class PrivacyPolicyPage {
  constructor() {
    this.init()
  }

  async init() {
    await this.loadPrivacyPolicy()
    await this.loadPrivacyConsent()
    this.bindEvents()
  }

  async loadPrivacyPolicy() {
    try {
      const response = await axios.get('/api/privacy/policy')
      if (response.data.success) {
        this.renderPrivacyPolicy(response.data.data)
      }
    } catch (error) {
      console.error('שגיאה בטעינת מדיניות פרטיות:', error)
    }
  }

  async loadPrivacyConsent() {
    try {
      const response = await axios.get('/api/privacy/consent')
      if (response.data.success) {
        this.renderConsentStatus(response.data.data)
      }
    } catch (error) {
      console.error('שגיאה בטעינת סטטוס הסכמה:', error)
    }
  }

  renderPrivacyPolicy(policy) {
    const content = document.getElementById('privacy-content')
    if (!content) return

    content.innerHTML = `
      <div class="card max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <i class="fas fa-shield-alt text-4xl text-blue-600 mb-4"></i>
          <h1 class="text-3xl font-bold text-gray-800">${policy.title}</h1>
          <p class="text-gray-600 mt-2">גרסה ${policy.version} | עודכן לאחרונה: ${policy.lastUpdated}</p>
        </div>

        ${Object.entries(policy.sections).map(([key, section]) => `
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-4 text-blue-800 border-b-2 border-blue-200 pb-2">
              ${section.title}
            </h2>
            <div class="space-y-3">
              ${Array.isArray(section.content) 
                ? section.content.map(item => `<p class="text-gray-700 leading-relaxed">${item}</p>`).join('')
                : `<p class="text-gray-700 leading-relaxed">${section.content}</p>`
              }
            </div>
          </div>
        `).join('')}

        <div class="bg-blue-50 p-6 rounded-lg mt-8">
          <h3 class="text-lg font-bold mb-4">ניהול הסכמת פרטיות</h3>
          <div id="consent-status" class="mb-4">
            <!-- Consent status will be loaded here -->
          </div>
          
          <div class="space-x-reverse space-x-4">
            <button id="btn-export-data" class="btn btn-secondary">
              <i class="fas fa-download ml-2"></i>
              ייצא את הנתונים שלי
            </button>
            <button id="btn-delete-data" class="btn btn-danger">
              <i class="fas fa-trash ml-2"></i>
              מחק את כל הנתונים
            </button>
            <button id="btn-revoke-consent" class="btn btn-warning">
              <i class="fas fa-times-circle ml-2"></i>
              בטל הסכמה
            </button>
          </div>
        </div>

        <div class="text-center mt-8 pt-6 border-t">
          <a href="/" class="btn btn-primary">
            <i class="fas fa-home ml-2"></i>
            חזור לאפליקציה
          </a>
        </div>
      </div>
    `
  }

  renderConsentStatus(consent) {
    const statusContainer = document.getElementById('consent-status')
    if (!statusContainer) return

    const statusText = consent.hasConsented ? 'פעיל' : 'לא פעיל'
    const statusColor = consent.hasConsented ? 'text-green-600' : 'text-red-600'
    const consentDate = consent.consentDate ? new Date(consent.consentDate).toLocaleDateString('he-IL') : 'לא זמין'

    statusContainer.innerHTML = `
      <div class="flex items-center justify-between p-4 bg-white rounded border">
        <div>
          <p class="font-medium">סטטוס הסכמה: <span class="${statusColor}">${statusText}</span></p>
          ${consent.hasConsented ? `<p class="text-sm text-gray-600">תאריך הסכמה: ${consentDate}</p>` : ''}
          <p class="text-sm text-gray-600">גרסת מדיניות: ${consent.version}</p>
        </div>
        <div class="flex items-center">
          <div class="status-dot ${consent.hasConsented ? 'status-active' : 'status-inactive'} ml-2"></div>
          <span class="text-sm font-medium">${statusText}</span>
        </div>
      </div>
    `
  }

  bindEvents() {
    document.getElementById('btn-export-data')?.addEventListener('click', () => this.exportUserData())
    document.getElementById('btn-delete-data')?.addEventListener('click', () => this.confirmDeleteAllData())
    document.getElementById('btn-revoke-consent')?.addEventListener('click', () => this.revokeConsent())
  }

  async exportUserData() {
    try {
      this.showLoading(true)
      
      const response = await axios.get('/api/privacy/export-data')
      
      // Create and download file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
        type: 'application/json;charset=utf-8' 
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meal-planner-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      this.showSuccess('הנתונים יוצאו בהצלחה')
      
    } catch (error) {
      console.error('שגיאה בייצוא נתונים:', error)
      this.showError('שגיאה בייצוא הנתונים')
    } finally {
      this.showLoading(false)
    }
  }

  confirmDeleteAllData() {
    const confirmed = confirm(`
האם אתה בטוח שברצונך למחוק את כל הנתונים?

פעולה זו תמחק:
• כל הילדים והגדרותיהם
• כל המנות שהוספת
• כל התכניות השבועיות
• רשימות המצרכים
• היסטוריית הצ'אט
• הגדרות הפרטיות

פעולה זו בלתי הפיכה!
    `.trim())

    if (confirmed) {
      const doubleConfirm = confirm('האם אתה באמת בטוח? הקלד "מחק הכל" כדי לאשר')
      if (doubleConfirm) {
        this.deleteAllData()
      }
    }
  }

  async deleteAllData() {
    try {
      this.showLoading(true)
      
      const response = await axios.post('/api/privacy/reset-all-data', {
        confirmReset: true
      })
      
      if (response.data.success) {
        this.showSuccess('כל הנתונים נמחקו בהצלחה')
        
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
        
      } else {
        this.showError(response.data.error || 'שגיאה במחיקת הנתונים')
      }
      
    } catch (error) {
      console.error('שגיאה במחיקת נתונים:', error)
      this.showError('שגיאה במחיקת הנתונים')
    } finally {
      this.showLoading(false)
    }
  }

  async revokeConsent() {
    const confirmed = confirm(`
האם ברצונך לבטל את ההסכמה לשימוש באפליקציה?

ביטול ההסכמה יחזיר אותך למסך ההסכמה הראשוני.
הנתונים שלך יישארו במכשיר אך האפליקציה לא תפעל.
    `.trim())

    if (confirmed) {
      try {
        this.showLoading(true)
        
        const response = await axios.post('/api/privacy/consent', {
          hasConsented: false
        })
        
        if (response.data.success) {
          this.showSuccess('ההסכמה בוטלה בהצלחה')
          
          // Redirect to home page after 2 seconds
          setTimeout(() => {
            window.location.href = '/'
          }, 2000)
          
        } else {
          this.showError(response.data.error || 'שגיאה בביטול ההסכמה')
        }
        
      } catch (error) {
        console.error('שגיאה בביטול הסכמה:', error)
        this.showError('שגיאה בביטול ההסכמה')
      } finally {
        this.showLoading(false)
      }
    }
  }

  showLoading(show) {
    // Simple loading indicator
    if (show) {
      document.body.style.cursor = 'wait'
    } else {
      document.body.style.cursor = 'default'
    }
  }

  showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div')
    messageEl.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    }`
    messageEl.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info'} ml-2"></i>
        <span>${message}</span>
      </div>
    `

    document.body.appendChild(messageEl)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      messageEl.classList.add('opacity-0', 'translate-y-[-1rem]')
      setTimeout(() => messageEl.remove(), 300)
    }, 5000)
  }

  showError(message) {
    this.showMessage(message, 'error')
  }

  showSuccess(message) {
    this.showMessage(message, 'success')
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on privacy page
  if (window.location.pathname === '/privacy') {
    new PrivacyPolicyPage()
  }
})