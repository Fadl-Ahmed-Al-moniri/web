const tabs = document.querySelectorAll('.tab');
const contentDivs = document.querySelectorAll('.content > div');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        // Hide all content divs
        contentDivs.forEach(div => div.style.display = 'none');

        // Add active class to the clicked tab
        tab.classList.add('active');
        // Show the content div corresponding to the clicked tab
        const targetId = tab.dataset.tab;
        document.getElementById(targetId).style.display = 'block';
    });
});


const checkbox = document.getElementById('myCheckbox');

checkbox.addEventListener('change', function() {
if (this.checked) {
// Checkbox is checked
console.log("Checked!"); // Replace with your desired action
} else {
// Checkbox is not checked
console.log("Not checked!"); // Replace with your desired action
}
});