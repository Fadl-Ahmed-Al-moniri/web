import { postRequest, getRequest } from '../services/apiService.js';
import { API_ENDPOINTS} from '../endpoint.js';
import { getUserToken} from '../utils/user-token.js';


export const FACEBOOK_SDK_CONFIG = {
    appId: '478183998355970',
    cookie: true,
    xfbml: true,
    version: 'v22.0'
};


export const FACEBOOK_PERMISSIONS = [
    "email", "manage_fundraisers", "read_insights", "publish_video",
    "catalog_management", "pages_manage_cta", "pages_manage_instant_articles",
    "pages_show_list", "read_page_mailboxes", "ads_management", "ads_read",
    "business_management", "pages_messaging", "pages_messaging_subscriptions",
    "instagram_basic", "instagram_manage_comments", "instagram_manage_insights",
    "instagram_content_publish", "leads_retrieval", "whatsapp_business_management",
    "instagram_manage_messages", "page_events", "pages_read_engagement",
    "pages_manage_metadata", "pages_read_user_content", "pages_manage_ads",
    "pages_manage_posts", "pages_manage_engagement", "whatsapp_business_messaging",
    "instagram_branded_content_brand", "instagram_branded_content_creator",
    "instagram_branded_content_ads_brand", "instagram_manage_events",
    "manage_app_solution"
];

// Facebook SDK Functions
export function initializeFacebookSDK() {
    if (typeof FB !== 'undefined') {
        FB.init(FACEBOOK_SDK_CONFIG);
    } else {
        console.error('Facebook SDK not loaded!');
    }
}

export async function loginWithFacebook() {
    initializeFacebookSDK();
    return new Promise((resolve, reject) => {
    FB.login(
        (response) => {
            if (response.authResponse) {
                const accessToken = response.authResponse.accessToken;
                resolve(accessToken || null);
            } else {
                console.log('User cancelled login or did not fully authorize.');
                resolve(null);
            }
            },
            { scope: FACEBOOK_PERMISSIONS.join(',') }
        );
        });
}



export async function sendAccessTokenToServer(accessToken) {
    try {
        const token = getUserToken();

        if (!token) {
            throw new Error("User token not found. Please login again.");
        }

        const response = await postRequest(
            API_ENDPOINTS.Facebook.authToken,
            { access_token: accessToken },
            token
        );

        if (response && response.status === 200 && response.data?.data) {
            return response.data.data; 
        } else {
            throw new Error('Invalid server response.');
        }

    } catch (error) {
        alert(handleApiError(error, 'فشل في إرسال رمز الدخول إلى الخادم'));
        return null; 
    }
}
