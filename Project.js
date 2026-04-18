function renderProjects() {
    const projects = loadData("projects");
    const container = document.getElementById('list-projects');
    if (!container) return;

    container.innerHTML = '';   // clear static placeholders

    projects.forEach(project => {
        const liHTML = `
            <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                <span class="text-dark fw-semibold">${project.name}</span>
                <span class="badge bg-secondary rounded-pill font-monospace">
                    PRJ-${project.id.toString().padStart(3, '0')}
                </span>
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