import { LIST_COLORS } from "@/constants/colors";
import { TIMING } from "@/constants/app";
import type { TodoData } from "@/hooks/useTodos";

export const defaultData: TodoData = {
  lists: [
    { id: "default", name: "My List", color: LIST_COLORS[0], createdAt: Date.now() - TIMING.MS_PER_DAY },
    { id: "work", name: "Work", color: LIST_COLORS[7], createdAt: Date.now() },
  ],
  todos: [
    { id: 1, listId: "default", text: "Learn React", completed: true, priority: "high", dueDate: "2026-07-30", reminderEnabled: false, createdAt: Date.now() - TIMING.MS_PER_DAY * 3, order: 0 },
    { id: 2, listId: "default", text: "Build a Todo App", completed: true, priority: "medium", dueDate: null, reminderEnabled: false, createdAt: Date.now() - TIMING.MS_PER_DAY * 2, order: 1 },
    { id: 3, listId: "default", text: "Master Tailwind CSS", completed: false, priority: "medium", dueDate: "2026-08-05", reminderEnabled: true, createdAt: Date.now() - TIMING.MS_PER_DAY, order: 2 },
    { id: 4, listId: "default", text: "Deploy to production", completed: false, priority: "high", dueDate: "2026-07-28", reminderEnabled: true, createdAt: Date.now(), order: 3 },
    { id: 5, listId: "work", text: "Review pull requests", completed: false, priority: "low", dueDate: null, reminderEnabled: false, createdAt: Date.now() - 3600000, order: 0 },
    { id: 6, listId: "work", text: "Write documentation", completed: false, priority: "medium", dueDate: "2026-08-01", reminderEnabled: false, createdAt: Date.now() - 7200000, order: 1 },
  ],
  activeListId: "default",
};
