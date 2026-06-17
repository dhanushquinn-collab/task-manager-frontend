import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const navigate = useNavigate();

function handleLogout() {
  localStorage.removeItem("token");
  navigate("/login");
}

  // Fetch all tasks when page loads
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  fetch("http://localhost:3000/tasks", {
    headers: { Authorization: token },
  })
    .then((res) => res.json())
    .then((data: Task[]) => setTasks(data));
  }, []);

  // Add a new task
  function addTask() {
  if (newTask.trim() === "") return;
  const token = localStorage.getItem("token");
  fetch("http://localhost:3000/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
    body: JSON.stringify({ title: newTask }),
  })
    .then((res) => res.json())
    .then((data: Task) => {
      setTasks([...tasks, data]);
      setNewTask("");
    });
}

  // Toggle complete/incomplete
  function toggleTask(id: string) {
  const token = localStorage.getItem("token");
  fetch(`http://localhost:3000/tasks/${id}`, {
    method: "PATCH",
    headers: { Authorization: token || "" },
  })
    .then((res) => res.json())
    .then((updated: Task) => {
      setTasks(tasks.map((task) => task._id === updated._id ? updated : task));
    });
}

  // Delete a task
  function deleteTask(id: string) {
  const token = localStorage.getItem("token");
  fetch(`http://localhost:3000/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: token || "" },
  })
    .then(() => {
      setTasks(tasks.filter((task) => task._id !== id));
    });
}

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h1>Task Manager</h1>

      <button
        onClick={handleLogout}
        style={{ padding: "8px 16px", background: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginBottom: "20px" }}
      >
        Logout
      </button>

      {/* Add Task Input */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter a task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          onClick={addTask}
          style={{ padding: "10px 20px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Add
        </button>
      </div>

      {/* Task List */}
      {tasks.map((task) => (
        <div key={task._id} style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          background: task.completed ? "#f0fff0" : "white"
        }}>
          <span style={{
            textDecoration: task.completed ? "line-through" : "none",
            color: task.completed ? "gray" : "black"
          }}>
            {task.title}
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => toggleTask(task._id)}
              style={{ padding: "5px 10px", background: "#2196F3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
              {task.completed ? "Undo" : "Done"}
            </button>
            <button
              onClick={() => deleteTask(task._id)}
              style={{ padding: "5px 10px", background: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {tasks.length === 0 && <p style={{ color: "gray" }}>No tasks yet. Add one above!</p>}
    </div>
  );
}