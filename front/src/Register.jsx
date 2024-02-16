import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register(props) {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    axios.post("/api/register", {
      username: data.get("username"),
      password: data.get("password"),
      email: data.get("email"),
    }).then((res) => {
      props.setUser(res.data);
      navigate("/");
    }).catch((err) => {
      alert(err.response.data);
    });
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" />
        <input type="email" name="email" placeholder="Email" />
        <input type="password" name="password" placeholder="Password" />
        <input type="submit" value="Register" />
      </form>
    </div>
  )
}

export default Register
