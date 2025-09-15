import React, { useState, useMemo } from 'react';

const StatsTable = ({ stats, onEdit, onDelete, title }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

    const sortedStats = useMemo(() => {
        let sortableStats = [...stats];
        if (sortConfig !== null) {
            sortableStats.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableStats;
    }, [stats, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirectionSymbol = (key) => {
        if (sortConfig.key !== key) {
            return null;
        }
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

  if (!stats.length) {
    return <p className="text-muted text-center py-5 fs-5">Aucune statistique à afficher pour le moment.</p>;
  }

  const totals = stats.reduce((acc, stat) => {
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
    acc.en_cours += stat.en_cours || 0;
    return acc;
  }, {
    appel: 0, jira: 0, mail: 0, total: 0, escalade: 0, p1: 0, p2: 0, p3: 0, p4: 0, traite: 0, en_cours: 0
  });

  return (

        <div className="container-fluid p-0">
      {/* Ligne des totaux */}
      <div className="d-flex justify-content-around mb-4 p-2 bg-light rounded shadow-sm" style={{ fontSize: '0.90rem' }}>
        <div className="text-start"><strong>Résultat pour </strong><span className="text-danger"><strong>{stats.length} </strong></span><span><strong>jours</strong></span></div>
        <div className="text-center"><strong>Appel :</strong> <span className="text-primary"><strong>{totals.appel}</strong></span></div>
        <div className="text-center"><strong>Jira :</strong> <span className="text-primary"><strong>{totals.jira}</strong></span></div>
        <div className="text-center"><strong>Mail :</strong> <span className="text-primary"><strong>{totals.mail}</strong></span></div>
        <div className="text-center"><strong>Total global :</strong> <span className="text-success"><strong>{totals.total}</strong></span></div>
        <div className="text-center"><strong>Escaladé :</strong> <span className="text-success"><strong>{totals.escalade}</strong></span></div>
        <div className="text-center"><strong>P1 :</strong> <span className="text-danger"><strong>{totals.p1}</strong></span></div>
        <div className="text-center"><strong>P2 :</strong> <span className="text-primary "><strong>{totals.p2}</strong></span></div>
        <div className="text-center"><strong>P3 :</strong> <span className="text-primary "><strong>{totals.p3}</strong></span></div>
        <div className="text-center"><strong>P4 :</strong> <span className="text-primary "><strong>{totals.p4}</strong></span></div>
        <div className="text-center"><strong>Tickets traités:</strong> <span className="text-success"><strong>{totals.traite}</strong></span></div>
      </div>

      {/* Détails par jour */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <caption style={{ captionSide: 'top', textAlign: 'start', fontSize: '1.25rem', color: '#19eb12ff' }}><strong>{title}</strong></caption>
          <thead className="table-danger">
            <tr>
              <th scope="col" onClick={() => requestSort('date')} style={{cursor: 'pointer'}}>Date{getSortDirectionSymbol('date')}</th>
              <th scope="col" className="text-center" onClick={() => requestSort('appel')} style={{cursor: 'pointer'}}><i className="bi bi-telephone"></i> Appel{getSortDirectionSymbol('appel')}</th>
              <th scope="col" className="text-center" onClick={() => requestSort('jira')} style={{cursor: 'pointer'}}><i className="bi bi-ticket-fill"></i> Jira{getSortDirectionSymbol('jira')}</th>
              <th scope="col" className="text-center" onClick={() => requestSort('mail')} style={{cursor: 'pointer'}}><i className="bi bi-envelope-fill"></i> Mail{getSortDirectionSymbol('mail')}</th>
              <th scope="col" className="text-center" onClick={() => requestSort('total')} style={{cursor: 'pointer'}}>Total{getSortDirectionSymbol('total')}</th>
              <th scope="col" className="text-center" onClick={() => requestSort('escalade')} style={{cursor: 'pointer'}}><i className="bi bi-arrow-up-right-square-fill"></i> Escaladé{getSortDirectionSymbol('escalade')}</th>
              <th scope="col" className="text-center" onClick={() => requestSort('p1')} style={{cursor: 'pointer'}}>P1{getSortDirectionSymbol('p1')}</th>
              <th scope="col" className="text-center" onClick={() => requestSort('p2')} style={{cursor: 'pointer'}}>P2{getSortDirectionSymbol('p2')}</th>
              <th scope="col" className="text-center" onClick={() => requestSort('p3')} style={{cursor: 'pointer'}}>P3{getSortDirectionSymbol('p3')}</th>
              <th scope="col" className="text-center" onClick={() => requestSort('p4')} style={{cursor: 'pointer'}}>P4{getSortDirectionSymbol('p4')}</th>
              <th scope="col" className="text-center" onClick={() => requestSort('traite')} style={{cursor: 'pointer'}}>Traité{getSortDirectionSymbol('traite')}</th>
              <th scope="col" className="text-center" onClick={() => requestSort('en_cours')} style={{cursor: 'pointer'}}>En cours{getSortDirectionSymbol('en_cours')}</th>
              <th scope="col" className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map(stat => (
              <tr key={stat._id} className="border-bottom">
                <td className="fw-bold">{stat.date && !isNaN(new Date(stat.date).getTime()) ? new Date(stat.date).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '-'}</td>
                <td className="text-center">{stat.appel}</td>
                <td className="text-center">{stat.jira}</td>
                <td className="text-center">{stat.mail}</td>
                <td className="text-center fw-bold text-primary">{stat.total}</td>
                <td className="text-center">{stat.escalade}</td>
                <td className="text-center text-danger">{stat.p1}</td>
                <td className="text-center">{stat.p2}</td>
                <td className="text-center">{stat.p3}</td>
                <td className="text-center">{stat.p4}</td>
                <td className="text-center fw-bold text-success">{stat.traite}</td>
                <td className="text-center fw-bold text-primary">{stat.en_cours}</td>
                <td className="text-center">
                <div className="d-flex justify-content-center">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(stat)}>Modifier</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(stat._id)}>Supprimer</button>
                </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsTable;
