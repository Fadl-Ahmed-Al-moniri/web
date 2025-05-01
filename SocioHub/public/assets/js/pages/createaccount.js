import { postRequest } from '../services/apiService.js';
import { showLoader, hideLoader }  from '../utils/loader.js';
import { API_ENDPOINTS }  from '../endpoint.js';


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-account-form');
    form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.username.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
        showLoader();
        const response = await postRequest( API_ENDPOINTS.Auth.signup, {
        username:name,
        email: email,
        password: password,
        });
        if (response.status === 201) {
            alert(response.data.message);
            window.location.href = 'login.html';
        } else {
            alert('Create Account failed: ' + (response.data.message.email ));
        }
    } catch (err) {
        const message = err.response?.message || 'Create Account failed';
        alert('An error occurred: ' + message);
    }finally {
        hideLoader();
    }
    });



});