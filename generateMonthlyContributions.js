/**
 * Generates contribution entries for all active members for the current month
 * with due date set to the 5th
 */
function generateMonthlyContributions() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var membersSheet = ss.getSheetByName('Members');
  var contributionsSheet = ss.getSheetByName('Contributions');
  var updateDeposits=ss.getSheetByName('Update Deposits')
  // Get all active members
  var membersData = membersSheet.getDataRange().getValues();
  var today = new Date();
  // Create due date (5th of current month)
  var dueDate = new Date(today.getFullYear(), today.getMonth(), 5);
  
  // If today is after the 5th, generate for next month
  if (today.getDate() > 5) {
    dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 5);
  }
  
  var dueDateFormatted = Utilities.formatDate(dueDate, Session.getScriptTimeZone(), 'dd-MMMM-yyyy');

  // Generate contribution entries for each active member
  var count = 0;
  
  for (var i = 1; i < membersData.length; i++) {
    var member = membersData[i];
    var status = member[5];
    var monthlyAmount = member[8];
    
    if (status === "Active" && monthlyAmount > 0) {
      // Generate unique contribution ID
      var contributionId = "CON-" + new Date().getTime() + "-" + i;
      
      // Add to contributions sheet
      contributionsSheet.appendRow([
        contributionId,       // ContributionID
        member[0],           // MemberID
        member[1],           // Member Name
        dueDateFormatted,             // Due Date
        monthlyAmount,       // Amount
        "Pending",           // Status
        "",                  // Notes
      ]);
      
      updateDeposits.appendRow([
        contributionId,
        member[1],
        dueDateFormatted,
        "Pending",])
      count++;
    }
  }
  updateDeposits.sort(3,false)
  
}
