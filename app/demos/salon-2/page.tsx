"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, Scissors, Sparkles, Heart, Flower2, Droplets, Sun, CheckCircle2, ArrowRight, Crown } from "lucide-react";

const services = [
  {icon:Scissors,title:"Couture Hair",desc:"Balayage, ombre, Japanese straightening, keratin smoothing & precision cuts by master stylists.",price:"From ₹2,499"},
  {icon:Sparkles,title:"Luxury Facials",desc:"Vampire facial, gold-infused HydraFacial, micro-needling & LED light therapy.",price:"From ₹3,499"},
  {icon:Droplets,title:"Nail Couture",desc:"Swarovski nail art, chrome nails, PolyGel extensions & luxury mani-pedi.",price:"From ₹1,299"},
  {icon:Sun,title:"Bridal Atelier",desc:"Multi-day bridal packages — engagement, mehndi, sangeet, wedding & reception looks.",price:"From ₹50,000"},
  {icon:Heart,title:"Signature Spa",desc:"Hot stone therapy, Balinese massage, gold body wrap & Turkish hammam rituals.",price:"From ₹4,999"},
  {icon:Crown,title:"VIP Makeup",desc:"Celebrity makeup artist, airbrush HD, editorial & red carpet looks.",price:"From ₹7,999"},
];
const reviews = [{name:"Anika Patel",text:"Every visit to Noir feels like a five-star experience. The dark, moody interiors and the personalized attention — I'm obsessed.",stars:5},{name:"Sanya Malhotra",text:"My wedding makeup by Noir was absolutely flawless. 16 hours, 40°C heat, and I still looked stunning in every photo.",stars:5},{name:"Divya Khanna",text:"The gold HydraFacial is worth every rupee. My skin literally glows for weeks after. This is the only salon I trust.",stars:5}];
const navLinks = ["Home","Services","About","Reviews","Reserve"];

export default function SalonV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(212,160,23,0.15)}50%{box-shadow:0 0 40px rgba(212,160,23,0.3)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      <div className="bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-black text-xs text-center py-2.5 px-4 font-semibold" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-bold hover:opacity-100">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#d4a017]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2"><Crown className="h-6 w-6 text-[#d4a017]"/><div><span className="text-lg font-bold text-white" style={{fontFamily:"'Cormorant Garamond',serif"}}>NOIR</span><span className="block text-[8px] text-[#d4a017] tracking-[0.25em] uppercase -mt-1" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Beauty Lounge</span></div></a>
          <div className="hidden md:flex items-center gap-1" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-500 hover:text-[#d4a017] px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}><a href="#reserve" className="hidden sm:inline-flex bg-[#d4a017] text-black text-sm font-bold px-5 py-2.5 rounded-full hover:-translate-y-0.5 transition-all">Reserve</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-white/5" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-gray-400 hover:text-[#d4a017]">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#d4a017]/5 to-transparent"/>
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#d4a017]/5 rounded-full blur-[100px]"/>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#d4a017]/10 border border-[#d4a017]/20 text-[#d4a017] px-4 py-2 rounded-full text-sm font-semibold mb-8" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}><Crown className="h-4 w-4"/>Mumbai&apos;s #1 Luxury Salon</div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6" style={{fontFamily:"'Cormorant Garamond',serif"}}>Indulge in<br/><span className="text-[#d4a017]">Opulence</span></h1>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Where world-class artistry meets uncompromising luxury. A curated beauty experience for the discerning few.</p>
          <div className="flex flex-wrap justify-center gap-4" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            <a href="#reserve" className="inline-flex items-center gap-2 bg-[#d4a017] text-black font-bold px-8 py-4 rounded-full shadow-xl shadow-[#d4a017]/20 hover:-translate-y-0.5 transition-all text-sm">Book Your Experience <ArrowRight className="h-4 w-4"/></a>
            <a href="#services" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 text-sm transition-all">Explore Services</a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">{[{v:"15,000+",l:"Clients Served"},{v:"4.9★",l:"Google Rating"},{v:"50+",l:"Wedding Makeups/Mo"},{v:"12 Years",l:"Of Excellence"}].map(s=><div key={s.l} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 text-center" style={{animation:"glow 4s ease-in-out infinite"}}><p className="text-xl font-extrabold text-[#d4a017]" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{s.v}</p><p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{s.l}</p></div>)}</div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><span className="text-[#d4a017] text-xs tracking-[0.25em] uppercase font-bold" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Our Craft</span><h2 className="text-3xl sm:text-4xl font-bold mt-2" style={{fontFamily:"'Cormorant Garamond',serif"}}>Signature Services</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {services.map(s=><div key={s.title} className="group bg-white/[0.03] backdrop-blur rounded-2xl p-7 border border-white/5 hover:border-[#d4a017]/30 hover:bg-[#d4a017]/5 transition-all duration-300"><div className="flex items-center justify-between mb-4"><s.icon className="h-7 w-7 text-[#d4a017] group-hover:scale-110 transition-transform"/><span className="text-xs text-[#d4a017] font-bold opacity-70">{s.price}</span></div><h3 className="text-lg font-bold mb-2 text-white" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.25rem"}}>{s.title}</h3><p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p></div>)}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="rounded-2xl overflow-hidden border border-white/10"><img src="https://placehold.co/550x500/1a1a1a/d4a017?text=NOIR+Lounge" alt="Noir Lounge" className="w-full"/></div>
          <div>
            <span className="text-[#d4a017] text-xs tracking-[0.25em] uppercase font-bold" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>The Story</span>
            <h2 className="text-3xl font-bold mt-2 mb-4" style={{fontFamily:"'Cormorant Garamond',serif"}}>A Legacy of Luxury</h2>
            <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            <p className="text-gray-400 leading-relaxed mb-4">Noir Beauty Lounge was born from a singular vision: to create a space where beauty is not a service, but an experience. Founded by Natasha Malhotra — Vidal Sassoon trained, ex-Lakme Fashion Week lead stylist — Noir has set the gold standard for luxury beauty in Mumbai since 2013.</p>
            <p className="text-gray-400 leading-relaxed mb-6">Our 5,000 sq ft Bandra flagship features private styling suites, a curated product library, and an in-house barista. Because great beauty deserves great coffee.</p>
            <div className="space-y-2">{["Vidal Sassoon & Toni&Guy trained lead stylists","Private styling suites for VIP clients","Curated product library: La Mer, Tom Ford, Charlotte Tilbury","Featured in Vogue, GQ, Cosmopolitan & Harper's Bazaar","3x winner — Best Luxury Salon, India Beauty Awards"].map(t=><div key={t} className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="h-4 w-4 text-[#d4a017] shrink-0"/>{t}</div>)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-3xl font-bold" style={{fontFamily:"'Cormorant Garamond',serif"}}>Client Testimonials</h2></div>
          <div className="grid md:grid-cols-3 gap-5" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{reviews.map(r=><div key={r.name} className="bg-white/[0.03] rounded-2xl p-7 border border-white/5"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-[#d4a017] fill-[#d4a017]"/>)}</div><p className="text-sm text-gray-400 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-[#d4a017]">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Reserve */}
      <section id="reserve" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          <div className="text-center mb-10"><h2 className="text-3xl font-bold mb-3" style={{fontFamily:"'Cormorant Garamond',serif"}}>Reserve Your Experience</h2><p className="text-gray-500">By appointment only · VIP walk-ins welcome</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white/[0.03] border border-white/10 rounded-3xl p-7 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold mb-1.5 text-gray-300">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-[#d4a017] outline-none" placeholder="Full name"/></div><div><label className="block text-sm font-semibold mb-1.5 text-gray-300">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-[#d4a017] outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold mb-1.5 text-gray-300">Email</label><input type="email" name="email" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-[#d4a017] outline-none" placeholder="you@email.com"/></div><div><label className="block text-sm font-semibold mb-1.5 text-gray-300">Service *</label><select name="service" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-[#d4a017] outline-none"><option value="">Select...</option>{["Couture Hair","Luxury Facials","Nail Couture","Bridal Atelier","Signature Spa","VIP Makeup"].map(p=><option key={p} value={p}>{p}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold mb-1.5 text-gray-300">Special Requests</label><textarea name="message" rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-[#d4a017] outline-none resize-none" placeholder="Preferred date/time, stylist, or occasion..."/></div>
            <button type="submit" className="w-full bg-[#d4a017] text-black font-bold py-4 rounded-xl">Reserve Now</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2"><Crown className="h-5 w-5 text-[#d4a017]"/><span className="font-bold text-white" style={{fontFamily:"'Cormorant Garamond',serif"}}>NOIR Beauty Lounge</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>Bandra West, Mumbai</span><span><Clock className="h-3.5 w-3.5 inline mr-1"/>11 AM – 9 PM</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 99999 99999</span></div>
        </div>
        <p className="text-center text-xs text-gray-700 mt-8">© 2026 Noir Beauty Lounge · Built by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
