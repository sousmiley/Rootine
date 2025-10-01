'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import config from '@/config';
import Head from 'next/head';

<Head>
  <title>About Us - Rootine</title>
  <link rel="icon" href="/favicon.ico" />
</Head>

export default function AboutPage() {
  useEffect(() => {
    const links = document.querySelectorAll('.plant-of-day-link');
    links.forEach((link) => {
      link.href = `/plant-info?id=${config.PLANT_OF_DAY_ID}`;
    });
  }, []);

  return (
    <>
      <nav>
        <div className="nav-left">
          <button onClick={() => window.history.back()}>
            <Image
              src="/images/back.png"
              alt="Back"
              className="nav-icon"
              width={32}
              height={32}
            />
          </button>
          <Link href="/">
            <Image
              src="/images/homebutton.png"
              alt="Home"
              className="nav-icon"
              width={32}
              height={32}
            />
          </Link>
        </div>

        <div className="nav-right">
          <Link
            href={`/plant-info?id=${config.PLANT_OF_DAY_ID}`}
            className="plant-of-day-link"
          >
            <span className="nav-text">Plant of the day</span>
            <Image
              src="/images/plant.png"
              alt="Plant of the day"
              className="nav-icon-only"
              width={32}
              height={32}
            />
          </Link>

          <Link href="/contact">
            <span className="nav-text">Contact us</span>
            <Image
              src="/images/contact.png"
              alt="Contact"
              className="nav-icon-only"
              width={32}
              height={32}
            />
          </Link>

          <Link href="/about">
            <span className="nav-text">About us</span>
            <Image
              src="/images/about.png"
              alt="About"
              className="nav-icon-only"
              width={32}
              height={32}
            />
          </Link>
        </div>
      </nav>

      <main>
        <h1>About us</h1>
        <div className="about-container">
          <div className="about-text">
            <h2>Welcome to Rootine! 🌱</h2>
            <p>
              Rootine is a growing initiative, with a focus on making gardening
              knowledge and tools easily accessible. Its aim is to encourage
              people to get their hands dirty and grow with confidence.
            </p>
            <p>
              Why? Because everyone deserves a bit of nature in their living
              space! Whether you're a first-time plant parent or an experienced
              grower, keeping track of plant care can be tricky. Rootine can
              help...
            </p>

            <h2>Background 🌿</h2>
            <p>
              Rootine began as a small group project created by four students
              passionate about making gardening more accessible. Since then,
              it's grown into something more — now led independently, inspired
              by a passion for learning, community, and real-world gardening
              practice.
            </p>

            <h2>About this web app 🪴</h2>
            <p>Rootine uses Perenual Plant API for its database. You can:</p>
            <ul>
              <li>Search for houseplants</li>
              <li>Set up watering reminders in Google Tasks</li>
              <li>
                Discover and learn more about new plants everyday through the
                "Plant of the Day" feature
              </li>
            </ul>

            <p>
              I hope this app helps make plant care a little easier and more
              enjoyable for everyone.
            </p>

            <p className="end-note">Happy growing! 🌳</p>
          </div>
        </div>
      </main>
    </>
  );
}
