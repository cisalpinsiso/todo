import { useEffect, useState } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';

function Home(props) {
  const [todos, setTodos] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  useEffect(() => {
    axios.get("/api/todos").then((res) => setTodos(res.data)).catch(() => null);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    axios.post("/api/todos", {
      title: data.get("title"),
    }).then(() => {
      axios.get("/api/todos").then((res) => setTodos(res.data)).catch(() => null);
    }).catch(() => null);
  }

  const handleDelete = (id) => {
    axios.delete(`/api/todos/${id}`).then(() => {
      axios.get("/api/todos").then((res) => setTodos(res.data)).catch(() => null);
    }).catch(() => null);
  }

  const handleComplete = (completed, id) =>
    axios.put(`/api/todos/${id}`, {
      completed: completed,
      type: "markComplete"
    }).then(() => {
      axios.get("/api/todos").then((res) => setTodos(res.data)).catch(() => null);
    }).catch(() => null);

  const changeCategory = (category, id) =>
    axios.put(`/api/todos/${id}`, {
      category: category,
      type: "changeCategory"
    }).then(() => {
      axios.get("/api/todos").then((res) => setTodos(res.data)).catch(() => null);
    }).catch(() => null);

  return (
    <>
      {props.user ?
        <div>
          <h1>Todos</h1>
          <p>Registered as <b>{props.user.username}</b></p>
          <div className='todoTop'>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
            <select name="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="All">All</option>
              <option value="Todo">Todo</option>
              <option value="Working on it">Working on it</option>
              <option value="Under review">Under review</option>
            </select>
            <form className='createTodo' onSubmit={handleSubmit}>
              <input type="text" placeholder="Content" name="title" />
              <input type="submit" value="Add" />
            </form>
          </div>
          {todos.length === 0 ?
            <p>No todos</p>
            :
            <ul>
              {todos.filter((todo) => search === "" || todo.text.includes(search)).filter((todo) => type === "All" || todo.category === type).map((todo) => (
                <li key={todo.id} className={todo.completed ? "completed" : ""}>
                  <span>{todo.text}</span>
                  <span class="author">{todo.author_username}</span>
                  <div className='buttons'>
                    <button className='delete' onClick={() => handleDelete(todo.id)}>Delete</button>
                    <button className={`toggle`} onClick={() => handleComplete(!todo.completed, todo.id)}>{todo.completed ? "Mark incomplete" : "Mark complete"}</button>
                    {!todo.completed && 
                      <select name="category" value={todo.category} onChange={(e) => changeCategory(e.target.value, todo.id)}>
                        <option value="Todo">Todo</option>
                        <option value="Working on it">Working on it</option>
                        <option value="Under review">Under review</option>
                      </select>
                    }
                    <span className='date'>{todo.date}</span>
                  </div> 
                </li>
              ))}
            </ul>
          }
        </div>
        :
        <div>
          <h1>Home</h1>
          <p>You are not logged in. Please login to view the todo.</p>
          <div className='links'>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      }
    </>
  )
}

export default Home
