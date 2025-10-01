'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import config from '@/config';
import Head from 'next/head';

<Head>
  <title>Contact Us - Rootine</title>
  <link rel="icon" href="/favicon.ico" />
</Head>

export default function ContactPage() {
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (data.ok) {
        form.reset();
        setShowPopup(true);
      } else {
        throw new Error(data.error || 'Form submission failed');
      }
    } catch (error) {
      console.error('Error details:', error);
      alert('Sorry, there was a problem submitting your form. Please try again.');
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    const closeOnClickOutside = (e) => {
      const popup = document.getElementById('successPopup');
      if (e.target === popup) {
        setShowPopup(false);
      }
    };

    window.addEventListener('click', closeOnClickOutside);
    return () => window.removeEventListener('click', closeOnClickOutside);
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
          <Link href={`/plant-info/${config.PLANT_OF_DAY_ID}`}>
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
        <h1>Contact us</h1>

        <form
          className="contact-form"
          id="contactForm"
          onSubmit={handleSubmit}
          action="https://formspree.io/f/movqkayn"
          method="POST"
        >
          <input
            type="email"
            name="email"
            id="emailInput"
            placeholder="Email address"
            required
          />
          <select name="category" id="categoryInput" required>
            <option value="">Select purpose</option>
            <option value="support">Technical Support</option>
            <option value="feedback">Feedback</option>
            <option value="other">Other</option>
          </select>
          <textarea
            name="message"
            id="messageInput"
            placeholder="Enter message"
            required
          ></textarea>
          <button type="submit">Submit</button>
        </form>

        {showPopup && (
          <div className="popup" id="successPopup">
            <div className="popup-content">
              <h2>Thank You!</h2>
              <p>Your message has been sent successfully.</p>
              <button onClick={closePopup}>Close</button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
