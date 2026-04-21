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

    // ====================== BACKWARD MOVEMENT RULES (updated with all new requirements) ======================
    const statusOrder = {
        "open": 0,
        "in-progress": 1,
        "overdue": 2,
        "resolved": 3
    };

    const currentOrder = statusOrder[issue.status] ?? 0;
    const targetOrder = statusOrder[targetStatus] ?? 0;

    if (targetOrder < currentOrder) {
        if (issue.status === "resolved") {
            // Dragging OUT of Resolved column
            if (confirm("Warning: Moving this ticket out of the Resolved column will permanently delete the resolution date and summary.\n\nDo you want to continue?")) {
                issue.actualDate = null;
                issue.resolution = "";

                // === Check if moving specifically to Open ===
                if (targetStatus === "open" && issue.assignedTo) {
                    if (confirm("This issue has an assignee. Do you want to deallocate them and move it back to the Open column?")) {
                        issue.assignedTo = null;
                    } else {
                        return; // Cancel the move if they refuse to deallocate
                    }
                }

            } else {
                return;
            }
        }
        else if (issue.status === "in-progress" && targetStatus === "open") {
            // In-Progress → Open: allow only with deallocation confirmation
            if (confirm("Do you want to deallocate the assignee and move this issue back to the Open column?")) {
                issue.assignedTo = null;
            } else {
                return;
            }
        }
        else if (issue.status === "overdue") {
            // Overdue → Open or In-Progress: strict validation + new target date required
            if (targetStatus === "in-progress" && !issue.assignedTo) {
                alert("You cannot move an overdue ticket to In-Progress because no one is assigned to the issue.");
                return;
            }
            if (targetStatus === "open" && issue.assignedTo) {
                if (!confirm("This issue has an assignee. Do you want to deallocate them and move it back to Open?")) {
                    return;
                }
                issue.assignedTo = null;
            }

            // Prompt user for new target resolution date
            const newTargetDate = prompt(`To move this overdue ticket back to ${targetStatus.replace('-', ' ')}, please enter a new Target Resolution Date (YYYY-MM-DD):\n\nCurrent target was: ${issue.targetDate || 'none'}\n\nLeave blank to keep in Overdue.`);

            if (!newTargetDate || newTargetDate.trim() === "") {
                if (confirm("Leave target date blank? The issue will stay in the Overdue column.")) {
                    return;
                } else {
                    return;
                }
            }

            const trimmedDate = newTargetDate.trim();
            if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
                alert("Invalid date format. Please use YYYY-MM-DD.");
                return;
            }

            issue.targetDate = trimmedDate;
            // Fall through to normal status update below (auto-overdue logic will keep it out of overdue)
        }
        else {
            alert("You cannot move a ticket back to a previous column.");
            return;
        }
    }

    // ====================== IN-PROGRESS DRAG LOGIC ======================
    if (targetStatus === "in-progress") {
        if (!issue.assignedTo) {
            alert("Please assign a team member before moving this ticket to In Progress.");

            // Open the edit modal so the user can assign someone
            setTimeout(() => {
                if (typeof viewSingleIssue === "function") {
                    viewSingleIssue(issueId);
                }
            }, 100);

            return; // Cancel the drag-and-drop movement
        }
    }


    // ====================== RESOLVED DRAG LOGIC ======================
    if (targetStatus === "resolved") {
        if (!issue.assignedTo) {
            alert("This ticket must be assigned to a team member before it can be resolved.");
            return;
        }

        if (!issue.actualDate) {
            issue.actualDate = new Date().toISOString().split("T")[0];
        }
    }

    // ====================== UPDATE & MOVE TICKET ======================
    issue.status = targetStatus;
    saveData("issues", issues);
    renderBoard();

    // If this was a drag-to-resolved action, store original status on the modal for cancel-revert
    if (originalStatusForRevert) {
        const modalEl = document.getElementById('modal-create-ticket');
        if (modalEl) {
            modalEl.setAttribute('data-original-status', originalStatusForRevert);
            modalEl.setAttribute('data-resolve-issue-id', issueId.toString());
        }
    }

    // Open modal so user can fill Resolution Summary (for resolved drags)
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
        { id: 'col-open', status: 'open' },
        { id: 'col-in-progress', status: 'in-progress' },
        { id: 'col-overdue', status: 'overdue' },
        { id: 'col-resolved', status: 'resolved' }
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