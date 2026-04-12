"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, Calculator, Shield, TrendingUp, FileText, Users, Award, Building2, CheckCircle2, ArrowRight, Briefcase, Scale } from "lucide-react";

const services = [
  {icon:Calculator,title:"Direct & Indirect Tax",desc:"Strategic income tax planning, GST advisory, TDS management & international taxation."},
  {icon:FileText,title:"Statutory Audit",desc:"Companies Act compliance, tax audit, bank audit, concurrent audit & forensic audit."},
  {icon:TrendingUp,title:"CFO Services",desc:"Virtual CFO for startups & SMEs — MIS, cash flow management, investor reporting."},
  {icon:Shield,title:"Regulatory Compliance",desc:"FEMA, RBI filings, transfer pricing documentation & ESG reporting advisory."},
  {icon:Building2,title:"Startup Advisory",desc:"Angel tax, ESOP structuring, DPIIT registration, fundraise readiness & cap-table management."},
  {icon:Scale,title:"Litigation Support",desc:"Tax tribunal representation, assessment proceedings, appeals & dispute resolution."},
];
const reviews = [{name:"Aditya Birla (Startup Founder)",text:"Shah & Co. structured our ESOP pool and fundraise docs. They understand the startup ecosystem deeply. A++ team.",stars:5},{name:"Meera Iyer (CFO, Fintech)",text:"Their virtual CFO service is outstanding. Monthly MIS, board decks, and cash flow models — all delivered like clockwork.",stars:5},{name:"Sanjay Gupta (NRI Investor)",text:"Cross-border tax planning is their forte. Saved me significant tax on property sale + overseas portfolio restructuring.",stars:5}];
const navLinks = ["Home","Services","Team","Testimonials","Contact"];

export default function CAFirmV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
        @keyframes glow{0%,100%{box-shadow:0 0 15px rgba(99,102,241,0.2)}50%{box-shadow:0 0 30px rgba(99,102,241,0.4)}}.glow{animation:glow 3s ease-in-out infinite}`}</style>

      <div className="bg-indigo-500/10 text-indigo-400 text-xs text-center py-2.5 px-4 border-b border-indigo-500/10">
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:text-white">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#0a0f1a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2"><div className="h-9 w-9 bg-indigo-500 rounded-lg glow flex items-center justify-center"><Scale className="h-4 w-4 text-white"/></div><div><span className="text-lg font-extrabold text-indigo-400">Shah & Co.</span><span className="block text-[8px] text-gray-600 tracking-[0.15em] uppercase -mt-0.5">Chartered Accountants</span></div></a>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-500 hover:text-indigo-400 px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3"><a href="#contact" className="hidden sm:inline-flex bg-indigo-500 text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all">Schedule Call</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-white/5">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-gray-500 hover:text-indigo-400">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl"/>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"/>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full text-xs font-bold mb-8"><Briefcase className="h-3.5 w-3.5"/>ICAI Firm · FRN 123456W</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">Modern CA Firm for<br/><span className="text-indigo-400">Modern Businesses</span></h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">Tech-enabled chartered accountancy. From compliance automation to strategic tax advisory — built for startups, SMEs and enterprises.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="inline-flex items-center gap-2 bg-indigo-500 text-white font-bold px-8 py-4 rounded-lg shadow-xl shadow-indigo-500/20 hover:-translate-y-0.5 transition-all text-sm">Free Strategy Call <ArrowRight className="h-4 w-4"/></a>
              <a href="#services" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-lg border border-white/20 hover:bg-white/5 text-sm transition-all">Services</a>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-16">{[{v:"12+",l:"Years"},{v:"1,500+",l:"Clients"},{v:"₹800Cr+",l:"Tax Optimized"},{v:"100%",l:"Compliance Rate"}].map(s=><div key={s.l} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center"><p className="text-xl font-extrabold text-indigo-400">{s.v}</p><p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">{s.l}</p></div>)}</div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><h2 className="text-3xl sm:text-4xl font-extrabold">Our Services</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s=><div key={s.title} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 hover:border-indigo-500/30 transition-all group"><s.icon className="h-8 w-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform"/><h3 className="font-bold mb-2">{s.title}</h3><p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p></div>)}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="rounded-2xl overflow-hidden border border-white/10"><img src="https://placehold.co/600x500/0a0f1a/6366f1?text=CA+Raghav+Shah" alt="CA Shah" className="w-full"/></div>
          <div>
            <span className="text-indigo-400 text-xs tracking-[0.2em] uppercase font-bold">Founding Partner</span>
            <h2 className="text-3xl font-extrabold mt-2 mb-4">CA Raghav Shah</h2>
            <p className="text-sm text-indigo-400 font-semibold mb-4">FCA, CPA (US), DISA · IIM-A Alumni</p>
            <p className="text-gray-400 leading-relaxed mb-4">Former Big4 (Deloitte) leader. Built Shah & Co. to democratize premium CA services for India&apos;s growing startup ecosystem. Advised 50+ funded startups through their entire lifecycle — from incorporation to IPO readiness.</p>
            <p className="text-gray-400 leading-relaxed mb-6">Recognized by ICAI for contribution to digital taxation. Regular columnist in Economic Times. TEDx speaker on &ldquo;Future of Accounting.&rdquo;</p>
            <div className="space-y-2">{["FCA + CPA (US) dual qualification","Ex-Deloitte (12 years, Partner track)","Advised 50+ funded startups","ICAI Digital Taxation Award 2023","Author: 'Tax Strategy for Founders'"].map(t=><div key={t} className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0"/>{t}</div>)}</div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="testimonials" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-3xl font-extrabold">Client Testimonials</h2></div>
          <div className="grid md:grid-cols-3 gap-5">{reviews.map(r=><div key={r.name} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-indigo-500/20 transition-all"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-indigo-400 fill-indigo-400"/>)}</div><p className="text-sm text-gray-400 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-indigo-400">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-3xl font-extrabold mb-3">Schedule a Call</h2><p className="text-gray-500">Get expert guidance — first consultation is free.</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-7 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Full name"/></div><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Email</label><input type="email" name="email" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="you@email.com"/></div><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Service</label><select name="service" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"><option value="">Select...</option>{["Tax Advisory","Audit","Virtual CFO","Startup Advisory","NRI Tax","GST","Other"].map(s=><option key={s} value={s}>{s}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold text-gray-300 mb-1.5">Message</label><textarea name="message" rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Brief description of your needs..."/></div>
            <button type="submit" className="w-full bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20">Book Free Consultation</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2"><div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center"><Scale className="h-4 w-4 text-white"/></div><span className="font-extrabold text-indigo-400">Shah & Co.</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>BKC, Mumbai</span><span><Clock className="h-3.5 w-3.5 inline mr-1"/>Mon–Sat: 10 AM – 7 PM</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 99999 99999</span></div>
        </div>
        <p className="text-center text-xs text-gray-700 mt-8">© 2026 Shah & Co. Chartered Accountants · Built by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
