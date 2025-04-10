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
    }).then(val => val.json())
      .then(json => {
        if (json.error === "none") {
          nav("/login");
        }
      });
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            id="firstName"
            onChange={handleChange}
          />
  
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            id="lastName"
            onChange={handleChange}
          />
  
          <label htmlFor="username">Email</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            id="username"
            onChange={handleChange}
          />
  
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            id="password"
            onChange={handleChange}
          />
  
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ marginBottom: '1.2rem', padding: '0.65rem', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
  
          <input type="submit" value="Register" />
        </form>
      </div>
    </div>
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
    <div className="login-container">
      <div className="login-box">
        <h1>Log In</h1>
        <form onSubmit={submit}>
          <label htmlFor="username">Email</label>
          <input
            type="text"
            name="username"
            id="username"
            value={cred.username}
            onChange={handleChange}
          />
  
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={cred.password}
            onChange={handleChange}
          />
  
          <input type="submit" value="Login" />
        </form>
      </div>
    </div>
  );
  
}

function Dashboard() {
  const [firstName, setFirstName] = useState(localStorage.getItem("firstName"));
  const [lastName, setLastName] = useState(localStorage.getItem("lastName"));
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [RSOs, setRSOs] = useState([]);

  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("loggedIn") === "true") {
      setLoggedIn(true);
    } else {
      nav("/login");
    }

    fetch('/api/getRSOs', {
      method: 'get'
    }).then(data => { return data.json() }).then(json => {
      setRSOs(json.rsos);
    });

  }, []);

  return (
    <>
      {role === "admin" && <AdminDashboard />}
      <h2>Join an RSO</h2>
      <form>
        <select>
          {
            RSOs.map((value, idx) => (
              <option key={idx} value={value.RSO_ID}>{value.Name}</option>
            ))
          }
        </select>
        <input type="submit" value="Join" />
      </form>
    </>
  );
}

function SuperAdminDashboard() {
  const [university, setUniversity] = useState("");
}

function AdminDashboard() {
  const [RSOs, setRSOs] = useState([]);
  const [unis, setUnis] = useState([]);
  const [RSOData, setRSOData] = useState({});

  useEffect(() => {
    fetch("/api/getUniversities", {
      method: "get",
    }).then(data => {
      return data.json();
    }).then(json => {
      setUnis(json.unis);
      console.log(json.unis);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRSOData({
      ...RSOData,
      [name]: value
    });
  };

  const handleCreateRSO = (e) => {
    e.preventDefault();

    fetch("/api/createRSO", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(RSOData)
    });
  };

  return (
    <>
      <form onSubmit={handleCreateRSO}>
        <label for="name">Name</label>
        <input type="text" name="name" id="name" onChange={handleChange} /><br />
        <label for="description">Description</label>
        <input type="text" name="description" id="description" onChange={handleChange} /><br />
        <label for="adminEmail">Admin Email</label>
        <input type="text" name="adminEmail" id="adminEmail" onChange={handleChange} /><br />
        <label for="member1">Member 1</label>
        <input type="text" name="member1" id="member1" onChange={handleChange} /><br />
        <label for="member2">Member 2</label>
        <input type="text" name="member2" id="member2" onChange={handleChange} /><br />
        <label for="member3">Member 3</label>
        <input type="text" name="member3" id="member3" onChange={handleChange} /><br />
        <label for="member4">Member 4</label>
        <input type="text" name="member4" id="member4" onChange={handleChange} /><br />
        <label for="uni">University</label>
        <select name="uni" id="uni" onChange={handleChange}>
          {
            unis.map((item, index) => (
              <option key={index} value={item.Name}>{item.Name}</option>
            ))
          }
        </select> <br />
        <input type="submit" value="Create RSO" />
      </form>
    </>
  );
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

