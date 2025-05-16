import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import "./Calendar.css";
import BookingForm from "./BookingForm";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";

function MainApp() {
  const [selectedRoom, setSelectedRoom] = useState("Room 1");
  const [rooms, setRooms] = useState({
    "Room 1": [],
    "Room 2": [],
    "Room 3": [],
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const roomsData = {
    "Room 1": {
      images: ["/room1.png"],
      polishDescription: "Przytulna sypialnia (28m²) urządzona w nowoczesnym stylu. Wyposażenie pokoju obejmuje: wygodne łóżko małżeńskie (160x200cm), wbudowaną szafę z lustrem, klimatyzację, smart TV 43\", oraz biurko do pracy. Łazienka (6m²) z prysznicem, suszarką do włosów i ogrzewaniem podłogowym. Z okna roztacza się widok na miasto. Idealna dla par lub pojedynczych gości."
    },
    "Room 2": {
      images: ["/room2.png"],
      polishDescription: "Luksusowy apartament typu studio (45m²) z panoramicznymi oknami. Przestrzeń dzienna połączona z w pełni wyposażoną kuchnią (lodówka, zmywarka, płyta indukcyjna, ekspres do kawy). Strefa wypoczynkowa z rozkładaną sofą, fotelami i TV 55\". Jadalnia z designerskim stołem dla 4 osób. Łazienka (8m²) z wanną i prysznicem. Doskonały dla rodzin lub osób ceniących przestrzeń."
    },
    "Room 3": {
      images: ["/room3.png"],
      polishDescription: "Nowoczesny pokój (35m²) w spokojnej tonacji szarości. Wyposażony w wygodną sofę narożną (rozkładaną do spania), fotel wypoczynkowy i stolik kawowy. Smart TV 50\", system audio Bluetooth. Aneks kuchenny z lodówką i mikrofalówką. Łazienka (7m²) z kabiną prysznicową i pralką. Duże okno z roletami zaciemniającymi. Idealny dla osób podróżujących służbowo lub par."
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedRoom]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${selectedRoom}`);
      const data = await response.json();
      setRooms(prevRooms => ({
        ...prevRooms,
        [selectedRoom]: data.map(booking => ({
          ...booking,
          startDate: new Date(booking.start_date),
          endDate: new Date(booking.end_date)
        }))
      }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBooking = async (name, email, phone, startDate, endDate) => {
    try {
      const isConflict = rooms[selectedRoom].some(booking => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        bookingStart.setHours(0, 0, 0, 0);
        bookingEnd.setHours(0, 0, 0, 0);
        newStart.setHours(0, 0, 0, 0);
        newEnd.setHours(0, 0, 0, 0);

        return (
          (newStart >= bookingStart && newStart <= bookingEnd) ||
          (newEnd >= bookingStart && newEnd <= bookingEnd) ||
          (newStart <= bookingStart && newEnd >= bookingEnd)
        );
      });

      if (isConflict) {
        throw new Error('These dates are already booked. Please select different dates.');
      }

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          room: selectedRoom
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      fetchBookings(); 
      setIsFormVisible(false);
      alert('Booking created successfully!');
    } catch (error) {
      console.error('Booking error:', error);
      alert('Error creating booking: ' + error.message);
    }
  };

  const handleRoomChange = (room) => {
    setSelectedRoom(room);
  };

  const toggleFormVisibility = () => {
    setIsFormVisible((prevVisible) => !prevVisible);
  };

  const getTileClassName = ({ date, view }) => {
    if (view === "month") {
      const bookings = rooms[selectedRoom];
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);

      for (let booking of bookings) {
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (dateObj >= startDate && dateObj <= endDate) {
          return 'booked';
        }
      }
    }
    return null;
  };

  const getTileContent = ({ date, view }) => {
    if (view === "month") {
      const bookings = rooms[selectedRoom];
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);

      for (let booking of bookings) {
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (dateObj >= startDate && dateObj <= endDate) {
          return <div className="booked-by">Booked</div>;
        }
      }
    }
    return null;
  };

  return (
    <div className="App">
      <header className="main-header">
        <div className="header-content">
          <h1>
            <FontAwesomeIcon icon={faCalendarCheck} className="header-icon" />
            <span className="header-title">Hotel Booking Calendar</span>
          </h1>
          <p className="header-subtitle">Find and book your perfect room</p>
        </div>
      </header>
      <div className="calendar-container">
        <Calendar 
          tileClassName={getTileClassName}
          tileContent={getTileContent}
          locale="en"
        />
      </div>

      <div className="room-info-section">
        <div className="room-buttons">
          {Object.keys(rooms).map((room) => (
            <button
              key={room}
              onClick={() => handleRoomChange(room)}
              className={`room-button ${selectedRoom === room ? "selected" : ""}`}
              style={{
                backgroundImage: `url(${roomsData[room].images[0]})`
              }}
            >
              <div className="room-button-overlay"></div>
              <span className="room-button-text">{room}</span>
            </button>
          ))}
        </div>
        <div className="room-details">
          <div className="room-images">
            {roomsData[selectedRoom].images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${selectedRoom} view ${index + 1}`}
                className="room-image"
              />
            ))}
          </div>
          <p className="room-description">{roomsData[selectedRoom].description}</p>
          <p className="room-description polish">{roomsData[selectedRoom].polishDescription}</p>
          {!isFormVisible && (
            <button onClick={toggleFormVisibility} className="booking-button">
              <span>Book Now</span>
              <FontAwesomeIcon icon={faCalendarCheck} className="booking-icon" />
            </button>
          )}
        </div>
      </div>

      {isFormVisible && (
        <div className="modal-overlay" onClick={toggleFormVisibility}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={toggleFormVisibility}>
              ×
            </button>
            <h2>Book {selectedRoom}</h2>
            <BookingForm
              selectedRoom={selectedRoom}
              onBooking={handleBooking}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  const handleLogin = (success) => {
    setIsAdmin(success);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
  };

  return (
    <Router>
      <div className="app-container">
        <nav className="admin-nav">
          <Link to="/">Home</Link>
          {!isAdmin ? (
            <Link to="/admin">Admin Login</Link>
          ) : (
            <>
              <Link to="/admin/panel">Admin Panel</Link>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          )}
        </nav>

        <div className="content-container">
          <Routes>
            <Route path="/" element={<MainApp />} />
            <Route 
              path="/admin" 
              element={
                !isAdmin ? (
                  <AdminLogin onLogin={handleLogin} />
                ) : (
                  <Navigate to="/admin/panel" replace />
                )
              } 
            />
            <Route 
              path="/admin/panel" 
              element={
                isAdmin ? (
                  <AdminPanel />
                ) : (
                  <Navigate to="/admin" replace />
                )
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;