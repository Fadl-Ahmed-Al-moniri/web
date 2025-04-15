
async function submitEmail() {
    // جلب عناصر HTML التي سيتم التفاعل معها
    const email = document.getElementById('email').value.trim(); // الحصول على البريد وإزالة الفراغات الزائدة
    const submitBtn = document.getElementById('submitBtn'); // زر الإرسال
    const btnText = document.getElementById('btnText'); // نص الزر
    const spinner = document.querySelector('.spinner'); // مؤشر التحميل

    // التحقق مما إذا كان البريد الإلكتروني مدخلًا أم لا
    if (!email) {
        alert('يرجى إدخال البريد الإلكتروني'); // تنبيه المستخدم إذا لم يدخل البريد
        return; // إيقاف تنفيذ الدالة
    }

    // تعطيل الزر أثناء عملية الإرسال لمنع النقر المتكرر
    submitBtn.disabled = true;
    btnText.textContent = 'جارِ الإرسال...'; // تغيير النص لإعلام المستخدم بأن العملية جارية
    spinner.style.display = 'inline-block'; // إظهار مؤشر التحميل

    try {
        // إرسال البيانات إلى الخادم باستخدام Axios
        const response = await axios.post(
            'https://localhost:8000/password-reset/', // رابط API
            { email: email }, // البيانات المرسلة في الطلب
            { headers: { 'Content-Type': 'application/json' } } // تحديد نوع البيانات
        );

        // إظهار رسالة نجاح للمستخدم عند استجابة ناجحة
        alert(response.data.message);
        
        // طباعة رابط الاستعادة في وحدة التحكم (Console) لمساعدة المطور في الاختبار
        console.log('رابط الاستعادة:', response.data.verification_url);

    } catch (error) {
        // استخراج رسالة الخطأ من الرد إذا وُجدت، وإلا استخدام رسالة افتراضية
        const errorMessage = error.response?.data?.message || 
                              error.response?.data?.detail || 
                              'حدث خطأ غير متوقع';

        alert(errorMessage); // إظهار رسالة الخطأ للمستخدم

        // إذا كان الخطأ هو أن البريد غير موجود في قاعدة البيانات، يتم تسجيله في Console
        if (error.response?.status === 404) {
            console.error('المستخدم غير موجود:', email);
        }

    } finally {
        // إعادة تفعيل الزر بعد انتهاء العملية، سواء نجحت أم فشلت
        submitBtn.disabled = false;
        btnText.textContent = 'التالي'; // إعادة النص الافتراضي للزر
        spinner.style.display = 'none'; // إخفاء مؤشر التحميل
    }
}