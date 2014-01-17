/**
 * Kicks Off SpamBox Checking.
 */
function ProcessSpamBox() {
  Logger.log("--ProcessSpamBox cleanup starting!");
  
  //Check to see that the Whitelist and SpamChecked labels exists
  //if not, create them
  Logger.log("--CheckIfWLLabelExists starting!");
  CheckIfLabelExists("Whitelist");
  CheckIfLabelExists("SpamChecked");
  
  //Check for any messages with the Whitelist Label, 
  //    Add emails to WL Database, 
  //    Remove Whitelist Label
  Logger.log("--CheckForWLEmail starting!");
  CheckForWLEmail();
  
  //-----------------------Todo----------------------------
  //Check for spambox total. 
  //If over threshold, stop processing, 
  //    check DB for notify flag and if present, stop
  //    if not present, send email to notify
  //    and flag DB that email has been sent
  //If under threshold, check to see if notify flag is set
  //    if so, remove it
  //    continue
  
  //Check messages for sender = whitelisted address,
  //    Move message to inbox,
  //    Adds the Whitelist Label
  Logger.log("--MoveWLMessagesToInbox starting!");
  MoveWLMessagesToInbox();
  
  //Delete known bad spam messages
  // Add more function calls here for more common terms - MoveBadSpamToTrash('Term');
  Logger.log("--MoveBadSpamToTrash starting!");
  MoveBadSpamToTrash('incoming fax');
  MoveBadSpamToTrash('Environmental');
  MoveBadSpamToTrash('weightloss');
  //MoveBadSpamToTrash('search term');
  
  Logger.log("--ProcessSpamBox complete!");
}



/**
 * Retrieves all spam threads with the label "whitelist"
 * Checks to see if the from:email exists in the DB
 * If not, adds it to the DB
 */
function CheckForWLEmail(){
  var threads = GmailApp.search('in:spam label:Whitelist');
  var label = GmailApp.getUserLabelByName("Whitelist");
  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    var strEmail = getShortEmail(messages[0].getFrom());
    var resultWL = whiteListIt(strEmail);
    Logger.log("Removing Whitelist Label");
    label.removeFromThread(threads[i]);
  }
}



/**
 * Retrieves all whitelisted spam threads,
 * moves them back to the Inbox,
 * adds the whitelist label
 */
function MoveWLMessagesToInbox() {
  var threads = GmailApp.getSpamThreads();  
  var label = GmailApp.getUserLabelByName("Whitelist");
  // Query DB for Whitelisted addresses
  var db = ScriptDb.getMyDb();
  var arrayDB = db.query({table: 'Whitelist'});
  //Convert DB Results to array
  var arrayWL = ConvertDBResultsToArray(arrayDB);
  //Log how many records found
  Logger.log(arrayWL.length + " WL addresses known.");
  for (var i = 0; i < threads.length; i++) {
    var emailAddress = getShortEmail(threads[i].getMessages()[0].getFrom());
    if (EmailMatch(emailAddress, arrayWL) > -1 ){
      Logger.log("Found One for " + emailAddress + " ... Moving to Inbox!");
      var messages = threads[i].moveToInbox();
      label.addToThread(threads[i]);
    }

  }
};



/**
 * Retrieves all spam threads matching passed in filter,
 * deletes any messages found
 */
function MoveBadSpamToTrash(strFilter) {
  if (strFilter == null)
    return; //var name = Browser.inputBox('Enter your name');
  // get all threads that match search criteria in Spambox
  var threads = GmailApp.search('in:spam ('+strFilter+')');
  Logger.log("Deleting " + threads.length + " messages from the Spambox that match: " + strFilter);
  for (var i = 0; i < threads.length; i++) {
    // get all messages in a given thread
    var messages = threads[i].moveToTrash();
  }
};




/*-----------------------------Support functions---------------------------------------*/


// call this to look for an email in an array
// if not found, will return -1
function EmailMatch(strValue, aryArray){
  var indexResult = aryArray.indexOf(strValue);
    return indexResult;
}


//Converts a DB result set to an array 
function ConvertDBResultsToArray(resultsDB){
  var resultsArray = [];
  while (resultsDB.hasNext()) {
    var result = resultsDB.next();
    resultsArray.push(result.email);
  }
  return resultsArray;
}


// add an email to the whiltelist db if not already present
function whiteListIt(strEmail){
  var db = ScriptDb.getMyDb();
  var resultsDB = db.query({table: 'Whitelist'});
   while (resultsDB.hasNext()) {
    var result = resultsDB.next();
     if (result.email == strEmail){
       Logger.log("email " + strEmail + " already exists!");
       //dumpDB();
       return false;
     }
   }
   var save = db.save({table:'Whitelist', email: strEmail})
   Logger.log("Adding " + strEmail + " to DB.");
   //dumpDB();
   return true;
}


//Parse long style Gmail email "EmailName<name@domain.com>" to short style "name@domain.com"
function getShortEmail(strEmail){
  return strEmail.substring(strEmail.indexOf('<')+1, strEmail.lastIndexOf('>'))
}


//Check to see that the Whitelist label exists
//if not, create it
function CheckIfLabelExists(strLabel){
 var label = GmailApp.getUserLabelByName(strLabel);
  if (null == label){
    Logger.log("Created " + GmailApp.createLabel(strLabel) + ": " + strFilter);
  }else{
    Logger.log(label.getName() + " label exists."); //logs MyLabel
  }
}



/*-----------------------------Diagnostic functions---------------------------------------*/


//Dump Whitelist DB
function dumpDB(){
    var db = ScriptDb.getMyDb();
  var resultsDB = db.query({table: 'Whitelist'});
    while (resultsDB.hasNext()) {
    var result = resultsDB.next();
    Logger.log(result.email);
  }
}

//Clear Whitelist DB
function clearDB(){
  var db = ScriptDb.getMyDb();
  var resultsDB = db.query({table: 'Whitelist'});
  while (resultsDB.hasNext()) {
    var result = resultsDB.next();
    db.removeById(result.getId());
  }
}

//Remove Entry from Whitelist DB
function removeFromDB(){
  var strEmail = '' //Email to remove
  var db = ScriptDb.getMyDb();
  var resultsDB = db.query({table: 'Whitelist'});
   while (resultsDB.hasNext()) {
    var result = resultsDB.next();
     if (result.email == strEmail){
       db.remove(result);
       Logger.log("Successfully removed email: " + strEmail);
       dumpDB();
       return true;
     }
   }
  Logger.log("Didn't find: " + strEmail);
  dumpDB();
  return false;
}

