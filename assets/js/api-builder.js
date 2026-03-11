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
    const tabResponse = document.getElementById('tab-response');

    // Headers tab elements
    const headersContainer = document.getElementById('headers-table-container');
    const btnAddHeader = document.getElementById('btn-add-header');
    const headerPresets = document.getElementById('header-presets');

    // Body tab elements
    const bodyEditor = document.getElementById('body-editor');
    const btnFormatBody = document.getElementById('btn-format-body');
    const bodyValidation = document.getElementById('body-validation');

    // Response tab elements
    const responseEmpty   = document.getElementById('response-empty');
    const responseLoading = document.getElementById('response-loading');
    const responseError   = document.getElementById('response-error');
    const responseContent = document.getElementById('response-content');
    const responseStatus  = document.getElementById('response-status');
    const responseTime    = document.getElementById('response-time');
    const responseSize    = document.getElementById('response-size');
    const responseHeaders = document.getElementById('response-headers');
    const responseHeadersLabel = document.getElementById('response-headers-label');
    const responseBody    = document.getElementById('response-body');
    const responseErrorMsg = document.getElementById('response-error-msg');
    const btnCopyResponse = document.getElementById('btn-copy-response');

    // Params tab elements
    const paramsContainer = document.getElementById('params-table-container');
    const btnAddParam = document.getElementById('btn-add-param');
    const paramsUrlPreview = document.getElementById('params-url-preview');
    const paramsUrlPreviewText = document.getElementById('params-url-preview-text');

    // Rename modal elements
    const renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
    const renameInput = document.getElementById('rename-input');
    const btnConfirmRename = document.getElementById('btn-confirm-rename');

    // Delete confirm modal elements
    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const deleteConfirmMessage = document.getElementById('delete-confirm-message');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');

    // Import modal elements
    const importModal = new bootstrap.Modal(document.getElementById('importModal'));
    const importPreview = document.getElementById('import-preview');
    const btnImportMerge = document.getElementById('btn-import-merge');
    const btnImportReplace = document.getElementById('btn-import-replace');
    const importFileInput = document.getElementById('import-file-input');

    // Sidebar action elements
    const btnExport = document.getElementById('btn-export');
    const btnImportTrigger = document.getElementById('btn-import-trigger');
    const sidebarAlert = document.getElementById('sidebar-alert');

    // Try it out modal elements
    const tryItOutModal = new bootstrap.Modal(document.getElementById('tryItOutModal'));
    const tryItOutJson = document.getElementById('try-it-out-json');
    const btnCopyExample = document.getElementById('btn-copy-example');
    const btnImportExample = document.getElementById('btn-import-example');
    const btnTryItOut = document.getElementById('btn-try-it-out');

    // Track which folder the "new request" modal targets
    let pendingRequestFolderId = null;

    // Delete state
    let deleteContext = null; // { type: 'folder'|'request', folderId, requestId? }

    // Rename state
    let renameContext = null; // { type: 'folder'|'request', id, folderId? }

    // Import state
    let pendingImportData = null;

    // Currently selected request
    let selectedFolderId = null;
    let selectedRequestId = null;

    // ---- Draft cache (in-memory, session-only) ----
    const draftCache = new Map();
    let lastResponseData = { state: 'empty', content: null, error: null };

    function captureDraft() {
        if (!selectedRequestId) return;
        draftCache.set(selectedRequestId, {
            folderId: selectedFolderId,
            method: editorMethod.value,
            url: editorUrl.value,
            headers: getHeadersFromUI(),
            params: getParamsFromUI(),
            body: getBodyFromUI(),
            response: { ...lastResponseData }
        });
    }

    function getDraft(requestId) {
        return draftCache.get(requestId) || null;
    }

    function deleteDraft(requestId) {
        draftCache.delete(requestId);
    }

    function deleteDraftsForFolder(folderId) {
        for (const [id, draft] of draftCache) {
            if (draft.folderId === folderId) draftCache.delete(id);
        }
    }

    function restoreResponse(responseData) {
        if (responseData.state === 'content') {
            showResponseContent(responseData.content);
        } else if (responseData.state === 'error') {
            showResponseError(responseData.error);
        } else {
            resetResponsePanel();
        }
    }

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
                <button class="btn btn-sm btn-outline-secondary border-0 py-0 px-1 btn-rename-folder" title="Rename Folder">✎</button>
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
                    <div class="d-flex align-items-center gap-2 overflow-hidden">
                        <span class="method-badge ${methodClass} fw-bold small flex-shrink-0">${req.method}</span>
                        <span class="request-name small text-truncate">${escapeHtml(req.name)}</span>
                    </div>
                    <div class="d-flex gap-1 request-actions flex-shrink-0">
                        <button class="btn btn-sm btn-outline-secondary border-0 py-0 px-1 btn-rename-request" title="Rename Request">✎</button>
                        <button class="btn btn-sm btn-outline-danger border-0 py-0 px-1 btn-delete-request" title="Delete Request">&times;</button>
                    </div>
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

        // Rename folder button
        const renameFolderBtn = e.target.closest('.btn-rename-folder');
        if (renameFolderBtn) {
            const folderId = renameFolderBtn.closest('.folder-item').dataset.folderId;
            const folder = ApiStorage.getFolder(folderId);
            if (folder) openRenameModal('folder', folderId, folder.name);
            return;
        }

        // Delete folder button
        const delFolderBtn = e.target.closest('.btn-delete-folder');
        if (delFolderBtn) {
            const folderId = delFolderBtn.closest('.folder-item').dataset.folderId;
            const folder = ApiStorage.getFolder(folderId);
            if (folder) openDeleteModal('folder', folderId, null, folder.name);
            return;
        }

        // Rename request button
        const renameReqBtn = e.target.closest('.btn-rename-request');
        if (renameReqBtn) {
            const reqItem = renameReqBtn.closest('.request-item');
            const folderId = reqItem.dataset.folderId;
            const requestId = reqItem.dataset.requestId;
            const req = ApiStorage.getRequest(folderId, requestId);
            if (req) openRenameModal('request', requestId, req.name, folderId);
            return;
        }

        // Delete request button
        const delReqBtn = e.target.closest('.btn-delete-request');
        if (delReqBtn) {
            const reqItem = delReqBtn.closest('.request-item');
            const folderId = reqItem.dataset.folderId;
            const requestId = reqItem.dataset.requestId;
            const req = ApiStorage.getRequest(folderId, requestId);
            if (req) openDeleteModal('request', folderId, requestId, req.name);
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
        captureDraft(); // capture outgoing request state before switching

        selectedFolderId = folderId;
        selectedRequestId = requestId;

        // Highlight in sidebar
        folderTree.querySelectorAll('.request-item.active').forEach(el => el.classList.remove('active'));
        const el = folderTree.querySelector(`.request-item[data-request-id="${requestId}"]`);
        if (el) el.classList.add('active');

        // Load request data — prefer in-memory draft over localStorage
        const draft = getDraft(requestId);
        const req = draft || ApiStorage.getRequest(folderId, requestId);
        if (!req) return;

        editorMethod.value = req.method;
        editorUrl.value = req.url || '';
        updateMethodSelectColor();
        updateBodyTabVisibility();
        validateUrl();
        renderHeaders(req.headers);
        renderParams(req.params);
        renderBody(req.body);

        // Restore cached response or reset
        if (draft) {
            restoreResponse(draft.response);
        } else {
            resetResponsePanel();
        }

        // Reset to Headers tab
        bootstrap.Tab.getOrCreateInstance(tabHeaders).show();

        // Show editor, hide empty state
        emptyState.classList.add('d-none');
        requestEditor.classList.remove('d-none');
        requestEditor.classList.add('d-flex');
    }

    // ---- Clear selection ----
    function clearSelection() {
        captureDraft(); // capture outgoing request state before clearing
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
        deleteDraft(selectedRequestId); // persisted — draft is now stale
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
        editorMethod.dataset.method = editorMethod.value;
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

    // ---- Response tab state management ----
    function setResponseState(state) {
        responseEmpty.classList.toggle('d-none',   state !== 'empty');
        responseLoading.classList.toggle('d-none', state !== 'loading');
        responseError.classList.toggle('d-none',   state !== 'error');
        responseContent.classList.toggle('d-none', state !== 'content');
    }

    function showResponseError(message) {
        lastResponseData = { state: 'error', content: null, error: message };
        responseErrorMsg.textContent = message;
        setResponseState('error');
    }

    function showResponseContent({ status, statusText, headers, bodyText, elapsed }) {
        lastResponseData = { state: 'content', content: { status, statusText, headers, bodyText, elapsed }, error: null };
        // Status code with color
        const statusClass =
            status >= 500 ? 'text-danger'  :
            status >= 400 ? 'text-warning' :
            status >= 300 ? 'text-info'    : 'text-success';
        responseStatus.textContent = `${status} ${statusText}`;
        responseStatus.className = `fw-bold ${statusClass}`;

        // Timing
        responseTime.textContent = `${elapsed} ms`;

        // Size
        const bytes = new TextEncoder().encode(bodyText).length;
        responseSize.textContent = bytes < 1024
            ? `${bytes} B`
            : `${(bytes / 1024).toFixed(1)} KB`;

        // Headers
        const headerEntries = Object.entries(headers);
        responseHeadersLabel.textContent = `Response Headers (${headerEntries.length})`;
        responseHeaders.innerHTML = headerEntries
            .map(([k, v]) => `<div><span class="text-muted">${escapeHtml(k)}:</span> ${escapeHtml(v)}</div>`)
            .join('');

        // Body — pretty-print JSON, fall back to raw text
        let displayBody = bodyText;
        try {
            displayBody = JSON.stringify(JSON.parse(bodyText), null, 2);
        } catch { /* not JSON, show as-is */ }
        responseBody.textContent = displayBody || '(empty body)';

        setResponseState('content');
    }

    // ---- Request execution ----
    async function executeRequest() {
        const method  = editorMethod.value;
        const baseUrl = editorUrl.value.trim();
        const headers = getHeadersFromUI();
        const params  = getParamsFromUI();
        const body    = getBodyFromUI();

        // Build final URL (append query params)
        let finalUrl;
        try {
            finalUrl = new URL(baseUrl);
            Object.entries(params).forEach(([k, v]) => finalUrl.searchParams.set(k, v));
        } catch {
            showResponseError('Invalid URL. Please enter a valid URL before sending.');
            bootstrap.Tab.getOrCreateInstance(tabResponse).show();
            return;
        }

        // Assemble fetch options
        const fetchOptions = { method, headers: { ...headers } };

        if (method === 'POST' || method === 'PUT') {
            const bodyVal = body.trim();
            if (bodyVal) {
                fetchOptions.body = bodyVal;
                if (!fetchOptions.headers['Content-Type']) {
                    fetchOptions.headers['Content-Type'] = 'application/json';
                }
            }
        }

        // Timeout via AbortController (30 s)
        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), 30_000);
        fetchOptions.signal = controller.signal;

        // Enter loading state
        btnSend.disabled = true;
        btnSend.textContent = 'Sending…';
        setResponseState('loading');
        bootstrap.Tab.getOrCreateInstance(tabResponse).show();

        const t0 = performance.now();

        try {
            const response = await fetch(finalUrl.toString(), fetchOptions);
            clearTimeout(timeoutId);

            const elapsed = Math.round(performance.now() - t0);
            const bodyText = await response.text();

            const respHeaders = {};
            response.headers.forEach((v, k) => { respHeaders[k] = v; });

            showResponseContent({
                status: response.status,
                statusText: response.statusText,
                headers: respHeaders,
                bodyText,
                elapsed
            });

        } catch (err) {
            clearTimeout(timeoutId);
            const elapsed = Math.round(performance.now() - t0);

            if (err.name === 'AbortError') {
                showResponseError(`Request timed out after 30 seconds (${elapsed} ms elapsed).`);
            } else if (err instanceof TypeError) {
                // Typically CORS or no network — fetch gives no detail for security reasons
                showResponseError(
                    `Network error — unable to reach ${finalUrl.hostname}.\n\n` +
                    `Common causes:\n` +
                    `  • CORS: the server hasn't allowed requests from this origin\n` +
                    `  • The server is offline or the URL is unreachable\n` +
                    `  • Mixed content: this page is HTTPS but the target is HTTP\n\n` +
                    `Tip: try a public API like https://httpbin.org/get that has CORS enabled.`
                );
            } else {
                showResponseError(`Unexpected error: ${err.message}`);
            }
        } finally {
            // Restore Send button to correct state (re-runs URL validation)
            btnSend.textContent = 'Send';
            validateUrl();
        }
    }

    btnSend.addEventListener('click', executeRequest);

    btnCopyResponse.addEventListener('click', () => {
        const text = responseBody.textContent;
        if (!text || text === '(empty body)') return;
        navigator.clipboard.writeText(text).then(() => {
            btnCopyResponse.textContent = 'Copied!';
            setTimeout(() => { btnCopyResponse.textContent = 'Copy'; }, 1500);
        }).catch(() => {
            // Fallback for browsers without clipboard API
            btnCopyResponse.textContent = 'Failed';
            setTimeout(() => { btnCopyResponse.textContent = 'Copy'; }, 1500);
        });
    });

    // Reset response panel when a different request is selected
    function resetResponsePanel() {
        lastResponseData = { state: 'empty', content: null, error: null };
        setResponseState('empty');
        responseBody.textContent = '';
        responseHeaders.innerHTML = '';
        responseErrorMsg.textContent = '';
        // Collapse headers panel if open
        const panel = document.getElementById('response-headers-panel');
        if (panel.classList.contains('show')) {
            bootstrap.Collapse.getOrCreateInstance(panel).hide();
        }
    }

    // ---- Delete confirmation ----
    function openDeleteModal(type, folderId, requestId, name) {
        deleteContext = { type, folderId, requestId };
        deleteConfirmMessage.textContent = type === 'folder'
            ? `Delete folder "${name}"? This will also delete all its requests.`
            : `Delete request "${name}"?`;
        deleteConfirmModal.show();
    }

    btnConfirmDelete.addEventListener('click', () => {
        if (!deleteContext) return;
        if (deleteContext.type === 'folder') {
            deleteDraftsForFolder(deleteContext.folderId);
            if (deleteContext.folderId === selectedFolderId) clearSelection();
            ApiStorage.deleteFolder(deleteContext.folderId);
        } else {
            deleteDraft(deleteContext.requestId);
            if (deleteContext.requestId === selectedRequestId) clearSelection();
            ApiStorage.deleteRequest(deleteContext.folderId, deleteContext.requestId);
        }
        deleteConfirmModal.hide();
        deleteContext = null;
        renderFolderTree();
    });

    document.getElementById('btn-empty-try-it-out').addEventListener('click', () => {
        tryItOutJson.value = JSON.stringify(EXAMPLE_COLLECTION, null, 2);
        tryItOutModal.show();
    });

    // ---- Keyboard shortcuts ----
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (!btnSend.disabled) {
                e.preventDefault();
                executeRequest();
            }
        }
    });

    // ---- Sidebar alert helper ----
    function showSidebarAlert(message, type = 'danger') {
        sidebarAlert.innerHTML = `
            <div class="alert alert-${type} alert-dismissible py-1 px-2 small mb-0" role="alert">
                ${escapeHtml(message)}
                <button type="button" class="btn-close py-2" data-bs-dismiss="alert"></button>
            </div>`;
        sidebarAlert.classList.remove('d-none');
        setTimeout(() => {
            sidebarAlert.innerHTML = '';
            sidebarAlert.classList.add('d-none');
        }, 6000);
    }

    // ---- Rename ----
    function openRenameModal(type, id, currentName, folderId = null) {
        renameContext = { type, id, folderId };
        renameInput.value = currentName;
        renameModal.show();
        document.getElementById('renameModal').addEventListener('shown.bs.modal', () => {
            renameInput.select();
        }, { once: true });
    }

    btnConfirmRename.addEventListener('click', () => {
        const name = renameInput.value.trim();
        if (!name || !renameContext) return;
        if (renameContext.type === 'folder') {
            ApiStorage.renameFolder(renameContext.id, name);
        } else {
            ApiStorage.renameRequest(renameContext.folderId, renameContext.id, name);
        }
        renameModal.hide();
        renderFolderTree();
    });

    renameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btnConfirmRename.click();
    });

    // ---- Export ----
    btnExport.addEventListener('click', (e) => {
        e.preventDefault();
        const data = ApiStorage.exportData();
        if (data.folders.length === 0) {
            showSidebarAlert('No collections to export.');
            return;
        }
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api-builder-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // ---- Import ----
    function validateImportData(data) {
        if (!data || typeof data !== 'object' || !Array.isArray(data.folders)) return false;
        return data.folders.every(f =>
            typeof f.id === 'string' &&
            typeof f.name === 'string' &&
            Array.isArray(f.requests)
        );
    }

    btnImportTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        importFileInput.click();
    });

    importFileInput.addEventListener('change', () => {
        const file = importFileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            importFileInput.value = '';
            try {
                const parsed = JSON.parse(evt.target.result);
                if (!validateImportData(parsed)) {
                    showSidebarAlert('Invalid file. Expected an API Builder JSON export with a "folders" array.');
                    return;
                }
                pendingImportData = parsed;
                const fc = parsed.folders.length;
                const rc = parsed.folders.reduce((s, f) => s + f.requests.length, 0);
                importPreview.textContent = `Found ${fc} folder${fc !== 1 ? 's' : ''} with ${rc} request${rc !== 1 ? 's' : ''}.`;
                importModal.show();
            } catch {
                showSidebarAlert('Could not parse the file. Make sure it is a valid JSON export.');
            }
        };
        reader.readAsText(file);
    });

    function finishImport(mode) {
        if (!pendingImportData) return;
        ApiStorage.importData(pendingImportData, mode);
        pendingImportData = null;
        importModal.hide();
        // If replacing, clear all stale drafts and reset selection
        if (mode === 'replace') {
            draftCache.clear();
            clearSelection();
        }
        renderFolderTree();
        const label = mode === 'replace' ? 'Collections replaced.' : 'Collections merged.';
        showSidebarAlert(label, 'success');
    }

    btnImportMerge.addEventListener('click', () => finishImport('merge'));
    btnImportReplace.addEventListener('click', () => finishImport('replace'));

    // ---- Try it out ----
    const EXAMPLE_COLLECTION = {
        folders: [{
            id: 'demo-httpbin',
            name: 'httpbin.org Demos',
            requests: [
                {
                    id: 'demo-get', name: 'GET Request', method: 'GET',
                    url: 'https://httpbin.org/get',
                    headers: { 'Accept': 'application/json' },
                    params: { 'source': 'api-builder' }, body: null
                },
                {
                    id: 'demo-post', name: 'POST JSON Body', method: 'POST',
                    url: 'https://httpbin.org/post',
                    headers: { 'Content-Type': 'application/json' },
                    params: {}, body: '{\n  "greeting": "Hello from API Builder!"\n}'
                },
                {
                    id: 'demo-put', name: 'PUT Update', method: 'PUT',
                    url: 'https://httpbin.org/put',
                    headers: { 'Content-Type': 'application/json' },
                    params: {}, body: '{\n  "updated": true\n}'
                },
                {
                    id: 'demo-headers', name: 'Inspect Headers', method: 'GET',
                    url: 'https://httpbin.org/headers',
                    headers: { 'X-Source': 'api-builder' },
                    params: {}, body: null
                },
                {
                    id: 'demo-404', name: '404 Error Response', method: 'GET',
                    url: 'https://httpbin.org/status/404',
                    headers: {}, params: {}, body: null
                }
            ]
        }]
    };

    btnTryItOut.addEventListener('click', () => {
        tryItOutJson.value = JSON.stringify(EXAMPLE_COLLECTION, null, 2);
        tryItOutModal.show();
    });

    btnCopyExample.addEventListener('click', () => {
        navigator.clipboard.writeText(tryItOutJson.value).then(() => {
            btnCopyExample.textContent = 'Copied!';
            setTimeout(() => { btnCopyExample.textContent = 'Copy JSON'; }, 1500);
        });
    });

    btnImportExample.addEventListener('click', () => {
        ApiStorage.importData(EXAMPLE_COLLECTION, 'merge');
        tryItOutModal.hide();
        renderFolderTree();
        showSidebarAlert('Example collection imported!', 'success');
    });

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
