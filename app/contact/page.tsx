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
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div onClick={() => router.push('/')} className="text-xl font-semibold tracking-tight text-gray-900 cursor-pointer">SyncOps</div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => router.push('/features')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</button>
            <button onClick={() => router.push('/pricing')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</button>
            <button onClick={() => router.push('/about')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</button>
            <button onClick={() => router.push('/contact')} className="text-sm text-gray-900 font-medium">Contact</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/signin')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Sign In</button>
            <button onClick={() => router.push('/onboarding')} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">Sign Up Free</button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          {/* Left Column - Info */}
          <div className="pt-8">
            <h1 className="text-4xl font-semibold text-gray-900 mb-4">
              Let&apos;s Talk<br />
              <span className="text-gray-400">Production</span>
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Whether you&apos;re managing a single project or scaling a production company, we&apos;d love to show you how SyncOps can help.
            </p>

            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl">📧</div>
                <div>
                  <div className="font-medium text-gray-900">Email</div>
                  <div className="text-gray-600">hello@syncops.io</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl">📍</div>
                <div>
                  <div className="font-medium text-gray-900">Office</div>
                  <div className="text-gray-600">Los Angeles, CA</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl">🕐</div>
                <div>
                  <div className="font-medium text-gray-900">Response Time</div>
                  <div className="text-gray-600">Within 24 hours</div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-medium text-gray-900 mb-3">Quick Links</h3>
              <div className="space-y-2">
                <button onClick={() => router.push('/features')} className="block text-gray-900 hover:text-gray-600 text-sm">→ Explore Features</button>
                <button onClick={() => router.push('/pricing')} className="block text-gray-900 hover:text-gray-600 text-sm">→ View Pricing</button>
                <button onClick={() => window.open('https://docs.syncops.io', '_blank')} className="block text-gray-900 hover:text-gray-600 text-sm">→ Documentation</button>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-gray-50 rounded-2xl p-8">
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Message Received!</h2>
                <p className="text-gray-600 mb-6 max-w-sm">
                  Thanks for reaching out. Our team will get back to you within 24 hours to discuss how SyncOps can help your productions.
                </p>
                <button onClick={() => router.push('/')} className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  Back to Home
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Send us a message</h2>
                <p className="text-gray-600 mb-6 text-sm">Fill out the form and we&apos;ll be in touch shortly.</p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your company"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        {roleOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What are you interested in? *</label>
                    <select
                      name="interest"
                      value={formData.interest}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      {interestOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us about your production needs..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting, you agree to our Privacy Policy and Terms of Service.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        © 2024 SyncOps. All rights reserved.
      </footer>
    </div>
  );
}
