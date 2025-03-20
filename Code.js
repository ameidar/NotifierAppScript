var API_URL = "https://api.fireberry.com/api/record"; // שים לב, זו כתובת בדוגמה בלבד
var QUERY_API_URL = "https://api.fireberry.com/api/query"; // query כתובת לשאילתות 
var MEETING_ENDPOINT = "/6/";
var COURSE_ENDPOINT = "/1000/";
var WORKER_ENDPOINT = "/1002/";
var ACCOUNT_ENDPOINT = "/1/";
var REGISTER_ENDPOINT = "/33/";

const API_KEY = PropertiesService.getScriptProperties().getProperty("API_KEY");


var FEEDBACK_FORM_URL = "https://script.google.com/macros/s/AKfycby3XQqUjFLd7NaHaor7ia-ceYg5-ySx3dpj9VZKn87if4z0o8TamvFtbzFqnK5TIgdA/exec?courseId=";


function testUrl() {
  var course_id = "cb8e08b0-126b-4dcd-8b2b-ba61a27c0817";
  var course_name = "אורון - טל גולדשטיין 0502468440";
  var kid_name = "אורון";
  var encodedCourseName = encodeURIComponent(course_name);
  var encodedStudentName = encodeURIComponent(kid_name);
  var url = FEEDBACK_FORM_URL + course_id + "&courseName=" + encodedCourseName + "&studentName=" + encodedStudentName;
  console.log(url);
  
}


function main() {
  // מטפל בכל הקורסים של שצריכים להתקיים היום
  var today = new Date();
  //var today = new Date("2025-03-20T08:00:00");
  var today_meetings = getMeetings(today);    // מחזיר פגישות שמתקיימות היום ואת זיהוי הקורסים שלהם (id)
  for (let i=0; i < today_meetings.length; i++) {
    if (today_meetings[i].statuscode == ""){
      var course = getData(COURSE_ENDPOINT + today_meetings[i].objectid);   // מחזיר את המחזור של הפגישה
      var lacturer = getData(WORKER_ENDPOINT + today_meetings[i].pcfsystemfield485);  // מחזיר את פרטי העובד
      if (today.getHours() === 8) {
      // יוצר ושולח מייל תזכורת למדריכים על קורס שיש להם היום
        console.log("תזכורת נשלחת ל:" + lacturer.name)
        todaysLecturerRemainer(course, today_meetings[i], lacturer);            
      }

      // אם הטריגר רץ בשעה 10:50 הוא ישלח לכל הקורסים שבשעה 12 ומשהו
      if (today.getHours()+2 ==  today_meetings[i].scheduledstart.split("T")[1].slice(0, 2)) {
        var registers = getTodayRegisters(today_meetings[i].objectid);   // מחזיר רשימה של כל הרשומים של הקורס
        if (registers[0] != null)
          todaysParentRemainder(course, today_meetings[i], lacturer, registers);
      }
    }
    // לכל השיעורים שהתקיימו בשעה שעברה שולח מייל עם טופס חוות הדעת להורה
    else if((today_meetings[i].statuscode == "התקיימה") && (today.getHours()-1 ==  today_meetings[i].scheduledend.split("T")[1].slice(0, 2))) {
      var course = getData(COURSE_ENDPOINT + today_meetings[i].objectid);
      var registers = getTodayRegisters(today_meetings[i].objectid);
      if (registers[0] != null) {
        lessonFeedbackSender(course, today_meetings[i], registers);
      }

    }
  }

  // מטפל בכל הקורסים שהתקיימו אתמול
  if (today.getHours() === 8) {
    var yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    var yesterday_meetings = getMeetings(yesterday);    // מחזיר פגישות שהתקיימו אתמול ואת זיהוי הקורסים שלהם (id)
    for (let i=0; i < yesterday_meetings.length; i++) {
      var course = getData(COURSE_ENDPOINT + yesterday_meetings[i].objectid);
      var lacturer = getData(WORKER_ENDPOINT + yesterday_meetings[i].pcfsystemfield485);
      if (yesterday_meetings[i].statuscode == "")
        noStatusFillRemainder(course, yesterday_meetings[i], lacturer);   //  שולח התראה למדריך ולהילה שלא סומן סטטוס לפגישה
      else if (yesterday_meetings[i].statuscode == "התקיימה")
        checkPresenceFill(course, yesterday_meetings[i], lacturer);   //  שולח התראה למדריך ולהילה שבקורס שהתקיים לא סומנה נוכחות לילד/ים
      // else if (yesterday_meetings[i].statuscode == "נדחתה")
        
    }
  }
}


function todaysLecturerRemainer(course, meeting, lacturer) {
  // בדיקה אם המחזור פעיל (סטטוס 3) והוספת לוג למעקב
  console.log(`בודק מחזור: ${course.name}, סטטוס: ${course.pcfsystemfield37}, לינק למחזור: https://app.fireberry.com/app/record/1000/${course.customobject1000id}`);
  
  if (course.pcfsystemfield37 !== 3) {
    console.log("המחזור אינו פעיל, לא נשלחת תזכורת למדריך.");
    return;
  }

  var lecturer_name = meeting.pcfsystemfield485name;
  var meeting_time = meeting.scheduledstart.split("T")[1].slice(0, 5);
  var course_name = course.name;
  var meetings_left = course.pcfsystemfield233 ? course.pcfsystemfield233 : "אין נתונים";
  var meeting_url = "https://app.fireberry.com/app/record/6/" + meeting.activityid;
  var lecturer_email = lacturer.pcfsystemfield77;

  // בדיקה אם יש לינק לזום חד פעמי, אם אין – נלקח הלינק הכללי של הקורס
  var zoom_url = meeting.pcfsystemfield555 ? meeting.pcfsystemfield555 : course.pcfsystemfield235;
  var zoom_code = meeting.pcfsystemfield558 ? meeting.pcfsystemfield558 : course.pcfsystemfield272;
  var isZoomLesson = !!zoom_url;  // אם יש לינק כלשהו לזום

  let subject = `📅 תזכורת: שיעור מתוכנן להיום בשעה ${meeting_time}`;

  let htmlMessage = `
    <div style="direction: rtl; font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="text-align: center; color: #0073e6;">📢 תזכורת למדריך</h2>
      <p>שלום <b>${lecturer_name}</b>,</p>
      <p>רצינו להזכיר לך שהיום בשעה <b>${meeting_time}</b> יש לך שיעור.</p>
      <p><b>📌 שם הקורס:</b> ${course_name}</p>
      <p><b>🔢 מספר השיעורים שנותרו:</b> ${meetings_left}</p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${meeting_url}" target="_blank" style="background-color: #28a745; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">🔗 קישור לפגישה ב-Fireberry</a>
      </div>
      ${isZoomLesson ? `
      <div style="text-align: center; margin-top: 20px;">
        <a href="${zoom_url}" target="_blank" style="background-color: #0073e6; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">🔗 כניסה לזום</a>
      </div>
      <p><b>🔑 קוד מנהל:</b> ${zoom_code}</p>
      ` : ""}
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #777; text-align: center;">
        דרך ההייטק - בית הספר למתכנתים צעירים<br>
        <a href="mailto:info@hai.tech" style="color: #0073e6; text-decoration: none;">info@hai.tech</a>
      </p>
    </div>
  `;

  sendEmail(lecturer_email, subject, htmlMessage);
}






function noStatusFillRemainder(course, meeting, lacturer) {
  // מביא את כל המידע הדרוש לתזכורת
  var lecturer_name = meeting.pcfsystemfield485name;
  var course_name = course.name;
  var meeting_url = "https://app.fireberry.com/app/record/6/" + meeting.activityid;
  var lecturer_email = lacturer.pcfsystemfield77;

  // יוצר ושולח מייל
  let subject = `המדריך ${lecturer_name} שכח למלא את הדוח אתמול`;
  let message = `דרך ההייטק - בית הספר למתכנתים צעירים.\n\nהמדריך ${lecturer_name}. לא מילא את הפרטים של השיעור של הקורס:\n${course_name}\n קישור לשיעור: \n${meeting_url}\n\nלא לשכוח למלא נוכחות אם קיימת`;

  sendEmail(lecturer_email + "," + "ami@hai.tech", subject, message);
}


function todaysParentRemainder(course, meeting, lacturer, registers) {
  // מביא את כל המידע הדרוש לתזכורת
  console.log(course.pcfsystemfield37);

  if (course.pcfsystemfield37 !== "3") {
    console.log("המחזור אינו פעיל, לא נשלחת תזכורת להורים.");
    return; // אם המחזור אינו פעיל, לא ממשיך לשלוח תזכורות
  }
  var lecturer_name = meeting.pcfsystemfield485name;
  var meeting_time = meeting.scheduledstart.split("T")[1].slice(0, 5);
  var course_name = course.name;
  var zoom_url = meeting.pcfsystemfield555 ? meeting.pcfsystemfield555 : course.pcfsystemfield235;
  var zoom_code = meeting.pcfsystemfield558 ? meeting.pcfsystemfield558 : course.pcfsystemfield272;
  var isZoomLesson = !!zoom_url;  // Check if there is any Zoom link
  var lecturer_phone = lacturer.pcfsystemfield75;
  var meetings_left = course.pcfsystemfield233; // מספר השיעורים שנותרו לסיום הקורס
  for (let i=0; i < registers.length; i++) {
    var kid_name = registers[i].pcfsystemfield204;
    var parent_name = registers[i].accountname;
    var parent_email = getData(ACCOUNT_ENDPOINT + registers[i].accountid).emailaddress1;
    console.log(lecturer_name, lecturer_phone, meeting_time, course_name, zoom_url, kid_name, parent_name, parent_email);

    // יוצר ושולח מייל
    if (parent_email != null) {
      let subject = `תזכורת עבור קורס תכנות ל${kid_name}`;
      // Create the message body
      let message = `דרך ההייטק - בית הספר למתכנתים צעירים.\n\nשלום ${parent_name}.\n\nרצינו להזכיר לך שהיום בשעה ${meeting_time} יש ל${kid_name} שיעור בקורס:\n${course_name}\n\nשם המדריך: ${lecturer_name}\nטלפון של המדריך: ${lecturer_phone}`;
      if (zoom_url !== null) {
        message += `\n\nקישור לשיעור: \n${zoom_url}`;
        if (isZoomLesson && zoom_code) {
          message += `\n\nקוד מנהל: ${zoom_code}`;
        }
      }
      message += `\n\nלידיעתך, למחזור זה נותרו עוד ${meetings_left} שיעורים.`; // הוספת מספר השיעורים הנותרים
      message += "\n(הקישור נמצא גם בתאור קבוצת הוואטסאפ)";

      sendEmail(parent_email, subject, message);
    }
  }
}

function checkpres() {
  console.log(getPresences("a994b31c-f5f2-4a43-87ee-efa6c464af6d"));
  console.log(getTodayRegisters("b72e5de2-415d-4882-b9aa-4ac53dfaa584"));
  sendFeedbackForm("בדיקה", "b72e5de2-415d-4882-b9aa-4ac53dfaa584", "bar14ak@gmail.com")
}

function checkPresenceFill(course, meeting, lacturer) {
  var presents = getPresences(meeting.activityid);
  var registers = getTodayRegisters(course.customobject1000id);

  if (registers.length <= 2) {
    console.log("מדובר בקורס עם 2 נרשמים או פחות, לא נשלחת התראה.");
    return;
  }
  
  if (presents[0] != null) {
    var course_name = course.name;
    var lecturer_email = lacturer.pcfsystemfield77;
    var lecturer_name = meeting.pcfsystemfield485name;
    var meeting_url = "https://app.fireberry.com/app/record/6/" + meeting.activityid;
    var previous_meeting_absences = getPreviousMeesings(course.customobject1000id);

    for (let i = 0; i < presents.length; i++) {
      var registry = getData(REGISTER_ENDPOINT + presents[i].pcfsystemfield505);
      var kid_name = registry.pcfsystemfield204;

      if (presents[i].pcfsystemfield503 == "לא") {
        var parent_phone = getData(ACCOUNT_ENDPOINT + registry.accountid).telephone1;

        let subject = `התראה על חיסור של ${kid_name}`;
        let message = `היי הילה,\n${kid_name} תלמיד של ${lecturer_name} ממחזור ${course_name}\nלא היה נוכח אתמול בשיעור.\nהודעה נשלחה גם למדריך.\nנא ליצור קשר עם ההורה בטלפון: ${parent_phone}\nקישור הפגישה: ${meeting_url}`;
        sendEmail("ami@hai.tech", subject, message);

        message = `היי ${lecturer_name},\n${kid_name} תלמיד שלך ממחזור ${course_name}\nלא היה נוכח אתמול בשיעור.\nנא ליצור קשר עם ההורה בטלפון: ${parent_phone}\nקישור הפגישה: ${meeting_url}`;
        sendEmail(lecturer_email, subject, message);
        
        if (previous_meeting_absences) {
          var didnt_attended_last_meeting = previous_meeting_absences.some(p => p.pcfsystemfield505 === presents[i].pcfsystemfield505);
          if (didnt_attended_last_meeting) {
            let subject = `התראה על חיסור שני ברציפות של ${kid_name}`;
            let message = `היי,\n${kid_name} תלמיד של ${lecturer_name} ממחזור ${course_name}\nלא היה נוכח פעמיים ברציפות בשיעור.\nנא ליצור קשר עם ההורה בטלפון: ${parent_phone}\nקישור הפגישה: ${meeting_url}`;
            sendEmail("ami@hai.tech", subject, message);
          }
        }
      } else if (presents[i].pcfsystemfield503 == "") {
        let subject = `התראה על אי מילוי נוכחות ל ${kid_name}`;
        let message = `היי הילה,\nלתלמיד ${kid_name} של ${lecturer_name} ממחזור ${course_name}\nלא מולאה נוכחות בשיעור שהתקיים אתמול.\nהודעה נשלחה גם למדריך.\nקישור הפגישה: ${meeting_url}`;
        sendEmail("ami@hai.tech", subject, message);

        message = `היי ${lecturer_name},\nלתלמיד שלך ${kid_name} ממחזור ${course_name}\nלא מולאה נוכחות אתמול.\nנא למלא לצורך מעקב כמו שצריך.\nקישור הפגישה: ${meeting_url}`;
        sendEmail(lecturer_email, subject, message);
      }
    }
  }
}


function lessonFeedbackSender(course, meeting, registers) {
  var presents = getPresences(meeting.activityid);
  if (presents[0] != null) {
    presents = presents.filter(a => a.pcfsystemfield503 == "כן");
    if (presents[0] != null) {
      for (let i = 0; i < presents.length; i++) {
        var course_name = course.name;
        var course_id = course.customobject1000id;
        var meeting_id = meeting.activityid;
        var register = registers.find(obj => obj.accountproductid === presents[i].pcfsystemfield505);
        var kid_name = register.pcfsystemfield204;
        var parent_email = getData(ACCOUNT_ENDPOINT + register.accountid).emailaddress1;
        if (parent_email != null) {
          sendFeedbackForm(course_name, course_id, meeting_id, kid_name, parent_email);
        }
      }
    }
  } else {
    for (let i = 0; i < registers.length; i++) {
      var parent_email = getData(ACCOUNT_ENDPOINT + registers[i].accountid).emailaddress1;
      var kid_name = registers[i].pcfsystemfield204;
      var course_id = course.customobject1000id;
      var meeting_id = meeting.activityid;
      if (parent_email != null) {
        sendFeedbackForm("הפרטי", course_id, meeting_id, kid_name, parent_email);
      }
    }
  }
}



function sendFeedbackForm(course_name, course_id, meeting_id, kid_name, email) {
  course_name = course_name.trim();
  kid_name = kid_name.trim();
  var encodedCourseName = encodeURIComponent(course_name);
  var encodedStudentName = encodeURIComponent(kid_name);
  var url = FEEDBACK_FORM_URL + course_id + "&meetingId=" + meeting_id + "&courseName=" + encodedCourseName + "&studentName=" + encodedStudentName;

  let subject = "📢 חוות דעת על השיעור שהתקיים היום";

  let message = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; text-align: center;">
      <h2 style="color: #0073e6;">📢 נשמח לקבל את חוות דעתך!</h2>
      <p>שלום,</p>
      <p>נשמח לשמוע ממך על חווית השיעור של <b>${kid_name}</b> היום בקורס <b>${course_name}</b>. המשוב שלך חשוב לנו ומשפר את חוויית הלמידה!</p>
      <div style="margin: 20px;">
        <a href="${url}" target="_blank" style="background-color: #28a745; color: white; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-weight: bold; display: inline-block;">📋 למילוי המשוב</a>
      </div>
      <p style="font-size: 12px; color: #777;">תודה רבה על זמנך!<br>דרך ההייטק - בית הספר למתכנתים צעירים</p>
    </div>
  `;

  // שליחת האימייל
  sendEmail(email, subject, message);
  console.log("sent feedback form to " + email + " url " + url);
}



function getPreviousMeesings(course_id){
  var meetings = getOccurredMeetingsOfCourse(course_id);
  if (meetings.length > 1) {
    meetings.sort((a, b) => new Date(a.scheduledstart) - new Date(b.scheduledstart));
    var last_meeting = meetings[meetings.length - 2];
    var presents = getPresences(last_meeting.activityid);
    if (presents[0] != null) {
      presents = presents.filter(a => a.pcfsystemfield503 == "לא");
      if (presents[0] != null)
        return presents;
    }
  }
  return null;
}


function testings() {  

  var meetings = getOccurredMeetingsOfCourse("b72e5de2-415d-4882-b9aa-4ac53dfaa584");
  meetings.sort((a, b) => new Date(a.scheduledstart) - new Date(b.scheduledstart));
  var last_meeting = meetings[meetings.length - 1];
  var presents = getPresences(last_meeting.activityid);
  console.log(last_meeting);
  if (presents[0] != null) {
    presents = presents.filter(a => a.pcfsystemfield503 == "לא");
    var didnt_attended_last_meeting = presents.some(p => p.pcfsystemfield505 === "9a2bc80a-350f-4468-9372-ecd63cb88391");
    if (didnt_attended_last_meeting)
      console.log("yes");
      let subject = `התראה על אי מילוי נוכחות ל`;
        let message = "hjkhjk"

        message = `ghjghj`;
        sendEmail("bar14ak@gmail.com", subject, message);
  }

}


function sendEmail(email, subject, message) {
  try {
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
        <h2 style="text-align: center; color: #0073e6;">${subject}</h2>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">
          דרך ההייטק - בית הספר למתכנתים צעירים<br>
          <a href="mailto:info@hai.tech" style="color: #0073e6; text-decoration: none;">info@hai.tech</a>
        </p>
      </div>
    `;

    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlMessage
    });

  } catch (err) {
    Logger.log("Email failed to send to: " + email + " with error: " + err);
  }
}


function getOccurredMeetingsOfCourse(course_id) {
  var options = {
    method: 'POST',
    headers: {
      tokenid:  API_KEY,
      contentType: 'application/json',
      accept: 'application/json'
    },
    payload: JSON.stringify({
    objecttype: 6,
    page_size: 50,
    page_number: 1,
    fields: 'activityid, scheduledstart, scheduledend',
    query: '(objectid = ' + course_id + ") AND (statuscode = 3)"
    }),
    muteHttpExceptions: true // כדי למנוע זריקת שגיאות על ידי Apps Script
  };
  
  var response = UrlFetchApp.fetch(QUERY_API_URL, options);
  var responseData = JSON.parse(response.getContentText());
  return responseData.data["Data"];
}



function getMeetings(date) {
  //  מחזיר את כל הפגישות של תאריך שהם שיעורים
  const date_str = date.toISOString().split('T')[0];
  var options = {
    method: 'POST',
    headers: {
      tokenid:  API_KEY,
      contentType: 'application/json',
      accept: 'application/json'
    },
    payload: JSON.stringify({
    objecttype: 6,
    page_size: 100,
    page_number: 1,
    fields: 'activityid, objectid, pcfsystemfield485, pcfsystemfield485name,pcfsystemfield555, pcfsystemfield558,scheduledstart, scheduledend, statuscode',
    query: '(scheduledstart = ' + date_str + ') AND (pcfsystemfield542 != 4) AND (objectid is-not-null) AND (pcfsystemfield485 is-not-null)'
    }),
    muteHttpExceptions: true // כדי למנוע זריקת שגיאות על ידי Apps Script
  };
  
  var response = UrlFetchApp.fetch(QUERY_API_URL, options);
  var responseData = JSON.parse(response.getContentText());
  return responseData.data["Data"];
}


function getTodayRegisters(course_id) {
  //  מחזיר את הרשומים לקורס ספציפי
  var options = {
    method: 'POST',
    headers: {
      tokenid:  API_KEY,
      contentType: 'application/json',
      accept: 'application/json'
    },
    payload: JSON.stringify({
    objecttype: 33,
    page_size: 20,
    page_number: 1,
    fields: 'accountname, pcfsystemfield204, accountid, accountproductid',
    query: '(pcfsystemfield53 = ' + course_id + ") AND (accountid is-not-null) AND (statuscode = " + "8" + ")" // קוד 8 זה רשום
    }),
    muteHttpExceptions: true // כדי למנוע זריקת שגיאות על ידי Apps Script
  };
  
  var response = UrlFetchApp.fetch(QUERY_API_URL, options);
  var responseData = JSON.parse(response.getContentText());
  return responseData.data["Data"];
}


function getPresences(meeting_id) {
  var options = {
    method: 'POST',
    headers: {
      tokenid:  API_KEY,
      contentType: 'application/json',
      accept: 'application/json'
    },
    payload: JSON.stringify({
    objecttype: 1010,
    page_size: 20,
    page_number: 1,
    fields: 'pcfsystemfield505, pcfsystemfield503',
    query: '(pcfsystemfield514 = ' + meeting_id + ") AND (pcfsystemfield505 is-not-null)"
    }),
    muteHttpExceptions: true // כדי למנוע זריקת שגיאות על ידי Apps Script
  };
  
  var response = UrlFetchApp.fetch(QUERY_API_URL, options);
  var responseData = JSON.parse(response.getContentText());
  return responseData.data["Data"];
}


function getData(endpoint) {
  const options = {
  method: 'GET',
  headers: {accept: 'application/json', tokenid: API_KEY}
  };

  var response = UrlFetchApp.fetch('https://api.fireberry.com/api/record' + endpoint, options);
  //console.log(JSON.parse(response.getContentText()).data["Record"]);
  return JSON.parse(response.getContentText()).data["Record"];
  //Logger.log(JSON.stringify(JSON.parse(response.getContentText()), null, 2));
}

// pcfsystemfield485 - teacher id
// scheduledstart: '2024-03-31T17:00:00'

// 1010  { createdby: 'ef6f2233-4e4c-433a-9812-526baf6a87ae',
//       pcfsystemfield515: null,
//       name: 'נוכחות בשיעור',
//       modifiedby: 'ef6f2233-4e4c-433a-9812-526baf6a87ae',
//       customobject1010id: '19a6d15c-ff6d-43e9-84ce-5122df1777a7',  // self id
//       pcfsystemfield503: null, // 1 for yes, 2 for no - נוכחות
//       ownerid: 'ef6f2233-4e4c-433a-9812-526baf6a87ae',
//       pcfsystemfield511: '9fa1a771-6e4c-4c64-8812-bbc06e33423b', // course id
//       pcfsystemfield514: 'd437afa7-7ca7-4959-815a-83806892761c', // meeting id
//       modifiedon: '2024-04-09T14:48:22',
//       createdon: '2024-04-09T14:48:22',
//       pcfsystemfield505: 'dd6fc083-2390-4f68-b452-dc07a8dc5f67', // אובייקט הרשמה
//       createdbyname: 'ami דרך ההיי.טק בע״מ',
//       modifiedbyname: 'ami דרך ההיי.טק בע״מ',
//       owneridname: 'ami דרך ההיי.טק בע״מ',
//       pcfsystemfield511name: 'תכנות משחקי רובלוקס 1511 - גילאי 8-10',
//       pcfsystemfield514name: 'תכנות משחקי רובלוקס 1511 - גילאי 8-10',
//       pcfsystemfield505name: 'קורס כללי' 
//       }