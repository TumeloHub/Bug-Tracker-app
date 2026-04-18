function getPriorityBadgeClass(priority) {
            switch (priority.toLowerCase()) {
                case 'high': return 'bg-danger';
                case 'medium': return 'bg-warning text-dark';
                case 'low': return 'bg-success';
                default: return 'bg-secondary';
            }
        }

        // Create a single ticket card element
        function createTicketCard(issue, personMap, projectMap) {
            const person = issue.assignedTo ? personMap[issue.assignedTo] : null;
            const assigneeFull = person 
                ? `${person.name} ${person.surname}` 
                : 'Unassigned';
            const assigneeShort = person 
                ? `${person.name} ${person.surname.charAt(0)}.` 
                : 'Unassigned';
            
            const avatarUrl = person 
                ? `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name + '+' + person.surname)}&background=random&rounded=true&size=28`
                : '';
            
            const projectName = projectMap[issue.projectId] || 'Unknown Project';

            const cardHTML = `
                <div class="card border-0 shadow-sm mb-2 ticket-card" data-issue-id="${issue.id}">
                    <div class="card-body p-3">
                        <p class="card-text fw-semibold mb-2 text-dark text-break">${issue.summary}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div class="d-flex gap-1">
                                <span class="badge ${getPriorityBadgeClass(issue.priority)} rounded-pill">
                                    ${issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                                </span>
                                <span class="badge bg-info text-dark rounded-pill">${projectName}</span>
                            </div>
                            <div class="d-flex align-items-center gap-2" title="Assigned to: ${assigneeFull}">
                                <span class="small fw-semibold text-muted">${assigneeShort}</span>
                                ${person ? `<img src="${avatarUrl}" alt="Avatar" class="shadow-sm" style="width:28px;height:28px;border-radius:50%;">` : ''}
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

            // Gather form data
            const newIssue = {
                id: null, // will be set below
                summary: summary,
                description: document.getElementById('input-description').value.trim(),
                identifiedBy: reporter,
                dateIdentified: document.getElementById('input-date-identified').value || new Date().toISOString().split('T')[0],
                projectId: parseInt(projectIdStr),
                assignedTo: document.getElementById('select-assignee').value 
                            ? parseInt(document.getElementById('select-assignee').value) 
                            : null,
                status: document.getElementById('select-status').value,
                priority: document.getElementById('select-priority').value,
                targetDate: document.getElementById('input-date-target').value || null,
                actualDate: null,
                resolution: ''
            };

            // If status is resolved, fill actual date + resolution
            if (newIssue.status === 'resolved') {
                newIssue.actualDate = document.getElementById('input-date-actual').value || new Date().toISOString().split('T')[0];
                newIssue.resolution = document.getElementById('input-resolution-summary').value.trim();
            }

            // Get current issues and generate next ID
            let issues = loadData("issues");
            const maxId = issues.length > 0 ? Math.max(...issues.map(i => i.id)) : 0;
            newIssue.id = maxId + 1;

            // Add and save
            issues.push(newIssue);
            saveData("issues", issues);

            // Close modal and refresh board
            const modal = bootstrap.Modal.getInstance(document.getElementById('modal-create-ticket'));
            if (modal) modal.hide();

            // Reset form
            document.getElementById('form-ticket').reset();

            // Show the new issue in the correct column
            renderBoard();
        }