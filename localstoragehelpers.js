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
  // 1. Seed People
  if (loadData("people").length === 0) {
    const people = [
      { id: 1, name: "Tumi", surname: "Lepota", email: "tumi@email.com", username: "tumi01", profilePic: "default-pfps/pfp-generic-1.png" },
      { id: 2, name: "Logan", surname: "Doe", email: "doelogan@gmail.com", username: "Tropsickcil", profilePic: "default-pfps/pfp-generic-2.png" },
      { id: 3, name: "Boitemogelo", surname: "Smith", email: "Boitemogelo@email.com", username: "Boitemogelosmith", profilePic: "default-pfps/pfp-generic-3.png" },
      { id: 4, name: "Ryan", surname: "Brown", email: "Ryan@email.com", username: "Rbrown", profilePic: "default-pfps/pfp-generic-4.png" },
      { id: 5, name: "Emma", surname: "Wilson", email: "emma@email.com", username: "ewilson", profilePic: null }
    ];
    saveData("people", people);
  }

  // 2. Seed Projects
  if (loadData("projects").length === 0) {
    const projects = [
      { id: 1, name: "Bug Tracker System" },
      { id: 2, name: "Mobile App Fixes" },
      { id: 3, name: "Website Redesign" },
      { id: 4, name: "Payment System" }
    ];
    saveData("projects", projects);
  }

  // 3. Seed Issues (with Cancel protection)
  if (loadData("issues").length === 0) {
    let shouldSeed = true;

    // Check if we have seeded before. If yes, prompt the user.
    if (localStorage.getItem("issuesSeededBefore") === "true") {
      shouldSeed = confirm("Your board is empty. Would you like to reload the default sample tickets?");
    } else {
      // First time load: mark as seeded so future clears will trigger the prompt
      localStorage.setItem("issuesSeededBefore", "true");
    }

    if (shouldSeed) {
      const issues = [
        // 1-5
        { id: 1, summary: "Login button not working", description: "User cannot log in", identifiedBy: "tumi01", dateIdentified: "2026-04-10", projectId: 1, assignedTo: null, status: "open", priority: "high", targetDate: "2026-04-26", actualDate: null, resolution: "" },
        { id: 2, summary: "Page crashes on submit", description: "Form submission breaks the app", identifiedBy: "Tropsickcil", dateIdentified: "2026-04-05", projectId: 1, assignedTo: 1, status: "overdue", priority: "medium", targetDate: "2026-04-15", actualDate: null, resolution: "" },
        { id: 3, summary: "Wrong colour on dashboard", description: "Buttons are red instead of blue", identifiedBy: "Boitemogelosmith", dateIdentified: "2026-04-12", projectId: 2, assignedTo: null, status: "open", priority: "low", targetDate: "2026-04-28", actualDate: null, resolution: "" },
        { id: 4, summary: "Cannot upload profile picture", description: "Upload fails with 500 error", identifiedBy: "Rbrown", dateIdentified: "2026-04-01", projectId: 3, assignedTo: 4, status: "resolved", priority: "medium", targetDate: "2026-04-10", actualDate: "2026-04-09", resolution: "Increased payload limit in Nginx config." },
        { id: 5, summary: "Search bar returns no results", description: "Search is broken", identifiedBy: "ewilson", dateIdentified: "2026-04-15", projectId: 1, assignedTo: null, status: "open", priority: "high", targetDate: "2026-04-27", actualDate: null, resolution: "" },

        // 6-10
        { id: 6, summary: "Dark mode not saving preference", description: "Preference resets on refresh", identifiedBy: "tumi01", dateIdentified: "2026-04-02", projectId: 2, assignedTo: 2, status: "resolved", priority: "low", targetDate: "2026-04-12", actualDate: "2026-04-13", resolution: "Fixed local storage key typo in theme manager." },
        { id: 7, summary: "Notification bell not working", description: "No alerts shown", identifiedBy: "Tropsickcil", dateIdentified: "2026-04-18", projectId: 4, assignedTo: 2, status: "in-progress", priority: "medium", targetDate: "2026-04-28", actualDate: null, resolution: "" },
        { id: 8, summary: "Export to CSV button missing", description: "No export option", identifiedBy: "Boitemogelosmith", dateIdentified: "2026-04-08", projectId: 3, assignedTo: 3, status: "overdue", priority: "low", targetDate: "2026-04-20", actualDate: null, resolution: "" },
        { id: 9, summary: "Mobile view is broken", description: "Layout collapses on small screens", identifiedBy: "Rbrown", dateIdentified: "2026-04-20", projectId: 1, assignedTo: 1, status: "in-progress", priority: "high", targetDate: "2026-05-02", actualDate: null, resolution: "" },
        { id: 10, summary: "Cannot delete comment", description: "Delete button does nothing", identifiedBy: "ewilson", dateIdentified: "2026-04-10", projectId: 2, assignedTo: 4, status: "resolved", priority: "medium", targetDate: "2026-04-18", actualDate: "2026-04-18", resolution: "Added missing delete route to backend API." },

        // 11-15 
        { id: 11, summary: "Session timeout too short", description: "Users logged out after 5 mins", identifiedBy: "tumi01", dateIdentified: "2026-04-21", projectId: 1, assignedTo: null, status: "open", priority: "medium", targetDate: "2026-05-05", actualDate: null, resolution: "" },
        { id: 12, summary: "Incorrect currency symbol", description: "Showing $ instead of ZAR", identifiedBy: "Boitemogelosmith", dateIdentified: "2026-04-22", projectId: 4, assignedTo: 5, status: "in-progress", priority: "high", targetDate: "2026-04-30", actualDate: null, resolution: "" },
        { id: 13, summary: "API rate limit reached quickly", description: "Needs optimization", identifiedBy: "Tropsickcil", dateIdentified: "2026-04-05", projectId: 2, assignedTo: 3, status: "resolved", priority: "high", targetDate: "2026-04-15", actualDate: "2026-04-14", resolution: "Implemented Redis caching for frequent queries." },
        { id: 14, summary: "Email verification link broken", description: "Link throws 404", identifiedBy: "Rbrown", dateIdentified: "2026-04-10", projectId: 1, assignedTo: 2, status: "overdue", priority: "high", targetDate: "2026-04-22", actualDate: null, resolution: "" },
        { id: 15, summary: "Footer misaligned", description: "Footer overlapping with content", identifiedBy: "ewilson", dateIdentified: "2026-04-23", projectId: 3, assignedTo: null, status: "open", priority: "low", targetDate: "2026-05-10", actualDate: null, resolution: "" },

        // 16-20
        { id: 16, summary: "Password reset not sending", description: "No email received", identifiedBy: "tumi01", dateIdentified: "2026-04-19", projectId: 1, assignedTo: 4, status: "in-progress", priority: "high", targetDate: "2026-04-26", actualDate: null, resolution: "" },
        { id: 17, summary: "Slow database queries", description: "Dashboard takes 10s to load", identifiedBy: "Boitemogelosmith", dateIdentified: "2026-04-07", projectId: 2, assignedTo: 1, status: "resolved", priority: "high", targetDate: "2026-04-14", actualDate: "2026-04-15", resolution: "Added indexes to users and projects tables." },
        { id: 18, summary: "Missing translation strings", description: "French version has English text", identifiedBy: "Rbrown", dateIdentified: "2026-04-15", projectId: 3, assignedTo: null, status: "open", priority: "medium", targetDate: "2026-04-27", actualDate: null, resolution: "" },
        { id: 19, summary: "Double billing issue", description: "Users charged twice", identifiedBy: "ewilson", dateIdentified: "2026-04-11", projectId: 4, assignedTo: 5, status: "overdue", priority: "high", targetDate: "2026-04-21", actualDate: null, resolution: "" },
        { id: 20, summary: "Drag and drop glitch", description: "Items drop in wrong column", identifiedBy: "Tropsickcil", dateIdentified: "2026-04-20", projectId: 1, assignedTo: 2, status: "in-progress", priority: "medium", targetDate: "2026-05-01", actualDate: null, resolution: "" }
      ];
      saveData("issues", issues);
    }
  }

  console.log("Data Foundation seeded successfully!");
}

// Run seeding on load
seedData();
