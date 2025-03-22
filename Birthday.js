var LOGO_URL = "https://i.imgur.com/xyhnDEq.png";
var FRAME_URL = 'https://i.imgur.com/bZCwLbU.jpeg';
var ACCOUNT_ENDPOINT = "/1/";


function birthdayEmailSender() {
  // שולח כרטיס יום הולדת לילדים ומדריכים בעלי יום הולדת היום
  var lecturers = getLecturersBirthday(); // מדריכים שמסומנים כפעילים עם יום הולדת היום
  for(let i = 0; i < lecturers.length; i++)
    sendLecturersEmail(lecturers[i].name, lecturers[i].pcfsystemfield77);
    // console.log(lecturers[i].name, lecturers[i].pcfsystemfield77);
  var registers = getRegistersBirthday(); // לקוחות רשומים עם יום הולדת לתלמיד היום
  for(let i = 0; i < registers.length; i++) {
    var email = getData(ACCOUNT_ENDPOINT + registers[i].accountid).emailaddress1;
    if(email)
      sendRegistersEmail(registers[i].pcfsystemfield204, email);
      console.log(registers[i].pcfsystemfield204, email);
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
      tokenid: API_KEY,
      contentType: 'application/json',
      accept: 'application/json'
    },
    payload: JSON.stringify({
      objecttype: 1002,
      page_size: 20,
      page_number: 1,
      fields: 'name, pcfsystemfield249, pcfsystemfield77', // Include the field for date of birth
      query: '(pcfsystemfield547 = 1) AND (pcfsystemfield249 is-not-null)' // Filter by today's date
    }),
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(QUERY_API_URL, options);
    var responseText = response.getContentText();
    
    // Log the response for debugging
    console.log('API Response:', responseText);
    
    // Check if response is empty or invalid
    if (!responseText) {
      console.error('Empty response received from API');
      return [];
    }
    
    try {
      var responseData = JSON.parse(responseText);
      
      // Check if the response has the expected structure
      if (!responseData || !responseData.data || !responseData.data["Data"]) {
        console.error('Invalid response structure:', responseData);
        return [];
      }
      
      var lecturers = responseData.data["Data"].filter(function(lecturer) {
        // Check if lecturer has the required field
        if (!lecturer.pcfsystemfield249) {
          return false;
        }
        // לוקח את החלק של התאריך מיום ההולדת של מדריך
        var dobDatePart = lecturer.pcfsystemfield249.split('T')[0];
        // משווה את היום והחודש של היום ושל היום הולדת ומחזיר אם שווה
        return dobDatePart.slice(-5) === todayDatePart;
      });

      return lecturers;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError.message);
      console.error('Response text:', responseText);
      return [];
    }
  } catch (fetchError) {
    console.error('API fetch error:', fetchError.message);
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
      tokenid:  API_KEY,
      contentType: 'application/json',
      accept: 'application/json'
    },
    payload: JSON.stringify({
      objecttype: 33,
      page_size: 500,
      page_number: 1,
      fields: 'pcfsystemfield204, pcfsystemfield298, accountid', // Include the field for date of birth
      query: '(pcfsystemfield298 is-not-null)' // Filter by today's date
    }),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(QUERY_API_URL, options);
  var responseData = JSON.parse(response.getContentText());

  var registers = responseData.data["Data"].filter(function(registery) {
    // לוקח את החלק של התאריך מיום ההולדת של הילד
    var dobDatePart = registery.pcfsystemfield298.split('T')[0];
    // משווה את היום והחודש של היום ושל היום הולדת ומחזיר אם שווה
    return dobDatePart.slice(-5) === todayDatePart;
  });

  return registers;
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

