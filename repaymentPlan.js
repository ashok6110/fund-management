function generateRepaymentPlan() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var loanSheet = ss.getSheetByName("Loans"); // Change if needed
    var repaymentSheet = ss.getSheetByName("Repayments"); // Change if needed
    var updateRepaymentSheet = ss.getSheetByName("Update Repayments");
    
    var loanData = loanSheet.getDataRange().getValues();
    var repaymentData = repaymentSheet.getDataRange().getValues();
    var loanIdCol = 1;       // Column A: Loan ID
    var memberIdCol = 3;     // Column B: Member ID (contains formula in Loan Sheet)
    var memberNameCol=4;
    var statusCol = 9;       // Column H: Status
    var approvalDateCol = 10; // Column I: Approval Date
    var emiCol = 11;         // Column J: EMI
    var amountRepaidCol = 12; // Column F: Amount Repaid
    var repaymentAmountCol = 13; // Column G: Repayment Amount
  
    var today = new Date();
    var currentMonth = today.getMonth();
    var currentYear = today.getFullYear();
  
    // Get existing repayment records to check for duplicates
    var existingRepayments = new Set();
    for (var i = 1; i < repaymentData.length; i++) {
      var loanId = repaymentData[i][1]; // Loan ID is in Column B
      var dueDate = new Date(repaymentData[i][4]); // Due Date is in Column D
      if (dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear) {
        existingRepayments.add(loanId);
      }
    }
    
    for (var i = 1; i < loanData.length; i++) {
      var loanId = loanData[i][loanIdCol - 1];
      var memberId = loanData[i][memberIdCol - 1]; // Copy value, not formula
      var memberName=loanData[i][memberNameCol-1];
      var status = loanData[i][statusCol - 1];
      var approvalDate = loanData[i][approvalDateCol - 1];
      var emiAmount = loanData[i][emiCol - 1];
      var amountRepaid = loanData[i][amountRepaidCol - 1];
      var repaymentAmount = loanData[i][repaymentAmountCol - 1];
      // Skip if the loan is not "Active" or already fully repaid
      if (status !== "Active" || amountRepaid >= repaymentAmount) continue;
      // Skip if repayment for this loan already exists for the current month
      if (existingRepayments.has(loanId)) continue;
      // Calculate next due date (same day as approval date but in the current month)
      var today = new Date();
      var dueDate = new Date(today.getFullYear(), today.getMonth(), approvalDate.getDate());
      // Generate a unique Repayment ID
      var repaymentID = "RP-" + loanId + "-" + new Date().getTime();
      // Append the new repayment entry
      repaymentSheet.appendRow([
        repaymentID,  // Repayment ID
        loanId,       // Loan ID
        memberId,     // Member ID (copied as value)
        memberName,
        dueDate,      // Due Date
        emiAmount,    // Amount Due (EMI)
        "Pending"     // Status
      ])
      
        updateRepaymentSheet.appendRow([
        repaymentID,  // Repayment ID
        memberName,
        dueDate,      // Due Date
        emiAmount,    // Amount Due (EMI)
        '',
        "Pending"     // Status
      ]);
    }
  }
  