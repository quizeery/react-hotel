import React, { useState } from "react";

function BookingForm({ onBooking }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleStartDateChange = (value) => {
    const newStartDate = new Date(value);
    setStartDate(newStartDate);
    if (newStartDate > endDate) {
      setEndDate(newStartDate);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (endDate < startDate) {
      alert("End date cannot be earlier than start date");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      alert("Cannot book dates in the past");
      return;
    }

    onBooking(name, email, phone, startDate, endDate);
    setName("");
    setEmail("");
    setPhone("");
    setStartDate(new Date());
    setEndDate(new Date());
  };

  return (
    <div className="booking-form">
      <h2>Book a Room</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name: </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email: </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="phone">Phone: </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="start-date">Start Date: </label>
          <input
            type="date"
            id="start-date"
            value={startDate.toISOString().split('T')[0]}
            onChange={(e) => handleStartDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div>
          <label htmlFor="end-date">End Date: </label>
          <input
            type="date"
            id="end-date"
            value={endDate.toISOString().split('T')[0]}
            onChange={(e) => setEndDate(new Date(e.target.value))}
            min={startDate.toISOString().split('T')[0]}
            required
          />
        </div>
        <button type="submit">Confirm Booking</button>
      </form>
    </div>
  );
}

export default BookingForm;