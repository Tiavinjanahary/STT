import React, { useState, useEffect } from 'react';

const StatForm = ({ stat, onSave, onCancel }) => {
  const initialFormState = {
    date: '',
    appel: 0,
    jira: 0,
    mail: 0,
    escalade: 0,
    p1: 0,
    p2: 0,
    p3: 0,
    p4: 0,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [dateError, setDateError] = useState('');

  const validateDate = (dateString) => {
    setDateError('');
    return true;
  };

  useEffect(() => {
    if (stat) {
      setFormData({
        _id: stat._id,
        date: stat.date,
        appel: stat.appel || 0,
        jira: stat.jira || 0,
        mail: stat.mail || 0,
        escalade: stat.escalade || 0,
        p1: stat.p1 || 0,
        p2: stat.p2 || 0,
        p3: stat.p3 || 0,
        p4: stat.p4 || 0,
      });
      if(stat.date) {
          validateDate(stat.date);
      }
    } else {
      setFormData(initialFormState);
      setDateError('');
    }
  }, [stat]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date') {
      validateDate(value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateDate(formData.date)) {
      onSave(formData);
      setFormData(initialFormState);
    }
  };

  return (
    <div className="card bg-light mb-4">
      <div className="card-body">
        <h4 className="card-title">{formData._id ? 'Modifier' : 'Ajouter'} une statistique</h4>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-3 mb-3">
              <label htmlFor="date" className="form-label">Date</label>
              <input type="date" className="form-control" id="date" name="date" value={formData.date} onChange={handleChange} required />
              {dateError && <div className="text-danger small mt-1">{dateError}</div>}
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="appel" className="form-label">Appel</label>
              <input type="number" className="form-control" id="appel" name="appel" value={formData.appel} onChange={handleChange} />
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="jira" className="form-label">Jira</label>
              <input type="number" className="form-control" id="jira" name="jira" value={formData.jira} onChange={handleChange} />
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="mail" className="form-label">Mail</label>
              <input type="number" className="form-control" id="mail" name="mail" value={formData.mail} onChange={handleChange} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-3 mb-3">
              <label htmlFor="p1" className="form-label">P1</label>
              <input type="number" className="form-control" id="p1" name="p1" value={formData.p1} onChange={handleChange} />
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="p2" className="form-label">P2</label>
              <input type="number" className="form-control" id="p2" name="p2" value={formData.p2} onChange={handleChange} />
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="p3" className="form-label">P3</label>
              <input type="number" className="form-control" id="p3" name="p3" value={formData.p3} onChange={handleChange} />
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="p4" className="form-label">P4</label>
              <input type="number" className="form-control" id="p4" name="p4" value={formData.p4} onChange={handleChange} />
            </div>
          </div>
           <div className="row">
            <div className="col-md-3 mb-3">
              <label htmlFor="escalade" className="form-label">Escaladé</label>
              <input type="number" className="form-control" id="escalade" name="escalade" value={formData.escalade} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className="btn btn-success me-2" disabled={!!dateError}>{formData._id ? 'Mettre à jour' : 'Ajouter'}</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Annuler</button>
        </form>
      </div>
    </div>
  );
};

export default StatForm;