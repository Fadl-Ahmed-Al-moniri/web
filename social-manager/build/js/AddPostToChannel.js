// بيانات الحسابات
let allAccounts = [];
let filteredAccounts = [];

// Function to fetch and display connected accounts
async function getConnectedAccounts() {
  const loader = document.querySelector('.loader');
  const loaderOverlay = document.querySelector('.loader-overlay');
  const accountsGrid = document.getElementById('accountsGrid');

  try {
    // Show loader
    loader.style.display = 'block';
    loaderOverlay.style.display = 'block';

    // Fetch Facebook accounts
    const facebookResponse = await axios.post(
      'https://localhost:8000/facebook-page/get_pages/',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('user_token')}`
        }
      }
    );

    // Fetch Instagram accounts
    let instagramAccounts = [];
    try {
      const instagramResponse = await axios.get(
        'https://localhost:8000/instagram/get_accountes/',
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('user_token')}`
          }
        }
      );

      if (instagramResponse.data.status === 'success' && instagramResponse.data.data) {
        instagramAccounts = instagramResponse.data.data.map(account => ({
          ...account,
          platform: 'Instagram'
        }));
      }
    } catch (instagramError) {
      console.error('Error fetching Instagram accounts:', instagramError);
    }

    // Hide loader
    loader.style.display = 'none';
    loaderOverlay.style.display = 'none';

    // Check if Facebook request was successful
    if (facebookResponse.data.status === 'success') {
      const facebookAccounts = facebookResponse.data.data.map(account => ({
        ...account,
        platform: 'Facebook'
      }));

      // Combine accounts
      allAccounts = [...facebookAccounts, ...instagramAccounts];
      filteredAccounts = allAccounts;

      // Display all accounts by default
      displayAccounts(filteredAccounts);
    } else {
      alert('Failed to fetch Facebook accounts.');
    }
  } catch (error) {
    // Hide loader
    loader.style.display = 'none';
    loaderOverlay.style.display = 'none';

    const message = error.response?.data?.message || 'An error occurred while fetching accounts.';
    console.error(message);
  }
}

// Function to display accounts in the grid
function displayAccounts(accounts) {
  const accountsGrid = document.getElementById('accountsGrid');

  if (accounts.length > 0) {
    // Display accounts
    accountsGrid.innerHTML = accounts.map(account => `
      <div class="account-card bg-white rounded-lg shadow-md p-4 mb-4">
        <div class="account-header flex items-center space-x-4">
          <img src="${account.platform === 'Facebook' ? account.facebook_page_picture_url : account.profile_picture_url}" 
               alt="${account.platform === 'Facebook' ? account.facebook_page_name : account.instagram_name}" 
               class="w-10 h-10 rounded-full">
          <div class="account-info">
            <h3 class="font-semibold">${account.platform === 'Facebook' ? account.facebook_page_name : account.instagram_name}</h3>
            <span class="text-gray-500 text-sm">${account.platform === 'Facebook' ? account.category : `@${account.username}`}</span>
          </div>
        </div>
        <div class="account-stats flex justify-between mt-4">
          <div class="stat text-center">
            <span class="block font-bold">${account.followers_count}</span>
            <span class="text-gray-500 text-sm">المتابعون</span>
          </div>
          <div class="stat text-center">
            <span class="block font-bold">${account.following_count}</span>
            <span class="text-gray-500 text-sm">المتابَعون</span>
          </div>
        </div>
        <div class="account-actions flex justify-between mt-4">
          <button class="btn btn-outline flex items-center text-sm text-blue-600 hover:text-blue-800">
            <i class="fas fa-chart-line mr-2"></i> التحليلات
          </button>
          <button class="btn btn-outline flex items-center text-sm text-green-600 hover:text-green-800" 
                  onclick="redirectToPostPage('${account.platform === 'Facebook' ? account.facebook_page_name : account.instagram_name}', 
                                            '${account.platform === 'Facebook' ? account.facebook_page_picture_url : account.profile_picture_url}', 
                                            '${account.platform}')">
            <i class="fas fa-pencil mr-2"></i> إنشاء منشور
          </button>
        </div>
      </div>
    `).join('');

    // Add "Add Accounts" button
    
  } else {
    // Display empty state if no accounts are connected
    accountsGrid.innerHTML = `
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
}

// Function to filter accounts by platform
function filterAccounts(platform) {
  if (platform === 'All') {
    filteredAccounts = allAccounts;
  } else {
    filteredAccounts = allAccounts.filter(account => account.platform === platform);
  }
  displayAccounts(filteredAccounts);
}

// Function to redirect to the post creation page
function redirectToPostPage(accountName, accountImg, platform) {
  localStorage.setItem('selectedAccountName', accountName);
  localStorage.setItem('selectedAccountImg', accountImg);
  localStorage.setItem('selectedPlatform', platform);
  window.location.href = 'publication1.html';
}

// Function to redirect to the modal for connecting accounts
function redirectToModal(platform) {
  localStorage.setItem('selectedPlatform', platform);
    if (platform == "Facebook"){
      loginWithFacebook();
    }
}

// Event listeners for filter buttons
document.getElementById('filterAll').addEventListener('click', () => filterAccounts('All'));
document.getElementById('filterFacebook').addEventListener('click', () => filterAccounts('Facebook'));
document.getElementById('filterInstagram').addEventListener('click', () => filterAccounts('Instagram'));

// Fetch and display accounts when the page loads
document.addEventListener('DOMContentLoaded', getConnectedAccounts);

window.fbAsyncInit = function() {
  if (typeof FB !== 'undefined') {
      FB.init({
          appId: '478183998355970', 
          cookie: true,
          xfbml: true,
          version: 'v20.0'
      });
  } else {
      console.error('Facebook SDK not loaded!');
  }
};
var fields = ["email",
              "manage_fundraisers",
              "read_insights",
              "publish_video",
              "catalog_management",
              "pages_manage_cta",
              "pages_manage_instant_articles",
              "pages_show_list",
              "read_page_mailboxes",
              "ads_management",
              "ads_read",
              "business_management",
              "pages_messaging",
              "pages_messaging_subscriptions",
              "instagram_basic",
              "instagram_manage_comments",
              "instagram_manage_insights",
              "instagram_content_publish",
              "leads_retrieval",
              "whatsapp_business_management",
              "instagram_manage_messages",
              "page_events",
              "pages_read_engagement",
              "pages_manage_metadata",
              "pages_read_user_content",
              "pages_manage_ads",
              "pages_manage_posts",
              "pages_manage_engagement",
              "whatsapp_business_messaging",
              "instagram_branded_content_brand",
              "instagram_branded_content_creator",
              "instagram_branded_content_ads_brand",
              "instagram_manage_events",
              "manage_app_solution"];

function loginWithFacebook() {
      FB.login(function(response) {
          if (response.authResponse) {
              console.log('Welcome! Fetching your information.... ');
              

              const accessToken = response.authResponse.accessToken;
              console.log('Access Token:', accessToken);
  
              // Store the access token in localStorage
              localStorage.setItem('facebookAccessToken', accessToken);
  
              // Fetch user information
              FB.api('/me', {fields: 'id,name,email'}, function(response) {
                  sendAccessTokenToServer(accessToken);
              });
          } else {
              console.log('User cancelled login or did not fully authorize.');
          }
      }, {scope: fields.join(',')}); // Ensure fields are passed as a comma-separated string
  }
  
  async function sendAccessTokenToServer(accessToken) {

    
    try {
      const user_token =  localStorage.getItem('user_token');
      console.log(user_token);
      const url = 'https://localhost:8000/facebook/get_info/';
      const data = {
          facebook_user_access_token: accessToken,
      };
      const facebookResponse = await axios.post(
        url,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('user_token')}`
          }
        }
      );
      localStorage.setItem('facebookData', JSON.stringify(facebookResponse.data))
      console.log(facebookResponse);
      window.location.href = 'Acounts.html';

    } catch (error) {
      alert(error);
    }


}
// Function to open the platform dialog
function openPlatformDialog() {
  const dialog = document.getElementById('platformDialog');
  dialog.classList.remove('hidden');
}

// Function to close the platform dialog
function closePlatformDialog() {
  const dialog = document.getElementById('platformDialog');
  dialog.classList.add('hidden');
}

// Function to open the modal
function openModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  modalOverlay.classList.remove('hidden');
}

// Function to close the modal
function closeModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  modalOverlay.classList.add('hidden');
}

// Function to handle platform selection
function connectPlatform(platform) {
  alert(`تم اختيار ${platform}`);
  closeModal();
}

// Close modal when clicking outside
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modalOverlay')) {
    closeModal();
  }
});