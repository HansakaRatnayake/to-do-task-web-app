import { Router } from "express";
import {
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    findAllTask,
    findByTaskId
} from "../controller/taskController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

/**
 * @route   POST /tasks
 * @desc    Create a new task for the authenticated user
 * @body    { title: string, description: string }
 */
router.post("/", createTask);

/**
 * @route   PUT /tasks/:id
 * @desc    Update an existing task (title & description) by task ID
 * @param   id - Task propertyId (UUID)
 * @body    { title: string, description: string }
 */
router.put("/:id", updateTask);

/**
 * @route   DELETE /tasks/:id
 * @desc    Delete a task by task ID
 * @param   id - Task propertyId (UUID)
 */
router.delete("/:id", deleteTask);

/**
 * @route   PATCH /tasks/change-status?id=taskId&complete=true|false
 * @desc    Change completion status of a task
 * @query   id - Task propertyId (UUID)
 * @query   complete - Boolean (true or false)
 */
router.patch("/change-status", changeTaskStatus);

/**
 * @route   GET /tasks/list?page=1&limit=10&search=keyword&isComplete=true|false
 * @desc    Get paginated list of tasks for authenticated user
 * @query   page - Current page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   search - Search keyword (matches title or description)
 * @query   isComplete - Filter by completion status (true|false)
 */
router.get("/list", findAllTask);

/**
 * @route   GET /tasks/:id
 * @desc    Get a single task by its ID
 * @param   id - Task propertyId (UUID)
 */
router.get("/:id", findByTaskId);

export default router;
