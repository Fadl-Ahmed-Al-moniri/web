

// التحقق من صحة كلمة المرور أثناء الكتابة
document.getElementById('password').addEventListener('input', function() {
  const errorElement = document.getElementById('password-error');
  const isValid = this.checkValidity();
  
  errorElement.style.display = isValid ? 'none' : 'block';
});

// دالة التعامل مع إرسال بيانات التسجيل
async function handleSignup(event) {
  event.preventDefault();

  // التحقق من صحة النموذج قبل الإرسال
  if (!document.getElementById('signup-form').checkValidity()) {
    document.getElementById('password-error').style.display = 'block';
    return;
  }

  const formData = {
    username: document.getElementById("profile-name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const response = await axios.post("https://localhost:8000/auth/", formData);
    console.log(response.email);
    alert("تم التسجيل بنجاح!");
    window.location.href = 'login.html';
  } catch (error) {
    console.error('حدث خطأ أثناء إرسال البيانات:', error.response);
    console.log(error.email);
    alert(error.response.data.email ||error.response.data.username || "حدث خطأ أثناء التسجيل، حاول مرة أخرى.");
  }
}

document.getElementById('signup-form').addEventListener('submit', handleSignup);