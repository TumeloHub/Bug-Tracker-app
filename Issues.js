function getPriorityBadgeClass(priority) {
    switch (priority.toLowerCase()) {
        case 'high': return 'bg-danger';
        case 'medium': return 'bg-warning text-dark';
        case 'low': return 'bg-success';
        default: return 'bg-secondary';
    }
}

// Create a single ticket card element
// Create a single ticket card element
function createTicketCard(issue, personMap, projectMap) {
    const person = issue.assignedTo ? personMap[issue.assignedTo] : null;

    // Explicitly grab the first letter of name and surname for initials, or use custom PFP
    const avatarUrl = person
        ? (person.profilePic || `https://ui-avatars.com/api/?name=${person.name.charAt(0)}+${person.surname.charAt(0)}&background=random&rounded=true&size=28`)
        : '';

    const projectName = projectMap[issue.projectId] || 'Unknown Project';

    // Use identifiedBy for the reporter (which is stored as the username string in seed data)
    const reporterUsername = issue.identifiedBy ? `@${issue.identifiedBy}` : 'Unknown';
    const assigneeUsername = person ? `@${person.username}` : 'Unassigned';

    const cardHTML = `
        <div class="card border-0 shadow-sm mb-2 ticket-card" data-issue-id="${issue.id}">
            <div class="card-body p-3">
                
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge bg-light text-secondary border border-secondary shadow-sm" style="font-size: 0.70rem;">
                        <i class="bi bi-person-fill"></i> ${reporterUsername}
                    </span>
                    <span class="badge ${getPriorityBadgeClass(issue.priority)} rounded-pill" style="font-size: 0.70rem;">
                        ${issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                    </span>
                </div>

                <p class="card-text fw-semibold mb-2 text-dark text-break">${issue.summary}</p>
                
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="badge bg-info text-dark rounded-pill shadow-sm" style="font-size: 0.70rem;">${projectName}</span>
                    <div class="d-flex align-items-center gap-2" title="Assigned to: ${person ? person.name + ' ' + person.surname : 'Unassigned'}">
<span class="small fw-semibold text-muted d-inline-block text-truncate" style="max-width: 80px;" title="${assigneeUsername}">${assigneeUsername}</span>                        ${person ? `<img src="${avatarUrl}" alt="Avatar" class="shadow-sm" style="width:28px;height:28px;border-radius:50%; object-fit: cover;">` : ''}
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
        // Normalize status if needed
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

// Save new issue when "Save Ticket" is clicked
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

    const status = document.getElementById('select-status').value;
    let actualDate = null;
    let resolution = '';

    // If status is resolved, fill actual date + resolution
    if (status === 'resolved') {
        actualDate = document.getElementById('input-date-actual').value || new Date().toISOString().split('T')[0];
        resolution = document.getElementById('input-resolution-summary').value.trim();
    }

    let issues = loadData("issues");
    const saveBtn = document.getElementById('btn-save-ticket');
    const editId = saveBtn.getAttribute('data-edit-id');

    if (editId) {
        // UPDATE EXISTING TICKET
        const index = issues.findIndex(i => i.id == editId);
        if (index > -1) {
            issues[index].summary = summary;
            issues[index].description = document.getElementById('input-description').value.trim();
            issues[index].identifiedBy = reporter;
            issues[index].dateIdentified = document.getElementById('input-date-identified').value;
            issues[index].projectId = parseInt(projectIdStr);
            issues[index].assignedTo = document.getElementById('select-assignee').value ? parseInt(document.getElementById('select-assignee').value) : null;
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
            assignedTo: document.getElementById('select-assignee').value ? parseInt(document.getElementById('select-assignee').value) : null,
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

                // Filter out the deleted issue
                issues = issues.filter(i => i.id !== deleteId);

                // Save the updated array back to local storage
                saveData("issues", issues);

                // Hide the modal
                const modalEl = document.getElementById('modal-create-ticket');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();

                // Refresh the Kanban board
                renderBoard();
            }
        });
    }
});
