'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import config from '@/config';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const form = document.getElementById('searchForm');
    const icon = document.querySelector('.search-icon');

    const handleSubmit = (e) => {
      e.preventDefault();
      const searchTerm = document.getElementById('searchInput').value.trim();
      if (searchTerm) {
        router.push(`/search-results?q=${encodeURIComponent(searchTerm)}`);
      }
    };

    if (form) form.addEventListener('submit', handleSubmit);
    if (icon) icon.addEventListener('click', handleSubmit);

    return () => {
      if (form) form.removeEventListener('submit', handleSubmit);
      if (icon) icon.removeEventListener('click', handleSubmit);
    };
  }, [router]);

  return (
    <main className="centered-content">
      <nav>
        <div className="nav-left">
          <button onClick={() => router.back()} className="nav-button">
            <Image src="/images/back.png" alt="Back" width={32} height={32} />
          </button>
          <Link href="/">
            <Image src="/images/homebutton.png" alt="Home" className="nav-icon" width={32} height={32} />
          </Link>
        </div>

        <div className="nav-right">
          <Link href={`/plant-info?id=${config.PLANT_OF_DAY_ID}`}>
            <span className="nav-text">Plant of the day</span>
            <Image src="/images/plant.png" alt="Plant of the day" className="nav-icon-only" width={32} height={32} />
          </Link>

          <Link href="/contact">
            <span className="nav-text">Contact us</span>
            <Image src="/images/contact.png" alt="Contact" className="nav-icon-only" width={32} height={32} />
          </Link>

          <Link href="/about">
            <span className="nav-text">About us</span>
            <Image src="/images/about.png" alt="About" className="nav-icon-only" width={32} height={32} />
          </Link>
        </div>
      </nav>

      <h1 className="home_wave_text">
        Rootine <span className="wave">🌱</span>
      </h1>

      <form id="searchForm" className="search-container">
        <input type="text" placeholder="Search for a houseplant" id="searchInput" />
        <Image src="/images/search.png" alt="Search" className="search-icon" width={24} height={24} />
      </form>

      <div
        className="plant-of-day-box"
        onClick={() => router.push(`/plant-info?id=${config.PLANT_OF_DAY_ID}`)}
      >
        <p>
          <Image src="/images/plantplaceholder.png" alt="Plant of the day" width={100} height={100} />
          Learn about the plant of the day!
        </p>
      </div>
    </main>
  );
}
