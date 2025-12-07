import TodoList from "./components/TodoList";
import AddTodo from "./components/AddTodo";
import { useTodos } from "./hooks/useTodos";

function App() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-400 via-purple-500 to-pink-500 py-8 px-4">
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-6">
          <h1 className="text-4xl font-bold text-center text-white mb-8 drop-shadow-lg">
            Todo App
          </h1>
          <AddTodo onAdd={addTodo} />
          <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
        </div>
      </div>
    </div>
  );
}

export default App;
