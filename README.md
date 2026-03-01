# CipherSQLStudio

Browser-based SQL learning platform where you can practice SQL queries on pre-configured assignments with real-time query execution and LLM-powered hints.

## Tech Stack

- **Frontend**: React (Vite) + vanilla SCSS
- **Code Editor**: Monaco Editor
- **Backend**: Node.js / Express
- **SQL Database**: PostgreSQL (for running student queries)
- **App Database**: MongoDB Atlas (stores assignment data)
- **LLM Hints**: Ollama (local, free) or Google Gemini API

### Why I chose these

- **React + Vite** - fast HMR, simple to set up
- **Vanilla SCSS** - shows CSS fundamentals without relying on component libraries. Uses variables, mixins, nesting, BEM naming
- **Monaco Editor** - same editor as VS Code, has built in SQL syntax highlighting
- **PostgreSQL** - needed a real relational DB for students to run actual SQL against
- **MongoDB** - good for storing assignment metadata as documents, keeps it separate from the SQL sandbox
- **Ollama** - free local LLM so you dont need an API key. I ran out of my free Gemini quota so I added ollama as an alternative

## Project Structure

```
CipherSQLStudio/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # reusable components (Header, SQLEditor, etc)
│   │   ├── pages/        # Home page + Playground page
│   │   ├── services/     # axios API instance
│   │   └── styles/       # SCSS partials (variables, mixins, reset)
│   └── .env.example
├── server/               # Express backend
│   ├── config/           # db connection files
│   ├── controllers/      # request handlers
│   ├── middleware/        # SQL sanitization
│   ├── models/           # mongoose schemas
│   ├── routes/           # API routes
│   ├── seed/             # seed scripts for pg + mongo
│   └── .env.example
├── data-flow/            # hand drawn diagram
└── README.md
```

## How to Run

### You need
- Node.js v18+
- PostgreSQL running locally
- MongoDB Atlas account (free tier works)
- Ollama installed (https://ollama.com) OR a Gemini API key

### 1. Clone it

```bash
git clone <your-repo-url>
cd CipherSQLStudio
```

### 2. Server setup

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and fill in your values:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ciphersqlstudio
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=yourpassword
PG_DATABASE=sql_sandbox
LLM_PROVIDER=ollama

OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral

# only if using gemini instead of ollama
LLM_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.0-flash
```

If using Ollama, pull the model first:
```bash
ollama pull mistral
```

### 3. Create the postgres database

```bash
psql -U postgres
CREATE DATABASE sql_sandbox;
\q
```

### 4. Seed the databases

```bash
npm run seed:pg      # creates tables + sample data in postgres
npm run seed:mongo   # inserts assignments into mongodb
```

### 5. Start server

```bash
npm run dev
```
Runs on http://localhost:5000

### 6. Client setup

```bash
cd ../client
npm install
```

Create `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 7. Start client

```bash
npm run dev
```
Runs on http://localhost:5173

## Environment Variables

**Server (.env)**
- `PORT` - server port (default 5000)
- `MONGO_URI` - mongodb connection string
- `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE` - postgres config
- `LLM_PROVIDER` - `ollama` or `gemini`
- `OLLAMA_HOST`, `OLLAMA_MODEL` - for local ollama
- `LLM_API_KEY`, `GEMINI_MODEL` - for gemini

**Client (.env)**
- `VITE_API_URL` - backend base URL

## Features

- Browse assignments with difficulty badges (Easy/Medium/Hard)
- Monaco SQL editor with syntax highlighting
- Run queries against postgres, see results instantly
- View table schemas and sample data before writing queries
- Get AI hints (not full answers) when stuck
- Responsive - works on mobile, tablet, desktop
- Query sanitization - only SELECT allowed, dangerous keywords blocked

## API Endpoints

- `GET /api/assignments` - list all assignments
- `GET /api/assignments/:id` - get one assignment
- `GET /api/assignments/:id/tables` - get table schemas + sample data
- `POST /api/query/execute` - run a SQL query
- `POST /api/hint` - get LLM hint
- `GET /api/health` - health check
