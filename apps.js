                                         // made this file to connect the seed data to the HTML and stuff

document.addEventListener("DOMContentLoaded", () => {
    seedData();           // Running the seed once
    populateDropdowns();
    renderBoard();

                         // Refreshing the dropdowns when new ticket modal opens
    const modal = document.getElementById("modal-create-ticket");
    if (modal) {
        modal.addEventListener("show.bs.modal", populateDropdowns);
    }
  });

// Populate dropdowns 
function populateDropdowns()
{
    const people = loadData("people");
    const projects = loadData("projects");

    // Projectsdropdown
    const projectSelect = document.getElementById("select-project");
       projectSelect.innerHTML = `<option value="" selected disabled>Select Project...</option>`;
                projects.forEach(p => {
     const option = document.createElement("option");
      option.value = p.id;
        option.textContent = p.name;
        projectSelect.appendChild(option);
    });

    // Identified By (Reporter)  dropdown
           const reporterSelect = document.getElementById("select-reporter");
    reporterSelect.innerHTML = `<option value="" selected disabled>Select Team Member...</option>`;
    people.forEach(person =>    {
        const option = document.createElement("option");
      
        option.value = person.id;
      
        option.textContent = `${person.name} ${person.surname}`;
        reporterSelect.appendChild(option);
    });

    // Assigned To dropdown

  
    const assigneeSelect = document.getElementById("select-assignee");
    assigneeSelect.innerHTML = `<option value="" selected>Unassigned</option>`;
    people.forEach(person => {
        const option = document.createElement("option");
        option.value = person.id;
        option.textContent = `${person.name} ${person.surname}`;
        assigneeSelect.appendChild(option);
    });
}

            // Rendering the issues on the Kanban board
function renderBoard() {
                   const issues = loadData("issues");

    // Clearing all the hardcoded cards overheree
    document.getElementById("col-open").innerHTML = "";
    document.getElementById("col-in-progress").innerHTML = "";
    document.getElementById("col-overdue").innerHTML = "";
    document.getElementById("col-resolved").innerHTML = "";

        let countOpen = 0;
    let countInProgress = 0;
    let countOverdue = 0;
    let countResolved = 0;

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
                            <span class="badge bg-${issue.priority === 'high' ? 'danger' : issue.priority === 'medium' ? 'warning' : 'success'} text-dark rounded-pill">
                                ${issue.priority}
                            </span>
                            <span class="badge bg-info text-dark rounded-pill">${projectName}</span>
                        </div>
                        <span class="small fw-semibold text-muted">${assigneeName}</span>
                    </div>
                </div>
            </div>
        `;

        if (issue.status === "open") {
            document.getElementById("col-open").innerHTML += cardHTML;
            countOpen++;
        }                       
        else if (issue.status === "in-progress") {
            document.getElementById("col-in-progress").innerHTML += cardHTML;
            countInProgress++;
        }    
        else if (issue.status === "overdue") {
            document.getElementById("col-overdue").innerHTML += cardHTML;
            countOverdue++;
             
        }              else if (issue.status === "resolved") {
            document.getElementById("col-resolved").innerHTML += cardHTML;
            countResolved++;
        }
    });

    // Update count badges
    document.getElementById("count-open").textContent = countOpen;
    document.getElementById("count-in-progress").textContent = countInProgress;
    document.getElementById("count-overdue").textContent = countOverdue;
    document.getElementById("count-resolved").textContent = countResolved;
}
