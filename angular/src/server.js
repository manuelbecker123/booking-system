// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Express Setup
const app = express();
const port = 3000;



// ✅ Enhanced CORS Configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});



app.use(express.json());
app.use(bodyParser.json());

// ✅ Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Your MySQL username
    password: 'root',  // Your MySQL password
    database: 'booking_system' // Change this to your actual database name
});

db.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to booking_system');
});

// ✅ Basic Route to Test Connection
app.get('/', (req, res) => {
    res.send('Server is running and connected to Booking_system');
});





//-----------------------------------------//
// REGISTER ROUTE
//-------------------------------------------//

// ✅ Register Route with created_at
app.post('/api/register', (req, res) => {
    console.log('Incoming Request:', req.body); // ✅ Log the request body

    const { name, email, password, repeatPassword, phone_number } = req.body;

    // ✅ Input Validation
    if (!name || !email || !password || !repeatPassword) {
        console.log('❌ Validation Failed: Missing fields');
        return res.status(400).json({ message: 'All fields are required except phone number.' });
    }
    if (password !== repeatPassword) {
        console.log('❌ Validation Failed: Passwords do not match');
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // ✅ Check if Email Already Exists
    const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, result) => {
        if (err) {
            console.error('❌ Database Error:', err);
            return res.status(500).json({ message: 'Database error.', error: err });
        }
        if (result.length > 0) {
            console.log('❌ Email Already Registered');
            return res.status(400).json({ message: 'Email already registered.' });
        }

        // ✅ Hash Password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // ✅ Insert User Data into Database with created_at
        const insertUserQuery = `
            INSERT INTO users (name, email, password, phone_number, created_at) 
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        db.query(insertUserQuery, [name, email, hashedPassword, phone_number || null], (err, result) => {
            if (err) {
                console.error('❌ Registration Failed:', err);
                return res.status(500).json({ message: 'Registration failed.', error: err });
            }
            console.log('✅ User Registered Successfully');
            // ✅ Only one response is sent here
            return res.status(201).json({ message: 'User registered successfully.' });
        });
    });
});





//-----------------------------------------//
// login
//-------------------------------------------//


const JWT_SECRET = 'your_secret_key_here'; // Use a secure, complex key for production

// LOGIN ROUTE
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // ✅ Input Validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    // ✅ Check if User Exists
    const getUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(getUserQuery, [email], (err, result) => {
        if (err) {
            console.error('❌ Database Error:', err);
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        if (result.length === 0) {
            console.log('❌ User Not Found');
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const user = result[0];

        // ✅ Compare Passwords
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            console.log('❌ Invalid Password');
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '1h' // Token is valid for 1 hour
        });

        // ✅ Successful Login
        console.log('✅ User Logged In Successfully');
        return res.status(200).json({ 
            message: 'Login successful.', 
            userId: user.id,
            email: user.email,
            role: result[0].role,
            token: token
        });
    });
});





//-----------------------------------------//
// ✅ Fetch Available Slots
//-------------------------------------------//

// ✅ Fetch available slots based on selected date (with proper blocking logic)
app.get('/api/available-slots', (req, res) => {
    const selectedDate = req.query.date;
    
    if (!selectedDate) {
        console.log('❌ Date is missing from request');
        return res.status(400).json({ message: 'Date is required.' });
    }

    console.log(`🔍 Checking availability for date: ${selectedDate}`);

    // Define all possible meeting slots
    const allTimeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

    // Query the database for booked meetings on the selected date
    const query = 'SELECT DATE_FORMAT(date_time, "%H:%i") AS time, duration FROM meetings WHERE DATE(date_time) = ?';

    db.query(query, [selectedDate], (err, results) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        console.log('🔍 Booked meetings:', results);

        let bookedSlots = new Set();

        // Iterate through each booked meeting and block the required time slots
        results.forEach(meeting => {
            let startTime = meeting.time;
            let duration = meeting.duration;

            // Determine how many slots to block based on duration
            let slotsToBlock = 1; // Default: 30 mins
            if (duration === '1hr') slotsToBlock = 2;
            if (duration === '1.5hr') slotsToBlock = 3;

            // Get the index of the start time in allTimeSlots
            let startIndex = allTimeSlots.indexOf(startTime);
            if (startIndex !== -1) {
                for (let i = 0; i < slotsToBlock; i++) {
                    if (allTimeSlots[startIndex + i]) {
                        bookedSlots.add(allTimeSlots[startIndex + i]);
                    }
                }
            }
        });

        // Filter out available slots
        const availableSlots = allTimeSlots.filter(slot => !bookedSlots.has(slot));

        console.log('✅ Available Slots:', availableSlots);
        res.json(availableSlots);
    });
});

  

// ✅ Book a Meeting
app.post('/api/meetings', (req, res) => {
    const { userId, title, numPeople, description, meetingDate, startTime, duration } = req.body;

    if (!userId || !title || !numPeople || !meetingDate || !startTime || !duration) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const dateTime = `${meetingDate} ${startTime}:00`;


    console.log(`🔍 Booking Meeting: ${title}, Date-Time: ${dateTime}, Duration: ${duration}`);

    const insertQuery = `
    INSERT INTO meetings (user_id, title, num_people, description, date_time, duration, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
`;

db.query(insertQuery, [userId, title, numPeople, description, dateTime, duration], (err, result) => {
    if (err) {
        return res.status(500).json({ message: 'Database error.', error: err });
    }
    res.status(201).json({ message: 'Meeting booked successfully.' });
});
});

  //-----------------------------------------//
// ✅ Fetch Available Slots
//-------------------------------------------//


app.get('/api/meetings', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: 'User ID is required.' });

    const query = 'SELECT * FROM meetings WHERE user_id = ? ORDER BY date_time ASC';
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error.', error: err });
        res.json(results);
    });
});


app.put('/api/meetings/:id', (req, res) => {
    const meetingId = req.params.id;
    const { userId, role, title, description, dateTime, duration, numPeople } = req.body;
  
    if (!userId || !title || !dateTime || !duration || !numPeople) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
  
    let query = `
      UPDATE meetings 
      SET title = ?, description = ?, date_time = ?, duration = ?, num_people = ?
      WHERE id = ?
    `;
    const params = [title, description, dateTime, duration, numPeople, meetingId];
  
    // Only restrict by user_id if the user is not an admin
    if (role !== 'admin') {
      query += ' AND user_id = ?';
      params.push(userId);
    }
  
    db.query(query, params, (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error.', error: err });
  
      if (result.affectedRows === 0) {
        return res.status(403).json({ message: 'You are not authorized to edit this meeting.' });
      }
  
      res.json({ message: 'Meeting updated successfully.' });
    });
  });
  


  app.delete('/api/meetings/:id', (req, res) => {
    const meetingId = req.params.id;
    const userId = req.query.userId;
    const role = req.query.role;
  
    let query = 'DELETE FROM meetings WHERE id = ?';
    const params = [meetingId];
  
    if (role !== 'admin') {
      query += ' AND user_id = ?';
      params.push(userId);
    }
  
    db.query(query, params, (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error.', error: err });
  
      if (result.affectedRows === 0) {
        return res.status(403).json({ message: 'You are not authorized to delete this meeting.' });
      }
  
      res.json({ message: 'Meeting deleted successfully.' });
    });
  });
  



app.get('/api/all-meetings', (req, res) => {
    const query = `
      SELECT meetings.*, users.email AS client_email 
      FROM meetings
      LEFT JOIN users ON meetings.user_id = users.id
      ORDER BY date_time ASC
    `;
  
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error.', error: err });
      res.json(results);
    });
  });
  



  //-----------------------------------------//
// ✅ subscribe
//-------------------------------------------//





app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
  
    const query = 'INSERT INTO subscribers (email) VALUES (?)';
  
    db.query(query, [email], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'Email is already subscribed.' });
        }
        console.error('❌ Database error:', err);
        return res.status(500).json({ message: 'Database error.', error: err });
      }
  
      res.status(201).json({ message: 'Subscription successful!' });
    });
  });
  




  //-----------------------------------------//
// ✅ Fetch Available Slots
//-------------------------------------------//




  
  //-----------------------------------------//
// ✅ Fetch Available Slots
//-------------------------------------------//
app.set('trust proxy', true);

app.listen(port, () => {
    console.log(`✅ Server is running on http://localhost:${port}`);
});
