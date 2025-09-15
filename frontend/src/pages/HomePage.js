import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import FilterControls from '../components/FilterControls';

const API_N1_URL = 'http://10.128.14.109:5005/n1';
const API_N2_URL = 'http://10.128.14.109:5005/n2';
const API_EXPORT_URL = 'http://10.128.14.109:5005/export';

function HomePage() {
    const [n1Stats, setN1Stats] = useState([]);
    const [n2Stats, setN2Stats] = useState([]);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({});

    const fetchAllStats = useCallback(async (params = {}) => {
        try {
            const [n1Res, n2Res] = await Promise.all([
                axios.get(API_N1_URL, { params }),
                axios.get(API_N2_URL, { params })
            ]);
            setN1Stats(n1Res.data);
            setN2Stats(n2Res.data);
            setError(null);
        } catch (err) {
            setError("Erreur lors de la récupération des données.");
            console.error(err);
        }
    }, []);

    const handleFilter = useCallback((newDateRange) => {
        setDateRange(newDateRange);
        fetchAllStats(newDateRange);
    }, [fetchAllStats]);

    const handleExport = () => {
        const params = new URLSearchParams();
        if (dateRange.startDate && dateRange.endDate) {
            params.append('startDate', dateRange.startDate);
            params.append('endDate', dateRange.endDate);
        }
        window.location.href = `${API_EXPORT_URL}?${params.toString()}`;
    };

    useEffect(() => {
        fetchAllStats();
    }, [fetchAllStats]);

    const calculateTotals = (stats) => {
        return stats.reduce((acc, stat) => {
            acc.appel += stat.appel || 0;
            acc.jira += stat.jira || 0;
            acc.mail += stat.mail || 0;
            acc.total += stat.total || 0;
            acc.escalade += stat.escalade || 0;
            acc.p1 += stat.p1 || 0;
            acc.p2 += stat.p2 || 0;
            acc.p3 += stat.p3 || 0;
            acc.p4 += stat.p4 || 0;
            acc.traite += stat.traite || 0;
            return acc;
        }, { appel: 0, jira: 0, mail: 0, total: 0, escalade: 0, p1: 0, p2: 0, p3: 0, p4: 0, traite: 0 });
    };

    const combinedStats = [...n1Stats, ...n2Stats];
    const totals = calculateTotals(combinedStats);

    return (
        <div className="container">
        <div className='title'>
          <h1 className="text-center my-4">Statistique des tickets N1 et N2</h1>
        </div>
        <hr />
            <FilterControls onFilter={handleFilter} />

            <div className="d-flex gap-2 mb-3">
                <button className="btn btn-success" onClick={handleExport}>
                    <i className="bi bi-file-earmark-excel-fill"></i> Exporter en Excel
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row mb-4 text-center g-2">

                <div className="col">
                    <div className="card text-dark bg-secondary mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Appel</h5>
                            <p className="card-text fs-2 fw-bold">{totals.appel}</p>
                        </div>
                    </div>
                </div>
                {/* <div className="col-md-3"></div> */}
                <div className="col">
                    <div className="card text-dark bg-secondary mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Jira</h5>
                            <p className="card-text fs-2 fw-bold">{totals.jira}</p>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card text-dark bg-secondary mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Mail</h5>
                            <p className="card-text fs-2 fw-bold">{totals.mail}</p>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card text-white bg-primary mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Total</h5>
                            <p className="card-text fs-2 fw-bold">{totals.total}</p>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card text-white bg-success mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Escaladé</h5>
                            <p className="card-text fs-2 fw-bold">{totals.escalade}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mb-4 text-center g-2">
                <div className="col">
                    <div className="card text-white bg-danger mb-3">
                        <div className="card-body">
                            <h5 className="card-title">P1</h5>
                            <p className="card-text fs-2 fw-bold">{totals.p1}</p>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card text-dark bg-info mb-3">
                        <div className="card-body">
                            <h5 className="card-title">P2</h5>
                            <p className="card-text fs-2 fw-bold">{totals.p2}</p>
                        </div>
                    </div>
                </div>
                 <div className="col">
                    <div className="card text-dark bg-info mb-3">
                        <div className="card-body">
                            <h5 className="card-title">P3</h5>
                            <p className="card-text fs-2 fw-bold">{totals.p3}</p>
                        </div>
                    </div>
                </div>
                 <div className="col">
                    <div className="card text-dark bg-info mb-3">
                        <div className="card-body">
                            <h5 className="card-title">P4</h5>
                            <p className="card-text fs-2 fw-bold">{totals.p4}</p>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card text-white bg-success mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Traité</h5>
                            <p className="card-text fs-2 fw-bold">{totals.traite}</p>
                        </div>
                    </div>
                </div>
            </div>
{/* 
            <div className="text-center my-4">
                <Link to="/n1" className="btn btn-primary me-2">Aller à la Page N1</Link>
                <Link to="/n2" className="btn btn-secondary">Aller à la Page N2</Link>
            </div> */}
        </div>
    );
}

export default HomePage;
