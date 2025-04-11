import React from 'react';
import ReactDOM from 'react-dom/client';
import { useState, useEffect } from 'react';
import { useNavigate, createBrowserRouter, RouterProvider } from 'react-router';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { PublicEvents, PrivateEvents, RSOEvents, CreatePublicEvent, CreatePrivateEvent, CreateRSOEvent } from './Events';

function Register() {
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student',
    uni: 0
  });

  const [unis, setUnis] = useState([]);

  useEffect(_ => {
    fetch("/api/getUniversities", {
      method: "get"
    }).then(data => {
      return data.json();
    }).then(json => {
      setUnis(json.unis);
      setFormData({
        ...formData,
        uni: json.unis[0].UNI_ID,
      });
    });
  }, []);

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

          <label htmlFor="role">University</label>
          <select
            id="uni"
            name="uni"
            value={formData.uni}
            onChange={handleChange}
            style={{ marginBottom: '1.2rem', padding: '0.65rem', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            {
              unis.map((val, idx) => (
                <option key={idx} value={val.UNI_ID}>{val.Name}</option>
              ))
            }
          </select>
          <input type="submit" value="Register" />
        </form>

        <p className="login-link-text">
          Already have an account?
        </p>
        <button
          className="login-link-btn"
          onClick={() => nav("/login")}
        >
          Log in here
        </button>
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

        <p className="register-link-text">
          Don’t have an account?
        </p>
        <button
          className="register-link-btn"
          onClick={() => nav("/register")}
        >
          Register Here
        </button>
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
  const [currentRSOs, setCurrentRSOs] = useState([]);
  const [selectedJoinRSO, setSelectedJoinRSO] = useState(0);
  const [selectedLeaveRSO, setSelectedLeaveRSO] = useState(0);

  const nav = useNavigate();

  const handleChange = (e) => {
    const { value } = e.target;
    setSelectedJoinRSO(value);
  };

  const handleSelectLeaveRSO = (e) => {
    setSelectedLeaveRSO(e.target.value);
  };

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
      if (json.rsos[0]) {
        setSelectedJoinRSO(json.rsos[0].RSO_ID);
      }
    });

    fetch('/api/getCurrentRSOs', {
      method: 'get'
    }).then(data => { return data.json() }).then(json => {
      setCurrentRSOs(json.rsos);
      if (json.rsos[0]) {
        setSelectedLeaveRSO(json.rsos[0].RSO_ID);
      }
    });
  }, []);

  const joinRSO = (e) => {
    e.preventDefault();
    console.log(selectedJoinRSO);

    fetch("/api/joinRSO",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rsoID: selectedJoinRSO })
      }
    ).then(_ => {
      fetch('/api/getCurrentRSOs', {
        method: 'get'
      }).then(data => { return data.json() }).then(json => {
        setCurrentRSOs(json.rsos);
        if (json.rsos[0]) {
          setSelectedLeaveRSO(json.rsos[0].RSO_ID);
        }
      });
    });
  };

  const leaveRSO = (e) => {
    e.preventDefault();

    fetch('/api/leaveRSO', {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        RSO_ID: selectedLeaveRSO
      })
    }).then(_ => {
      fetch('/api/getCurrentRSOs', {
        method: 'get'
      }).then(data => { return data.json() }).then(json => {
        setCurrentRSOs(json.rsos);
        if (json.rsos[0]) {
          setSelectedLeaveRSO(json.rsos[0].RSO_ID);
        }
      });
    });

  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1>Welcome, {firstName || "Guest"} 👋</h1>
        <p className="role-text">Role: {role || "visitor"}</p>

        {role === "admin" && (
          <>
            <AdminDashboard setRSOs={setRSOs} setSelectedRSO={setSelectedJoinRSO} />
          </>
        )}

        {role === "superadmin" && (
          <>
            <SuperAdminDashboard />
          </>
        )}

        <h2>Join an RSO</h2>
        {loggedIn ? (
          <form onSubmit={joinRSO} className="dashboard-form">
            <select value={selectedJoinRSO} onChange={handleChange}>
              {RSOs.map((value, idx) => (
                <option key={idx} value={value.RSO_ID}>{value.Name}</option>
              ))}
            </select>
            <input type="submit" value="Join" />
          </form>
        ) : (
          <button
            className="login-join-btn"
            onClick={() => nav("/login")}
          >
            Log in to join RSOs
          </button>
        )}

        <h2>Leave an RSO</h2>
        {loggedIn ? (
          <form onSubmit={leaveRSO} className="dashboard-form">
            <select value={selectedLeaveRSO} onChange={handleSelectLeaveRSO}>
              {currentRSOs && currentRSOs.map((value, idx) => (
                <option key={idx} value={value.RSO_ID}>{value.Name}</option>
              ))}
            </select>
            <input type="submit" value="Leave" />
          </form>
        ) : (
          <button
            className="login-join-btn"
            onClick={() => nav("/login")}
          >
            Log in to join RSOs
          </button>
        )}

        <input type="button" value="View RSO Events" className="login-join-btn" onClick={() => nav("/rsoevs")} /><br />
        <input type="button" value="View Private Events" className="login-join-btn" onClick={() => nav("/privevs")} /><br />
        <input type="button" value="View Public Events" className="login-join-btn" onClick={() => nav("/pubevs")} /><br />
      </div>
    </div>
  );


}

function SuperAdminDashboard() {
  const [university, setUniversity] = useState("");
}

function AdminDashboard({ setRSOs, setSelectedRSO }) {
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
    }).then(_ => {
      fetch('/api/getRSOs', {
        method: 'get'
      }).then(data => { return data.json() }).then(json => {
        setRSOs(json.rsos);
        if (json.rsos[0]) {
          setSelectedRSO(json.rsos[0].RSO_ID);
        }
      });
    });
  };

  return (
    <div className="admin-dashboard">
      <form onSubmit={handleCreateRSO} className="admin-form">
        <h3>Create a New RSO</h3>

        <div className="form-group">
          <label htmlFor="name">RSO Name</label>
          <input type="text" name="name" id="name" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input type="text" name="description" id="description" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="adminEmail">Admin Email</label>
          <input type="text" name="adminEmail" id="adminEmail" onChange={handleChange} />
        </div>

        <h4>Members</h4>
        <div className="form-grid">
          <input type="text" name="member1" placeholder="Member 1" onChange={handleChange} />
          <input type="text" name="member2" placeholder="Member 2" onChange={handleChange} />
          <input type="text" name="member3" placeholder="Member 3" onChange={handleChange} />
          <input type="text" name="member4" placeholder="Member 4" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="uni">University</label>
          <select name="uni" id="uni" onChange={handleChange}>
            <option value="">Select a university</option>
            {unis.map((item, index) => (
              <option key={index} value={item.UNI_ID}>{item.Name}</option>
            ))}
          </select>
        </div>

        <input type="submit" value="Create RSO" className="admin-submit" />
      </form>
    </div>
  );

}

let router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard
  },
  {
    path: "/rsoevs",
    Component: RSOEvents
  },
  {
    path: "/privevs",
    Component: PrivateEvents,
  },
  {
    path: "/pubevs",
    Component: PublicEvents,
  },
  {
    path: "/create/publicEv",
    Component: CreatePublicEvent
  },
  {
    path: "/create/privateEv",
    Component: CreatePrivateEvent
  },
  {
    path: "/create/rsoEv",
    Component: CreateRSOEvent
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

