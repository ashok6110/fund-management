function updateRepayments() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var updateSheet = ss.getSheetByName("Update Repayments"); // Admin updates payments here
    var repaymentSheet = ss.getSheetByName("Repayments"); // Main repayment tracking sheet
    var loanSheet = ss.getSheetByName("Loans"); // Loan tracking sheet
  
    if (!updateSheet || !repaymentSheet || !loanSheet) {
      Logger.log("One or more sheets not found!");
      return;
    }
  
    var updateData = updateSheet.getDataRange().getValues();
    var repaymentData = repaymentSheet.getDataRange().getValues();
    var loanData = loanSheet.getDataRange().getValues();
  
    var headers = updateData[0]; // Get header row
    var repaymentIdIndex = headers.indexOf("RepaymentID");
    var amountDueIndex = headers.indexOf("Amount Due");
    var lateFeeIndex = headers.indexOf("Late Fee");
    var statusIndex = headers.indexOf("Status");
  
    var updatedRows = [];
    var userEmail = Session.getActiveUser().getEmail(); // Get the admin's email
    var timestamp = new Date().toLocaleString();
  
    for (var i = 1; i < updateData.length; i++) {
      var row = updateData[i];
  
      if (row[statusIndex] === "Paid") {
        var repaymentId = row[repaymentIdIndex];
        var amountDue = row[amountDueIndex];
        var lateFee = row[lateFeeIndex];
        var totalPaid = amountDue + lateFee;
        var paymentDate = new Date(); // Capture current date as payment date
   
        // Find matching Repayment ID in Repayments sheet
        for (var j = 1; j < repaymentData.length; j++) {
          if (repaymentData[j][0] === repaymentId) { // Column A is RepaymentID
            repaymentSheet.getRange(j + 1, 6).setValue(amountDue); // Column E: Amount Due
            repaymentSheet.getRange(j + 1, 8).setValue(paymentDate); // Column F: Payment Date
            repaymentSheet.getRange(j + 1, 9).setValue(lateFee); // Column G: Late Fee
            repaymentSheet.getRange(j + 1, 7).setValue("Paid"); // Column H: Status
            repaymentSheet.getRange(j + 1, 10).setValue(totalPaid); // Column I: Total Paid
            repaymentSheet.getRange(j + 1, 11).setValue(`Updated on: ${timestamp} By: ${userEmail}`); // Column J: Notes (Stores admin email)
            updatedRows.push(i + 1);
            break;
          }
        }
  
        // Check if the Loan is fully repaid
        var loanData = loanSheet.getDataRange().getValues();
        var loanId = repaymentData[j][1]; // Loan ID is in column B of Repayments
        for (var k = 1; k < loanData.length; k++) {
          if (loanData[k][0] === loanId) { // Column A: Loan ID
            var amountRepaid = loanData[k][11]; // Column K: Amount Repaid (already present)
            var repaymentAmount = loanData[k][12]; // Column F: Repayment Amount (already present)
  
            if (amountRepaid >= repaymentAmount) {
              loanSheet.getRange(k + 1, 9).setValue("Completed"); // Column G: Status
            }
            break;
          }
        }
      }
    }
  
    // Delete updated rows from Update Repayments sheet (in reverse order to avoid shifting rows)
    updatedRows.reverse().forEach(row => updateSheet.deleteRow(row));
  }
  