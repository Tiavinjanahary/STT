import React from 'react';

const StatsTable = ({ stats, onEdit, onDelete }) => {
  if (!stats.length) {
    return <p className="text-muted text-center py-4">Aucune statistique à afficher pour le moment.</p>;
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
    <div className="table-responsive">
      <table className="table table-borderless table-hover">
        <thead className="border-bottom border-secondary">
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Appel</th>
            <th scope="col">Jira</th>
            <th scope="col">Mail</th>
            <th scope="col" className="text-end">Total</th>
            <th scope="col">Escaladé</th>
            <th scope="col">P1</th>
            <th scope="col">P2</th>
            <th scope="col">P3</th>
            <th scope="col">P4</th>
            <th scope="col" className="text-end">Traité</th>
            <th scope="col" className="text-end">En cours</th>
            <th scope="col" className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(stat => (
            <tr key={stat._id}>
              <td>{stat.date && !isNaN(new Date(stat.date).getTime()) ? new Date(stat.date).toISOString().slice(0, 10).split('-').reverse().join('/') : '-'}</td>
              <td>{stat.appel}</td>
              <td>{stat.jira}</td>
              <td>{stat.mail}</td>
              <td className="text-end fw-bold">{stat.total}</td>
              <td>{stat.escalade}</td>
              <td>{stat.p1}</td>
              <td>{stat.p2}</td>
              <td>{stat.p3}</td>
              <td>{stat.p4}</td>
              <td className="text-end fw-bold">{stat.traite}</td>
              <td className="text-end fw-bold">{stat.en_cours}</td>
              <td className="text-center">
                <div className="d-flex justify-content-center">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(stat)}>Modifier</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(stat._id)}>Supprimer</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="table-light border-top border-secondary">
          <tr>
            <th scope="row">Total</th>
            <td>{totals.appel}</td>
            <td>{totals.jira}</td>
            <td>{totals.mail}</td>
            <td className="text-end fw-bold">{totals.total}</td>
            <td>{totals.escalade}</td>
            <td>{totals.p1}</td>
            <td>{totals.p2}</td>
            <td>{totals.p3}</td>
            <td>{totals.p4}</td>
            <td className="text-end fw-bold">{totals.traite}</td>
            <td className="text-end fw-bold">{totals.en_cours}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default StatsTable;