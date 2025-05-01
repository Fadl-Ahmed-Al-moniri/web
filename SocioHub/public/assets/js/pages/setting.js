import { postRequest, getRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS } from '../endpoint.js';

const token = getUserToken();

const viewUsername  = document.getElementById('viewUsername');
const viewEmail     = document.getElementById('viewEmail');
const viewRole      = document.getElementById('viewRole');
const viewManager   = document.getElementById('viewManager');
const viewStatus    = document.getElementById('viewStatus');
const viewCreatedAt = document.getElementById('viewCreatedAt');
const viewUpdatedAt = document.getElementById('viewUpdatedAt');

const inputUsername = document.getElementById('inputUsername');
const inputPassword = document.getElementById('inputPassword');

const editBtn     = document.getElementById('editBtn');
const cancelBtn   = document.getElementById('cancelBtn');
const actions     = document.getElementById('formActions');
const profileForm = document.getElementById('profileForm');

function handleError(err, context) {
    console.error(context, err);
    alert(`${context}: ${err.message || err}`);
}

async function fetchInfoAccount() {
    try {
        showLoader();
        const res = await getRequest(API_ENDPOINTS.User.getInfo, token);
        if (res.status !== 200) throw new Error('Fetch failed');
        const d = res.data;

        viewUsername.textContent  = d.username;
        viewEmail.textContent     = d.email;
        viewRole.textContent      = d.role;
        viewManager.textContent   = d.manager;
        viewStatus.textContent    = d.is_active ? 'Active' : 'Inactive';
        viewStatus.className      = d.is_active
        ? 'px-2 py-1 rounded-full text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100'
        : 'px-2 py-1 rounded-full text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100';
        viewCreatedAt.textContent = new Date(d.created_at).toLocaleString();
        viewUpdatedAt.textContent = new Date(d.updated_at).toLocaleString();

        inputUsername.value = d.username;
        inputPassword.value = '';
    } catch (e) {
        handleError(e, 'Fetch profile failed');
    } finally {
        hideLoader();
    }
}

async function updateInfo(data) {
    try {
        showLoader();
        const res = await postRequest(API_ENDPOINTS.User.updateInfo, data, token);
        if (res.status !== 200) throw new Error(res.data?.message || 'Update failed');
        alert('Profile updated successfully!');
        await fetchInfoAccount();
    } catch (e) {
        handleError(e, 'Update profile failed');
    } finally {
        hideLoader();
    }
}

editBtn.addEventListener('click', () => {
    inputUsername.disabled = false;
    inputPassword.disabled = false;
    actions.classList.remove('hidden');
    editBtn.disabled = true;
});

cancelBtn.addEventListener('click', () => {
    inputUsername.disabled = true;
    inputPassword.disabled = true;
    actions.classList.add('hidden');
    editBtn.disabled = false;
});

profileForm.addEventListener('submit', e => {
    e.preventDefault();
    const payload = {
        username: inputUsername.value,
        password: inputPassword.value
    };
    updateInfo(payload);
});

document.getElementById('logoutBtn')
    .addEventListener('click', () => {
        localStorage.removeItem('user_token');
        window.location.href = 'pages/login.html'; 
});

window.addEventListener('DOMContentLoaded', fetchInfoAccount);
