function containsProfanity(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    // Basic filter for common offensive/slur words
    const profanityRegex = /fuck|shit|bitch|asshole|cunt|bastard|retard|idiot|stupid|nigger|faggot|whore|slut/i;
    return profanityRegex.test(lower);
}

// Helper: Validate first name / surname
function isValidName(name) {
    if (!name || name.length < 2) return false;
    // Only letters, spaces, hyphens, apostrophes allowed
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    return nameRegex.test(name) && !containsProfanity(name);
}

// Render the Current Team Members list
function renderTeamMembers() {
    const people = loadData("people");
    const container = document.getElementById('list-team-members');
    if (!container) return;

    container.innerHTML = '';

    people.forEach(person => {
        // Check if user has a custom profile pic, otherwise use default UI Avatar
        const avatarUrl = person.profilePic
            ? person.profilePic
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name + '+' + person.surname)}&background=random&rounded=true&size=40`;

        const liHTML = `
            <li class="list-group-item d-flex justify-content-between align-items-center bg-white p-3">
                <div class="d-flex align-items-center gap-3">
                    <img src="${avatarUrl}" alt="Avatar" class="shadow-sm" style="width:40px;height:40px;border-radius:50%; object-fit: cover;">
                    <div>
                        <div class="text-dark fw-semibold">${person.name} ${person.surname}</div>
                        <div class="small text-muted">${person.email}</div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <div class="d-flex flex-column align-items-end">
                        <span class="badge bg-light text-dark border mb-1">@${person.username}</span>
                        <span class="badge bg-secondary rounded-pill font-monospace" style="font-size: 0.65rem;">USR-${person.id.toString().padStart(3, '0')}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" onclick="openEditUserModal(${person.id})">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                </div>
            </li>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = liHTML.trim();
        container.appendChild(tempDiv.firstElementChild);
    });
}

// Handle "Add Member" button with full validation
function handleAddTeamMember() {
    const firstName = document.getElementById('input-team-name').value.trim();
    const surname = document.getElementById('input-team-surname').value.trim();
    const email = document.getElementById('input-team-email').value.trim();
    const username = document.getElementById('input-team-username').value.trim();

    // === VALIDATION ===
    if (!isValidName(firstName)) {
        alert('First Name must be at least 2 characters and cannot contain slurs, numbers or special symbols.');
        return;
    }
    if (!isValidName(surname)) {
        alert('Surname must be at least 2 characters and cannot contain slurs, numbers or special symbols.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address (e.g. name@example.com)');
        return;
    }

    if (!username || username.length < 3 || /\s/.test(username)) {
        alert('Username must be at least 3 characters and contain no spaces.');
        return;
    }

    // Prevent duplicate usernames
    const people = loadData("people");
    if (people.some(p => p.username.toLowerCase() === username.toLowerCase())) {
        alert('This username already exists!');
        return;
    }

    // Generate next ID
    const maxId = people.length > 0 ? Math.max(...people.map(p => p.id)) : 0;
    const newId = maxId + 1;

    const newPerson = {
        id: newId,
        name: firstName,
        surname: surname,
        email: email,
        username: username
    };

    // Save
    people.push(newPerson);
    saveData("people", people);

    // Clear form
    document.getElementById('form-add-team-member').reset();

    // Refresh list instantly
    renderTeamMembers();

    // Refresh New Ticket dropdowns if modal is open
    const createModal = document.getElementById('modal-create-ticket');
    if (createModal && createModal.classList.contains('show')) {
        populatePeopleSelects();
    }

    console.log('New team member added:', newPerson);
}

// --- USER MANAGEMENT MENU LOGIC ---

// --- USER MANAGEMENT MENU LOGIC ---

// 1. Open the Edit User Modal
window.openEditUserModal = function (userId) {
    const people = loadData("people");
    const person = people.find(p => p.id === userId);
    if (!person) return;

    // Hide the Manage Team modal and show the Edit User modal
    const manageModal = bootstrap.Modal.getInstance(document.getElementById('modal-manage-team'));
    if (manageModal) manageModal.hide();

    // Populate the form fields
    document.getElementById('edit-team-id').value = person.id;
    document.getElementById('input-edit-team-name').value = person.name;
    document.getElementById('input-edit-team-surname').value = person.surname;
    document.getElementById('input-edit-team-email').value = person.email;
    document.getElementById('input-edit-team-username').value = person.username;

    // Set profile picture preview and ensure the cleared flag is reset
    const avatarUrl = person.profilePic ? person.profilePic : `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name + '+' + person.surname)}&background=random&rounded=true&size=80`;
    const previewImg = document.getElementById('edit-team-pfp-preview');
    previewImg.src = avatarUrl;
    previewImg.removeAttribute('data-cleared');

    // Clear the file input in case it was used previously
    document.getElementById('input-edit-pfp').value = "";

    const editModal = new bootstrap.Modal(document.getElementById('modal-edit-team-member'));
    editModal.show();
};

// 2. Handle Profile Picture Upload (Convert to Base64)
document.getElementById('input-edit-pfp').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewImg = document.getElementById('edit-team-pfp-preview');
            previewImg.src = e.target.result;
            previewImg.removeAttribute('data-cleared'); // User chose a new file, remove cleared flag
        };
        reader.readAsDataURL(file);
    }
});

// 2b. Handle Clear Profile Picture Button
document.getElementById('btn-clear-pfp').addEventListener('click', function () {
    const firstName = document.getElementById('input-edit-team-name').value.trim() || 'User';
    const surname = document.getElementById('input-edit-team-surname').value.trim() || '';
    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + '+' + surname)}&background=random&rounded=true&size=80`;

    const previewImg = document.getElementById('edit-team-pfp-preview');
    previewImg.src = defaultAvatarUrl;
    previewImg.setAttribute('data-cleared', 'true'); // Flag that the user wants to delete their custom PFP

    // Clear the file input so no accidental uploads happen
    document.getElementById('input-edit-pfp').value = "";
});

// 3. Save Edited User Details
document.getElementById('btn-update-team-member').addEventListener('click', function () {
    const userId = parseInt(document.getElementById('edit-team-id').value);
    const firstName = document.getElementById('input-edit-team-name').value.trim();
    const surname = document.getElementById('input-edit-team-surname').value.trim();
    const email = document.getElementById('input-edit-team-email').value.trim();
    const username = document.getElementById('input-edit-team-username').value.trim();

    const previewImg = document.getElementById('edit-team-pfp-preview');
    const profilePicSrc = previewImg.src;
    const isCleared = previewImg.getAttribute('data-cleared') === 'true';

    if (!isValidName(firstName) || !isValidName(surname)) {
        alert('Names must be valid and contain no special characters or numbers.');
        return;
    }

    let people = loadData("people");
    const index = people.findIndex(p => p.id === userId);

    if (index !== -1) {
        people[index].name = firstName;
        people[index].surname = surname;
        people[index].email = email;
        people[index].username = username;

        // NEW: Apply the correct image saving logic
        if (isCleared) {
            people[index].profilePic = null;
        } else if (profilePicSrc.startsWith('data:image')) {
            people[index].profilePic = profilePicSrc;
        }

        saveData("people", people);
        renderTeamMembers();

        // Close modal and return to Manage Team modal
        bootstrap.Modal.getInstance(document.getElementById('modal-edit-team-member')).hide();
        new bootstrap.Modal(document.getElementById('modal-manage-team')).show();

        // Re-render board and dropdowns to show updated user info
        if (typeof renderBoard === 'function') renderBoard();
        if (typeof populatePeopleSelects === 'function') populatePeopleSelects();
    }
});

// 4. Delete User
document.getElementById('btn-delete-team-member').addEventListener('click', function () {
    const userId = parseInt(document.getElementById('edit-team-id').value);

    if (confirm("Are you sure you want to delete this team member? Any assigned tickets will become unassigned.")) {
        let people = loadData("people");
        people = people.filter(p => p.id !== userId);
        saveData("people", people);

        // Remove user from any assigned issues
        let issues = loadData("issues");
        issues.forEach(issue => {
            if (issue.assignedTo === userId) issue.assignedTo = null;
        });
        saveData("issues", issues);

        renderTeamMembers();

        bootstrap.Modal.getInstance(document.getElementById('modal-edit-team-member')).hide();
        new bootstrap.Modal(document.getElementById('modal-manage-team')).show();

        if (typeof renderBoard === 'function') renderBoard();
    }
});