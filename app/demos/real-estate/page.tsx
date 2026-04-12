"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Star, Menu, X,
  Building2, Home, Map, Ruler, Car, Compass,
  MessageCircle, Search, IndianRupee, ChevronRight,
  BedDouble, Maximize, ArrowUpRight,
} from "lucide-react";

/* ════════ PROPERTY DATA ════════ */
type Property = {
  id: number; title: string; location: string; price: string; bhk: string;
  area: string; type: "Residential" | "Commercial" | "Plots";
  img: string; featured?: boolean;
};

const properties: Property[] = [
  { id: 1, title: "Luxury 3 BHK Apartment", location: "Bandra West, Mumbai", price: "₹2.5 Cr", bhk: "3 BHK", area: "1,450 sq.ft", type: "Residential", img: "https://placehold.co/600x400/0f2557/c9a84c?text=3+BHK+Bandra", featured: true },
  { id: 2, title: "Premium 2 BHK Flat", location: "Andheri East, Mumbai", price: "₹1.2 Cr", bhk: "2 BHK", area: "980 sq.ft", type: "Residential", img: "https://placehold.co/600x400/0f2557/c9a84c?text=2+BHK+Andheri" },
  { id: 3, title: "Commercial Office Space", location: "BKC, Mumbai", price: "₹3.8 Cr", bhk: "Office", area: "2,200 sq.ft", type: "Commercial", img: "https://placehold.co/600x400/0f2557/c9a84c?text=Office+BKC" },
  { id: 4, title: "Independent Villa", location: "Lonavala, Maharashtra", price: "₹4.5 Cr", bhk: "4 BHK Villa", area: "3,500 sq.ft", type: "Residential", img: "https://placehold.co/600x400/0f2557/c9a84c?text=Villa+Lonavala", featured: true },
  { id: 5, title: "Residential Plot", location: "Hinjewadi, Pune", price: "₹85 Lakh", bhk: "Plot", area: "2,400 sq.ft", type: "Plots", img: "https://placehold.co/600x400/0f2557/c9a84c?text=Plot+Pune" },
  { id: 6, title: "Retail Shop", location: "Powai, Mumbai", price: "₹1.8 Cr", bhk: "Shop", area: "650 sq.ft", type: "Commercial", img: "https://placehold.co/600x400/0f2557/c9a84c?text=Shop+Powai" },
];

const testimonials = [
  { name: "Suresh Patel", city: "Mumbai", rating: 5, text: "Found our dream home through this agency. Extremely professional service and transparent dealings. Highly recommended!", img: "SP" },
  { name: "Kavita Deshmukh", city: "Pune", rating: 5, text: "The best real estate experience I've ever had. They understood our requirements perfectly and found us the ideal property.", img: "KD" },
  { name: "Amit Sharma", city: "Thane", rating: 4, text: "Great service from start to finish. Paper work was handled smoothly. The agent was always available for our queries.", img: "AS" },
];

const stats = [
  { value: "500+", label: "Properties Sold" },
  { value: "12", label: "Years Experience" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "3", label: "Cities Covered" },
];

const filterTabs = ["All", "Residential", "Commercial", "Plots"] as const;
const navLinks = ["Home", "Properties", "About", "Contact"];

export default function RealEstateTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [showDetail, setShowDetail] = useState(false);

  const filteredProperties = activeFilter === "All"
    ? properties
    : properties.filter((p) => p.type === activeFilter);

  const detailProperty = properties[0]; // Show first property as example detail

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Demo Bar */}
      <div className="bg-[#0f2557] text-white text-xs text-center py-2 px-4">
        <span className="opacity-70">This is a demo template by </span>
        <Link href="/demos" className="underline font-medium text-[#c9a84c] hover:text-white transition-colors">SecureCodeReviews</Link>
        <span className="opacity-70"> · </span>
        <Link href="/demos" className="underline opacity-70 hover:opacity-100 transition-opacity">← View all templates</Link>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#home" className="flex items-center gap-2">
              <div className="h-9 w-9 bg-[#0f2557] rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-[#c9a84c]" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-[#0f2557]">Prime</span><span className="text-[#c9a84c]">Estates</span>
              </span>
            </a>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-gray-600 hover:text-[#0f2557] transition-colors font-medium">
                  {link}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a href="#contact" className="hidden sm:inline-flex bg-[#0f2557] hover:bg-[#0c1e48] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                Get Free Consultation
              </a>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm text-gray-600 hover:text-[#0f2557] font-medium">
                  {link}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section id="home" className="relative min-h-[80vh] flex items-center bg-[#0f2557]">
        <div className="absolute inset-0">
          <img src="https://placehold.co/1920x1080/0a1a3a/c9a84c?text=City+Skyline" alt="Skyline" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 w-full">
          <p className="text-[#c9a84c] text-sm tracking-wide font-medium mb-4 uppercase">Mumbai&apos;s Trusted Real Estate Partner</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight max-w-3xl">
            Find Your <span className="text-[#c9a84c]">Perfect Property</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mb-10">
            Discover premium residential, commercial, and investment properties across Mumbai, Pune, and Thane.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-2xl max-w-4xl">
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">Location</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-[#0f2557] outline-none">
                  <option>All Locations</option>
                  <option>Mumbai</option>
                  <option>Pune</option>
                  <option>Thane</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">Property Type</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-[#0f2557] outline-none">
                  <option>All Types</option>
                  <option>Flat</option>
                  <option>Villa</option>
                  <option>Plot</option>
                  <option>Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">Budget Range</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-[#0f2557] outline-none">
                  <option>Any Budget</option>
                  <option>Under ₹50 Lakh</option>
                  <option>₹50 Lakh – ₹1 Cr</option>
                  <option>₹1 Cr – ₹3 Cr</option>
                  <option>₹3 Cr+</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f2557] font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" /> Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#0f2557] border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-[#c9a84c]">{s.value}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ PROPERTIES ══════════════════════ */}
      <section id="properties" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-[#c9a84c] mb-2 tracking-wide uppercase">Our Listings</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Properties</h2>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === tab
                    ? "bg-[#0f2557] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Property cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                <div className="relative">
                  <img src={p.img} alt={p.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
                  {p.featured && (
                    <div className="absolute top-3 left-3 bg-[#c9a84c] text-[#0f2557] text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Featured
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#0f2557] text-xs font-bold px-3 py-1 rounded-full">
                    {p.type}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-[#0f2557] transition-colors">{p.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin className="h-3.5 w-3.5" /> {p.location}
                  </p>
                  <p className="text-xl font-bold text-[#0f2557] mb-4">{p.price}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 pb-4 border-b border-gray-100">
                    <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {p.bhk}</span>
                    <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {p.area}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <button onClick={() => setShowDetail(true)} className="text-sm font-medium text-[#0f2557] hover:text-[#c9a84c] transition-colors flex items-center gap-1">
                      View Details <ChevronRight className="h-4 w-4" />
                    </button>
                    <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="h-9 w-9 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ PROPERTY DETAIL MODAL ══════════════════════ */}
      {showDetail && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-start justify-center overflow-y-auto p-4 pt-20">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl relative">
            <button onClick={() => setShowDetail(false)} className="absolute top-4 right-4 h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10">
              <X className="h-4 w-4" />
            </button>

            {/* Gallery */}
            <div className="grid grid-cols-3 gap-1 rounded-t-2xl overflow-hidden">
              <div className="col-span-2">
                <img src={detailProperty.img} alt={detailProperty.title} className="w-full h-64 object-cover" />
              </div>
              <div className="space-y-1">
                <img src="https://placehold.co/300x130/0f2557/c9a84c?text=Photo+2" alt="Interior" className="w-full h-[calc(50%-2px)] object-cover" />
                <img src="https://placehold.co/300x130/0f2557/c9a84c?text=Photo+3" alt="View" className="w-full h-[calc(50%-2px)] object-cover" />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{detailProperty.title}</h2>
                  <p className="text-gray-500 flex items-center gap-1 mt-1"><MapPin className="h-4 w-4" /> {detailProperty.location}</p>
                </div>
                <p className="text-3xl font-bold text-[#0f2557]">{detailProperty.price}</p>
              </div>

              {/* Specs table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Configuration", value: detailProperty.bhk },
                  { label: "Area", value: detailProperty.area },
                  { label: "Floor", value: "12th of 25" },
                  { label: "Parking", value: "2 Covered" },
                  { label: "Facing", value: "West (Sea-facing)" },
                  { label: "Status", value: "Ready to Move" },
                ].map((spec) => (
                  <div key={spec.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{spec.label}</p>
                    <p className="text-sm font-semibold mt-0.5">{spec.value}</p>
                  </div>
                ))}
              </div>

              <h3 className="font-bold mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                This premium 3 BHK apartment in the heart of Bandra West offers breathtaking sea views, modern amenities, and a prime location. The property features spacious bedrooms, Italian marble flooring, modular kitchen with chimney, and round-the-clock security. The society includes a swimming pool, gym, children&apos;s play area, and landscaped gardens.
              </p>

              {/* Inquiry mini form */}
              <div className="bg-[#0f2557] rounded-xl p-6 text-white">
                <h3 className="font-bold mb-4">Interested? Request a Callback</h3>
                <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="grid sm:grid-cols-3 gap-3">
                  <input type="text" name="name" required placeholder="Your Name" className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm placeholder-white/50 outline-none focus:ring-2 focus:ring-[#c9a84c]" />
                  <input type="tel" name="phone" required placeholder="Phone Number" className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm placeholder-white/50 outline-none focus:ring-2 focus:ring-[#c9a84c]" />
                  <button type="submit" className="bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f2557] font-bold py-2.5 rounded-lg transition-colors">
                    Request Callback
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ AGENT PROFILE ══════════════════════ */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <img src="https://placehold.co/500x600/0f2557/c9a84c?text=Agent+Photo" alt="Agent" className="rounded-2xl shadow-lg w-full" />
            <div>
              <p className="text-sm font-semibold text-[#c9a84c] mb-2 tracking-wide uppercase">Your Agent</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">Vikram Malhotra</h2>
              <p className="text-[#0f2557] font-medium text-lg mb-4">Senior Real Estate Consultant</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["12+ Years Experience", "RERA Certified", "500+ Properties Sold", "Mumbai & Pune"].map((b) => (
                  <span key={b} className="text-xs bg-[#0f2557]/10 text-[#0f2557] px-3 py-1.5 rounded-full font-medium">{b}</span>
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Vikram Malhotra is one of Mumbai&apos;s most trusted real estate consultants. With over 12 years of experience in the premium property market, he has helped 500+ families find their dream homes.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Specializing in luxury apartments, villas, and commercial properties across Mumbai, Pune, and Thane, Vikram is known for his deep market knowledge, transparent dealings, and post-sale support.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="tel:+919999999999" className="inline-flex items-center gap-2 bg-[#0f2557] text-white font-medium px-5 py-2.5 rounded-lg hover:bg-[#0c1e48] transition-colors text-sm">
                  <Phone className="h-4 w-4" /> +91 99999 99999
                </a>
                <a href="mailto:vikram@primeestates.com" className="inline-flex items-center gap-2 border-2 border-[#0f2557] text-[#0f2557] font-medium px-5 py-2.5 rounded-lg hover:bg-[#0f2557] hover:text-white transition-all text-sm">
                  <Mail className="h-4 w-4" /> Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#c9a84c] mb-2 tracking-wide uppercase">Client Stories</p>
            <h2 className="text-3xl sm:text-4xl font-bold">What Our Clients Say</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? "text-[#c9a84c] fill-[#c9a84c]" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-gray-600 mb-5 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="h-10 w-10 bg-[#0f2557] rounded-full flex items-center justify-center text-[#c9a84c] font-bold text-sm">
                    {t.img}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ INQUIRY FORM ══════════════════════ */}
      <section id="contact" className="py-20 bg-[#0f2557]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Get Free Consultation</h2>
            <p className="text-blue-200">Tell us what you&apos;re looking for and we&apos;ll find the perfect property match.</p>
          </div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input type="text" name="name" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f2557] focus:border-transparent outline-none" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                <input type="tel" name="phone" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f2557] focus:border-transparent outline-none" placeholder="+91 99999 99999" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f2557] focus:border-transparent outline-none" placeholder="you@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Interested In *</label>
                <select name="property_type" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0f2557] focus:border-transparent outline-none">
                  <option value="">Select type...</option>
                  <option>Flat / Apartment</option>
                  <option>Villa / Bungalow</option>
                  <option>Commercial Space</option>
                  <option>Residential Plot</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea name="message" rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f2557] focus:border-transparent outline-none resize-none" placeholder="Budget, preferred location, any specific requirements..." />
            </div>
            <button type="submit" className="w-full bg-[#0f2557] hover:bg-[#0c1e48] text-white font-semibold py-3.5 rounded-lg transition-colors">
              Request Callback
            </button>
          </form>

          {/* Map */}
          <div className="mt-12 rounded-2xl overflow-hidden border border-white/10">
            {/*
              GOOGLE MAPS EMBED:
              Replace the src with your office location's Google Maps embed URL.
            */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.14571458693!2d72.71637258436986!3d19.08219783259688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1711111111111"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="bg-gray-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-9 w-9 bg-[#0f2557] rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-[#c9a84c]" />
                </div>
                <span className="text-xl font-bold">Prime<span className="text-[#c9a84c]">Estates</span></span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Mumbai&apos;s trusted real estate partner. Finding you the perfect property since 2012.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-2.5">
                {navLinks.map((l) => (
                  <li key={l}><a href={`#${l.toLowerCase()}`} className="text-sm text-gray-400 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Contact</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li>+91 99999 99999</li>
                <li>info@primeestates.com</li>
                <li>123 Realty Tower, Andheri West</li>
                <li>Mumbai – 400058</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Legal</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li>RERA Reg: PXXXXXXXXX</li>
                <li className="text-xs text-gray-600 mt-4">All property information is indicative and subject to verification. Please contact us for exact details.</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-8 text-center text-xs text-gray-500">
            © 2026 PrimeEstates. All rights reserved. | Built with ❤️ by SecureCodeReviews
          </div>
        </div>
      </footer>

      {/* ══════════════════════ FLOATING WHATSAPP ══════════════════════ */}
      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
