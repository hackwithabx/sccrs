"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, ChevronRight, MessageCircle, Building2, Home, TrendingUp, Shield, Users, Search, Bed, Bath, Maximize, Heart, ArrowRight, Instagram, Facebook, Linkedin } from "lucide-react";

const properties = [
  {title:"Skyline Penthouse",loc:"Bandra West, Mumbai",price:"₹8.5 Cr",beds:4,baths:4,sqft:"3,200",tag:"Premium",img:"https://placehold.co/600x400/1a2332/3b82f6?text=Penthouse"},
  {title:"Sea-View Apartment",loc:"Worli Sea Face",price:"₹5.2 Cr",beds:3,baths:3,sqft:"2,100",tag:"New",img:"https://placehold.co/600x400/1a2332/3b82f6?text=Sea+View"},
  {title:"Garden Villa",loc:"Juhu, Mumbai",price:"₹12 Cr",beds:5,baths:5,sqft:"4,800",tag:"Luxury",img:"https://placehold.co/600x400/1a2332/3b82f6?text=Villa"},
  {title:"Smart Studio",loc:"Andheri East",price:"₹95 L",beds:1,baths:1,sqft:"650",tag:"Hot Deal",img:"https://placehold.co/600x400/1a2332/3b82f6?text=Studio"},
  {title:"Duplex Loft",loc:"Lower Parel",price:"₹3.8 Cr",beds:3,baths:2,sqft:"1,800",tag:"Featured",img:"https://placehold.co/600x400/1a2332/3b82f6?text=Duplex"},
  {title:"Heritage Bungalow",loc:"Malabar Hill",price:"₹25 Cr",beds:6,baths:7,sqft:"8,500",tag:"Exclusive",img:"https://placehold.co/600x400/1a2332/3b82f6?text=Bungalow"},
];
const reviews = [{name:"Vikram Mehta",text:"Purchased our dream home through Prestige. Rajesh's market knowledge and negotiation skills saved us ₹40 lakhs.",stars:5},{name:"Ananya Joshi",text:"Sold our property 20% above market rate. The digital marketing strategy and staging advice were game-changers.",stars:5},{name:"Rahul Sharma",text:"From NRI documentation to possession — Prestige handled everything seamlessly. Truly white-glove service.",stars:5}];
const stats = [{v:"500+",l:"Properties Sold"},{v:"₹2,000Cr+",l:"Transactions"},{v:"15+",l:"Years Trust"},{v:"4.9★",l:"Client Rating"}];
const navLinks = ["Home","Properties","About","Reviews","Contact"];

export default function RealEstateV1() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}.float{animation:float 6s ease-in-out infinite}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      <div className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white text-xs text-center py-2.5 px-4">
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:opacity-100">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2"><div className="h-9 w-9 bg-gradient-to-br from-[#1e40af] to-[#3b82f6] rounded-xl flex items-center justify-center"><Building2 className="h-4 w-4 text-white"/></div><div><span className="text-lg font-extrabold bg-gradient-to-r from-[#1e40af] to-[#3b82f6] bg-clip-text text-transparent">Prestige</span><span className="block text-[8px] text-gray-400 tracking-[0.2em] uppercase -mt-0.5">Realty Group</span></div></a>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-500 hover:text-[#1e40af] px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3"><a href="tel:+919999999999" className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all"><Phone className="h-3.5 w-3.5"/>Call Now</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-gray-100">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-gray-500 hover:text-[#1e40af]">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative py-20 sm:py-28 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"/>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"/>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-8"><TrendingUp className="h-4 w-4"/>Mumbai&apos;s #1 Luxury Realty</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">Find Your <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Dream Home</span> in Mumbai</h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">15+ years of trust. 500+ premium properties sold. Your journey to the perfect home starts here.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#properties" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 transition-all text-sm">View Properties <ArrowRight className="h-4 w-4"/></a>
              <a href="#contact" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 hover:bg-white/5 transition-all text-sm">Free Consultation</a>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16">{stats.map(s=><div key={s.l} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 text-center"><p className="text-xl font-extrabold text-blue-400">{s.v}</p><p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{s.l}</p></div>)}</div>
        </div>
      </section>

      {/* Properties */}
      <section id="properties" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><span className="text-blue-600 text-xs tracking-[0.2em] uppercase font-bold">Featured Listings</span><h2 className="text-3xl sm:text-4xl font-extrabold mt-2">Premium Properties</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p=><div key={p.title} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative overflow-hidden"><img src={p.img} alt={p.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"/><span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">{p.tag}</span><button className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full hover:bg-white transition-all"><Heart className="h-4 w-4 text-gray-400"/></button></div>
              <div className="p-5"><h3 className="font-bold text-lg mb-1">{p.title}</h3><p className="text-sm text-gray-500 flex items-center gap-1 mb-3"><MapPin className="h-3.5 w-3.5"/>{p.loc}</p><div className="flex gap-3 text-xs text-gray-400 mb-4"><span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5"/>{p.beds} Bed</span><span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5"/>{p.baths} Bath</span><span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5"/>{p.sqft} sqft</span></div><div className="flex items-center justify-between"><span className="text-xl font-extrabold text-blue-600">{p.price}</span><a href="#contact" className="text-xs font-bold text-blue-600 hover:underline">Enquire →</a></div></div>
            </div>)}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="rounded-3xl overflow-hidden shadow-2xl"><img src="https://placehold.co/600x500/1a2332/3b82f6?text=Rajesh+Prestige" alt="Agent" className="w-full"/></div>
          <div>
            <span className="text-blue-600 text-xs tracking-[0.2em] uppercase font-bold">About</span>
            <h2 className="text-3xl font-extrabold mt-2 mb-4">Rajesh Malhotra</h2>
            <p className="text-sm text-blue-600 font-semibold mb-4">Founder & Principal Broker · RERA Certified</p>
            <p className="text-gray-600 leading-relaxed mb-4">With 15+ years in Mumbai&apos;s luxury real estate market, Rajesh has closed ₹2,000 Cr+ in transactions. His deep network, market intelligence, and client-first approach make him the most trusted name in South Mumbai realty.</p>
            <p className="text-gray-600 leading-relaxed mb-6">MBA from IIM Ahmedabad. Former VP at Knight Frank India. RERA-registered broker with impeccable track record.</p>
            <div className="flex gap-5">{[{icon:Shield,t:"RERA Certified"},{icon:TrendingUp,t:"₹2,000Cr+ Deals"},{icon:Users,t:"500+ Families"}].map(s=><div key={s.t} className="flex items-center gap-2 text-sm text-gray-600"><s.icon className="h-4 w-4 text-blue-600"/>{s.t}</div>)}</div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><h2 className="text-3xl font-extrabold">Our Services</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[{icon:Home,t:"Buy Property",d:"Premium residential & commercial listings across Mumbai"},{icon:TrendingUp,t:"Sell Property",d:"Maximum value realization with expert marketing & staging"},{icon:Search,t:"Property Search",d:"Curated shortlists based on your exact requirements"},{icon:Shield,t:"Legal & RERA",d:"End-to-end documentation, verification & compliance"}].map(s=><div key={s.t} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all"><s.icon className="h-8 w-8 text-blue-600 mb-3"/><h3 className="font-bold mb-2">{s.t}</h3><p className="text-sm text-gray-500 leading-relaxed">{s.d}</p></div>)}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-3xl font-extrabold">Client Testimonials</h2></div>
          <div className="grid md:grid-cols-3 gap-5">{reviews.map(r=><div key={r.name} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400"/>)}</div><p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-blue-600">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-3xl font-extrabold mb-3">Get in Touch</h2><p className="text-gray-500">Schedule a free consultation for buying, selling, or investing.</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-gray-50 border border-gray-100 rounded-3xl p-7 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold mb-1.5">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Your name"/></div><div><label className="block text-sm font-semibold mb-1.5">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold mb-1.5">Email</label><input type="email" name="email" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="you@email.com"/></div><div><label className="block text-sm font-semibold mb-1.5">Budget Range</label><select name="budget" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"><option value="">Select...</option>{["₹50L – ₹1Cr","₹1Cr – ₹3Cr","₹3Cr – ₹10Cr","₹10Cr+"].map(b=><option key={b} value={b}>{b}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold mb-1.5">Requirements</label><textarea name="message" rows={3} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Location preference, property type, timeline..."/></div>
            <button type="submit" className="w-full bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20">Send Enquiry</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2"><div className="h-8 w-8 bg-gradient-to-br from-[#1e40af] to-[#3b82f6] rounded-xl flex items-center justify-center"><Building2 className="h-4 w-4 text-white"/></div><span className="font-extrabold">Prestige Realty</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>South Mumbai</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 99999 99999</span></div>
          <div className="flex gap-3">{[Instagram,Facebook,Linkedin].map((Icon,i)=><a key={i} href="#" className="h-9 w-9 bg-white/5 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all"><Icon className="h-4 w-4"/></a>)}</div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-8">© 2026 Prestige Realty Group · Built by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
