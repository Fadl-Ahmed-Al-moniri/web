// بيانات الحسابات المحددة
const selectedAccounts = [];
const selectedAccountsID = [];

// إغلاق النافذة
document.getElementById('closeModal').addEventListener('click', function() {
  window.location.href = 'home.html'; // العودة إلى الصفحة الرئيسية
});

// زر "Need Help"
document.getElementById('needHelp').addEventListener('click', function() {
  document.getElementById('helpModal').classList.toggle('hidden');
});

// تعيين أيقونة المنصة ولون العنوان بناءً على المنصة المحددة
const platform = localStorage.getItem('selectedPlatform');
const platformIcon = document.getElementById('platformIcon');
const modalTitle = document.getElementById('modalTitle');
const finishConnectionButton = document.getElementById('finishConnection');

if (platform === 'Facebook') {
  platformIcon.className = 'fab fa-facebook text-blue-600';
  modalTitle.style.color = '#1877F2'; // لون فيسبوك
  
} else if (platform === 'Instagram') {
  platformIcon.className = 'fab fa-instagram text-pink-600';
  modalTitle.style.color = '#E1306C'; // لون إنستجرام
}

// تعطيل الزر وجعله باهتًا افتراضيًا
finishConnectionButton.disabled = true;
finishConnectionButton.classList.add('opacity-50', 'cursor-not-allowed');

// عرض الحسابات من localStorage
const facebookData = JSON.parse(localStorage.getItem('facebookData'));

if (facebookData && facebookData.data && facebookData.data.accounts) {
  const accountsList = document.getElementById('accountsList');

  facebookData.data.accounts.data.forEach(account => {
    const accountElement = `
      <div class="flex items-center justify-between p-4 border rounded-lg">
        <div class="flex items-center space-x-4">
          <img alt="${account.name}" class="w-10 h-10 rounded-full" src="${account.picture.data.url}" />
          <div>
            <p class="font-semibold">${account.name}</p>
            <p class="text-gray-500">${account.global_brand_page_name}</p>
          </div>
        </div>
        <div class="text-green-500">
          <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600 account-checkbox" data-account-id="${account.id}" data-account-name="${account.name}" data-account-img="${account.picture.data.url}" />
        </div>
      </div>
    `;
    accountsList.insertAdjacentHTML('beforeend', accountElement);
  });

  // إضافة حدث تغيير لـ checkboxes
  document.querySelectorAll('.account-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const accountId = this.getAttribute('data-account-id');
      const accountName = this.getAttribute('data-account-name');
      const accountImg = this.getAttribute('data-account-img');

      if (this.checked) {
        selectedAccounts.push({ id: accountId, name: accountName, img: accountImg });
        selectedAccountsID.push(accountId);
      } else {
        const index = selectedAccounts.findIndex(acc => acc.id === accountId);
        if (index !== -1) {
          selectedAccounts.splice(index, 1);
          selectedAccountsID.splice(index, 1);
        }
      }

      // تفعيل أو تعطيل الزر بناءً على عدد الحسابات المحددة
      if (selectedAccounts.length > 0) {
        finishConnectionButton.disabled = false;
        finishConnectionButton.classList.remove('opacity-50', 'cursor-not-allowed');
        finishConnectionButton.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700');
      } else {
        finishConnectionButton.disabled = true;
        finishConnectionButton.classList.add('opacity-50', 'cursor-not-allowed');
        finishConnectionButton.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-700');
      }
    });
  });
} else {
  alert('No Facebook accounts found.');
}

// زر "Finish Connection"
document.getElementById('finishConnection').addEventListener('click', async function() {
  if (selectedAccounts.length > 0) {
    const loader = document.querySelector('.loader');
    const loaderOverlay = document.querySelector('.loader-overlay');
    loader.style.display = 'block';
    loaderOverlay.style.display = 'block';

    const token_user = localStorage.getItem('user_token');
    console.log(selectedAccountsID);

    const data = {
      facebook_user_id: facebookData.data.id,
      page_ids: selectedAccountsID,
      access_token: "EAAGy5ZBNbZBgIBOxHMXZCQC54TUBHcNNNtzqn9i9FHY6VecrB4dv9B8GwDEY9al22lG1Ie7Fh66cce541YHHeLYc8kU7mV5qGChg7dJHEZBjl0K5aTfEssTb0O31ZACCIIwemCU9Eot7GaWLMb54Gh4b5jPVXIkfC3Ub1LRlsaUSfdko75nVvupk3"
    };

    try {
      const response = await axios.post(
        'https://localhost:8000/facebook/connect_to_account/',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token_user}`
          }
        }
      );

      alert('Connection successful: ' + response.data.message);
      window.location.href = 'home.html';
    } catch (error) {
      console.log('Failed to connect accounts.');
      const message = error.response?.data?.message || 'Failed to connect accounts.';
      alert(message);
    } finally {
      loader.style.display = 'none';
      loaderOverlay.style.display = 'none';
    }
  } else {
    alert('Please select at least one account.');
  }
});
