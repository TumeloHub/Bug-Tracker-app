function renderProjects() {
    const projects = loadData("projects");
    const container = document.getElementById('list-projects');
    if (!container) return;

    container.innerHTML = '';   // clear static placeholders

    projects.forEach(project => {
        const liHTML = `
            <li class="list-group-item d-flex justify-content-between align-items-center bg-white p-3">
                <span class="text-dark fw-semibold">${project.name}</span>
                <div class="d-flex align-items-center gap-3">
                    <span class="badge bg-secondary rounded-pill font-monospace">
                        PRJ-${project.id.toString().padStart(3, '0')}
                    </span>
                    <button class="btn btn-sm btn-outline-danger shadow-sm" onclick="deleteProject(${project.id})" title="Delete Project">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </div>
            </li>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = liHTML.trim();
        container.appendChild(tempDiv.firstElementChild);
    });
}

// Handle "Add Project" button click
function handleAddProject() {
    const projectName = document.getElementById('input-project-name').value.trim();

    if (!projectName || projectName.length < 3) {
        alert('Project name must be at least 3 characters long.');
        return;
    }

    let projects = loadData("projects");

    // Enforce maximum of 10 projects
    if (projects.length >= 10) {
        alert('Maximum of 10 projects allowed!');
        return;
    }

    // Prevent duplicate project names
    if (projects.some(p => p.name.toLowerCase() === projectName.toLowerCase())) {
        alert('A project with this name already exists!');
        return;
    }

    // Generate next ID
    const maxId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) : 0;
    const newId = maxId + 1;

    const newProject = {
        id: newId,
        name: projectName
    };

    projects.push(newProject);
    saveData("projects", projects);

    // Clear the input field
    document.getElementById('input-project-name').value = '';

    // Refresh the list immediately
    renderProjects();

    // If New Ticket modal is open, refresh its Project dropdown too
    const createModal = document.getElementById('modal-create-ticket');
    if (createModal && createModal.classList.contains('show')) {
        populateProjectSelect();
    }

    console.log('New project added:', newProject);
}

// Handle Project Deletion
window.deleteProject = function (projectId) {
    // 1. Confirm with the user, warning them about cascading deletions
    if (confirm("Are you sure you want to delete this project? ALL tickets associated with this project will also be permanently deleted. This action cannot be undone.")) {

        // 2. Remove the project
        let projects = loadData("projects");
        projects = projects.filter(p => p.id !== projectId);
        saveData("projects", projects);

        // 3. Remove all associated issues
        let issues = loadData("issues");
        issues = issues.filter(issue => issue.projectId !== projectId);
        saveData("issues", issues);

        // 4. Update the UI
        renderProjects();

        // Update the Kanban board to reflect deleted tickets
        if (typeof renderBoard === 'function') renderBoard();

        // Update the dropdown menus in case the ticket modal is opened later
        if (typeof populateProjectSelect === 'function') populateProjectSelect();
    }
};