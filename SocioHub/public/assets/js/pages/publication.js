import { postRequest, getRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS} from '../endpoint.js';

const token =getUserToken();
const publishNowBtn =document.getElementById('publishNowBtn');
let selectedPageIds = [];
let pageids = [];


window.onload = async () => {
    await fetchPages();
    await getPostsData();
    
};


async function getPostsData() {
    const container = document.getElementById('postsContainer');
    const noMsg    = document.getElementById('noPostsMessage');
    try {
        showLoader();
        const res = await postRequest(API_ENDPOINTS.Post.getPost,{page_ids:pageids}, token);
        if (res.status !== 200 || !Array.isArray(res.data.data)) {
            throw new Error('Invalid response');
        }
        const posts = res.data.data;
        container.innerHTML = '';
        if (posts.length === 0) {
            noMsg.classList.remove('hidden');
            return;
        }
        noMsg.classList.add('hidden');
        posts.forEach(renderPostCard);
    } catch (err) {
        console.error(err);
        alert('Error fetching posts');
    } finally {
        hideLoader();
    }
}

function renderPostCard(p) {
    const container = document.getElementById('postsContainer');
  
    // تحويل timestamp إلى تاريخ قابل للقراءة
    const date = new Date(p.created_at * 1000);
    const datetime = date.toLocaleString('en-US', {
      weekday:'long', year:'numeric', month:'long',
      day:'numeric', hour:'2-digit', minute:'2-digit'
    });
    const url = p.media_url || '';
    const ext = url.split('?')[0].split('.').pop().toLowerCase();
  
    // المصفوفات المسموح بها
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'mkv'];
  
    let mediaHtml;
    if (imageExts.includes(ext)) {
      mediaHtml = `
        <img
          src="${url}"
          alt="Post media"
          class="w-full max-w-md rounded-lg object-cover mx-auto"
        >`;
    } else if (videoExts.includes(ext)) {
      mediaHtml = `
        <video
          src="${url}"
          controls
          class="w-full max-w-md rounded-lg object-cover mx-auto"
        ></video>`;
    } else {
      mediaHtml = `
        <div class="text-center text-gray-400 dark:text-gray-500 italic text-sm">
          No media attached
        </div>`;
    }

    // منصة وفول أيقونتها
    const isFB = p.platform_name.toLowerCase() === 'facebook';
    const platformIcon = isFB
      ? `<svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
           <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 
                    4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 
                    1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 
                    0-1.63.771-1.63 1.562V12h2.773l-.443 2.889h-2.33v6.99C18.343 
                    21.128 22 16.991 22 12z"/>
         </svg>`
      : `<svg class="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
           <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 
                    16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 
                    7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 
                    7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 
                    16.25 3.5h-8.5zm10.75 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-5.25 1a5.25 
                    5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 
                    7.5 3.75 3.75 0 0 0 0-7.5z"/>
         </svg>`;
  

  
    // نص المحتوى مع دعم الروابط
    const contentHtml = p.content
      .split('\n')
      .map(line => `<p class="mt-1  text-gray-700 dark:text-gray-300 text-sm">${line}</p>`)
      .join('');
  
    const card = document.createElement('div');
    card.className = `
      max-w-2xl mx-auto bg-white dark:bg-gray-800 border rounded-lg shadow overflow-hidden
    `;
    card.innerHTML = `
      <!-- Header -->
      <div class="px-4 py-2 flex items-center justify-between 
                  text-xs text-gray-500 dark:text-gray-400">
        <span>${datetime}</span>
        ${platformIcon}
      </div>
      <!-- Content -->
      <div class="p-4 space-y-4">
        <div class="flex items-start space-x-3">
          <img src="${p.profile_picture_url}" alt=""
               class="object-cover w-8 h-8 rounded-full">
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">
              ${p.social_media_account_name}
            </h3>
           
        <p class="mt-1 h-auto text-gray-700 dark:text-gray-300 text-sm"> ${contentHtml}</p>

          </div>
        </div>
        ${mediaHtml}
      </div>
      <!-- Stats -->
      <div class="flex items-center justify-between px-4 py-2 
                  border-t border-gray-200 dark:border-gray-700 
                  text-xs text-gray-600 dark:text-gray-400">
        <div>
          <span class="font-semibold text-gray-800 dark:text-gray-100">
            ${p.likes_count}
          </span> Likes
        </div>
        <div>
          <span class="font-semibold text-gray-800 dark:text-gray-100">
            ${p.comments_count}
          </span> Comments
        </div>
      </div>
      <!-- Footer -->
      <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 
                  flex items-center justify-between 
                  text-xs text-gray-500 dark:text-gray-400">
        <div class="flex items-center space-x-1">
          <span>Posted from</span>
          ${platformIcon}
        </div>
        <div class="flex items-center space-x-4">
          <button class="flex items-center space-x-1 
                         text-gray-600 dark:text-gray-300 
                         hover:text-gray-800 dark:hover:text-gray-100 
                         transition-colors">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" 
                 fill="none" stroke="currentColor" stroke-width="2" 
                 viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01
                       M21 12c0 3.866-3.582 7-8 7a9.863 
                       9.863 0 01-4-.8L3 20l1.8-5.2A9.863 
                       9.863 0 014 12c0-3.866 3.582-7 
                       8-7s8 3.134 8 7z"/>
            </svg>
            <span>View Comments</span>
          </button>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded 
                         transition-colors">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" 
                 fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 012-2h4a2 2 0 110 
                       4H8a2 2 0 01-2-2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
}

async function fetchPages() {
    try {
        showLoader();
        const res = await getRequest(API_ENDPOINTS.Page.getPages, token);
        if (res.status===200) {
            res.data.data.forEach(p=>{
                pageids.push(p.external_account_id);
            });
        }
        renderPageCards(res.data.data);

    } catch (e) {
        console.error(e);
        alert('Error fetching pages');
    } finally {
        hideLoader();
        console.log(pageids);
    }
}


function renderPageCards(pages) {
    const container = document.getElementById('pagesContainer');
    container.innerHTML = '';
  
    if (!pages.length) {
      container.innerHTML = `
        <div class="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
          There are no currently connected pages.
        </div>`;
      return;
    }
  
    pages.forEach(p => {
      const card = document.createElement('div');
      card.dataset.id = p.external_account_id;
      card.className = [
        'relative',
        'w-20', 'h-20',
        'rounded-full',
        'bg-white', 'dark:bg-gray-800',
        'border-2', 'border-gray-300', 'dark:border-gray-600',
        'flex', 'items-center', 'justify-center',
        'hover:cursor-pointer',  // يد عند التمرير
        'shadow-sm', 'hover:shadow-md',
        'transition-colors', 'duration-150'
      ].join(' ');
  
      // أيقونة SVG لكل منصة
      const svgIcon = p.platform === 'Facebook'
        ? `<div class=" ">
            <svg
                class="w-5 h-5 -space-x-3 left-0 absolute text-white dark:text-white  bg-blue-600  border  border-transparent "
                                        aria-hidden="true"
                                        viewBox="0 0 320 512"
                                        fill="currentColor"
            >
                <path 
                    d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.2V288z"
                />
            </svg>
        
            </div>
        `
        : `<div class=" ">
            <svg
                                    class="w-5 h-5 -space-x-3 left-0 absolute text-white dark:text-white  bg-white  border border-transparent"
                                    viewBox="0 0 448 512"
                                    xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <defs>
                                        <linearGradient id="InstagramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stop-color="#f09433" />
                                            <stop offset="25%" stop-color="#e6683c" />
                                            <stop offset="50%" stop-color="#dc2743" />
                                            <stop offset="75%" stop-color="#cc2366" />
                                            <stop offset="100%" stop-color="#bc1888" />
                                        </linearGradient>
                                        </defs>
                                        <path 
                                        fill="url(#InstagramGradient)"
                                        d="M224.1 141c-63.6 0-114.9 51.3-114.9 
                                        114.9s51.3 114.9 114.9 114.9 114.9-51.3 
                                        114.9-114.9S287.7 141 224.1 141zm0 
                                        186.6c-39.6 0-71.7-32.1-71.7-71.7s32.1-71.7 
                                        71.7-71.7 71.7 32.1 71.7 71.7-32.1 71.7-71.7 
                                        71.7zm146.4-194.3c0 14.9-12 26.9-26.9 
                                        26.9s-26.9-12-26.9-26.9 12-26.9 
                                        26.9-26.9 26.9 12 26.9 26.9zm76.1 
                                        27.2c-1.7-35.7-9.9-67.3-36.2-93.5S382.9 
                                        24.6 347.2 22.9c-35.7-1.7-142.8-1.7-178.5 
                                        0-35.7 1.7-67.3 9.9-93.5 36.2S24.6 
                                        129.1 22.9 164.8c-1.7 35.7-1.7 142.8 
                                        0 178.5 1.7 35.7 9.9 67.3 36.2 
                                        93.5s57.8 34.5 93.5 36.2c35.7 1.7 142.8 
                                        1.7 178.5 0 35.7-1.7 67.3-9.9 
                                        93.5-36.2s34.5-57.8 36.2-93.5c1.7-35.7 
                                        1.7-142.8 0-178.5zm-48.5 
                                        218c-7.8 19.6-22.9 35.7-42.6 
                                        43.5-29.1 11.6-98.2 8.9-132.4 
                                        8.9s-103.4 2.6-132.4-8.9c-19.6-7.8-34.8-23.9-42.6-43.5-11.6-29.1-8.9-98.2-8.9-132.4s-2.6-103.4 
                                        8.9-132.4c7.8-19.6 22.9-35.7 42.6-43.5 
                                        29.1-11.6 98.2-8.9 132.4-8.9s103.4-2.6 
                                        132.4 8.9c19.6 7.8 34.8 23.9 
                                        42.6 43.5 11.6 29.1 8.9 98.2 8.9 
                                        132.4s2.7 103.4-8.9 132.4z"
                                        />
                                    </svg>
            </div>`;
  
        card.innerHTML = `
        <img 
            src="${p.profile_picture_url}" 
            alt="${p.account_name}" 
            class="w-12 h-12 rounded-full object-cover"
        />
        ${svgIcon}
      `;
  
      card.addEventListener('click', () => {
        const id = p.external_account_id;
        if (selectedPageIds.includes(id)) {
          selectedPageIds = selectedPageIds.filter(x => x !== id);
          card.classList.replace('border-purple-600', 'border-gray-300');
          card.classList.replace('dark:border-purple-600', 'dark:border-gray-600');
        } else {
          selectedPageIds.push(id);
          card.classList.replace('border-gray-300', 'border-purple-600');
          card.classList.replace('dark:border-gray-600', 'dark:border-purple-600');
        }
        console.log('Selected pages:', selectedPageIds);
      });
  
      container.appendChild(card);
    });
}


publishNowBtn.addEventListener('click', e => {
    e.preventDefault();
    // alert("hu");
    publish();
  });


async function publish() {
    try {
            showLoader();

        
    
    if (!selectedPageIds.length) {
        return alert('Please select at least one account');
    }
    const publishNowBtn =document.getElementById('publishNowBtn');
    const publishType = document.querySelector('input[name="postType"]:checked').value;
    const content = document.getElementById('postContent').value.trim();
    if (!content && !mediaFile) {
        return alert('Please add content or media');
    }

    const payload = {
        page_ids: selectedPageIds,
        publish_type: publishType,  // يفترض أن publishType = "post" أو "reel"
        publish_data: {
            content: content,
        }
    };
      
      if (publishType === "post") {
        payload.publish_data.media_url = "https://fadl-ahmed-al-moniri.github.io/auth/icon_social_manager.PNG";
      } else {
        payload.publish_data.media_url = "https://fadl-ahmed-al-moniri.github.io/auth/test_reels.mp4";
      }
    const res = await postRequest(API_ENDPOINTS.Post.publish, payload, token);
    if (res.status === 200) {
        alert(res.data.message || 'Published successfully');
        closeModal();
    } else {
        throw new Error(res.data.message || 'Publish failed');
    }
    } catch (err) {
        console.error(err);
        alert(err.message || 'Error publishing');
    } finally {
        hideLoader();
}
}
