import Navbar from './Navbar';
import Head from 'next/head';

export default function Layout({ children, title = 'Rootine', showBack = false }) {
  return (
    <>
      <Head>
        <title>{title === 'Rootine' ? 'Rootine 🌱' : `${title} – Rootine`}</title>
        <meta name="description" content="Your personal plant care companion" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="page-wrapper">
        <Navbar showBack={showBack} />
        <main className="main-content">{children}</main>
        <footer className="site-footer">
          <p>
            © 2026 Soumya P. <span className="footer-leaf">🌱</span> 
          </p>
        </footer>
      </div>
    </>
  );
}
