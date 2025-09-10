import React from 'react';

const StatsTable = ({ stats, onEdit, onDelete }) => {
  if (!stats.length) {
    return <p>Aucune statistique à afficher pour le moment.</p>;
  }

  // Calculer les totaux
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
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>Date</th>
            <th>Appel</th>
            <th>Jira</th>
            <th>Mail</th>
            <th>Total</th>
            <th>Escaladé</th>
            <th>P1</th>
            <th>P2</th>
            <th>P3</th>
            <th>P4</th>
            <th>Traité</th>
            <th>En cours</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(stat => (
            <tr key={stat._id}>
              <td>{stat.date && !isNaN(new Date(stat.date).getTime()) ? new Date(stat.date).toISOString().slice(0, 10).split('-').reverse().join('/') : '-'}</td>
              <td>{stat.appel}</td>
              <td>{stat.jira}</td>
              <td>{stat.mail}</td>
              <td><strong>{stat.total}</strong></td>
              <td>{stat.escalade}</td>
              <td>{stat.p1}</td>
              <td>{stat.p2}</td>
              <td>{stat.p3}</td>
              <td>{stat.p4}</td>
              <td><strong>{stat.traite}</strong></td>
              <td><strong>{stat.en_cours}</strong></td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => onEdit(stat)}>Modifier</button>
                <button className="btn btn-sm btn-danger" onClick={() => onDelete(stat._id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="table-dark">
          <tr>
            <th>Total</th>
            <th>{totals.appel}</th>
            <th>{totals.jira}</th>
            <th>{totals.mail}</th>
            <th><strong>{totals.total}</strong></th>
            <th>{totals.escalade}</th>
            <th>{totals.p1}</th>
            <th>{totals.p2}</th>
            <th>{totals.p3}</th>
            <th>{totals.p4}</th>
            <th><strong>{totals.traite}</strong></th>
            <th><strong>{totals.en_cours}</strong></th>
            <th></th>{/* Cellule vide pour la colonne Actions */}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default StatsTable;
