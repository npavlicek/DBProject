import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// ----- Create Public Event -----
function CreatePublicEvent() {
  const [formData, setFormData] = useState({});
  const nav = useNavigate();

  const updateValues = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const submitEvent = (e) => {
    e.preventDefault();
    fetch("/api/createPublicEvent", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    }).then(_ => {
      nav("/pubevs");
    });
  };

  return (
    <div className="page-container">
      <div className="form-box">
        <h2>Create Public Event</h2>
        <form onSubmit={submitEvent}>
          <label htmlFor="name">Event Name</label>
          <input type="text" value={formData.name || ''} onChange={updateValues} name="name" id="name" />

          <label htmlFor="desc">Description</label>
          <input type="text" value={formData.desc || ''} onChange={updateValues} name="desc" id="desc" />

          <label htmlFor="date">Date</label>
          <input type="date" value={formData.date || ''} onChange={updateValues} name="date" id="date" />

          <label htmlFor="start">Start Time</label>
          <input type="time" value={formData.start || ''} onChange={updateValues} name="start" id="start" />

          <label htmlFor="end">End Time</label>
          <input type="time" value={formData.end || ''} onChange={updateValues} name="end" id="end" />

          <label htmlFor="addr">Address</label>
          <input type="text" value={formData.addr || ''} onChange={updateValues} name="addr" id="addr" />

          <label htmlFor="phone">Contact Phone</label>
          <input type="text" value={formData.phone || ''} onChange={updateValues} name="phone" id="phone" />

          <label htmlFor="email">Contact Email</label>
          <input type="text" value={formData.email || ''} onChange={updateValues} name="email" id="email" />

          <input type="submit" value="Create" />
        </form>
      </div>
    </div>
  );
}

// ----- Create Private Event -----
function CreatePrivateEvent() {
  const [formData, setFormData] = useState({});
  const nav = useNavigate();

  const updateValues = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const submitEvent = (e) => {
    e.preventDefault();
    fetch("/api/createPrivateEvent", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    }).then(_ => {
      nav("/privevs");
    });
  };

  return (
    <div className="page-container">
      <div className="form-box">
        <h2>Create Private Event</h2>
        <form onSubmit={submitEvent}>
          <label htmlFor="name">Event Name</label>
          <input type="text" value={formData.name || ''} onChange={updateValues} name="name" id="name" />

          <label htmlFor="desc">Description</label>
          <input type="text" value={formData.desc || ''} onChange={updateValues} name="desc" id="desc" />

          <label htmlFor="date">Date</label>
          <input type="date" value={formData.date || ''} onChange={updateValues} name="date" id="date" />

          <label htmlFor="start">Start Time</label>
          <input type="time" value={formData.start || ''} onChange={updateValues} name="start" id="start" />

          <label htmlFor="end">End Time</label>
          <input type="time" value={formData.end || ''} onChange={updateValues} name="end" id="end" />

          <label htmlFor="addr">Address</label>
          <input type="text" value={formData.addr || ''} onChange={updateValues} name="addr" id="addr" />

          <label htmlFor="phone">Contact Phone</label>
          <input type="text" value={formData.phone || ''} onChange={updateValues} name="phone" id="phone" />

          <label htmlFor="email">Contact Email</label>
          <input type="text" value={formData.email || ''} onChange={updateValues} name="email" id="email" />

          <input type="submit" value="Create" />
        </form>
      </div>
    </div>
  );
}

// ----- Create RSO Event -----
function CreateRSOEvent() {
  const [formData, setFormData] = useState({});
  const [RSOs, setRSOs] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetch("/api/getCurrentRSOs")
      .then(res => res.json())
      .then(json => {
        setRSOs(json.rsos);
        if (json.rsos.length > 0) {
          setFormData(prev => ({ ...prev, RSO_ID: json.rsos[0].RSO_ID }));
        }
      });
  }, []);

  const updateValues = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const submitEvent = (e) => {
    e.preventDefault();
    fetch("/api/createRSOEvent", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    }).then(_ => {
      nav("/rsoevs");
    });
  };

  return (
    <div className="page-container">
      <div className="form-box">
        <h2>Create RSO Event</h2>
        <form onSubmit={submitEvent}>
          <label htmlFor="name">Event Name</label>
          <input type="text" value={formData.name || ''} onChange={updateValues} name="name" id="name" />

          <label htmlFor="desc">Description</label>
          <input type="text" value={formData.desc || ''} onChange={updateValues} name="desc" id="desc" />

          <label htmlFor="date">Date</label>
          <input type="date" value={formData.date || ''} onChange={updateValues} name="date" id="date" />

          <label htmlFor="start">Start Time</label>
          <input type="time" value={formData.start || ''} onChange={updateValues} name="start" id="start" />

          <label htmlFor="end">End Time</label>
          <input type="time" value={formData.end || ''} onChange={updateValues} name="end" id="end" />

          <label htmlFor="RSO_ID">RSO</label>
          <select name="RSO_ID" id="RSO_ID" value={formData.RSO_ID || ''} onChange={updateValues}>
            {RSOs.map((val, idx) => (
              <option key={idx} value={val.RSO_ID}>{val.Name}</option>
            ))}
          </select>

          <label htmlFor="addr">Address</label>
          <input type="text" value={formData.addr || ''} onChange={updateValues} name="addr" id="addr" />

          <label htmlFor="phone">Contact Phone</label>
          <input type="text" value={formData.phone || ''} onChange={updateValues} name="phone" id="phone" />

          <label htmlFor="email">Contact Email</label>
          <input type="text" value={formData.email || ''} onChange={updateValues} name="email" id="email" />

          <input type="submit" value="Create" />
        </form>
      </div>
    </div>
  );
}

function CommentInputForm({ evid, commentPostedHandler }) {
  const [formData, setFormData] = useState({});
  const postComment = (e) => {
    e.preventDefault();

    fetch("/api/postComment", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...formData,
        Event_ID: evid
      })
    }).then(_ => {
      commentPostedHandler();
    });
  };

  const updateForm = (e) => {
    e.preventDefault();

    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <form onSubmit={postComment}>
      <label>Comment</label>
      <input type="text" value={formData.comment} onChange={updateForm} name="comment" id="comment" /><br />

      <label>Rating (out of 5)</label>
      <input type="number" max="5" value={formData.rating} onChange={updateForm} name="rating" id="rating" /><br />

      <input type="submit" value="Post Comment" />
    </form>
  );
}

function Comment() {
  return (
    <p>Comment</p>
  );
}

// ----- Event Card -----
function Event({ ev }) {
  const [commentBox, setCommentBox] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(_ => {
    fetch("/api/getComments", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Event_ID: ev.Event_ID
      })
    }).then(data => data.json()).then(json => {
      console.log(json);
      setComments(json.comments);
    });
  }, []);

  const commentPostedHandler = _ => {
    setCommentBox(false);

    fetch("/api/getComments", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Event_ID: ev.Event_ID
      })
    }).then(data => data.json()).then(json => {
      setComments(json.comments);
    });
  };

  return (
    <li className="event-card">
      <h3>{ev.Event_name}</h3>
      <p><strong>Description:</strong> {ev.Description}</p>
      <p><strong>Date:</strong> {ev.Date}</p>
      <p><strong>Start:</strong> {ev.Start}</p>
      <p><strong>End:</strong> {ev.End}</p>
      <p><strong>Phone:</strong> {ev.Contact_Phone}</p>
      <p><strong>Email:</strong> {ev.Contact_Email}</p>
      <p><strong>Address:</strong> {ev.Address}</p>
      {!commentBox &&
        <>
          <input className="login-join-btn" type="button" value="Write a Comment" onClick={_ => { setCommentBox(true) }} />
          <ul style={{ listStyleType: "none", padding: "0px", paddingTop: "15px" }}>
            {
              comments.map((val, idx) => (
                <li key={idx}>{val.username}: {val.Comment_text}<br />Rating: {val.Comment_rating}/5</li>
              ))
            }
          </ul>
        </>
      }
      {commentBox &&
        <CommentInputForm evid={ev.Event_ID} commentPostedHandler={commentPostedHandler} />
      }
    </li>
  );
}

// ----- Public Events -----
function PublicEvents() {
  const [events, setEvents] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetch("/api/getPublicEvents")
      .then(res => res.json())
      .then(json => setEvents(json.evs));
  }, []);

  return (
    <div className="page-container">
      <h2>Public Events</h2>
      <button className="login-join-btn" onClick={() => nav("/dashboard")}>Dashboard</button>
      <button className="login-join-btn" onClick={() => nav("/create/publicEv")}>Create Public Event</button>
      <ul className="event-list">
        {events.map((ev, idx) => <Event key={idx} ev={ev} />)}
      </ul>
    </div>
  );
}

// ----- Private Events -----
function PrivateEvents() {
  const [events, setEvents] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetch("/api/getPrivateEvents")
      .then(res => res.json())
      .then(json => setEvents(json.evs));
  }, []);

  return (
    <div className="page-container">
      <h2>Private Events</h2>
      <button className="login-join-btn" onClick={() => nav("/dashboard")}>Dashboard</button>
      <button className="login-join-btn" onClick={() => nav("/create/privateEv")}>Create Private Event</button>
      <ul className="event-list">
        {events.map((ev, idx) => <Event key={idx} ev={ev} />)}
      </ul>
    </div>
  );
}

// ----- RSO Events -----
function RSOEvents() {
  const [events, setEvents] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetch("/api/getRSOEvents")
      .then(res => res.json())
      .then(json => setEvents(json.evs));
  }, []);

  return (
    <div className="page-container">
      <h2>RSO Events</h2>
      <button className="login-join-btn" onClick={() => nav("/dashboard")}>Dashboard</button>
      <button className="login-join-btn" onClick={() => nav("/create/rsoEv")}>Create RSO Event</button>
      <ul className="event-list">
        {events.map((ev, idx) => <Event key={idx} ev={ev} />)}
      </ul>
    </div>
  );
}

export {
  PublicEvents,
  PrivateEvents,
  RSOEvents,
  CreatePublicEvent,
  CreatePrivateEvent,
  CreateRSOEvent
};
