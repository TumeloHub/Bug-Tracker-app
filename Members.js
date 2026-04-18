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
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name + '+' + person.surname)}&background=random&rounded=true&size=40`;

        const liHTML = `
            <li class="list-group-item d-flex justify-content-between align-items-center bg-white p-3">
                <div class="d-flex align-items-center gap-3">
                    <img src="${avatarUrl}" alt="Avatar" class="shadow-sm" style="width:40px;height:40px;border-radius:50%;">
                    <div>
                        <div class="text-dark fw-semibold">${person.name} ${person.surname}</div>
                        <div class="small text-muted">${person.email}</div>
                    </div>
                </div>
                <div class="d-flex flex-column align-items-end">
                    <span class="badge bg-light text-dark border mb-1">@${person.username}</span>
                    <span class="badge bg-secondary rounded-pill font-monospace" style="font-size: 0.65rem;">USR-${person.id.toString().padStart(3, '0')}</span>
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
    const surname   = document.getElementById('input-team-surname').value.trim();
    const email     = document.getElementById('input-team-email').value.trim();
    const username  = document.getElementById('input-team-username').value.trim();

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