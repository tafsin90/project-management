# Project Management API

Create a `.env` file from `.env.example`, replacing `USERNAME`, `PASSWORD`, and `CLUSTER` with your MongoDB Atlas values. The database name in the example is already `project_management`.

Then run `npm install` followed by `npm run dev`.

The API runs at `http://localhost:5000` by default. It exposes workspace, project, task, member, and comment endpoints under `/api`. Start this server before the Next.js frontend.
