import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel() {
  const [bookings, setBookings] = useState({});
  const [selectedRoom, setSelectedRoom] = useState("Room 1");

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchAllBookings();
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div className="room-selector">
          <select 
            value={selectedRoom} 
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="admin-select"
          >
            <option value="Room 1">Room 1</option>
            <option value="Room 2">Room 2</option>
            <option value="Room 3">Room 3</option>
          </select>
        </div>
      </div>

      <div className="admin-bookings-list">
        <h2>All Bookings for {selectedRoom}</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings[selectedRoom]?.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.name}</td>
                  <td>{booking.email}</td>
                  <td>{booking.phone}</td>
                  <td>{new Date(booking.start_date).toLocaleDateString()}</td>
                  <td>{new Date(booking.end_date).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel; 