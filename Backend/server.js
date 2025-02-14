const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
// const CsvParser = require("json2csv").Parser;
const app = express();
const moment = require("moment");

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: "*", methods: "GET,POST" }));

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/attendanceApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Startups Schema
const StartupsSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["startup", "member", "visitor"],
    default: "startup",
  },
  visitCount: { type: Number, default: 1 },
  active: { type: Boolean, default: false },
  timeIn: { type: Date, default: Date.now },
  timeout: { type: Date },
});

const Startups = mongoose.model("Startups", StartupsSchema);

// Time History Schema
const HistorySchema = new mongoose.Schema({
  regNo: { type: String, ref: "Startups" },
  events: [
    {
      timeIn: { type: Date, default: Date.now },
      timeout: { type: Date },
      status: { type: String, enum: ["entered", "exited"], required: true },
    },
  ],
});

const History = mongoose.model("History", HistorySchema);

// Helper function to delete 'entered' data when a user exits
const deleteEnteredData = async (regNo) => {
  try {
    const history = await History.findOne({ regNo });
    if (history) {
      // Filter out all 'entered' events
      history.events = history.events.filter(
        (event) => event.status !== "entered"
      );
      await history.save();
      console.log(`Deleted 'entered' events for user ${regNo}`);
    }
  } catch (error) {
    console.error("Error deleting entered data:", error);
  }
};

// Route to fetch all users
app.get("/", async (req, res) => {
  try {
    const users = await Startups.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Route to fetch user history by regNo
app.get("/user/:regNo", async (req, res) => {
  const { regNo } = req.params;
  try {
    // Find the history for the user
    const history = await History.findOne({ regNo });

    if (!history) {
      return res
        .status(404)
        .json({ message: "History not found for this user." });
    }

    res.send(history); // Return the complete history of the user
  } catch (error) {
    console.error("Error fetching user history:", error);
    res.status(500).json({ message: "Error fetching user history" });
  }
});

// Helper function to handle automatic timeout for users
const handleUserTimeouts = async () => {
  const currentTime = new Date();
  const users = await Startups.find({ active: true });

  users.forEach(async (user) => {
    const timeout = new Date(user.timeIn);
    timeout.setSeconds(timeout.getSeconds() + 10); // Timeout after 10 seconds for testing

    if (currentTime >= timeout) {
      user.active = false;
      user.timeout = new Date(); // Set the timeout
      const history = await History.findOne({ regNo: user.regNo });

      if (history) {
        // Push a new event to the history
        history.events.push({
          timeIn: user.timeIn,
          timeout: user.timeout,
          status: "exited", // Mark as exited
        });
        await history.save();
      } else {
        // If no history exists for this user, create a new history record
        const newHistory = new History({
          regNo: user.regNo,
          events: [
            {
              timeIn: user.timeIn,
              timeout: user.timeout,
              status: "exited",
            },
          ],
        });
        await newHistory.save();
      }

      user.visitCount = 0;
      await user.save();
      console.log(`User ${user.name} timed out at ${user.timeout}`);
    }
  });
};

// Route to add/update user attendance
app.post("/attendance", async (req, res) => {
  const { regNo, name, type } = req.body;
  try {
    let user = await Startups.findOne({ regNo });
    let history = await History.findOne({ regNo });

    if (user) {
      // If user exists, handle exit logic
      if (user.active) {
        // If user is active, mark them as exited and update timeout
        user.timeout = new Date();
        user.active = false;

        if (history) {
          // If history exists, push a new event
          history.events.push({
            timeIn: user.timeIn,
            timeout: user.timeout,
            status: "exited", // Mark as exited
          });
          await history.save();
        } else {
          // If no history exists, create a new record
          const newHistory = new History({
            regNo: user.regNo,
            events: [
              {
                timeIn: user.timeIn,
                timeout: user.timeout,
                status: "exited",
              },
            ],
          });
          await newHistory.save();
        }

        // Delete 'entered' events after the user exits
        await deleteEnteredData(user.regNo);

        await user.save();
        return res.status(200).json({
          message: `${user.name} has exited. Timeout set at ${user.timeout}`,
          user,
        });
      } else {
        // If user is already exited, update visit count and set new timeIn
        user.visitCount += 1;
        user.timeIn = new Date();
        user.active = true;

        if (history) {
          // Push a new "entered" event into history
          history.events.push({
            timeIn: user.timeIn,
            timeout: null, // No timeout yet
            status: "entered", // Mark as entered
          });
          await history.save();
        } else {
          // If no history exists, create a new record
          const newHistory = new History({
            regNo: user.regNo,
            events: [
              {
                timeIn: user.timeIn,
                timeout: null,
                status: "entered",
              },
            ],
          });
          await newHistory.save();
        }

        await user.save();
        return res.status(200).json({
          message: `Welcome back ${user.name}! Visit #${user.visitCount}`,
          user,
        });
      }
    } else {
      // Create new user if doesn't exist
      const newUser = new Startups({
        regNo,
        name,
        type: "visitor",
        timeIn: new Date(),
      });
      await newUser.save();

      // Create a new history entry for the visitor
      const newHistory = new History({
        regNo: newUser.regNo,
        events: [
          {
            timeIn: newUser.timeIn,
            timeout: null,
            status: "entered", // Visitor enters
          },
        ],
      });
      await newHistory.save();

      return res.status(201).json({
        message: `Welcome ${newUser.name}! You've been added as a visitor.`,
        user: newUser,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Call this function to automatically mark users as inactive after 10 seconds
setInterval(() => {
  const currentTime = new Date();
  const testTime = new Date();
  testTime.setHours(15, 15, 0); // Test time at 3:15 PM
  if (currentTime.getHours() === 15 && currentTime.getMinutes() === 15) {
    console.log("Simulating automatic timeout for all users at 3:15 PM.");
    handleUserTimeouts();
  }
}, 60000); // Check every minute

// Route to fetch specific startup by regNo
app.get("/startup/:regNo", async (req, res) => {
  const { regNo } = req.params;
  try {
    const startup = await Startups.findOne({ regNo });
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    res.json(startup);
  } catch (error) {
    console.error("Error fetching startup details", error);
    res.status(500).json({ message: "Error fetching startup details" });
  }
});

app.get("/excel/:regNo", async (req, res) => {
  try {
    const { regNo } = req.params;
    let users = [];

    // Find the startup based on regNo
    const startups = await Startups.findOne({ regNo });

    // Check if startup exists
    if (!startups) {
      return res
        .status(404)
        .json({ message: "No startup found for the given regNo" });
    }

    const history = await History.findOne({ regNo });

    // Check if history exists and contains events
    if (!history || history.events.length === 0) {
      return res
        .status(404)
        .json({ message: "No data found for the given regNo" });
    }

    // Debugging: Log all events to see what is being processed
    console.log(history.events);

    history.events.forEach((event) => {
      console.log(event.status, event.timeout); // Check status and timeout
      if (event.status === "entered" && event.timeout) {
        const timeIn = moment(event.timeIn, moment.ISO_8601);
        const timeout = moment(event.timeout, moment.ISO_8601);

        if (!timeIn.isValid() || !timeout.isValid()) {
          return; // Skip invalid timeIn or timeout
        }

        // Calculate time difference in minutes
        const timeSpent = timeout.diff(timeIn, "minutes");

        // Calculate hours and minutes
        const hoursSpent = Math.floor(timeSpent / 60);
        const minutesSpent = timeSpent % 60;

        users.push({
          timeIn: timeIn.format("YYYY-MM-DD HH:mm:ss"),
          timeout: timeout.format("YYYY-MM-DD HH:mm:ss"),
          hoursSpent,
          minutesSpent,
        });
      }
    });

    // If users array is empty, return an error
    if (users.length === 0) {
      return res.status(404).json({
        message: "No relevant events found for the given regNo",
        eventCount: history.events.length,
        events: history.events, // Optional: to see raw event data for debugging
      });
    }

    // Assuming you are using json2csv or a similar CSV library
    const { Parser } = require("json2csv").Parser;
    const csvFields = ["timeIn", "timeout", "hoursSpent", "minutesSpent"];
    const csvParser = new Parser({ csvFields });
    const csvData = csvParser.parse(users);

    // Debugging: Check the CSV data before sending it
    console.log(csvData); // Log the CSV data

    // Set the response headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment;filename=HistoryData.csv");

    // Send the CSV data to the client
    res.status(200).end(csvData); // This sends the CSV file as a response
  } catch (error) {
    console.error("Error generating CSV:", error);
    res.status(500).json({ message: "Error generating CSV" });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
