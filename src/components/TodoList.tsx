import React from "react";
import TodoItem from "./TodoItem";
import { Todo } from "../hooks/useTodos";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onToggle, onDelete }) => {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
        <div className="text-white/70 text-lg font-medium mb-2">
          No todos yet
        </div>
        <div className="text-white/50">Add one above to get started!</div>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default TodoList;
