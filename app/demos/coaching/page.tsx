"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, ChevronRight, BookOpen, GraduationCap, Users, Trophy, Target, Brain, CheckCircle2, ArrowRight, Award, TrendingUp } from "lucide-react";

const programs = [
  {icon:GraduationCap,title:"IIT-JEE (Main + Advanced)",desc:"Comprehensive 2-year program with 500+ hours of live classes, DPPs, mock tests & personal mentorship.",tag:"Flagship"},
  {icon:Brain,title:"NEET (UG)",desc:"Biology-focused rigorous coaching with NCERT mastery, question banks & hospital visit tie-ups.",tag:"Medical"},
  {icon:Target,title:"Foundation (8th–10th)",desc:"NTSE, Olympiad & board excellence. Build strong fundamentals early for competitive exam success."},
  {icon:Trophy,title:"Crash Course",desc:"100-day intensive revision with 50+ mock tests, formula sheets & expert doubt-solving sessions.",tag:"Quick Prep"},
  {icon:BookOpen,title:"Board Toppers Program",desc:"CBSE/ICSE Class 12 — goal: 95%+ aggregate. Weekly tests, PTM, and school-sync study plan."},
  {icon:Users,title:"Doubt Clinic",desc:"Daily 2-hour live sessions for enrolled students. One-on-one with faculty. No question unanswered."},
];
const results = [{year:"2025",iit:"147",neet:"312",top100:"23"},{year:"2024",iit:"132",neet:"289",top100:"19"},{year:"2023",iit:"118",neet:"265",top100:"15"}];
const reviews = [{name:"Arjun Verma (AIR 234, JEE Adv.)",text:"Pinnacle's systematic approach and daily practice problems transformed my problem-solving. Best coaching in North India.",stars:5},{name:"Priya Singh (NEET 680/720)",text:"The Biology faculty here is exceptional. Regular hospital visits and clinical case studies made concepts unforgettable.",stars:5},{name:"Ravi Kumar (Parent)",text:"My son went from 60% in 10th to AIR 500 in JEE. The mentorship and daily doubt sessions were game-changers.",stars:5}];
const navLinks = ["Home","Programs","Results","About","Enroll"];

export default function CoachingV1() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.float{animation:float 5s ease-in-out infinite}`}</style>

      <div className="bg-gradient-to-r from-[#1e40af] to-[#f97316] text-white text-xs text-center py-2.5 px-4">
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:opacity-100">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2"><div className="h-9 w-9 bg-gradient-to-br from-[#1e40af] to-[#f97316] rounded-xl flex items-center justify-center"><GraduationCap className="h-4 w-4 text-white"/></div><div><span className="text-lg font-extrabold text-[#1e40af]">Pinnacle</span><span className="block text-[8px] text-orange-500 tracking-[0.15em] uppercase -mt-0.5 font-bold">IIT-JEE & NEET Academy</span></div></a>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-500 hover:text-[#1e40af] px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3"><a href="#enroll" className="hidden sm:inline-flex bg-gradient-to-r from-[#1e40af] to-[#f97316] text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">Enroll Now</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-gray-100">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-gray-500 hover:text-[#1e40af]">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative py-20 sm:py-28 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"/>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"/>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm font-semibold mb-8"><Trophy className="h-4 w-4"/>147 IIT Selections in 2025!</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">Your IIT & NEET<br/><span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">Dream Starts Here</span></h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">North India&apos;s top-rated coaching institute. Expert faculty from IITs & AIIMS. Proven track record of 1,000+ selections.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#enroll" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold px-8 py-4 rounded-xl shadow-xl shadow-orange-500/20 hover:-translate-y-0.5 transition-all text-sm">Enroll for 2026 Batch <ArrowRight className="h-4 w-4"/></a>
              <a href="#programs" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 hover:bg-white/5 text-sm transition-all">Our Programs</a>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16">{[{v:"1,000+",l:"IIT Selections"},{v:"2,800+",l:"NEET Selections"},{v:"23",l:"Top 100 AIR"},{v:"12+",l:"Years Legacy"}].map(s=><div key={s.l} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 text-center"><p className="text-xl font-extrabold text-orange-400">{s.v}</p><p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{s.l}</p></div>)}</div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><span className="text-[#1e40af] text-xs tracking-[0.2em] uppercase font-bold">Academic Programs</span><h2 className="text-3xl sm:text-4xl font-extrabold mt-2">Our Programs</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map(p=><div key={p.title} className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-7 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"><div className="flex items-center gap-3 mb-3"><p.icon className="h-8 w-8 text-[#1e40af] group-hover:scale-110 transition-transform"/>{p.tag&&<span className="text-[10px] bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full font-bold">{p.tag}</span>}</div><h3 className="font-bold text-lg mb-2">{p.title}</h3><p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p></div>)}
          </div>
        </div>
      </section>

      {/* Results */}
      <section id="results" className="py-24 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><h2 className="text-3xl sm:text-4xl font-extrabold">Our Results</h2><p className="text-gray-400 mt-2">Consistent excellence, year after year.</p></div>
          <div className="overflow-x-auto"><table className="w-full text-center">
            <thead><tr className="border-b border-white/10"><th className="py-3 text-sm text-gray-400 font-semibold">Year</th><th className="py-3 text-sm text-gray-400 font-semibold">IIT Selections</th><th className="py-3 text-sm text-gray-400 font-semibold">NEET Selections</th><th className="py-3 text-sm text-gray-400 font-semibold">Top 100 AIR</th></tr></thead>
            <tbody>{results.map(r=><tr key={r.year} className="border-b border-white/5"><td className="py-4 font-bold text-orange-400">{r.year}</td><td className="py-4 font-bold">{r.iit}</td><td className="py-4 font-bold">{r.neet}</td><td className="py-4 font-bold text-orange-400">{r.top100}</td></tr>)}</tbody>
          </table></div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="rounded-3xl overflow-hidden shadow-2xl"><img src="https://placehold.co/600x500/1e3a5f/f97316?text=Prof+Sharma" alt="Director" className="w-full"/></div>
          <div>
            <span className="text-[#1e40af] text-xs tracking-[0.2em] uppercase font-bold">Founder & Director</span>
            <h2 className="text-3xl font-extrabold mt-2 mb-4">Prof. Amit Sharma</h2>
            <p className="text-sm text-orange-600 font-semibold mb-4">B.Tech IIT Delhi · M.Tech IIT Bombay · 20+ Years Teaching</p>
            <p className="text-gray-600 leading-relaxed mb-4">Prof. Sharma left a corporate career at McKinsey to pursue his passion for education. Since 2013, Pinnacle has produced 1,000+ IITians, including 23 Top-100 AIRs. His Physics lectures are legendary among students.</p>
            <div className="space-y-2 mb-6">{["B.Tech IIT Delhi (Gold Medalist)","M.Tech IIT Bombay","Ex-McKinsey Consultant","20+ years of JEE teaching experience","Author: 'Physics for JEE' (bestseller)"].map(t=><div key={t} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="h-4 w-4 text-[#1e40af] shrink-0"/>{t}</div>)}</div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-3xl font-extrabold">Student & Parent Reviews</h2></div>
          <div className="grid md:grid-cols-3 gap-5">{reviews.map(r=><div key={r.name} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400"/>)}</div><p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-[#1e40af]">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Enroll */}
      <section id="enroll" className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-3xl font-extrabold mb-3">Enroll Now</h2><p className="text-gray-500">Limited seats for 2026 batch. Book a free counseling session.</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-gray-50 border border-gray-100 rounded-3xl p-7 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold mb-1.5">Student Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Full name"/></div><div><label className="block text-sm font-semibold mb-1.5">Parent Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold mb-1.5">Current Class *</label><select name="class" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"><option value="">Select...</option>{["8th","9th","10th","11th","12th","Dropper"].map(c=><option key={c} value={c}>{c}</option>)}</select></div><div><label className="block text-sm font-semibold mb-1.5">Program *</label><select name="program" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"><option value="">Select...</option>{["IIT-JEE","NEET","Foundation","Board Toppers","Crash Course"].map(p=><option key={p} value={p}>{p}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold mb-1.5">Message</label><textarea name="message" rows={3} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Any questions or specific needs..."/></div>
            <button type="submit" className="w-full bg-gradient-to-r from-[#1e40af] to-[#f97316] text-white font-bold py-4 rounded-xl shadow-lg">Book Free Counseling</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2"><div className="h-8 w-8 bg-gradient-to-br from-[#1e40af] to-[#f97316] rounded-xl flex items-center justify-center"><GraduationCap className="h-4 w-4 text-white"/></div><span className="font-extrabold">Pinnacle Academy</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>Kota, Rajasthan</span><span><Clock className="h-3.5 w-3.5 inline mr-1"/>Mon–Sat: 7 AM – 9 PM</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 99999 99999</span></div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-8">© 2026 Pinnacle IIT-JEE & NEET Academy · Built by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
