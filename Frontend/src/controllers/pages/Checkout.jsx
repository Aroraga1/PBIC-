import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/checkout.css"; 
import logo from "../../assets/logo.png";

function Checkout() {
  const [regNo, setRegNo] = useState("");
  const [startups, setStartups] = useState([]);
  const [activeStartups, setActiveStartups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString()); // Live timestamp state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/");
        setStartups(response.data);
        const actives = response.data.filter(data => data.active === true);
        setActiveStartups(actives);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Update the timestamp every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (regNo) => {
    const user = startups.find(data => data.regNo === regNo);
    if (user) {
      user.active = false;
      await axios.post("http://localhost:5000/attendance", {
        regNo,
        name: user.name,
        type: user.category
      });
    }
  };

  return (
    <div className="full-page">
      <header className="header">
        <img src={logo} alt="PBIC Logo" className="logo" />
        {/* <div className="header-info"> */}
          <h1 className="header-title">Checkout You</h1>
          <p className="timestamp">{currentTime}</p>
        {/* </div> */}
      </header>

      <main className="main-content">
        <section className="checkIn">
          <h2>Ready to Check In?</h2>
          <Link to="/" className="checkIn-btn">Check In</Link>
        </section>

        <section className="activeUsers">
          {activeStartups.length === 0 ? (
            <p>No Active Users at the moment...</p>
          ) : (
            <div className="user-list">
              {activeStartups.map((data, index) => (
                <div key={data._id} className="user-card">
                  <span>{index + 1}</span>
                  <span>{data.regNo}</span>
                  <span>{data.name}</span>
                  <button className="checkout-btn" onClick={() => handleSubmit(data.regNo)}>Check out</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Checkout;
