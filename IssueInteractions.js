// INIT CLICK SYSTEM
document.addEventListener("DOMContentLoaded", () => {
    setupGlobalTicketClick();
});


// CLICK HANDLER (STABLE - EVENT DELEGATION)
function setupGlobalTicketClick() {
    document.getElementById("board-container").addEventListener("click", (e) => {

        const card = e.target.closest(".ticket-card");
        if (!card) return;

        const issueId = parseInt(card.getAttribute("data-id"));
        if (isNaN(issueId)) return;

        viewSingleIssue(issueId);
    });
}


// VIEW ISSUE (EDIT MODE)
function viewSingleIssue(issueId) {

    const saveBtn = document.getElementById("btn-save-ticket");

    // Clear previous edit state
    saveBtn.removeAttribute("data-edit-id");

    const issues = loadData("issues");
    const issue = issues.find(i => i.id === issueId);

    if (!issue) return;

    // Reset form first
    document.getElementById("form-ticket").reset();

    // Fill form
    document.getElementById("input-summary").value = issue.summary;
    document.getElementById("input-description").value = issue.description;
    document.getElementById("select-project").value = issue.projectId;
    document.getElementById("select-status").value = issue.status;
    document.getElementById("select-priority").value = issue.priority;
    document.getElementById("select-reporter").value = issue.identifiedBy;
    document.getElementById("select-assignee").value = issue.assignedTo || "";
    document.getElementById("input-date-identified").value = issue.dateIdentified;
    document.getElementById("input-date-target").value = issue.targetDate;
    document.getElementById("input-date-actual").value = issue.actualDate || "";
    document.getElementById("input-resolution-summary").value = issue.resolution || "";

    // Set edit mode
    saveBtn.setAttribute("data-edit-id", issueId);

    // Open modal
    const modal = new bootstrap.Modal(
        document.getElementById("modal-create-ticket")
    );
    modal.show();
}

// SAVE EDIT
document.getElementById("btn-save-ticket").addEventListener("click", () => {

    const saveBtn = document.getElementById("btn-save-ticket");
    const editId = saveBtn.getAttribute("data-edit-id");

    if (!editId) return;

    const issues = loadData("issues");
    const index = issues.findIndex(i => i.id == editId);

    if (index === -1) return;

    // Update values
    issues[index].summary = document.getElementById("input-summary").value;
    issues[index].description = document.getElementById("input-description").value;
    issues[index].projectId = parseInt(document.getElementById("select-project").value);
    issues[index].status = document.getElementById("select-status").value;
    issues[index].priority = document.getElementById("select-priority").value;
    issues[index].identifiedBy = document.getElementById("select-reporter").value;

    const assignedValue = document.getElementById("select-assignee").value;
    issues[index].assignedTo = assignedValue ? parseInt(assignedValue) : null;

    issues[index].dateIdentified = document.getElementById("input-date-identified").value;
    issues[index].targetDate = document.getElementById("input-date-target").value;
    issues[index].actualDate = document.getElementById("input-date-actual").value || null;
    issues[index].resolution = document.getElementById("input-resolution-summary").value;

    saveData("issues", issues);

    // Clean up state
    saveBtn.removeAttribute("data-edit-id");
    document.getElementById("form-ticket").reset();

    renderBoard();

    // Close modal safely
    const modalEl = document.getElementById("modal-create-ticket");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
});