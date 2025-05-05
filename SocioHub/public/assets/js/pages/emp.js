import { postRequest, getRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { API_ENDPOINTS } from '../endpoint.js';
import { getUserToken } from '../utils/user-token.js';
import { initLogout } from '../utils/logout.js'

const token = getUserToken();
const form = document.getElementById('employeeForm');
const modal = document.getElementById('modal');
const open = document.getElementById('open');
const editButtonSelector = '.edit-btn';

function openMod()   { open.click("openModal"); }
function closeMod()  { modal.click("closeModal"); }

function handleError(err, context) {
  console.error(context, err);
  alert(`${context}: ${err.message || err}`);
}

async function updateEmployee(id, data) {
  try {
    showLoader();
    const url = API_ENDPOINTS.User.updateEmpAdv;
    const response = await postRequest(url, {...data,id: id}, token);
    if (response.status === 200) {
      alert('Updated successfully!');
      loadEmployees();
      closeMod();
    }
  } catch (err) {
    handleError(err, 'Update employee failed');
  } finally {
    hideLoader();
  }
}

async function createEmployee(data) {
  try {
    showLoader();
    const response = await postRequest(API_ENDPOINTS.User.createEmp, data, token);
    if (response.status === 201) {
      alert("Created successfully!");
      loadEmployees();
      closeMod();
    }
  } catch (error) {
    handleError(error, 'Create employee failed');
  } finally {
    hideLoader();
  }
}

async function toggleEmployeeStatus(email, activate) {
  try {
    showLoader();
    const endpoint = activate
      ? API_ENDPOINTS.User.activateEmp
      : API_ENDPOINTS.User.deactivateEmp;
    const response = await postRequest(endpoint, { email }, token);
    if (response.status === 200) {
      alert(activate ? 'Activated!' : 'Deactivated!');
      loadEmployees();
    }
  } catch (err) {
    handleError(err, activate ? 'Activate failed' : 'Deactivate failed');
  } finally {
    hideLoader();
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    username: document.getElementById('username').value,
    email:    document.getElementById('email').value,
    password: document.getElementById('password').value,
    role:     document.getElementById('roleList').value,
  };
  const employeeId = document.getElementById('employeeId').value;
  if (employeeId) {
    await updateEmployee(employeeId, data);
  } else {
    await createEmployee(data);
  }
});

async function loadEmployees() {
    const tbody = document.getElementById('employeesBody');
    const msg   = document.getElementById('noEmployees');

    try {
        showLoader();
        const res = await getRequest(API_ENDPOINTS.User.getEmp, token);
        if (res.status !== 200) throw new Error('Failed to fetch');
        const data = res.data;

        tbody.innerHTML = '';
        if (!res.data.length) {
            msg.classList.remove('hidden');
            tbody.innerHTML = '';
            return;
        }
        msg.classList.add('hidden');
        
        data.forEach(emp => {
        const tr = document.createElement('tr');
        tr.className = 'text-gray-700 dark:text-gray-400';

        tr.innerHTML = `
            <td class="px-4 py-3">
            <div class="flex items-center text-sm">
                <div class="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                <img src="assets/img/user.svg" alt=""
                    class="object-cover w-full h-full rounded-full"/>
                <div class="absolute inset-0 rounded-full shadow-inner"></div>
                </div>
                <div>
                <p class="font-semibold">${emp.username}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">${emp.email}</p>
                </div>
            </div>
            </td>
            <td class="px-4 py-3 text-sm">${emp.role}</td>
            <td class="px-4 py-3 text-xs">
            <button
                class="status-toggle cursor-pointer px-2 py-1 font-semibold rounded-full ${
                emp.is_active
                    ? 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100'
                    : 'text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100'
                }"
                data-email="${emp.email}"
                data-active="${emp.is_active}"
            >
                ${emp.is_active ? 'Active' : 'Inactive'}
            </button>
            
            </td>
            <td class="px-4 py-3 text-sm">${emp.created_at.split('T')[0]}</td>
            <td class="px-4 py-3">
            <div class="flex items-center space-x-4 text-sm">
                <button class="edit-btn px-2 py-2 text-purple-600 dark:text-gray-400 focus:outline-none"
                        data-id="${emp.id}"
                        data-username="${emp.username}"
                        data-email="${emp.email}"
                        data-role="${emp.role}">
                <!-- أيقونة تعديل -->
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 
                            5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
                </button>
                <button class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                            aria-label="Delete" onclick=deleteEmp("${emp.email}")>
                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" >
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            ></path>
                            </svg>
            </button>
            </div>
            </td>`;

        tbody.appendChild(tr);

        tr.querySelector(editButtonSelector).addEventListener('click', () => {
            document.getElementById('employeeId').value   = emp.id;
            document.getElementById('username').value     = emp.username;
            document.getElementById('email').value        = emp.email;
            document.getElementById('roleList').value     = emp.role;
            document.getElementById('password').value     = '';
            openMod();
        });
        const deleteBtn = tr.querySelector('button[aria-label="Delete"]');
        deleteBtn.addEventListener('click', () => deleteEmp(emp.email));
        tr.querySelector('.status-toggle').addEventListener('click', (e) => {
            const email    = e.target.dataset.email;
            const active   = e.target.dataset.active === 'true';
            toggleEmployeeStatus(email, !active);
        });
        });
    } catch (err) {
        console.error('Error loading employees:', err);
        alert(err);
    } finally {
        hideLoader();
    }
}



async function fetchRoles() {
    try {
        showLoader();
        const res = await getRequest(API_ENDPOINTS.User.roleList, token);
        const roleSelect = document.getElementById('roleList');
        roleSelect.innerHTML = '<option value="">Select Account Type</option>';
        res.data.forEach(role => {
            const opt = document.createElement('option');
            opt.value = role.name;
            opt.textContent = role.name;
            roleSelect.appendChild(opt);
        });
    } catch (error) {
        handleError(error, 'Fetch roles failed');
    } finally {
        hideLoader();
    }
}


async function deleteEmp(email) {
    try {
        showLoader();
        const response = await postRequest(API_ENDPOINTS.User.deleteEmp, {email:email}, token);
        if (response.status === 200) {
            alert("delete successfully!");
            loadEmployees();
        }
    } catch (error) {
        handleError(error, 'Create employee failed');
    } finally {
        hideLoader();
    }
}
document.addEventListener('DOMContentLoaded', () => {
  fetchRoles();
  loadEmployees();
  initLogout();
});


