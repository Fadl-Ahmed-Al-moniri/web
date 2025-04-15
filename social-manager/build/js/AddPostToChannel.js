// Constants
const API_BASE_URL = 'https://localhost:8000';
const FACEBOOK_SDK_CONFIG = {
  appId: '478183998355970',
  cookie: true,
  xfbml: true,
  version: 'v20.0'
};
const FACEBOOK_PERMISSIONS = [
  "email", "manage_fundraisers", "read_insights", "publish_video",
  "catalog_management", "pages_manage_cta", "pages_manage_instant_articles",
  "pages_show_list", "read_page_mailboxes", "ads_management", "ads_read",
  "business_management", "pages_messaging", "pages_messaging_subscriptions",
  "instagram_basic", "instagram_manage_comments", "instagram_manage_insights",
  "instagram_content_publish", "leads_retrieval", "whatsapp_business_management",
  "instagram_manage_messages", "page_events", "pages_read_engagement",
  "pages_manage_metadata", "pages_read_user_content", "pages_manage_ads",
  "pages_manage_posts", "pages_manage_engagement", "whatsapp_business_messaging",
  "instagram_branded_content_brand", "instagram_branded_content_creator",
  "instagram_branded_content_ads_brand", "instagram_manage_events",
  "manage_app_solution"
];

// Data
let allAccounts = [];
let filteredAccounts = [];

// DOM Elements
const elements = {
  loader: document.querySelector('.loader'),
  loaderOverlay: document.querySelector('.loader-overlay'),
  accountsGrid: document.getElementById('accountsGrid'),
  filterAll: document.getElementById('filterAll'),
  filterFacebook: document.getElementById('filterFacebook'),
  filterInstagram: document.getElementById('filterInstagram'),
  modalOverlay: document.getElementById('modalOverlay'),
  platformDialog: document.getElementById('platformDialog')
};

// Utility Functions
const showLoader = () => {
  elements.loader.style.display = 'block';
  elements.loaderOverlay.style.display = 'block';
};

const hideLoader = () => {
  elements.loader.style.display = 'none';
  elements.loaderOverlay.style.display = 'none';
};

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Token ${localStorage.getItem('user_token')}`
});

const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error(error);
  return error.response?.data?.message || defaultMessage;
};

// Account Management Functions
async function fetchFacebookAccounts() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/facebook-page/get_pages/`,
      {},
      { headers: getAuthHeaders() }
    );
    
    if (response.data.status !== 'success') {
      console.warn('Facebook API returned non-success status');
      return []; // إرجاع مصفوفة فارغة بدلاً من throw error
    }
    
    return response.data.data.map(account => ({
      ...account,
      platform: 'Facebook'
    }));
  } catch (error) {
    console.error('Facebook accounts fetch failed:', error);
    return []; // إرجاع مصفوفة فارغة بدلاً من throw error
  }
}

async function fetchInstagramAccounts() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/instagram-professional/get_accountes/`,
      { headers: getAuthHeaders() }
    );
    
    if (response.data.status !== 'success' || !response.data.data) {
      console.warn('Instagram API returned no data');
      return [];
    }
    
    return response.data.data.map(account => ({
      ...account,
      platform: 'Instagram'
    }));
  } catch (error) {
    console.error('Instagram accounts fetch failed:', error);
    return [];
  }
}

async function getConnectedAccounts() {
  try {
    showLoader();
    
    // استخدام Promise.allSettled بدلاً من Promise.all
    const [facebookResult, instagramResult] = await Promise.allSettled([
      fetchFacebookAccounts(),
      fetchInstagramAccounts()
    ]);
    
    // معالجة نتائج فيسبوك
    const facebookAccounts = facebookResult.status === 'fulfilled' 
      ? facebookResult.value 
      : [];
    
    // معالجة نتائج إنستجرام
    const instagramAccounts = instagramResult.status === 'fulfilled' 
      ? instagramResult.value 
      : [];
    
    // دمج الحسابات
    allAccounts = [...facebookAccounts, ...instagramAccounts];
    filteredAccounts = [...allAccounts];
    
    displayAccounts(filteredAccounts);
    
    // تسجيل الأخطاء إذا وجدت
    if (facebookResult.status === 'rejected') {
      console.error('Facebook accounts error:', facebookResult.reason);
    }
    if (instagramResult.status === 'rejected') {
      console.error('Instagram accounts error:', instagramResult.reason);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    alert('Failed to load accounts. Please check console for details.');
  } finally {
    hideLoader();
  }
}

function getAccountDisplayInfo(account) {
  const isFacebook = account.platform === 'Facebook';
  return {
    id :  isFacebook ? account.facebook_page_id : account.instagram_id,
    name: isFacebook ? account.facebook_page_name : account.instagram_name,
    username: isFacebook ? '' : `@${account.username}`,
    imageUrl: isFacebook ? account.profile_picture_url : account.profile_picture_url,
    category: isFacebook ? account.category : account.username,
    followers: account.followers_count || 0,
    following: account.following_count || 0
  };
}
function createAccountCard(account) {
  const { id,name, username, imageUrl, category, followers, following } = getAccountDisplayInfo(account);
  
  return `
    <div class="account-card bg-white rounded-lg shadow-md p-4 mb-4 relative">
      <!-- زر القائمة في الزاوية اليسرى -->
      <div class="absolute left-2 top-2 dropdown">
        <button class="text-gray-500 hover:text-gray-700 focus:outline-none">
          <i class="fas fa-ellipsis-v"></i>
        </button>
        <!-- قائمة الخيارات -->
        <div class="dropdown-menu absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden">
          <div class="py-1">
            <button onclick="refreshAccount('${id}', '${account.platform}')" 
                    class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-right">
              <i class="fas fa-sync-alt ml-2"></i> تحديث الصفحة
            </button>
            <button onclick="disconnectAccount('${id}', '${account.platform}')" 
                    class="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-right">
              <i class="fas fa-sign-out-alt ml-2"></i> تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      <div class="account-header flex items-center space-x-4">
        <img src="${imageUrl}" 
             alt="${imageUrl}" 
             class="w-10 h-10 rounded-full">
        <div class="account-info">
          <h3 class="font-semibold">${name}</h3>
          <span class="text-gray-500 text-sm">${account.platform === 'Facebook' ? category : username}</span>
        </div>
      </div>
      <div class="account-stats flex justify-between mt-4">
        <div class="stat text-center">
          <span class="block font-bold">${followers}</span>
          <span class="text-gray-500 text-sm">المتابعون</span>
        </div>
        <div class="stat text-center">
          <span class="block font-bold">${following}</span>
          <span class="text-gray-500 text-sm">المتابَعون</span>
        </div>
      </div>
      <div class="account-actions flex justify-between mt-4">
        <button class="btn btn-outline flex items-center text-sm text-blue-600 hover:text-blue-800">
          <i class="fas fa-chart-line mr-2"></i> التحليلات
        </button>
        <button class="btn btn-outline flex items-center text-sm text-green-600 hover:text-green-800" 
                onclick="redirectToPostPage('${name}', '${imageUrl}', '${account.platform}')">
          <i class="fas fa-pencil mr-2"></i> إنشاء منشور
        </button>
      </div>
    </div>
  `;
}

function displayEmptyState() {
  return `
    <div class="content">
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fas fa-share-nodes"></i>
        </div>
        <h2>قم بربط حساباتك الاجتماعية</h2>
        <p>ابدأ بربط حساباتك الاجتماعية لإدارتها جميعًا من مكان واحد.</p>
        <div class="connect-options">
          <button class="btn btn-platform facebook" onclick="redirectToModal('Facebook')">
            <i class="fab fa-facebook"></i> ربط فيسبوك
          </button>
          <button class="btn btn-platform instagram" onclick="redirectToModal('Instagram')">
            <i class="fab fa-instagram"></i> ربط إنستجرام
          </button>
        </div>
      </div>
    </div>
  `;
}

// تفعيل القوائم المنسدلة
function setupDropdowns() {
  document.querySelectorAll('.dropdown button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = button.nextElementSibling;
      document.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m !== menu) m.classList.add('hidden');
      });
      menu.classList.toggle('hidden');
    });
  });

  // إغلاق القوائم عند النقر خارجها
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.add('hidden');
    });
  });
}

// دالة تحديث الصفحة
function refreshAccount(accountId, platform) {
  console.log(`Refreshing ${platform} account: ${accountId}`);
  if (platform === 'Facebook') {
    refreshAccountFacebook(accountId);
  } else if (platform === 'Instagram') {
    refreshAccountInstgram(accountId);
  }
  else {
    throw new Error('platform not supported');
  }
  // أضف هنا كود التحديث الفعلي
}

// دالة تسجيل الخروج
function disconnectAccount(accountId, platform) {
  try {    
    if (platform === 'Facebook') {
      if (confirm(` هل أنت متأكد من تسجيل الخروج من هذه الصفحه ${platform}؟`)) {
        disconnectFacebook(accountId);
      }
    } else if (platform === 'Instagram') {
      if (confirm(` هل أنت متأكد من تسجيل الخروج من هذه الصفحه ${platform}؟`)) {
        disconnectInstgram(accountId);
      }
  } else {
      throw new Error('platform not supported');
    }

  } catch (error) {
    console.error('Failed to load accounts:', error);
    alert(`No ${platform} accounts found.`);
  }

}

async function disconnectFacebook(accountId) {
  
  try {
    showLoader();
    const response =  await axios.post(
      `${API_BASE_URL}/facebook-page/logout_from_page/`,
      { facebook_page_id: accountId },
      {
        headers: {
          'Authorization': `Token ${localStorage.getItem('user_token')}`
        }
      }
      
    );
    if (response.status === 200 && response.data.data) {
      
      window.location.reload;
      
    } else {
      throw new Error(response.data.message || 'Failed to get Instagram accounts');
    }
  } catch (error) {
    alert(error.response?.data?.message || error.message || 'Failed to connect Instagram account');
  }
  finally{
    hideLoader();
  }
} 

async function disconnectInstgram(accountId) {
  
  try {
    showLoader();
    const response =  await axios.post(
      `${API_BASE_URL}/instagram-professional/disconnect_account/`,
      { account_id: accountId },
      {
        headers: {
          'Authorization': `Token ${localStorage.getItem('user_token')}`
        }
      }
      
    );
    if (response.status === 200 && response.data.data) {
      
      window.location.reload;
      
    } else {
      throw new Error(response.data.message || 'Failed to get Instagram accounts');
    }
  } catch (error) {
    alert(error.response?.data?.message || error.message || 'Failed to connect Instagram account');
  }
  finally{
    hideLoader();
  }
} 

async function refreshAccountInstgram(accountId) {
  
  try {
    showLoader();
    const response =  await axios.post(
      `${API_BASE_URL}/instagram-professional/refresh_account/`,
      { account_id: accountId },
      {
        headers: {
          'Authorization': `Token ${localStorage.getItem('user_token')}`
        }
      }
      
    );
    if (response.status === 200 && response.data.data) {
      
      window.location.reload();
      
    } else {
      throw new Error(response.data.message || 'Failed to refresh Instagram accounts');
    }
  } catch (error) {
    alert(error.response?.data?.message || error.message || 'Failed to refresh Instagram account');
  }
  finally{
    hideLoader();
  }
} 
async function refreshAccountFacebook(accountId) {
  
  try {
    showLoader();
    const response =  await axios.post(
      `${API_BASE_URL}/facebook-page/info_page/`,
      { facebook_page_id: accountId },
      {
        headers: {
          'Authorization': `Token ${localStorage.getItem('user_token')}`
        }
      }
      
    );
    if (response.status === 200 && response.data.data) {
      
      window.location.reload();
      
    } else {
      throw new Error(response.data.message || 'Failed to refresh Instagram accounts');
    }
  } catch (error) {
    alert(error.response?.data?.message || error.message || 'Failed to refresh Instagram account');
  }
  finally{
    hideLoader();
  }
} 




function displayAccounts(accounts) {
  if (accounts.length === 0) {
    if (allAccounts.length === 0) {
      elements.accountsGrid.innerHTML = displayEmptyState();
    } else {
      // توجد حسابات ولكنها مفلترة
      elements.accountsGrid.innerHTML = `
        <div class="no-results">
          <p>No accounts match your filter</p>
        </div>
      `;
    }
  } else {
    elements.accountsGrid.innerHTML = accounts.map(createAccountCard).join('');
    
  // تأكد من استدعاء هذه الدالة بعد إضافة الكروت
  setupDropdowns();
  }
}

function filterAccounts(platform) {
  filteredAccounts = platform === 'All' 
    ? [...allAccounts] 
    : allAccounts.filter(account => account.platform === platform);
  displayAccounts(filteredAccounts);
}

// Navigation Functions
function redirectToPostPage(accountName, accountImg, platform) {
  localStorage.setItem('selectedAccountName', accountName);
  localStorage.setItem('selectedAccountImg', accountImg);
  localStorage.setItem('selectedPlatform', platform);
  window.location.href = 'publication1.html';
}

async function redirectToModal(platform) {
  localStorage.setItem('selectedPlatform', platform);
  if (platform === "Facebook") {
    
    loginWithFacebook();  }
  if (platform === "Instagram") {
    try {
      await startInstagramAuth();
    } catch (error) {
      console.error('Instagram auth failed:', error);
      alert('Instagram authentication failed');
    }

  }
  // Add Instagram handling if needed
}

// Facebook SDK Functions
function initializeFacebookSDK() {
  if (typeof FB !== 'undefined') {
    FB.init(FACEBOOK_SDK_CONFIG);
  } else {
    console.error('Facebook SDK not loaded!');
  }
}

async function startInstagramAuth() {
  try {
    // 1. الحصول على رابط المصادقة من الباك إند
    const response = await axios.get(`${API_BASE_URL}/instagram-professional/get_authorization_url`,
      {
        headers: getAuthHeaders(),
      }
    );
    
    window.location.href = response.data.data;
    // window.location.href = 'Acounts.html';

  } catch (error) {
    console.error('Failed to start Instagram auth:', error);
    alert('Failed to start Instagram authentication' + error);
  }
}

async function handleInstagramAuthCallback(event) {
  // تأكد أن الرسالة من مصدر موثوق
  if (event.origin !== window.location.origin) return;
  alert(event);
  if (event.data.type === 'instagram-auth-success') {
    try {
      // 1. إغلاق نافذة المصادقة
      if (event.source) event.source.close();
      
      // 2. الحصول على معلومات الحساب من الباك -إند
      const accountInfo = await fetchInstagramAccountInfo(event.data.account_id);
      
      // 3. عرض المعلومات في الواجهة
      displayInstagramAccount(accountInfo);
      
    } catch (error) {
      console.error('Failed to handle Instagram auth:', error);
      alert('Failed to complete Instagram authentication');
    }
  }
}

async function fetchInstagramAccountInfo(accountId) {
  const response = await axios.post(
    'https://localhost:8000/instagram-professional/get_info_account/',
    { account_id: accountId },
    {
      headers: {
        'Authorization': `Token ${localStorage.getItem('user_token')}`
      }
    }
  );
  return response.data;
}

function displayInstagramAccount(accountInfo) {
  const accountHTML = `
    <div class="account-card">
      <img src="${accountInfo.profile_picture_url}" alt="${accountInfo.username}">
      <h3>${accountInfo.username}</h3>
      <!-- إضافة أي معلومات أخرى تحتاجها -->
    </div>
  `;
  
  document.getElementById('accountsContainer').innerHTML += accountHTML;
}


async function loginWithFacebook() {
  FB.login(
    (response) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        localStorage.setItem('facebookAccessToken', accessToken);
        sendAccessTokenToServer(accessToken);
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    },
    { scope: FACEBOOK_PERMISSIONS.join(',') }
  );
}

async function sendAccessTokenToServer(accessToken) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/facebook/get_info/`,
      { access_token: accessToken },
      { headers: getAuthHeaders() }
    );
    
    localStorage.setItem('facebookData', JSON.stringify(response.data));
    window.location.href = 'Acounts.html';
  } catch (error) {
    alert(handleApiError(error, 'Failed to send access token to server'));
  }
}

// Modal/Dialog Functions
function openPlatformDialog() {
  elements.platformDialog.classList.remove('hidden');
}

function closePlatformDialog() {
  elements.platformDialog.classList.add('hidden');
}

function openModal() {
  elements.modalOverlay.classList.remove('hidden');
}

function closeModal() {
  elements.modalOverlay.classList.add('hidden');
}

function connectPlatform(platform) {
  alert(`تم اختيار ${platform}`);
  closeModal();
}

// Event Listeners
function setupEventListeners() {
  elements.filterAll.addEventListener('click', () => filterAccounts('All'));
  elements.filterFacebook.addEventListener('click', () => filterAccounts('Facebook'));
  elements.filterInstagram.addEventListener('click', () => filterAccounts('Instagram'));
  
  elements.modalOverlay.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) {
      closeModal();
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeFacebookSDK();
  setupEventListeners();
  getConnectedAccounts();
});

// Make functions available globally
window.redirectToPostPage = redirectToPostPage;
window.redirectToModal = redirectToModal;
window.loginWithFacebook = loginWithFacebook;
window.openPlatformDialog = openPlatformDialog;
window.closePlatformDialog = closePlatformDialog;
window.openModal = openModal;
window.closeModal = closeModal;
window.connectPlatform = connectPlatform;