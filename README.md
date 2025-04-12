# Google Sheet + Apps Script Automation to Manage a Group Fund

Wrote this simple automation to manage a group fund. Before settling on this solution I tried different solutions like Airtable, Glide, App Sheet etc. I also considered building an webapp but considering it's usage for limited group of people building a webapp seemed like a stretch. Airtable, Glide, App Sheet and other similar solutions offer a attractive UI and ease of use but if I want to scale I have to pay money and most important features behind the paywall. 

## Little Background about the Fund

Fund is managed by group of friends. It's main objective is to cater to needs of it's members at the time emergency. Fund activities include collecting monthly contributions, disbursing loans and collecting loans. Looks simple right? but behind the scene activities are not so simple. All operations work of updating contributions, loan request, loan approval and loan repayment process are handled by single person. Initially it looked simple but as the fund grew it became headache to maintain it manually. Thus, needed a solution to where it involves minimal human intervention.

## The Objective

Primary objective was to minimize the human effort involved in maintaining the fund. To save that poor soul who required to log in to his laptop every night to update numbers and scratch his head when numbers won't tally.

## Process

I had a clear objective but my mind wandered over fancy solutions. I lacked a clear way of approach. I seeked help from Perplexity's Deep Research and troubled all AI souls (Gemini, Claude and ChatGPT). I wanted to know how to handle all of these in a structured way. Finaly, after several prompting I am able to design following workflow.

It contained designing 3 main workflows. For Deposits I don't need to design any workflow becase it was straight forward. 

### 1. Loan Approval Workflow

* A Google Form collects loan applications. 
* The script assigns a unique Loan ID and stores key details (amount, purpose, term, etc.).
* An email is sent to the approval committee with a form link to approve or reject.
* Once 3 out of 4 members approve, the loan status updates to Approved. If not, it’s Rejected.

✅ Bottleneck: Duplicate Loan IDs.Fix: Implemented a timestamp-based ID generator to ensure uniqueness.

### 2. Repayment Plan Generation

* Once a loan is approved, the script automatically creates a monthly repayment schedule.
* It calculates EMIs and updates due dates.
* Ensures that repayments aren’t generated again for a given month.

✅ Bottleneck: Overwriting existing repayment plans.Fix: The script checks if a repayment entry already exists before generating a new one.

### 3. Tracking Payments & Loan Closure

* Admins update repayments via a dedicated sheet.
* The script updates the Repayments tab with payment details.
* If the total repaid amount meets or exceeds the loan amount, status changes to Completed.

✅ Bottleneck: Manual errors in updating repayments.Fix: Automated status updates based on real-time data.

## Implementation

Implementation was easy. Created a Google Sheet with multipe tabs dedicated for each of the operation. Using unique ids everywhere helped me to deal the data very easily. Explanation below

1. **Loan Applications:** This sheet will store the loan application data. Once the loan application form gets submitted it will trigger a approval request mail to pre-defined approvers along with necessary details required for approval. At the same time details will get updated to Loans sheet automatically.
2. **Approvals:** This sheet will store the all the approvals. Approval form is triggered with pre-filled loan id, hence once a approver fills the form it will be mapped against relevant loan id easily. Once the approvals count is reaches to 3 the loan status in Loans sheet will change from pending to Approved and EMI will be calculated accordingly.
3. **Update Deposits:** This sheet will be used by Admin to update contributions received every month.
4. **Update Repayments:** This sheet will be used by Admin to update loan repayments.
5. **Members:** This sheet will give member wise overview like amount contributed, status, loans outstanding, repayments etc.
6. **Contributions:** This sheet get's auto updated everymonth. Whenever Admin updates Deposits, same will be mapped in this sheet.
7. **Loans:** This sheet is auto updated everytime a loan application is submitted. Admin has to change the status from Approved to Active once he disburses the loan.
8. **Repayments:** Repayments are stored here. Repayment plans are generated everymonth for all active loans. Once Admin updates Repayments same will be updated here.
9. **Reports:** Main reports needed for day to day operations like Pending Contributions, Pending Repayments etc.
10. **Dashboard:** Holds information like list of approvers, fund available to lend etc which are needed for script executions.

## Scripts and Triggers

1. **generateMonthlyContributions:** This script will generate contributions to be made by each member everymonth. It will also generate unique contribution id.  It will trigger 1st of every month. The same details will be updated in Update Deposits sheet for Admin to update status. 
2. **updateDepositStatus:** This script will update contribution payment status to Contributions sheet once it is updated in Update Deposits sheet. It works both ways, Admin can click on Update button available if not it will execute automatically at night. It also delets respective row from Update Deposits sheet. 
3. **loanApplication:** This will trigger whenever there is form submission. It will do three things, a. generates a loan id b. update Loans sheet with details and c. send a approval request mail to pre-defined approvers. Once approver submits the form it again triggers the script to check approval or rejects count, once approval count reaches 3 it will change the loan status in Loans sheet and updates the EMI and other details. 
4. **repaymentPlan:** Generates repayment plan for each active loan and updates the same in Repayments sheet with repayment id. The same details will be updated in Update Repayments sheet for Admin to update status.
5. **updateRepayments:** This script will update repayment status to Repayments sheet once it is updated in Update Repayments sheet. It works both ways, Admin can click on Update button available if not it will execute automatically at night. It also respective row from Update Deposits sheet

Finally, Admin's work reduced to just to sheets and just two steps. Whenever there is a payment he has to update the status in one of the sheet and update loan status to active whenever he disburses loan. Easy peasy. 

## Final words

At the outset it appeared to me as a simple problem but as I dived in, it throwed several problems which made me to write and rewrite script multiple times. It was a satisfying experience. 

Here is the sample [spreadsheet strucure](https://docs.google.com/spreadsheets/d/1ag8gDjUGUXQDe_JTG6-zjLx1BaRGWxM0xT7vt7Eo7oE/edit?usp=sharing), please feel free to customize. Reach out if you need any help







