import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

function CreatePublicEvent() {
  const [formData, setFormData] = useState({});

  const updateValues = (e) => {
    e.preventDefault();

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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });
  }

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

function CreatePrivateEvent() {
  const [formData, setFormData] = useState({});

  const updateValues = (e) => {
    e.preventDefault();

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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });
  }

  return (
    <>
      <h2>Create Private Event</h2>

      <form onSubmit={submitEvent}>
        <label for="name">Event Name</label>
        <input type="text" value={formData.name} onChange={updateValues} name="name" id="name" /><br />

        <label for="desc">Description</label>
        <input type="text" value={formData.desc} onChange={updateValues} name="desc" id="desc" /><br />

        <label for="date">Date</label>
        <input type="date" value={formData.date} onChange={updateValues} name="date" id="date" /><br />

        <label for="start">Start Time</label>
        <input type="time" value={formData.start} onChange={updateValues} name="start" id="start" /><br />

        <label for="end">End Time</label>
        <input type="time" value={formData.end} onChange={updateValues} name="end" id="end" /><br />

        <label for="addr">Address</label>
        <input type="text" value={formData.addr} onChange={updateValues} name="addr" id="addr" /><br />

        <label for="phone">Contact Phone</label>
        <input type="text" value={formData.phone} onChange={updateValues} name="phone" id="phone" /><br />

        <label for="email">Contact Email</label>
        <input type="text" value={formData.email} onChange={updateValues} name="email" id="email" /><br />

        <input type="submit" value="Create" />
      </form>
    </>
  );
}

function CreateRSOEvent() {
  const [formData, setFormData] = useState({});
  const [RSOs, setRSOs] = useState([]);

  useEffect(() => {
    fetch("/api/getCurrentRSOs", {
      method: "get",
    }).then(data => data.json()).then(json => {
      setRSOs(json.rsos);
      if (json.rsos[0]) {
        formData.RSO_ID = 0;
      }
    });
  }, []);

  const updateValues = (e) => {
    e.preventDefault();

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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });
  }

  return (
    <>
      <h2>Create RSO Event</h2>

      <form onSubmit={submitEvent}>
        <label for="name">Event Name</label>
        <input type="text" value={formData.name} onChange={updateValues} name="name" id="name" /><br />

        <label for="desc">Description</label>
        <input type="text" value={formData.desc} onChange={updateValues} name="desc" id="desc" /><br />

        <label for="date">Date</label>
        <input type="date" value={formData.date} onChange={updateValues} name="date" id="date" /><br />

        <label for="start">Start Time</label>
        <input type="time" value={formData.start} onChange={updateValues} name="start" id="start" /><br />

        <label for="end">End Time</label>
        <input type="time" value={formData.end} onChange={updateValues} name="end" id="end" /><br />

        <label for="RSO_ID">RSO</label>
        <select name="RSO_ID" id="RSO_ID" value={formData.RSO_ID} onChange={updateValues}>
          {
            RSOs.map((val, idx) => (
              <option key={idx} value={val.RSO_ID}>{val.Name}</option>
            ))
          }
        </select><br />

        <label for="addr">Address</label>
        <input type="text" value={formData.addr} onChange={updateValues} name="addr" id="addr" /><br />

        <label for="phone">Contact Phone</label>
        <input type="text" value={formData.phone} onChange={updateValues} name="phone" id="phone" /><br />

        <label for="email">Contact Email</label>
        <input type="text" value={formData.email} onChange={updateValues} name="email" id="email" /><br />

        <input type="submit" value="Create" />
      </form>
    </>
  );
}

function Event({ ev, key }) {
  return (
    <li key={key}>
      <h3>{ev.Event_name}</h3>
      <p>{ev.Description}</p>
      <p>{ev.Date}</p>
      <p>{ev.Start}</p>
      <p>{ev.End}</p>
      <p>{ev.Contact_Phone}</p>
      <p>{ev.Contact_Email}</p>
      <p>{ev.Address}</p>
    </li>
  );
}

function PublicEvents() {
  const [events, setEvents] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetch("/api/getPublicEvents", {
      method: "get"
    }).then(data => data.json()).then(json => {
      setEvents(json.evs);
    });
  }, []);

  return (
    <>
      <h2>Public Events</h2>
      <input type="button" value="Create Public Event" onClick={_ => nav("/create/publicEv")} />
      <ul>
        {
          events.map((val, idx) => (
            <Event key={idx} ev={val} />
          ))
        }
      </ul>
    </>
  );
}

function PrivateEvents() {
  const [events, setEvents] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetch("/api/getPrivateEvents", {
      method: "get"
    }).then(data => data.json()).then(json => {
      setEvents(json.evs);
    });
  }, []);

  return (
    <>
      <h2>Private Events</h2>
      <input type="button" value="Create Private Event" onClick={_ => nav("/create/privateEv")} />
      <ul>
        {
          events.map((val, idx) => (
            <Event key={idx} ev={val} />
          ))
        }
      </ul>
    </>
  );
}

function RSOEvents() {
  const [events, setEvents] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetch("/api/getRSOEvents", {
      method: "get"
    }).then(data => data.json()).then(json => {
      setEvents(json.evs);
    });
  }, []);

  const createEvent = (e) => {
    e.preventDefault();

    nav("/create/rsoEv");
  }

  return (
    <>
      <h2>RSO Events</h2>
      <input type="button" value="Create RSO Event" onClick={createEvent} />
      <ul>
        {
          events.map((val, idx) => (
            <Event key={idx} ev={val} />
          ))
        }
      </ul>
    </>
  );
}

export { PublicEvents, PrivateEvents, RSOEvents, CreatePublicEvent, CreatePrivateEvent, CreateRSOEvent };
