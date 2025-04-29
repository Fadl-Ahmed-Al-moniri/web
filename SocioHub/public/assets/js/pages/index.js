import { postRequest } from '../services/apiService.js';
import { showLoader, hideLoader }  from '../utils/loader.js';
import { getUserToken }  from '../utils/user-token.js';

import {API_ENDPOINTS} from '../endpoint.js'

const token =  getUserToken(); 
document.addEventListener('DOMContentLoaded',async () => {

    try {
        showLoader();
        const token =  localStorage.getItem('user_token'); 
        const response =await   postRequest(API_ENDPOINTS.Page.dashbord,
        {},token);
        if (response.status === 200 && response.data) {
            const data = response.data.data;
            document.getElementById('employeeCount').textContent = data.employee_count;
            const totalPosts = data.total_facebook_posts + data.total_instagram_posts;
            document.getElementById('totalPosts').textContent = totalPosts;
            const connected = data.facebook_ids.length + data.instagram_ids.length;
            document.getElementById('connectedAccounts').textContent = connected;
            const totalFollowers = data.facebook_followers_count + data.instagram_followers_count;
            document.getElementById('totalFollowers').textContent = totalFollowers;

            const platforms = ['Instagram', 'Facebook'];
            const postsData = [data.total_instagram_posts, data.total_facebook_posts];
            const followersData = [data.instagram_followers_count, data.facebook_followers_count];

            new Chart(document.getElementById('postsChart'), {
            type: 'doughnut',
            data: {
                labels: platforms,
                datasets: [
                    {
                    data: postsData ,
                    backgroundColor: ["#AD3DA3", "#3b82f6"],
                    borderWidth: 0, }
                ]
            }
            });

            new Chart(document.getElementById('followersChart'), {
            type: 'doughnut',
            data: {
                labels: platforms,
                datasets: [{
                    data: followersData,
                    backgroundColor: ["#AD3DA3", "#3b82f6"],
                    borderWidth: 0,
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
            });
            
        } else {

            document.getElementById('dashboard-container').classList.add('hidden');
            document.getElementById('no-data-message').classList.remove('hidden');
        }
    
    } catch (error) {
        console.error('Error fetching dashboard data:', err);
        document.getElementById('dashboard-container').classList.add('hidden');
        document.getElementById('no-data-message').classList.remove('hidden');
    }finally {
        hideLoader();
    }

});
