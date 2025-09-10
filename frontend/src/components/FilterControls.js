import React, { useState, useEffect } from 'react';

const FilterControls = ({ onFilter, initialDateRange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (initialDateRange) {
        setStartDate(initialDateRange.startDate);
        setEndDate(initialDateRange.endDate);
    }
  }, [initialDateRange]);

  // Appliquer le filtre automatiquement quand les dates changent
  useEffect(() => {
    if (startDate && endDate) {
      onFilter({ startDate, endDate });
    }
    // Si les champs sont vidés, on ne fait rien ici, le bouton "Tout voir" s'en charge
  }, [startDate, endDate, onFilter]);

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    onFilter({}); // Pass empty object to fetch all
  };

  const handleCurrentWeekClick = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const start = monday.toISOString().split('T')[0];
    const end = sunday.toISOString().split('T')[0];

    setStartDate(start);
    setEndDate(end);
  };

  const handleLastWeekClick = () => {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const dayOfWeek = lastWeek.getDay();
    const diff = lastWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(lastWeek.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const start = monday.toISOString().split('T')[0];
    const end = sunday.toISOString().split('T')[0];

    setStartDate(start);
    setEndDate(end);
  };

  const handleYesterdayClick = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toISOString().split('T')[0];

    setStartDate(formattedDate);
    setEndDate(formattedDate);
  };

  return (
    <div className="card bg-light mb-4">
        <div className="card-body">
            <div className="row g-3 align-items-center">
                <div className="col-auto">
                    <label htmlFor="startDate" className="form-label">Date de début</label>
                    <input 
                        type="date" 
                        className="form-control" 
                        id="startDate" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>
                <div className="col-auto">
                    <label htmlFor="endDate" className="form-label">Date de fin</label>
                    <input 
                        type="date" 
                        className="form-control" 
                        id="endDate" 
                        value={endDate} 
                        onChange={e => setEndDate(e.target.value)}
                    />
                </div>
                 <div className="col-auto mt-auto">
                    <button type="button" className="btn btn-secondary" onClick={clearFilter}>Tout voir</button>
                </div>
                <div className="col-auto mt-auto">
                    <button type="button" className="btn btn-primary ms-2" onClick={handleCurrentWeekClick}>Semaine en cours</button>
                </div>
                <div className="col-auto mt-auto">
                    <button type="button" className="btn btn-info ms-2" onClick={handleLastWeekClick}>Semaine -1</button>
                </div>
                <div className="col-auto mt-auto">
                    <button type="button" className="btn btn-success ms-2" onClick={handleYesterdayClick}>Jour -1</button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default FilterControls;