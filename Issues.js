function getPriorityBadgeClass(priority) {
    switch (priority.toLowerCase()) {
        case 'high': return 'bg-danger';
        case 'medium': return 'bg-warning text-dark';
        case 'low': return 'bg-success';
        default: return 'bg-secondary';
    }
}

// Helper: Check if an issue is overdue based on target resolution date
function isIssueOverdue(issue) {
    // Never show overdue clock on resolved tickets
    if (issue.status === 'resolved') return false;

    // No target date = not overdue
    if (!issue.targetDate) return false;

    // Compare YYYY-MM-DD strings (current date vs target date)
    const today = new Date().toISOString().split('T')[0];
    return issue.targetDate < today;
}

// Automatically move overdue issues to the Overdue column (and move back when target date is updated)
function autoSetOverdueStatuses() {
    let issues = loadData("issues");
    const today = new Date().toISOString().split('T')[0];
    let changed = false;

    issues.forEach(issue => {
        if (issue.status === 'resolved') return;

        const isOverdueNow = issue.targetDate && issue.targetDate < today;

        if (isOverdueNow && issue.status !== 'overdue') {
            issue.status = 'overdue';
            changed = true;
        } else if (!isOverdueNow && issue.status === 'overdue') {
            // Auto-move back based on whether it has an assignee
            issue.status = issue.assignedTo ? 'in-progress' : 'open';
            changed = true;
        }
    });

    if (changed) {
        saveData("issues", issues);
    }
}

// Create a single ticket card element
function createTicketCard(issue, personMap, projectMap) {
    const person = issue.assignedTo ? personMap[issue.assignedTo] : null;

    const avatarUrl = person
        ? (person.profilePic || `https://ui-avatars.com/api/?name=${person.name.charAt(0)}+${person.surname.charAt(0)}&background=random&rounded=true&size=28`)
        : '';

    const projectName = projectMap[issue.projectId] || 'Unknown Project';

    const reporterUsername = issue.identifiedBy ? `@${issue.identifiedBy}` : 'Unknown';
    const assigneeUsername = person ? `@${person.username}` : 'Unassigned';

    // Overdue red clock indicator (already using the uploaded RedClock.png)
    const overdueClock = isIssueOverdue(issue)
        ? `<img src="RedClock.png" alt="Overdue" title="Overdue – Target resolution date has passed" style="width: 26px; height: 26px; flex-shrink: 0;">`
        : '';

    const cardHTML = `
        <div class="card border-0 shadow-sm mb-2 ticket-card" data-issue-id="${issue.id}">
            <div class="card-body p-3">
                
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge bg-light text-secondary border border-secondary shadow-sm" style="font-size: 0.70rem;">
                        <i class="bi bi-person-fill"></i> ${reporterUsername}
                    </span>
                    
                    <!-- Priority + Red Clock (if overdue) -->
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge ${getPriorityBadgeClass(issue.priority)} rounded-pill" style="font-size: 0.70rem;">
                            ${issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                        </span>
                        ${overdueClock}
                    </div>
                </div>

                <p class="card-text fw-semibold mb-2 text-dark text-break">${issue.summary}</p>
                
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="badge bg-info text-dark rounded-pill shadow-sm" style="font-size: 0.70rem;">${projectName}</span>
                    <div class="d-flex align-items-center gap-2" title="Assigned to: ${person ? person.name + ' ' + person.surname : 'Unassigned'}">
                        <span class="small fw-semibold text-muted d-inline-block text-truncate" style="max-width: 80px;" title="${assigneeUsername}">${assigneeUsername}</span>                        
                        ${person ? `<img src="${avatarUrl}" alt="Avatar" class="shadow-sm" style="width:28px;height:28px;border-radius:50%; object-fit: cover;">` : ''}
                    </div>
                </div>

            </div>
        </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cardHTML.trim();
    return tempDiv.firstElementChild;
}

// Render the entire Kanban board
function renderBoard() {
    // Auto-update overdue statuses BEFORE rendering (this powers the automatic column movement)
    autoSetOverdueStatuses();

    const issues = loadData("issues");
    const people = loadData("people");
    const projects = loadData("projects");

    // Create quick lookup maps
    const projectMap = {};
    projects.forEach(p => { projectMap[p.id] = p.name; });

    const personMap = {};
    people.forEach(p => { personMap[p.id] = p; });

    // Group issues by status
    const columns = {
        'open': [],
        'in-progress': [],
        'overdue': [],
        'resolved': []
    };

    issues.forEach(issue => {
        let statusKey = issue.status;
        if (statusKey === 'in progress') statusKey = 'in-progress';
        if (columns[statusKey]) {
            columns[statusKey].push(issue);
        }
    });

    // Update counts and clear columns
    Object.keys(columns).forEach(status => {
        const countEl = document.getElementById(`count-${status}`);
        if (countEl) countEl.textContent = columns[status].length;

        const container = document.getElementById(`col-${status}`);
        if (container) container.innerHTML = '';
    });

    // Render cards in the correct column
    Object.keys(columns).forEach(status => {
        const container = document.getElementById(`col-${status}`);
        if (!container) return;

        columns[status].forEach(issue => {
            const card = createTicketCard(issue, personMap, projectMap);
            container.appendChild(card);
        });
    });
}

// Populate Project dropdown in the New Ticket modal
function populateProjectSelect() {
    const select = document.getElementById('select-project');
    select.innerHTML = '<option value="" selected disabled>Select Project...</option>';

    const projects = loadData("projects");
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        select.appendChild(option);
    });
}

// Populate Reporter and Assignee dropdowns
function populatePeopleSelects() {
    const people = loadData("people");

    // Reporter (uses username because identifiedBy stores username)
    const reporterSelect = document.getElementById('select-reporter');
    reporterSelect.innerHTML = '<option value="" selected disabled>Select Team Member...</option>';
    people.forEach(person => {
        const option = document.createElement('option');
        option.value = person.username;
        option.textContent = `${person.name} ${person.surname} (@${person.username})`;
        reporterSelect.appendChild(option);
    });

    // Assignee (uses numeric ID)
    const assigneeSelect = document.getElementById('select-assignee');
    assigneeSelect.innerHTML = '<option value="" selected>Unassigned</option>';
    people.forEach(person => {
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = `${person.name} ${person.surname}`;
        assigneeSelect.appendChild(option);
    });
}

// Save or Update issue when "Save Ticket" is clicked
// Save or Update issue when "Save Ticket" is clicked
function handleSaveTicket() {
    const summary = document.getElementById('input-summary').value.trim();
    if (!summary) {
        alert('Issue Summary is required!');
        return;
    }

    const projectIdStr = document.getElementById('select-project').value;
    if (!projectIdStr) {
        alert('Please select a Project!');
        return;
    }

    const reporter = document.getElementById('select-reporter').value;
    if (!reporter) {
        alert('Please select a Reporter!');
        return;
    }

    // ====================== DATE VALIDATION ======================
    const dateIdentifiedInput = document.getElementById('input-date-identified').value;
    const targetDateInput = document.getElementById('input-date-target').value;

    if (dateIdentifiedInput && targetDateInput) {
        if (targetDateInput < dateIdentifiedInput) {
            alert('Target Resolution Date cannot be earlier than the Date Identified.');
            return;
        }
    }

    // Always read assignee from the form
    const assigneeSelect = document.getElementById('select-assignee');
    let assigneeValue = assigneeSelect.value ? parseInt(assigneeSelect.value) : null;

    // Determine edit state
    const saveBtn = document.getElementById('btn-save-ticket');
    const editId = saveBtn.getAttribute('data-edit-id');
    const isNewTicket = !editId;

    let status = 'open'; // Default for new tickets
    let previousStatus = null;

    if (!isNewTicket) {
        const tempIssues = loadData("issues");
        const oldIssue = tempIssues.find(i => i.id == editId);
        if (oldIssue) {
            previousStatus = oldIssue.status;
            status = oldIssue.status; // Keep current status for existing tickets
        }
    }

    // Force status to "open" if there is no assignee and it's not already resolved
    if (!assigneeValue && status !== 'resolved') {
        status = 'open';
    }

    // ====================== RESOLVED TICKET VALIDATION ======================
    let actualDate = null;
    let resolution = '';

    if (status === 'resolved') {
        if (!assigneeValue) {
            alert('This ticket must be assigned to a team member before it can be marked as Resolved.');
            return;
        }

        const resolutionSummary = document.getElementById('input-resolution-summary').value.trim();
        if (!resolutionSummary) {
            alert('Please fill in the Resolution Summary before marking the ticket as Resolved.');
            return;
        }

        const actualDateInput = document.getElementById('input-date-actual').value;
        if (!actualDateInput) {
            alert('Please set the Actual Resolution Date before marking the ticket as Resolved.');
            return;
        }

        actualDate = actualDateInput;
        resolution = resolutionSummary;
    }
    // ====================== END RESOLVED VALIDATION ======================

    // ====================== ASSIGNMENT CONFIRMATION (Open → In-Progress) ======================
    if (assigneeValue && (isNewTicket || previousStatus === 'open')) {
        const people = loadData("people");
        const member = people.find(p => p.id === assigneeValue);
        const memberName = member ? `${member.name} ${member.surname}` : 'the selected team member';

        if (confirm(`Confirm, do you want to assign ${memberName} to this issue?`)) {
            status = 'in-progress';
        } else {
            // User cancelled the assignment → do not assign
            assigneeValue = null;
            if (status !== 'resolved') status = 'open';
        }
    }
    // ====================== END ASSIGNMENT CONFIRMATION ======================

    let issues = loadData("issues");

    if (editId) {
        // UPDATE EXISTING TICKET
        const index = issues.findIndex(i => i.id == editId);
        if (index > -1) {
            issues[index].summary = summary;
            issues[index].description = document.getElementById('input-description').value.trim();
            issues[index].identifiedBy = reporter;
            issues[index].dateIdentified = document.getElementById('input-date-identified').value;
            issues[index].projectId = parseInt(projectIdStr);
            issues[index].assignedTo = assigneeValue;
            issues[index].status = status;
            issues[index].priority = document.getElementById('select-priority').value;
            issues[index].targetDate = document.getElementById('input-date-target').value || null;
            issues[index].actualDate = actualDate;
            issues[index].resolution = resolution;
        }
    } else {
        // CREATE NEW TICKET
        const maxId = issues.length > 0 ? Math.max(...issues.map(i => i.id)) : 0;
        const newIssue = {
            id: maxId + 1,
            summary: summary,
            description: document.getElementById('input-description').value.trim(),
            identifiedBy: reporter,
            dateIdentified: document.getElementById('input-date-identified').value || new Date().toISOString().split('T')[0],
            projectId: parseInt(projectIdStr),
            assignedTo: assigneeValue,
            status: status,
            priority: document.getElementById('select-priority').value,
            targetDate: document.getElementById('input-date-target').value || null,
            actualDate: actualDate,
            resolution: resolution
        };
        issues.push(newIssue);
    }

    // Save Data
    saveData("issues", issues);

    // Clean up state and close modal
    saveBtn.removeAttribute('data-edit-id');
    document.getElementById('form-ticket').reset();

    const modalEl = document.getElementById('modal-create-ticket');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    // Refresh the board
    renderBoard();
}

// Handle Ticket Deletion
document.addEventListener("DOMContentLoaded", () => {
    const deleteBtn = document.getElementById("btn-delete-ticket");

    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            const deleteId = parseInt(deleteBtn.getAttribute("data-delete-id"));
            if (!deleteId) return;

            if (confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
                let issues = loadData("issues");
                issues = issues.filter(i => i.id !== deleteId);
                saveData("issues", issues);

                const modalEl = document.getElementById('modal-create-ticket');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();

                renderBoard();
            }
        });
    }
});