import { postRequest, getRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS} from '../endpoint.js';

const token =getUserToken();
let selectedPageIds = [];


window.onload = () => {
    fetchPages();
};



async function fetchPages() {
    try {
        showLoader();
        const res = await getRequest(API_ENDPOINTS.Page.getPages, token);
        renderPageCards(res.data.data);
    } catch (e) {
        console.error(e);
        alert('Error fetching pages');
    } finally {
        hideLoader();
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
  