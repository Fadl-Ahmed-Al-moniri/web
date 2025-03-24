// بيانات الموظفين المبدئية
let employees = [
    { name: "أحمد خالد", email: "ahmed@example.com", jobTitle: "مبرمج", status: "Activated" },
    { name: "سارة محمود", email: "sarah@example.com", jobTitle: "مصمم جرافيك", status: "Deactivated" }
];

// عرض الموظفين
function displayEmployees() {
    let employeeList = document.getElementById("employeeList");
    employeeList.innerHTML = ""; // Clear the list before reloading

    employees.forEach((emp, index) => {
        let card = document.createElement("div");
        card.className = "employee-card";

        card.innerHTML = `
            <h3>${emp.name}</h3>
            <p>${emp.email}</p>
            <p><strong>${emp.jobTitle}</strong></p>
            <p class="status ${emp.status === 'Deactivated' ? 'deactivated' : ''}">${emp.status}</p>
            <div class="menu" onclick="toggleMenu(${index})">⋮</div>
            <div class="menu-options" id="menu-${index}">
                <button onclick="editEmployee(${index})">✏️ Edit</button>
                <button onclick="deleteEmployee(${index})">🗑 Delete</button>
                <button onclick="toggleStatus(${index})">🔄 Toggle Status</button>
            </div>
        `;

        // Insert each new card at the beginning to load from left to right
        employeeList.prepend(card);
    });
}


// فتح وإغلاق القائمة المنسدلة
function toggleMenu(index) {
    let menu = document.getElementById(`menu-${index}`);
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// حذف الموظف
function deleteEmployee(index) {
    if (confirm("هل أنت متأكد؟")) {
        employees.splice(index, 1);
        displayEmployees();
    }
}

// تبديل حالة الموظف
function toggleStatus(index) {
    employees[index].status = employees[index].status === "Activated" ? "Deactivated" : "Activated";
    displayEmployees();
}

// البحث عن موظف
function searchEmployee() {
    let query = document.getElementById("searchInput").value.toLowerCase();
    let filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(query));
    
    let employeeList = document.getElementById("employeeList");
    employeeList.innerHTML = "";

    filteredEmployees.forEach((emp, index) => {
        let card = document.createElement("div");
        card.className = "employee-card";

        card.innerHTML = `
            <h3>${emp.name}</h3>
            <p>${emp.email}</p>
            <p><strong>${emp.jobTitle}</strong></p>
            <p class="status ${emp.status === 'Deactivated' ? 'deactivated' : ''}">${emp.status}</p>
        `;

        employeeList.appendChild(card);
    });
}
document.getElementById("addEmployeeBtn").addEventListener("click", () => {
    document.getElementById("employeeModal").style.display = "block";
    document.getElementById("employeeForm").reset();
});

// Close modal
document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("employeeModal").style.display = "none";
});

// Handle form submission
document.getElementById("employeeForm").addEventListener("submit", (event) => {
    event.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let jobTitle = document.getElementById("jobTitle").value;
    let newEmployee = { name, email, jobTitle, status: "Activated" };

    employees.push(newEmployee);
    document.getElementById("employeeModal").style.display = "none";
    displayEmployees();
});

// Edit employee
function editEmployee(index) {
    let emp = employees[index];

    document.getElementById("name").value = emp.name;
    document.getElementById("email").value = emp.email;
    document.getElementById("jobTitle").value = emp.jobTitle;
    
    employees.splice(index, 1);
    document.getElementById("employeeModal").style.display = "block";
}
displayEmployees();
