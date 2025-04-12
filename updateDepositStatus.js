function updateDepositStatus() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var contributionsSheet = ss.getSheetByName("Contributions"); // Sheet A
  var updateDepositsSheet = ss.getSheetByName("Update Deposits"); // Sheet B

  var dataA = contributionsSheet.getDataRange().getValues();
  var dataB = updateDepositsSheet.getDataRange().getValues();

  var idColA = 0; // Adjust: Column index of the common ID in Contributions (0-based)
  var statusColA = 5; // Adjust: Column index of Status in Contributions (0-based)
  var noteColA = 6; // Adjust: Column index for the note in Contributions (0-based)

  var idColB = 0; // Adjust: Column index of the common ID in Update Deposits (0-based)
  var statusColB = 3; // Adjust: Column index of Status in Update Deposits (0-based)

  var user = Session.getActiveUser().getEmail();
  var timestamp = new Date().toLocaleString();

  var idMapA = {};
  
  // Build a map of IDs from Contributions for quick lookup
  for (var i = 1; i < dataA.length; i++) {
    idMapA[dataA[i][idColA]] = i;
  }

  var rowsToDelete = [];
  
  // Loop through Update Deposits to find rows where status is exactly "Paid"
  for (var j = 1; j < dataB.length; j++) {
    var idB = dataB[j][idColB];
    var statusB = dataB[j][statusColB];
    if (statusB === "Paid" && idB in idMapA) {
      var rowA = idMapA[idB];
      //Only update if status in Contributions is exactly "Pending"
      if (dataA[rowA][statusColA] === "Pending") {
        contributionsSheet.getRange(rowA + 1, statusColA + 1).setValue("Paid");
        contributionsSheet.getRange(rowA + 1, noteColA + 1).setValue(`Updated on: ${timestamp} By: ${user}`);
        rowsToDelete.push(j + 1); // Store the row index (1-based) for deletion
      }
    }
  }

  // Delete rows from Update Deposits (from bottom to top to prevent shifting issues)
  if (rowsToDelete.length > 0) {
    rowsToDelete.reverse().forEach(row => updateDepositsSheet.deleteRow(row));
  }
}
