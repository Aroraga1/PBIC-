import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import '../../controllers/styles/Admin.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Admin = () => {
  const [startups, setStartups] = useState([]);
  const [activeStartups, setActiveStartups] = useState([]);
  const [totalActive, setTotalActive] = useState(0);
  const [recentStartups, setRecentStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/");
        setStartups(response.data);
        const active = response.data.filter(data => data.active === true);
        setActiveStartups(active);
        setTotalActive(active.length);

        const today = new Date();
        const recent = response.data.filter(data => {
          const timeIn = new Date(data.timeIn);
          return timeIn.toDateString() === today.toDateString();
        });

        setRecentStartups(recent.sort((a, b) => new Date(a.timeIn) - new Date(b.timeIn)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: ['Total Startups', 'Active Startups', 'Absent Startups'],
    datasets: [
      {
        label: 'Number of Startups',
        data: [startups.length, activeStartups.length, startups.length - totalActive],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        borderColor: ['rgb(255, 99, 132)', 'rgb(75, 192, 192)', 'rgb(255, 206, 86)'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Startup Statistics',
      },
    },
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <img src={logo} alt="Business Incubation Center Logo" className="logo" />
        <h1 className="title">Business Incubation Center - Attendance Dashboard</h1>
      </header>

      <nav className="links">
        <Link to="/startups">Total Startups</Link>
        <Link to="/">Attendance</Link>
        <Link to="/activeStartups">Today's Active Startups</Link>
        <Link to="/checkout">CheckOut</Link>
      </nav>

      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">Error: {error}</p>}

      {!loading && !error && (
        <div className="content">
          <section className="stats">
            <div className="stat-card">
              <h3>Total Startups</h3>
              <p>{startups.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Active Startups</h3>
              <p>{activeStartups.length}</p>
            </div>
            <div className="stat-card">
              <h3>Absent Startups Today</h3>
              <p>{startups.length - totalActive}</p>
            </div>
          </section>

          <section className="chart-section">
            <h3>Startup Statistics</h3>
            <div className="chart-container">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </section>

          <section className="recent-entries">
            <h3>Recent Startup Entries</h3>
            {recentStartups.length === 0 ? (
              <p>No startups attended today.</p>
            ) : (
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Time In</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStartups.map((startup, index) => (
                    <tr key={index}>
                      <td>{startup.name}</td>
                      <td>{startup.regNo}</td>
                      <td>{new Date(startup.timeIn).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="last-updated">Last Updated: {new Date().toLocaleTimeString()}</p>
          </section>
        </div>
      )}
    </div>
  );
};

export default Admin;
