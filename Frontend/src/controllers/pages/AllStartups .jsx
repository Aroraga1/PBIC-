// src/components/AllStartups.js
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "../styles/AllStartups.css";

const AllStartups = () => {
  const [startups, setStartups] = useState([]);

  useEffect(() => {
    // Fetch the list of all startups from the backend
    axios.get('http://localhost:5000/')
      .then((response) => {
        setStartups(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the startups!", error);
      });
  }, []);

  return (
    <div className="startups-container">
      <h1 className="page-title">All Startups</h1>
      <div className="startups-list">
        {startups.map((startup) => (
          <div className="startup-card" key={startup.regNo}>
            <Link to={`/startup/${startup.regNo}`} className="startup-card-link">
              <div className="startup-card-content">
                <img
                  src={startup.logo || 'https://content.fortune.com/wp-content/uploads/2023/01/OpenAI-Sam-Altman-h_15241239-final.jpg'}
                  alt={startup.name}
                  className="startup-logo"
                />
                <div className="startup-details">
                  <h3 className="startup-name">{startup.name}</h3>
                  <p className="startup-description">{startup.description || 'No description available'}</p>
                  <div className="startup-members">
                    <strong>Team Members:</strong>
                    <ul>
                      {startup.members?.map((member, index) => (
                        <li key={index}>{member}</li>
                      )) || <li>No team members listed</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllStartups;
