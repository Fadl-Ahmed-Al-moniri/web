
  // Function to redirect to the modal page with platform type
  function redirectToModal(platform) {
    
    localStorage.setItem('selectedPlatform', platform);
    if (platform == "Facebook"){
      sendAccessTokenToServer();
    }
    window.location.href = 'Acounts.html';
  }  

window.fbAsyncInit = function() {
  if (typeof FB !== 'undefined') {
      FB.init({
          appId: '478183998355970', 
          cookie: true,
          xfbml: true,
          version: 'v20.0'
      });
  } else {
      console.error('Facebook SDK not loaded!');
  }
};
var fields = ["email",
              "manage_fundraisers",
              "read_insights",
              "publish_video",
              "catalog_management",
              "pages_manage_cta",
              "pages_manage_instant_articles",
              "pages_show_list",
              "read_page_mailboxes",
              "ads_management",
              "ads_read",
              "business_management",
              "pages_messaging",
              "pages_messaging_subscriptions",
              "instagram_basic",
              "instagram_manage_comments",
              "instagram_manage_insights",
              "instagram_content_publish",
              "leads_retrieval",
              "whatsapp_business_management",
              "instagram_manage_messages",
              "page_events",
              "pages_read_engagement",
              "pages_manage_metadata",
              "pages_read_user_content",
              "pages_manage_ads",
              "pages_manage_posts",
              "pages_manage_engagement",
              "whatsapp_business_messaging",
              "instagram_branded_content_brand",
              "instagram_branded_content_creator",
              "instagram_branded_content_ads_brand",
              "instagram_manage_events",
              "manage_app_solution"];

function loginWithFacebook() {
      FB.login(function(response) {
          if (response.authResponse) {
              console.log('Welcome! Fetching your information.... ');
              

              const accessToken = response.authResponse.accessToken;
              console.log('Access Token:', accessToken);
  
              // Store the access token in localStorage
              localStorage.setItem('facebookAccessToken', accessToken);
  
              // Fetch user information
              FB.api('/me', {fields: 'id,name,email'}, function(response) {
                  sendAccessTokenToServer(accessToken);
              });
          } else {
              console.log('User cancelled login or did not fully authorize.');
          }
      }, {scope: fields.join(',')}); // Ensure fields are passed as a comma-separated string
  }
  
  function sendAccessTokenToServer() {

    const user_token =  localStorage.getItem('user_token');

    const url = 'https://localhost:8000/facebook/get_info/';
    const data = {
        facebook_user_access_token: "EAAGy5ZBNbZBgIBOxHMXZCQC54TUBHcNNNtzqn9i9FHY6VecrB4dv9B8GwDEY9al22lG1Ie7Fh66cce541YHHeLYc8kU7mV5qGChg7dJHEZBjl0K5aTfEssTb0O31ZACCIIwemCU9Eot7GaWLMb54Gh4b5jPVXIkfC3Ub1LRlsaUSfdko75nVvupk3"
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${user_token}`
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);

        localStorage.setItem('facebookData', JSON.stringify(data));
        window.location.href = 'Acounts.html'; 
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Failed to send access token.');
    });
}
