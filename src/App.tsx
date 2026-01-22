import { useEffect, useState } from "react";
interface Todo {
  id: number,
  text: string,
  completed: boolean,
  createdAt: string
};

type FilterType = "all" | "active" | "completed" ;

interface TodoStats {
  total: number,
  active: number,
  completed: number,
  completionRate: number
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [] ;
  });

  const [inputValue, setInputValue] = useState<string>('');
  const [editTodoId, setEditTodoId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos])

  const addTodo = (): void => {
    if(!inputValue.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTodos([...todos, newTodo]);
    setInputValue('');
  }

  const toggleTodo = (id: number): void => {
    setTodos(prev => prev.map(t => 
      t.id === id ? {...t, completed: !t.completed}: t 
    ));
  }

  const deleteTodo = (id: number): void => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  const startEdit = (id: number, text: string): void => {
    setEditTodoId(id);
    setEditText(text);
  }

  const saveEdit = (): void => {
    if(!editText.trim()) return cancelEdit();
    setTodos(prev => prev.map(t => 
      t.id !== editTodoId ? {...t, text: editText.trim()} : t
    ));
    cancelEdit();
  }

  const cancelEdit = (): void => {
    setEditTodoId(null);
    setEditText('');
  }

  const clearAllTodo = (): void => {
    if(window.confirm("Are you sure you want to delete all tasks")) setTodos([]);
  }

  const clearCompleted = (): void => {
    setTodos(prev => prev.filter(t => !t.completed));
  }

  const toggleAll = (): void => {
    const allCompleted = todos.every(t => t.completed);
    setTodos(prev => prev.map(t => ({...t, completed: !allCompleted})));
  };

  const filteredTodos = todos.filter((todo) => {
    const matchesFilter = 
    filter === "all" ? true: 
    filter === "active" ? !todo.completed : 
    todo.completed;
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const stats: TodoStats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    completionRate: todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0,
  };


  
  



  

    return(
    <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center p-6">
      <div className="w-full max-w-xl space-y-6">

        {/* ================= HEADER ================= */}
        <h1 className="text-4xl font-bold text-center text-cyan-400">
          Todo Master
        </h1>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div className="bg-slate-800 p-2 rounded">Total<br />{stats.total}</div>
          <div className="bg-slate-800 p-2 rounded">Active<br />{stats.active}</div>
          <div className="bg-slate-800 p-2 rounded">Done<br />{stats.completed}</div>
          <div className="bg-slate-800 p-2 rounded">
            {stats.completionRate}%
          </div>
        </div>

        {/* ================= ADD TODO ================= */}
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
            placeholder="Add a task..."
            className="flex-1 px-3 py-2 bg-slate-800 rounded border border-slate-700"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500"
          >
            Add
          </button>
        </div>

        {/* ================= SEARCH ================= */}
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700"
        />

        {/* ================= FILTERS ================= */}
        <div className="flex gap-2 justify-center">
          {["all", "active", "completed"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 rounded ${
                filter === f
                  ? "bg-cyan-600"
                  : "bg-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ================= BULK ACTIONS ================= */}
        <div className="flex justify-between text-sm">
          <button
            onClick={toggleAll}
            className="text-cyan-400 hover:underline"
          >
            Toggle All
          </button>

          <button
            onClick={clearCompleted}
            className="text-red-400 hover:underline"
          >
            Clear Completed
          </button>
        </div>

        {/* ================= TODO LIST ================= */}
        <ul className="space-y-2">
          {filteredTodos.map(todo => (
            <li
              key={todo.id}
              className="flex items-center gap-3 bg-slate-800 p-3 rounded"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />

              {editTodoId === todo.id ? (
                <>
                  <input
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    className="flex-1 px-2 py-1 bg-slate-700 rounded"
                  />
                  <button onClick={saveEdit}>💾</button>
                  <button onClick={cancelEdit}>❌</button>
                </>
              ) : (
                <>
                  <span
                    className={`flex-1 ${
                      todo.completed
                        ? "line-through text-slate-500"
                        : ""
                    }`}
                  >
                    {todo.text}
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(todo.createdAt).toLocaleString()}
                    </div>
                  </span>
                  <button
                    onClick={() => startEdit(todo.id, todo.text)}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                  >
                    🗑️
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {/* ================= FOOTER ================= */}
        <div className="text-center">
          <button
            onClick={clearAllTodo}
            className="text-red-500 hover:underline text-sm"
          >
            Clear All Todos
          </button>
        </div>

      </div>
    </div>
  );
}

    
