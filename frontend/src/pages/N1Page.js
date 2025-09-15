import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import StatsTable from '../components/StatsTable';
import StatForm from '../components/StatForm';
import FilterControls from '../components/FilterControls';

const API_URL = 'http://10.128.14.109:5005/n1';

const getWeekDateRange = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        startDate: monday.toISOString().split('T')[0],
        endDate: sunday.toISOString().split('T')[0],
    };
};

function N1Page() {
  const [stats, setStats] = useState([]);
  const [selectedStat, setSelectedStat] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(getWeekDateRange());

  const fetchStats = useCallback(async (params = {}) => {
    try {
      // Si les dates sont passées, on s'assure qu'elles ne sont pas vides
      if (params.startDate === '' || params.endDate === '') {
          delete params.startDate;
          delete params.endDate;
      }
      const response = await axios.get(API_URL, { params });
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError("Erreur lors de la récupération des données. Assurez-vous que le serveur backend est bien démarré.");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // D'abord, on s'assure que la semaine est initialisée
        await axios.post(`${API_URL}/seed-week`);
        // Ensuite, on récupère les données pour la semaine en cours
        fetchStats(dateRange);
      } catch (err) {
        setError("Erreur lors de l'initialisation de l'application.");
        console.error(err);
      }
    };

    initializeApp();
  }, [fetchStats, dateRange]);

  const handleFilter = useCallback((newDateRange) => {
    setDateRange(newDateRange);
    fetchStats(newDateRange);
  }, [fetchStats]);

  const handleSave = useCallback(async (statData) => {
    const url = statData._id ? `${API_URL}/update/${statData._id}` : `${API_URL}/add`;
    try {
      const response = await axios.post(url, statData);
      console.log(response.data);
      fetchStats(dateRange); // Rafraîchir avec la plage de dates actuelle
      setIsFormVisible(false);
      setSelectedStat(null); 
    } catch (err) {
      const errorMessage = err.response ? err.response.data : err.message;
      alert(`Erreur lors de la sauvegarde: ${errorMessage}`);
    }
  }, [fetchStats, dateRange]);
  
  const handleEdit = (stat) => {
    const formattedStat = { ...stat, date: new Date(stat.date).toISOString().split('T')[0] };
    setSelectedStat(formattedStat);
    setIsFormVisible(true);
  };

  const handleDelete = useCallback(async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchStats(dateRange); // Rafraîchir avec la plage de dates actuelle
      } catch (err) {
        alert(`Erreur lors de la suppression: ${err.message}`);
      }
    }
  }, [fetchStats, dateRange]);

  const showAddForm = () => {
    setSelectedStat(null);
    setIsFormVisible(true);
  };

  const cancelForm = () => {
    setIsFormVisible(false);
    setSelectedStat(null);
  }

  const handleExport = () => {
    const params = new URLSearchParams();
    if (dateRange.startDate && dateRange.endDate) {
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
    }
    // La construction de l'URL et la redirection déclenchent le téléchargement
    window.location.href = `${API_URL}/export?${params.toString()}`;
  };

  return (
    <div className="container">
        <div className='title'>
          <h1 className="text-center my-4">Statistique des tickets N1</h1>
        </div>
      
      {error && <div className="alert alert-danger">{error}</div>}

      {isFormVisible && <StatForm stat={selectedStat} onSave={handleSave} onCancel={cancelForm} />}
      
      <hr />

      <FilterControls onFilter={handleFilter} initialDateRange={dateRange} />

      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-danger" onClick={showAddForm}>
          Ajouter une entrée
        </button>
        <button className="btn btn-success" onClick={handleExport}>
          <i className="bi bi-file-earmark-excel-fill"></i> Exporter en Excel
        </button>
      </div>
        
        <hr />

      <StatsTable stats={stats} onEdit={handleEdit} onDelete={handleDelete} title="Statistique des tickets N1" />

    </div>
  );
}

export default N1Page;
