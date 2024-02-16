import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login(props) {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    axios.post("/api/login", {
      password: data.get("password"),
      email: data.get("email"),
    }).then((res) => {
      props.setUser(res.data);
      navigate("/");
    }).catch((err) => {
      console.log(err)
      if (err.response && err.response.data)
      alert(err.response.data);
    });
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="email" placeholder="Email" />
        <input type="password" name="password" placeholder="Password" />
        <input type="submit" value="Login" />
      </form>
    </div>
  )
}

export default Login
