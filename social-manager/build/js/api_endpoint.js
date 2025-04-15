

export const API_ENDPOINTS = {
    Facebook: {
        accounts: 'https://localhost:8000/facebook-page/get_pages/',
        connect: 'https://localhost:8000/facebook/connect_to_account/',
        disconnectPage:'https://localhost:8000/facebook/logout_from_page/'
    },
    Instagram: {
        accounts: 'https://localhost:8000/instagram-professional/authorization_with_instagram/',
        connect: 'https://localhost:8000/instagram-professional/save_info_account/'
    }
  };