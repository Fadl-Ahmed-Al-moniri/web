
export const serverUrl = 'https://localhost:8000/';

export const loginUrl = `${serverUrl}/auth/login`;

export const signupUrl = `${serverUrl}/auth/login`;

export const getInfoDashbord = `${serverUrl}/post/get_info_dashbord/`;



export const API_ENDPOINTS = {
    Auth:{
        login  :`${serverUrl}/auth/login/`, 
        signup  :`${serverUrl}/auth/`, 
        passwordReset  :`${serverUrl}/password-reset/`, 
    },
    User:{
        createEmp:`${serverUrl}/emp/create/`,
        updateEmpAdv:`${serverUrl}/emp/update-advance/`,
        getEmp:`${serverUrl}/emp/get_emps/`,
        deleteEmp:`${serverUrl}emp/delete/`,
        activateEmp:`${serverUrl}/emp/activate/`,
        deactivateEmp:`${serverUrl}/emp/deactivate/`,
        roleList:`${serverUrl}/emp/roleList/`,
        getInfo:`${serverUrl}/emp/info/`,
        updateInfo:`${serverUrl}/emp/update/`,
    }
    ,
    Page:{
        dashbord : `${serverUrl}/post/get_info_dashbord/`,
        analyses : `${serverUrl}/engage/get_pages_info/`,
        getPages : `${serverUrl}/social-manager/get_pages/`,
    },
    Facebook: {
        authToken: `${serverUrl}/facebook/get_info/`,
        connect: `${serverUrl}/facebook/connect_to_account/`,
        getPages: `${serverUrl}/facebook-page/get_pages/`, 
        getInfoPage:`${serverUrl}/facebook-page/info_page/`,
        disconnect: `${serverUrl}/facebook-page/logout_from_page/`
    },
    Instagram: {
        getAuthorization: `${serverUrl}/instagram-professional/get_authorization_url/`,
        authorization: `${serverUrl}/instagram-professional/authorization_with_instagram/`,
        connect: `${serverUrl}/instagram-professional/save_info_account/`,
        getAccounts: `${serverUrl}/instagram-professional/get_accountes/`, 
        getInfoAccounts: `${serverUrl}/instagram-professional/refresh_account/`, 
        disconnect: `${serverUrl}/instagram-professional/disconnect_account/`, 

    },
    Post:{
        getPost:`${serverUrl}/post/get_multiple_pages_posts/`,
        publish:`${serverUrl}/post/publish/`,

    }
};









export const getFacebookPages = `${serverUrl}/facebook-page/get_pages/`;
export const getFacebookInfoPage = `${serverUrl}/facebook-page/info_page/`;
export const logoutFacebookPage = `${serverUrl}/facebook-page/logout_from_page/`;

export const getInstagramAccounts = `${serverUrl}/instagram-professional/get_accountes/`;
export const getInstagramInfoAccount = `${serverUrl}/instagram-professional/refresh_account/`;

export const disconnectInstagramAccount = `${serverUrl}//instagram-professional/disconnect_account/`;

