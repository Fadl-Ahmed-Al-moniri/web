import { postRequest, getRequest } from '../services/apiService.js';
import { showLoader, hideLoader }   from '../utils/loader.js';
import { getUserToken }             from '../utils/user-token.js';
import { API_ENDPOINTS }            from '../endpoint.js';
import { initLogout } from '../utils/logout.js'


const token = getUserToken();
let selectedPageIds = [];

window.onload = () => {
    fetchPages();
    document.getElementById('btnViewReports')
        .addEventListener('click', handleSubmit);
    document.getElementById('printpdf')
        .addEventListener('click', printReport);
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
    const c = document.getElementById('pagesContainer');
    c.innerHTML = '';
  
    if (!pages.length) {
      c.innerHTML = `
        <div class="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
          There are no currently connected pages.
        </div>`;
      return;
    }
  
    pages.forEach(p => {
      const card = document.createElement('div');
      card.dataset.id = p.external_account_id;
      card.className = [
        'w-48 h-56',
        'rounded-lg p-4 text-center cursor-pointer',
        'bg-white dark:bg-gray-800',
        'border-2 border-gray-300 dark:border-gray-600',
        'shadow-sm hover:shadow-md',
        'flex flex-col items-center overflow-hidden',
        'transition-colors duration-150'
      ].join(' ');
  
      card.addEventListener('click', () => {
        const id = p.external_account_id;
        if (selectedPageIds.includes(id)) {
          selectedPageIds = selectedPageIds.filter(x => x !== id);
          card.classList.replace('border-green-500', 'border-gray-300');
          card.classList.replace('bg-green-50', 'bg-white');
          card.classList.replace('dark:bg-green-900', 'dark:bg-gray-800');
        } else {
          selectedPageIds.push(id);
          card.classList.replace('border-gray-300', 'border-green-500');
          card.classList.replace('bg-white', 'bg-green-50');
          card.classList.replace('dark:bg-gray-800', 'dark:bg-green-900');
        }
      });
  
      card.innerHTML = `
        <img 
          src="${p.profile_picture_url}" 
          alt="${p.account_name}" 
          class="w-12 h-12 rounded-full mb-3 object-cover"
        />
        <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 truncate w-full">
          ${p.account_name}
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-400 truncate w-full">
          ${p.platform}
        </p>
      `;
  
      c.appendChild(card);
    });
}
  

function handleSubmit() {
    const period = document.getElementById('periodSelect').value;
    if (!selectedPageIds.length) {
        alert('Please select at least one page.');
        return;
    }
    const { since, until } = getDateRange(period);
    const requestData = {
        page_ids: selectedPageIds,
        period: period,
        metric_type: "total_value",
        until: until,
        since: since
    };
    fetchAnalytics(requestData);
}

function getFormattedDate(d) {
    return d.toISOString().split('T')[0];
}
function getDateRange(period) {
    const today = new Date();
    const since = new Date(today);
    if (period === 'day')   since.setDate(today.getDate() - 1);
    if (period === 'week')  since.setDate(today.getDate() - 7);
    if (period === 'month') since.setMonth(today.getMonth() - 1);
    return {
        since: getFormattedDate(since),
        until: getFormattedDate(today)
    };
}

async function fetchAnalytics(data) {
    try {
        showLoader();
        const res = await postRequest(API_ENDPOINTS.Page.analyses, data , token);
        document.getElementById('dashboard').innerHTML = '';
        renderCards(res.data.data.results);
    } catch (e) {
        
        console.error(e);
        alert('Error fetching analytics');
    } finally {
        hideLoader();
    }
}

function renderCards(pages) {
    const container = document.getElementById('dashboard');
    pages.forEach((page, index) => {
        const pageName = page.page_id;
        const platform = page.platform;
        const profile = page.profile;
    
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6';
    
        const accountInfo = document.createElement('div');
        accountInfo.className = 'flex items-center space-x-4 mb-4';
    
        const img = document.createElement('img');
        img.src = profile;
        img.className = 'w-12 h-12 rounded-full object-cover';
    
        const title = document.createElement('h2');
        title.textContent = `${platform} - ${pageName}`;
        title.className = 'text-lg font-semibold text-gray-800 dark:text-gray-200';
    
        accountInfo.appendChild(img);
        accountInfo.appendChild(title);
        card.appendChild(accountInfo);
    
        const metrics = document.createElement('div');
        metrics.className = 'space-y-2 mb-4';
    
        page.instance_data?.data?.forEach(metric => {
            const item = document.createElement('div');
            item.className = 'text-sm text-gray-700 dark:text-gray-300';
            const label = metric.title ?? metric.name;
            const value = metric.total_value ? metric.total_value.value : metric.values[0]?.value ?? '—'
            item.innerHTML = `<span class="font-medium">${label}:</span> ${value}`;
            metrics.appendChild(item);
        });
    
        card.appendChild(metrics);
    
        const canvas = document.createElement('canvas');
        canvas.id = `reachChart-${index}`;
        canvas.className = 'w-full h-48';
        card.appendChild(canvas);
    
        container.appendChild(card);
    
        const reachMetric = page.reach_data.data[0];
        const labels = reachMetric.values.map(v => new Date(v.end_time).toLocaleDateString());
        const values = reachMetric.values.map(v => v.value);
    
        new Chart(canvas, {
            type: 'line',
            data: {
            labels,
            datasets: [{
                label: reachMetric.title ?? reachMetric.name,
                data: values,
                borderColor: platform === 'Facebook' ? '#1877F2' : '#C13584',
                backgroundColor: platform === 'Facebook' ? '#1877F255' : '#C1358455',
                tension: 0.3
            }]
            },
            options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
            }
        });
    });
}

async function printReport() {
    const dash = document.getElementById('dashboard');
    
    if (!dash.children.length) {
        alert('There is no data to print.');
        return;
    }

    showLoader();

    try {
        // 🔹 إنشاء رأس التقرير (للPDF فقط)
        const pdfHeader = document.createElement('div');
        pdfHeader.className = 'pdf-header';
        pdfHeader.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #F9FAFB; border-bottom: 2px solid #4F46E5;">
                <img src="assets/img/icon_social_manager.png" alt="Sociolyze Logo" style="width: 50px; height: 50px; object-fit: contain;">
                <h1 style="margin: 0; font-size: 1.5rem; color: #4F46E5;">Sociolyze</h1>
            </div>
        `;
        dash.insertBefore(pdfHeader, dash.firstChild);

        // 🔹 تحويل Canvas إلى صور
        const canvasElements = dash.querySelectorAll('canvas');
        const imagePromises = [];

        canvasElements.forEach(c => {
            const img = document.createElement('img');
            img.style.width = '100%';
            img.style.marginTop = '1rem';
            
            const imgLoaded = new Promise((resolve) => {
                img.onload = () => resolve();
            });

            img.src = c.toDataURL('image/png');
            c.parentNode.replaceChild(img, c);
            imagePromises.push(imgLoaded);
        });

        await Promise.all(imagePromises);

        // 🔹 إعداد خيارات PDF مع تنسيق الطباعة
        const opt = {
            margin:       [0.5, 0.75, 0.5, 0.75], // [top, right, bottom, left]
            filename:     `Sociolyze_Report_${new Date().toISOString().split('T')[0]}.pdf`,
            image:        { type: 'png' },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // 🔹 إنشاء PDF
        await html2pdf().set(opt).from(dash).save();

        // 🔹 إزالة الرأس بعد الانتهاء
        pdfHeader.remove();

    } catch (error) {
        console.error('خطأ في إنشاء التقرير:', error);
        alert('حدث خطأ أثناء إنشاء ملف PDF.');
    } finally {
        hideLoader();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    initLogout();
});