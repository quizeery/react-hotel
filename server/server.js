const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'hotel_booking'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MariaDB:', err);
    return;
  }
  console.log('Connected to MariaDB');
});


const JWT_SECRET = 'backend';


const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/api/bookings/:room', (req, res) => {
  const room = req.params.room;
  db.query(
    'SELECT * FROM bookings WHERE room = ?',
    [room],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(results);
    }
  );
});

app.post('/api/bookings', (req, res) => {
  const { name, email, phone, startDate, endDate, room } = req.body;

  // error 1
  db.query(
    `SELECT * FROM bookings 
     WHERE room = ? AND (
       (? BETWEEN start_date AND end_date) OR
       (? BETWEEN start_date AND end_date) OR
       (start_date BETWEEN ? AND ?) OR
       (end_date BETWEEN ? AND ?)
     )`,
    [room, startDate, endDate, startDate, endDate, startDate, endDate],
    (err, results) => {
      if (err) {
        console.error('Error checking conflicts:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      // error 2
      if (results.length > 0) {
        res.status(409).json({ 
          error: 'These dates are already booked for this room',
          conflicts: results 
        });
        return;
      }

      // nowa rezerwacja
      db.query(
        'INSERT INTO bookings (name, email, phone, start_date, end_date, room) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, phone, startDate, endDate, room],
        (insertErr, result) => {
          if (insertErr) {
            console.error('Error creating booking:', insertErr);
            res.status(500).json({ error: insertErr.message });
            return;
          }
          res.json({ 
            id: result.insertId,
            message: 'Booking created successfully'
          });
        }
      );
    }
  );
});

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ id: 1, username }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/admin/bookings', authenticateAdmin, async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM bookings ORDER BY start_date');
    
    const bookingsByRoom = results.reduce((acc, booking) => {
      if (!acc[booking.room]) {
        acc[booking.room] = [];
      }
      acc[booking.room].push(booking);
      return acc;
    }, {});

    res.json(bookingsByRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/bookings/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.promise().query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 