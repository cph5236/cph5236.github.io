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

    // Editor elements
    const emptyState = document.getElementById('empty-state');
    const requestEditor = document.getElementById('request-editor');
    const editorMethod = document.getElementById('editor-method');
    const editorUrl = document.getElementById('editor-url');
    const btnSend = document.getElementById('btn-send');
    const btnSave = document.getElementById('btn-save');
    const urlValidation = document.getElementById('url-validation');

    // Tab elements
    const tabBodyItem = document.getElementById('tab-body-item');
    const tabBody = document.getElementById('tab-body');
    const tabHeaders = document.getElementById('tab-headers');

    // Headers tab elements
    const headersContainer = document.getElementById('headers-table-container');
    const btnAddHeader = document.getElementById('btn-add-header');
    const headerPresets = document.getElementById('header-presets');

    // Body tab elements
    const bodyEditor = document.getElementById('body-editor');
    const btnFormatBody = document.getElementById('btn-format-body');
    const bodyValidation = document.getElementById('body-validation');

    // Params tab elements
    const paramsContainer = document.getElementById('params-table-container');
    const btnAddParam = document.getElementById('btn-add-param');
    const paramsUrlPreview = document.getElementById('params-url-preview');
    const paramsUrlPreviewText = document.getElementById('params-url-preview-text');

    // Track which folder the "new request" modal targets
    let pendingRequestFolderId = null;

    // Currently selected request
    let selectedFolderId = null;
    let selectedRequestId = null;

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
            requestList.className = 'request-list ps-3';
            // Auto-expand folder that contains the selected request
            const hasSelected = folder.requests.some(r => r.id === selectedRequestId);
            if (!hasSelected) requestList.classList.add('d-none');
            else {
                const chevron = left.querySelector('.folder-chevron');
                if (chevron) chevron.classList.add('open');
            }

            folder.requests.forEach(req => {
                const reqEl = document.createElement('div');
                reqEl.className = 'request-item d-flex align-items-center justify-content-between px-2 py-1 rounded';
                if (req.id === selectedRequestId) reqEl.classList.add('active');
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
            // If the selected request was in this folder, clear selection
            if (folderId === selectedFolderId) {
                clearSelection();
            }
            ApiStorage.deleteFolder(folderId);
            renderFolderTree();
            return;
        }

        // Delete request button
        const delReqBtn = e.target.closest('.btn-delete-request');
        if (delReqBtn) {
            const reqItem = delReqBtn.closest('.request-item');
            const folderId = reqItem.dataset.folderId;
            const requestId = reqItem.dataset.requestId;
            // If deleting the selected request, clear selection
            if (requestId === selectedRequestId) {
                clearSelection();
            }
            ApiStorage.deleteRequest(folderId, requestId);
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

    // ---- Select a request (load into editor) ----
    function selectRequest(folderId, requestId) {
        selectedFolderId = folderId;
        selectedRequestId = requestId;

        // Highlight in sidebar
        folderTree.querySelectorAll('.request-item.active').forEach(el => el.classList.remove('active'));
        const el = folderTree.querySelector(`.request-item[data-request-id="${requestId}"]`);
        if (el) el.classList.add('active');

        // Load request data into editor
        const req = ApiStorage.getRequest(folderId, requestId);
        if (!req) return;

        editorMethod.value = req.method;
        editorUrl.value = req.url || '';
        updateMethodSelectColor();
        updateBodyTabVisibility();
        validateUrl();
        renderHeaders(req.headers);
        renderParams(req.params);
        renderBody(req.body);

        // Reset to Headers tab
        bootstrap.Tab.getOrCreateInstance(tabHeaders).show();

        // Show editor, hide empty state
        emptyState.classList.add('d-none');
        requestEditor.classList.remove('d-none');
        requestEditor.classList.add('d-flex');
    }

    // ---- Clear selection ----
    function clearSelection() {
        selectedFolderId = null;
        selectedRequestId = null;
        editorUrl.value = '';
        editorMethod.value = 'GET';
        updateMethodSelectColor();
        hideUrlValidation();
        renderHeaders({});
        renderParams({});
        renderBody(null);

        requestEditor.classList.add('d-none');
        requestEditor.classList.remove('d-flex');
        emptyState.classList.remove('d-none');
    }

    // ---- Save request ----
    btnSave.addEventListener('click', () => {
        if (!selectedFolderId || !selectedRequestId) return;
        const updates = {
            method: editorMethod.value,
            url: editorUrl.value.trim(),
            headers: getHeadersFromUI(),
            params: getParamsFromUI(),
            body: getBodyFromUI()
        };
        ApiStorage.updateRequest(selectedFolderId, selectedRequestId, updates);
        // Re-render sidebar to update method badge
        renderFolderTree();
        // Flash save feedback
        btnSave.textContent = 'Saved!';
        setTimeout(() => { btnSave.textContent = 'Save'; }, 1000);
    });

    // ---- URL validation ----
    function validateUrl() {
        const url = editorUrl.value.trim();
        if (!url) {
            hideUrlValidation();
            btnSend.disabled = true;
            return false;
        }
        try {
            new URL(url);
            hideUrlValidation();
            btnSend.disabled = false;
            return true;
        } catch {
            urlValidation.textContent = 'Enter a valid URL (e.g. https://api.example.com)';
            urlValidation.classList.remove('d-none');
            btnSend.disabled = true;
            return false;
        }
    }

    function hideUrlValidation() {
        urlValidation.classList.add('d-none');
        urlValidation.textContent = '';
    }

    editorUrl.addEventListener('input', validateUrl);

    // ---- Method select color coding ----
    function updateMethodSelectColor() {
        editorMethod.className = 'form-select method-select';
        const colorClass = METHOD_COLORS[editorMethod.value];
        if (colorClass) editorMethod.classList.add(colorClass);
    }

    // ---- Body tab visibility (hide for GET/DELETE) ----
    function updateBodyTabVisibility() {
        const method = editorMethod.value;
        const hasBody = method === 'POST' || method === 'PUT';
        tabBodyItem.classList.toggle('d-none', !hasBody);
        // If Body tab was active and we're hiding it, switch to Headers
        if (!hasBody && tabBody.classList.contains('active')) {
            bootstrap.Tab.getOrCreateInstance(tabHeaders).show();
        }
    }

    editorMethod.addEventListener('change', () => {
        updateMethodSelectColor();
        updateBodyTabVisibility();
    });

    // ---- Headers tab ----
    function renderHeaders(headers) {
        headersContainer.innerHTML = '';
        const entries = Object.entries(headers || {});
        if (entries.length === 0) {
            headersContainer.innerHTML = '<p class="text-muted small">No headers. Click "+ Add Header" or use a preset.</p>';
            return;
        }
        entries.forEach(([key, value]) => {
            headersContainer.appendChild(createHeaderRow(key, value));
        });
    }

    function createHeaderRow(key, value) {
        const row = document.createElement('div');
        row.className = 'kv-row d-flex gap-2 mb-2 align-items-center';
        row.innerHTML = `
            <input type="text" class="form-control form-control-sm kv-key" placeholder="Header name" value="${escapeAttr(key)}">
            <input type="text" class="form-control form-control-sm kv-value" placeholder="Value" value="${escapeAttr(value)}">
            <button class="btn btn-sm btn-outline-danger border-0 px-1 kv-remove" title="Remove">&times;</button>
        `;
        return row;
    }

    function getHeadersFromUI() {
        const headers = {};
        headersContainer.querySelectorAll('.kv-row').forEach(row => {
            const key = row.querySelector('.kv-key').value.trim();
            const value = row.querySelector('.kv-value').value.trim();
            if (key) headers[key] = value;
        });
        return headers;
    }

    btnAddHeader.addEventListener('click', () => {
        // Clear "no headers" message if present
        const msg = headersContainer.querySelector('p.text-muted');
        if (msg) msg.remove();
        const row = createHeaderRow('', '');
        headersContainer.appendChild(row);
        row.querySelector('.kv-key').focus();
    });

    // Remove header row (delegated)
    headersContainer.addEventListener('click', (e) => {
        if (e.target.closest('.kv-remove')) {
            e.target.closest('.kv-row').remove();
            if (!headersContainer.querySelector('.kv-row')) {
                headersContainer.innerHTML = '<p class="text-muted small">No headers. Click "+ Add Header" or use a preset.</p>';
            }
        }
    });

    // Preset headers
    headerPresets.addEventListener('click', (e) => {
        const item = e.target.closest('.dropdown-item');
        if (!item) return;
        e.preventDefault();
        const key = item.dataset.key;
        const value = item.dataset.value;
        // Clear "no headers" message if present
        const msg = headersContainer.querySelector('p.text-muted');
        if (msg) msg.remove();
        // Check if header key already exists
        const existing = [...headersContainer.querySelectorAll('.kv-key')].find(
            input => input.value.trim().toLowerCase() === key.toLowerCase()
        );
        if (existing) {
            // Update existing value and focus it
            const row = existing.closest('.kv-row');
            row.querySelector('.kv-value').value = value;
            row.querySelector('.kv-value').focus();
        } else {
            const row = createHeaderRow(key, value);
            headersContainer.appendChild(row);
            row.querySelector('.kv-value').focus();
        }
    });

    // ---- Body tab ----
    function renderBody(body) {
        bodyEditor.value = body || '';
        validateBodyJson();
    }

    function getBodyFromUI() {
        return bodyEditor.value;
    }

    function validateBodyJson() {
        const val = bodyEditor.value.trim();
        if (!val) {
            bodyValidation.classList.add('d-none');
            bodyValidation.textContent = '';
            return;
        }
        try {
            JSON.parse(val);
            bodyValidation.classList.add('d-none');
            bodyValidation.textContent = '';
        } catch (e) {
            bodyValidation.textContent = `Invalid JSON: ${e.message}`;
            bodyValidation.classList.remove('d-none');
        }
    }

    bodyEditor.addEventListener('input', validateBodyJson);

    btnFormatBody.addEventListener('click', () => {
        const val = bodyEditor.value.trim();
        if (!val) return;
        try {
            bodyEditor.value = JSON.stringify(JSON.parse(val), null, 2);
            bodyValidation.classList.add('d-none');
            bodyValidation.textContent = '';
        } catch {
            validateBodyJson();
        }
    });

    // ---- Params tab ----
    function renderParams(params) {
        paramsContainer.innerHTML = '';
        const entries = Object.entries(params || {});
        if (entries.length === 0) {
            paramsContainer.innerHTML = '<p class="text-muted small">No params. Click "+ Add Param" to add query parameters.</p>';
            updateParamsUrlPreview();
            return;
        }
        entries.forEach(([key, value]) => {
            paramsContainer.appendChild(createParamRow(key, value));
        });
        updateParamsUrlPreview();
    }

    function createParamRow(key, value) {
        const row = document.createElement('div');
        row.className = 'kv-row d-flex gap-2 mb-2 align-items-center';
        row.innerHTML = `
            <input type="text" class="form-control form-control-sm kv-key" placeholder="Param name" value="${escapeAttr(key)}">
            <input type="text" class="form-control form-control-sm kv-value" placeholder="Value" value="${escapeAttr(value)}">
            <button class="btn btn-sm btn-outline-danger border-0 px-1 kv-remove" title="Remove">&times;</button>
        `;
        // Live-update URL preview as user types
        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updateParamsUrlPreview);
        });
        return row;
    }

    function getParamsFromUI() {
        const params = {};
        paramsContainer.querySelectorAll('.kv-row').forEach(row => {
            const key = row.querySelector('.kv-key').value.trim();
            const value = row.querySelector('.kv-value').value.trim();
            if (key) params[key] = value;
        });
        return params;
    }

    function updateParamsUrlPreview() {
        const baseUrl = editorUrl.value.trim();
        const params = getParamsFromUI();
        const keys = Object.keys(params);
        if (!baseUrl || keys.length === 0) {
            paramsUrlPreview.classList.add('d-none');
            paramsUrlPreviewText.textContent = '';
            return;
        }
        try {
            const url = new URL(baseUrl);
            keys.forEach(k => url.searchParams.set(k, params[k]));
            paramsUrlPreviewText.textContent = url.toString();
            paramsUrlPreview.classList.remove('d-none');
        } catch {
            // Invalid base URL — just show base + raw query string
            const qs = keys.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
            paramsUrlPreviewText.textContent = `${baseUrl}?${qs}`;
            paramsUrlPreview.classList.remove('d-none');
        }
    }

    btnAddParam.addEventListener('click', () => {
        const msg = paramsContainer.querySelector('p.text-muted');
        if (msg) msg.remove();
        const row = createParamRow('', '');
        paramsContainer.appendChild(row);
        row.querySelector('.kv-key').focus();
    });

    // Remove param row (delegated)
    paramsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.kv-remove')) {
            e.target.closest('.kv-row').remove();
            if (!paramsContainer.querySelector('.kv-row')) {
                paramsContainer.innerHTML = '<p class="text-muted small">No params. Click "+ Add Param" to add query parameters.</p>';
            }
            updateParamsUrlPreview();
        }
    });

    // Update URL preview when base URL changes
    editorUrl.addEventListener('input', updateParamsUrlPreview);

    // ---- Create Folder ----
    btnNewFolder.addEventListener('click', () => {
        folderNameInput.value = '';
        createFolderModal.show();
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
        const newReq = ApiStorage.createRequest(pendingRequestFolderId, name, method);
        createRequestModal.hide();
        renderFolderTree();
        // Auto-select the new request
        if (newReq) {
            selectRequest(pendingRequestFolderId, newReq.id);
        }
    });

    requestNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btnConfirmRequest.click();
    });

    // ---- Utility ----
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ---- Init ----
    renderFolderTree();
});
