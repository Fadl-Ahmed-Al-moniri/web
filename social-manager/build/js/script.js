// ✅ إدارة الحالة (State Management)
let connectedAccounts = []; // مصفوفة لتخزين الحسابات المتصلة
let showAuthModal = false; // متغير لتتبع حالة النافذة المنبثقة للمصادقة

// ✅ وظيفة تحديث المحتوى عند التنقل بين الصفحات
function updateContent(page) {
    const contentArea = document.querySelector('.content'); // تحديد منطقة المحتوى
    
    switch(page) {
        case 'create':
            contentArea.innerHTML = `
                <div class="content-header">
                    <div class="content-header-left">
                        <h1>إنشاء محتوى</h1>
                        <div class="badge-purple">✨ أفكار جديدة</div>
                    </div>
                    <div class="content-header-right">
                        <button class="btn btn-outline"><i class="fas fa-search"></i> مشاركة الملاحظات</button>
                        <button class="btn btn-outline"><i class="fas fa-tag"></i> العلامات</button>
                        <button class="btn btn-outline"><i class="fas fa-plus"></i> فكرة جديدة</button>
                    </div>
                </div>
                <div class="kanban-board"></div>
            `;
            break;
            
        case 'publish':
            updateAccountsDisplay(); // تحديث عرض الحسابات المتصلة
            break;
            
        case 'analyze':
            contentArea.innerHTML = `
                <div class="content-header">
                    <h1>لوحة التحليل</h1>
                    <button class="btn btn-primary">إنشاء تقرير</button>
                </div>
                <div class="analytics-content"></div>
            `;
            break;
            
        case 'engage':
            contentArea.innerHTML = `
                <div class="content-header">
                    <h1>التفاعل</h1>
                    <button class="btn btn-primary">عرض الإحصائيات</button>
                </div>
                <div class="engagement-content"></div>
            `;
            break;
            
        case 'start':
            contentArea.innerHTML = `
                <div class="content-header">
                    <h1>الصفحة الرئيسية</h1>
                    <button class="btn btn-primary">إنشاء صفحة</button>
                </div>
                <div class="start-page-content"></div>
            `;
            break;
    }
}

// ✅ التنقل بين الصفحات عند الضغط على زر في شريط التنقل
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active')); // إزالة الفئة النشطة
        link.classList.add('active'); // تعيين الفئة النشطة للتبويب المحدد
        updateContent(link.dataset.page); // تحديث المحتوى
    });
});

// ✅ التنقل بين عناصر الشريط الجانبي
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

// ✅ عرض نافذة المصادقة عند ربط حساب جديد
function showAuthenticationModal(platform) {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-modal-content">
            <div class="auth-modal-header">
                <h2>الاتصال بـ ${platform}</h2>
                <button class="btn-close">&times;</button>
            </div>
            <div class="auth-modal-body">
                <div class="platform-icon ${platform.toLowerCase()}">
                    <i class="fab fa-${platform.toLowerCase()}"></i>
                </div>
                <p>قم بربط حسابك على ${platform} لبدء جدولة المنشورات وإدارتها.</p>
                <button class="btn btn-primary btn-connect">
                    <i class="fab fa-${platform.toLowerCase()}"></i> ربط بـ ${platform}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // ✅ إغلاق النافذة عند الضغط على زر الإغلاق
    modal.querySelector('.btn-close').addEventListener('click', () => {
        modal.remove();
    });

    // ✅ تنفيذ عملية الربط (محاكاة)
    modal.querySelector('.btn-connect').addEventListener('click', () => {
        const newAccount = {
            id: Date.now(),
            platform,
            name: `${platform} Page`,
            followers: Math.floor(Math.random() * 10000),
            engagement: (Math.random() * 5).toFixed(1),
            avatar: `https://source.unsplash.com/100x100/?${platform.toLowerCase()}`
        };

        connectedAccounts.push(newAccount);
        updateAccountsDisplay();
        modal.remove();
    });
}

// ✅ تحديث عرض الحسابات المتصلة
function updateAccountsDisplay() {
    const contentArea = document.querySelector('.content');

    if (connectedAccounts.length === 0) {
        contentArea.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-share-nodes"></i>
                </div>
                <h2>قم بربط حساباتك الاجتماعية</h2>
                <p>ابدأ بربط حساباتك الاجتماعية لإدارتها جميعًا من مكان واحد.</p>
                <div class="connect-options">
                    <button class="btn btn-platform facebook" onclick="showAuthenticationModal('Facebook')">
                        <i class="fab fa-facebook"></i> ربط فيسبوك
                    </button>
                    <button class="btn btn-platform instagram" onclick="showAuthenticationModal('Instagram')">
                        <i class="fab fa-instagram"></i> ربط إنستجرام
                    </button>
                </div>
            </div>
        `;
    } else {
        contentArea.innerHTML = `
            <div class="accounts-header">
                <h1>الحسابات المتصلة</h1>
                <a href="AddAcountFB&INS.html" class="btn btn-primary">إضافة حساب</a>
            </div>
            <div class="accounts-grid">
                ${connectedAccounts.map(account => `
                    <div class="account-card">
                        <div class="account-header ${account.platform.toLowerCase()}">
                            <img src="${account.avatar}" alt="${account.name}" class="account-avatar">
                            <div class="account-info">
                                <h3>${account.name}</h3>
                                <span class="platform-badge">
                                    <i class="fab fa-${account.platform.toLowerCase()}"></i> ${account.platform}
                                </span>
                            </div>
                            <button class="btn-icon">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                        <div class="account-stats">
                            <div class="stat">
                                <span class="stat-value">${account.followers.toLocaleString()}</span>
                                <span class="stat-label">المتابعون</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${account.engagement}%</span>
                                <span class="stat-label">معدل التفاعل</span>
                            </div>
                        </div>
                        <div class="account-actions">
                            <button class="btn btn-outline">
                                <i class="fas fa-chart-line"></i> التحليلات
                            </button>
                            <button class="btn btn-outline">
                                <a href="publication1.html" class="creation-panel">إنشاء منشور</a>
                                <i class="fas fa-pencil"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// ✅ تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.nav-link[data-page="publish"]').classList.add('active');
    updateAccountsDisplay();
});
