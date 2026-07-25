import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: String,
  },
  { _id: true },
);
const commentSchema = new mongoose.Schema(
  { content: { type: String, required: true }, user: userSchema },
  { timestamps: true },
);
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    type: { type: String, default: "TASK" },
    status: { type: String, default: "TODO" },
    priority: { type: String, default: "MEDIUM" },
    assigneeId: String,
    due_date: Date,
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true },
);
const memberSchema = new mongoose.Schema(
  { role: { type: String, default: "MEMBER" }, user: userSchema },
  { _id: true },
);
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    status: { type: String, default: "PLANNING" },
    priority: { type: String, default: "MEDIUM" },
    start_date: Date,
    end_date: Date,
    team_lead: String,
    progress: { type: Number, default: 0 },
    members: { type: [memberSchema], default: [] },
    tasks: { type: [taskSchema], default: [] },
  },
  { timestamps: true },
);
const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    members: { type: [memberSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
  },
  { timestamps: true },
);
const Workspace = mongoose.model("Workspace", workspaceSchema);

const toClient = (value) => {
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toClient);
  if (value && typeof value === "object") {
    const result = {};
    for (const [key, child] of Object.entries(value))
      result[key === "_id" ? "id" : key] = toClient(child);
    return result;
  }
  return value;
};
const workspaceResponse = (workspace) => {
  const result = toClient(workspace.toObject());
  for (const project of result.projects) {
    for (const task of project.tasks) {
      task.assignee =
        project.members.find((member) => member.user.id === task.assigneeId)
          ?.user || null;
    }
  }
  return result;
};
const requireWorkspace = async (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid workspace id" });
    return null;
  }
  const workspace = await Workspace.findById(id);
  if (!workspace) {
    res.status(404).json({ message: "Workspace not found" });
    return null;
  }
  return workspace;
};

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/workspaces", async (_req, res, next) => {
  try {
    res.json(
      (await Workspace.find().sort({ createdAt: 1 })).map(workspaceResponse),
    );
  } catch (error) {
    next(error);
  }
});
app.post("/api/workspaces", async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name)
      return res.status(400).json({ message: "Workspace name is required" });
    const slug = `${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${Date.now()}`;
    res
      .status(201)
      .json(workspaceResponse(await Workspace.create({ name, slug })));
  } catch (error) {
    next(error);
  }
});
app.post("/api/workspaces/:workspaceId/projects", async (req, res, next) => {
  try {
    const workspace = await requireWorkspace(req.params.workspaceId, res);
    if (!workspace) return;
    const {
      name,
      description,
      status,
      priority,
      start_date,
      end_date,
      team_lead,
      progress,
      memberIds = [],
    } = req.body;
    if (!name?.trim())
      return res.status(400).json({ message: "Project name is required" });
    const members = workspace.members.filter((member) =>
      memberIds.includes(String(member.user._id)),
    );
    workspace.projects.push({
      name,
      description,
      status,
      priority,
      start_date,
      end_date,
      team_lead,
      progress,
      members,
    });
    await workspace.save();
    res.status(201).json(workspaceResponse(workspace));
  } catch (error) {
    next(error);
  }
});
app.patch(
  "/api/workspaces/:workspaceId/projects/:projectId",
  async (req, res, next) => {
    try {
      const workspace = await requireWorkspace(req.params.workspaceId, res);
      if (!workspace) return;
      const project = workspace.projects.id(req.params.projectId);
      if (!project)
        return res.status(404).json({ message: "Project not found" });
      const fields = [
        "name",
        "description",
        "status",
        "priority",
        "start_date",
        "end_date",
        "team_lead",
        "progress",
      ];
      for (const field of fields)
        if (field in req.body) project[field] = req.body[field];
      if (!project.name?.trim())
        return res.status(400).json({ message: "Project name is required" });
      await workspace.save();
      res.json(workspaceResponse(workspace));
    } catch (error) {
      next(error);
    }
  },
);
app.post(
  "/api/workspaces/:workspaceId/projects/:projectId/members",
  async (req, res, next) => {
    try {
      const workspace = await requireWorkspace(req.params.workspaceId, res);
      if (!workspace) return;
      const project = workspace.projects.id(req.params.projectId);
      if (!project)
        return res.status(404).json({ message: "Project not found" });
      const member = workspace.members.id(req.body.memberId);
      if (!member)
        return res.status(404).json({ message: "Workspace member not found" });
      if (
        project.members.some(
          (item) => String(item.user._id) === String(member.user._id),
        )
      )
        return res
          .status(409)
          .json({ message: "Member is already assigned to this project" });
      project.members.push({ role: member.role, user: member.user.toObject() });
      await workspace.save();
      res.status(201).json(workspaceResponse(workspace));
    } catch (error) {
      next(error);
    }
  },
);
app.post(
  "/api/workspaces/:workspaceId/projects/:projectId/tasks",
  async (req, res, next) => {
    try {
      const workspace = await requireWorkspace(req.params.workspaceId, res);
      if (!workspace) return;
      const project = workspace.projects.id(req.params.projectId);
      if (!project)
        return res.status(404).json({ message: "Project not found" });
      const {
        title,
        description,
        type,
        status,
        priority,
        assigneeId,
        due_date,
      } = req.body;
      if (!title?.trim())
        return res.status(400).json({ message: "Task title is required" });
      project.tasks.push({
        title,
        description,
        type,
        status,
        priority,
        assigneeId,
        due_date,
      });
      await workspace.save();
      res.status(201).json(workspaceResponse(workspace));
    } catch (error) {
      next(error);
    }
  },
);
app.patch(
  "/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId",
  async (req, res, next) => {
    try {
      const workspace = await requireWorkspace(req.params.workspaceId, res);
      if (!workspace) return;
      const task = workspace.projects
        .id(req.params.projectId)
        ?.tasks.id(req.params.taskId);
      if (!task) return res.status(404).json({ message: "Task not found" });
      const fields = [
        "title",
        "description",
        "type",
        "status",
        "priority",
        "assigneeId",
        "due_date",
      ];
      for (const field of fields)
        if (field in req.body) task[field] = req.body[field];
      if (!task.title?.trim())
        return res.status(400).json({ message: "Task title is required" });
      await workspace.save();
      res.json(workspaceResponse(workspace));
    } catch (error) {
      next(error);
    }
  },
);
app.delete(
  "/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId",
  async (req, res, next) => {
    try {
      const workspace = await requireWorkspace(req.params.workspaceId, res);
      if (!workspace) return;
      const project = workspace.projects.id(req.params.projectId);
      if (!project?.tasks.id(req.params.taskId))
        return res.status(404).json({ message: "Task not found" });
      project.tasks.pull(req.params.taskId);
      await workspace.save();
      res.json(workspaceResponse(workspace));
    } catch (error) {
      next(error);
    }
  },
);
app.post("/api/workspaces/:workspaceId/members", async (req, res, next) => {
  try {
    const workspace = await requireWorkspace(req.params.workspaceId, res);
    if (!workspace) return;
    const { email, name, role } = req.body;
    if (!email?.trim())
      return res.status(400).json({ message: "Email is required" });
    if (
      workspace.members.some(
        (member) => member.user.email.toLowerCase() === email.toLowerCase(),
      )
    )
      return res
        .status(409)
        .json({ message: "This email is already in the workspace" });
    workspace.members.push({
      role: role === "org:admin" ? "ADMIN" : "MEMBER",
      user: { name: name?.trim() || email.split("@")[0], email },
    });
    await workspace.save();
    res.status(201).json(workspaceResponse(workspace));
  } catch (error) {
    next(error);
  }
});
app.post(
  "/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments",
  async (req, res, next) => {
    try {
      const workspace = await requireWorkspace(req.params.workspaceId, res);
      if (!workspace) return;
      const project = workspace.projects.id(req.params.projectId);
      const task = project?.tasks.id(req.params.taskId);
      if (!task) return res.status(404).json({ message: "Task not found" });
      if (!req.body.content?.trim())
        return res.status(400).json({ message: "Comment cannot be empty" });
      task.comments.push({
        content: req.body.content,
        user: {
          name: req.body.userName || "User",
          email: req.body.userEmail || "user@example.com",
        },
      });
      await workspace.save();
      res.status(201).json(workspaceResponse(workspace));
    } catch (error) {
      next(error);
    }
  },
);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong" });
});

const port = Number(process.env.PORT) || 5000;
if (!process.env.MONGODB_URI)
  throw new Error(
    "MONGODB_URI is required. Copy .env.example to .env and fill it in.",
  );
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() =>
    app.listen(port, () =>
      console.log(`API listening on http://localhost:${port}`),
    ),
  )
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
