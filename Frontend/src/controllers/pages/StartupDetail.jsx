// src/components/StartupDetail.js

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import "../styles/StartupsDetails.css";

const StartupDetail = () => {
  const { regNo } = useParams();
  const [startup, setStartup] = useState(null);

  useEffect(() => {
    // Fetch the specific startup by regNo from the backend
    axios.get(`http://localhost:5000/startup/${regNo}`)
      .then((response) => {
        setStartup(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the startup details!", error);
      });
  }, [regNo]);

  if (!startup) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="startup-detail-container">
      <div className="startup-header">
        <img
          src={startup.logo || 'https://content.fortune.com/wp-content/uploads/2023/01/OpenAI-Sam-Altman-h_15241239-final.jpg'}
          alt={startup.name}
          className="startup-logo"
        />
        <h1 className="startup-name">{startup.name}</h1>
      </div>

      <div className="startup-info">
        <p><strong>Registration Number:</strong> {startup.regNo}</p>
        <p><strong>Type:</strong> {startup.type}</p>
        <p><strong>Visit Count:</strong> {startup.visitCount}</p>
        <p><strong>Active:</strong> {startup.active ? 'Yes' : 'No'}</p>
        <p><strong>Last Time In:</strong> {new Date(startup.timeIn).toLocaleString()}</p>
        {startup.timeout && (
          <p><strong>Last Timeout:</strong> {new Date(startup.timeout).toLocaleString()}</p>
        )}
      </div>

      <Link to={`/user/${startup.regNo}`} className="history-link">View History</Link>
    </div>
  );
};

export default StartupDetail;
