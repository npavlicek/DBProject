import React from 'react';
import ReactDOM from 'react-dom/client';
import { useState, useEffect } from 'react';
import { useNavigate, createBrowserRouter, RouterProvider } from 'react-router';
import './index.css';
import reportWebVitals from './reportWebVitals';

function Register() {
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('/api/register', {
      headers: {
        "Content-type": "application/json"
      },
      method: "post",
      body: JSON.stringify(formData)
    }).then(val => {
      return val.json();
    }).then(json => {
      if (json.error === "none") {
        nav("/login");
      }
    });
  };

  return (
    <>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label for="firstName">First Name</label>
        <input type="text" name="firstName" value={formData.firstName} id="firstName" onChange={handleChange} /><br />
        <label for="lastName">Last Name</label>
        <input type="text" name="lastName" value={formData.lastName} id="lastName" onChange={handleChange} /><br />
        <label for="username">Username</label>
        <input type="text" name="username" value={formData.username} id="username" onChange={handleChange} /><br />
        <label for="password">Password</label>
        <input type="password" name="password" value={formData.password} id="password" onChange={handleChange} /><br />
        <label for="role">Role</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select><br />
        <input type="submit" value="Register" />
      </form>
    </>
  );
}

function Login() {
  const [cred, setCred] = useState({
    username: "",
    password: "",
  });

  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCred({
      ...cred,
      [name]: value
    });
  };

  const submit = (e) => {
    e.preventDefault();

    fetch("/api/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cred)
    }).then(data => {
      return data.json();
    }).then(json => {
      if (json.error === "none") {
        localStorage.setItem("firstName", json.firstName);
        localStorage.setItem("lastName", json.lastName);
        if (json.isAdmin) {
          localStorage.setItem("role", "admin");
        } else if (json.isSuperAdmin) {
          localStorage.setItem("role", "superAdmin");
        } else {
          localStorage.setItem("role", "student");
        }
        localStorage.setItem("loggedIn", "true");
        nav("/dashboard");
      }
    });
  };

  return (
    <>
      <h1>Log In</h1>
      <form onSubmit={submit}>
        <label for="username">Username</label>
        <input type="text" name="username" id="username" value={cred.username} onChange={handleChange} /> <br />
        <label for="password">Password</label>
        <input type="password" name="password" id="password" value={cred.password} onChange={handleChange} /> <br />
        <input type="submit" value="Login" />
      </form>
    </>
  );
}

function Dashboard() {
  const [firstName, setFirstName] = useState(localStorage.getItem("firstName"));
  const [lastName, setLastName] = useState(localStorage.getItem("lastName"));
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role"));

  const nav = useNavigate();


  useEffect(() => {
    if (localStorage.getItem("loggedIn") === "true") {
      setLoggedIn(true);
    } else {
      nav("/login");
    }
  }, []);

  return (
    <>
      <p>{firstName}</p>
      <p>{lastName}</p>
      <p>{loggedIn}</p>
      <p>{role}</p>
    </>
  );
}

function SuperAdminDashboard() {
  const [university, setUniversity] = useState("");
}

function AdminDashboard() {
  const [RSO, setRSO] = useState(false);

  return RSO ? (
    <>{RSO && <h1>RSO</h1>}</>
  ) : (<></>);
}

let router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard
  },
  {
    path: "/dashboard",
    Component: Dashboard
  },
  {
    path: "/register",
    Component: Register
  },
  {
    path: "login",
    Component: Login
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
