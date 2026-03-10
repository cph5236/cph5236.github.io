# API Request Builder - Implementation Plan

## STEP 1: Project Setup & Basic Structure - Complete
- [X] Create `apibuilder/api-builder.html`
- [X]Create `assets/js/api-storage.js` (localStorage manager)
- [X] Create `assets/js/api-builder.js` (main app)
- [X] Create `assets/css/api-builder.css`
- [x] Add API Builder link to Projects section 
- [x] Test: Page loads with dark/light theme support 

## STEP 2: Sidebar - Folder & Request Management
- [X] Create folder tree UI
- [X] Implement "Create Folder" + modal
- [X] Implement "Create Request" (with method dropdown)
- [X] Color-coded method badges (GET/POST/PUT/DELETE)
- [X] Delete folders/requests
- [X] Connect to localStorage
- [X] Test: Can create/save/load folders and requests

## STEP 3: Main Area - Method & URL Bar
- [X] Method selector dropdown - to edit the method type GET POST PUT DELETE
- [X] URL input field 
- [X] Send & Save buttons
- [X] Load request data when selected from sidebar
- [X] Basic URL validation
- [X] Test: Selections persist to localStorage

## STEP 4: Tabbed Interface
- [X] Tab navigation (Headers, Params, Body, Response)
- [X] Disable Body tab for GET/DELETE
- [X] Tab switching logic
- [X] Style with golden yellow active state

## STEP 5: Headers Tab
- [X] Dynamic key-value table
- [X] Add/remove header rows
- [X] Preset headers (Content-Type, Authorization, etc.)
- [X] Test: Headers save/load correctly

## STEP 6: Params Tab
- [X] Dynamic key-value table (similar to Headers)
- [X] Auto-append to URL on send
- [X] Test: Params appear in final URL
- [X] At the bottom of Params tab construct what the final URL would be as an example Appending Params correctly

## STEP 7: Body Tab
- [ ] JSON textarea editor
- [ ] Prettify/format button
- [ ] JSON validation with error display
- [ ] Only show for POST/PUT
- [ ] Test: Body saves/loads

## STEP 8: Response Tab
- [ ] Display status code (color-coded: green success, red error)
- [ ] Show response headers
- [ ] Show formatted response body (JSON)
- [ ] Display response time
- [ ] Copy response button

## STEP 9: API Request Execution
- [ ] Fetch-based request sender
- [ ] Handle CORS limitations (explain to user)
- [ ] Request timeout handling
- [ ] Loading state on Send button
- [ ] Error handling (network, timeout, invalid response)
- [ ] Test: Send GET, POST, PUT to public APIs

## STEP 10: Export/Import Functionality
- [ ] Export button → download JSON file
- [ ] Import button with file uploader
- [ ] Validate imported data
- [ ] Merge or replace dialog
- [ ] Test: Export and re-import successfully

## STEP 11: Rename & Organization
- [ ] Rename folders
- [ ] Rename requests
- [ ] Test: Changes persist

## STEP 12: Polish & Edge Cases
- [ ] Empty states
- [ ] Confirmation dialogs for deletions
- [ ] Better error messages
- [ ] Tooltip help text
- [ ] Mobile responsiveness
- [ ] Cross-browser testing

---

## Data Model

```json
{
  "apiBuilderData": {
    "folders": [
      {
        "id": "uuid-here",
        "name": "User APIs",
        "requests": [
          {
            "id": "uuid-here",
            "name": "Get Users",
            "method": "GET",
            "url": "https://api.example.com/users",
            "headers": {"Authorization": "Bearer token"},
            "params": {"page": "1"},
            "body": null
          }
        ]
      }
    ]
  }
}
```