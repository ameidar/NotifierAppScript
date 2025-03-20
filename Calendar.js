var CALENDAR_ID = 'info@hai.tech';

function calenderWeeklyCreator() {
  // Get meetings for the upcoming week
  var startDate = new Date();
  var endDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  endDate.setDate(endDate.getDate() + 7);
  var upcomingMeetings = getWeekMeetings(startDate, endDate);
  // console.log(upcomingMeetings)

  // Add each meeting to Google Calendar
  upcomingMeetings.forEach(function(meeting) {
    addMeetingToCalendar(meeting);
  });
}


function getWeekMeetings(startDate, endDate) {
  const options = {
    method: 'POST',
    headers: {
      tokenid: API_KEY,
      contentType: 'application/json',
      accept: 'application/json'
    },
    payload: JSON.stringify({
      objecttype: 6,
      page_size: 100,
      page_number: 1,
      fields: 'activityid, pcfsystemfield485name, scheduledstart, scheduledend, subject, location',
      query: `(scheduledstart >= ${startDate.toISOString().split('T')[0]}) AND (scheduledstart <= ${endDate.toISOString().split('T')[0]}) AND (pcfsystemfield542 != 4) AND (objectid is-not-null) AND (pcfsystemfield485 is-not-null)`
    }),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(QUERY_API_URL, options);
  var responseData = JSON.parse(response.getContentText());
  return responseData.data["Data"];
}


function testEventAdd() {
  var meeting = {
    "activityid": '2d972a19-ab4e-412d-9a47-25ca0447be77',
    "pcfsystemfield485name": 'ארטיום קרוניק',
    "scheduledstart": '2024-04-21T18:45:00',
    "scheduledend": '2024-04-21T19:30:00',
    "subject": 'אדיר - אסף דיין - 0546446467',
    "location": ''
  };
  addMeetingToCalendar(meeting);
}


function addMeetingToCalendar(meeting) {
  var startDate = new Date(meeting.scheduledstart);
  var endDate = new Date(meeting.scheduledend);

  var event = {
    summary: meeting.subject + ' - ' + meeting.pcfsystemfield485name,
    location: meeting.location, // Adjust as per your data structure
    description: 'Lecturer: ' + meeting.pcfsystemfield485name + '\nCourse URL: ' + meetingUrl(meeting),
    start: {
      dateTime: startDate.toISOString(),
      timeZone: "Asia/Jerusalem" // Replace with the actual timezone
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: "Asia/Jerusalem" // Replace with the actual timezone
    }
  };
  var calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  console.log(meeting.subject, startDate.toISOString(), endDate.toISOString());
  // calendar.createEvent(event.summary, new Date(event.start.dateTime), new Date(event.end.dateTime), {location: event.location, description: event.description});
}


function meetingUrl(meeting) {
  return "https://app.fireberry.com/app/record/6/" + meeting.activityid;
}

