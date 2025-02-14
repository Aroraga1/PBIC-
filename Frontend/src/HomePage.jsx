import React, { useState } from "react";
import axios from "axios";

function HomePage() {
  const [regNo, setRegNo] = useState("");
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle the type selection
  const handleTypeSelect = (type) => {
    setUserType(type);
    setErrorMessage(""); // Reset error message
  };

  // Handle the registration number input
  const handleRegNoChange = (e) => {
    setRegNo(e.target.value);
  };

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!regNo || !userType) {
      setErrorMessage("Please select a type and enter a registration number.");
      return;
    }

    try {
      // Send data to the backend to process attendance
      const response = await axios.post("http://localhost:5000/api/attendance", { regNo, type: userType });
      setUserData(response.data); // Display user data after success
    } catch (error) {
      setErrorMessage(error.response ? error.response.data.message : "An error occurred.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to the College Incubation Center Attendance</h1>

      {/* User type selection */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
        <div
          onClick={() => handleTypeSelect("Startup")}
          style={style.box("Startup")}
        >
          Startup
        </div>
        <div
          onClick={() => handleTypeSelect("Member")}
          style={style.box("Member")}
        >
          Member
        </div>
        <div
          onClick={() => handleTypeSelect("Visitor")}
          style={style.box("Visitor")}
        >
          Visitor
        </div>
      </div>

      {/* Registration number input */}
      <input
        type="text"
        placeholder="Enter your Registration No"
        value={regNo}
        onChange={handleRegNoChange}
        style={{ padding: "10px", fontSize: "16px" }}
      />
      <button
        onClick={handleSubmit}
        style={{ padding: "10px 20px", fontSize: "16px", marginLeft: "20px" }}
      >
        Submit
      </button>

      {/* Display error message */}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {/* Display user information */}
      {userData && !errorMessage && (
        <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f0f0f0" }}>
          <h2>Welcome, {userData.name}!</h2>
          <p>Registration No: {userData.regNo}</p>
          <p>Type: {userData.type}</p>
          <p>Total Visits: {userData.visits}</p>
        </div>
      )}
    </div>
  );
}

// Style for type boxes
const style = {
  box: (type) => ({
    padding: "20px 40px",
    backgroundColor: "#4CAF50",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
  }),
};

export default HomePage;
