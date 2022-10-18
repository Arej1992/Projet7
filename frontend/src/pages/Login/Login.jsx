
import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { Navigate, NavLink, useNavigate } from "react-router-dom";

import { isLogged } from "../../auth";

import "./login.css";

function Login() {
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isLogged()) {
      navigate("/home");
    }
  }, []);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [handleError, setHandleError] = useState();

  const Submit = async (e) => {
    e.preventDefault();
    try {
        if (form.email === "" || form.password === "") {
        alert("Please Fill The Form");
      } else {
        const data = await axios.post(
          "http://localhost:5000/api/auth/login",
          form
        );

        localStorage.setItem("logged", JSON.stringify(data.data));
        navigate("/home");
      }
    } catch (error) {
      setHandleError(error.response.data.error)
    }
  
  };

  return (
    <div className="login">
      <div className="container">
        <div className="login-content">
          <img src="images/icon-left-font.png" alt="Not found" />
          <h2>login</h2>
          <form onSubmit={Submit}>
            <input
              type="email"
              placeholder="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="submit">Login</button>
          </form>
          <span className="error-response"
          >
            {handleError}
          </span>
          <span>
            Don't have account <NavLink to="/Signup">SignUp</NavLink>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;