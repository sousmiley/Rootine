'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Search, LayoutGrid, List, Heart, ArrowRight, Clock, SlidersHorizontal,
} from 'lucide-react';
import Layout from '@/components/Layout';

const CARE_FILTERS = [
  { value: '', label: 'All difficulties' },
  { value: 'Low', label: 'Easy (Low care)' },
  { value: 'Medium', label: 'Moderate' },
  { value: 'High', label: 'Expert (High care)' },
];

const wateringBadge = (w) => {
  if (!w) return null;
  const wl = w.toLowerCase();
  if (wl.includes('frequent')) return { label: '💧 Frequent', cls: 'badge-blue' };
  if (wl.includes('average'))  return { label: '💧 Average',  cls: 'badge-green' };
  if (wl.includes('minimum'))  return { label: '💧 Minimum',  cls: 'badge-yellow' };
  return { label: `💧 ${w}`, cls: 'badge-green' };
};

const careBadge = (c) => {
  if (!c) return null;
  const cl = c.toLowerCase();
  if (cl.includes('low'))    return { label: '🟢 Easy',   cls: 'badge-green' };
  if (cl.includes('medium')) return { label: '🟡 Medium', cls: 'badge-yellow' };
  if (cl.includes('high'))   return { label: '🔴 Expert', cls: 'badge-orange' };
  return { label: c, cls: 'badge-purple' };
};

const toProperCase = (s) =>
  s?.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()) || '';

export default function SearchResults() {
  const router = useRouter();
  const [query, setQuery]         = useState('');
  const [inputVal, setInputVal]   = useState('');
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [viewMode, setViewMode]   = useState('list'); // 'list' | 'grid'
  const [careFilter, setCareFilter] = useState('');
  const [favourites, setFavourites] = useState({});
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef(null);

  // Load saved prefs
  useEffect(() => {
    try {
      const v = localStorage.getItem('rootine-view-mode');
      if (v === 'grid' || v === 'list') setViewMode(v);
      const favs = JSON.parse(localStorage.getItem('rootine-favourites') || '{}');
      setFavourites(favs);
      const h = JSON.parse(localStorage.getItem('rootine-search-history') || '[]');
      setHistory(h);
    } catch {}
  }, []);

  const saveHistory = (q) => {
    const prev = JSON.parse(localStorage.getItem('rootine-search-history') || '[]');
    const updated = [q, ...prev.filter((x) => x !== q)].slice(0, 5);
    localStorage.setItem('rootine-search-history', JSON.stringify(updated));
    setHistory(updated);
  };

  const fetchResults = useCallback(async (q) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/plant-search?q=${encodeURIComponent(q)}&page=1`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setResults(data.data || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = router.query.q;
    if (q) { setQuery(q); setInputVal(q); fetchResults(q); }
  }, [router.query.q, fetchResults]);

  // close history on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowHistory(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    const q = inputVal.trim();
    if (!q) return;
    saveHistory(q);
    router.push(`/search-results?q=${encodeURIComponent(q)}`);
    setShowHistory(false);
  };

  const handleHistoryClick = (h) => {
    setInputVal(h);
    setShowHistory(false);
    saveHistory(h);
    router.push(`/search-results?q=${encodeURIComponent(h)}`);
  };

  const toggleView = (v) => {
    setViewMode(v);
    localStorage.setItem('rootine-view-mode', v);
  };

  const toggleFav = (e, plant) => {
    e.stopPropagation();
    const id = String(plant.id);
    setFavourites((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = {
          id: plant.id,
          common_name: plant.common_name,
          scientific_name: plant.scientific_name,
          default_image: plant.default_image,
          watering: plant.watering,
          care_level: plant.care_level,
        };
      }
      localStorage.setItem('rootine-favourites', JSON.stringify(next));
      return next;
    });
  };

  const filtered = careFilter
    ? results.filter((p) => p.care_level?.toLowerCase().includes(careFilter.toLowerCase()))
    : results;

  const skeletonCount = 6;

  return (
    <Layout title="Search Results" showBack>
      {/* Search bar */}
      <div className="section">
        <div ref={searchRef} style={{ position: 'relative', maxWidth: 640, marginBottom: '1.5rem' }}>
          <form onSubmit={handleSearch} className="search-bar-wrap">
            <span className="search-icon-pos"><Search size={18} /></span>
            <input
              className="input"
              type="text"
              placeholder="Search for a houseplant…"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onFocus={() => setShowHistory(history.length > 0)}
              autoComplete="off"
            />
            <button type="submit" className="search-submit" aria-label="Search">
              <ArrowRight size={18} />
            </button>
          </form>
          {showHistory && history.length > 0 && (
            <div className="search-history-dropdown">
              {history.map((h) => (
                <button key={h} className="history-item" onClick={() => handleHistoryClick(h)}>
                  <Clock size={13} />{h}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="results-header">
          <p className="results-meta">
            {loading ? 'Searching…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`}
          </p>
          <div className="results-toolbar">
            <SlidersHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              className="filter-select"
              value={careFilter}
              onChange={(e) => setCareFilter(e.target.value)}
              aria-label="Filter by care difficulty"
            >
              {CARE_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <div className="view-toggle">
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => toggleView('list')} aria-label="List view">
                <List size={16} />
              </button>
              <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => toggleView('grid')} aria-label="Grid view">
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="results-grid">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 220 }} />
            ))}
          </div>
        ) : (
          <div className="results-list">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 90 }} />
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p>No plants found. Try a different search term or filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="results-grid">
          {filtered.map((plant) => {
            const name = toProperCase(plant.common_name || 'Unknown');
            const img  = plant.default_image?.thumbnail || plant.default_image?.regular_url || '/images/plantplaceholder.png';
            const wb   = wateringBadge(plant.watering);
            const cb   = careBadge(plant.care_level);
            const isFav = !!favourites[String(plant.id)];
            return (
              <div key={plant.id} className="plant-grid-card" onClick={() => router.push(`/plant-info/${plant.id}`)}>
                <div className="grid-img-wrap">
                  <img src={img} alt={name}
                    onError={(e) => { e.currentTarget.src = '/images/plantplaceholder.png'; }}
                  />
                  <button className={`grid-fav-btn ${isFav ? 'faved' : ''}`} onClick={(e) => toggleFav(e, plant)} aria-label="Toggle favourite">
                    <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="grid-card-body">
                  <h2>{name}</h2>
                  <p className="sci">{Array.isArray(plant.scientific_name) ? plant.scientific_name[0] : plant.scientific_name}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {wb && <span className={`badge ${wb.cls}`}>{wb.label}</span>}
                    {cb && <span className={`badge ${cb.cls}`}>{cb.label}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="results-list">
          {filtered.map((plant) => {
            const name = toProperCase(plant.common_name || 'Unknown');
            const img  = plant.default_image?.thumbnail || plant.default_image?.regular_url || '/images/plantplaceholder.png';
            const wb   = wateringBadge(plant.watering);
            const cb   = careBadge(plant.care_level);
            const isFav = !!favourites[String(plant.id)];
            return (
              <div key={plant.id} className="plant-row" onClick={() => router.push(`/plant-info/${plant.id}`)}>
                <img className="plant-row-img" src={img} alt={name}
                  onError={(e) => { e.currentTarget.src = '/images/plantplaceholder.png'; }}
                />
                <div className="plant-row-info">
                  <h2>{name}</h2>
                  <p className="sci">{Array.isArray(plant.scientific_name) ? plant.scientific_name[0] : plant.scientific_name}</p>
                  <div className="plant-row-chips">
                    {wb && <span className={`badge ${wb.cls}`}>{wb.label}</span>}
                    {cb && <span className={`badge ${cb.cls}`}>{cb.label}</span>}
                  </div>
                </div>
                <button className={`plant-row-fav ${isFav ? 'faved' : ''}`} onClick={(e) => toggleFav(e, plant)} aria-label="Toggle favourite">
                  <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
