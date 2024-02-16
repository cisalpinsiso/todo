import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Router, Routes, useNavigate } from 'react-router-dom';
import Register from './Register';
import axios from 'axios';
import Login from './Login';
import Home from './Home';

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    axios.get("/api/user").then((res) => setUser(res.data)).catch(() => setUser(null));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/" element={<Home user={user} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
