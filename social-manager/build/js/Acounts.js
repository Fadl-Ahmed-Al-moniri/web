// ================ الثوابت والمتغيرات العامة ================
const SELECTED_ACCOUNTS = [];
const SELECTED_ACCOUNTS_IDS = [];
const PLATFORM = localStorage.getItem('selectedPlatform');
const PLATFORM_DATA = JSON.parse(localStorage.getItem(`${PLATFORM.toLowerCase()}Data`));
const token = localStorage.getItem('user_token');

// روابط API لكل منصة
const API_ENDPOINTS = {
  Facebook: {
    accounts: 'https://localhost:8000/facebook-page/get_pages/',
    connect: 'https://localhost:8000/facebook/connect_to_account/'
  },
  Instagram: {
    accounts: 'https://localhost:8000/instagram-professional/authorization_with_instagram/',
    connect: 'https://localhost:8000/instagram-professional/save_info_account/'
  }
};

// ================ عناصر DOM ================
const DOM = {
  closeModal: document.getElementById('closeModal'),
  needHelp: document.getElementById('needHelp'),
  helpModal: document.getElementById('helpModal'),
  platformIcon: document.getElementById('platformIcon'),
  modalTitle: document.getElementById('modalTitle'),
  finishConnection: document.getElementById('finishConnection'),
  accountsList: document.getElementById('accountsList'),
  loader: document.querySelector('.loader'),
  loaderOverlay: document.querySelector('.loader-overlay')
};

// ================ تهيئة الواجهة ================
async function initializeUI() {
  setupPlatformStyles();
  setupEventListeners();
  
  if (PLATFORM === 'Instagram') {
    await getInstagramCode(); // سيستدعي authorization_with_instagram تلقائياً
  } else {
    await loadAccounts();
  }
  
  // تهيئة حالة الزر بعد كل شيء
  disableFinishButton();
}

// ================ إعداد أنماط المنصة ================
function setupPlatformStyles() {
  const PLATFORM_STYLES = {
    Facebook: {
      iconClass: 'fab fa-facebook text-blue-600',
      titleColor: '#1877F2'
    },
    Instagram: {
      iconClass: 'fab fa-instagram text-pink-600',
      titleColor: '#E1306C'
    }
  };

  if (PLATFORM_STYLES[PLATFORM]) {
    DOM.platformIcon.className = PLATFORM_STYLES[PLATFORM].iconClass;
    DOM.modalTitle.style.color = PLATFORM_STYLES[PLATFORM].titleColor;
  }
}

// ================ تحميل الحسابات حسب المنصة ================
async function loadAccounts() {
  try {
    showLoader();
    
    if (PLATFORM === 'Facebook') {
      await loadFacebookAccounts();
    } else if (PLATFORM === 'Instagram') {
      getInstagramCode();
    } else {
      throw new Error('Platform not supported');
    }
    
    setupAccountCheckboxes();
  } catch (error) {
    console.error('Failed to load accounts:', error);
    alert(`No ${PLATFORM} accounts found.`);
  } finally {
    hideLoader();
  }
}

// ================ تحميل حسابات فيسبوك ================
async function loadFacebookAccounts() {
  if (!PLATFORM_DATA?.data?.accounts?.data) {
    throw new Error('No Facebook accounts data');
  }

  PLATFORM_DATA.data.accounts.data.forEach(account => {
    const accountHTML = createAccountElement({
      id: account.id,
      name: account.name,
      img: account.picture.data.url,
      details: account.global_brand_page_name || ''
    });
    DOM.accountsList.insertAdjacentHTML('beforeend', accountHTML);
  });
}

// ================ الحصول عى الكود الراجع من انستقرام================
async function getInstagramCode() {
  try {
    // الحصول على الـ URL الحالي
    const currentUrl = window.location.href;

    // إزالة الجزء بعد # إذا كان موجوداً
    const cleanUrl = currentUrl.split('#')[0];
    
    // إنشاء كائن URL
    const url = new URL(cleanUrl);
    
    // الحصول على قيمة code
    const authCode = url.searchParams.get('code');
    
    console.log('Current URL:', currentUrl);
    console.log('Cleaned URL:', cleanUrl);
    console.log('Extracted Code:', authCode);
    
    if (!authCode) {
      console.error('No authorization code found in URL');
      return null;
    }
    
    authorization_with_instagram(authCode);
  } catch (error) {
    console.error('Error extracting authorization code:', error);
    return null;
  }
}

async function authorization_with_instagram(instagram_code) {
  const token = localStorage.getItem('user_token');
  
  if (!instagram_code) {
    console.error('No Instagram authorization code found');
    return;
  }

  try {
    showLoader();
    const response = await axios.get(API_ENDPOINTS.Instagram.accounts, {
      params: { code: instagram_code },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    });
    

    if (response.status === 200 && response.data.data) {
      DOM.accountsList.innerHTML = '';
      
      response.data.data.forEach(account => {
        // التأكد من وجود account_id أو id
        const accountId = account.account_id || account.id;
        const accountHTML = createAccountElement({
          id: accountId,
          name: account.username || account.instagram_name,
          img: account.profile_picture_url,
          details: account.account_type || `@${account.username}`
        });
        DOM.accountsList.insertAdjacentHTML('beforeend', accountHTML);
      });
      
      // إعادة تهيئة أحداث checkboxes بعد إضافة العناصر
      setupAccountCheckboxes();
      
    } else {
      throw new Error(response.data.message || 'Failed to get Instagram accounts');
    }
  } catch (error) {
    console.error('Instagram authorization failed:', error);
    alert(error.response?.data?.message || error.message || 'Failed to connect Instagram account');
  } finally {
    hideLoader();
  }
}

// ================ حفظ معلومات حساب إنستجرام ================
async function loadInstagramAccounts(account_id) {
  try {
    const response = await axios.post(API_ENDPOINTS.Instagram.getInfoAccount, {

      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      account_id:account_id,
    });

    if (response.data.status !== 'success' || !response.data.data) {
      throw new Error('No Instagram accounts data');
    }

    response.data.data.forEach(account => {
      const accountHTML = createAccountElement({
        id: account.id,
        name: account.username,
        img: account.profile_picture_url,
        details: `@${account.account_type}`
      });
      DOM.accountsList.insertAdjacentHTML('beforeend', accountHTML);
      setupAccountCheckboxes();
    });
  } catch (error) {
    console.error('Instagram accounts error:', error);
    throw error;
  }
}

// ================ إنشاء عنصر الحساب (عام لكلا المنصتين) ================
function createAccountElement(account) {
  // استخدام account.id أو account.account_id بشكل متسق
  const accountId = account.id || account.account_id;
  
  return `
    <div class="account-item flex items-center justify-between p-4 border rounded-lg mb-3 hover:bg-gray-50 transition-colors">
      <div class="flex items-center space-x-4">
        <img src="${account.img}" alt="${account.name}" 
             class="w-10 h-10 rounded-full object-cover">
        <div>
          <p class="font-semibold">${account.name}</p>
          <p class="text-gray-500 text-sm">${account.details}</p>
        </div>
      </div>
      <label class="checkbox-container">
        <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600 account-checkbox" 
               data-account-id="${accountId}" 
               data-account-name="${account.name}" 
               data-account-img="${account.img}">
        <span class="checkmark"></span>
      </label>
    </div>
  `;
}

// ================ معالجة اتصال الحسابات حسب المنصة ================
async function handleFinishConnection() {
  if (SELECTED_ACCOUNTS_IDS.length === 0) {
    alert('Please select at least one account.');
    return;
  }
  showLoader();

  try {
    let response;
    
    if (PLATFORM === 'Facebook') {
      response = await connectFacebookAccounts();
    } else if (PLATFORM === 'Instagram') {
      response = await connectInstagramAccounts();
    }

    // التحقق من استجابة API
    if (response.data && response.data.success !== false) {
      alert(`Connection successful: ${response.data.message}`);
      window.location.href = 'manage_account.html';
    } else {
      throw new Error(response.data.message || 'Connection failed');
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to connect accounts.';
    alert(message);
    console.error('Connection error:', error);
  } finally {
    hideLoader();
  }
}

// ================ اتصال حسابات فيسبوك ================
async function connectFacebookAccounts() {
  const token = localStorage.getItem('user_token');
  const data = {
    facebook_user_id: PLATFORM_DATA.data.id,
    page_ids: SELECTED_ACCOUNTS_IDS,
    from_side:"web",
    access_token: localStorage.getItem('facebookAccessToken')
  };
  console.log('datae:', data);

  try {
    const response = await axios.post(
      API_ENDPOINTS.Facebook.connect,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      }
    );
    
    // تسجيل استجابة API
    console.log('Instagram API Response:', response.message);
    
    return response;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to connect accounts.';
    console.error('Connection facebook error:', message);
    throw error;
  }
}

// ================ اتصال حسابات إنستجرام ================
async function connectInstagramAccounts() {
  const token = localStorage.getItem('user_token');
  
  // تسجيل البيانات المرسلة للتصحيح
  console.log('Selected Accounts IDs:', SELECTED_ACCOUNTS_IDS);
  console.log('Platform Data:', PLATFORM_DATA);

  // التحقق من وجود بيانات كافية
  if (!SELECTED_ACCOUNTS_IDS.length) {
    throw new Error('Missing required data for Instagram connection');
  }

  const data = {
    account_id: SELECTED_ACCOUNTS_IDS[0], // إرسال أول حساب مختار فقط إذا كان API يتوقع حساب واحد
  };

  // تسجيل البيانات قبل الإرسال
  console.log('Sending to Instagram API:', data);

  try {
    const response = await axios.post(
      API_ENDPOINTS.Instagram.connect,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      }
    );

    // تسجيل استجابة API
    console.log('Instagram API Response:', response.message);
    
    return response;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to connect accounts.';
    console.error('Connection error:', message);
    throw error;
  }
}

// ================ بقية الدوال الثانوية (تبقى كما هي) ================
function setupEventListeners() {
  DOM.closeModal.addEventListener('click', () => window.location.href = 'manage_account.html');
  DOM.needHelp.addEventListener('click', toggleHelpModal);
  DOM.finishConnection.addEventListener('click', handleFinishConnection);
  updateFinishButtonState();
}

function setupAccountCheckboxes() {
  document.querySelectorAll('.account-checkbox').forEach(checkbox => {
    // إزالة أي معالج أحداث موجود مسبقاً
    checkbox.removeEventListener('change', handleAccountSelection);
    
    // إضافة معالج الأحداث الجديد
    checkbox.addEventListener('change', handleAccountSelection);
    
    // تعيين الحالة المبدئية بناءً على SELECTED_ACCOUNTS_IDS
    const accountId = checkbox.getAttribute('data-account-id');
    checkbox.checked = SELECTED_ACCOUNTS_IDS.includes(accountId);
  });
  
  // تحديث حالة الزر بعد التهيئة
  updateFinishButtonState();
}

function handleAccountSelection(event) {
  const checkbox = event.target;
  const accountId = checkbox.getAttribute('data-account-id');
  const accountName = checkbox.getAttribute('data-account-name');
  const accountImg = checkbox.getAttribute('data-account-img');

  if (checkbox.checked) {
    // إضافة الحساب إذا لم يكن موجوداً
    if (!SELECTED_ACCOUNTS_IDS.includes(accountId)) {
      SELECTED_ACCOUNTS_IDS.push(accountId);
      SELECTED_ACCOUNTS.push({
        id: accountId,
        name: accountName,
        img: accountImg
      });
    }
  } else {
    // إزالة الحساب إذا كان موجوداً
    const index = SELECTED_ACCOUNTS_IDS.indexOf(accountId);
    if (index !== -1) {
      SELECTED_ACCOUNTS_IDS.splice(index, 1);
      SELECTED_ACCOUNTS.splice(index, 1);
    }
  }

  console.log('Selected Accounts IDs:', SELECTED_ACCOUNTS_IDS);
  updateFinishButtonState();
}

function updateFinishButtonState() {
  const hasSelectedAccounts = SELECTED_ACCOUNTS_IDS.length > 0;
  
  console.log('Updating button state. Has selected:', hasSelectedAccounts);
  
  DOM.finishConnection.disabled = !hasSelectedAccounts;
  console.log(SELECTED_ACCOUNTS_IDS);
  
  if (hasSelectedAccounts) {
    DOM.finishConnection.classList.remove('opacity-50', 'cursor-not-allowed');
    DOM.finishConnection.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700');
  } else {
    DOM.finishConnection.classList.add('opacity-50', 'cursor-not-allowed');
    DOM.finishConnection.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-700');
  }
}

function disableFinishButton() {
  DOM.finishConnection.disabled = true;
  DOM.finishConnection.classList.add('opacity-50', 'cursor-not-allowed');
  DOM.finishConnection.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-700');
}

function toggleHelpModal() {
  DOM.helpModal.classList.toggle('hidden');
}

function showLoader() {
  DOM.loader.style.display = 'block';
  DOM.loaderOverlay.style.display = 'block';
}

function hideLoader() {
  DOM.loader.style.display = 'none';
  DOM.loaderOverlay.style.display = 'none';
}

// ================ تهيئة التطبيق ================
document.addEventListener('DOMContentLoaded', initializeUI);