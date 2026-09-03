'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Heart, Trash2, Search } from 'lucide-react';
import Layout from '@/components/Layout';

const careBadgeCls = (c) => {
  if (!c) return 'badge-green';
  const cl = c.toLowerCase();
  if (cl.includes('low'))    return 'badge-green';
  if (cl.includes('medium')) return 'badge-yellow';
  if (cl.includes('high'))   return 'badge-orange';
  return 'badge-purple';
};

const wateringBadge = (w) => {
  if (!w) return null;
  const wl = w.toLowerCase();
  if (wl.includes('frequent')) return { label: '💧 Frequent', cls: 'badge-blue' };
  if (wl.includes('average'))  return { label: '💧 Average',  cls: 'badge-green' };
  if (wl.includes('minimum'))  return { label: '💧 Minimum',  cls: 'badge-yellow' };
  return { label: `💧 ${w}`, cls: 'badge-green' };
};

export default function FavouritesPage() {
  const router = useRouter();
  const [favs, setFavs] = useState({});
  const [filter, setFilter] = useState('');

  useEffect(() => {
    try {
      setFavs(JSON.parse(localStorage.getItem('rootine-favourites') || '{}'));
    } catch {}
  }, []);

  const removeFav = (id) => {
    setFavs((prev) => {
      const next = { ...prev };
      delete next[String(id)];
      localStorage.setItem('rootine-favourites', JSON.stringify(next));
      return next;
    });
  };

  const clearAll = () => {
    localStorage.setItem('rootine-favourites', '{}');
    setFavs({});
  };

  const plants = Object.values(favs);
  const filtered = filter
    ? plants.filter((p) =>
        p.common_name?.toLowerCase().includes(filter.toLowerCase()) ||
        (Array.isArray(p.scientific_name)
          ? p.scientific_name[0]
          : p.scientific_name
        )?.toLowerCase().includes(filter.toLowerCase())
      )
    : plants;

  return (
    <Layout title="My Favourites" showBack>
      <div className="page-hero">
        <h1>My Favourites</h1>
        <p>Plants you've saved for quick access.</p>
      </div>

      {plants.length === 0 ? (
        <div className="favourites-empty">
          <Heart size={56} />
          <h2 style={{ marginBottom: '0.5rem' }}>No favourites yet</h2>
          <p>Browse plants and tap the heart icon to save them here.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => router.push('/')}>
            Explore plants
          </button>
        </div>
      ) : (
        <>
          <div className="section-head">
            <div className="search-bar-wrap" style={{ maxWidth: 340 }}>
              <span className="search-icon-pos"><Search size={15} /></span>
              <input
                className="input"
                placeholder="Filter saved plants…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary" onClick={clearAll} style={{ fontSize: '0.82rem' }}>
              <Trash2 size={14} /> Clear all
            </button>
          </div>

          <p className="results-meta" style={{ marginBottom: '1rem' }}>
            {filtered.length} of {plants.length} saved plant{plants.length !== 1 ? 's' : ''}
          </p>

          <div className="results-list">
            {filtered.map((plant) => {
              const img = plant.default_image?.thumbnail || plant.default_image?.regular_url || '/images/plantplaceholder.png';
              const wb  = wateringBadge(plant.watering);
              return (
                <div key={plant.id} className="plant-row" onClick={() => router.push(`/plant-info/${plant.id}`)}>
                  <img
                    className="plant-row-img"
                    src={img}
                    alt={plant.common_name}
                    onError={(e) => { e.currentTarget.src = '/images/plantplaceholder.png'; }}
                  />
                  <div className="plant-row-info">
                    <h2>{plant.common_name || 'Unknown plant'}</h2>
                    <p className="sci">
                      {Array.isArray(plant.scientific_name) ? plant.scientific_name[0] : plant.scientific_name}
                    </p>
                    <div className="plant-row-chips">
                      {plant.care_level && (
                        <span className={`badge ${careBadgeCls(plant.care_level)}`}>{plant.care_level}</span>
                      )}
                      {wb && <span className={`badge ${wb.cls}`}>{wb.label}</span>}
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => { e.stopPropagation(); removeFav(plant.id); }}
                    aria-label="Remove from favourites"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Layout>
  );
}
