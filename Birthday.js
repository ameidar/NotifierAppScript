var LOGO_URL = "https://i.imgur.com/xyhnDEq.png";
var FRAME_URL = 'https://i.imgur.com/bZCwLbU.jpeg';
var ACCOUNT_ENDPOINT = "/1/";
//var QUERY_API_URL = "https://api.fireberry.com/api/query";
// API_KEY is defined in Code.js

function birthdayEmailSender() {
  try {
    // שולח כרטיס יום הולדת לילדים ומדריכים בעלי יום הולדת היום
    var lecturers = getLecturersBirthday(); // מדריכים שמסומנים כפעילים עם יום הולדת היום
    for(let i = 0; i < lecturers.length; i++)
      sendLecturersEmail(lecturers[i].name, lecturers[i].pcfsystemfield77);
    
    var registers = getRegistersBirthday(); // לקוחות רשומים עם יום הולדת לתלמיד היום
    for(let i = 0; i < registers.length; i++) {
      var email = getData(ACCOUNT_ENDPOINT + registers[i].accountid).emailaddress1;
      if(email)
        sendRegistersEmail(registers[i].pcfsystemfield204, email);
        console.log(registers[i].pcfsystemfield204, email);
    }
  } catch (error) {
    console.error("Error in birthdayEmailSender:", error.message);
  }
}

function testSend() {
  sendLecturersEmail("ברק", "bar14ak@gmail.com");
}


function sendLecturersEmail(name, email) {
  // שולח מייל למדריך
  // let image = DriveApp.getFileById(IMAGE_ID).getBlob().getAs("image/jpeg");
  // let emailImages = {"background": image};
  var htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Birthday Card</title>
      <style>
          body {
              margin: 0;
              padding: 0;
          }
          .container {
              width: 800px;
              height: 900px;
              margin: 0 auto;
          }
          .card {
              background: url(${FRAME_URL}) center / cover no-repeat #000000;
              padding: 20px;
              weight: 90%;
              height: 90%;            
          }

          .text-content {
              text-align: center;
              color: black;
              padding-top: 20%;
          }
          
          .highlight {
              color: red;
          }

          h {
            font-weight: bolder;
          }

          p {
            font-size: 20px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }

          img {
            width: 200px;
            height: auto;
          }
          
      </style>
  </head>
  <body>
      <div class="container">
          <div class="card">
              <div class="text-content">
                  <br>
                  <h1>שלום <span class="highlight">${name}</span></h1>
                  <p>!מזל טוב ליום ההולדת שלך<br>                  
                  ,אנחנו, בדרך ההייטק,
                  <br>
                  רוצים לאחל לך יום הולדת שמח
                  <br>
                  .בריאות אושר, והצלחה בכל
                  <br>
                  ,המשך להיות הכוח המניע
                  <br>
                  .שמביא את כולנו קדימה
                  <br>
                  .תזכור תמיד שאתה חלק חשוב ממשפחתנו
                  <br>
                  ,מאחלים לך שנה מדהימה
                  <br>
                  .מלאה בהצלחות, שמחה והתפתחות
                  <br><br>
                  </p>
                  <img src=${LOGO_URL} alt="Company Logo">
              </div>
          </div>
      </div>
  </body>
  </html>
  `;
  
  // Send the email
  GmailApp.sendEmail(email + "," + "hila@hai.tech", '!יום הולדת שמח', '', {
    htmlBody: htmlContent
  });
}



function sendRegistersEmail(name, email) {
  // שולח מייל להורים של התלמיד עם שם הילד
  // let image = DriveApp.getFileById(IMAGE_ID).getBlob().getAs("image/jpeg");
  // let emailImages = {"background": image};
  if(!name)
    name = "תלמיד/ה";
  var htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Birthday Card</title>
      <style>
          body {
              margin: 0;
              padding: 0;
          }
          .container {
              width: 800px;
              height: 900px;
              margin: 0 auto;
          }
          .card {
              background: url(${FRAME_URL}) center / cover no-repeat #000000;
              padding: 20px;
              weight: 90%;
              height: 90%;            
          }

          .text-content {
              text-align: center;
              color: black;
              padding-top: 20%;
          }
          
          .highlight {
              color: red;
          }

          h {
            font-weight: bolder;
          }

          p {
            font-size: 20px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }

          img {
            width: 200px;
            height: auto;
          }
          
      </style>
  </head>
  <body>
      <div class="container">
          <div class="card">
              <div class="text-content">
                  <h1>שלום <span class="highlight">${name}</span></h1>
                  <p>!מזל טוב ליום ההולדת שלך<br>
                  
                  ,אנחנו, בדרך ההייטק, רוצים לאחל לך בריאות אושר
                  <br>
                  .והצלחה לאן שלא תפנה
                  <br>
                  .מקווים שתהנה מיום הולדתך 
                  <br>
                  ומיתר השנה איתנו בדרך ההייטק
                  <br>
                  .שתמשיך ללמוד ולהתפתח בהנאה
                  <br>
                  !מאחלים לך יום הולדת שמח 
                  <br>
                  .ושנה מדהימה ומלאה בצמיחה 
                  <br><br>
                  !נתראה בשיעור הבא
                  <br>
                  </p>
                  <img src=${LOGO_URL} alt="Company Logo">
              </div>
          </div>
      </div>
  </body>
  </html>
  `;
  
  // Send the email
  GmailApp.sendEmail(email + "," + "hila@hai.tech", '!יום הולדת שמח', '', {
    htmlBody: htmlContent
  });
}




function getLecturersBirthday() {
  // מחזיר את המדריכים הפעילים שיש להם יום הולדת היום
  var today = new Date();
  var todayDatePart = formatDate(today);
  var options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      tokenid: API_KEY,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      objecttype: 1002,
      page_size: 20,
      page_number: 1,
      fields: 'name, pcfsystemfield249, pcfsystemfield77',
      query: '(pcfsystemfield547 = 1) AND (pcfsystemfield249 is-not-null)'
    }),
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(QUERY_API_URL, options);
    var responseText = response.getContentText();
    
    if (!responseText) {
      console.error('Empty response received from API in getLecturersBirthday');
      return [];
    }
    
    var responseData = JSON.parse(responseText);
    if (!responseData || !responseData.data || !responseData.data["Data"]) {
      console.error('Invalid response structure in getLecturersBirthday');
      return [];
    }
    
    return responseData.data["Data"].filter(function(lecturer) {
      if (!lecturer.pcfsystemfield249) {
        return false;
      }
      var dobDatePart = lecturer.pcfsystemfield249.split('T')[0];
      return dobDatePart.slice(-5) === todayDatePart;
    });
  } catch (error) {
    console.error('Error in getLecturersBirthday:', error.message);
    return [];
  }
}


function getRegistersBirthday() {
  // מחזיר את ההורים עם ילד רשום שיש לו יום הולדת היום
  var today = new Date();
  var todayDatePart = formatDate(today);
  var options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      tokenid: API_KEY,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      objecttype: 33,
      page_size: 500,
      page_number: 1,
      fields: 'pcfsystemfield204, pcfsystemfield298, accountid',
      query: '(pcfsystemfield298 is-not-null)'
    }),
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(QUERY_API_URL, options);
    var responseText = response.getContentText();
    
    if (!responseText) {
      console.error('Empty response received from API in getRegistersBirthday');
      return [];
    }
    
    var responseData = JSON.parse(responseText);
    if (!responseData || !responseData.data || !responseData.data["Data"]) {
      console.error('Invalid response structure in getRegistersBirthday');
      return [];
    }
    
    return responseData.data["Data"].filter(function(registery) {
      if (!registery.pcfsystemfield298) {
        return false;
      }
      var dobDatePart = registery.pcfsystemfield298.split('T')[0];
      return dobDatePart.slice(-5) === todayDatePart;
    });
  } catch (error) {
    console.error('Error in getRegistersBirthday:', error.message);
    return [];
  }
}


function formatDate(date) {
  // MM-DD מקבל אובייקט תאריך ומחזיר פורמט 
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
  return mm + '-' + dd;
}


function getStaticData() {
  const options = {
  method: 'GET',
  headers: {accept: 'application/json', tokenid: API_KEY}
  };

  var response = UrlFetchApp.fetch('https://api.fireberry.com/api/record/33/c2603733-1f0a-40d6-8a37-e506bae735d2', options);
  console.log(JSON.parse(response.getContentText()).data["Record"]);
  //Logger.log(JSON.stringify(JSON.parse(response.getContentText()), null, 2));
}

