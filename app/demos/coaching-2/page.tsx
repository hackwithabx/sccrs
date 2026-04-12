"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, BookOpen, GraduationCap, Users, Trophy, Target, Brain, CheckCircle2, ArrowRight, Award, Lightbulb, Laptop } from "lucide-react";

const programs = [
  {icon:GraduationCap,title:"UPSC CSE (GS + Optional)",desc:"18-month integrated program. 600+ hours of live lectures, answer writing, mock interviews & current affairs."},
  {icon:Target,title:"UPSC Prelims Test Series",desc:"50 full-length mock tests with detailed analysis, rank predictor & faculty review sessions."},
  {icon:BookOpen,title:"State PCS",desc:"UPPSC, MPPSC, BPSC — customized state-level coaching with regional focus & bilingual support."},
  {icon:Brain,title:"Optional Subjects",desc:"Sociology, PSIR, Geography, History, Philosophy — dedicated faculty for each optional with topper strategies."},
  {icon:Laptop,title:"Online Live Classes",desc:"Full GS + Optional curriculum streamed live. Same faculty, same quality — accessible from anywhere in India."},
  {icon:Lightbulb,title:"Interview Guidance Program",desc:"Personality test prep with retired IAS officers. Mock boards, DAF analysis & confidence building."},
];
const reviews = [{name:"Aishwarya Rao (IAS, AIR 67)",text:"Drishti's structured approach to GS and practice-oriented answer writing transformed my preparation entirely.",stars:5},{name:"Vikram Choudhary (IPS, AIR 142)",text:"The current affairs program and test series were my backbone. Faculty mentorship was deeply personal and motivating.",stars:5},{name:"Neha Patel (IFS, AIR 89)",text:"From Prelims to Interview — Drishti covered everything. The most comprehensive UPSC coaching available today.",stars:5}];
const navLinks = ["Home","Programs","Results","Faculty","Enroll"];

export default function CoachingV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
        @keyframes glow{0%,100%{box-shadow:0 0 15px rgba(234,179,8,0.15)}50%{box-shadow:0 0 30px rgba(234,179,8,0.3)}}.glow{animation:glow 3s ease-in-out infinite}`}</style>

      <div className="bg-yellow-500/10 text-yellow-400 text-xs text-center py-2.5 px-4 border-b border-yellow-500/10">
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:text-white">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#0a0f1a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2"><div className="h-9 w-9 bg-yellow-500 rounded-lg glow flex items-center justify-center"><Award className="h-4 w-4 text-black"/></div><div><span className="text-lg font-extrabold text-yellow-400">Drishti IAS</span><span className="block text-[8px] text-gray-600 tracking-[0.15em] uppercase -mt-0.5">Civil Services Academy</span></div></a>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-500 hover:text-yellow-400 px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3"><a href="#enroll" className="hidden sm:inline-flex bg-yellow-500 text-black text-sm font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-yellow-500/20 hover:-translate-y-0.5 transition-all">Join Now</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-white/5">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-gray-500 hover:text-yellow-400">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl"/>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-xs font-bold mb-8"><Trophy className="h-3.5 w-3.5"/>500+ IAS/IPS Officers Produced</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">Shape India&apos;s Future.<br/><span className="text-yellow-400">Become an IAS Officer.</span></h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">India&apos;s most trusted UPSC coaching. Faculty of ex-bureaucrats. Comprehensive Prelims to Interview preparation. Online + Offline.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#enroll" className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold px-8 py-4 rounded-lg shadow-xl shadow-yellow-500/20 hover:-translate-y-0.5 transition-all text-sm">Enroll for 2026 <ArrowRight className="h-4 w-4"/></a>
              <a href="#programs" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-lg border border-white/20 hover:bg-white/5 text-sm transition-all">View Programs</a>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-16">{[{v:"500+",l:"IAS/IPS Officers"},{v:"15+",l:"Years"},{v:"50K+",l:"Students"},{v:"98%",l:"Satisfaction"}].map(s=><div key={s.l} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center"><p className="text-xl font-extrabold text-yellow-400">{s.v}</p><p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">{s.l}</p></div>)}</div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><h2 className="text-3xl sm:text-4xl font-extrabold">Our Programs</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map(p=><div key={p.title} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 hover:border-yellow-500/30 transition-all group"><p.icon className="h-8 w-8 text-yellow-400 mb-4 group-hover:scale-110 transition-transform"/><h3 className="font-bold mb-2">{p.title}</h3><p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p></div>)}
          </div>
        </div>
      </section>

      {/* Results */}
      <section id="results" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Our Track Record</h2>
          <p className="text-gray-400 mb-12 max-w-xl mx-auto">Consistent results that speak for themselves.</p>
          <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {[{v:"500+",l:"Total IAS/IPS",d:"Officers produced since 2010"},{v:"87",l:"In Top 100 AIR",d:"Across all years combined"},{v:"2025 Results",l:"52 Selections",d:"Including AIR 3, 17, 29"}].map(s=><div key={s.l} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7"><p className="text-3xl font-extrabold text-yellow-400 mb-1">{s.v}</p><p className="text-sm font-bold mb-1">{s.l}</p><p className="text-xs text-gray-500">{s.d}</p></div>)}
          </div>
        </div>
      </section>

      {/* Faculty */}
      <section id="faculty" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="rounded-2xl overflow-hidden border border-white/10"><img src="https://placehold.co/600x500/0a0f1a/eab308?text=Dr+Vikas+Divyakirti" alt="Director" className="w-full"/></div>
          <div>
            <span className="text-yellow-400 text-xs tracking-[0.2em] uppercase font-bold">Founder & Director</span>
            <h2 className="text-3xl font-extrabold mt-2 mb-4">Dr. Vikas Divyakirti</h2>
            <p className="text-sm text-yellow-400 font-semibold mb-4">M.A. (Hindi), Ph.D · Ex-Faculty, Delhi University · UPSC Expert</p>
            <p className="text-gray-400 leading-relaxed mb-4">Dr. Divyakirti has spent 20+ years mentoring UPSC aspirants. His GS lectures, current affairs analysis, and motivational talks have helped shape thousands of civil servants. Known for making complex topics simple and relatable.</p>
            <div className="space-y-2">{["20+ years UPSC teaching experience","Ph.D in Hindi Literature","YouTube: 10M+ subscribers","Author of 5 UPSC prep books","Expert on Ethics, Essay & Hindi Medium"].map(t=><div key={t} className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="h-4 w-4 text-yellow-400 shrink-0"/>{t}</div>)}</div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-3xl font-extrabold">Success Stories</h2></div>
          <div className="grid md:grid-cols-3 gap-5">{reviews.map(r=><div key={r.name} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-yellow-500/20 transition-all"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400"/>)}</div><p className="text-sm text-gray-400 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-yellow-400">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Enroll */}
      <section id="enroll" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-3xl font-extrabold mb-3">Enroll Now</h2><p className="text-gray-500">Start your UPSC journey with India&apos;s best faculty.</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-7 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="Full name"/></div><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Program *</label><select name="program" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-yellow-500 outline-none"><option value="">Select...</option>{["UPSC CSE (Complete)","Prelims Test Series","State PCS","Optional Subject","Online Live","Interview Prep"].map(p=><option key={p} value={p}>{p}</option>)}</select></div><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Attempt</label><select name="attempt" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-yellow-500 outline-none"><option value="">Select...</option>{["1st Attempt","2nd Attempt","3rd+ Attempt","Just Starting"].map(a=><option key={a} value={a}>{a}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold text-gray-300 mb-1.5">Message</label><textarea name="message" rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none resize-none" placeholder="Your background, optional subject preference..."/></div>
            <button type="submit" className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/20">Book Free Counseling</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2"><div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center"><Award className="h-4 w-4 text-black"/></div><span className="font-extrabold text-yellow-400">Drishti IAS</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>Old Rajinder Nagar, Delhi</span><span><Clock className="h-3.5 w-3.5 inline mr-1"/>Mon–Sat: 8 AM – 8 PM</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 99999 99999</span></div>
        </div>
        <p className="text-center text-xs text-gray-700 mt-8">© 2026 Drishti IAS Academy · Built by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
