import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import logo from '../../assets/logo.png';

function Home() {
  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState(""); 
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  // const [error, setError] = useState(""); 
  const [startups, setStartups] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState("");

  // Update timestamp every second to keep it live
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTimestamp(now.toLocaleString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/");
        setStartups(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isUserExist = async () => {
    const foundUser = startups.find(
      (data) => data.regNo === regNo && data.type === category
    );
    return foundUser;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!regNo) {
      setMessage("Please fill in the Registration Number!");
      return;
    }

    if (category === "visitor" && !name) {
      setMessage("Please provide a name for the visitor.");
      return;
    }

    if (category === "startup" || category === "member" || category === "visitor") {
      const foundUser = await isUserExist();
      if (foundUser) {
        try {
          const response = await axios.post("http://localhost:5000/attendance", {
            regNo,
            name,
            type: category,
          });

          setUser(response.data.user);
          setMessage(response.data.message);
          setTimeout(() => {
            setUser(null);
            setMessage(""); 
          }, 300000);
        } catch (error) {
          setMessage("Error occurred while processing the request.");
          console.error(error);
        }
      } else {
        setMessage("No user found in the selected category.");
      }
    } else {
      setMessage("Please select a valid category.");
    }
  };

  return (
    <>
      <div className="header">
      <img src={logo} alt="PBIC Logo" className="logo" />
        {/* <div> */}
          <div className="title">Check-In You to The PBIC</div>
          <div className="timestamp">{timestamp}</div>
        {/* </div> */}
      </div>

      <div className="Home">
        <h1>Welcome to the Attendance System</h1>
        <div className="categories">
          <button onClick={() => setCategory("startup")} className="category-btn">Startup</button>
          <button onClick={() => setCategory("member")} className="category-btn">Member</button>
          <button onClick={() => setCategory("visitor")} className="category-btn">Visitor</button>
        </div>
{category &&
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="regNo">College Registration Number: </label>
            <input
              type="text"
              id="regNo"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />
          </div>
          {category === "visitor" && (
            <div>
              <label htmlFor="name">Visitor Name: </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <button type="submit">Submit</button>
        </form>
}
        {message && <p>{message}</p>}
        {user && (
          <div>
            <h2>Welcome {user.name}</h2>
            <p>You have successfully checked in!</p>
          </div>
        )}
        
        <div className="checkOutContainer">
          <Link to="/checkout">Checkout</Link>
        </div>
      </div>
    </>
  );
}

export default Home;
