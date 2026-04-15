                                         // made this file to connect the html to the js.

document.addEventListener("DOMContentLoaded", () => {
    seedData();                    // Run seeding
              populateDropdowns();
 renderBoard();
 populateProjectsList();
             populateTeamList();

                        // Refresh when a new ticket modal opens
 document.getElementById("modal-create-ticket").addEventListener("show.bs.modal", () => {
        populateDropdowns();
    });
// Refresh when manage projects modal opens
         document.getElementById("modal-manage-projects").addEventListener("show.bs.modal", populateProjectsList);

// Refresh when Manage Team modal opens
    document.getElementById("modal-manage-team").addEventListener("show.bs.modal", populateTeamList);
});

        // Populate New Ticket dropdowns
function populateDropdowns() {
                  const people = loadData("people");
                     const projects = loadData("projects");

                       // Projects
         const projectSelect = document.getElementById("select-project");
        projectSelect.innerHTML = `<option value="" selected disabled>Select Project...</option>`;
                  projects.forEach(p => {
             const opt = document.createElement("option");
          opt.value = p.id;
               opt.textContent = p.name;
        projectSelect.appendChild(opt);
    });

    // Identified By
    const reporterSelect = document.getElementById("select-reporter");
                 reporterSelect.innerHTML = `<option value="" selected disabled>Select Team Member...</option>`;
            people.forEach(person => {
        const opt = document.createElement("option");
        opt.value = person.id;
        opt.textContent = `${person.name} ${person.surname}`;
        reporterSelect.appendChild(opt);
    });


  

    // Assigned To
  
    const assigneeSelect = document.getElementById("select-assignee");
    assigneeSelect.innerHTML = `<option value="" selected>Unassigned</option>`;
    people.forEach(person => {

      
               const opt = document.createElement("option");
         opt.value = person.id;
   opt.textContent = `${person.name} ${person.surname}`;
        assigneeSelect.appendChild(opt);
      
    });
}

// Populate Manage Projects modal
                   function populateProjectsList() {
    const projects = loadData("projects");
                    const list = document.getElementById("list-projects");
             list.innerHTML = "";

    projects.forEach(project => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center bg-white";
                         li.innerHTML = `
            <span class="text-dark fw-semibold">${project.name}</span>
            <span class="badge bg-secondary rounded-pill font-monospace">PRJ-00${project.id}</span>
        `;
                 list.appendChild(li);
    });
}

// Populate Manage Team modal

function populateTeamList() {
    const people = loadData("people");
    const list = document.getElementById("list-team-members");
    list.innerHTML = "";
  

    people.forEach(person => {
      
        const fullName = `${person.name} ${person.surname}`;
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center bg-white p-3";
        li.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <img src="https://ui-avatars.com/api/?name=${fullName}&background=random&rounded=true&size=40" 
                     alt="Avatar" class="shadow-sm">
                <div>
                    <div class="text-dark fw-semibold">${fullName}</div>
                    <div class="small text-muted">${person.email}</div>
                </div>
            </div>
            <div class="d-flex flex-column align-items-end">
                <span class="badge bg-light text-dark border mb-1">@${person.username}</span>
                <span class="badge bg-secondary rounded-pill font-monospace" style="font-size: 0.65rem;">USR-00${person.id}</span>
            </div>
        `;
        list.appendChild(li);
    });
  
}

// Render Kanban board

function renderBoard() {
    const issues = loadData("issues");

    document.getElementById("col-open").innerHTML = "";
    document.getElementById("col-in-progress").innerHTML = "";
    document.getElementById("col-overdue").innerHTML = "";
    document.getElementById("col-resolved").innerHTML = "";

    let countOpen = 0, countInProgress = 0, countOverdue = 0, countResolved = 0;

    issues.forEach(issue => {
        const projectName = loadData("projects").find(p => p.id === issue.projectId)?.name || "Unknown";
        const assigneeName = issue.assignedTo 
            ? loadData("people").find(p => p.id === issue.assignedTo)?.name || "Unassigned" 
            : "Unassigned";

        const cardHTML = `
            <div class="card border-0 shadow-sm mb-2 ticket-card">
                <div class="card-body p-3">
                    <p class="card-text fw-semibold mb-2">${issue.summary}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div class="d-flex gap-1">
                            <span class="badge bg-${issue.priority === 'high' ? 'danger' : issue.priority === 'medium' ? 'warning' : 'success'} text-dark rounded-pill">${issue.priority}</span>
                            <span class="badge bg-info text-dark rounded-pill">${projectName}</span>
                        </div>
                        <span class="small fw-semibold text-muted">${assigneeName}</span>
                    </div>
                </div>
            </div>
        `;

        if (issue.status === "open") { document.getElementById("col-open").innerHTML += cardHTML; countOpen++; }
        else if (issue.status === "in-progress") { document.getElementById("col-in-progress").innerHTML += cardHTML; countInProgress++; }
        else if (issue.status === "overdue") { document.getElementById("col-overdue").innerHTML += cardHTML; countOverdue++; }
        else if (issue.status === "resolved") { document.getElementById("col-resolved").innerHTML += cardHTML; countResolved++; }
    });

    document.getElementById("count-open").textContent = countOpen;
    document.getElementById("count-in-progress").textContent = countInProgress;
    document.getElementById("count-overdue").textContent = countOverdue;
    document.getElementById("count-resolved").textContent = countResolved;
  
}
