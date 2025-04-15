// تهيئة التوكن من التخزين المحلي
let authToken = localStorage.getItem('user_token'); // التأكد من اسم المفتاح

// تهيئة Axios defaults
axios.defaults.baseURL = 'https://localhost:8000/emp/'; // استخدام http بدل https إذا لم يكن SSL مفعل
axios.defaults.headers.common['Authorization'] = `Token ${authToken}`;

// عناصر DOM
const employeeList = document.getElementById('employeeList');
const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const modal = document.getElementById('employeeModal');
const closeBtn = document.querySelector('.close');
const form = document.getElementById('employeeForm');
const loader =  document.querySelector('.loader');
const loaderOverlay= document.querySelector('.loader-overlay');

// أحداث
addEmployeeBtn.addEventListener('click', () => openModal('create'));
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => e.target === modal && closeModal());

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    modal.style.display = 'none';
    // تحميل الأدوار والمديرين عند بدء التشغيل
    fetchRoles();
    fetchEmployees(); // تحميل قائمة الموظفين
});

// ------ وظائف جلب البيانات ------
async function fetchRoles() {
    try {
        const response = await axios.get('roleList/');
        const roleSelect = document.getElementById('roleList');
        roleSelect.innerHTML = '<option value="">اختر الدور</option>';
        response.data.forEach(role => {
            const option = document.createElement('option');
            option.value = role.name;
            option.textContent = role.name;
            roleSelect.appendChild(option);
        });
    } catch (error) {
        handleError(error, 'جلب الأدوار');
    }
}


async function fetchEmployees() {
    try {
        showLoader();
        const response = await axios.get('get_emps/');
        renderEmployees(response.data);
    } catch (error) {
        handleError(error);
    }
    finally{
        hideLoader();
    }
}

// ------ وظائف الإنشاء والتحديث ------
async function createEmployee(data) {
    try {
        showLoader();
        const response = await axios.post('create/', data);
        if (response.status === 201) {
            alert("تم الإنشاء بنجاح!");
            fetchEmployees();
            closeModal();
        }
    } catch (error) {
        handleError(error, 'إنشاء الموظف');
    }
    finally{
        hideLoader();
    }
}

async function updateEmployee(id, data) {
    try {
        showLoader();
        await axios.post(`update-advance/`, { ...data, email: id });
        fetchEmployees();
        closeModal();
    } catch (error) {
        handleError(error, 'تحديث الموظف');
    }
    finally{
        hideLoader();
    }
}

// ------ وظائف العرض ------
function renderEmployees(employees) {
    employeeList.innerHTML = employees.map(emp => `
        <div class="employee-card">
            <h3>Name : ${emp.username}</h3>
            <p>Email : ${emp.email}</p>
            <p>Job : ${emp.role}</p>
            <button onclick="openEditModal('${emp.id}')">Edit info</button>
            <hr>
            <button onclick="toggleStatus('${emp.email}', ${!emp.is_active})">
                ${emp.is_active ? 'Diseble' : 'Enable'}
            </button>
        </div>
    `).join('');
}

// ------ إدارة النموذج ------
function openModal(action, employee = null) {
    
    form.reset();
    if (action === 'edit' && employee) {
        document.getElementById('employeeId').value = employee.email;
        document.getElementById('username').value = employee.username;
        document.getElementById('email').value = employee.email;
        document.getElementById('roleList').value = employee.role?.name;
    }
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

function showLoader() {
    loader.style.display = 'block';
    loaderOverlay.style.display = 'block';
  }
  
  function hideLoader() {
    loader.style.display = 'none';
    loaderOverlay.style.display = 'none';
  }

// ------ معالجة الأخطاء ------
function handleError(error, context = '') {
    let message = 'حدث خطأ غير متوقع';
    if (error.response) {
        if (error.response.status === 401) {
            message = 'انتهت الجلسة، يرجى تسجيل الدخول مجددًا';
            localStorage.removeItem('user_token');
            window.location.href = '/login.html';
        } else {
            message = error.response.data.detail || error.response.data.message;
        }
    } else if (error.request) {
        message = 'تعذر الاتصال بالخادم';
    }
    alert(`${message}`);
    console.error(`تفاصيل الخطأ (${context}):`, error);
}

// ------ أحداث النموذج ------
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('roleList').value.toString(),
    };

    const employeeId = document.getElementById('employeeId').value;
    if (employeeId) {
        await updateEmployee(employeeId, data);
    } else {
        await createEmployee(data);
    }
});

// ------ وظائف مساعدة ------
window.openEditModal = async (email) => {
    try {
        const response = await axios.get(`update-advance/?email=${email}`);
        openModal('edit', response.data[0]);
    } catch (error) {
        handleError(error, 'فتح التعديل');
    }
};

async function toggleStatus(email, isActive) {
    try {
        showLoader();
        const endpoint = isActive ? 'activate/' : 'deactivate/';
        await axios.post(endpoint, { email });
        fetchEmployees();
    } catch (error) {
        handleError(error, 'تغيير الحالة');
    }
    finally{
        hideLoader();
    }
}