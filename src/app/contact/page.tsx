'use client';

import { useState } from 'react';
import { Mail, MessageCircle, Clock, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after showing success
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '', type: 'general' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800 flex items-center justify-center py-12">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="premium-border p-12 glass-effect-strong">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-green to-accent-cyan rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-premium">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Message Sent!</h1>
            <p className="text-gray-300 text-lg mb-8">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
            <Link 
              href="/"
              className="btn-premium py-3 px-8 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-premium inline-block"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-accent-cyan hover:text-accent-green transition-colors inline-flex items-center gap-2 mb-6">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
            Contact <span className="text-premium">Support</span>
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
            Need help with your account, subscription, or have questions about our AI insights? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass-effect-strong premium-border p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-accent-cyan" />
                Send us a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="text-white font-semibold mb-2 block">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-dark-100 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-accent-cyan/50 focus:outline-none transition-colors"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="text-white font-semibold mb-2 block">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-dark-100 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-accent-cyan/50 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="text-white font-semibold mb-2 block">
                    Request Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-dark-100 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-accent-cyan/50 focus:outline-none transition-colors"
                  >
                    <option value="general">General Question</option>
                    <option value="subscription">Subscription Issue</option>
                    <option value="technical">Technical Problem</option>
                    <option value="billing">Billing Question</option>
                    <option value="cancel">Cancel Subscription</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="text-white font-semibold mb-2 block">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-dark-100 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-accent-cyan/50 focus:outline-none transition-colors"
                    placeholder="Brief description of your request"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="text-white font-semibold mb-2 block">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-dark-100 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-accent-cyan/50 focus:outline-none transition-colors resize-none"
                    placeholder="Please provide as much detail as possible..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-premium py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-premium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <Send className="w-5 h-5" />
                      Send Message
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="glass-effect-strong premium-border p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-accent-cyan" />
                Contact Information
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Email Support</p>
                  <a href="mailto:support@aibettingtips.com" className="text-accent-cyan hover:text-accent-green transition-colors">
                    support@aibettingtips.com
                  </a>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-1">Response Time</p>
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4 text-accent-green" />
                    Within 24 hours
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-1">Business Hours</p>
                  <p className="text-white">Monday - Friday, 9 AM - 6 PM EST</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="glass-effect-strong premium-border p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
              
              <div className="space-y-3">
                <Link
                  href="/account"
                  className="block p-3 bg-dark-100 hover:bg-dark-50 rounded-xl transition-colors text-white"
                >
                  Account Settings
                </Link>
                
                <Link
                  href="/terms"
                  className="block p-3 bg-dark-100 hover:bg-dark-50 rounded-xl transition-colors text-white"
                >
                  Terms of Service
                </Link>
                
                <Link
                  href="/privacy"
                  className="block p-3 bg-dark-100 hover:bg-dark-50 rounded-xl transition-colors text-white"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* FAQ */}
            <div className="glass-effect-strong border border-accent-green/20 p-6">
              <h3 className="text-lg font-bold text-accent-green mb-4">Common Questions</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-white font-semibold mb-1">How do I cancel my subscription?</p>
                  <p className="text-gray-300">Visit your Account Settings or contact support.</p>
                </div>
                
                <div>
                  <p className="text-white font-semibold mb-1">Are the insights guaranteed?</p>
                  <p className="text-gray-300">No, all content is AI-generated for educational purposes only.</p>
                </div>
                
                <div>
                  <p className="text-white font-semibold mb-1">Can I get a refund?</p>
                  <p className="text-gray-300">Contact support to discuss refund options.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}