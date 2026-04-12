"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, BookOpen, GraduationCap, Users, Trophy, Target, Brain, CheckCircle2, ArrowRight, Sparkles, Rocket, Zap, Code2 } from "lucide-react";

const programs = [
  {icon:Code2,title:"Full-Stack Web Dev",desc:"MERN stack, Next.js, TypeScript, databases. Build 10+ production projects in 6 months.",tag:"Most Popular"},
  {icon:Brain,title:"Data Science & AI",desc:"Python, ML, Deep Learning, NLP, GenAI. Kaggle competitions & real datasets.",tag:"High Demand"},
  {icon:Rocket,title:"Product Management",desc:"User research, PRDs, roadmapping, analytics. Led by PMs from Google, Razorpay & Swiggy."},
  {icon:Target,title:"DSA & Interview Prep",desc:"300+ problems, mock interviews, system design. Crack FAANG & Indian unicorn interviews."},
  {icon:Sparkles,title:"UI/UX Design",desc:"Figma, design systems, user research, prototyping. Portfolio-focused — build 8+ case studies."},
  {icon:Zap,title:"DevOps & Cloud",desc:"AWS, Docker, Kubernetes, CI/CD, Terraform. Deploy and scale real applications."},
];
const reviews = [{name:"Priya Mehta (SDE @ Google)",text:"NeoCode's DSA program was exactly what I needed. The mock interviews with ex-FAANG engineers sealed the deal for me.",stars:5},{name:"Arjun Das (PM @ Razorpay)",text:"The Product Management bootcamp is world-class. Real case studies, mentorship from actual PMs, and an incredible peer network.",stars:5},{name:"Sneha Kumar (Freelancer → ₹25L job)",text:"I was a mechanical engineer. NeoCode's full-stack bootcamp transformed my career. Now I'm a frontend dev at a YC startup.",stars:5}];
const navLinks = ["Home","Programs","Outcomes","About","Apply"];

export default function CoachingV3() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{font-family:'Plus Jakarta Sans',system-ui,sans-serif}`}</style>

      <div className="bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white text-xs text-center py-2.5 px-4">
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:opacity-100">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2"><div className="h-9 w-9 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-xl flex items-center justify-center"><Rocket className="h-4 w-4 text-white"/></div><div><span className="text-lg font-extrabold text-[#16a34a]">NeoCode</span><span className="block text-[8px] text-gray-400 tracking-[0.15em] uppercase -mt-0.5 font-bold">Tech Bootcamp</span></div></a>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-500 hover:text-[#16a34a] px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3"><a href="#apply" className="hidden sm:inline-flex bg-[#16a34a] text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-green-500/20 hover:-translate-y-0.5 transition-all">Apply Now</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-gray-100">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-gray-500 hover:text-[#16a34a]">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative py-20 sm:py-28 bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#052e16] text-white overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"/>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 text-green-300 px-4 py-2 rounded-full text-sm font-semibold mb-8"><Sparkles className="h-4 w-4"/>93% Placement Rate · Avg ₹18 LPA</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">Learn to Code.<br/><span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Land Your Dream Job.</span></h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">India&apos;s top-rated tech bootcamp. Project-based learning. Industry mentors from Google, Meta, Flipkart. Pay after placement available.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#apply" className="inline-flex items-center gap-2 bg-[#16a34a] text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-green-500/20 hover:-translate-y-0.5 transition-all text-sm">Apply for Next Cohort <ArrowRight className="h-4 w-4"/></a>
              <a href="#programs" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 hover:bg-white/5 text-sm transition-all">View Programs</a>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16">{[{v:"5,000+",l:"Alumni"},{v:"93%",l:"Placement"},{v:"₹18 LPA",l:"Avg Salary"},{v:"300+",l:"Hiring Partners"}].map(s=><div key={s.l} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 text-center"><p className="text-xl font-extrabold text-green-400">{s.v}</p><p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{s.l}</p></div>)}</div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><span className="text-[#16a34a] text-xs tracking-[0.2em] uppercase font-bold">Bootcamps</span><h2 className="text-3xl sm:text-4xl font-extrabold mt-2">Our Programs</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map(p=><div key={p.title} className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-7 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"><div className="flex items-center gap-3 mb-3"><p.icon className="h-8 w-8 text-[#16a34a] group-hover:scale-110 transition-transform"/>{p.tag&&<span className="text-[10px] bg-green-500/10 text-green-700 px-2 py-0.5 rounded-full font-bold">{p.tag}</span>}</div><h3 className="font-bold text-lg mb-2">{p.title}</h3><p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p></div>)}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section id="outcomes" className="py-24 bg-[#052e16] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Placement Outcomes</h2>
          <p className="text-gray-400 mb-12 max-w-xl mx-auto">Our graduates work at top tech companies across India and globally.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {[{v:"₹42 LPA",l:"Highest Package"},{v:"₹18 LPA",l:"Average Package"},{v:"93%",l:"Placement Rate"},{v:"45 Days",l:"Avg Time to Offer"}].map(s=><div key={s.l} className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-2xl font-extrabold text-green-400">{s.v}</p><p className="text-xs text-gray-500 mt-1">{s.l}</p></div>)}
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            {["Google","Microsoft","Amazon","Flipkart","Razorpay","Swiggy","Zerodha","PhonePe","Atlassian","Uber"].map(c=><span key={c} className="bg-white/5 px-4 py-2 rounded-full border border-white/10">{c}</span>)}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="rounded-3xl overflow-hidden shadow-2xl"><img src="https://placehold.co/600x500/052e16/22c55e?text=Founders" alt="Founders" className="w-full"/></div>
          <div>
            <span className="text-[#16a34a] text-xs tracking-[0.2em] uppercase font-bold">Founded by Engineers</span>
            <h2 className="text-3xl font-extrabold mt-2 mb-4">Built by IITians, for Everyone</h2>
            <p className="text-gray-600 leading-relaxed mb-4">NeoCode was founded in 2020 by IIT alumni who saw that India&apos;s best tech education was gatekept by privilege. Our mission: make world-class coding education accessible, affordable, and outcome-driven.</p>
            <p className="text-gray-600 leading-relaxed mb-6">With 300+ hiring partners and a &ldquo;Pay After Placement&rdquo; option, we ensure no motivated student is left behind.</p>
            <div className="space-y-2">{["Founded by IIT Delhi & IIT Bombay alumni","Faculty from Google, Meta, Amazon, Flipkart","300+ hiring partner companies","ISA (Income Share Agreement) available","4.8★ on Google, Trustpilot & Course Report"].map(t=><div key={t} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="h-4 w-4 text-[#16a34a] shrink-0"/>{t}</div>)}</div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-3xl font-extrabold">Alumni Stories</h2></div>
          <div className="grid md:grid-cols-3 gap-5">{reviews.map(r=><div key={r.name} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-green-500 fill-green-500"/>)}</div><p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-[#16a34a]">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Apply */}
      <section id="apply" className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-3xl font-extrabold mb-3">Apply Now</h2><p className="text-gray-500">Next cohort starts soon. Limited seats available.</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-gray-50 border border-gray-100 rounded-3xl p-7 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold mb-1.5">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Full name"/></div><div><label className="block text-sm font-semibold mb-1.5">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold mb-1.5">Email *</label><input type="email" name="email" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none" placeholder="you@email.com"/></div><div><label className="block text-sm font-semibold mb-1.5">Program *</label><select name="program" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"><option value="">Select...</option>{["Full-Stack Web Dev","Data Science & AI","Product Management","DSA & Interview Prep","UI/UX Design","DevOps & Cloud"].map(p=><option key={p} value={p}>{p}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold mb-1.5">Background</label><textarea name="message" rows={3} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none resize-none" placeholder="Your current role, experience, career goals..."/></div>
            <button type="submit" className="w-full bg-[#16a34a] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20">Submit Application</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#052e16] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2"><div className="h-8 w-8 bg-[#16a34a] rounded-xl flex items-center justify-center"><Rocket className="h-4 w-4 text-white"/></div><span className="font-extrabold">NeoCode</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>HSR Layout, Bangalore</span><span className="flex items-center gap-1">100% Online Available</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 99999 99999</span></div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-8">© 2026 NeoCode Tech Bootcamp · Built by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
