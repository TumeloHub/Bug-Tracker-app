// INIT CLICK SYSTEM
document.addEventListener("DOMContentLoaded", () => {
    setupGlobalTicketClick();

    // Handle the "New Ticket" button explicitly so we don't rely on the buggy modal event
    const newTicketBtn = document.getElementById("btn-new-ticket");
    if (newTicketBtn) {
        newTicketBtn.addEventListener("click", () => {
            document.getElementById("btn-save-ticket").removeAttribute("data-edit-id");
            document.getElementById("form-ticket").reset();
            document.getElementById("btn-delete-ticket").classList.add("d-none");

            if (typeof populateProjectSelect === 'function') populateProjectSelect();
            if (typeof populatePeopleSelects === 'function') populatePeopleSelects();

            document.getElementById('input-date-identified').value = new Date().toISOString().split('T')[0];
        });
    }
});

// CLICK HANDLER (STABLE - EVENT DELEGATION)
function setupGlobalTicketClick() {
    document.getElementById("board-container").addEventListener("click", (e) => {
        const card = e.target.closest(".ticket-card");
        if (!card) return;

        // Support both data-id and data-issue-id attributes safely
        const issueId = parseInt(card.getAttribute("data-issue-id")) || parseInt(card.getAttribute("data-id"));
        if (isNaN(issueId)) return;

        viewSingleIssue(issueId);
    });
}

// VIEW ISSUE (EDIT MODE)
function viewSingleIssue(issueId) {
    const saveBtn = document.getElementById("btn-save-ticket");
    saveBtn.setAttribute("data-edit-id", issueId);
    const deleteBtn = document.getElementById("btn-delete-ticket");
    if (deleteBtn) {
        deleteBtn.classList.remove("d-none");
        deleteBtn.setAttribute("data-delete-id", issueId);
    }

    const issues = loadData("issues");
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    // 1. Reset form and populate dropdowns FIRST
    document.getElementById("form-ticket").reset();
    if (typeof populateProjectSelect === 'function') populateProjectSelect();
    if (typeof populatePeopleSelects === 'function') populatePeopleSelects();

    // 2. Fill form with issue data
    document.getElementById("input-summary").value = issue.summary;
    document.getElementById("input-description").value = issue.description;
    document.getElementById("select-project").value = issue.projectId;
    document.getElementById("select-status").value = issue.status;
    document.getElementById("select-priority").value = issue.priority;
    document.getElementById("select-reporter").value = issue.identifiedBy;
    document.getElementById("select-assignee").value = issue.assignedTo || "";
    document.getElementById("input-date-identified").value = issue.dateIdentified;
    document.getElementById("input-date-target").value = issue.targetDate || "";
    document.getElementById("input-date-actual").value = issue.actualDate || "";
    document.getElementById("input-resolution-summary").value = issue.resolution || "";

    // 3. Show Modal
    let modalEl = document.getElementById("modal-create-ticket");
    let modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}