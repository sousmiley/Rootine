'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BellRing, Trash2, CheckCircle2, Clock, CalendarDays } from 'lucide-react';
import Layout from '@/components/Layout';

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const getDueLabel = (iso) => {
  const due   = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, overdue: true };
  if (diff === 0) return { label: 'Today', overdue: false };
  if (diff === 1) return { label: 'Tomorrow', overdue: false };
  return { label: `In ${diff} days`, overdue: false };
};

export default function RemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState([]);
  const [filter, setFilter]       = useState('upcoming'); // 'upcoming' | 'all' | 'overdue'
  const [donePlants, setDonePlants] = useState({});

  useEffect(() => {
    try {
      setReminders(JSON.parse(localStorage.getItem('rootine-reminders') || '[]'));
    } catch {}
  }, []);

  const deleteReminder = (id) => {
    setReminders((prev) => {
      const next = prev.filter((r) => r.id !== id);
      localStorage.setItem('rootine-reminders', JSON.stringify(next));
      return next;
    });
  };

  const deletePlant = (plantId) => {
    setReminders((prev) => {
      const next = prev.filter((r) => r.plantId !== plantId);
      localStorage.setItem('rootine-reminders', JSON.stringify(next));
      return next;
    });
  };

  const clearAll = () => {
    localStorage.setItem('rootine-reminders', '[]');
    setReminders([]);
  };

  const markDone = (plantId) => {
    setDonePlants((prev) => ({ ...prev, [plantId]: !prev[plantId] }));
  };

  const sorted = [...reminders].sort((a, b) => new Date(a.due) - new Date(b.due));

  const filtered = sorted.filter((r) => {
    const { overdue } = getDueLabel(r.due);
    if (filter === 'overdue')  return overdue;
    if (filter === 'upcoming') return !overdue;
    return true;
  });

  // Group by plant name
  const grouped = filtered.reduce((acc, r) => {
    const key = `${r.plantId}-${r.plantName}`;
    if (!acc[key]) acc[key] = { plantId: r.plantId, plantName: r.plantName, items: [] };
    acc[key].items.push(r);
    return acc;
  }, {});

  const overdueCount   = sorted.filter((r) => getDueLabel(r.due).overdue).length;
  const upcomingCount  = sorted.filter((r) => !getDueLabel(r.due).overdue).length;

  return (
    <Layout title="Reminders" showBack>
      <div className="page-hero">
        <h1>Watering Reminders</h1>
        <p>Your upcoming plant care schedule, saved on this device.</p>
      </div>

      {reminders.length === 0 ? (
        <div className="favourites-empty">
          <BellRing size={56} />
          <h2 style={{ marginBottom: '0.5rem' }}>No reminders yet</h2>
          <p>Open any plant's detail page and tap <strong>Remind me</strong> to set up a watering schedule.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => router.push('/')}>
            Find a plant
          </button>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div className="care-item" style={{ flex: '1', minWidth: 120 }}>
              <span className="care-item-label"><CalendarDays size={12} style={{ display: 'inline', marginRight: 4 }} />Total</span>
              <span className="care-item-value">{reminders.length} reminder{reminders.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="care-item" style={{ flex: '1', minWidth: 120 }}>
              <span className="care-item-label"><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />Upcoming</span>
              <span className="care-item-value">{upcomingCount}</span>
            </div>
            {overdueCount > 0 && (
              <div className="care-item" style={{ flex: '1', minWidth: 120, borderColor: '#fca5a5' }}>
                <span className="care-item-label" style={{ color: '#ef4444' }}>Overdue</span>
                <span className="care-item-value" style={{ color: '#ef4444' }}>{overdueCount}</span>
              </div>
            )}
          </div>

          {/* Filter + clear */}
          <div className="section-head" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['upcoming', 'overdue', 'all'].map((f) => (
                <button
                  key={f}
                  className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" onClick={clearAll} style={{ fontSize: '0.82rem' }}>
              <Trash2 size={14} /> Clear all
            </button>
          </div>

          {filtered.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No {filter} reminders.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {Object.values(grouped).map(({ plantId, plantName, items }) => (
                <div key={`${plantId}-${plantName}`} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => markDone(plantId)}
                        style={{ all: 'unset', cursor: 'pointer', color: donePlants[plantId] ? 'var(--accent)' : 'var(--text-light)', display: 'flex' }}
                        aria-label="Mark as done"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                      <h3
                        style={{
                          textDecoration: donePlants[plantId] ? 'line-through' : 'none',
                          color: donePlants[plantId] ? 'var(--text-muted)' : 'var(--text)',
                          cursor: 'pointer',
                          fontSize: '1rem',
                        }}
                        onClick={() => router.push(`/plant-info/${plantId}`)}
                      >
                        💧 {plantName}
                      </h3>
                      <span className="badge badge-blue">Every {items[0]?.interval}d</span>
                    </div>
                    <button className="delete-btn" onClick={() => deletePlant(plantId)} aria-label="Delete all reminders for this plant">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="reminders-list">
                    {items.slice(0, 5).map((r) => {
                      const { label, overdue } = getDueLabel(r.due);
                      return (
                        <div key={r.id} className="reminder-card">
                          <BellRing size={18} className="r-icon" />
                          <div className="reminder-info">
                            <h3>Water {r.plantName}</h3>
                            <p>{formatDate(r.due)}</p>
                          </div>
                          <span className={`reminder-due ${overdue ? 'overdue' : ''}`}>{label}</span>
                          <button className="delete-btn" onClick={() => deleteReminder(r.id)} aria-label="Delete reminder">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                    {items.length > 5 && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
                        +{items.length - 5} more reminder{items.length - 5 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
