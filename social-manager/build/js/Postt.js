//create post
let selectedProfile = 1;
let currentMedia = null;
let likes = 0;
let isLiked = false;
let comments = [];
function applyFilter(filterType) {
  const img = document.querySelector('#mediaPreview img');
  img.style.filter = filterType;
}

// Get the selected account details from localStorage
const selectedAccountName = localStorage.getItem('selectedAccountName');
const selectedAccountImg = localStorage.getItem('selectedAccountImg');
const selectedPlatform = localStorage.getItem('selectedPlatform');

// Set the profile image and name
document.getElementById('profileImage').src = selectedAccountImg;
document.getElementById('previewProfileImg').src = selectedAccountImg;
document.getElementById('previewProfileName').textContent = selectedAccountName;

// Set the platform icon
const platformIcon = document.getElementById('platformIcon');
if (selectedPlatform === 'Facebook') {
  platformIcon.src = 'img/facebook.png'; // Replace with your Facebook icon path
} else if (selectedPlatform === 'Instagram') {
  platformIcon.src = 'img/0ea4ff61d1e454ccec004272ce9e2a80.jpg'; // Replace with your Instagram icon path
}

// Dropdown functionality
function toggleDropdown(type) {
  const dropdown = document.getElementById(`${type}-dropdown`);
  dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
window.onclick = function (event) {
  if (!event.target.matches('.dropdown-toggle')) {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      }
    });
  }
}

// Date/Time Picker functionality
let flatpickrInstance = null;

function showDateTimePicker() {
  const datetimePicker = document.getElementById('datetime-picker');
  datetimePicker.style.display = 'block';

  if (!flatpickrInstance) {
    flatpickrInstance = flatpickr('#datetime-input', {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      time_24hr: true,
      locale: "ar"
    });
  }
}

function hideDateTimePicker() {
  document.getElementById('datetime-picker').style.display = 'none';
}

function schedulePost() {
  const selectedDate = document.getElementById('datetime-input').value;
  if (selectedDate) {
    alert(`تم جدولة المنشور للوقت: ${selectedDate}`);
    hideDateTimePicker();
  }
}


// اختيار الملف الشخصي
function selectProfile(profileNumber) {
  selectedProfile = profileNumber;
  document.querySelectorAll('.profile-card').forEach(card => card.classList.remove('active'));
  event.currentTarget.classList.add('active');
  updatePreview();
}

// معالجة رفع الميديا
document.getElementById('mediaInput').addEventListener('change', function (e) {
  currentMedia = e.target.files[0];
  updatePreview();
});

// تحديث المعاينة
function updatePreview() {
  // تحديث الملف الشخصي
  const profile = selectedProfile === 1 ?
    { img: 'img/user12.jpg', name: 'dad1235' } :
    { img: 'img/user32.jpg', name: ' azal2678' };

  document.getElementById('previewProfileImg').src = profile.img;
  document.getElementById('previewProfileName').textContent = profile.name;

  // تحديث النص
  document.getElementById('previewText').textContent =
    document.getElementById('postContent').value || 'محتوى المنشور';

  // تحديث الميديا
  const mediaPreview = document.getElementById('mediaPreview');
  mediaPreview.innerHTML = '';

  if (currentMedia) {
    const reader = new FileReader();
    reader.onload = function (e) {
      let mediaElement;
      if (currentMedia.type.startsWith('image')) {
        mediaElement = `<img src="${e.target.result}" style="max-width:80%; border-radius:8px;">`;
      } else if (currentMedia.type.startsWith('video')) {
        mediaElement = `
                            <video controls style="max-width:100%; border-radius:8px;">
                                <source src="${e.target.result}" type="${currentMedia.type}">
                            </video>
                        `;
      }
      mediaPreview.innerHTML = mediaElement;
    }
    reader.readAsDataURL(currentMedia);
  }
}

// زر الإعجاب
function toggleLike() {
  isLiked = !isLiked;
  likes = isLiked ? likes + 1 : likes - 1;
  document.getElementById('likeBtn').classList.toggle('liked');
  document.getElementById('likeCount').textContent = likes;
}

// زر المشاركة
function sharePost() {
  alert('تم نسخ رابط المشاركة!');
}

// التعليقات
function addComment() {
  const commentInput = document.getElementById('commentInput');
  if (commentInput.value.trim()) {
    comments.push(commentInput.value);
    updateComments();
    commentInput.value = '';
  }
}

function updateComments() {
  const commentsList = document.getElementById('commentsList');
  commentsList.innerHTML = comments
    .map(comment => `
                    <div class="comment">
                        <img src="profile${selectedProfile}.jpg" class="profile-image" style="width:30px;height:30px;">
                        <div>${comment}</div>
                    </div>
                `).join('');
  document.getElementById('commentCount').textContent = comments.length;
}

function focusComment() {
  document.getElementById('commentInput').focus();
}

// التحديث التلقائي
setInterval(() => {
  document.getElementById('postContent').value =
    document.getElementById('previewText').textContent;
}, 500);






// إظهار/إخفاء القائمة عند النقر
document.addEventListener('click', function (e) {
  if (e.target.closest('.dots-btn')) {
    const menu = document.querySelector('.menu-content');
    menu.classList.toggle('show-menu');
  } else {
    document.querySelectorAll('.menu-content').forEach(menu => {
      menu.classList.remove('show-menu');
    });
  }
});

// حذف الصورة
function deleteMedia() {
  currentMedia = null;
  document.getElementById('mediaInput').value = '';
  updatePreview();
}

// تعديل الصورة (دليلية)
function editMedia() {
  // يمكنك إضافة مكتبة مثل cropper.js هنا
  alert('خاصية التعديل قيد التطوير');
}

// نعدل دالة العرض لتشمل عناصر التحكم
reader.onload = function (e) {
  let mediaElement;
  if (currentMedia.type.startsWith('image')) {
    mediaElement = `
              <img src="${e.target.result}" style="max-width:80%; border-radius:80%;">
            `;
  } else if (currentMedia.type.startsWith('video')) {
    mediaElement = `
              <video controls style="max-width:100%; border-radius:80%;">
                <source src="${e.target.result}" type="${currentMedia.type}">
              </video>
            `;
  }

  mediaPreview.innerHTML = `
            ${mediaElement}
            <div class="media-context-menu">
              <button class="dots-btn">⋮</button>
              <div class="menu-content">
                <button onclick="editMedia()">تعديل الصورة</button>
                <button onclick="deleteMedia()">حذف الصورة</button>
              </div>
            </div>
          `;
}










