import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment"; // Still using moment but consider alternatives like dayjs
import { useParams } from "react-router-dom"; // Import useParams
import "../styles/History.css"
const UserHistory = () => {
  const { regNo } = useParams();
  const [historyData, setHistoryData] = useState(null); // Renamed to historyData
  const [totalTime, setTotalTime] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allData, setAllData] = useState([]); // Declare allData properly

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user/${regNo}`);
        if (response.data && response.data.events) {
          setHistoryData(response.data);
          calculateTotalTimeAndCount(response.data.events);
        }

        // Fetching all startups data - if needed
        const allDataResponse = await axios.get("http://localhost:5000/");
        setAllData(allDataResponse.data); // Set the fetched data to allData
      } catch (err) {
        setError("Error fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [regNo]);

  const calculateTotalTimeAndCount = (events) => {
    let totalTimeSpent = 0;
    let enteredEventCount = 0;

    events.forEach((event) => {
      // Guard clauses to check for data presence
      if (!event.timeIn || !event.timeout) return;

      if (event.status === "exited") {
        const timeIn = moment(event.timeIn);
        const timeout = moment(event.timeout);
        const timeSpent = timeout.diff(timeIn);
        totalTimeSpent += timeSpent;
        enteredEventCount++;
      }
    });

    setTotalTime(totalTimeSpent);
    setEventCount(enteredEventCount);
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!historyData || !historyData.events || historyData.events.length === 0)
    return <div>No attendance data for today</div>;

  return (
    <div className="history">
      <div className="regNo">Registration Number: {historyData.regNo}</div>
      <h2>Today's Attendance</h2>
      <p>Total Time Spent Today: {formatTime(totalTime)}</p>
      <p>Number of Events Today: {eventCount}</p>

      <br />

      {historyData.events.map((data) => (
        <div className="event" key={data._id}>
          <div className="timeIn">
            Entered: {moment(data.timeIn).format("YYYY-MM-DD HH:mm:ss")}
          </div>
          <div className="timeOut">
            Exited:{" "}
            {data.timeout
              ? moment(data.timeout).format("YYYY-MM-DD HH:mm:ss")
              : "N/A"}
          </div>
          <br /><br />
        </div>
      ))}
    </div>
  );
};

export default UserHistory;
