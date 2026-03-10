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
- [X] JSON textarea editor
- [X] Prettify/format button
- [X] JSON validation with error display
- [X] Only show for POST/PUT
- [X] Test: Body saves/loads

## STEP 8: Response Tab
- [X] Display status code (color-coded: green success, red error)
- [X] Show response headers
- [X] Show formatted response body (JSON)
- [X] Display response time
- [X] Copy response button with Copy SVG icon

## STEP 9: API Request Execution
- [X] Fetch-based request sender
- [X] Handle CORS limitations (explain to user)
- [X] Request timeout handling
- [X] Loading state on Send button
- [X] Error handling (network, timeout, invalid response)
- [X] Test: Send GET, POST, PUT to public APIs

## STEP 10: Export/Import Functionality
- [X] Export button → download JSON file
- [X] Import button with file uploader
- [X] Validate imported data
- [X] Merge or replace dialog
- [X] Test: Export and re-import successfully

## STEP 11: Rename & Organization
- [X] Rename folders
- [X] Rename requests
- [X] Test: Changes persist

## STEP 12: Polish & Edge Cases
- [X] Empty states
- [X] Confirmation dialogs for deletions
- [X] Better error messages
- [X] Tooltip help text
- [X] Mobile responsiveness
- [X] Cross-browser testing

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