'use client';

import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import {
  Heart, BellRing, Printer, Leaf, Droplets, Sun, AlertCircle,
  Lightbulb, Check, X,
} from 'lucide-react';
import Layout from '@/components/Layout';

/* ─── Helpers ──────────────────────────────────────────────── */
const formatWatering = (w) => {
  if (!w) return 'Not available';
  const wl = w.toLowerCase();
  if (wl.includes('frequent')) return 'Frequent — every 2 days';
  if (wl.includes('average'))  return 'Average — every 5 days';
  if (wl.includes('minimum'))  return 'Minimum — every 10 days';
  if (wl.includes('none'))     return 'None needed';
  return w;
};

const wateringIntervalDays = (w) => {
  if (!w) return 5;
  const wl = w.toLowerCase();
  if (wl.includes('frequent')) return 2;
  if (wl.includes('average'))  return 5;
  if (wl.includes('minimum'))  return 10;
  if (wl.includes('none'))     return 0;
  return 5;
};

const careBadgeCls = (c) => {
  if (!c) return 'badge-green';
  const cl = c.toLowerCase();
  if (cl.includes('low'))    return 'badge-green';
  if (cl.includes('medium')) return 'badge-yellow';
  if (cl.includes('high'))   return 'badge-orange';
  return 'badge-purple';
};

const CARE_TIPS = {
  low:     'This plant is very forgiving. Water sparingly, allow soil to dry between waterings, and keep away from frost. Perfect for beginners!',
  medium:  'Give this plant consistent moisture and moderate indirect light. Check soil weekly and fertilise lightly in spring and summer.',
  high:    'This plant needs close attention — maintain humidity, precise watering schedules, and bright indirect light. Inspect leaves regularly for pests.',
  default: 'Keep an eye on soil moisture and make sure it gets adequate light. Wipe leaves occasionally to remove dust and help photosynthesis.',
};

const getCareTip = (level) => {
  if (!level) return CARE_TIPS.default;
  const l = level.toLowerCase();
  if (l.includes('low'))    return CARE_TIPS.low;
  if (l.includes('medium')) return CARE_TIPS.medium;
  if (l.includes('high'))   return CARE_TIPS.high;
  return CARE_TIPS.default;
};

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type === 'error' ? 'error' : ''}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ─── Reminder Modal ─────────────────────────────────────────── */
function ReminderModal({ plant, intervalDays, onConfirm, onClose }) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + intervalDays);
    return d.toISOString().split('T')[0];
  });
  const [weeks, setWeeks] = useState(4);
  const count = intervalDays > 0 ? Math.floor((weeks * 7) / intervalDays) : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>💧 Set Watering Reminders</h2>
        <p>
          <strong>{plant.common_name}</strong> needs watering every{' '}
          <strong>{intervalDays} day{intervalDays !== 1 ? 's' : ''}</strong>. Choose how many
          weeks of reminders to create — they'll be saved to your Reminders page.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            First watering date
            <input
              type="date"
              className="input"
              style={{ marginTop: '0.35rem' }}
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Number of weeks
            <select
              className="input"
              style={{ marginTop: '0.35rem' }}
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
            >
              {[1, 2, 4, 8, 12].map((w) => (
                <option key={w} value={w}>{w} week{w > 1 ? 's' : ''}</option>
              ))}
            </select>
          </label>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          This will create <strong>{count}</strong> reminder{count !== 1 ? 's' : ''} saved locally on your device.
        </p>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            <X size={15} /> Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={count === 0}
            onClick={() => onConfirm(startDate, weeks)}
          >
            <Check size={15} /> Save {count} reminder{count !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function PlantInfoPage() {
  const router = useRouter();
  const { id: plantId } = router.query;

  const [plant, setPlant]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [isFav, setIsFav]         = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts]       = useState([]);
  const [similar, setSimilar]     = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  /* Fetch plant details via proxy route — API key stays server-side */
  useEffect(() => {
    if (!plantId) return;
    setLoading(true);
    setError(false);
    fetch(`/api/plant-details?id=${encodeURIComponent(plantId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPlant(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [plantId]);

  /* Check favourite status */
  useEffect(() => {
    if (!plantId) return;
    try {
      const favs = JSON.parse(localStorage.getItem('rootine-favourites') || '{}');
      setIsFav(!!favs[String(plantId)]);
    } catch {}
  }, [plantId]);

  /* Fetch similar plants via proxy route */
  useEffect(() => {
    if (!plant?.common_name) return;
    // Search by a keyword from the plant name to find related plants
    const keyword = plant.common_name.split(' ')[0];
    fetch(`/api/plant-search?q=${encodeURIComponent(keyword)}&page=1`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setSimilar(
            data.data
              .filter((p) => String(p.id) !== String(plantId))
              .slice(0, 6)
          );
        }
      })
      .catch(() => {});
  }, [plant, plantId]);

  /* Toggle favourite */
  const toggleFav = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('rootine-favourites') || '{}');
      const id   = String(plantId);
      if (favs[id]) {
        delete favs[id];
        setIsFav(false);
        addToast('Removed from favourites');
      } else {
        favs[id] = {
          id:              plant.id,
          common_name:     plant.common_name,
          scientific_name: plant.scientific_name,
          default_image:   plant.default_image,
          watering:        plant.watering,
          care_level:      plant.care_level,
        };
        setIsFav(true);
        addToast('Added to favourites 💚');
      }
      localStorage.setItem('rootine-favourites', JSON.stringify(favs));
    } catch {}
  };

  /* Save reminders to localStorage */
  const handleSaveReminders = (startDate, weeks) => {
    const interval = wateringIntervalDays(plant.watering);
    if (interval === 0) {
      addToast('This plant does not need regular watering!', 'error');
      setShowModal(false);
      return;
    }
    try {
      const existing = JSON.parse(localStorage.getItem('rootine-reminders') || '[]');
      const count    = Math.floor((weeks * 7) / interval);
      const newItems = [];
      for (let i = 0; i < count; i++) {
        const due = new Date(startDate);
        due.setDate(due.getDate() + interval * i);
        newItems.push({
          id:        `${plantId}-${due.toISOString()}`,
          plantId:   plant.id,
          plantName: plant.common_name,
          due:       due.toISOString(),
          interval,
          createdAt: new Date().toISOString(),
        });
      }
      const merged = [...existing.filter((r) => r.plantId !== plant.id), ...newItems];
      localStorage.setItem('rootine-reminders', JSON.stringify(merged));
      setShowModal(false);
      addToast(`✅ ${count} reminder${count !== 1 ? 's' : ''} saved! View them in Reminders.`);
    } catch {
      addToast('Could not save reminders.', 'error');
    }
  };

  const handlePrint = () => window.print();

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <Layout title="Loading…" showBack>
        <div className="plant-detail-layout">
          <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 22 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton" style={{ height: 40, width: '60%' }} />
            <div className="skeleton" style={{ height: 20, width: '40%' }} />
            <div className="skeleton" style={{ height: 120 }} />
            <div className="skeleton" style={{ height: 80 }} />
          </div>
        </div>
      </Layout>
    );
  }

  /* ── Error state ── */
  if (error || !plant) {
    return (
      <Layout title="Error" showBack>
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h2>Couldn't load plant details</h2>
          <p style={{ marginTop: '0.5rem' }}>
            This may be an API limit or network issue. Try again shortly.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '1.5rem' }}
            onClick={() => router.back()}
          >
            Go back
          </button>
        </div>
      </Layout>
    );
  }

  const imgUrl       = plant.default_image?.regular_url || plant.default_image?.original_url || '/images/plantplaceholder.png';
  const intervalDays = wateringIntervalDays(plant.watering);
  const careTip      = getCareTip(plant.care_level);
  const sunlight     = Array.isArray(plant.sunlight) ? plant.sunlight.join(', ') : plant.sunlight || 'Not available';

  return (
    <Layout title={plant.common_name || 'Plant Info'} showBack>
      <div className="plant-detail-layout">
        {/* Left column — image + actions */}
        <div className="plant-img-col">
          <img
            src={imgUrl}
            alt={plant.common_name}
            onError={(e) => { e.currentTarget.src = '/images/plantplaceholder.png'; }}
          />
          <div className="plant-actions">
            <button
              className={`btn ${isFav ? 'btn-primary' : 'btn-secondary'}`}
              onClick={toggleFav}
            >
              <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
              {isFav ? 'Saved' : 'Favourite'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() =>
                intervalDays > 0
                  ? setShowModal(true)
                  : addToast('This plant needs no regular watering!', 'error')
              }
            >
              <BellRing size={16} />
              Remind me
            </button>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        {/* Right column — details */}
        <div>
          <h1 className="plant-title">{plant.common_name}</h1>
          {plant.scientific_name?.[0] && (
            <p className="plant-sci">{plant.scientific_name[0]}</p>
          )}

          <div className="plant-chips">
            {plant.care_level && (
              <span className={`badge ${careBadgeCls(plant.care_level)}`}>
                {plant.care_level}
              </span>
            )}
            {plant.cycle && (
              <span className="badge badge-purple">🔄 {plant.cycle}</span>
            )}
            {plant.indoor !== undefined && (
              <span className="badge badge-blue">
                {plant.indoor ? '🏠 Indoor' : '🌳 Outdoor'}
              </span>
            )}
          </div>

          {/* Care grid */}
          <div className="care-grid">
            <div className="care-item">
              <span className="care-item-label">
                <Droplets size={12} style={{ display: 'inline', marginRight: 4 }} />
                Watering
              </span>
              <span className="care-item-value">{formatWatering(plant.watering)}</span>
            </div>
            <div className="care-item">
              <span className="care-item-label">
                <Sun size={12} style={{ display: 'inline', marginRight: 4 }} />
                Sunlight
              </span>
              <span className="care-item-value">{sunlight}</span>
            </div>
            <div className="care-item">
              <span className="care-item-label">
                <Leaf size={12} style={{ display: 'inline', marginRight: 4 }} />
                Care level
              </span>
              <span className="care-item-value">{plant.care_level || 'Not available'}</span>
            </div>
            {plant.maintenance && (
              <div className="care-item">
                <span className="care-item-label">Maintenance</span>
                <span className="care-item-value">{plant.maintenance}</span>
              </div>
            )}
          </div>

          {/* Care tip */}
          <div className="care-tip-box">
            <Lightbulb size={16} />
            <div>
              <strong>Care tip: </strong>{careTip}
            </div>
          </div>

          {/* Description */}
          {plant.description && (
            <div className="plant-description">{plant.description}</div>
          )}
        </div>
      </div>

      {/* Similar plants */}
      {similar.length > 0 && (
        <div className="section" style={{ marginTop: '2.5rem' }}>
          <h3 className="section-title">You might also like</h3>
          <div className="similar-grid">
            {similar.map((p) => {
              const img =
                p.default_image?.thumbnail ||
                p.default_image?.regular_url ||
                '/images/plantplaceholder.png';
              return (
                <div
                  key={p.id}
                  className="similar-card"
                  onClick={() => router.push(`/plant-info/${p.id}`)}
                >
                  <img
                    src={img}
                    alt={p.common_name}
                    onError={(e) => { e.currentTarget.src = '/images/plantplaceholder.png'; }}
                  />
                  <div className="similar-card-body">
                    <p>{p.common_name || 'Unknown'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reminder modal */}
      {showModal && (
        <ReminderModal
          plant={plant}
          intervalDays={intervalDays}
          onConfirm={handleSaveReminders}
          onClose={() => setShowModal(false)}
        />
      )}

      <Toast toasts={toasts} />
    </Layout>
  );
}
