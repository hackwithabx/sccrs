"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Star, Menu, X, Clock,
  Scissors, Sparkles, Heart, Droplets,
  MessageCircle, Instagram, Facebook, ChevronRight,
} from "lucide-react";

/* ════════ SERVICE DATA ════════ */
const serviceCategories = ["Hair", "Skin", "Nails", "Spa"] as const;

const serviceItems: Record<string, { name: string; duration: string; price: string }[]> = {
  Hair: [
    { name: "Women's Haircut & Styling", duration: "45 min", price: "₹799" },
    { name: "Hair Colour (Global)", duration: "90 min", price: "₹2,499" },
    { name: "Highlights / Balayage", duration: "120 min", price: "₹3,999" },
    { name: "Keratin Treatment", duration: "150 min", price: "₹5,499" },
    { name: "Hair Spa & Treatment", duration: "60 min", price: "₹1,299" },
    { name: "Blow Dry & Set", duration: "30 min", price: "₹499" },
  ],
  Skin: [
    { name: "Classic Facial", duration: "60 min", price: "₹1,199" },
    { name: "Gold / Diamond Facial", duration: "90 min", price: "₹2,499" },
    { name: "Chemical Peel", duration: "45 min", price: "₹1,999" },
    { name: "De-Tan Treatment", duration: "45 min", price: "₹899" },
    { name: "Anti-Aging Facial", duration: "75 min", price: "₹2,999" },
    { name: "Acne Treatment", duration: "60 min", price: "₹1,499" },
  ],
  Nails: [
    { name: "Manicure (Classic)", duration: "30 min", price: "₹499" },
    { name: "Pedicure (Spa)", duration: "45 min", price: "₹699" },
    { name: "Gel Nail Art", duration: "60 min", price: "₹1,299" },
    { name: "Acrylic Extensions", duration: "90 min", price: "₹2,499" },
    { name: "Nail Art (Per Nail)", duration: "10 min", price: "₹99" },
  ],
  Spa: [
    { name: "Swedish Massage", duration: "60 min", price: "₹1,999" },
    { name: "Aromatherapy Massage", duration: "75 min", price: "₹2,499" },
    { name: "Hot Stone Therapy", duration: "90 min", price: "₹2,999" },
    { name: "Body Scrub & Wrap", duration: "60 min", price: "₹1,799" },
    { name: "Head & Shoulder Massage", duration: "30 min", price: "₹799" },
  ],
};

const memberships = [
  {
    name: "Silver",
    price: "₹1,999/mo",
    features: ["2 Haircuts per month", "1 Basic Facial", "10% off all services", "Priority booking"],
    popular: false,
  },
  {
    name: "Gold",
    price: "₹3,499/mo",
    features: ["Unlimited Haircuts", "2 Facials per month", "1 Spa Treatment", "20% off all services", "Free Manicure", "Priority booking"],
    popular: true,
  },
  {
    name: "Platinum",
    price: "₹5,999/mo",
    features: ["Unlimited Haircuts & Styling", "4 Facials per month", "2 Spa Treatments", "30% off all services", "Free Mani-Pedi", "Complimentary Hair Spa", "Priority + Home service"],
    popular: false,
  },
];

const stylists = [
  { name: "Aisha Kapoor", role: "Senior Hair Colourist", exp: "8 Years", img: "https://placehold.co/300x360/f8e8e8/b76e79?text=Aisha" },
  { name: "Neha Sharma", role: "Skin Specialist", exp: "6 Years", img: "https://placehold.co/300x360/f8e8e8/b76e79?text=Neha" },
  { name: "Riya Patel", role: "Nail Artist", exp: "5 Years", img: "https://placehold.co/300x360/f8e8e8/b76e79?text=Riya" },
];

const reviews = [
  { name: "Megha Desai", service: "Hair Colour", rating: 5, text: "Aisha gave me the most beautiful balayage! The salon is so elegant and relaxing. Absolutely love my new look.", img: "M" },
  { name: "Priya Singh", service: "Bridal Package", rating: 5, text: "Had my bridal makeup and hair done here. The team was amazing, super professional, and made me feel like a princess on my big day.", img: "P" },
  { name: "Ananya Rao", service: "Spa Treatment", rating: 5, text: "The aromatherapy massage was heavenly. Such a serene atmosphere. I come here monthly now — it's my happy place.", img: "A" },
  { name: "Kavita Joshi", service: "Nail Art", rating: 4, text: "Riya's nail art designs are incredible. She's so creative and patient. My instagram is full of her nail art pictures now!", img: "K" },
];

const galleryPairs = [
  { before: "https://placehold.co/400x300/e8d5d5/b76e79?text=Before+1", after: "https://placehold.co/400x300/f8e8e8/b76e79?text=After+1" },
  { before: "https://placehold.co/400x300/e8d5d5/b76e79?text=Before+2", after: "https://placehold.co/400x300/f8e8e8/b76e79?text=After+2" },
  { before: "https://placehold.co/400x300/e8d5d5/b76e79?text=Before+3", after: "https://placehold.co/400x300/f8e8e8/b76e79?text=After+3" },
  { before: "https://placehold.co/400x300/e8d5d5/b76e79?text=Before+4", after: "https://placehold.co/400x300/f8e8e8/b76e79?text=After+4" },
  { before: "https://placehold.co/400x300/e8d5d5/b76e79?text=Before+5", after: "https://placehold.co/400x300/f8e8e8/b76e79?text=After+5" },
  { before: "https://placehold.co/400x300/e8d5d5/b76e79?text=Before+6", after: "https://placehold.co/400x300/f8e8e8/b76e79?text=After+6" },
];

const navLinks = ["Home", "Services", "Gallery", "Book", "Contact"];

export default function SalonTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("Hair");

  const tabIcons: Record<string, typeof Scissors> = { Hair: Scissors, Skin: Sparkles, Nails: Heart, Spa: Droplets };

  return (
    <div className="min-h-screen bg-white text-[#2d2d2d]" style={{ fontFamily: "'Lato', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap');`}</style>

      {/* Demo Bar */}
      <div className="bg-[#2d2d2d] text-white text-xs text-center py-2 px-4">
        <span className="opacity-70">This is a demo template by </span>
        <Link href="/demos" className="underline font-medium text-[#b76e79] hover:text-white transition-colors">SecureCodeReviews</Link>
        <span className="opacity-70"> · </span>
        <Link href="/demos" className="underline opacity-70 hover:opacity-100 transition-opacity">← View all templates</Link>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#f8e8e8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#home" className="flex items-center gap-2">
              <div className="h-9 w-9 bg-[#b76e79] rounded-full flex items-center justify-center">
                <Scissors className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>
                <span className="text-[#b76e79]">Blush</span> <span className="text-[#2d2d2d]">& Bloom</span>
              </span>
            </a>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-[#2d2d2d]/70 hover:text-[#b76e79] transition-colors font-medium tracking-wide">
                  {link}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a href="#book" className="hidden sm:inline-flex bg-[#b76e79] hover:bg-[#a25d68] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors tracking-wide">
                Book Now
              </a>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-[#2d2d2d]">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-[#f8e8e8]">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm text-[#2d2d2d]/70 hover:text-[#b76e79] font-medium tracking-wide">
                  {link}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section id="home" className="relative bg-[#f8e8e8] overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://placehold.co/1920x900/f0d5d5/b76e79?text=Salon+Hero" alt="Salon" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-[#b76e79] text-sm tracking-[0.2em] uppercase font-medium mb-4">Premium Salon & Spa</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2d2d2d] mb-6 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Where Beauty Meets <span className="text-[#b76e79]">Elegance</span>
            </h1>
            <p className="text-lg text-[#2d2d2d]/70 mb-10 leading-relaxed font-light">
              Indulge in luxury treatments by expert stylists. From hair transformations to rejuvenating spa therapies — your self-care journey starts here.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#book" className="inline-flex items-center gap-2 bg-[#b76e79] hover:bg-[#a25d68] text-white font-medium px-7 py-3.5 rounded-full transition-colors tracking-wide">
                Book Appointment
              </a>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-2 border-[#b76e79] text-[#b76e79] hover:bg-[#b76e79] hover:text-white font-medium px-7 py-3.5 rounded-full transition-all tracking-wide">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ SERVICES ══════════════════════ */}
      <section id="services" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#b76e79] text-sm tracking-[0.15em] uppercase font-medium mb-2">Our Services</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Services & Pricing</h2>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {serviceCategories.map((cat) => {
              const Icon = tabIcons[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all ${
                    activeTab === cat
                      ? "bg-[#b76e79] text-white shadow-md"
                      : "bg-[#f8e8e8] text-[#2d2d2d]/70 hover:bg-[#f0d5d5]"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {cat}
                </button>
              );
            })}
          </div>

          {/* Service items */}
          <div className="max-w-3xl mx-auto">
            <div className="space-y-3">
              {serviceItems[activeTab]?.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-5 bg-[#fdf6f6] rounded-xl border border-[#f8e8e8] hover:border-[#b76e79]/30 transition-colors group">
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-[#b76e79] transition-colors">{item.name}</h3>
                    <p className="text-sm text-[#2d2d2d]/50 mt-0.5">{item.duration}</p>
                  </div>
                  <span className="text-[#b76e79] font-bold text-lg shrink-0 ml-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ MEMBERSHIP ══════════════════════ */}
      <section className="py-20 bg-[#fdf6f6]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#b76e79] text-sm tracking-[0.15em] uppercase font-medium mb-2">Exclusive</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Membership Plans</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map((m) => (
              <div key={m.name} className={`bg-white rounded-2xl p-6 border-2 relative ${m.popular ? "border-[#b76e79] shadow-lg" : "border-[#f8e8e8]"} hover:shadow-md transition-shadow`}>
                {m.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#b76e79] text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{m.name}</h3>
                  <p className="text-3xl font-bold text-[#b76e79] mt-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{m.price}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {m.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#2d2d2d]/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#b76e79] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#book" className={`block text-center font-medium py-2.5 rounded-full transition-colors text-sm tracking-wide ${
                  m.popular
                    ? "bg-[#b76e79] hover:bg-[#a25d68] text-white"
                    : "border-2 border-[#b76e79] text-[#b76e79] hover:bg-[#b76e79] hover:text-white"
                }`}>
                  Join Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ BEFORE / AFTER GALLERY ══════════════════════ */}
      <section id="gallery" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#b76e79] text-sm tracking-[0.15em] uppercase font-medium mb-2">Transformations</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Before & After</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryPairs.map((pair, i) => (
              <div key={i} className="group">
                <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                  <div className="relative">
                    <img src={pair.before} alt="Before" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full">Before</span>
                  </div>
                  <div className="relative">
                    <img src={pair.after} alt="After" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute bottom-2 right-2 text-[10px] bg-[#b76e79] text-white px-2 py-0.5 rounded-full">After</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ STYLISTS ══════════════════════ */}
      <section className="py-20 bg-[#fdf6f6]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#b76e79] text-sm tracking-[0.15em] uppercase font-medium mb-2">Our Experts</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Meet Our Stylists</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stylists.map((s) => (
              <div key={s.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#f8e8e8] group hover:shadow-md transition-shadow">
                <img src={s.img} alt={s.name} className="w-full h-64 object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{s.name}</h3>
                  <p className="text-[#b76e79] text-sm font-medium">{s.role}</p>
                  <p className="text-sm text-[#2d2d2d]/50 mt-1">{s.exp} Experience</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ REVIEWS ══════════════════════ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#b76e79] text-sm tracking-[0.15em] uppercase font-medium mb-2">Love Notes</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Client Reviews</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {reviews.map((r) => (
              <div key={r.name} className="bg-[#fdf6f6] rounded-2xl p-5 border border-[#f8e8e8] hover:border-[#b76e79]/30 transition-colors">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? "text-[#b76e79] fill-[#b76e79]" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-sm text-[#2d2d2d]/70 mb-4 leading-relaxed italic">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-3 border-t border-[#f8e8e8]">
                  <div className="h-9 w-9 bg-[#b76e79] rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {r.img}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{r.name}</p>
                    <p className="text-xs text-[#b76e79]">{r.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ BOOKING FORM ══════════════════════ */}
      <section id="book" className="py-20 bg-[#2d2d2d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="text-white">
              <p className="text-[#b76e79] text-sm tracking-[0.15em] uppercase font-medium mb-4">Appointments</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Book Your Visit</h2>
              <p className="text-gray-400 leading-relaxed mb-8 font-light">
                Treat yourself to a pampering session. Book online and we&apos;ll have everything ready for your arrival.
              </p>

              {/* Opening hours */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-[#b76e79]">
                  <Clock className="h-5 w-5" /> Opening Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Monday – Saturday</span><span className="font-medium">10:00 AM – 8:00 PM</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Sunday</span><span className="font-medium">11:00 AM – 6:00 PM</span></div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#b76e79]" /> Blush & Bloom Salon, 12 Rose Lane, Koregaon Park, Pune</div>
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-[#b76e79]" /> +91 99999 99999</div>
              </div>
            </div>

            <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Name *</label>
                  <input type="text" name="name" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b76e79] focus:border-transparent outline-none" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Phone *</label>
                  <input type="tel" name="phone" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b76e79] focus:border-transparent outline-none" placeholder="+91 99999 99999" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Date *</label>
                  <input type="date" name="date" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b76e79] focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Time *</label>
                  <select name="time" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#b76e79] focus:border-transparent outline-none">
                    <option value="">Select time...</option>
                    {["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Service Category *</label>
                  <select name="service" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#b76e79] focus:border-transparent outline-none">
                    <option value="">Select...</option>
                    {serviceCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Stylist Preference</label>
                  <select name="stylist" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#b76e79] focus:border-transparent outline-none">
                    <option value="No preference">No preference</option>
                    {stylists.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1.5">Special Requests</label>
                <textarea name="requests" rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b76e79] focus:border-transparent outline-none resize-none" placeholder="Any specific requests or notes..." />
              </div>
              <button type="submit" className="w-full bg-[#b76e79] hover:bg-[#a25d68] text-white font-semibold py-3.5 rounded-full transition-colors tracking-wide">
                Book Appointment
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════ MAP ══════════════════════ */}
      <section id="contact" className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/*
            GOOGLE MAPS EMBED:
            Replace the src with your salon's Google Maps embed URL.
          */}
          <div className="rounded-2xl overflow-hidden border border-[#f8e8e8]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d242117.68082427554!2d73.72288309453122!3d18.524598710773886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1711111111111"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Salon Location"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="bg-[#2d2d2d] text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>
                <span className="text-[#b76e79]">Blush</span> & Bloom
              </span>
              <p className="text-sm text-gray-400 mt-3 leading-relaxed font-light">
                Where beauty meets elegance. Your self-care destination in Pune.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Quick Links</h4>
              <ul className="space-y-2.5">
                {navLinks.map((l) => (
                  <li key={l}><a href={`#${l.toLowerCase()}`} className="text-sm text-gray-400 hover:text-[#b76e79] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Contact</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li>+91 99999 99999</li>
                <li>hello@blushandbloom.com</li>
                <li>12 Rose Lane, Koregaon Park</li>
                <li>Pune – 411001</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Follow Us</h4>
              <div className="flex gap-3">
                {[Instagram, Facebook].map((Icon, i) => (
                  <a key={i} href="#" className="h-10 w-10 bg-white/5 hover:bg-[#b76e79] rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all">
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-10 pt-8 text-center text-xs text-gray-500">
            © 2026 Blush & Bloom Salon & Spa. All rights reserved. | Built with ❤️ by SecureCodeReviews
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
