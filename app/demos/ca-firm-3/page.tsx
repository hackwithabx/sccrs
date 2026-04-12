"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, Calculator, Shield, TrendingUp, FileText, Users, Award, Building2, CheckCircle2, ArrowRight, BookOpen, Landmark } from "lucide-react";

const services = [
  {icon:Calculator,title:"Income Tax & Wealth Planning",desc:"Comprehensive tax strategy for HNIs, family offices & business owners. Estate planning & wealth transfer advisory."},
  {icon:FileText,title:"Audit & Assurance",desc:"Statutory, tax & internal audit. Special purpose audits, forensic investigations & due diligence reviews."},
  {icon:TrendingUp,title:"Corporate Finance",desc:"M&A advisory, business valuations, restructuring, private equity & venture capital transaction support."},
  {icon:Shield,title:"Regulatory & Compliance",desc:"Companies Act, SEBI, RBI, FEMA compliance. Board governance advisory & secretarial services."},
  {icon:Building2,title:"International Taxation",desc:"Transfer pricing, DTAA planning, PE analysis, cross-border structuring & BEPS compliance."},
  {icon:BookOpen,title:"Family Office Services",desc:"Multi-generational wealth advisory, trust structuring, succession planning & philanthropic guidance."},
];
const reviews = [{name:"Sunil Mittal (Industrialist)",text:"Kapoor & Partners has managed our family's tax affairs for three generations. Unmatched integrity and expertise.",stars:5},{name:"Dr. Anjali Rao (Healthcare Group)",text:"Their M&A advisory was instrumental in our hospital chain acquisition. Meticulous, strategic, and deeply trustworthy.",stars:5},{name:"Vivek Chadha (NRI, UK)",text:"navigated complex DTAA provisions for us, saving millions in cross-border tax. The gold standard in Indian CA practice.",stars:5}];
const navLinks = ["Home","Expertise","About","Testimonials","Contact"];

export default function CAFirmV3() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1a1a1a]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        h1,h2,h3,.serif{font-family:'Cormorant Garamond',serif} *{font-family:'Inter',system-ui,sans-serif}`}</style>

      <div className="bg-[#7f1d1d]/10 text-[#7f1d1d] text-xs text-center py-2.5 px-4 border-b border-[#7f1d1d]/10">
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:text-[#1a1a1a]">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#faf8f4]/95 backdrop-blur-xl border-b border-[#1a1a1a]/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2.5"><Landmark className="h-6 w-6 text-[#7f1d1d]"/><div><span className="text-xl font-bold serif text-[#1a1a1a]">Kapoor & Partners</span><span className="block text-[8px] text-[#7f1d1d] tracking-[0.2em] uppercase -mt-0.5 font-semibold">Chartered Accountants · Est. 1988</span></div></a>
          <div className="hidden md:flex items-center gap-6">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-xs text-[#888] hover:text-[#7f1d1d] tracking-[0.1em] uppercase transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3"><a href="#contact" className="hidden sm:inline-flex bg-[#7f1d1d] text-white text-xs font-bold px-6 py-2.5 rounded-full tracking-wider uppercase hover:-translate-y-0.5 transition-all">Consultation</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-[#888]"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-[#1a1a1a]/5">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-xs text-[#888] hover:text-[#7f1d1d] tracking-wider uppercase">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0"><img src="https://placehold.co/1920x1080/e8e0d4/7f1d1d?text=Heritage+Office" alt="Office" className="w-full h-full object-cover"/><div className="absolute inset-0 bg-gradient-to-r from-[#faf8f4] via-[#faf8f4]/90 to-transparent"/></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-8"><div className="h-px w-12 bg-[#7f1d1d]"/><span className="text-[#7f1d1d] text-xs tracking-[0.25em] uppercase font-semibold">Est. 1988 · Three Decades of Trust</span></div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold serif leading-[1.05] mb-6">The Counsel of<br/><em className="text-[#7f1d1d]">Trusted</em> Advisors</h1>
            <p className="text-lg text-[#888] mb-10 leading-relaxed max-w-lg">For 36 years, India&apos;s leading families and businesses have relied on Kapoor & Partners for tax strategy, audit, and financial governance.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="inline-flex items-center gap-2 bg-[#7f1d1d] text-white font-bold px-8 py-4 rounded-full hover:-translate-y-0.5 transition-all text-sm tracking-wide">Schedule Consultation</a>
              <a href="#expertise" className="inline-flex items-center gap-2 text-[#1a1a1a] font-semibold px-8 py-4 rounded-full border-2 border-[#1a1a1a]/10 hover:border-[#7f1d1d] transition-all text-sm">Our Expertise</a>
            </div>
            <div className="flex gap-10 mt-14">{[{v:"36+",l:"Years Legacy"},{v:"5,000+",l:"Clients Served"},{v:"₹2,000Cr+",l:"Tax Optimized"}].map(s=><div key={s.l}><p className="text-2xl font-bold text-[#7f1d1d] serif">{s.v}</p><p className="text-[10px] text-[#aaa] uppercase tracking-wider">{s.l}</p></div>)}</div>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section id="expertise" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><div className="flex items-center justify-center gap-3 mb-3"><div className="h-px w-8 bg-[#7f1d1d]"/><span className="text-[#7f1d1d] text-xs tracking-[0.2em] uppercase font-semibold">Our Expertise</span><div className="h-px w-8 bg-[#7f1d1d]"/></div><h2 className="text-4xl font-bold serif">Areas of Practice</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(s=><div key={s.title} className="group bg-white rounded-2xl p-7 border border-[#1a1a1a]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"><s.icon className="h-8 w-8 text-[#7f1d1d] mb-4 group-hover:scale-110 transition-transform"/><h3 className="font-bold text-xl serif mb-2">{s.title}</h3><p className="text-sm text-[#888] leading-relaxed">{s.desc}</p></div>)}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-[#7f1d1d] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-white/60 text-xs tracking-[0.2em] uppercase font-semibold">Senior Partner</span>
            <h2 className="text-4xl font-bold serif mt-3 mb-4">CA Manoj Kapoor, FCA</h2>
            <p className="text-sm text-white/70 font-semibold mb-4">Senior Partner · FCA, CPA (US), LLB · Ex-KPMG Partner</p>
            <p className="text-white/70 leading-relaxed mb-4">CA Manoj Kapoor founded the firm in 1988 after a distinguished 12-year tenure at KPMG India. Over three decades, he has built one of India&apos;s most respected mid-size CA practices — trusted by industrialists, family offices, and publicly listed companies.</p>
            <p className="text-white/70 leading-relaxed mb-6">Former ICAI Central Council member. Recipient of the CA Lifetime Achievement Award (2022). Published author on Indian taxation and corporate governance.</p>
            <div className="grid grid-cols-3 gap-4">{[{v:"36+",l:"Years Practice"},{v:"ICAI",l:"Council Member"},{v:"200+",l:"Publications"}].map(s=><div key={s.l} className="bg-white/10 rounded-xl p-4 text-center"><p className="text-lg font-bold serif">{s.v}</p><p className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">{s.l}</p></div>)}</div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl"><img src="https://placehold.co/600x600/5a1515/ffffff?text=CA+Manoj+Kapoor" alt="CA Kapoor" className="w-full"/></div>
        </div>
      </section>

      {/* Reviews */}
      <section id="testimonials" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-4xl font-bold serif">Client Testimonials</h2></div>
          <div className="grid md:grid-cols-3 gap-5">{reviews.map(r=><div key={r.name} className="bg-white rounded-2xl p-7 shadow-sm border border-[#1a1a1a]/5"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-[#7f1d1d] fill-[#7f1d1d]"/>)}</div><p className="text-sm text-[#888] leading-relaxed mb-4 italic serif text-base">&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-[#7f1d1d]">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-[#f0ebe2]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-4xl font-bold serif mb-3">Schedule a Consultation</h2><p className="text-[#888]">Confidential. Professional. Complimentary first meeting.</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white rounded-3xl p-7 sm:p-10 shadow-lg">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 tracking-wider uppercase">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-[#faf8f4] border border-[#1a1a1a]/10 rounded-xl text-sm placeholder-[#aaa] focus:ring-2 focus:ring-[#7f1d1d] outline-none" placeholder="Full name"/></div><div><label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 tracking-wider uppercase">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-[#faf8f4] border border-[#1a1a1a]/10 rounded-xl text-sm placeholder-[#aaa] focus:ring-2 focus:ring-[#7f1d1d] outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 tracking-wider uppercase">Email</label><input type="email" name="email" className="w-full px-4 py-3 bg-[#faf8f4] border border-[#1a1a1a]/10 rounded-xl text-sm placeholder-[#aaa] focus:ring-2 focus:ring-[#7f1d1d] outline-none" placeholder="you@email.com"/></div><div><label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 tracking-wider uppercase">Service</label><select name="service" className="w-full px-4 py-3 bg-[#faf8f4] border border-[#1a1a1a]/10 rounded-xl text-sm focus:ring-2 focus:ring-[#7f1d1d] outline-none"><option value="">Select...</option>{["Tax Planning","Audit","Corporate Finance","International Tax","Family Office","Other"].map(s=><option key={s} value={s}>{s}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 tracking-wider uppercase">Message</label><textarea name="message" rows={3} className="w-full px-4 py-3 bg-[#faf8f4] border border-[#1a1a1a]/10 rounded-xl text-sm placeholder-[#aaa] focus:ring-2 focus:ring-[#7f1d1d] outline-none resize-none" placeholder="Brief description of your requirements..."/></div>
            <button type="submit" className="w-full bg-[#7f1d1d] text-white font-bold py-4 rounded-xl hover:bg-[#991b1b] transition-all tracking-wider uppercase text-sm">Request Consultation</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2"><Landmark className="h-5 w-5 text-[#7f1d1d]"/><span className="font-bold serif text-xl">Kapoor & Partners</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>Nariman Point, Mumbai</span><span><Clock className="h-3.5 w-3.5 inline mr-1"/>Mon–Fri: 10 AM – 7 PM</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 99999 99999</span></div>
        </div>
        <p className="text-center text-[10px] text-gray-700 mt-8 tracking-wider uppercase">© 2026 Kapoor & Partners, Chartered Accountants · Built by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
