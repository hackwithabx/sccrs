"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, ChevronRight, Building2, Home, TrendingUp, Shield, Users, Search, Bed, Bath, Maximize, Heart, ArrowRight, Zap } from "lucide-react";

const properties = [
  {title:"The Crown Penthouse",loc:"Bandra Bandstand",price:"₹15 Cr",beds:5,baths:5,sqft:"5,200",tag:"Ultra Luxury",img:"https://placehold.co/600x400/0f1419/10b981?text=Crown+Penthouse"},
  {title:"Azure Sky Residence",loc:"Worli Seaface",price:"₹7.5 Cr",beds:3,baths:3,sqft:"2,800",tag:"Sea View",img:"https://placehold.co/600x400/0f1419/10b981?text=Azure+Sky"},
  {title:"The Orchid Villa",loc:"Alibaug Beachfront",price:"₹9 Cr",beds:4,baths:4,sqft:"3,600",tag:"Beachfront",img:"https://placehold.co/600x400/0f1419/10b981?text=Orchid+Villa"},
  {title:"Metro Smart",loc:"BKC, Mumbai",price:"₹3.2 Cr",beds:2,baths:2,sqft:"1,400",tag:"Smart Home",img:"https://placehold.co/600x400/0f1419/10b981?text=Metro+Smart"},
  {title:"Heritage Manor",loc:"Malabar Hill",price:"₹22 Cr",beds:6,baths:6,sqft:"7,200",tag:"Heritage",img:"https://placehold.co/600x400/0f1419/10b981?text=Heritage+Manor"},
  {title:"Zen Garden Flat",loc:"Powai Hiranandani",price:"₹2.8 Cr",beds:3,baths:2,sqft:"1,600",tag:"Garden View",img:"https://placehold.co/600x400/0f1419/10b981?text=Zen+Garden"},
];
const reviews = [{name:"Priya Kapoor",text:"The AI-powered property matching is incredible. Found our perfect BKC apartment in 48 hours.",stars:5},{name:"Sameer Reddy",text:"Data-driven approach sets them apart. They showed us market analytics that helped negotiate 15% off.",stars:5},{name:"Nandita Patel",text:"From virtual tours to blockchain-verified docs, Nexus is the future of real estate in India.",stars:5}];
const navLinks = ["Home","Properties","Services","Team","Contact"];

export default function RealEstateV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0a0f14] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(16,185,129,0.15)}50%{box-shadow:0 0 40px rgba(16,185,129,0.3)}}.glow{animation:glow 3s ease-in-out infinite}`}</style>

      <div className="bg-emerald-500/10 text-emerald-400 text-xs text-center py-2.5 px-4 border-b border-emerald-500/10">
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:text-white">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#0a0f14]/90 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2"><div className="h-9 w-9 bg-emerald-500 rounded-lg glow flex items-center justify-center"><Zap className="h-4 w-4 text-black"/></div><div><span className="text-lg font-extrabold text-emerald-400">Nexus</span><span className="block text-[8px] text-gray-600 tracking-[0.2em] uppercase -mt-0.5">Prop-Tech Realty</span></div></a>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-500 hover:text-emerald-400 px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3"><a href="#contact" className="hidden sm:inline-flex bg-emerald-500 text-black text-sm font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all">Get Started</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-white/5">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-gray-500 hover:text-emerald-400">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl"/>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl"/>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold mb-8"><Zap className="h-3.5 w-3.5"/>AI-Powered Property Matching</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">Smart Real Estate<br/>for <span className="text-emerald-400">Smart Buyers</span></h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">Data-driven property search, AI valuations, virtual tours & blockchain-verified documentation. The future of real estate is here.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#properties" className="inline-flex items-center gap-2 bg-emerald-500 text-black font-bold px-8 py-4 rounded-lg shadow-xl shadow-emerald-500/20 hover:-translate-y-0.5 transition-all text-sm">Explore Properties <ArrowRight className="h-4 w-4"/></a>
              <a href="#contact" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-lg border border-white/20 hover:bg-white/5 text-sm transition-all">Book Demo</a>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-16">{[{v:"800+",l:"Properties"},{v:"₹3,500Cr",l:"Transactions"},{v:"12K+",l:"Happy Clients"},{v:"99%",l:"RERA Compliant"}].map(s=><div key={s.l} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center"><p className="text-xl font-extrabold text-emerald-400">{s.v}</p><p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">{s.l}</p></div>)}</div>
        </div>
      </section>

      {/* Properties */}
      <section id="properties" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><h2 className="text-3xl sm:text-4xl font-extrabold">Featured Properties</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map(p=><div key={p.title} className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all">
              <div className="relative overflow-hidden"><img src={p.img} alt={p.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"/><span className="absolute top-3 left-3 bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 rounded-full">{p.tag}</span></div>
              <div className="p-5"><h3 className="font-bold text-lg mb-1">{p.title}</h3><p className="text-sm text-gray-500 flex items-center gap-1 mb-3"><MapPin className="h-3.5 w-3.5"/>{p.loc}</p><div className="flex gap-3 text-xs text-gray-500 mb-4"><span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5"/>{p.beds} Bed</span><span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5"/>{p.baths} Bath</span><span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5"/>{p.sqft} sqft</span></div><div className="flex items-center justify-between"><span className="text-xl font-extrabold text-emerald-400">{p.price}</span><a href="#contact" className="text-xs font-bold text-emerald-400 hover:underline">View →</a></div></div>
            </div>)}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><h2 className="text-3xl font-extrabold">Tech-Powered Services</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[{icon:Search,t:"AI Property Match",d:"ML-powered shortlisting based on 50+ preference parameters"},{icon:TrendingUp,t:"Market Analytics",d:"Real-time price trends, ROI projections & investment insights"},{icon:Shield,t:"Verified Listings",d:"Blockchain-verified docs, RERA-checked, lawyer-approved"},{icon:Home,t:"Virtual Tours",d:"360° immersive walkthroughs from anywhere in the world"}].map(s=><div key={s.t} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 hover:border-emerald-500/20 transition-all"><s.icon className="h-8 w-8 text-emerald-400 mb-3"/><h3 className="font-bold mb-2 text-sm">{s.t}</h3><p className="text-xs text-gray-500 leading-relaxed">{s.d}</p></div>)}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="rounded-2xl overflow-hidden border border-white/10"><img src="https://placehold.co/600x500/0f1419/10b981?text=Arjun+CEO" alt="CEO" className="w-full"/></div>
          <div>
            <span className="text-emerald-400 text-xs tracking-[0.2em] uppercase font-bold">Leadership</span>
            <h2 className="text-3xl font-extrabold mt-2 mb-4">Arjun Deshmukh</h2>
            <p className="text-sm text-emerald-400 font-semibold mb-4">Co-founder & CEO · IIT-B, Stanford MBA</p>
            <p className="text-gray-400 leading-relaxed mb-4">Arjun left a VP role at Goldman Sachs to build Nexus — a platform that democratizes high-quality real estate intelligence for every Indian buyer.</p>
            <p className="text-gray-400 leading-relaxed">His vision: make property buying as seamless as booking a flight. No hidden costs, no information asymmetry, just transparent, tech-enabled transactions.</p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-3xl font-extrabold">Client Reviews</h2></div>
          <div className="grid md:grid-cols-3 gap-5">{reviews.map(r=><div key={r.name} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-emerald-500/20 transition-all"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-emerald-400 fill-emerald-400"/>)}</div><p className="text-sm text-gray-400 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-emerald-400">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-3xl font-extrabold mb-3">Contact Us</h2><p className="text-gray-500">Let our AI find your perfect property.</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-7 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Full name"/></div><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Email</label><input type="email" name="email" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="you@email.com"/></div><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Budget</label><select name="budget" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"><option value="">Select range...</option>{["₹50L–₹1Cr","₹1Cr–₹5Cr","₹5Cr–₹15Cr","₹15Cr+"].map(b=><option key={b} value={b}>{b}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold text-gray-300 mb-1.5">Requirements</label><textarea name="message" rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" placeholder="Preferred locations, BHK, amenities..."/></div>
            <button type="submit" className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20">Submit Enquiry</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2"><div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Zap className="h-4 w-4 text-black"/></div><span className="font-extrabold text-emerald-400">Nexus Realty</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>BKC, Mumbai</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 99999 99999</span></div>
        </div>
        <p className="text-center text-xs text-gray-700 mt-8">© 2026 Nexus Prop-Tech · Built by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
