"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, Scissors, Sparkles, Heart, Flower2, Droplets, Sun, CheckCircle2, ArrowRight } from "lucide-react";

const services = [
  {icon:Scissors,title:"Hair Styling",desc:"Precision cuts, blowouts, keratin treatments, balayage & global colors by trained stylists.",price:"From ₹999"},
  {icon:Sparkles,title:"Skin & Facials",desc:"HydraFacial, chemical peels, LED therapy, gold facials & anti-aging treatments.",price:"From ₹1,499"},
  {icon:Droplets,title:"Nail Art & Extensions",desc:"Gel nails, acrylics, nail art, pedicures & luxury hand treatments.",price:"From ₹799"},
  {icon:Sun,title:"Bridal Packages",desc:"Complete bridal makeup, mehndi, pre-bridal skincare & hair styling packages.",price:"From ₹25,000"},
  {icon:Heart,title:"Body Spa & Massage",desc:"Aromatherapy, hot stone, deep tissue massage & body wraps.",price:"From ₹2,499"},
  {icon:Flower2,title:"Makeup Studio",desc:"HD/Airbrush makeup, party looks, engagement & reception styling.",price:"From ₹3,499"},
];
const reviews = [{name:"Priya Sharma",text:"Aura is my happy place. The ambiance is gorgeous and my hairstylist Neha truly understands what I want every single time.",stars:5},{name:"Roshni Kapoor",text:"Got my bridal package done here — the makeup lasted 14 hours! Absolutely stunning work by the team. Highly recommend.",stars:5},{name:"Meera Jain",text:"The HydraFacial here is chef's kiss. My skin has never looked better. Clean, professional, and such a lovely space.",stars:5}];
const navLinks = ["Home","Services","About","Reviews","Book"];

export default function SalonV1() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
        @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>

      <div className="bg-gradient-to-r from-[#be185d] to-[#ec4899] text-white text-xs text-center py-2.5 px-4">
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:opacity-100">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-pink-100/50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2"><div className="h-9 w-9 bg-gradient-to-br from-[#be185d] to-[#f472b6] rounded-full flex items-center justify-center"><Sparkles className="h-4 w-4 text-white"/></div><div><span className="text-lg font-extrabold bg-gradient-to-r from-[#be185d] to-[#ec4899] bg-clip-text text-transparent">Aura</span><span className="block text-[8px] text-gray-400 tracking-[0.15em] uppercase -mt-0.5 font-bold">Salon & Spa</span></div></a>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-500 hover:text-[#be185d] px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3"><a href="#book" className="hidden sm:inline-flex bg-gradient-to-r from-[#be185d] to-[#ec4899] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-pink-500/20 hover:-translate-y-0.5 transition-all">Book Now</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-pink-50">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-gray-500 hover:text-[#be185d]">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative py-20 sm:py-28 bg-gradient-to-br from-[#fff1f2] via-white to-[#fdf2f8] overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" style={{animation:"float 6s ease-in-out infinite"}}/>
        <div className="absolute bottom-10 left-10 w-52 h-52 bg-rose-200/20 rounded-full blur-3xl"/>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-[#be185d] px-4 py-2 rounded-full text-sm font-semibold mb-8"><Sparkles className="h-4 w-4"/>South Delhi&apos;s Most Loved Salon</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 text-gray-900">Where Beauty<br/>Meets <span className="bg-gradient-to-r from-[#be185d] to-[#ec4899] bg-clip-text text-transparent">Luxury</span></h1>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed">Premium hair styling, skincare, bridal makeup & spa treatments. Trusted by 10,000+ women across Delhi NCR since 2016.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#book" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#be185d] to-[#ec4899] text-white font-bold px-8 py-4 rounded-full shadow-xl shadow-pink-500/20 hover:-translate-y-0.5 transition-all text-sm">Book Appointment <ArrowRight className="h-4 w-4"/></a>
              <a href="#services" className="inline-flex items-center gap-2 text-gray-700 font-semibold px-8 py-4 rounded-full border border-gray-200 hover:border-pink-200 hover:bg-pink-50/50 text-sm transition-all">Our Services</a>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-12">{[{v:"10,000+",l:"Happy Clients"},{v:"4.9★",l:"Google Rating"},{v:"8+ Years",l:"Experience"}].map(s=><div key={s.l} className="text-center"><p className="text-xl font-extrabold text-[#be185d]">{s.v}</p><p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{s.l}</p></div>)}</div>
          </div>
          <div className="relative hidden lg:block">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-pink-200/50 border-4 border-white"><img src="https://placehold.co/550x650/fdf2f8/be185d?text=Aura+Salon" alt="Aura Salon" className="w-full"/></div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-pink-100" style={{animation:"float 5s ease-in-out infinite"}}><div className="flex items-center gap-2"><div className="flex -space-x-2">{[1,2,3].map(i=><div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 border-2 border-white"/>)}</div><div><p className="text-xs font-bold">200+ Reviews</p><div className="flex gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400"/>)}</div></div></div></div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><span className="text-[#be185d] text-xs tracking-[0.2em] uppercase font-bold">What We Offer</span><h2 className="text-3xl sm:text-4xl font-extrabold mt-2">Our Services</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(s=><div key={s.title} className="group bg-gradient-to-br from-pink-50/50 to-white rounded-2xl p-7 border border-pink-100/50 hover:shadow-xl hover:shadow-pink-100/50 hover:-translate-y-1 transition-all duration-300"><div className="flex items-center justify-between mb-4"><s.icon className="h-8 w-8 text-[#be185d] group-hover:scale-110 transition-transform"/><span className="text-xs text-[#be185d] font-bold bg-pink-500/10 px-3 py-1 rounded-full">{s.price}</span></div><h3 className="text-lg font-bold mb-2">{s.title}</h3><p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p></div>)}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-gradient-to-br from-[#fff1f2] to-[#fdf2f8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-pink-200/30"><img src="https://placehold.co/550x500/fdf2f8/be185d?text=Our+Studio" alt="Studio" className="w-full"/></div>
          <div>
            <span className="text-[#be185d] text-xs tracking-[0.2em] uppercase font-bold">About Aura</span>
            <h2 className="text-3xl font-extrabold mt-2 mb-4">Founded by Passion, Driven by Perfection</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Aura Salon & Spa was founded in 2016 by Kavita Arora — a London-trained hair stylist and beauty expert with 15+ years of experience. What started as a small studio in GK-1 has grown into South Delhi&apos;s most celebrated salon.</p>
            <p className="text-gray-600 leading-relaxed mb-6">Our team of 25+ trained professionals uses only premium international products — Olaplex, Kérastase, MAC, Bobbi Brown — to deliver results that speak for themselves.</p>
            <div className="space-y-2">{["London School of Beauty certified lead stylist","Only premium products: Olaplex, MAC, Kérastase","CIDESCO-certified skincare therapists","5,000+ bridal makeovers completed","Featured in Vogue India & Femina"].map(t=><div key={t} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="h-4 w-4 text-[#be185d] shrink-0"/>{t}</div>)}</div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-3xl font-extrabold">Client Love</h2></div>
          <div className="grid md:grid-cols-3 gap-5">{reviews.map(r=><div key={r.name} className="bg-gradient-to-br from-pink-50/50 to-white rounded-2xl p-7 border border-pink-100/50"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-pink-500 fill-pink-500"/>)}</div><p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-[#be185d]">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Booking */}
      <section id="book" className="py-24 bg-gradient-to-br from-[#fff1f2] to-[#fdf2f8]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-3xl font-extrabold mb-3">Book Your Visit</h2><p className="text-gray-500">Walk-ins welcome · Appointments preferred</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white rounded-3xl p-7 sm:p-10 shadow-xl shadow-pink-100/50 border border-pink-50">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold mb-1.5">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-pink-50/30 border border-pink-100 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Your name"/></div><div><label className="block text-sm font-semibold mb-1.5">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-pink-50/30 border border-pink-100 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold mb-1.5">Email</label><input type="email" name="email" className="w-full px-4 py-3 bg-pink-50/30 border border-pink-100 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="you@email.com"/></div><div><label className="block text-sm font-semibold mb-1.5">Service *</label><select name="service" required className="w-full px-4 py-3 bg-pink-50/30 border border-pink-100 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"><option value="">Select...</option>{["Hair Styling","Skin & Facials","Nail Art","Bridal Packages","Body Spa & Massage","Makeup Studio"].map(p=><option key={p} value={p}>{p}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold mb-1.5">Message</label><textarea name="message" rows={3} className="w-full px-4 py-3 bg-pink-50/30 border border-pink-100 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-pink-500 outline-none resize-none" placeholder="Preferred date/time or special requests..."/></div>
            <button type="submit" className="w-full bg-gradient-to-r from-[#be185d] to-[#ec4899] text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/20">Book Appointment</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2"><div className="h-8 w-8 bg-gradient-to-r from-[#be185d] to-[#ec4899] rounded-full flex items-center justify-center"><Sparkles className="h-3.5 w-3.5 text-white"/></div><span className="font-extrabold">Aura Salon & Spa</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>M-21, GK-1, New Delhi</span><span><Clock className="h-3.5 w-3.5 inline mr-1"/>10 AM – 8 PM (All Days)</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 99999 99999</span></div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-8">© 2026 Aura Salon & Spa · Built by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
