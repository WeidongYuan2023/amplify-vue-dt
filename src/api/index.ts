// 检测当前环境和域名
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isApiGatewayDomain = window.location.hostname.includes('foxxusa.com');

// 根据部署环境选择 API 基础路径
const getApiBaseUrl = () => {
  if (isLocalhost) {
    // 本地开发环境，直接访问原始 API
    return "https://nexusdemo.foxxusa.com/ai-agent-service/api/s3";
  } else if (isApiGatewayDomain) {
    // 通过 API Gateway 访问，使用相对路径
    return "/ai-agent-service/api/s3";
  } else {
    // Amplify 环境，使用代理
    const CORS_PROXY = "https://corsproxy.io/?";
    //const apiOriginalUrl = "https://nexusdemo.foxxusa.com/ai-agent-service/api/s3";
    const  apiOriginalUrl = "https://cognitodemo.msoft2010.com/ai-agent-service/api/s3";
    //return `${CORS_PROXY}${encodeURIComponent(apiOriginalUrl)}`;
    return apiOriginalUrl;
  }
};

const baseUrl = getApiBaseUrl();

console.log("Environment:", { 
  isLocalhost, 
  isApiGatewayDomain,
  hostname: window.location.hostname,
  baseUrl
});

export const getRequest = (endpoint: string, id = "", type = "") => {
    const url =
      `${baseUrl}/${endpoint}` +
      (id ? `?id=${id}` : "") +
      (type ? `&type=${type}` : "");
    
    console.log("Requesting URL:", url);
    
    return fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Origin": window.location.origin
      },
    })
    .then((response) => {
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
  
      if (contentType?.includes("application/json")) {
        return response.json();
      } else if (contentType?.includes("model/gltf-binary")) {
        return response.arrayBuffer();
      } else if (contentType?.includes("image")) {
        return response.blob();
      } else {
        return response.arrayBuffer();
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
      throw error;
    });
};