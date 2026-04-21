// ==================== INITIALISE APP ====================
window.addEventListener('load', () => {

    // Save Ticket button
    document.getElementById('btn-save-ticket').addEventListener('click', handleSaveTicket);

    // === Manage Team modal ===
    const manageTeamModal = document.getElementById('modal-manage-team');
    manageTeamModal.addEventListener('show.bs.modal', () => {
        renderTeamMembers();
    });
    document.getElementById('btn-save-team-member').addEventListener('click', handleAddTeamMember);

    // === Manage Projects modal ===
    const manageProjectsModal = document.getElementById('modal-manage-projects');
    manageProjectsModal.addEventListener('show.bs.modal', () => {
        renderProjects();           // show current projects when modal opens
    });

    // === Add Project button ===
    document.getElementById('btn-save-project').addEventListener('click', handleAddProject);

    // === CLEAR ALL TICKETS ===
    document.getElementById('btn-clear-all-tickets').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to permanently delete ALL tickets? The board will be completely emptied.")) {
            saveData("issues", []); // Overwrite with empty array
            renderBoard();          // Refresh board
        }
    });

    // === RESET TO DEFAULT TICKETS ===
    document.getElementById('btn-reset-default-tickets').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to restore the default tickets? Any custom tickets you've created will be permanently lost.")) {
            saveData("issues", []);
            localStorage.removeItem("issuesSeededBefore"); // <-- NEW: Bypass the popup when using the reset button
            seedData();
            renderBoard();
        }
    });


    // Render the board with seeded data on first load
    renderBoard();

    console.log('%c Bug Tracker fully loaded! Team + Projects now fully functional.', 'color: #4CAF50; font-weight: bold');
});