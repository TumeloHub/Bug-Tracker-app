//LOCALSTORAGE HELPERS 
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// SEED DATA 
function seedData() {
  // Only seed if data doesn't exist yet
  if (loadData("people").length === 0) {
    const people = [
      { id: 1, name: "Tumi", surname: "Lepota", email: "tumi@email.com", username: "tumi01" },
      { id: 2, name: "Logan", surname: "von Wielligh", email: "vonwiellighlogan@gmail.com", username: "Tropsickcil" },
      { id: 3, name: "Boitemogelo", surname: "Smith", email: "Boitemogelo@email.com", username: "Boitemogelosmith" },
      { id: 4, name: "Ryan", surname: "Brown", email: "Ryan@email.com", username: "Rbrown" },
      { id: 5, name: "Emma", surname: "Wilson", email: "emma@email.com", username: "ewilson" }
    ];
    saveData("people", people);
  }

  if (loadData("projects").length === 0) {
    const projects = [
      { id: 1, name: "Bug Tracker System" },
      { id: 2, name: "Mobile App Fixes" },
      { id: 3, name: "Website Redesign" },
      { id: 4, name: "Payment System" }
    ];
    saveData("projects", projects);
  }

  if (loadData("issues").length === 0) {
    const issues = [
      { id: 1, summary: "Login button not working", description: "User cannot log in", identifiedBy: "tumi01", dateIdentified: "2026-04-01", projectId: 1, assignedTo: 2, status: "open", priority: "high", targetDate: "2026-04-15", actualDate: null, resolution: "" },
      { id: 2, summary: "Page crashes on submit", description: "Form submission breaks the app", identifiedBy: "logan01", dateIdentified: "2026-04-02", projectId: 1, assignedTo: 1, status: "overdue", priority: "medium", targetDate: "2026-04-10", actualDate: null, resolution: "" },
      { id: 3, summary: "Wrong colour on dashboard", description: "Buttons are red instead of blue", identifiedBy: "Boitemogelosmith", dateIdentified: "2026-04-03", projectId: 2, assignedTo: 3, status: "open", priority: "low", targetDate: "2026-04-20", actualDate: null, resolution: "" },
      { id: 4, summary: "Cannot upload profile picture", description: "Upload fails with 500 error", identifiedBy: "Rbrown", dateIdentified: "2026-04-04", projectId: 3, assignedTo: 4, status: "open", priority: "medium", targetDate: "2026-04-18", actualDate: null, resolution: "" },
      { id: 5, summary: "Search bar returns no results", description: "Search is broken", identifiedBy: "ewilson", dateIdentified: "2026-04-05", projectId: 1, assignedTo: 5, status: "open", priority: "high", targetDate: "2026-04-12", actualDate: null, resolution: "" },
      { id: 6, summary: "Dark mode not saving preference", description: "Preference resets on refresh", identifiedBy: "tumi01", dateIdentified: "2026-04-06", projectId: 2, assignedTo: null, status: "open", priority: "low", targetDate: "2026-04-25", actualDate: null, resolution: "" },
      { id: 7, summary: "Notification bell not working", description: "No alerts shown", identifiedBy: "logan01", dateIdentified: "2026-04-07", projectId: 4, assignedTo: 2, status: "resolved", priority: "medium", targetDate: "2026-04-08", actualDate: "2026-04-09", resolution: "Fixed backend issue" },
      { id: 8, summary: "Export to CSV button missing", description: "No export option", identifiedBy: "Boitemogelosmith", dateIdentified: "2026-04-08", projectId: 3, assignedTo: 3, status: "open", priority: "low", targetDate: "2026-04-22", actualDate: null, resolution: "" },
      { id: 9, summary: "Mobile view is broken", description: "Layout collapses on small screens", identifiedBy: "Rbrown", dateIdentified: "2026-04-09", projectId: 1, assignedTo: 1, status: "open", priority: "high", targetDate: "2026-04-16", actualDate: null, resolution: "" },
      { id: 10, summary: "Cannot delete comment", description: "Delete button does nothing", identifiedBy: "ewilson", dateIdentified: "2026-04-10", projectId: 2, assignedTo: 4, status: "open", priority: "medium", targetDate: "2026-04-19", actualDate: null, resolution: "" }
    ];
    saveData("issues", issues);
  }

  console.log("Data Foundation seeded successfully!");
  console.log("People:", loadData("people"));
  console.log("Projects:", loadData("projects"));
  console.log("Issues:", loadData("issues"));
}

// Run seeding
seedData();
