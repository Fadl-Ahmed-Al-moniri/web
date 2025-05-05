import { postRequest, getRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS} from '../endpoint.js';
import { initLogout } from '../utils/logout.js'
import {initializeFacebookSDK , loginWithFacebook } from '../utils/facebook-sdk.js'

const token =getUserToken();
let allAccounts = [];

async function connectTo(platform) {
    localStorage.setItem('Platform' ,platform);
    if (platform === "Facebook") {
        const accessToken = await loginWithFacebook();
        if (!accessToken) {
            alert("فشل تسجيل الدخول.");
            return;
        }
        const url = new URL("web/SocioHub/public/showaccounts.html", window.location.href);
        
        url.searchParams.set("code", accessToken);
        
        window.location.href = url.toString();
    } else if (platform === "Instagram") {
      startInstagramAuth();
    }
}
async function startInstagramAuth() {
  try {
    const response = await getRequest(API_ENDPOINTS.Instagram.getAuthorization, token);
    window.location.href = response.data.data;
    // window.location.href = 'showaccounts.html';
  } catch (error) {
    console.error('Failed to start Instagram auth:', error);
    alert('Failed to start Instagram authentication' + error);
  }
}


async function fetchFacebookAccounts() {
    try {
        const response = await postRequest(API_ENDPOINTS.Facebook.getPages, {}, token);
        if (response.status !== 200) return [];
        return response.data.data.map(acc => ({ ...acc, platform: 'Facebook' }));
    } catch {
        return [];
    }
}

async function fetchInstagramAccounts() {
    try {
        const response = await getRequest(API_ENDPOINTS.Instagram.getAccounts, token);
        if (response.status !== 200) return [];
        return response.data.data.map(acc => ({ ...acc, platform: 'Instagram' }));
    } catch  {
        return [];
    }
}

function refreshAccount(accountId, platform) {
    alert(`Refreshing ${platform} account: ${accountId}`);
    if (platform === 'Facebook') {
      refreshAccountFacebook(accountId);
    } else if (platform === 'Instagram') {
      refreshAccountInstgram(accountId);
    }
    else {
      throw new Error('platform not supported');
    }
}

function disconnectAccount(accountId, platform) {
    try {    
      if (platform === 'Facebook') {
        if (confirm(` Are you sure you want to log out of this page?${platform}؟`)) {
          disconnectFacebook(accountId);
        }
      } else if (platform === 'Instagram') {
        if (confirm(` Are you sure you want to log out of this page?${platform}؟`)) {
          disconnectInstgram(accountId);
        }
    } else {
        throw new Error('platform not supported');
      }
  
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  
}

function displayAccounts(accounts) {
    const container = document.getElementById('accountsContainer');
    container.innerHTML = '';

    if (!accounts.length) {
        container.innerHTML = `
        <p class="col-span-full text-center text-gray-500 dark:text-gray-400">
            There are no accounts please connect your accounts
        </p>`;
        return;
    }

    accounts.forEach(acc => {
        const id  =   acc.platform === 'Facebook' ? acc.facebook_page_id : acc.instagram_id;
        const name  = acc.platform === 'Facebook' ? acc.facebook_page_name : acc.instagram_name;
        const image = acc.profile_picture_url;
        const catOrUser = acc.platform === 'Facebook' ? acc.category : acc.username;
        const followers = acc.followers_count;
        const following = acc.following_count;

        // الكارد نفسه
        container.insertAdjacentHTML('beforeend', `
        <div x-data="{ openMenu: false }" class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div class="absolute top-2 right-0">
            <button @click="openMenu = !openMenu"
                class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
            </button>
            <div x-show="openMenu" @click.away="openMenu = false" x-transition
                class="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 py-1">
                <button @click="refreshAccount('${id}', '${acc.platform}')"
                class="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                Update account
                </button>
                <button  @click="disconnectAccount('${id}', '${acc.platform}')"
                class="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                Log out
                </button>
            </div>
            </div>

            <div class="flex items-center space-x-4">
            <img src="${image}" alt="avatar"
                class="w-12 h-12 rounded-full object-cover"/>
            <div>
                <h3 class="font-semibold text-gray-800 dark:text-gray-100">${name}</h3>
                <span class="text-sm text-gray-500 dark:text-gray-400">${catOrUser}</span>
            </div>
            </div>

            <div class="flex justify-between mt-4">
            <div class="text-center">
                <span class="block text-lg font-bold text-gray-800 dark:text-gray-100">${followers}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">Followers</span>
            </div>
            <div class="text-center">
                <span class="block text-lg font-bold text-gray-800 dark:text-gray-100">${following}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">Followes</span>
            </div>
            </div>

            <div class="flex justify-between mt-4">
            <button @click="refreshAccount('${acc.id}', '${acc.platform}')"
                class="flex items-center px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400
                    border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900
                    focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800">
                التحليلات
            </button>
            <button @click="redirectToPostPage('${name}', '${image}', '${acc.platform}')"
                class="flex items-center px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400
                    border border-green-600 dark:border-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900
                    focus:outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800">
                إنشاء منشور
            </button>
            </div>
        </div>
        `);
    });
}

async function getConnectedAccounts() {
    showLoader();
    try {
        const [fbRes, igRes] = await Promise.allSettled([
            fetchFacebookAccounts(),
            fetchInstagramAccounts()
        ]);
        const fbAccounts = fbRes.status === 'fulfilled' ? fbRes.value : [];
        const igAccounts = igRes.status === 'fulfilled' ? igRes.value : [];
        allAccounts = [...fbAccounts, ...igAccounts];

        displayAccounts(allAccounts);
    } finally {
    hideLoader();
}
}

async function refreshAccountFacebook(accountId) {

    try {
        showLoader();
        const response = await postRequest(API_ENDPOINTS.Facebook.getInfoPage,{ facebook_page_id: accountId }, token);
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

async function refreshAccountInstgram(accountId) {
  
        try {
        showLoader();
        const response = await postRequest(API_ENDPOINTS.Instagram.getInfoAccounts,{ account_id: accountId }, token);
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

async function disconnectFacebook(accountId) {
    
    try {
      showLoader();
      const response = await postRequest(API_ENDPOINTS.Facebook.disconnect,{ facebook_page_id: accountId }, token);
      if (response.status === 200) {
        
        window.location.reload();

        
      } else {
        throw new Error(response.data.message || 'Failed to get Instagram accounts');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to connect disconnect page' ;
      alert(message);
    }
    finally{
      hideLoader();
    }
} 

async function disconnectInstgram(accountId) {
    
    try {
      showLoader();
      const response = await postRequest(API_ENDPOINTS.Instagram.disconnect,{ account_id: accountId }, token);;
      if (response.status === 200 && response.data.data) {
        
        window.location.reload();
        
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

function initFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    // Helper لتغيير حالة الزر النشط
    function setActive(btn) {
      btns.forEach(b => {
        b.classList.remove('bg-blue-600','text-white');
        b.classList.add('bg-gray-200','text-gray-700');
      });
      btn.classList.add('bg-blue-600','text-white');
      btn.classList.remove('bg-gray-200','text-gray-700');
    }
  
    // فلترة All
    document.getElementById('filterAll').addEventListener('click', function() {
      displayAccounts(allAccounts);
      setActive(this);
    });
  
    // فلترة Facebook
    document.getElementById('filterFacebook').addEventListener('click', function() {
      const fb = allAccounts.filter(acc => acc.platform === 'Facebook');
      displayAccounts(fb);
      setActive(this);
    });
  
    // فلترة Instagram
    document.getElementById('filterInstagram').addEventListener('click', function() {
      const ig = allAccounts.filter(acc => acc.platform === 'Instagram');
      displayAccounts(ig);
      setActive(this);
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    await getConnectedAccounts();  
    initLogout();
    initFilters();              
    initializeFacebookSDK(); 
});


window.refreshAccount   = refreshAccount;
window.disconnectAccount = disconnectAccount;
window.connectTo = connectTo;
