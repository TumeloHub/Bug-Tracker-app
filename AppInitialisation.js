    // ==================== INITIALISE APP ====================
   window.addEventListener('load', () => {
    // Populate dropdowns in the New Ticket modal every time it opens
    const createTicketModal = document.getElementById('modal-create-ticket');
    createTicketModal.addEventListener('show.bs.modal', () => {
        renderBoard();
        populateProjectSelect();
        populatePeopleSelects();

        // Default date identified to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('input-date-identified').value = today;
    });

    // Save Ticket button
    document.getElementById('btn-save-ticket').addEventListener('click', handleSaveTicket);

    // === Manage Team modal ===
    const manageTeamModal = document.getElementById('modal-manage-team');
    manageTeamModal.addEventListener('show.bs.modal', () => {
        renderTeamMembers();
    });
    document.getElementById('btn-save-team-member').addEventListener('click', handleAddTeamMember);

    // === NEW: Manage Projects modal ===
    const manageProjectsModal = document.getElementById('modal-manage-projects');
    manageProjectsModal.addEventListener('show.bs.modal', () => {
        renderProjects();           // show current projects when modal opens
    });

    // === NEW: Add Project button ===
    document.getElementById('btn-save-project').addEventListener('click', handleAddProject);

    // Render the board with seeded data on first load
    renderBoard();

    console.log('%c Bug Tracker fully loaded! Team + Projects now fully functional.', 'color: #4CAF50; font-weight: bold');
});