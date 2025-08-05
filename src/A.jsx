/* components/Navbar.jsx */
import React from 'react';

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="text-2xl font-bold text-blue-600">YourSaaS</div>
        <div className="hidden md:flex space-x-6">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
          <a href="#testimonial" className="hover:text-blue-600 transition">Testimonials</a>
        </div>
        <div className="flex space-x-4">
          <button className="hidden md:inline px-4 py-2 font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
            Sign In
          </button>
          <button className="px-4 py-2 font-medium rounded-md bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 transition">
            Sign Up
          </button>
        </div>
        <button className="md:hidden focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

/* components/Hero.jsx */
import React from 'react';

export default function Hero() {
  return (
    <section className="pt-24 bg-gradient-to-r from-blue-50 to-white">
      <div className="container mx-auto text-center py-20">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Empower Your Business with YourSaaS
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          The all-in-one platform to manage, analyze, and grow effortlessly.
        </p>
        <div className="space-x-4">
          <button className="px-8 py-3 font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
            Get Started
          </button>
          <a href="#features" className="px-8 py-3 font-semibold rounded-md border border-gray-300 hover:bg-gray-100 transition">
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

/* components/Features.jsx */
import React from 'react';

const features = [
  { title: 'Real-time Analytics', desc: 'Make data-driven decisions with live dashboards.' },
  { title: 'Team Collaboration', desc: 'Connect your team with secure, shared workspaces.' },
  { title: 'Automated Reports', desc: 'Schedule and deliver insights directly to your inbox.' },
];

export default function Features() {
  return (
    <section id="features" className="container mx-auto py-20">
      <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map(({ title, desc }) => (
          <div key={title} className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition">
            <h3 className="text-2xl font-semibold mb-4">{title}</h3>
            <p className="text-gray-600">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* components/Testimonials.jsx */
import React from 'react';

const testimonials = [
  { name: 'Alice Johnson', quote: 'YourSaaS transformed our workflow overnight!' },
  { name: 'Mark Stevens', quote: 'Incredible features and top-notch support.' },
  { name: 'Lisa Wong', quote: 'We saw a 50% boost in productivity.' },
];

export default function Testimonials() {
  return (
    <section id="testimonial" className="bg-blue-50 py-20">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">What Our Users Say</h2>
        <div className="space-y-8 md:space-y-0 md:flex md:space-x-6">
          {testimonials.map(({ name, quote }) => (
            <div key={name} className="p-6 bg-white rounded-2xl shadow-md">
              <p className="italic mb-4">"{quote}"</p>
              <div className="font-semibold">— {name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* components/Pricing.jsx */
import React from 'react';

const plans = [
  { name: 'Basic', price: '$19/mo', features: ['Up to 5 users', 'Basic analytics', 'Email support'] },
  { name: 'Pro', price: '$49/mo', features: ['Unlimited users', 'Advanced analytics', 'Priority support'] },
  { name: 'Enterprise', price: '$99/mo', features: ['Custom solutions', 'Dedicated manager', '24/7 support'] },
];

export default function Pricing() {
  return (
    <section id="pricing" className="container mx-auto py-20">
      <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(({ name, price, features }) => (
          <div key={name} className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col">
            <h3 className="text-2xl font-semibold mb-4">{name}</h3>
            <div className="text-4xl font-bold mb-4">{price}</div>
            <ul className="flex-1 space-y-2 mb-6">
              {features.map(f => <li key={f}>• {f}</li>)}
            </ul>
            <button className="mt-auto px-4 py-2 font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
              Choose
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* components/Footer.jsx */
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t py-8">
      <div className="container mx-auto text-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} YourSaaS. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* pages/LandingPage.jsx */
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="font-sans antialiased text-gray-800">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}
