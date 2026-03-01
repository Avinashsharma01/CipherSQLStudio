# CipherSQLStudio — Step-by-Step Build Guide

## Phase 0: Project Setup & Folder Structure (Day 1 — ~1 hour)

### 0.1 Initialize the Repository

```
CipherSQLStudio/
├── client/          # React frontend
├── server/          # Node.js/Express backend
├── data-flow/       # Hand-drawn diagram (photo/scan)
├── .gitignore
└── README.md
```

1. Create the root folder and run `git init`
2. Inside `client/`, run `npx create-react-app . ` (or Vite: `npm create vite@latest . -- --template react`)
3. Inside `server/`, run `npm init -y`
4. Create `.env.example` in both `client/` and `server/`

### 0.2 Install Dependencies

**Server (`server/`)**
```
npm install express cors dotenv pg mongoose morgan
npm install --dev nodemon
```
- `express` — web framework
- `cors` — cross-origin requests
- `pg` — PostgreSQL client
- `mongoose` — MongoDB ODM
- `morgan` — request logging
- `dotenv` — environment variables

**Client (`client/`)**
```
npm install @monaco-editor/react axios react-router-dom sass
```
- `@monaco-editor/react` — SQL code editor
- `axios` — API calls
- `react-router-dom` — routing
- `sass` — SCSS compilation

### 0.3 Environment Variables

**`server/.env.example`**
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ciphersqlstudio
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=yourpassword
PG_DATABASE=sql_sandbox
LLM_API_KEY=your-api-key-here
LLM_PROVIDER=gemini          # or openai
```

**`client/.env.example`**
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Phase 1: Database Setup (Day 1 — ~1.5 hours)

### 1.1 PostgreSQL (Sandbox — for running student queries)

1. Install PostgreSQL locally (or use Docker: `docker run -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres`)
2. Create a database called `sql_sandbox`
3. Create sample tables and insert data. Example:

```sql
-- Create tables for assignments
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  department VARCHAR(50),
  salary DECIMAL(10,2),
  hire_date DATE
);

CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  location VARCHAR(100)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(100),
  product VARCHAR(100),
  quantity INT,
  price DECIMAL(10,2),
  order_date DATE
);

-- Insert sample data
INSERT INTO employees (name, department, salary, hire_date) VALUES
('Alice', 'Engineering', 85000, '2021-03-15'),
('Bob', 'Marketing', 65000, '2020-07-01'),
('Charlie', 'Engineering', 92000, '2019-11-20'),
('Diana', 'HR', 70000, '2022-01-10'),
('Eve', 'Marketing', 72000, '2021-06-25');

INSERT INTO departments (name, location) VALUES
('Engineering', 'Building A'),
('Marketing', 'Building B'),
('HR', 'Building C');

INSERT INTO orders (customer_name, product, quantity, price, order_date) VALUES
('John', 'Laptop', 1, 999.99, '2024-01-15'),
('Jane', 'Mouse', 3, 29.99, '2024-01-16'),
('John', 'Keyboard', 1, 79.99, '2024-02-01'),
('Alice', 'Monitor', 2, 299.99, '2024-02-10'),
('Bob', 'Laptop', 1, 999.99, '2024-03-01');
```

### 1.2 MongoDB (Persistence — stores assignments metadata)

1. Create a free MongoDB Atlas cluster (or use local MongoDB)
2. Create a database called `ciphersqlstudio`
3. You'll have these collections:

**`assignments` collection — schema:**
```json
{
  "title": "Find High Salary Employees",
  "description": "Write a query to find all employees earning more than 80000",
  "difficulty": "Easy",           // Easy | Medium | Hard
  "tables_used": ["employees"],   // which PG tables this assignment uses
  "expected_hint": "Think about the WHERE clause with a comparison operator",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**`attempts` collection (optional — for save feature):**
```json
{
  "user_id": "...",
  "assignment_id": "...",
  "query": "SELECT * FROM employees WHERE salary > 80000",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

4. Seed 5-8 assignments into MongoDB manually or via a seed script.

---

## Phase 2: Backend API (Day 1-2 — ~3-4 hours)

### 2.1 Server Structure

```
server/
├── config/
│   ├── db.js            # MongoDB connection
│   └── pgPool.js        # PostgreSQL connection pool
├── controllers/
│   ├── assignmentController.js
│   ├── queryController.js
│   └── hintController.js
├── routes/
│   ├── assignmentRoutes.js
│   ├── queryRoutes.js
│   └── hintRoutes.js
├── middleware/
│   └── sanitize.js      # SQL sanitization
├── seed/
│   ├── seedAssignments.js  # Seed MongoDB
│   └── seedPostgres.js     # Seed PostgreSQL tables
├── .env
├── .env.example
├── package.json
└── server.js            # Entry point
```

### 2.2 Build Each File — Step by Step

#### Step 1: `server.js` (Entry point)
- Import express, cors, morgan, dotenv
- Connect to MongoDB using mongoose
- Set up middleware (cors, json parser, morgan)
- Mount routes: `/api/assignments`, `/api/query`, `/api/hint`
- Listen on PORT from env

#### Step 2: `config/db.js` (MongoDB connection)
- Export a function that calls `mongoose.connect(process.env.MONGO_URI)`

#### Step 3: `config/pgPool.js` (PostgreSQL pool)
- Create and export a `new Pool({...})` from the `pg` library using env variables

#### Step 4: `controllers/assignmentController.js`
- `getAllAssignments` — fetch all assignments from MongoDB, return as JSON
- `getAssignmentById` — fetch one assignment by ID

#### Step 5: `controllers/queryController.js`
- `executeQuery` — receives SQL string from request body
- **IMPORTANT: Sanitize the query!**
  - Only allow SELECT statements (block INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE)
  - Use a regex check or whitelist approach
  - Set a statement timeout to prevent long-running queries
- Execute query against PostgreSQL using the pool
- Return rows + column names, or error message

#### Step 6: `controllers/hintController.js`
- Receives: assignment question + user's current query attempt
- Builds a prompt like:
  ```
  You are a SQL tutor. The student is working on this problem:
  "{assignment question}"
  
  Their current attempt is:
  "{user query}"
  
  Give a helpful HINT only. Do NOT provide the full solution.
  Guide them toward the right approach without giving away the answer.
  Keep it to 2-3 sentences maximum.
  ```
- Calls the LLM API (Gemini or OpenAI) with this prompt
- Returns the hint text

#### Step 7: Routes files
- Wire each controller to its route using express.Router()

#### Step 8: `middleware/sanitize.js`
- Export a function that validates SQL queries
- Reject anything that isn't a SELECT
- Add query timeout wrapper

### 2.3 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments` | List all assignments |
| GET | `/api/assignments/:id` | Get single assignment details |
| POST | `/api/query/execute` | Execute a SQL query |
| POST | `/api/hint` | Get LLM hint for an assignment |
| GET | `/api/assignments/:id/tables` | Get table schemas & sample data |

### 2.4 The Table Schema/Data Endpoint

This is important — when a student opens an assignment, they need to see the table structure and sample data. Build an endpoint that:

1. Reads which tables the assignment uses (from MongoDB `tables_used` array)
2. For each table, queries PostgreSQL:
   - `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1` (schema)
   - `SELECT * FROM {table} LIMIT 5` (sample data)
3. Returns both schema info and sample rows

---

## Phase 3: Frontend — SCSS Setup (Day 2 — ~1 hour)

### 3.1 SCSS File Structure

```
client/src/
├── styles/
│   ├── _variables.scss      # Colors, fonts, breakpoints
│   ├── _mixins.scss          # Responsive mixins, flex helpers
│   ├── _reset.scss           # CSS reset/normalize
│   ├── _typography.scss      # Font styles
│   └── main.scss             # Imports all partials
├── components/
│   ├── AssignmentCard/
│   │   ├── AssignmentCard.jsx
│   │   └── AssignmentCard.scss
│   └── ...
```

### 3.2 Key SCSS Setup

**`_variables.scss`**
```scss
// Colors
$primary: #2563eb;
$secondary: #1e293b;
$success: #22c55e;
$error: #ef4444;
$bg-light: #f8fafc;
$bg-dark: #0f172a;
$text-primary: #1e293b;
$text-secondary: #64748b;

// Breakpoints (mobile-first)
$bp-mobile: 320px;
$bp-tablet: 641px;
$bp-desktop: 1024px;
$bp-wide: 1281px;

// Spacing
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
```

**`_mixins.scss`**
```scss
@mixin respond-to($breakpoint) {
  @if $breakpoint == tablet {
    @media (min-width: $bp-tablet) { @content; }
  } @else if $breakpoint == desktop {
    @media (min-width: $bp-desktop) { @content; }
  } @else if $breakpoint == wide {
    @media (min-width: $bp-wide) { @content; }
  }
}

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 3.3 Mobile-First Approach

- Write base styles for **320px** (mobile) first
- Then add `@include respond-to(tablet)` for 641px+
- Then `@include respond-to(desktop)` for 1024px+
- Then `@include respond-to(wide)` for 1281px+
- Use BEM naming: `.assignment-card`, `.assignment-card__title`, `.assignment-card--easy`

---

## Phase 4: Frontend — Pages & Components (Day 2 — ~3-4 hours)

### 4.1 Component Structure

```
client/src/
├── components/
│   ├── AssignmentCard/
│   │   ├── AssignmentCard.jsx
│   │   └── AssignmentCard.scss
│   ├── SQLEditor/
│   │   ├── SQLEditor.jsx
│   │   └── SQLEditor.scss
│   ├── ResultsTable/
│   │   ├── ResultsTable.jsx
│   │   └── ResultsTable.scss
│   ├── SchemaViewer/
│   │   ├── SchemaViewer.jsx
│   │   └── SchemaViewer.scss
│   ├── HintPanel/
│   │   ├── HintPanel.jsx
│   │   └── HintPanel.scss
│   ├── QuestionPanel/
│   │   ├── QuestionPanel.jsx
│   │   └── QuestionPanel.scss
│   ├── Header/
│   │   ├── Header.jsx
│   │   └── Header.scss
│   └── DifficultyBadge/
│       ├── DifficultyBadge.jsx
│       └── DifficultyBadge.scss
├── pages/
│   ├── Home/
│   │   ├── Home.jsx
│   │   └── Home.scss
│   └── Playground/
│       ├── Playground.jsx
│       └── Playground.scss
├── App.jsx
└── index.js
```

### 4.2 Page 1: Home (Assignment Listing)

**What it does:**
- On mount, call `GET /api/assignments` using axios
- Display each assignment as a card showing: title, difficulty badge, description
- Clicking a card navigates to `/playground/:assignmentId`

**Layout (mobile-first):**
- Mobile (320px): Single column, cards stacked vertically
- Tablet (641px): 2-column grid
- Desktop (1024px+): 3-column grid

**Components used:** `Header`, `AssignmentCard`, `DifficultyBadge`

### 4.3 Page 2: Playground (Assignment Attempt Interface)

**What it does:**
This is the main page with 4 panels:

1. **QuestionPanel** (top-left on desktop, top on mobile)
   - Shows the assignment question/description
   - Shows the "Get Hint" button

2. **SchemaViewer** (below question on mobile, sidebar on desktop)
   - Fetches table schemas and sample data from `/api/assignments/:id/tables`
   - Shows table names, column names/types, and 5 sample rows

3. **SQLEditor** (main area)
   - Monaco Editor configured for SQL language
   - "Run Query" button below the editor
   - Use `@monaco-editor/react` package

4. **ResultsTable** (below editor)
   - Shows query results as a table (columns + rows)
   - Shows error messages in red if query fails
   - Shows "No results" state when empty

5. **HintPanel** (overlay/modal or side panel)
   - Triggered by "Get Hint" button
   - Shows loading spinner while LLM responds
   - Displays hint text

**Layout (mobile-first):**
- Mobile: All panels stacked vertically (question → schema → editor → results)
- Tablet: 2-column (question+schema left, editor+results right)
- Desktop: Proper IDE-like layout with resizable panels

### 4.4 Building the SQL Editor Component

```jsx
// SQLEditor.jsx — rough structure
import Editor from '@monaco-editor/react';

function SQLEditor({ onExecute }) {
  const [query, setQuery] = useState('');
  
  return (
    <div className="sql-editor">
      <Editor
        height="300px"
        language="sql"
        theme="vs-dark"
        value={query}
        onChange={(value) => setQuery(value)}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
        }}
      />
      <button 
        className="sql-editor__run-btn"
        onClick={() => onExecute(query)}
      >
        ▶ Run Query
      </button>
    </div>
  );
}
```

### 4.5 Building the Results Table

- Receive `columns` array and `rows` array from API response
- Render an HTML `<table>` with `<thead>` and `<tbody>`
- Handle 3 states: loading, error, success
- Make table horizontally scrollable on mobile

### 4.6 Routing Setup (App.jsx)

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/playground/:assignmentId" element={<Playground />} />
  </Routes>
</BrowserRouter>
```

---

## Phase 5: LLM Hint Integration (Day 2-3 — ~1.5 hours)

### 5.1 Choose an LLM Provider

**Option A: Google Gemini (Free tier available)**
```
npm install @google/generative-ai
```

**Option B: OpenAI**
```
npm install openai
```

### 5.2 Backend Hint Controller Logic

1. Receive `{ assignmentId, userQuery }` from frontend
2. Fetch the assignment details from MongoDB
3. Build a carefully crafted prompt:

```
System: You are a SQL teaching assistant. You help students learn SQL 
by providing hints, NOT solutions. Never write complete SQL queries. 
Instead, guide the student toward the right concept or clause they 
should explore. Keep responses under 3 sentences.

User: 
Assignment: "{assignment.title}"
Question: "{assignment.description}"
Tables available: {assignment.tables_used}
Student's current attempt: "{userQuery}"

Provide a helpful hint.
```

4. Send to LLM API
5. Return the response text

### 5.3 Frontend Integration

- "Get Hint" button in QuestionPanel
- On click: send current query + assignment ID to `/api/hint`
- Show loading state
- Display hint in HintPanel (can be a collapsible section or modal)

---

## Phase 6: Security & Error Handling (Day 3 — ~1 hour)

### 6.1 SQL Sanitization (CRITICAL)

In `middleware/sanitize.js`:
- Parse the query — only allow statements starting with `SELECT`
- Block dangerous keywords: `DROP`, `DELETE`, `INSERT`, `UPDATE`, `ALTER`, `TRUNCATE`, `CREATE`, `GRANT`
- Set a query timeout (e.g., 5 seconds) using `SET statement_timeout = 5000`
- Optionally: run queries in a read-only PostgreSQL transaction

### 6.2 Error Handling

- Wrap all controller functions in try-catch
- Return consistent error format: `{ success: false, error: "message" }`
- Handle: DB connection errors, invalid queries, LLM API failures
- Frontend: show user-friendly error messages (not raw stack traces)

### 6.3 Rate Limiting (Optional but good)

```
npm install express-rate-limit
```
- Limit query execution to 30 requests per minute per IP
- Limit hint requests to 10 per minute per IP

---

## Phase 7: Optional Features (Day 3 — if time permits)

### 7.1 Login/Signup (Optional)
- Use MongoDB to store users (email + hashed password)
- Use `bcrypt` for password hashing, `jsonwebtoken` for JWT auth
- Simple login/signup forms
- Protect hint and query routes with auth middleware

### 7.2 Save Query Attempts (Optional)
- After executing a query, save it to MongoDB `attempts` collection
- Show history of past attempts on the playground page

---

## Phase 8: Seed Scripts (Day 1 — ~30 min)

### 8.1 Create `server/seed/seedPostgres.js`
- Connects to PostgreSQL
- Creates tables (employees, departments, orders, etc.)
- Inserts sample data
- Run with: `node seed/seedPostgres.js`

### 8.2 Create `server/seed/seedAssignments.js`
- Connects to MongoDB
- Inserts 5-8 assignment documents
- Example assignments:
  1. "Select All Employees" (Easy)
  2. "Find Employees by Department" (Easy)
  3. "Calculate Average Salary" (Medium)
  4. "Join Employees with Departments" (Medium)
  5. "Find Top Earners per Department" (Hard)
  6. "Orders Summary with Aggregation" (Medium)
  7. "Subquery: Above Average Salary" (Hard)
  8. "Multi-Table Join with Filtering" (Hard)

---

## Phase 9: Data-Flow Diagram (Day 3 — ~30 min)

### MUST be hand-drawn! Here's what to include:

**Flow: User clicks "Execute Query"**

```
User types SQL → Clicks "Run Query" button
  → React state captures query text
  → Axios POST to /api/query/execute { query: "SELECT..." }
  → Express receives request
  → Sanitization middleware checks query (blocks non-SELECT)
  → Controller sends query to PostgreSQL via pg Pool
  → PostgreSQL executes & returns rows
  → Controller formats response { success: true, columns: [...], rows: [...] }
  → Axios receives response in React
  → setState updates results
  → ResultsTable component re-renders with data
  → User sees formatted table
```

Draw this on paper with boxes and arrows. Label every step. Take a clear photo and add to `data-flow/` folder.

---

## Phase 10: README & Cleanup (Day 3 — ~30 min)

### README.md should include:

1. **Project Title & Description**
2. **Tech Stack** — React, Node/Express, PostgreSQL, MongoDB, Monaco Editor, Gemini/OpenAI
3. **Setup Instructions:**
   - Clone repo
   - Install dependencies (`npm install` in both client/ and server/)
   - Set up PostgreSQL and create database
   - Set up MongoDB Atlas and get connection string
   - Copy `.env.example` to `.env` and fill in values
   - Run seed scripts
   - Start server: `npm run dev`
   - Start client: `npm start`
4. **Environment Variables** — list each one and explain
5. **Folder Structure** — show the tree
6. **Technology Choices** — explain WHY you chose each technology

---

## Summary Timeline

| Time Block | Task | Hours |
|------------|------|-------|
| Day 1 Morning | Project setup, folder structure, dependencies | 1h |
| Day 1 Midday | PostgreSQL + MongoDB setup, seed scripts | 1.5h |
| Day 1 Afternoon | Backend API (assignments, query execution) | 3h |
| Day 2 Morning | SCSS setup, Home page | 2h |
| Day 2 Afternoon | Playground page (editor, results, schema viewer) | 3h |
| Day 2 Evening | LLM hint integration | 1.5h |
| Day 3 Morning | Security, error handling, testing | 1.5h |
| Day 3 Midday | Optional features (auth, save attempts) | 2h |
| Day 3 Afternoon | Data-flow diagram, README, cleanup | 1h |

---

## Quick Checklist

- [ ] Assignment listing page works
- [ ] Clicking an assignment opens the playground
- [ ] Monaco SQL editor loads and accepts input
- [ ] "Run Query" executes against PostgreSQL and shows results
- [ ] Error messages display when query fails
- [ ] Table schemas and sample data are visible
- [ ] "Get Hint" button returns a helpful hint (not solution)
- [ ] SQL queries are sanitized (only SELECT allowed)
- [ ] Mobile responsive (test at 320px, 641px, 1024px, 1281px)
- [ ] SCSS uses variables, mixins, nesting, partials
- [ ] BEM naming convention used
- [ ] Hand-drawn data-flow diagram included
- [ ] README with setup instructions
- [ ] .env.example files present
- [ ] Code is clean and well-structured