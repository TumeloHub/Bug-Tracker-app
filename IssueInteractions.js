// INIT CLICK SYSTEM
document.addEventListener("DOMContentLoaded", () => {
    setupGlobalTicketClick();

    // === DATE CONSTRAINT LOGIC ===
    const dateIdentifiedInput = document.getElementById('input-date-identified');
    const targetDateInput = document.getElementById('input-date-target');

    if (dateIdentifiedInput && targetDateInput) {
        dateIdentifiedInput.addEventListener('change', function () {
            // Set the minimum selectable date for the target date picker
            targetDateInput.min = this.value;

            // If the user already selected a target date that is now invalid, clear it
            if (targetDateInput.value && targetDateInput.value < this.value) {
                targetDateInput.value = '';
            }
        });
    }

    // Handle the "New Ticket" button explicitly 
    const newTicketBtn = document.getElementById("btn-new-ticket");
    if (newTicketBtn) {
        newTicketBtn.addEventListener("click", () => {
            document.getElementById("btn-save-ticket").removeAttribute("data-edit-id");
            document.getElementById("form-ticket").reset();
            document.getElementById("btn-delete-ticket").classList.add("d-none");

            if (typeof populateProjectSelect === 'function') populateProjectSelect();
            if (typeof populatePeopleSelects === 'function') populatePeopleSelects();

            const today = new Date().toISOString().split('T')[0];
            document.getElementById('input-date-identified').value = today;

            // Set the minimum target date to today for new tickets
            document.getElementById('input-date-target').min = today;
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
    document.getElementById("select-priority").value = issue.priority;
    document.getElementById("select-reporter").value = issue.identifiedBy;
    document.getElementById("select-assignee").value = issue.assignedTo || "";
    document.getElementById("input-date-identified").value = issue.dateIdentified;
    document.getElementById("input-date-target").min = issue.dateIdentified;
    document.getElementById("input-date-target").value = issue.targetDate || "";
    document.getElementById("input-date-actual").value = issue.actualDate || "";
    document.getElementById("input-resolution-summary").value = issue.resolution || "";

    // 3. Show Modal
    let modalEl = document.getElementById("modal-create-ticket");
    let modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}

function toggleResolutionFields() {
    const actualDateInput = document.getElementById('input-date-actual');
    const resolutionTextarea = document.getElementById('input-resolution-summary');

    if (!actualDateInput || !resolutionTextarea) return;

    // Retrieve the current issue status from localStorage
    const saveBtn = document.getElementById("btn-save-ticket");
    const editId = saveBtn.getAttribute("data-edit-id");

    let isResolved = false;
    if (editId) {
        const issues = loadData("issues");
        const issue = issues.find(i => i.id == parseInt(editId));
        if (issue && issue.status === 'resolved') {
            isResolved = true;
        }
    }

    // Enable only when status = resolved
    actualDateInput.disabled = !isResolved;
    resolutionTextarea.disabled = !isResolved;

    if (isResolved) {
        actualDateInput.classList.add('bg-white', 'border-primary');
        resolutionTextarea.classList.add('bg-white', 'border-primary');
    } else {
        actualDateInput.classList.remove('bg-white', 'border-primary');
        resolutionTextarea.classList.remove('bg-white', 'border-primary');
    }
}


function initResolutionFieldToggle() {
    toggleResolutionFields();
}


// 1. Make sure toggle runs whenever the modal is shown (new ticket OR edit)
document.addEventListener('DOMContentLoaded', () => {
    const ticketModal = document.getElementById('modal-create-ticket');
    if (ticketModal) {
        ticketModal.addEventListener('show.bs.modal', () => {
            // Small delay so the form fields are populated first
            setTimeout(initResolutionFieldToggle, 150);
        });
    }
});

// 2. Also call it explicitly after viewSingleIssue finishes populating the form
//    (this fixes the exact issue you reported when dragging to Resolved)
const originalViewSingleIssue = window.viewSingleIssue;
window.viewSingleIssue = function (issueId) {
    // Run the original function first
    if (typeof originalViewSingleIssue === 'function') {
        originalViewSingleIssue(issueId);
    }

    // Then enable the resolution fields if the ticket is now Resolved
    setTimeout(() => {
        toggleResolutionFields();
    }, 200);
};

// Optional: also call it after the Save button (in case status changes on edit)
const originalHandleSaveTicket = window.handleSaveTicket;
if (typeof originalHandleSaveTicket === 'function') {
    window.handleSaveTicket = function () {
        originalHandleSaveTicket();
        // After save, if modal re-opens or board refreshes, fields stay correct
    };
}

console.log('%c Resolution Summary field is now fully editable when ticket is Resolved!', 'color:#28a745; font-weight:bold');

// When a ticket is dragged to Resolved, it moves temporarily. 
// If user clicks Cancel in the modal WITHOUT filling resolution summary → revert ticket.
document.addEventListener('DOMContentLoaded', () => {
    const ticketModal = document.getElementById('modal-create-ticket');
    if (!ticketModal) return;

    ticketModal.addEventListener('hide.bs.modal', function () {
        const originalStatus = this.getAttribute('data-original-status');
        const resolveIssueIdStr = this.getAttribute('data-resolve-issue-id');

        if (originalStatus && resolveIssueIdStr) {
            const issueId = parseInt(resolveIssueIdStr);
            let issues = loadData("issues");
            const index = issues.findIndex(i => i.id === issueId);

            if (index !== -1) {
                const issue = issues[index];

                // If the ticket is still "resolved" but has NO resolution summary → user cancelled
                if (issue.status === 'resolved' && (!issue.resolution || issue.resolution.trim() === '')) {
                    if (confirm(`Resolution attempt cancelled.\n\nThe ticket will be moved back to the "${originalStatus}" column.`)) {
                        issue.status = originalStatus;
                        issue.actualDate = null;
                        issue.resolution = "";
                        saveData("issues", issues);
                        renderBoard();
                    }
                    // If user clicks "Cancel" on the confirm dialog, we keep the ticket in Resolved
                    // (they can edit it again later)
                }
            }

            // Clean up modal attributes
            this.removeAttribute('data-original-status');
            this.removeAttribute('data-resolve-issue-id');
        }
    });
});

console.log('%c Resolution Summary field is now fully editable when ticket is Resolved!', 'color:#28a745; font-weight:bold');
