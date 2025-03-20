var FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd6kR0aLysGvW93KcklvuffB4xB39IVElAA8IohsDqBZPAojQ/viewform?usp=sf_link"
var FROM_DATE = '2023-09-01T00:00:00';


function sendBirthdayForm() {
  var allRegisters = getRegisters();
  var cache = {};
  for (let i=0; i < allRegisters.length; i++) {
    var email = getDataWithCache(ACCOUNT_ENDPOINT, allRegisters[i].accountid, cache).emailaddress1;
    if(email) {
      let subject = "טופס ימי הולדת";
      let message = `.דרך ההייטק - בית הספר למתכנתים צעירים\n\n
לקוח יקר\n\n
המערכת שלנו זיהתה שלא קיים ברשותנו תאריך יום ההולדת של ילדך .${allRegisters[i].pcfsystemfield204}\n
,לצורך שיפור השירות שלנו נשמח שתקדיש חצי דקה בשביל למלא את הטופס הבא\n
.שדרכו נוכל לעדכן את מערכתנו\n\n
${FORM_URL}\n\n
.תודה, והמשך יום טוב`;
      sendEmail(email, subject, message);
    }
  }
}



function getRegisters() {
  const allRegisters = [];
  let page_number = 1;

  while (true) {
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
        page_number: page_number,
        fields: 'pcfsystemfield204, accountid', // Include the field for date of birth
        query: `(pcfsystemfield298 is-null) AND (pcfsystemfield204 is-not-null) AND (accountid is-not-null) AND (statuscode = 8) AND (pcfsystemfield129 >= ${FROM_DATE})` // Filter by today's date
      }),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(QUERY_API_URL, options);
    const responseData = JSON.parse(response.getContentText());

    if (!responseData.data || responseData.data["Data"].length === 0) {
      // No more data to fetch, break the loop
      break;
    }

    allRegisters.push(...responseData.data["Data"]); // Accumulate all data
    page_number++; // Go to the next page
  }

  return allRegisters; // Return all accumulated meetings
  
}


function getDataWithCache(endpoint , account_id, cache) {
  if (cache && cache[account_id]) {
    // Return cached data if it's already fetched
    return cache[account_id];
  }
  data = getData(endpoint + account_id);
  cache[account_id] = data;
  return data;
}
