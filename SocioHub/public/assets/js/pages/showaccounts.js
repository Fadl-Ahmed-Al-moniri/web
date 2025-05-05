import { postRequest, getRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS } from '../endpoint.js';
import {
    initializeFacebookSDK,
    loginWithFacebook,
    sendAccessTokenToServer
} from '../utils/facebook-sdk.js';
import { initLogout } from '../utils/logout.js'

const accountsList = document.getElementById('accountsList');
const platformIcon = document.getElementById('platformIcon');
const PLATFORM = localStorage.getItem('Platform');
const finishConnection=  document.getElementById('finishConnection');
const closeModal=  document.getElementById('closeModal');

const SELECTED_ACCOUNTS_IDS = [];
const token = getUserToken();
let userId ;
let code ;

async function initializeUI() {
  setupPlatformStyles();
  setupEventListeners();
  
  await initialCode(); // سيستدعي authorization_with_instagram تلقائياً

  
}
function setupPlatformStyles() {
        const PLATFORM_STYLES = {
        Facebook: {
            iconClass: 'fab fa-facebook  text-blue-600 dark:text-blue-600 ',
            titleColor: '#1877F2'
        },
        Instagram: {
            iconClass: 'fab fa-instagram  text-pink-600 dark:text-pink-600',
            titleColor: '#E1306C'
        }
        };
    
        if (PLATFORM_STYLES[PLATFORM]) {
        platformIcon.className = PLATFORM_STYLES[PLATFORM].iconClass;
        }
}

function handleAccountSelection(event) {
    const accountId = event.target.dataset.accountId;
    if (event.target.checked) {
    if (!SELECTED_ACCOUNTS_IDS.includes(accountId)) {
        SELECTED_ACCOUNTS_IDS.push(accountId);
    }
    } else {
        const idx = SELECTED_ACCOUNTS_IDS.indexOf(accountId);
        if (idx !== -1) SELECTED_ACCOUNTS_IDS.splice(idx, 1);
    }
    console.log('Selected IDs:', SELECTED_ACCOUNTS_IDS);
}

function setupAccountCheckboxes() {
    document.querySelectorAll('.account-checkbox').forEach(checkbox => {
        const accountId = checkbox.dataset.accountId;
        userId = checkbox.dataset.userId || "";
        checkbox.checked = SELECTED_ACCOUNTS_IDS.includes(accountId);
        checkbox.removeEventListener('change', handleAccountSelection);
        checkbox.addEventListener('change', handleAccountSelection);
    });
}

async function loadFacebookAccounts(code) {
  const response = await sendAccessTokenToServer(code);

  if (!response?.accounts?.data) {
    throw new Error('No Facebook accounts data');
  }
  response.accounts.data.forEach(account => {
    
    const accountHTML = showAccounts({
      id: account.id,
      name: account.name,
      img: account.picture.data.url,
      details: account.global_brand_page_name || '',
      userId: response.id || ''
    });
    accountsList.insertAdjacentHTML('beforeend', accountHTML);
    setupAccountCheckboxes();
  });
}

async function authorization_with_instagram(instagram_code) {
  
  if (!instagram_code) {
    alert('No Instagram authorization code found');
    return;
  }

  try {
    showLoader();
    const response = await postRequest(API_ENDPOINTS.Instagram.authorization,{ }, token, { code: instagram_code });

    if (response.status === 200 && response.data.data) {
      accountsList.innerHTML = '';
      
      response.data.data.forEach(account => {
        // التأكد من وجود account_id أو id
        const accountId = account.account_id || account.id;
        const accountHTML = showAccounts({
          id: accountId,
          name: account.username || account.instagram_name,
          img: account.profile_picture_url,
          details: account.account_type || `@${account.username}`
        });
        accountsList.insertAdjacentHTML('beforeend', accountHTML);
      });
      setupAccountCheckboxes();
      
    } else {
      throw new Error(response.data.message || 'Failed to get Instagram accounts');
    }
  } catch (error) {
    console.error('Instagram authorization failed:', error);
    alert(error.response?.response.message || error.message || 'Failed to connect Instagram account');
  } finally {
    hideLoader();
  }
}


function showAccounts(account) {
    const accountId = account.id || account.account_id;
    const userId = account.userId || '';
      return `
        <div class="account-item flex items-center justify-between p-4 border rounded-lg mb-3 hover:bg-gray-50 transition-colors">
            <div class="flex items-center space-x-4">
            <img src="${account.img}" alt="${account.name}"
                class="w-8 h-8 rounded-full object-cover">
            <div>
                <p class="font-semibold text-gray-700 dark:text-gray-200">${account.name}</p>
                <p class="text-gray-500 dark:text-gray-400 text-sm">${account.details}</p>
            </div>
            </div>
            <label>
            <input type="checkbox"
                    class="account-checkbox form-checkbox h-5 w-5 text-blue-600"
                    data-account-id="${accountId}"
                    data-user-id="${userId}"
                    >
            </label>
        </div>`;
        
}

async function initialCode() {
    setupPlatformStyles();
    try {
        showLoader();
        const url = new URL(window.location.href.split('#')[0]);
        code = url.searchParams.get('code');

        if (PLATFORM === "Facebook") {
        await loadFacebookAccounts(code);
        }
        else if (PLATFORM === "Instagram") {
          // alert('Instagram');
          await authorization_with_instagram(code);
        }else {
          throw new Error('extracting authorization failed');
        }
    } catch (error) {
        console.error('Error extracting authorization code:', error);
    }finally{
        hideLoader();
    }
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
        if (response.data && response.status === 201) {
            alert(response.data.message);
            window.location.href = 'channels.html';
        } else {
            throw new Error(response.data.message || 'Connection failed');
        }
        } catch (error) {
        const message = error.response?.data?.message || 'Failed to connect accounts.';
        alert(error);
        console.error('Connection error:', error);
        } finally {
        hideLoader();
        }
}

  // ================ اتصال حسابات فيسبوك ================
async function connectFacebookAccounts() {
    
    const data = {
        facebook_user_id:userId,
        page_ids: SELECTED_ACCOUNTS_IDS,
        from_side:"web",
        access_token: code
    };
    console.log('datae:', data);
  
    try {
      const response = await postRequest(API_ENDPOINTS.Facebook.connect,data, token);

      
      // تسجيل استجابة API
      console.log('Instagram API Response:', response.message);
      
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to connect accounts.';
      console.error('Connection facebook error:', message);
      throw error;
    }
  }
  
async function connectInstagramAccounts() {
    
    if (!SELECTED_ACCOUNTS_IDS.length) {
      throw new Error('Missing required data for Instagram connection');
    }
  
    const data = {
      account_id: SELECTED_ACCOUNTS_IDS[0], 
    };
  
    // تسجيل البيانات قبل الإرسال
    console.log('Sending to Instagram API:', data);
  
    try {
      const response = await postRequest(API_ENDPOINTS.Instagram.connect,data, token);

      console.log('Instagram API Response:', response.message);
      
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to connect accounts.';
      console.error('Connection error:', message);
      throw error;
    }
  }

function closeModalfun(){
  window.location.href = 'channels.html';
}

function setupEventListeners() {
    closeModal.addEventListener('click', closeModalfun);
    // needHelp.addEventListener('click', toggleHelpModal);

    finishConnection.addEventListener('click', handleFinishConnection);
    // updateFinishButtonState();
}
document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
  initLogout();
});
// document.addEventListener('DOMContentLoaded', getInstagramCode);

window.SELECTED_ACCOUNTS_IDS = SELECTED_ACCOUNTS_IDS;
