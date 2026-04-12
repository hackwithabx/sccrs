"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, Scissors, Sparkles, Heart, Flower2, Droplets, Sun, CheckCircle2, ArrowRight } from "lucide-react";

const services = [
  {icon:Scissors,title:"Artisan Hair",desc:"Celebrity-inspired cuts, vivid colors, silk press, smoothing treatments & extensions.",price:"From ₹1,199"},
  {icon:Sparkles,title:"Glow Facials",desc:"Glass skin facial, vitamin C infusion, meso-glow therapy & Korean sheet masks.",price:"From ₹1,999"},
  {icon:Droplets,title:"Nail Atelier",desc:"Cat-eye gel, French ombre, 3D nail art, paraffin treatments & spa pedicures.",price:"From ₹899"},
  {icon:Sun,title:"Bridal Studio",desc:"Ethereal bridal looks — soft glam, dewy skin, floral updos. Pre-bridal packages from 3 months out.",price:"From ₹35,000"},
  {icon:Heart,title:"Wellness Spa",desc:"Lavender body wraps, Moroccan hammam, couples massage & aromatherapy sessions.",price:"From ₹3,499"},
  {icon:Flower2,title:"Beauty Lounge",desc:"Lash lifts, brow lamination, microblading, permanent makeup & dermaplaning.",price:"From ₹2,499"},
];
const reviews = [{name:"Isha Verma",text:"Lavande is like walking into a dream. The lavender scent, the soft music, the gentle hands — I always leave feeling like a new person.",stars:5},{name:"Tanvi Reddy",text:"My engagement look by Lavande was magical. Soft, dewy, ethereal. Exactly what I wanted. Every photo came out like a painting.",stars:5},{name:"Rhea Bajaj",text:"The Korean glass skin facial is life-changing. I've been going monthly for a year and my skin has never been this clear.",stars:5}];
const navLinks = ["Home","Services","Story","Reviews","Visit"];

export default function SalonV3() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#faf8ff] text-gray-900">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>

      <div className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white text-xs text-center py-2.5 px-4" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:opacity-100">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#faf8ff]/95 backdrop-blur-xl border-b border-purple-100/50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2"><Flower2 className="h-6 w-6 text-[#7c3aed]"/><div><span className="text-2xl font-semibold text-[#7c3aed]" style={{fontFamily:"'Cormorant Garamond',serif"}}>Lavande</span><span className="block text-[8px] text-gray-400 tracking-[0.15em] uppercase -mt-1" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Beauty · Wellness · Joy</span></div></a>
          <div className="hidden md:flex items-center gap-1" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-500 hover:text-[#7c3aed] px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}><a href="#visit" className="hidden sm:inline-flex bg-[#7c3aed] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 transition-all">Book Visit</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-purple-50" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-gray-500 hover:text-[#7c3aed]">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ede9fe] via-[#faf8ff] to-[#f5f3ff]"/>
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl" style={{animation:"float 7s ease-in-out infinite"}}/>
        <div className="absolute bottom-10 right-10 w-52 h-52 bg-violet-300/15 rounded-full blur-3xl"/>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-[#7c3aed] px-4 py-2 rounded-full text-sm font-semibold mb-8" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}><Sparkles className="h-4 w-4"/>Jaipur&apos;s Most Aesthetic Salon</div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] mb-6 text-gray-900" style={{fontFamily:"'Cormorant Garamond',serif"}}>Beauty is a<br/><span className="italic text-[#7c3aed]">feeling</span></h1>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>A sanctuary of beauty & wellness in the Pink City. Artisan haircare, Korean skincare rituals, and bridal transformations — all in a space designed to make you feel extraordinary.</p>
            <div className="flex flex-wrap gap-4" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              <a href="#visit" className="inline-flex items-center gap-2 bg-[#7c3aed] text-white font-bold px-8 py-4 rounded-full shadow-xl shadow-purple-500/20 hover:-translate-y-0.5 transition-all text-sm">Book Your Experience <ArrowRight className="h-4 w-4"/></a>
              <a href="#services" className="inline-flex items-center gap-2 text-gray-700 font-semibold px-8 py-4 rounded-full border border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 text-sm transition-all">What We Do</a>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-12" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{[{v:"8,000+",l:"Happy Clients"},{v:"4.9★",l:"Google Rating"},{v:"6 Years",l:"Of Beauty"}].map(s=><div key={s.l} className="text-center"><p className="text-xl font-extrabold text-[#7c3aed]">{s.v}</p><p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{s.l}</p></div>)}</div>
          </div>
          <div className="relative hidden lg:block">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-purple-200/50 border-4 border-white rotate-1 hover:rotate-0 transition-transform duration-500"><img src="https://placehold.co/550x650/ede9fe/7c3aed?text=Lavande" alt="Lavande Salon" className="w-full"/></div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><span className="text-[#7c3aed] text-xs tracking-[0.2em] uppercase font-bold" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>What We Do</span><h2 className="text-3xl sm:text-4xl font-semibold mt-2" style={{fontFamily:"'Cormorant Garamond',serif"}}>Our Rituals</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {services.map(s=><div key={s.title} className="group bg-gradient-to-br from-[#faf8ff] to-white rounded-2xl p-7 border border-purple-100/50 hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1 transition-all duration-300"><div className="flex items-center justify-between mb-4"><s.icon className="h-8 w-8 text-[#7c3aed] group-hover:scale-110 transition-transform"/><span className="text-xs text-[#7c3aed] font-bold bg-purple-500/10 px-3 py-1 rounded-full">{s.price}</span></div><h3 className="text-lg font-bold mb-2" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.25rem"}}>{s.title}</h3><p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p></div>)}
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="py-24 bg-gradient-to-br from-[#ede9fe] to-[#faf8ff]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-purple-200/30 -rotate-1"><img src="https://placehold.co/550x500/ede9fe/7c3aed?text=Our+Space" alt="Our Space" className="w-full"/></div>
          <div>
            <span className="text-[#7c3aed] text-xs tracking-[0.2em] uppercase font-bold" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Our Story</span>
            <h2 className="text-3xl font-semibold mt-2 mb-4" style={{fontFamily:"'Cormorant Garamond',serif"}}>Born from a Love of Beauty</h2>
            <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            <p className="text-gray-600 leading-relaxed mb-4">Lavande was founded in 2019 by Ananya Rathore — a Seoul-trained beauty artist who fell in love with Korean skincare during her years in South Korea. She brought that philosophy back to Jaipur: gentle, effective, and deeply personal.</p>
            <p className="text-gray-600 leading-relaxed mb-6">Our 3,500 sq ft studio in C-Scheme is designed as a calming retreat — lavender walls, natural light, indie playlists, and herbal tea on arrival. We use only cruelty-free, clean-beauty products.</p>
            <div className="space-y-2">{["Seoul-trained lead artist & Korean skincare specialist","100% cruelty-free & clean-beauty products","Innisfree, Sulwhasoo, Forest Essentials product partners","Private treatment suites for bridal & VIP clients","Featured in Times of India Jaipur & She magazine"].map(t=><div key={t} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="h-4 w-4 text-[#7c3aed] shrink-0"/>{t}</div>)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-3xl font-semibold" style={{fontFamily:"'Cormorant Garamond',serif"}}>Kind Words</h2></div>
          <div className="grid md:grid-cols-3 gap-5" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{reviews.map(r=><div key={r.name} className="bg-gradient-to-br from-[#faf8ff] to-white rounded-2xl p-7 border border-purple-100/50"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-[#7c3aed] fill-[#7c3aed]"/>)}</div><p className="text-sm text-gray-600 leading-relaxed mb-4 italic" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem"}}>&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-[#7c3aed]">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="py-24 bg-gradient-to-br from-[#ede9fe] to-[#faf8ff]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          <div className="text-center mb-10"><h2 className="text-3xl font-semibold mb-3" style={{fontFamily:"'Cormorant Garamond',serif"}}>Visit Lavande</h2><p className="text-gray-500">Walk-ins welcome · Appointments preferred for weekends</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white rounded-3xl p-7 sm:p-10 shadow-xl shadow-purple-100/50 border border-purple-50">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold mb-1.5">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-[#faf8ff] border border-purple-100 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Your name"/></div><div><label className="block text-sm font-semibold mb-1.5">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-[#faf8ff] border border-purple-100 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold mb-1.5">Email</label><input type="email" name="email" className="w-full px-4 py-3 bg-[#faf8ff] border border-purple-100 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="you@email.com"/></div><div><label className="block text-sm font-semibold mb-1.5">Ritual *</label><select name="service" required className="w-full px-4 py-3 bg-[#faf8ff] border border-purple-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"><option value="">Select...</option>{["Artisan Hair","Glow Facials","Nail Atelier","Bridal Studio","Wellness Spa","Beauty Lounge"].map(p=><option key={p} value={p}>{p}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold mb-1.5">Message</label><textarea name="message" rows={3} className="w-full px-4 py-3 bg-[#faf8ff] border border-purple-100 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none resize-none" placeholder="Preferred date/time or anything special..."/></div>
            <button type="submit" className="w-full bg-[#7c3aed] text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20">Book Appointment</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e1b4b] text-white py-12" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2"><Flower2 className="h-5 w-5 text-[#a78bfa]"/><span className="font-semibold text-lg" style={{fontFamily:"'Cormorant Garamond',serif"}}>Lavande</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>C-Scheme, Jaipur</span><span><Clock className="h-3.5 w-3.5 inline mr-1"/>10 AM – 8 PM</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 99999 99999</span></div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-8">© 2026 Lavande Beauty · Built by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
