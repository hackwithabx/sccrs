"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, Building2, Home, TrendingUp, Shield, Users, Bed, Bath, Maximize, Heart, ArrowRight, Crown } from "lucide-react";

const properties = [
  {title:"The Imperial Residences",loc:"Altamount Road, Mumbai",price:"₹45 Cr",beds:6,baths:7,sqft:"9,200",tag:"Ultra Prime",img:"https://placehold.co/600x400/faf8f5/b8860b?text=Imperial"},
  {title:"Oceanfront Penthouse",loc:"Nariman Point",price:"₹18 Cr",beds:4,baths:4,sqft:"4,500",tag:"Sea View",img:"https://placehold.co/600x400/faf8f5/b8860b?text=Oceanfront"},
  {title:"Heritage Mansion",loc:"Cuffe Parade",price:"₹28 Cr",beds:5,baths:6,sqft:"6,800",tag:"Heritage",img:"https://placehold.co/600x400/faf8f5/b8860b?text=Heritage"},
  {title:"Sky Garden Duplex",loc:"Worli Sea Link View",price:"₹12 Cr",beds:4,baths:4,sqft:"3,400",tag:"Signature",img:"https://placehold.co/600x400/faf8f5/b8860b?text=Sky+Garden"},
  {title:"Artisan Penthouse",loc:"Prabhadevi",price:"₹9.5 Cr",beds:3,baths:3,sqft:"2,600",tag:"Art Deco",img:"https://placehold.co/600x400/faf8f5/b8860b?text=Artisan"},
  {title:"The Horizon Suite",loc:"BKC Premium Tower",price:"₹6.8 Cr",beds:3,baths:3,sqft:"2,200",tag:"Investment",img:"https://placehold.co/600x400/faf8f5/b8860b?text=Horizon"},
];
const reviews = [{name:"Aditi Ambani",text:"Maison found our Altamount Road home with flawless discretion. The white-glove experience is unmatched in India.",stars:5},{name:"Rajan Oberoi",text:"They understand ultra-luxury. The curated shortlist, private viewings, and post-sale concierge — everything was extraordinary.",stars:5},{name:"Natasha Birla",text:"International-standard service for discerning buyers. Maison is the only name I recommend for premium Mumbai realty.",stars:5}];
const navLinks = ["Home","Portfolio","Concierge","About","Enquire"];

export default function RealEstateV3() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        h1,h2,h3,.serif{font-family:'Cormorant Garamond',serif} *{font-family:'Inter',system-ui,sans-serif}`}</style>

      <div className="bg-[#b8860b]/10 text-[#b8860b] text-xs text-center py-2.5 px-4 border-b border-[#b8860b]/10">
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:text-[#1a1a1a]">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#faf8f5]/95 backdrop-blur-xl border-b border-[#1a1a1a]/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2.5"><Crown className="h-6 w-6 text-[#b8860b]"/><div><span className="text-xl font-bold serif text-[#1a1a1a]">Maison</span><span className="block text-[8px] text-[#b8860b] tracking-[0.3em] uppercase -mt-0.5 font-semibold">Luxury Realty</span></div></a>
          <div className="hidden md:flex items-center gap-6">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-xs text-[#888] hover:text-[#b8860b] tracking-[0.1em] uppercase transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3"><a href="#enquire" className="hidden sm:inline-flex bg-[#1a1a1a] text-white text-xs font-bold px-6 py-2.5 rounded-full hover:-translate-y-0.5 transition-all tracking-wider uppercase">Private Viewing</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-[#888]"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-[#1a1a1a]/5">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-xs text-[#888] hover:text-[#b8860b] tracking-wider uppercase">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0"><img src="https://placehold.co/1920x1080/e8e0d4/b8860b?text=Luxury+Living" alt="Luxury" className="w-full h-full object-cover"/><div className="absolute inset-0 bg-gradient-to-r from-[#faf8f5] via-[#faf8f5]/90 to-[#faf8f5]/30"/></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-8"><div className="h-px w-12 bg-[#b8860b]"/><span className="text-[#b8860b] text-xs tracking-[0.25em] uppercase font-semibold">Est. 2008 · South Mumbai</span></div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold serif leading-[1.05] mb-6">The Art of<br/><em className="text-[#b8860b]">Luxury</em> Living</h1>
            <p className="text-lg text-[#888] mb-10 leading-relaxed max-w-lg">Exclusive access to Mumbai&apos;s most prestigious addresses. Discreet, personalized service for distinguished buyers and sellers.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#enquire" className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white font-bold px-8 py-4 rounded-full hover:-translate-y-0.5 transition-all text-sm tracking-wide">Schedule Private Viewing</a>
              <a href="#portfolio" className="inline-flex items-center gap-2 text-[#1a1a1a] font-semibold px-8 py-4 rounded-full border-2 border-[#1a1a1a]/10 hover:border-[#b8860b] transition-all text-sm">View Portfolio</a>
            </div>
            <div className="flex gap-10 mt-14">{[{v:"₹5,000Cr+",l:"Portfolio Value"},{v:"200+",l:"Exclusive Sales"},{v:"17",l:"Years Legacy"}].map(s=><div key={s.l}><p className="text-2xl font-bold text-[#b8860b] serif">{s.v}</p><p className="text-[10px] text-[#aaa] uppercase tracking-wider">{s.l}</p></div>)}</div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><div className="flex items-center justify-center gap-3 mb-3"><div className="h-px w-8 bg-[#b8860b]"/><span className="text-[#b8860b] text-xs tracking-[0.2em] uppercase font-semibold">Curated Collection</span><div className="h-px w-8 bg-[#b8860b]"/></div><h2 className="text-4xl font-bold serif">Featured Portfolio</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p=><div key={p.title} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-[#1a1a1a]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative overflow-hidden"><img src={p.img} alt={p.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"/><span className="absolute top-3 left-3 bg-[#b8860b] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">{p.tag}</span><button className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full hover:bg-white transition-all"><Heart className="h-4 w-4 text-gray-400"/></button></div>
              <div className="p-6"><h3 className="font-bold text-xl serif mb-1">{p.title}</h3><p className="text-sm text-[#888] flex items-center gap-1 mb-4"><MapPin className="h-3.5 w-3.5"/>{p.loc}</p><div className="flex gap-4 text-xs text-[#aaa] mb-4 pb-4 border-b border-[#1a1a1a]/5"><span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5"/>{p.beds} Bed</span><span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5"/>{p.baths} Bath</span><span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5"/>{p.sqft} sqft</span></div><div className="flex items-center justify-between"><span className="text-2xl font-bold text-[#b8860b] serif">{p.price}</span><a href="#enquire" className="text-xs font-bold text-[#1a1a1a] hover:text-[#b8860b] transition-colors uppercase tracking-wider">Enquire →</a></div></div>
            </div>)}
          </div>
        </div>
      </section>

      {/* Concierge */}
      <section id="concierge" className="py-24 bg-[#1a1a1a] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><span className="text-[#b8860b] text-xs tracking-[0.2em] uppercase font-semibold">White-Glove Service</span><h2 className="text-4xl font-bold serif mt-3">Concierge Services</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[{icon:Crown,t:"Private Viewings",d:"Exclusive, by-appointment-only property tours"},{icon:Shield,t:"Legal & Compliance",d:"RERA verification, title search, complete due diligence"},{icon:TrendingUp,t:"Investment Advisory",d:"Portfolio strategy, ROI analysis, market intelligence"},{icon:Home,t:"Interior Design",d:"Partner architects and interior designers on-call"}].map(s=><div key={s.t} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#b8860b]/30 transition-all group"><s.icon className="h-7 w-7 text-[#b8860b] mb-4 group-hover:scale-110 transition-transform"/><h3 className="font-bold text-sm mb-2 serif text-lg">{s.t}</h3><p className="text-xs text-gray-400 leading-relaxed">{s.d}</p></div>)}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6"><div className="h-px w-8 bg-[#b8860b]"/><span className="text-[#b8860b] text-xs tracking-[0.2em] uppercase font-semibold">Principal Advisor</span></div>
            <h2 className="text-4xl font-bold serif mb-4">Kavita Singhania</h2>
            <p className="text-sm text-[#b8860b] font-semibold mb-4">Founder · RERA Registered · Former Sotheby&apos;s International</p>
            <p className="text-[#888] leading-relaxed mb-4">With 17 years of experience and a portfolio exceeding ₹5,000 Cr, Kavita Singhania is South Mumbai&apos;s most trusted luxury real estate advisor. Her client list includes industrialists, diplomats, and global HNIs.</p>
            <p className="text-[#888] leading-relaxed mb-6">Previously with Sotheby&apos;s International Realty, London. MBA from London Business School. Featured in Forbes, ET Panache, and Architectural Digest.</p>
            <div className="flex gap-6">{[{v:"17+",l:"Years"},{v:"200+",l:"Sales"},{v:"₹5,000Cr",l:"Portfolio"}].map(s=><div key={s.l}><p className="text-xl font-bold text-[#b8860b] serif">{s.v}</p><p className="text-[10px] text-[#aaa] uppercase tracking-wider">{s.l}</p></div>)}</div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl"><img src="https://placehold.co/600x600/e8e0d4/b8860b?text=Kavita+Singhania" alt="Kavita" className="w-full"/></div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-[#f0ebe2]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-4xl font-bold serif">Client Testimonials</h2></div>
          <div className="grid md:grid-cols-3 gap-5">{reviews.map(r=><div key={r.name} className="bg-white rounded-2xl p-7 shadow-sm"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-[#b8860b] fill-[#b8860b]"/>)}</div><p className="text-sm text-[#888] leading-relaxed mb-4 italic serif text-base">&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-[#b8860b]">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquire" className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-4xl font-bold serif mb-3">Private Enquiry</h2><p className="text-[#888]">All enquiries are handled with complete confidentiality.</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white rounded-3xl p-7 sm:p-10 shadow-lg border border-[#1a1a1a]/5">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 tracking-wider uppercase">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-[#faf8f5] border border-[#1a1a1a]/10 rounded-xl text-sm placeholder-[#aaa] focus:ring-2 focus:ring-[#b8860b] outline-none" placeholder="Full name"/></div><div><label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 tracking-wider uppercase">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-[#faf8f5] border border-[#1a1a1a]/10 rounded-xl text-sm placeholder-[#aaa] focus:ring-2 focus:ring-[#b8860b] outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 tracking-wider uppercase">Email</label><input type="email" name="email" className="w-full px-4 py-3 bg-[#faf8f5] border border-[#1a1a1a]/10 rounded-xl text-sm placeholder-[#aaa] focus:ring-2 focus:ring-[#b8860b] outline-none" placeholder="you@email.com"/></div><div><label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 tracking-wider uppercase">Budget</label><select name="budget" className="w-full px-4 py-3 bg-[#faf8f5] border border-[#1a1a1a]/10 rounded-xl text-sm focus:ring-2 focus:ring-[#b8860b] outline-none"><option value="">Select...</option>{["₹5Cr–₹10Cr","₹10Cr–₹25Cr","₹25Cr–₹50Cr","₹50Cr+"].map(b=><option key={b} value={b}>{b}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 tracking-wider uppercase">Requirements</label><textarea name="message" rows={3} className="w-full px-4 py-3 bg-[#faf8f5] border border-[#1a1a1a]/10 rounded-xl text-sm placeholder-[#aaa] focus:ring-2 focus:ring-[#b8860b] outline-none resize-none" placeholder="Preferred locations, style, special requirements..."/></div>
            <button type="submit" className="w-full bg-[#1a1a1a] text-white font-bold py-4 rounded-xl hover:bg-[#b8860b] transition-all tracking-wider uppercase text-sm">Submit Private Enquiry</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2"><Crown className="h-5 w-5 text-[#b8860b]"/><span className="font-bold serif text-xl">Maison Luxury Realty</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>Altamount Road, Mumbai</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 99999 99999</span></div>
        </div>
        <p className="text-center text-[10px] text-gray-700 mt-8 tracking-wider uppercase">© 2026 Maison Luxury Realty · Built by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
