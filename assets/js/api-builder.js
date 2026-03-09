// ===== API Builder - Main Application =====

document.addEventListener('DOMContentLoaded', () => {
    const folderTree = document.getElementById('folder-tree');
    const btnNewFolder = document.getElementById('btn-new-folder');

    // Modal elements
    const createFolderModal = new bootstrap.Modal(document.getElementById('createFolderModal'));
    const folderNameInput = document.getElementById('folder-name-input');
    const btnConfirmFolder = document.getElementById('btn-confirm-folder');

    const createRequestModal = new bootstrap.Modal(document.getElementById('createRequestModal'));
    const requestNameInput = document.getElementById('request-name-input');
    const requestMethodInput = document.getElementById('request-method-input');
    const btnConfirmRequest = document.getElementById('btn-confirm-request');

    // Track which folder the "new request" modal targets
    let pendingRequestFolderId = null;

    // ---- Method badge colors ----
    const METHOD_COLORS = {
        GET:    'text-success',
        POST:   'text-primary',
        PUT:    'text-warning',
        DELETE: 'text-danger'
    };

    // ---- Render sidebar ----
    function renderFolderTree() {
        const folders = ApiStorage.getFolders();
        folderTree.innerHTML = '';

        if (folders.length === 0) {
            folderTree.innerHTML = '<p class="text-muted small text-center mt-3">No folders yet.</p>';
            return;
        }

        folders.forEach(folder => {
            const folderEl = document.createElement('div');
            folderEl.className = 'folder-item mb-1';
            folderEl.dataset.folderId = folder.id;

            // Folder header
            const header = document.createElement('div');
            header.className = 'folder-header d-flex align-items-center justify-content-between px-2 py-1 rounded';

            const left = document.createElement('div');
            left.className = 'd-flex align-items-center gap-1 folder-toggle';
            left.style.cursor = 'pointer';
            left.innerHTML = `
                <span class="folder-chevron">&#9654;</span>
                <span class="folder-name small fw-semibold">${escapeHtml(folder.name)}</span>
            `;

            const actions = document.createElement('div');
            actions.className = 'd-flex gap-1 folder-actions';
            actions.innerHTML = `
                <button class="btn btn-sm btn-outline-warning border-0 py-0 px-1 btn-add-request" title="Add Request">+</button>
                <button class="btn btn-sm btn-outline-danger border-0 py-0 px-1 btn-delete-folder" title="Delete Folder">&times;</button>
            `;

            header.appendChild(left);
            header.appendChild(actions);
            folderEl.appendChild(header);

            // Request list (collapsible)
            const requestList = document.createElement('div');
            requestList.className = 'request-list ps-3 d-none';

            folder.requests.forEach(req => {
                const reqEl = document.createElement('div');
                reqEl.className = 'request-item d-flex align-items-center justify-content-between px-2 py-1 rounded';
                reqEl.dataset.requestId = req.id;
                reqEl.dataset.folderId = folder.id;

                const methodClass = METHOD_COLORS[req.method] || 'text-secondary';
                reqEl.innerHTML = `
                    <div class="d-flex align-items-center gap-2">
                        <span class="method-badge ${methodClass} fw-bold small">${req.method}</span>
                        <span class="request-name small">${escapeHtml(req.name)}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger border-0 py-0 px-1 btn-delete-request" title="Delete Request">&times;</button>
                `;

                requestList.appendChild(reqEl);
            });

            folderEl.appendChild(requestList);
            folderTree.appendChild(folderEl);
        });
    }

    // ---- Folder toggle (expand/collapse) ----
    folderTree.addEventListener('click', (e) => {
        const toggle = e.target.closest('.folder-toggle');
        if (toggle) {
            const folderItem = toggle.closest('.folder-item');
            const requestList = folderItem.querySelector('.request-list');
            const chevron = folderItem.querySelector('.folder-chevron');
            requestList.classList.toggle('d-none');
            chevron.classList.toggle('open');
            return;
        }

        // Add request button
        const addBtn = e.target.closest('.btn-add-request');
        if (addBtn) {
            const folderId = addBtn.closest('.folder-item').dataset.folderId;
            openCreateRequestModal(folderId);
            return;
        }

        // Delete folder button
        const delFolderBtn = e.target.closest('.btn-delete-folder');
        if (delFolderBtn) {
            const folderId = delFolderBtn.closest('.folder-item').dataset.folderId;
            ApiStorage.deleteFolder(folderId);
            renderFolderTree();
            return;
        }

        // Delete request button
        const delReqBtn = e.target.closest('.btn-delete-request');
        if (delReqBtn) {
            const reqItem = delReqBtn.closest('.request-item');
            ApiStorage.deleteRequest(reqItem.dataset.folderId, reqItem.dataset.requestId);
            renderFolderTree();
            return;
        }

        // Click on a request item (select it)
        const reqItem = e.target.closest('.request-item');
        if (reqItem) {
            selectRequest(reqItem.dataset.folderId, reqItem.dataset.requestId);
            return;
        }
    });

    // ---- Select a request (highlight in sidebar) ----
    function selectRequest(folderId, requestId) {
        // Remove previous selection
        folderTree.querySelectorAll('.request-item.active').forEach(el => el.classList.remove('active'));
        // Highlight new
        const el = folderTree.querySelector(`.request-item[data-request-id="${requestId}"]`);
        if (el) el.classList.add('active');
        // TODO: Load request details into main area (Step 3+)
    }

    // ---- Create Folder ----
    btnNewFolder.addEventListener('click', () => {
        folderNameInput.value = '';
        createFolderModal.show();
        // Focus input after modal is shown
        document.getElementById('createFolderModal').addEventListener('shown.bs.modal', () => {
            folderNameInput.focus();
        }, { once: true });
    });

    btnConfirmFolder.addEventListener('click', () => {
        const name = folderNameInput.value.trim();
        if (!name) return;
        ApiStorage.createFolder(name);
        createFolderModal.hide();
        renderFolderTree();
    });

    // Enter key support for folder modal
    folderNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btnConfirmFolder.click();
    });

    // ---- Create Request ----
    function openCreateRequestModal(folderId) {
        pendingRequestFolderId = folderId;
        requestNameInput.value = '';
        requestMethodInput.value = 'GET';
        createRequestModal.show();
        document.getElementById('createRequestModal').addEventListener('shown.bs.modal', () => {
            requestNameInput.focus();
        }, { once: true });
    }

    btnConfirmRequest.addEventListener('click', () => {
        const name = requestNameInput.value.trim();
        const method = requestMethodInput.value;
        if (!name || !pendingRequestFolderId) return;
        ApiStorage.createRequest(pendingRequestFolderId, name, method);
        createRequestModal.hide();
        renderFolderTree();
    });

    // Enter key support for request modal
    requestNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btnConfirmRequest.click();
    });

    // ---- Utility ----
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---- Init ----
    renderFolderTree();
});
