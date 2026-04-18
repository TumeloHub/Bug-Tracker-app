function enableDragOnCard(card, issueId) {
            card.setAttribute('draggable', 'true');

            card.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', issueId.toString());
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => card.classList.remove('dragging'));
        }

        function handleDrop(issueId, targetStatus) {
            let issues = loadData("issues");
            const index = issues.findIndex(i => i.id === issueId);
            if (index === -1) return;

            const issue = issues[index];
            if (issue.status === targetStatus) return;

            issue.status = targetStatus;
            if (targetStatus === 'resolved' && !issue.actualDate) {
                issue.actualDate = new Date().toISOString().split('T')[0];
            }

            saveData("issues", issues);
            renderBoard();

            setTimeout(() => {
                const movedCard = document.querySelector(`[data-issue-id="${issueId}"]`);
                if (movedCard) {
                    movedCard.classList.add('dropping');
                    setTimeout(() => movedCard.classList.remove('dropping'), 450);
                }
            }, 30);
        }

        function initDragAndDrop() {
            const columnData = [
                { id: 'col-open', status: 'open' },
                { id: 'col-in-progress', status: 'in-progress' },
                { id: 'col-overdue', status: 'overdue' },
                { id: 'col-resolved', status: 'resolved' }
            ];

            columnData.forEach(({ id, status }) => {
                const container = document.getElementById(id);
                if (!container) return;

                container.addEventListener('dragover', e => { e.preventDefault(); container.classList.add('dragover'); });
                container.addEventListener('dragleave', () => container.classList.remove('dragover'));
                container.addEventListener('drop', e => {
                    e.preventDefault();
                    container.classList.remove('dragover');
                    const issueId = parseInt(e.dataTransfer.getData('text/plain'));
                    if (!isNaN(issueId)) handleDrop(issueId, status);
                });
            });

            // This is the fix: enable drag events on ALL cards immediately
            function reEnableDragEvents() {
                document.querySelectorAll('.ticket-card').forEach(card => {
                    const id = parseInt(card.getAttribute('data-issue-id'));
                    if (id) enableDragOnCard(card, id);
                });
            }

            // Make sure it runs after every render (including the very first one)
            const originalRender = window.renderBoard;
            window.renderBoard = function () {
                originalRender();
                reEnableDragEvents();
            };

            // Also run it once right now for the initial board
            reEnableDragEvents();
        }
        
        initDragAndDrop();