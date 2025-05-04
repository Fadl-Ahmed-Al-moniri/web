import { postRequest } from '../services/apiService.js';
import { showLoader, hideLoader }  from '../utils/loader.js';
import { API_ENDPOINTS }  from '../endpoint.js';


document.getElementById('recover').addEventListener('click', async () => {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();

    if (!email) {
        alert('Please enter your email.');
        emailInput.focus();
        return;
    }

    try {
        showLoader();
        const response = await postRequest(
        API_ENDPOINTS.Auth.passwordReset,
        { email :email},
        null
        );

        if (response.status === 200 || response.status === 204) {
        alert('Reset link sent! Please check your inbox.');
        } else {
        alert(response.data.message || 'Failed to send reset link.');
        }
    } catch (err) {
        console.error('Password reset error:', err);
        alert(err.message || 'Unexpected error.');
    }finally{
        hideLoader();
    }
});