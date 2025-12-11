'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  name: string;
  email: string;
  company: string;
  role: string;
  interest: string;
  message: string;
}

const interestOptions = [
  { value: '', label: 'Select your interest...' },
  { value: 'demo', label: 'Request a Demo' },
  { value: 'pricing', label: 'Pricing Information' },
  { value: 'enterprise', label: 'Enterprise Solutions' },
  { value: 'partnership', label: 'Partnership Opportunities' },
  { value: 'support', label: 'Technical Support' },
  { value: 'other', label: 'Other' }
];

const roleOptions = [
  { value: '', label: 'Select your role...' },
  { value: 'producer', label: 'Producer / Executive Producer' },
  { value: 'director', label: 'Director' },
  { value: 'pm', label: 'Production Manager / Coordinator' },
  { value: 'post', label: 'Post-Production Supervisor' },
  { value: 'creative', label: 'Creative Director' },
  { value: 'operations', label: 'Operations / Finance' },
  { value: 'executive', label: 'Executive / C-Suite' },
  { value: 'other', label: 'Other' }
];

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    role: '',
    interest: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = {
    width: '100%',
    padding: '0.875rem 1rem',
    backgroundColor: 'var(--bg-1)',
    border: '1px solid var(--border-primary)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  const labelStyles = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
    fontSize: '0.95rem'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-1)',
      color: 'var(--text-primary)'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border-primary)',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg-1)',
        zIndex: 100
      }}>
        <div
          onClick={() => router.push('/')}
          style={{
            fontWeight: 700,
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.75rem' }}>🎬</span>
          SyncOps
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={() => router.push('/features')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            Features
          </button>
          <button
            onClick={() => router.push('/pricing')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            Pricing
          </button>
          <button
            onClick={() => router.push('/about')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            About
          </button>
          <button
            onClick={() => router.push('/contact')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Contact
          </button>
          <button
            onClick={() => router.push('/onboarding')}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Sign In
          </button>
        </div>
      </nav>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 80px)'
      }}>
        {/* Left Column - Info */}
        <div style={{
          padding: '4rem 3rem',
          backgroundColor: 'var(--bg-2)'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            lineHeight: 1.2
          }}>
            Let&apos;s Talk<br />
            <span style={{ color: 'var(--accent-primary)' }}>Production</span>
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            marginBottom: '3rem',
            lineHeight: 1.7
          }}>
            Whether you&apos;re managing a single project or scaling a production
            company, we&apos;d love to show you how SyncOps can help.
          </p>

          {/* Contact Methods */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📧
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Email</div>
                <div style={{ color: 'var(--text-secondary)' }}>hello@syncops.io</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📍
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Office</div>
                <div style={{ color: 'var(--text-secondary)' }}>Los Angeles, CA</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                🕐
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Response Time</div>
                <div style={{ color: 'var(--text-secondary)' }}>Within 24 hours</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div style={{
            backgroundColor: 'var(--bg-3)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Quick Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => router.push('/features')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  fontSize: '0.95rem'
                }}
              >
                → Explore Features
              </button>
              <button
                onClick={() => router.push('/pricing')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  fontSize: '0.95rem'
                }}
              >
                → View Pricing
              </button>
              <button
                onClick={() => window.open('https://docs.syncops.io', '_blank')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  fontSize: '0.95rem'
                }}
              >
                → Documentation
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div style={{ padding: '4rem 3rem' }}>
          {isSubmitted ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✅</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
                Message Received!
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                maxWidth: '400px'
              }}>
                Thanks for reaching out. Our team will get back to you within 24 hours
                to discuss how SyncOps can help your productions.
              </p>
              <button
                onClick={() => router.push('/')}
                style={{
                  padding: '0.875rem 1.5rem',
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back to Home
              </button>
            </div>
          ) : (
            <>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '0.5rem'
              }}>
                Send us a message
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '2rem'
              }}>
                Fill out the form and we&apos;ll be in touch shortly.
              </p>

              {error && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '8px',
                  color: '#dc2626',
                  marginBottom: '1.5rem'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyles}>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      style={inputStyles}
                    />
                  </div>
                  <div>
                    <label style={labelStyles}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@company.com"
                      style={inputStyles}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyles}>Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your company"
                      style={inputStyles}
                    />
                  </div>
                  <div>
                    <label style={labelStyles}>Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      style={{ ...inputStyles, cursor: 'pointer' }}
                    >
                      {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyles}>What are you interested in? *</label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyles, cursor: 'pointer' }}
                  >
                    {interestOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyles}>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us about your production needs..."
                    rows={5}
                    style={{ ...inputStyles, resize: 'vertical', minHeight: '120px' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: isSubmitting ? 'var(--bg-3)' : 'var(--accent-primary)',
                    color: isSubmitting ? 'var(--text-secondary)' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                <p style={{
                  marginTop: '1rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-tertiary)',
                  textAlign: 'center'
                }}>
                  By submitting, you agree to our Privacy Policy and Terms of Service.
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-primary)',
        color: 'var(--text-tertiary)',
        fontSize: '0.9rem'
      }}>
        © 2024 SyncOps. All rights reserved.
      </footer>
    </div>
  );
}
