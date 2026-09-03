'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search, Leaf, Shuffle, Heart, BellRing, BookOpen, ArrowRight, Clock,
} from 'lucide-react';
import Layout from '@/components/Layout';
import config from '@/config';

const PLANT_JOKES = [
  "Why do potatoes make good detectives? They keep their eyes peeled. 🥔",
  "What do you call a stolen yam? A hot potato. 🍠",
  "Why did the gardener win an award? Because they were outstanding in their field. 🌾",
  "What did the big flower say to the little flower? Hey there, bud! 🌸",
  "How do trees access the internet? They log in. 🌲",
  "Why did the plant go to therapy? It had too many unresolved roots. 🌿",
  "What do you call a cheerful gardener? Someone with a great atti-tude! 🌻",
  "Why don't plants ever feel lonely? Because they always have their roots. 🌱",
  "What's a scarecrow's favourite fruit? Straw-berries. 🍓",
  "Why did the tomato turn red? Because it saw the salad dressing! 🍅",
  "What do you call a nervous tree? A shaking aspen. 🍂",
  "Why did the gardener plant light bulbs? To grow a power plant. 💡",
];

const DID_YOU_KNOW = [
  "Plants can communicate distress through airborne chemical signals.",
  "Bamboo is the fastest-growing plant on Earth — up to 91 cm in a single day.",
  "The corpse flower blooms once every 7–10 years and smells like rotting flesh.",
  "Some houseplants like pothos and snake plants can improve indoor air quality.",
  "A single tree can absorb around 21 kg of CO₂ per year.",
  "Lavender has been used for over 2,500 years for its calming properties.",
  "The monkey puzzle tree has remained virtually unchanged for 200 million years.",
  "Aloe vera gel is 99% water, yet it has powerful healing compounds.",
  "Plants grown in red light tend to grow faster than those in blue light.",
  "The oldest living tree is a bristlecone pine over 5,000 years old.",
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [joke, setJoke] = useState('');
  const [fact, setFact] = useState('');
  const [potdPlant, setPotdPlant] = useState(null);
  const [potdLoading, setPotdLoading] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef(null);

  // Pick a joke + fact on mount (changes on reload)
  useEffect(() => {
    setJoke(PLANT_JOKES[Math.floor(Math.random() * PLANT_JOKES.length)]);
    setFact(DID_YOU_KNOW[Math.floor(Math.random() * DID_YOU_KNOW.length)]);
  }, []);

  // Load search history
  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem('rootine-search-history') || '[]');
      setSearchHistory(h);
    } catch {}
  }, []);

  // Fetch Plant of the Day
  useEffect(() => {
    const fetchPotd = async () => {
      setPotdLoading(true);
      try {
        const res  = await fetch(`/api/plant-details?id=${config.PLANT_OF_DAY_ID}`);
        const data = await res.json();
        if (res.ok && !data.error) {
          setPotdPlant(data);
        }
      } catch {}
      finally { setPotdLoading(false); }
    };
    fetchPotd();
  }, []);

  // Close history on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const saveHistory = (q) => {
    const prev = JSON.parse(localStorage.getItem('rootine-search-history') || '[]');
    const updated = [q, ...prev.filter((x) => x !== q)].slice(0, 5);
    localStorage.setItem('rootine-search-history', JSON.stringify(updated));
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    saveHistory(q);
    router.push(`/search-results?q=${encodeURIComponent(q)}`);
  };

  const handleHistoryClick = (q) => {
    setSearchQuery(q);
    setShowHistory(false);
    saveHistory(q);
    router.push(`/search-results?q=${encodeURIComponent(q)}`);
  };

  const handleSurprise = () => {
    const id = Math.floor(Math.random() * 2999) + 1;
    router.push(`/plant-info/${id}`);
  };

  const potdImg =
    potdPlant?.default_image?.regular_url ||
    potdPlant?.default_image?.original_url ||
    '/images/plantplaceholder.png';

  const careLevel = potdPlant?.care_level || null;
  const watering  = potdPlant?.watering   || null;

  return (
    <Layout title="Rootine">
      <div className="home-hero">
        <h1 className="hero-title">Rootine 🌱</h1>
        <p className="hero-subtitle">Your personal plant care companion</p>

        {/* Plant joke */}
        {joke && (
          <div className="joke-card">
            <span className="joke-emoji">😄</span>
            {joke}
          </div>
        )}

        {/* Search bar */}
        <div ref={searchRef} style={{ position: 'relative', maxWidth: 600, margin: '0 auto 1.5rem' }}>
          <form onSubmit={handleSearch} className="search-bar-wrap">
            <span className="search-icon-pos"><Search size={18} /></span>
            <input
              className="input"
              type="text"
              placeholder="Search for a houseplant…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowHistory(searchHistory.length > 0)}
              autoComplete="off"
            />
            <button type="submit" className="search-submit" aria-label="Search">
              <ArrowRight size={18} />
            </button>
          </form>

          {showHistory && searchHistory.length > 0 && (
            <div className="search-history-dropdown">
              {searchHistory.map((h) => (
                <button key={h} className="history-item" onClick={() => handleHistoryClick(h)}>
                  <Clock size={13} />
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Did You Know ticker */}
        {fact && (
          <div className="ticker-wrap">
            <span className="ticker-label">💡 Did you know?</span>
            <span className="ticker-text">{fact}</span>
          </div>
        )}
      </div>

      {/* Plant of the Day card */}
      <div className="section">
        {potdLoading ? (
          <div className="skeleton" style={{ height: 320, maxWidth: 520, margin: '0 auto', borderRadius: 22 }} />
        ) : (
          <div className="potd-card" onClick={() => router.push(`/plant-info/${config.PLANT_OF_DAY_ID}`)}>
            <div className="potd-img-wrap">
              <img src={potdImg} alt={potdPlant?.common_name || 'Plant of the Day'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.src = '/images/plantplaceholder.png'; }}
              />
              <div className="potd-badge"><Leaf size={13} /> Plant of the Day</div>
            </div>
            <div className="potd-body">
              <h2>{potdPlant?.common_name || 'Discover today\'s plant'}</h2>
              {potdPlant?.scientific_name?.[0] && (
                <p className="potd-sci">{potdPlant.scientific_name[0]}</p>
              )}
              <div className="potd-chips">
                {careLevel && (
                  <span className={`badge ${careLevel.toLowerCase().includes('low') ? 'badge-green' : careLevel.toLowerCase().includes('medium') ? 'badge-yellow' : 'badge-orange'}`}>
                    {careLevel}
                  </span>
                )}
                {watering && (
                  <span className="badge badge-blue">💧 {watering}</span>
                )}
              </div>
              <div className="potd-cta">View details <ArrowRight size={15} /></div>
            </div>
          </div>
        )}
      </div>

      {/* Quick action tiles */}
      <div className="home-actions">
        <button className="action-tile" onClick={handleSurprise}>
          <Shuffle size={28} />
          <span>Surprise Me</span>
          <small>Discover a random plant</small>
        </button>
        <button className="action-tile" onClick={() => router.push('/favourites')}>
          <Heart size={28} />
          <span>My Favourites</span>
          <small>Plants you've saved</small>
        </button>
        <button className="action-tile" onClick={() => router.push('/reminders')}>
          <BellRing size={28} />
          <span>Reminders</span>
          <small>Watering schedule</small>
        </button>
        <button className="action-tile" onClick={() => router.push('/about')}>
          <BookOpen size={28} />
          <span>Learn More</span>
          <small>About Rootine</small>
        </button>
      </div>
    </Layout>
  );
}
