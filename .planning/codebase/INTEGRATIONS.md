# External Integrations

**Analysis Date:** 2026-01-17

## APIs & External Services

**Figma Plugin API:**
- Figma - Primary integration for design system plugin
  - SDK/Client: `@figma/plugin-typings` v1.122.0
  - API access: Figma global object (figma)
  - Auth: No authentication required (plugin context authenticated by Figma)

**Network Access:**
- Explicitly disabled via manifest.json (`"allowedDomains": ["none"]`)
- Plugin cannot make HTTP requests or communicate with external servers

## Data Storage

**Databases:**
- None - Plugin is stateless and works with Figma document data

**File Storage:**
- Figma document-based storage only
- Variables stored within Figma design files
- No external file storage or cloud services

**Caching:**
- No caching layer implemented
- All variable lookups performed in-memory during plugin execution

## Authentication & Identity

**Auth Provider:**
- None - Not applicable
- Plugin runs within Figma editor context with implicit authentication
- Access controlled by Figma permission system (`documentAccess: "dynamic-page"`)

**Permissions Required:**
- `teamlibrary` - Access to team library variables for importing shared design tokens

## Monitoring & Observability

**Error Tracking:**
- None - Not integrated

**Logs:**
- Console logging only (`console.log()` calls in `code.ts`)
- Output visible in Figma plugin console when running
- No centralized logging or error tracking service

## CI/CD & Deployment

**Hosting:**
- Figma Plugin Marketplace (manual deployment via Figma developer dashboard)

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- None - No external services require configuration

**Secrets location:**
- Not applicable - No external credentials needed

## Figma Plugin Integration Details

**Plugin Runtime:**
- Runs in Figma plugin sandbox environment
- Code context: Main thread (code.ts) and UI context (ui.html) communicate via `postMessage`

**Figma API Access Points Used:**

1. **Selection & Document Access:**
   - `figma.currentPage.selection` - Get selected nodes for processing

2. **Variable Management:**
   - `figma.variables.getVariableByIdAsync()` - Retrieve variable by ID
   - `figma.variables.getLocalVariablesAsync()` - Get variables in current file
   - `figma.variables.importVariableByKeyAsync()` - Import team library variables
   - `figma.variables.setBoundVariableForPaint()` - Bind variables to fills/strokes

3. **Team Library Access:**
   - `figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()` - List available shared collections
   - `figma.teamLibrary.getVariablesInLibraryCollectionAsync()` - Get variables from shared collection

4. **Notifications:**
   - `figma.notify()` - Display user notifications
   - `figma.closePlugin()` - Close plugin with message

**Document Access Model:**
- `dynamic-page` access level allows reading/modifying any page in document
- Operates on selected SceneNode objects
- Can process node hierarchies recursively (children)

## UI Communication

**Plugin Message Protocol:**
- HTML UI (`ui.html`) sends messages to plugin code (`code.ts`)
- Communication via `parent.postMessage()`
- Message format: `{ pluginMessage: { type: "run" } }`
- Currently supports "run" message to trigger main plugin execution

## Webhooks & Callbacks

**Incoming:**
- None - Plugin UI buttons trigger postMessage events

**Outgoing:**
- None - No outbound integration webhooks

---

*Integration audit: 2026-01-17*
