
// بيانات المخطط (مثال)
const data = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'],
    datasets: [{
        label: ' Views',
        data: [10000, 15000, 30000, 25000, 28000, 22000, 18000],
        borderColor: 'blue',
        fill: true
    }]
};

// إعداد المخطط باستخدام Chart.js
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// إضافة التفاعل مع الأزرار
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        // ... هنا يمكنك إضافة منطق لتحديث البيانات بناءً على الزر المختار
        // مثلاً: تحديث مصفوفة labels و data في البيانات
        myChart.update();
    });
});

var analytics_1 =  document.getElementsByClassName("analytics_1");
    
if (analytics_1 != null && typeof(analytics_1) != 'undefined') {
    var chart = new ApexCharts(analytics_1[0], options("area" , '51px' , numArr(10,99) , '#c162d9')); 
    var chart_1 = new ApexCharts(analytics_1[1], options("area" , '51px' , numArr(10,99) , '#4c51bf')); 
    chart.render();       
    chart_1.render();       
}






