import { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/ActiveStartups.css";

const ActiveStartupsPage = () => {
  const [activeStartups, setActiveStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActiveStartups = async () => {
      try {
        const response = await axios.get("http://localhost:5000/");
        // Filter active startups
        const active = response.data.filter((startup) => startup.active === true);
        setActiveStartups(active);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveStartups();
  }, []);

  return (
    <div className="active-startups-container">
      <header className="active-startups-header">
        <h1>Active Startups</h1>
      </header>

      {loading && (
        <div className="loading-spinner">
          <span>Loading...</span>
        </div>
      )}

      {error && <p className="error-message">Error: {error}</p>}

      {!loading && !error && (
        <div className="startups-list">
          {activeStartups.length === 0 ? (
            <p className="no-active-startups">No active startups today.</p>
          ) : (
            <ul>
              {activeStartups.map((startup, index) => (
                <li key={index} className="startup-item">
                  <strong>{startup.name}</strong> (ID: {startup.regNo}) -{" "}
                  <span className="time-in">{new Date(startup.timeIn).toLocaleTimeString()}</span><br />
                  <strong>Visit Count:</strong> <span className="visit-count">{startup.visitCount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveStartupsPage;
