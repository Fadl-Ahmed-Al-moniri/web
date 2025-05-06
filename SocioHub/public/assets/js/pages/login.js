import { postRequest } from '../services/apiService.js';
import { showLoader, hideLoader }  from '../utils/loader.js';
import { API_ENDPOINTS }  from '../endpoint.js';


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

    try {
        showLoader();
        const response = await postRequest( API_ENDPOINTS.Auth.login, {
        email: email,
        password: password,
        });
        if (response.status === 200) {
            console.log(response.data.token)
            localStorage.setItem('user_token',  response.data.token);
            window.location.href = '../index.html';
        } else {
            alert('Login failed: ' + (response?.data?.message.message || 'Invalid credentials'));
        }
    } catch (err) {
        const message = err.response?.data?.message.message || 'login failed';
        console.log(err)
        alert('An error occurred: ' + message);
    }finally {
        hideLoader();
    }
    });
});
