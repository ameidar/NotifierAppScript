function getEmailAddressesFromDoc() {
  const docId = '1vJQD6wLVSPpdAjiSvH8BWhYiMaYuu0zZi3Rf-aEN9cA'; // Replace with your Google Doc ID
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();
  const text = body.getText();
  
  // Regular expression to match email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailAddresses = text.match(emailRegex);
  
  if (emailAddresses) {
    // Remove duplicate email addresses
    const uniqueEmailAddresses = Array.from(new Set(emailAddresses));

    // Log each email address or perform any other action
    uniqueEmailAddresses.forEach(email => {
      let subject = "תקלה במערכת האוטומטית";
  let message = `.דרך ההייטק - בית הספר למתכנתים צעירים\n\n
לקוח יקר, 
.עקב תקלה במערכת האוטומטית נשלחו היום בבוקר מיילים שגויים\n\n
.מתנצלים על חוסר הנוחות
.המשך יום טוב`;
  sendEmail(email, subject, message);
      // You can add more actions here, e.g., sending an email
      // sendEmailToUser(email);
    });

    return uniqueEmailAddresses;
  } else {
    Logger.log("No email addresses found in the document.");
    return [];
  }
}