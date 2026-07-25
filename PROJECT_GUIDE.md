# Project Management Dashboard — Project Guide

## Purpose

This repository contains a full-stack project-management dashboard. It lets a team create workspaces, manage projects, add members, create and update tasks, discuss tasks with comments, and review work through dashboard summaries, calendars, and analytics.

This document is the primary orientation guide for developers, reviewers, and AI assistants working on the project.

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Lucide icons |
| Client state | Redux Toolkit and React Redux |
| Charts | Recharts |
| Dates | date-fns |
| Notifications | react-hot-toast |
| API | Express 5 |
| Database | MongoDB with Mongoose |

## Repository structure

```text
E:\1-web
├── src/
│   ├── app/                    # Next.js routes, root layout, Redux provider
│   ├── components/             # Reusable UI components
│   ├── views/                  # Page-level dashboard/project/team views
│   ├── features/               # Redux slices (workspace and theme)
│   ├── lib/                    # API client and current-user helpers
│   └── assets/                 # Local avatar and workspace placeholder assets
├── project-mng-backend/
│   ├── server.js               # Express API and Mongoose schemas
│   ├── .env                    # Local-only configuration; never commit secrets
│   └── .env.example            # Environment-variable template
├── public/                     # Static Next.js assets
├── package.json                # Frontend scripts and dependencies
└── AGENTS.md                   # Mandatory instructions for coding agents
```

`src/project-management/` is an older, unreferenced source copy. The active application uses `src/app`, `src/views`, `src/components`, `src/features`, and `src/lib`.

## Important development rules

- This project uses Next.js 16. Before changing Next.js-specific code, read the relevant locally installed Next.js documentation, as required by `AGENTS.md`.
- Preserve existing user changes. The repository may be in a dirty working state.
- Use the App Router files under `src/app`, not the old `src/pages` implementation.
- Do not commit `.env` files or database credentials.
- Backend data is the source of truth. Redux holds the currently loaded client state.

## Running the application

### Prerequisites

- Node.js compatible with Next.js 16
- npm
- A MongoDB database, either local MongoDB or MongoDB Atlas

### 1. Configure the backend

Copy `project-mng-backend/.env.example` to `project-mng-backend/.env` and set your connection string.

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project-management
PORT=5000
CLIENT_URL=http://localhost:3000
```

Install and start the backend:

```powershell
cd E:\1-web\project-mng-backend
npm install
npm run dev
```

The API listens on `http://localhost:5000` by default.

### 2. Start the frontend

In a separate terminal:

```powershell
cd E:\1-web
npm install
npm run dev
```

Open the URL printed by Next.js (normally `http://localhost:3000`).

### 3. Optional frontend API URL override

The client defaults to `http://localhost:5000/api`. To use a deployed API, add this to a root `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://your-api.example.com/api
```

Restart the Next.js server after changing environment variables.

## Validation commands

Run these after making changes:

```powershell
cd E:\1-web
npm run lint
npm run build
node --check project-mng-backend/server.js
```

The frontend build validates the active Next.js app. The backend has no automated test suite yet, so manually test critical API flows after backend changes.

## Application routes

| URL | Screen | Purpose |
| --- | --- | --- |
| `/` | Dashboard | Summary cards, project overview, recent activity, task summaries |
| `/projects` | Projects | Search, filter, create, and open projects |
| `/projects/[projectId]?tab=tasks` | Project details | Task list for a project |
| `/projects/[projectId]?tab=calendar` | Project details | Due-date calendar and upcoming/overdue work |
| `/projects/[projectId]?tab=analytics` | Project details | Status/type/priority charts and metrics |
| `/projects/[projectId]?tab=settings` | Project details | Edit project and manage its members |
| `/tasks/[projectId]/[taskId]` | Task details | Task information and comments |
| `/team` | Team | Workspace member list and member invitation |

## Main user flows

### Workspace flow

1. A user creates a workspace using the workspace selector or the empty Projects screen.
2. The workspace is stored in MongoDB and selected in Redux.
3. Its ID is saved in browser local storage under `currentWorkspaceId`.
4. On later visits, the app loads all workspaces and restores the saved workspace if it still exists.

### Project flow

1. Select a workspace.
2. Select **New Project**.
3. Enter name, description, status, priority, dates, a project lead, and optional members.
4. The backend adds the project to that workspace and returns the updated workspace.
5. Redux replaces its copy of that workspace with the returned data.

### Task flow

1. Open a project.
2. Select **New Task**.
3. Set title, description, type, priority, assignee, status, and optional due date.
4. Update a task's status from the task table or open it for detailed discussion.
5. Delete tasks from the project task list.

### Collaboration flow

1. Invite a workspace member by email and choose Member or Admin.
2. Add workspace members to individual projects from the project settings tab.
3. Assign project tasks to project members.
4. Post comments on a task detail screen.

## Features currently implemented

- Multiple workspaces and workspace switching
- Persistent selected workspace in browser local storage
- Project creation, update, search, and filtering
- Project status, priority, start/end dates, lead, member list, and progress tracking
- Workspace member addition with member/admin role labels
- Project-member assignment
- Task creation, task status update, task deletion, priority, type, assignee, and due date
- Task comments
- Dashboard cards for projects, completed projects, current-user tasks, and overdue work
- Project overview and recent activity
- Task calendar with selected-date, upcoming, and overdue task sections
- Project analytics charts for task status, type, priority, completion, and team size
- Team member search
- Responsive sidebar/navigation layout
- Light/dark theme toggle persisted in local storage
- Toast feedback for successful and failed actions

## Backend data model

All domain records currently live inside a MongoDB `Workspace` document.

```text
Workspace
├── id, name, slug, description, createdAt, updatedAt
├── members[]
│   ├── id, role
│   └── user { id, name, email, image }
└── projects[]
    ├── id, name, description, status, priority
    ├── start_date, end_date, team_lead, progress
    ├── members[]
    └── tasks[]
        ├── id, title, description, type, status, priority
        ├── assigneeId, due_date, createdAt, updatedAt
        └── comments[]
            ├── id, content, createdAt, updatedAt
            └── user { id, name, email, image }
```

### Valid values used by the UI

| Field | Values |
| --- | --- |
| Project status | `PLANNING`, `ACTIVE`, `COMPLETED`, `ON_HOLD`, `CANCELLED` |
| Project/task priority | `LOW`, `MEDIUM`, `HIGH` |
| Task status | `TODO`, `IN_PROGRESS`, `DONE` |
| Task type | `BUG`, `FEATURE`, `TASK`, `IMPROVEMENT`, `OTHER` |
| Member role | `ADMIN`, `MEMBER` |

## API reference

Base URL: `http://localhost:5000/api` by default.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | API health check |
| `GET` | `/workspaces` | Get all workspaces |
| `POST` | `/workspaces` | Create a workspace (`name` required) |
| `POST` | `/workspaces/:workspaceId/projects` | Create a project |
| `PATCH` | `/workspaces/:workspaceId/projects/:projectId` | Update project fields |
| `POST` | `/workspaces/:workspaceId/projects/:projectId/members` | Add workspace member to project |
| `POST` | `/workspaces/:workspaceId/projects/:projectId/tasks` | Create a task |
| `PATCH` | `/workspaces/:workspaceId/projects/:projectId/tasks/:taskId` | Update task fields/status |
| `DELETE` | `/workspaces/:workspaceId/projects/:projectId/tasks/:taskId` | Delete task |
| `POST` | `/workspaces/:workspaceId/members` | Add workspace member |
| `POST` | `/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments` | Add task comment |

Successful project/member/task/comment mutations return the entire updated workspace. The frontend dispatches `upsertWorkspace` with this response so every view updates from one consistent state object.

## Key implementation details

### MongoDB serialization

The backend converts MongoDB `ObjectId` values to strings and `Date` values to ISO strings before returning JSON. This is essential: route IDs must be strings. Returning raw object IDs causes URLs such as `/workspaces/[object Object]/projects`, which produces the `Invalid workspace id` error.

### Current user behavior

There is no authentication yet. The app identifies the current user from browser storage (`currentUserId`) when it matches a workspace member; otherwise it falls back to the first workspace member. This supports the dashboard's **My Tasks** count but is not security.

### State management

- `workspaceSlice`: loads workspaces, stores the selected workspace, and upserts server responses.
- `themeSlice`: stores and restores the light/dark theme.
- `Providers`: wraps the application in Redux and loads workspaces when the app opens.

### Images

The API currently does not generate profile or workspace images. UI components use local fallback assets from `src/assets/assets.js` when an image is missing.

## Known limitations and recommended next improvements

These are product gaps, not hidden bugs:

1. **No authentication or authorization.** Add real login, user accounts, workspace ownership, and server-side permission checks.
2. **No email delivery.** “Invite Member” currently adds a member record; it does not send an email invitation.
3. **No automated backend tests.** Add API integration tests using a temporary MongoDB database.
4. **No delete/update workspace controls.** Workspace management is intentionally minimal.
5. **No task-comment editing or deletion.** Comments can only be created.
6. **No pagination.** Large workspaces are loaded as one nested document, which will not scale indefinitely.
7. **No validation for all enum/date relationships on the server.** Server-side validation should enforce allowed statuses/priorities and reject end dates before start dates.
8. **No deployment configuration.** A production deployment needs environment variables, restrictive CORS, database backups, and separate frontend/backend hosting.

## Suggested teacher demonstration

1. Create a workspace.
2. Add two members.
3. Create a project with dates, a lead, a priority, and progress.
4. Add members to the project.
5. Create tasks of different types/statuses and assign them.
6. Show the task table, calendar, analytics, and dashboard changes.
7. Open a task and add a comment.
8. Switch to the Team page and dark mode.

## AI assistant quick-start checklist

Before editing:

1. Read `AGENTS.md`.
2. Check `git status --short`; do not overwrite unrelated user changes.
3. Confirm whether the request concerns the active Next.js app or the old `src/project-management` copy.
4. For backend changes, inspect `project-mng-backend/server.js` and preserve the full-workspace response pattern.
5. For frontend mutation changes, use `src/lib/api.js` and dispatch `upsertWorkspace` after success.
6. Run lint and build checks after changes.
7. Restart the backend whenever `server.js` changes; Node does not reload production `node server.js` automatically.

## Troubleshooting

| Symptom | Likely cause | Resolution |
| --- | --- | --- |
| `Invalid workspace id` when creating a project | Backend not restarted after the ObjectId serialization fix | Restart `project-mng-backend` and refresh the frontend |
| API connection error | Backend is stopped, wrong port, CORS mismatch, or invalid MongoDB URI | Start backend, check `.env`, then confirm `CLIENT_URL` and `NEXT_PUBLIC_API_URL` |
| App remains on loading screen | Workspace request is pending or failed unexpectedly | Inspect browser network/console and backend terminal output |
| MongoDB connection failed | Bad Atlas URI, bad credentials, inaccessible IP address, or database service stopped | Verify URI and Atlas Network Access settings |
| Missing-image error | A component renders an API image without fallback | Use an asset fallback from `src/assets/assets.js` |

