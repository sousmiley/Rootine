'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Check, X } from 'lucide-react';
import Layout from '@/components/Layout';

export default function ContactPage() {
  const [status, setStatus]   = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const form = e.target;
    try {
      const res  = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (data.ok) {
        form.reset();
        setStatus('success');
        setShowModal(true);
      } else {
        throw new Error(data.error || 'Submission failed');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <Layout title="Contact" showBack>
      <div className="page-hero">
        <h1>Contact Us</h1>
        <p>Have a question, suggestion, or just want to say hi? We'd love to hear from you •ᴗ•</p>
      </div>

      <div className="contact-layout">
        <div className="contact-info">
          <h2>Get in touch</h2>
          <p>
            Whether it's a bug report, a feature idea, or general feedback about your experience
            with Rootine, every message is read and appreciated.
          </p>
          <p>We typically respond within 2 - 3 business days.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
            <div className="care-item">
              <span className="care-item-label"><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />Email support</span>
              <span className="care-item-value" style={{ fontSize: '0.875rem' }}>Via the contact form</span>
            </div>
            <div className="care-item">
              <span className="care-item-label"><MessageSquare size={12} style={{ display: 'inline', marginRight: 4 }} />Response time</span>
              <span className="care-item-value" style={{ fontSize: '0.875rem' }}>2–3 business days</span>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="contact-form-card">
          <form
            action="https://formspree.io/f/mgaeyjjb"
            method="POST"
            onSubmit={handleSubmit}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Email address
              </label>
              <input
                className="input"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Purpose
              </label>
              <select className="input" name="category" required defaultValue="">
                <option value="" disabled>Select a category…</option>
                <option value="support">Technical Support</option>
                <option value="feedback">Feedback</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Message
              </label>
              <textarea
                className="input"
                name="message"
                placeholder="Tell us what's on your mind…"
                required
              />
            </div>

            {status === 'error' && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                Something went wrong. Please try again.
              </p>
            )}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={status === 'sending'}
              style={{ alignSelf: 'flex-start' }}
            >
              {status === 'sending' ? 'Sending…' : (
                <><Mail size={15} /> Send message</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
              <Check size={48} style={{ color: 'var(--accent)', marginBottom: '0.75rem' }} />
              <h2>Message sent!</h2>
              <p style={{ marginTop: '0.5rem' }}>Thanks for reaching out. We'll get back to you soon.</p>
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                <X size={15} /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
