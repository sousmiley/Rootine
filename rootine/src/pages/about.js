'use client';

import { Leaf, Search, BellRing, Heart, Shuffle, LayoutGrid, Moon, Info } from 'lucide-react';
import Layout from '@/components/Layout';

const FEATURES = [
  { icon: <Search size={18} />, title: 'Plant Search', desc: 'Search thousands of houseplants by name and browse detailed care information.' },
  { icon: <Leaf size={18} />,   title: 'Plant of the Day', desc: 'Discover a new plant every day with full care details and photos.' },
  { icon: <BellRing size={18} />, title: 'Watering Reminders', desc: 'Set localised watering reminders saved on your device.' },
  { icon: <Heart size={18} />,  title: 'Favourites', desc: 'Save plants you love and revisit their care info anytime.' },
  { icon: <Shuffle size={18} />, title: 'Surprise Me', desc: 'Feeling adventurous? Discover a completely random plant instantly.' },
  { icon: <LayoutGrid size={18} />, title: 'Grid & List Views', desc: 'Toggle between a compact list and a visual card grid on search results.' },
  { icon: <Moon size={18} />,   title: 'Dark Mode', desc: 'Easy on the eyes, flip to dark mode any time with the toggle in the nav.' },
];

export default function AboutPage() {
  return (
    <Layout title="About" showBack>
      <div className="page-hero">
        <h1>About Rootine</h1>
        <p>Making plant care easier for everyone, from curious beginners to seasoned growers.</p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <h3><Leaf size={18} /> Welcome to Rootine 🌱</h3>
          <p>
            Rootine is a growing initiative focused on making gardening knowledge and tools easily
            accessible. Its aim is to encourage people to get their hands dirty and grow with
            confidence :{')'}
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Whether you're a first-time plant parent or an experienced gardener, keeping track of
            plant care can be tricky. Rootine helps you stay on top of it, without the fuss.
          </p>
        </div>

        <div className="about-card">
          <h3><Info size={18} /> Background 🌿</h3>
          <p>
            Rootine began as a small group project created by four students passionate about making
            gardening more accessible. Since then, it's grown into something more, now led
            independently, inspired by a passion for learning, community, and real-world gardening
            practice.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Data from {' '}
            <a href="https://perenual.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Perenual Plant API
            </a>
            , a comprehensive plant database.
          </p>
        </div>
      </div>

      <div className="section">
        <h2 style={{ marginBottom: '1rem' }}>What you can do 🪴</h2>
        <div className="about-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="about-card">
              <h3>{f.icon} {f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about-card" style={{ marginBottom: '2rem' }}>
        <h3>🌳 Happy growing!</h3>
        <p>
          I hope Rootine makes plant care a little easier and more enjoyable. If you have feedback,
          suggestions, or just want to say hello, the Contact page is always open.
        </p>
      </div>
    </Layout>
  );
}
