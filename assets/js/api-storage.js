// ===== API Builder - localStorage Manager =====

const ApiStorage = (() => {
    const STORAGE_KEY = 'apiBuilderData';

    function generateId() {
        return crypto.randomUUID();
    }

    function load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try { return JSON.parse(raw); } catch (e) { /* fall through */ }
        }
        return { folders: [] };
    }

    function save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // ---- Folders ----

    function getFolders() {
        return load().folders;
    }

    function createFolder(name) {
        const data = load();
        const folder = { id: generateId(), name, requests: [] };
        data.folders.push(folder);
        save(data);
        return folder;
    }

    function deleteFolder(folderId) {
        const data = load();
        data.folders = data.folders.filter(f => f.id !== folderId);
        save(data);
    }

    function getFolder(folderId) {
        return load().folders.find(f => f.id === folderId) || null;
    }

    // ---- Requests ----

    function createRequest(folderId, name, method) {
        const data = load();
        const folder = data.folders.find(f => f.id === folderId);
        if (!folder) return null;
        const request = {
            id: generateId(),
            name,
            method: method || 'GET',
            url: '',
            headers: {},
            params: {},
            body: null
        };
        folder.requests.push(request);
        save(data);
        return request;
    }

    function deleteRequest(folderId, requestId) {
        const data = load();
        const folder = data.folders.find(f => f.id === folderId);
        if (!folder) return;
        folder.requests = folder.requests.filter(r => r.id !== requestId);
        save(data);
    }

    function getRequest(folderId, requestId) {
        const folder = getFolder(folderId);
        if (!folder) return null;
        return folder.requests.find(r => r.id === requestId) || null;
    }

    function updateRequest(folderId, requestId, updates) {
        const data = load();
        const folder = data.folders.find(f => f.id === folderId);
        if (!folder) return null;
        const request = folder.requests.find(r => r.id === requestId);
        if (!request) return null;
        Object.assign(request, updates);
        save(data);
        return request;
    }

    // ---- Rename ----

    function renameFolder(folderId, newName) {
        const data = load();
        const folder = data.folders.find(f => f.id === folderId);
        if (!folder) return null;
        folder.name = newName.trim();
        save(data);
        return folder;
    }

    function renameRequest(folderId, requestId, newName) {
        const data = load();
        const folder = data.folders.find(f => f.id === folderId);
        if (!folder) return null;
        const request = folder.requests.find(r => r.id === requestId);
        if (!request) return null;
        request.name = newName.trim();
        save(data);
        return request;
    }

    // ---- Export / Import ----

    function exportData() {
        return load();
    }

    function importData(incoming, mode) {
        if (mode === 'replace') {
            save(incoming);
            return;
        }
        // merge: append folders, regenerate all IDs to avoid collisions
        const data = load();
        const existingFolderIds = new Set(data.folders.map(f => f.id));
        incoming.folders.forEach(folder => {
            const imported = { ...folder, requests: (folder.requests || []).map(r => ({ ...r, id: generateId() })) };
            if (existingFolderIds.has(imported.id)) imported.id = generateId();
            data.folders.push(imported);
        });
        save(data);
    }

    return {
        getFolders,
        createFolder,
        deleteFolder,
        getFolder,
        createRequest,
        deleteRequest,
        getRequest,
        updateRequest,
        renameFolder,
        renameRequest,
        exportData,
        importData
    };
})();
