import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import config from '@/config';
import Head from 'next/head';

<Head>
  <title>Search Results - Rootine</title>
  <link rel="icon" href="/favicon.ico" />
</Head>

export default function SearchResults() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = router.query.q;
    if (query) {
      setSearchQuery(query);
      fetchResults(query);
    }
  }, [router.query.q]);

  const fetchResults = async (query) => {
  setLoading(true);
  try {
    const url = new URL('https://perenual.com/api/v2/species-list');
    url.searchParams.append('key', config.API_KEY);         // Your API key
    url.searchParams.append('q', query);                     // Search term
    url.searchParams.append('page', '1');                    // Pagination: first page
    url.searchParams.append('hardiness', '4-8');             // Hardiness filter (optional)

    const res = await fetch(url.toString());

    // if (!res.ok) {
    //   // API returned an error code (like 401, 429, 500)
    //   const errorData = await res.json();
    //   throw new Error(errorData.message || 'Failed to fetch data');
    // }

    const data = await res.json();

    if (data.message?.includes('Please Upgrade')) {
      // Handle API rate limit or upgrade message
      throw new Error(data.message);
    }

    setResults(data.data || []);
  } catch (err) {
    console.error('Error fetching plant data:', err);
    alert(err.message || 'Something went wrong while fetching results.');
    setResults([]);
  } finally {
    setLoading(false);
  }
};


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/search-results?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const toProperCase = (str) => {
    return str?.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  const handleSearchIconClick = (e) => {
    e.preventDefault();
    handleSearchSubmit(e);
  };

  return (
    <div>
      {/* Nav Bar */}
      <nav>
        <div className="nav-left">
          <button onClick={() => window.history.back()} className="nav-button">
            <img src="/images/back.png" alt="Back" className="nav-icon" />
            </button>
          <a href="/">
            <img src="/images/homebutton.png" alt="Home" className="nav-icon" />
          </a>
        </div>
        <div className="nav-right">
          <a href={`/plant-info/${config.PLANT_OF_DAY_ID}`}>
            <span className="nav-text">Plant of the day</span>
            <img src="/images/plant.png" alt="Plant of the day" className="nav-icon-only" />
          </a>
          <a href="/contact.html">
            <span className="nav-text">Contact us</span>
            <img src="/images/contact.png" alt="Contact" className="nav-icon-only" />
          </a>
          <a href="/about.html">
            <span className="nav-text">About us</span>
            <img src="/images/about.png" alt="About" className="nav-icon-only" />
          </a>
        </div>
      </nav>

      {/* Search Bar */}
      <form id="searchForm" className="search-container" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search for a houseplant"
          id="searchInput"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <img
          src="/images/search.png"
          alt="Search"
          className="search-icon"
          onClick={handleSearchIconClick}
          style={{ cursor: 'pointer' }}
        />
      </form>

      {/* Results Count */}
      <div className="results-count">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <p>{results.length} results for "{searchQuery}"</p>
        )}
      </div>

      {/* Search Results */}
      <div className="search-results">
        {results.map((plant) => {
          const properName = toProperCase(plant.common_name || 'Unknown');
          const imageSrc =
            plant.default_image?.thumbnail ||
            plant.default_image?.regular_url ||
            plant.default_image?.original_url ||
            '/images/plantplaceholder.png';

          return (
            <div
              key={plant.id}
              className="plant-result"
              onClick={() => router.push(`/plant-info/${plant.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={imageSrc}
                alt={properName}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/plantplaceholder.png';
                }}
              />
              <div className="plant-info">
                <h2>{properName}</h2>
                <p>{plant.scientific_name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
