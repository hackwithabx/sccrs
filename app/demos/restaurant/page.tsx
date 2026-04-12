"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Clock, Star, Menu, X,
  UtensilsCrossed, ChefHat, Wine, IceCreamCone, Coffee,
  MessageCircle, Instagram, Facebook, Twitter,
} from "lucide-react";

/* ════════ MENU DATA ════════ */
const menuCategories = ["Starters", "Main Course", "Desserts", "Drinks"] as const;

const menuItems: Record<string, { name: string; desc: string; price: string }[]> = {
  Starters: [
    { name: "Paneer Tikka", desc: "Marinated cottage cheese grilled to perfection in tandoor", price: "₹299" },
    { name: "Chicken 65", desc: "Spicy deep-fried chicken with curry leaves and red chillies", price: "₹349" },
    { name: "Veg Spring Rolls", desc: "Crispy rolls stuffed with fresh vegetables and glass noodles", price: "₹199" },
    { name: "Mushroom Bruschetta", desc: "Toasted bread topped with sautéed mushrooms and herbs", price: "₹249" },
    { name: "Prawn Tempura", desc: "Lightly battered prawns served with wasabi mayo dip", price: "₹399" },
  ],
  "Main Course": [
    { name: "Butter Chicken", desc: "Tender chicken in rich tomato-cream gravy with butter", price: "₹449" },
    { name: "Dal Makhani", desc: "Slow-cooked black lentils simmered overnight with cream", price: "₹299" },
    { name: "Lamb Rogan Josh", desc: "Aromatic Kashmiri lamb curry with whole spices", price: "₹549" },
    { name: "Grilled Fish", desc: "Fresh catch marinated in lemon-herb, grilled over charcoal", price: "₹499" },
    { name: "Paneer Butter Masala", desc: "Cottage cheese cubes in velvety tomato-cashew gravy", price: "₹349" },
  ],
  Desserts: [
    { name: "Gulab Jamun", desc: "Soft milk dumplings soaked in rose-cardamom sugar syrup", price: "₹149" },
    { name: "Chocolate Lava Cake", desc: "Warm chocolate cake with molten center, served with ice cream", price: "₹249" },
    { name: "Rasmalai", desc: "Flattened cheese balls in chilled sweetened saffron milk", price: "₹199" },
    { name: "Mango Cheesecake", desc: "Creamy New York cheesecake with fresh Alphonso mango coulis", price: "₹299" },
  ],
  Drinks: [
    { name: "Fresh Lime Soda", desc: "Classic refresher — sweet, salty, or mixed", price: "₹99" },
    { name: "Mango Lassi", desc: "Thick yogurt smoothie blended with Alphonso mango pulp", price: "₹149" },
    { name: "Cold Coffee", desc: "Chilled espresso blended with ice cream and chocolate", price: "₹179" },
    { name: "Masala Chai", desc: "Traditional Indian spiced tea with cardamom and ginger", price: "₹79" },
    { name: "Virgin Mojito", desc: "Mint, lime, and soda — refreshing and non-alcoholic", price: "₹149" },
  ],
};

const reviews = [
  { name: "Aditya Kapoor", city: "Mumbai", rating: 5, text: "Absolutely incredible dining experience. The Butter Chicken here is the best I've had in years. The ambience is perfect for date nights." },
  { name: "Meera Joshi", city: "Pune", rating: 5, text: "The Chef's Special was outstanding! Beautiful plating, fresh ingredients, and flavors that dance on your palate. Will definitely return." },
  { name: "Vikram Singh", city: "Delhi", rating: 4, text: "Great food and wonderful service. The Lamb Rogan Josh was authentic and flavorful. Slightly long wait on weekends but totally worth it." },
];

const galleryImages = [
  { src: "https://placehold.co/600x400/1a1a1a/d4a017?text=Dish+1", alt: "Signature dish" },
  { src: "https://placehold.co/400x400/2a2a2a/d4a017?text=Ambience", alt: "Restaurant ambience" },
  { src: "https://placehold.co/400x600/1a1a1a/d4a017?text=Dessert", alt: "Dessert platter" },
  { src: "https://placehold.co/600x400/2a2a2a/d4a017?text=Cocktails", alt: "Cocktails" },
  { src: "https://placehold.co/400x400/1a1a1a/d4a017?text=Interior", alt: "Interior" },
  { src: "https://placehold.co/600x400/2a2a2a/d4a017?text=Dish+2", alt: "Special dish" },
  { src: "https://placehold.co/400x600/1a1a1a/d4a017?text=Chef", alt: "Our chef" },
  { src: "https://placehold.co/600x400/2a2a2a/d4a017?text=Outdoor", alt: "Outdoor seating" },
  { src: "https://placehold.co/400x400/1a1a1a/d4a017?text=Bar", alt: "Bar area" },
];

const navLinks = ["Home", "Menu", "Gallery", "About", "Reserve", "Contact"];

export default function RestaurantTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Starters");

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');`}</style>

      {/* Demo Bar */}
      <div className="bg-[#d4a017] text-black text-xs text-center py-2 px-4 font-medium">
        <span className="opacity-70">This is a demo template by </span>
        <Link href="/demos" className="underline font-bold hover:opacity-80 transition-opacity">SecureCodeReviews</Link>
        <span className="opacity-70"> · </span>
        <Link href="/demos" className="underline opacity-70 hover:opacity-100">← View all templates</Link>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">
            <a href="#home" className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#d4a017] rounded-full flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-[#1a1a1a]" />
              </div>
              <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                <span className="text-[#d4a017]">Saffron</span> & Sage
              </span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-gray-300 hover:text-[#d4a017] transition-colors tracking-wide uppercase font-medium">
                  {link}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a href="#reserve" className="hidden sm:inline-flex bg-[#d4a017] hover:bg-[#c0941a] text-[#1a1a1a] text-sm font-bold px-5 py-2.5 rounded transition-colors tracking-wide uppercase">
                Reserve Table
              </a>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-300">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm text-gray-300 hover:text-[#d4a017] uppercase tracking-wide">
                  {link}
                </a>
              ))}
              <a href="#reserve" onClick={() => setMenuOpen(false)} className="block mt-3 bg-[#d4a017] text-[#1a1a1a] text-sm font-bold px-4 py-2.5 rounded text-center uppercase tracking-wide">
                Reserve Table
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section id="home" className="relative min-h-[85vh] flex items-center">
        <div className="absolute inset-0">
          <img src="https://placehold.co/1920x1080/0d0d0d/d4a017?text=Restaurant+Hero" alt="Restaurant" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <p className="text-[#d4a017] text-sm tracking-[0.3em] uppercase font-medium mb-4">
            ★ Fine Dining Experience ★
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight max-w-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Where Every Meal Is a <span className="text-[#d4a017]">Celebration</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mb-10 leading-relaxed">
            Experience the art of Indian cuisine with a modern twist. Fresh ingredients, bold flavors, and an ambience that makes every visit memorable.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#reserve" className="inline-flex items-center gap-2 bg-[#d4a017] hover:bg-[#c0941a] text-[#1a1a1a] font-bold px-7 py-3.5 rounded transition-colors tracking-wide uppercase text-sm">
              Reserve a Table
            </a>
            <a href="#menu" className="inline-flex items-center gap-2 border-2 border-[#d4a017] text-[#d4a017] hover:bg-[#d4a017] hover:text-[#1a1a1a] font-bold px-7 py-3.5 rounded transition-all tracking-wide uppercase text-sm">
              View Menu
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════ MENU ══════════════════════ */}
      <section id="menu" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#d4a017] text-sm tracking-[0.2em] uppercase font-medium mb-2">Discover</p>
            <h2 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Our Menu</h2>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {menuCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded text-sm font-medium tracking-wide uppercase transition-all ${
                  activeCategory === cat
                    ? "bg-[#d4a017] text-[#1a1a1a]"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu items */}
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4">
              {menuItems[activeCategory]?.map((item) => (
                <div key={item.name} className="flex items-start justify-between gap-4 p-5 bg-white/5 rounded-xl border border-white/5 hover:border-[#d4a017]/30 transition-colors group">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold group-hover:text-[#d4a017] transition-colors">{item.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                  </div>
                  <span className="text-[#d4a017] font-bold text-lg shrink-0" style={{ fontFamily: "'Playfair Display', serif" }}>{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chef's Special */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-r from-[#d4a017]/10 to-transparent border border-[#d4a017]/20 rounded-2xl p-8 overflow-hidden">
              <div className="absolute top-4 right-4 text-xs bg-[#d4a017] text-[#1a1a1a] px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                Chef&apos;s Special
              </div>
              <div className="grid sm:grid-cols-2 gap-8 items-center">
                <img src="https://placehold.co/400x300/2a2a2a/d4a017?text=Chef's+Special" alt="Chef's Special" className="rounded-xl w-full" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ChefHat className="h-5 w-5 text-[#d4a017]" />
                    <span className="text-[#d4a017] text-sm font-medium uppercase tracking-wide">Today&apos;s Pick</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Truffle Risotto</h3>
                  <p className="text-gray-400 mb-4 leading-relaxed">Creamy Arborio rice slow-cooked with wild mushrooms, finished with fresh truffle oil and aged Parmesan. A symphony of earthy flavors.</p>
                  <p className="text-2xl font-bold text-[#d4a017]" style={{ fontFamily: "'Playfair Display', serif" }}>₹699</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ GALLERY ══════════════════════ */}
      <section id="gallery" className="py-20 bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#d4a017] text-sm tracking-[0.2em] uppercase font-medium mb-2">Visual Feast</p>
            <h2 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Gallery</h2>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {galleryImages.map((img, i) => (
              <div key={i} className="break-inside-avoid group overflow-hidden rounded-xl">
                <img src={img.src} alt={img.alt} className="w-full group-hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ ABOUT ══════════════════════ */}
      <section id="about" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#d4a017] text-sm tracking-[0.2em] uppercase font-medium mb-4">Our Story</p>
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>A Legacy of Flavor Since 2010</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Saffron & Sage was born from a simple passion — to bring people together over extraordinary food. Founded in 2010, we&apos;ve spent over a decade perfecting the art of Indian cuisine with a contemporary twist.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Our kitchen is led by Chef Arjun Malhotra, an alumnus of the Culinary Institute of India, who brings 20 years of experience from Michelin-starred restaurants across Europe and Asia. Every dish tells a story of heritage, innovation, and love for food.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#d4a017]" style={{ fontFamily: "'Playfair Display', serif" }}>14</p>
                  <p className="text-xs text-gray-500 mt-1">Years</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#d4a017]" style={{ fontFamily: "'Playfair Display', serif" }}>50K+</p>
                  <p className="text-xs text-gray-500 mt-1">Happy Guests</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#d4a017]" style={{ fontFamily: "'Playfair Display', serif" }}>4.8★</p>
                  <p className="text-xs text-gray-500 mt-1">Rated</p>
                </div>
              </div>
            </div>
            <img src="https://placehold.co/600x500/2a2a2a/d4a017?text=About+Us" alt="About Saffron & Sage" className="rounded-2xl w-full" />
          </div>
        </div>
      </section>

      {/* ══════════════════════ REVIEWS ══════════════════════ */}
      <section className="py-20 bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#d4a017] text-sm tracking-[0.2em] uppercase font-medium mb-2">Reviews</p>
            <h2 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>What Our Guests Say</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#d4a017]/30 transition-colors">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? "text-[#d4a017] fill-[#d4a017]" : "text-gray-600"}`} />
                  ))}
                </div>
                <p className="text-gray-300 mb-5 leading-relaxed italic">&ldquo;{r.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/10">
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ RESERVATION FORM ══════════════════════ */}
      <section id="reserve" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-[#d4a017] text-sm tracking-[0.2em] uppercase font-medium mb-4">Reservations</p>
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Reserve Your Table</h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Secure your spot for an unforgettable dining experience. For parties of 8 or more, please call us directly.
              </p>

              {/* Opening Hours */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#d4a017]" /> Opening Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Monday – Sunday</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Lunch</span><span className="text-white font-medium">12:00 PM – 3:00 PM</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Dinner</span><span className="text-white font-medium">7:00 PM – 11:00 PM</span></div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-[#d4a017]" /> +91 99999 99999
              </div>
            </div>

            {/* Reservation Form (Formspree) */}
            <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                  <input type="text" name="name" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-[#d4a017] focus:border-transparent outline-none" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone *</label>
                  <input type="tel" name="phone" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-[#d4a017] focus:border-transparent outline-none" placeholder="+91 99999 99999" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Date *</label>
                  <input type="date" name="date" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-[#d4a017] focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Time *</label>
                  <select name="time" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-[#d4a017] focus:border-transparent outline-none">
                    <option value="">Select time...</option>
                    {["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM"].map((t) => (
                      <option key={t} value={t} className="bg-[#1a1a1a]">{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Number of Guests *</label>
                <select name="guests" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-[#d4a017] focus:border-transparent outline-none">
                  <option value="">Select...</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n} className="bg-[#1a1a1a]">{n} {n === 1 ? "Guest" : "Guests"}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Special Requests</label>
                <textarea name="requests" rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-[#d4a017] focus:border-transparent outline-none resize-none" placeholder="Birthday celebration, dietary requirements, seating preference..." />
              </div>
              <button type="submit" className="w-full bg-[#d4a017] hover:bg-[#c0941a] text-[#1a1a1a] font-bold py-3.5 rounded-lg transition-colors uppercase tracking-wide">
                Reserve Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════ MAP ══════════════════════ */}
      <section id="contact" className="py-20 bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#d4a017] text-sm tracking-[0.2em] uppercase font-medium mb-2">Location</p>
            <h2 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Find Us</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              {[
                { icon: MapPin, label: "Address", value: "Saffron & Sage, 42 Gourmet Lane,\nBandra West, Mumbai – 400050" },
                { icon: Phone, label: "Reservations", value: "+91 99999 99999" },
                { icon: Mail, label: "Email", value: "hello@saffronandsage.com" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-[#d4a017] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-sm text-gray-400 whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="lg:col-span-2">
              {/*
                GOOGLE MAPS EMBED:
                Replace the src with your restaurant's Google Maps embed URL.
              */}
              <div className="rounded-xl overflow-hidden h-72 lg:h-80 border border-white/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.14571458693!2d72.71637258436986!3d19.08219783259688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1711111111111"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Restaurant Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="bg-[#0d0d0d] border-t border-white/10 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                <span className="text-[#d4a017]">Saffron</span> & Sage
              </span>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                Where every meal is a celebration of flavors, tradition, and togetherness.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Navigation</h4>
              <ul className="space-y-2.5">
                {navLinks.map((l) => (
                  <li key={l}><a href={`#${l.toLowerCase()}`} className="text-sm text-gray-500 hover:text-[#d4a017] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Contact</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li>+91 99999 99999</li>
                <li>hello@saffronandsage.com</li>
                <li>42 Gourmet Lane, Bandra West</li>
                <li>Mumbai – 400050</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Follow Us</h4>
              <div className="flex gap-3">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="h-10 w-10 bg-white/5 hover:bg-[#d4a017] rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1a1a1a] transition-all">
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-10 pt-8 text-center text-xs text-gray-600">
            © 2026 Saffron & Sage. All rights reserved. | Built with ❤️ by SecureCodeReviews
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
