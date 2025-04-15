document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const loader = document.querySelector('.loader');
    const loaderOverlay = document.querySelector('.loader-overlay');
    loader.style.display = 'block';
    loaderOverlay.style.display = 'block';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post(
            'https://localhost:8000/auth/login/',
            { email, password },
            { headers: { 'Content-Type': 'application/json' } }
        );

        localStorage.setItem('user_token', response.data.token);
        window.location.href = 'home.html';
        
    } catch (error) {
        const message = error.response?.data?.message || 'فشل تسجيل الدخول';
        
        if (message.includes('check your email')) {
            alert('الرجاء تفعيل الحساب عبر الرابط المرسل إلى بريدك');
        } else {
            alert(message);
        }
    } finally {
        // إخفاء مؤشر التحميل وطبقة الخلفية بعد استلام ايي الرد
        loader.style.display = 'none';
        loaderOverlay.style.display = 'none';
    }
});