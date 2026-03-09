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

    return {
        getFolders,
        createFolder,
        deleteFolder,
        getFolder,
        createRequest,
        deleteRequest,
        getRequest,
        updateRequest
    };
})();
