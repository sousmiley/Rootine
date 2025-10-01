'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import config from '@/config';

<Head>
  <title>Plant Information - Rootine</title>
  <link rel="icon" href="/favicon.ico" />
</Head>

export default function PlantInfoPage() {
  const router = useRouter();
  const { id: plantId } = router.query;

  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);

  const [googleReady, setGoogleReady] = useState({ gapiInited: false, gisInited: false });
  const [tokenClient, setTokenClient] = useState(null);

  // Initialize Google APIs once
  useEffect(() => {
    const loadGapi = () => {
      if (typeof gapi !== 'undefined') {
        gapi.load('client', async () => {
          try {
            await gapi.client.init({
              apiKey: config.GOOGLE_API_KEY,
              discoveryDocs: [config.GOOGLE_DISCOVERY_DOC],
            });
            setGoogleReady((prev) => ({ ...prev, gapiInited: true }));
          } catch (err) {
            console.error('GAPI init error:', err);
          }
        });
      }
    };

    const initTokenClient = () => {
      if (typeof google !== 'undefined') {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: config.GOOGLE_CLIENT_ID,
          scope: config.GOOGLE_SCOPES,
          prompt: 'consent',
          callback: () => {}
        });
        setTokenClient(client);
        setGoogleReady((prev) => ({ ...prev, gisInited: true }));
      }
    };

    loadGapi();
    initTokenClient();
  }, []);

  // Fetch plant details
  useEffect(() => {
    if (!plantId) return;

    const fetchPlantDetails = async () => {
      setLoading(true);
      setErrorLoading(false);
      try {
        const res = await fetch(
          `https://perenual.com/api/v2/species/details/${plantId}?key=${config.API_KEY}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch plant data');
        }
        if (data.message && data.message.includes('Please Upgrade')) {
          throw new Error(data.message);
        }

        setPlantData(data);
      } catch (err) {
        console.error('Error fetching plant data:', err);
        setErrorLoading(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantDetails();
  }, [plantId]);

  const formatWateringFrequency = (watering) => {
    if (!watering) return 'Information not available';
    const wl = watering.toLowerCase();
    if (wl.includes('frequent')) return 'Frequent (Every 2 days)';
    if (wl.includes('average')) return 'Average (Every 5 days)';
    if (wl.includes('minimum')) return 'Minimum (Every 10 days)';
    if (wl.includes('none')) return 'None';
    return watering;
  };

  const determineWateringInterval = (watering) => {
    if (!watering) return 0;
    const wl = watering.toLowerCase();
    if (wl.includes('frequent')) return 2;
    if (wl.includes('average')) return 5;
    if (wl.includes('minimum')) return 10;
    if (wl.includes('none')) return 0;
    return 5;
  };

  const createWateringTask = async (plantName, intervalDays) => {
    try {
      const taskList = await gapi.client.tasks.tasklists.list({ maxResults: 1 });
      const taskListId = taskList.result.items[0].id;
      const waterings = Math.floor(30 / intervalDays);

      for (let i = 1; i <= waterings; i++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + intervalDays * i);
        const formatted = dueDate.toISOString();

        await gapi.client.tasks.tasks.insert({
          tasklist: taskListId,
          resource: {
            title: `Water ${plantName}`,
            due: formatted,
            notes: `Water your ${plantName} plant\nSchedule: Every ${intervalDays} days`
          }
        });
      }
      alert(`Added ${waterings} watering reminders to your Google Tasks for the next month!`);
    } catch (err) {
      console.error('Error creating tasks:', err);
      alert('Error adding tasks to Google Tasks. Please try again.');
    }
  };

  const addToTasks = async () => {
    if (!plantData) return;
    if (!tokenClient || !googleReady.gapiInited || !googleReady.gisInited) {
      alert('Please wait for Google API to initialize');
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        tokenClient.callback = (resp) => {
          if (resp.error) reject(resp);
          else resolve(resp);
        };
        tokenClient.requestAccessToken({
          prompt: '',
          hint: localStorage.getItem('google_user_hint')
        });
      });

      const interval = determineWateringInterval(plantData.watering);
      if (interval === 0) {
        alert('This plant does not need regular watering!');
        return;
      }

      await createWateringTask(plantData.common_name, interval);
    } catch (err) {
      console.error('Auth/access error:', err);
      // fallback with prompt consent
      try {
        await new Promise((resolve, reject) => {
          tokenClient.callback = (resp) => {
            if (resp.error) reject(resp);
            else resolve(resp);
          };
          tokenClient.requestAccessToken({ prompt: 'consent' });
        });

        const interval = determineWateringInterval(plantData.watering);
        await createWateringTask(plantData.common_name, interval);
      } catch (popupErr) {
        console.error('Popup auth error:', popupErr);
        alert('Error authenticating with Google. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Plant Info – Rootine</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main><p>Loading plant information...</p></main>
      </>
    );
  }

  if (errorLoading || !plantData) {
    return (
      <>
        <Head>
          <title>Error – Rootine</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
          <h2>Unable to load plant details</h2>
          <p>Something went wrong. Please try again later.</p>
        </main>
      </>
    );
  }

  const imgUrl =
    plantData.default_image?.regular_url ||
    plantData.default_image?.original_url ||
    '/images/plantplaceholder.png';

  return (
    <>
      <Head>
        <title>{plantData.common_name || 'Plant Info'} – Rootine</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="nav-bar">
        <div className="nav-left">
          <button onClick={() => router.back()} className="nav-button">
            <Image src="/images/back.png" alt="Back" width={32} height={32} />
          </button>
          <Link href="/" className="nav-button">
            <Image src="/images/homebutton.png" alt="Home" width={32} height={32} />
          </Link>
        </div>
        <div className="nav-right">
          <Link href={`/plant-info/${config.PLANT_OF_DAY_ID}`} className="nav-link">
            Plant of the day
          </Link>
          <Link href="/contact" className="nav-link">
            Contact us
          </Link>
          <Link href="/about" className="nav-link">
            About us
          </Link>
        </div>
      </nav>

      <main className="plant-detail">
        <div className="plant-details">
          <div className="plant-container">
            <div className="plant-image-section">
              <Image
                src={imgUrl}
                alt={plantData.common_name || 'Plant'}
                width={300}
                height={300}
                onError={(e) => {
                  e.currentTarget.src = '/images/plantplaceholder.png';
                }}
              />
              <button
                className="add-to-tasks"
                onClick={addToTasks}
                disabled={!googleReady.gapiInited || !googleReady.gisInited}
              >
                Add to my tasks
              </button>
            </div>

            <div className="plant-details-section">
              <h1 className="plant-name">{plantData.common_name}</h1>
              {plantData.scientific_name?.length > 0 && (
                <h2 className="scientific-name">{plantData.scientific_name[0]}</h2>
              )}

              <div className="care-info">
                <p className="care-detail">
                  <strong>Watering:</strong> {formatWateringFrequency(plantData.watering)}
                </p>
                <p className="care-detail">
                  <strong>Sunlight:</strong>{' '}
                  {Array.isArray(plantData.sunlight)
                    ? plantData.sunlight.join(', ')
                    : plantData.sunlight || 'Information not available'}
                </p>
                <p className="care-detail">
                  <strong>Care Level:</strong> {plantData.care_level || 'Information not available'}
                </p>
                <div className="description">
                  <p>
                    <strong>Description:</strong>{' '}
                    {plantData.description || 'No description available.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* <style jsx>{`
        .nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
        }
        .nav-left, .nav-right {
          display: flex;
          align-items: center;
        }
        .nav-button {
          background: none;
          border: none;
          margin-right: 1rem;
          cursor: pointer;
        }
        .nav-link {
          margin-left: 1rem;
          color: #333;
          text-decoration: none;
        }
        .plant-detail {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .plant-container {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          align-items: flex-start;
        }
        .plant-image-section {
          flex: 1 1 300px;
        }
        .add-to-tasks {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .add-to-tasks:disabled {
          cursor: not-allowed;
        }
        .plant-details-section {
          flex: 2 1 400px;
        }
        .plant-name {
          margin: 0;
          font-size: 2rem;
        }
        .scientific-name {
          margin: 0;
          font-size: 1.2rem;
          font-style: italic;
          color: #666;
        }
        .care-info {
          margin-top: 1.5rem;
        }
        .care-detail {
          margin-bottom: 0.8rem;
        }
        .description {
          margin-top: 1rem;
          font-style: italic;
          color: #555;
        }
      `}</style> */}
    </>
  );
}