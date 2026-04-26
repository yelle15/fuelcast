'use client';

import { useState, useEffect } from 'react';

function CalendarMonth({ year, month, today, selectedDate, onSelectDate, minDate, maxDate }) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isDateInRange = (date) => {
    const minDateObj = new Date(minDate);
    const maxDateObj = new Date(maxDate);
    return date >= minDateObj && date <= maxDateObj;
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 h-6">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="h-8" />;
          }

          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const inRange = isDateInRange(date);

          return (
            <button
              key={date.toDateString()}
              onClick={() => inRange && onSelectDate(date)}
              disabled={!inRange}
              className={`h-8 text-xs font-semibold rounded-md transition-colors ${
                isSelected
                  ? 'bg-blue-900 text-white'
                  : isToday
                  ? 'bg-gray-200 text-gray-900 border border-gray-400'
                  : inRange
                  ? 'text-gray-900 hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DatePickerModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
}) {
  const [horizon, setHorizon] = useState('');
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleHorizonChange = (days) => {
    if (!Number.isFinite(days)) return;
    setHorizon(days);
    const newDate = new Date(today);
    newDate.setDate(newDate.getDate() + days);
    onSelectDate(newDate);
    setDisplayMonth(newDate.getMonth());
    setDisplayYear(newDate.getFullYear());
  };

  const handlePrevMonth = () => {
    let newMonth = displayMonth - 1;
    let newYear = displayYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setDisplayMonth(newMonth);
    setDisplayYear(newYear);
  };

  const handleNextMonth = () => {
    let newMonth = displayMonth + 1;
    let newYear = displayYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setDisplayMonth(newMonth);
    setDisplayYear(newYear);
  };

  const toIsoDate = (date) => date.toISOString().split('T')[0];
  const formatDisplayDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (!isOpen) return null;

  const modalSelectedDate = selectedDate ? new Date(selectedDate) : null;
  if (modalSelectedDate) {
    modalSelectedDate.setHours(0, 0, 0, 0);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Prediction Date</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Horizon Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Prediction Horizon
          </label>
          <select
            value={horizon}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                setHorizon('');
                return;
              }
              handleHorizonChange(parseInt(value, 10));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" disabled>
              Select Prediction Horizon
            </option>
            <option value={7}>Next 7 days</option>
            <option value={14}>Next 14 days</option>
            <option value={30}>Next 30 days</option>
          </select>
        </div>

        {/* Display selected date */}
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-xs text-gray-600 mb-1">Selected Date:</p>
          <p className="text-sm font-semibold text-gray-900">
            {modalSelectedDate ? formatDisplayDate(modalSelectedDate) : 'Select Date'}
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-700"
          >
            ←
          </button>
          <h3 className="text-sm font-semibold text-gray-900">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][displayMonth]} {displayYear}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-700"
          >
            →
          </button>
        </div>

        {/* Calendar */}
        <CalendarMonth
          year={displayYear}
          month={displayMonth}
          today={today}
          selectedDate={modalSelectedDate}
          onSelectDate={(date) => onSelectDate(date)}
          minDate={minDate}
          maxDate={maxDate}
        />

        {/* Footer buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-semibold text-gray-900 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-900 rounded-md hover:bg-blue-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
