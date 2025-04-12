function onFormSubmission(e) {
    if (!e || !e.values) {
      Logger.log("Error: No event data received.");
      return;
    }
  
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var loanSheet = ss.getSheetByName("Loans");
    var dashboardSheet = ss.getSheetByName("Dashboard");
  
    var formResponses = e.values;
    
    // Identify if submission is from Loan Approval Form or Approval Form
    var firstColumn = formResponses[1]; // Loan ID or Name
    var isApprovalForm = firstColumn.startsWith("LOAN-"); // Loan ID means it's from the Approval Form
  
    if (!isApprovalForm) {
      processLoanApprovalForm(loanSheet, dashboardSheet, formResponses);
    } else {
      processApprovalForm(loanSheet, formResponses);
    }
  }
  
  // 📌 Function to Process Loan Approval Form
  function processLoanApprovalForm(loanSheet, dashboardSheet, formResponses) {
    var applicationDate=formResponses[0] || "01-01-1900";
    var memberID=""
    var name = formResponses[2] || "Unknown";  // Name
    var purpose = formResponses[3] || "Not Specified"; // Purpose of Loan
    var loanAmount = formResponses[4] || 0; // Loan Amount
    var interestRate='';
    var term = formResponses[5] || 0; // Loan Term
    var loanID = "LOAN-" + new Date().getTime(); // Unique Loan ID
  
    var approvers = dashboardSheet.getRange("A2:A").getValues().flat().filter(String);
    var availableBalance = dashboardSheet.getRange("B2").getValue() || 0;
  
    // Append loan details only if the Loan ID is not already present
    var existingIDs = loanSheet.getRange("A:A").getValues().flat();
    if (!existingIDs.includes(loanID)) {
      loanSheet.appendRow([loanID, applicationDate, memberID, name, purpose, loanAmount,interestRate, term,"Pending"]);
    }
  
    // Generate Pre-filled Approval Form Link
    var approvalFormBaseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSe-beaiSW3uYqSfHjn0XTQs6f94nbEokxkoMChz3Rz4meAJcQ/viewform?usp=pp_url";
    var preFilledFormLink = approvalFormBaseUrl + "&entry.162982945=" + encodeURIComponent(loanID);
  
    // Send email to approvers
    var subject = `Loan Approval Request - ${loanID} - ${name}`;
    var body = generateEmailTemplate(name, purpose, loanAmount, term, availableBalance, preFilledFormLink);
  
    approvers.forEach(email => {
      MailApp.sendEmail({
        name:'SVS NIDHI',
        to: email,
        subject: subject,
        htmlBody: body
      });
    });
  }
  
  function generateEmailTemplate(name, purpose, loanAmount, term, availableBalance, preFilledFormLink) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd;">
        <h2 style="color: #2c3e50;">Loan Approval Request</h2>
        <p><strong>Applicant Name:</strong> ${name}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
        <p><strong>Loan Amount:</strong> ₹${loanAmount}</p>
        <p><strong>Loan Term:</strong> ${term} months</p>
        <p><strong>Available Balance to Lend:</strong> ₹${availableBalance}</p>
        <hr>
        <p>Please review and approve/reject the loan application using the link below:</p>
        <p><a href="${preFilledFormLink}" style="background: #007bff; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Approve/Reject Loan</a></p>
      </div>
    `;
  }
  
  
  // 📌 Function to Process Loan Approval Submission
  function processApprovalForm(loanSheet, formResponses) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var loanSheet = ss.getSheetByName("Loans"); // Loan Details
    var approvalSheet = ss.getSheetByName("Approvals"); // Approval Responses
  
    var approvalData = approvalSheet.getDataRange().getValues(); // Fetch all approval records
    var loanData = loanSheet.getDataRange().getValues(); // Fetch all loan records
  
    var pendingLoans = {}; // Store pending loan IDs and their row index in Loans sheet
  
    // Step 1: Get all pending loans from "Loans" sheet
    for (var i = 1; i < loanData.length; i++) {
      var loanID = loanData[i][0]; // Loan ID
      var status = loanData[i][8]; // Column F - Status
  
      if (status === "Pending") {
        pendingLoans[loanID] = i + 1; // Store row index (1-based)
      }
    }
  
    if (Object.keys(pendingLoans).length === 0) {
      return; // No pending loans to process
    }
  
    var approvalCounts = {}; // Store approvals & rejections for each pending loan
  
    // Step 2: Count approvals & rejections from "Approvals" sheet for pending loans
    for (var j = 1; j < approvalData.length; j++) {
      var loanID = approvalData[j][1]; // Loan ID in Approvals sheet
      var status = approvalData[j][2]; // "Approved" or "Rejected"
      var interestRate=approvalData[j][5]
      if (pendingLoans[loanID]) { // Only process if the loan is in "Pending Approval"
        if (!approvalCounts[loanID]) {
          approvalCounts[loanID] = { approved: 0, rejected: 0 };
        }
  
        if (status === "Approved") {
          approvalCounts[loanID].approved++;
        } else if (status === "Rejected") {
          approvalCounts[loanID].rejected++;
        }
      }
    }
  
    // Step 3: Update status in "Loans" sheet when approvals or rejections reach 3
    for (var loanID in approvalCounts) {
      var rowToUpdate = pendingLoans[loanID]; // Get row index from pendingLoans
      var approvals = approvalCounts[loanID].approved;
      var rejections = approvalCounts[loanID].rejected;
      var finalStatus = "Pending";
  
      if (rejections >= 3) {
        finalStatus = "Rejected";
      } else if (approvals >= 3) {
        finalStatus = "Approved";
      }
      Logger.log(finalStatus)
      if (finalStatus !== "Pending") {
        loanSheet.getRange(rowToUpdate, 9).setValue(finalStatus); // Column F - Status
  
        if (finalStatus === "Approved") {
          var approvalDate = new Date();
          loanSheet.getRange(rowToUpdate, 10).setValue(approvalDate); // Approval Date
          loanSheet.getRange(rowToUpdate, 7).setValue(interestRate)
          
  
          // Fetch loan details for EMI calculation
          var principal = loanSheet.getRange(rowToUpdate, 6).getValue();
          var interestRate = loanSheet.getRange(rowToUpdate, 7).getValue();
          var term = loanSheet.getRange(rowToUpdate, 8).getValue();
  
          if (principal && interestRate && term) {
            var emi = calculateEMI(principal, interestRate, term);
            loanSheet.getRange(rowToUpdate, 11).setValue(emi); // EMI column
          }
        }
        break;
      }
    }
  }
  
  // EMI Calculation Function
  function calculateEMI(principal, annualRate, months) {
    var monthlyRate = annualRate / 12 / 100;
    var emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    
    return Math.round(emi); // 🔹 Rounds EMI to the nearest integer
  }
  
  