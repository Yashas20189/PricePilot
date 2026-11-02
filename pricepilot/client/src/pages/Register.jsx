
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/register`,
        {
          name: name.trim(),
          email: email.trim(),
          password,
        }
      );

      alert("Registration Successful!");

      console.log(response.data);

      navigate("/login");
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;

        if (message === "Email already registered") {
          const goToLogin = window.confirm(
            "Email already registered. Do you want to go to the Login page?"
          );

          if (goToLogin) {
            navigate("/login");
          }
        } else {
          alert(message || "Registration failed");
        }
      } else {
        alert("Unable to connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <br />
        <br />

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <br />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;
