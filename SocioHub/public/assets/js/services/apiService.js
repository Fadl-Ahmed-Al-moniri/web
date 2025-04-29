
// إعداد الهيدر المشترك
function getHeaders(token, isJson = true) {
  const headers = {
    ...(isJson && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  return headers;
}

// دالة عامة للـ GET
export async function getRequest(endpoint, token = null) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }
        const response = await fetch(`${endpoint}`, {
            method: "GET",
            
            headers: headers,
        });

    if (!response.ok) throw new Error(`GET Error: ${response.status}`);
    
    const result = await response.json(); 
    return { response:response,  status: response.status, data: result };
    
} catch (error) {
        console.error("GET Request Failed:", error);
        throw error;
}
}

export async function postRequest(url, data = {}, token = null, params = {}) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }

    // تركيب query parameters إذا وُجدت
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    const result = await response.json();   

    return { response, status: response.status, data: result };
}
