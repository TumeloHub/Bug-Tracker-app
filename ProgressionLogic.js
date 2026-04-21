function handleDrop(issueId, targetStatus) {
    let issues = loadData("issues");
    const index = issues.findIndex(i => i.id === issueId);
    if (index === -1) return;

    const issue = issues[index];

    // Prevent dropping onto the same column
    if (issue.status === targetStatus) return;

    // Remember original status ONLY when dragging TO resolved (for cancel-revert logic)
    let originalStatusForRevert = null;
    if (targetStatus === "resolved" && issue.status !== "resolved") {
        originalStatusForRevert = issue.status;
    }

    // ====================== NO MOVING BACKWARD (except out of Resolved) ======================
    const statusOrder = {
        "open": 0,
        "in-progress": 1,
        "overdue": 2,
        "resolved": 3
    };

    const currentOrder = statusOrder[issue.status] ?? 0;
    const targetOrder   = statusOrder[targetStatus] ?? 0;

    if (targetOrder < currentOrder) {
        if (issue.status === "resolved") {
            // Dragging OUT of Resolved column
            if (confirm("Warning: Moving this ticket out of the Resolved column will permanently delete the resolution date and summary.\n\nDo you want to continue?")) {
                issue.actualDate = null;
                issue.resolution = "";
            } else {
                return;
            }
        } else {
            alert("You cannot move a ticket back to a previous column.");
            return;
        }
    }

    // ====================== RESOLVED DRAG LOGIC ======================
    if (targetStatus === "resolved") {
        // Must be assigned before resolving
        if (!issue.assignedTo) {
            alert("This ticket must be assigned to a team member before it can be resolved.");
            return;
        }

        // Auto-fill Actual Resolution Date if not set
        if (!issue.actualDate) {
            issue.actualDate = new Date().toISOString().split("T")[0];
        }
    }

    // ====================== UPDATE & MOVE TICKET TEMPORARILY ======================
    // We move it to Resolved column immediately so the user sees it "placed" there.
    // The modal will open for final resolution details.
    issue.status = targetStatus;
    saveData("issues", issues);
    renderBoard();

    // If this was a drag-to-resolved action, store original status on the modal
    // so we can revert on Cancel (if user didn't fill resolution)
    if (originalStatusForRevert) {
        const modalEl = document.getElementById('modal-create-ticket');
        if (modalEl) {
            modalEl.setAttribute('data-original-status', originalStatusForRevert);
            modalEl.setAttribute('data-resolve-issue-id', issueId.toString());
        }
    }

    // Open modal so user can fill Resolution Summary (ticket is already in Resolved column)
    if (targetStatus === "resolved") {
        setTimeout(() => {
            viewSingleIssue(issueId);
        }, 350);
    }

    // Nice drop animation
    setTimeout(() => {
        const movedCard = document.querySelector(`[data-issue-id="${issueId}"]`);
        if (movedCard) {
            movedCard.classList.add("dropping");
            setTimeout(() => movedCard.classList.remove("dropping"), 450);
        }
    }, 30);
}

// Re-attach the improved handleDrop to all columns
function initEnhancedDragAndDrop() {
    const columnData = [
        { id: 'col-open',        status: 'open' },
        { id: 'col-in-progress', status: 'in-progress' },
        { id: 'col-overdue',     status: 'overdue' },
        { id: 'col-resolved',    status: 'resolved' }
    ];

    columnData.forEach(({ id, status }) => {
        const container = document.getElementById(id);
        if (!container) return;

        container.addEventListener('dragover', e => {
            e.preventDefault();
            container.classList.add('dragover');
        });
        container.addEventListener('dragleave', () => container.classList.remove('dragover'));
        container.addEventListener('drop', e => {
            e.preventDefault();
            container.classList.remove('dragover');
            const issueId = parseInt(e.dataTransfer.getData('text/plain'));
            if (!isNaN(issueId)) handleDrop(issueId, status);
        });
    });
}

// Replace the old init with the new enhanced version
if (typeof initDragAndDrop === "function") {
    initDragAndDrop = initEnhancedDragAndDrop;
} else {
    window.addEventListener("load", initEnhancedDragAndDrop);
}