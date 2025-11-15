// API Configuration
var API_URL = "https://api.fireberry.com/api/record";
var QUERY_API_URL = "https://api.fireberry.com/api/query";

// Get API Key - with fallback mechanism
function getApiKey() {
  try {
    // First try to get from Script Properties
    var apiKey = PropertiesService.getScriptProperties().getProperty("API_KEY");
    if (apiKey) {
      return apiKey;
    }
    
    // If not found in properties, use hardcoded value as fallback
    return "8a7dfba2-1e98-4771-9a99-9557ce5db9dd";
  } catch (error) {
    console.error("Error getting API_KEY:", error.message);
    // Return hardcoded value as fallback
    return "8a7dfba2-1e98-4771-9a99-9557ce5db9dd";
  }
}

// Generic API Functions
/*function getData(endpoint) {
  if (!API_KEY) {
    if (!initializeApiKey()) {
      throw new Error("Failed to initialize API_KEY");
    }
  }

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json', 
      tokenid: API_KEY
    },
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(API_URL + endpoint, options);
    var responseText = response.getContentText();
    
    // Log the response for debugging
    console.log('API Response for getData:', responseText);
    
    if (!responseText) {
      console.error('Empty response received from API in getData');
      return null;
    }
    
    var responseData = JSON.parse(responseText);
    if (!responseData || !responseData.data || !responseData.data["Record"]) {
      console.error('Invalid response structure in getData:', responseData);
      return null;
    }
    
    return responseData.data["Record"];
  } catch (error) {
    console.error('Error in getData:', error.message);
    return null;
  }
}*/

function makeQueryRequest(options) {
  // Get API key for this request
  var currentApiKey = getApiKey();

  // Ensure headers contain API_KEY and proper content type
  options.headers = {
    'tokenid': currentApiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  options.muteHttpExceptions = true;

  // Log the request details for debugging (without sensitive info)
  console.log('Making API request to:', QUERY_API_URL);
  console.log('Request payload:', options.payload);

  try {
    var response = UrlFetchApp.fetch(QUERY_API_URL, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    // Log response details
    console.log('API Response Code:', responseCode);
    
    if (responseCode !== 200) {
      console.error('API request failed with status code:', responseCode);
      return [];
    }
    
    if (!responseText) {
      console.error('Empty response received from API in query');
      return [];
    }
    
    try {
      var responseData = JSON.parse(responseText);
      if (!responseData || !responseData.data || !responseData.data["Data"]) {
        console.error('Invalid response structure in query');
        return [];
      }
      
      return responseData.data["Data"];
    } catch (parseError) {
      console.error('JSON parsing error:', parseError.message);
      return [];
    }
  } catch (fetchError) {
    console.error('API fetch error:', fetchError.message);
    return [];
  }
} 