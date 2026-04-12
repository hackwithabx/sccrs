"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Star, Menu, X, Heart, Stethoscope, Brain, Eye, Smile, Baby, Calendar, MessageCircle, ChevronRight, Shield, Activity, Award, Users, Zap } from "lucide-react";

const services = [
  { icon: Stethoscope, name: "General Medicine", desc: "Primary care, checkups, preventive care & illness management." },
  { icon: Baby, name: "Paediatrics", desc: "Specialized healthcare for children & adolescents." },
  { icon: Heart, name: "Cardiology", desc: "ECG, echo, stress tests & cardiovascular care." },
  { icon: Brain, name: "Neurology", desc: "Brain & nervous system disorders, migraines, epilepsy." },
  { icon: Smile, name: "Dental Care", desc: "Cleaning, fillings, root canals & cosmetic dentistry." },
  { icon: Eye, name: "Eye Care", desc: "Vision correction, cataract surgery & eye diseases." },
];
const testimonials = [
  { name: "Sneha Rao", text: "The dark, calming ambiance is so soothing. Dr. Arora is incredibly thorough.", img: "SR" },
  { name: "Amit Patel", text: "World-class treatment. The technology here is on par with the best hospitals.", img: "AP" },
  { name: "Kavita Nair", text: "My entire family trusts this clinic. Such a premium yet caring experience.", img: "KN" },
];
const navLinks = ["Home","Services","Doctor","Timings","Reviews","Contact"];

export default function ClinicV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-100">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(16,185,129,.15)}50%{box-shadow:0 0 40px rgba(16,185,129,.3)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .glow{animation:glow 3s ease-in-out infinite} .float{animation:float 6s ease-in-out infinite}
        *{font-family:'Plus Jakarta Sans',system-ui,sans-serif}`}</style>

      <div className="bg-emerald-500/10 text-emerald-300 text-xs text-center py-2.5 px-4 border-b border-emerald-500/10">
        <span className="opacity-70">Demo template by </span><Link href="/demos" className="underline font-semibold hover:text-white">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2.5">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 glow"><Stethoscope className="h-5 w-5 text-white"/></div>
            <div><span className="text-xl font-extrabold text-white">Nova</span><span className="text-emerald-400 font-extrabold">Med</span><span className="block text-[9px] text-gray-500 tracking-[0.2em] uppercase -mt-0.5">Advanced Clinic</span></div>
          </a>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3">
            <a href="#appointment" className="hidden sm:inline-flex bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all">Book Now</a>
            <button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400"><Menu className="h-6 w-6"/></button>
          </div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-white/5">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-gray-400 hover:text-emerald-400">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0"><div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl"/><div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl"/></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-full mb-8 border border-emerald-500/20"><Zap className="h-4 w-4"/> Advanced Healthcare</div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.05] tracking-tight">
                <span className="text-white">Next-Gen</span><br/>
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Medical Care</span>
              </h1>
              <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-lg">Experience healthcare reimagined. Cutting-edge diagnostics, compassionate doctors, and premium technology — all in one place.</p>
              <div className="flex flex-wrap gap-3 mb-14">
                <a href="#appointment" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold px-7 py-3.5 rounded-xl shadow-xl shadow-emerald-500/25 hover:-translate-y-0.5 transition-all"><Calendar className="h-4 w-4"/> Book Appointment</a>
                <a href="tel:+919999999999" className="inline-flex items-center gap-2 bg-white/5 text-gray-300 font-semibold px-7 py-3.5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"><Phone className="h-4 w-4"/> Call Us</a>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[{v:"20+",l:"Years"},{v:"15K+",l:"Patients"},{v:"8",l:"Specialists"},{v:"4.9",l:"Rating"}].map(s=><div key={s.l} className="text-center"><p className="text-2xl font-extrabold text-white">{s.v}</p><p className="text-xs text-gray-500">{s.l}</p></div>)}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/5"><img src="https://placehold.co/600x720/0a1a2a/10b981?text=Doctor" alt="Doctor" className="w-full"/></div>
              <div className="absolute -bottom-4 -left-4 bg-[#111827] border border-white/10 rounded-2xl p-4 flex items-center gap-3 float shadow-xl">
                <div className="h-10 w-10 bg-emerald-500/20 rounded-lg flex items-center justify-center"><Activity className="h-5 w-5 text-emerald-400"/></div>
                <div><p className="font-bold text-sm text-white">Open 24/7</p><p className="text-xs text-gray-500">Emergency Line Active</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Our Specializations</h2><p className="text-gray-400 max-w-lg mx-auto">Advanced medical services powered by latest technology.</p></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(s=>{const Icon=s.icon;return(
              <div key={s.name} className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all duration-300 hover:-translate-y-1">
                <div className="h-14 w-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors"><Icon className="h-7 w-7 text-emerald-400"/></div>
                <h3 className="text-lg font-bold text-white mb-2">{s.name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* Doctor */}
      <section id="doctor" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-white/[0.03] to-emerald-500/[0.03] border border-white/[0.06] rounded-3xl p-8 lg:p-14">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl overflow-hidden border border-white/10"><img src="https://placehold.co/500x600/111827/10b981?text=Dr.+Arora" alt="Dr. Arora" className="w-full"/></div>
              <div>
                <div className="inline-flex items-center gap-2 text-emerald-400 text-sm font-semibold bg-emerald-500/10 px-4 py-1.5 rounded-full mb-6 border border-emerald-500/20"><Award className="h-4 w-4"/> Chief Physician</div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Dr. Priya Arora</h2>
                <p className="text-emerald-400 font-semibold text-lg mb-5">MBBS, MD, DNB — Internal Medicine</p>
                <div className="flex flex-wrap gap-2 mb-6">{["AIIMS Alumni","20+ Years","Fellowship UK","15K+ Patients"].map(b=><span key={b} className="text-xs bg-emerald-500/10 text-emerald-300 px-3 py-1.5 rounded-full font-semibold border border-emerald-500/20">{b}</span>)}</div>
                <p className="text-gray-400 leading-relaxed mb-6">A distinguished physician with AIIMS training and UK fellowship, Dr. Arora combines global expertise with deep compassion. She pioneered the clinic&apos;s integrated diagnostics approach.</p>
                <a href="#appointment" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all">Book Consultation <ChevronRight className="h-4 w-4"/></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timings */}
      <section id="timings" className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><h2 className="text-3xl font-extrabold text-white mb-4">Clinic Timings</h2></div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 grid grid-cols-3 text-white text-sm font-bold"><span className="px-4">Day</span><span className="px-4">Morning</span><span className="px-4">Evening</span></div>
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d,i)=><div key={d} className={`grid grid-cols-3 text-sm ${i%2===0?"bg-transparent":"bg-white/[0.02]"} border-b border-white/[0.05] hover:bg-emerald-500/5 transition-colors`}><span className="px-6 py-4 font-semibold text-white">{d}</span><span className="px-6 py-4 text-gray-400">9:00 AM – 1:00 PM</span><span className="px-6 py-4 text-gray-400">5:00 PM – 9:00 PM</span></div>)}
            <div className="grid grid-cols-3 text-sm bg-red-500/5"><span className="px-6 py-4 font-semibold text-red-400">Sunday</span><span className="px-6 py-4 text-red-400/70 col-span-2">Emergency Only</span></div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl font-extrabold text-white mb-4">Patient Stories</h2></div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(t=><div key={t.name} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all">
              <div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-emerald-400 fill-emerald-400"/>)}</div>
              <p className="text-sm text-gray-300 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]"><div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-300 font-bold text-xs">{t.img}</div><div><p className="font-bold text-sm text-white">{t.name}</p><p className="text-[11px] text-gray-500">Verified Patient</p></div></div>
            </div>)}
          </div>
        </div>
      </section>

      {/* Appointment */}
      <section id="appointment" className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-3xl p-7 sm:p-10">
            <div className="text-center mb-10"><h2 className="text-3xl font-extrabold text-white mb-3">Book Appointment</h2><p className="text-gray-400">We&apos;ll confirm within 24 hours.</p></div>
            <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
              <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="Your name"/></div><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="+91 99999 99999"/></div></div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Date *</label><input type="date" name="date" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"/></div><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Service *</label><select name="service" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"><option value="">Choose...</option>{services.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}</select></div></div>
              <div className="mb-6"><label className="block text-sm font-semibold text-gray-300 mb-1.5">Message</label><textarea name="message" rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" placeholder="Additional info..."/></div>
              <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/25">Book Now</button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-12"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="rounded-3xl overflow-hidden border border-white/[0.06]"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.14571458693!2d72.71637258436986!3d19.08219783259688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai!5e0!3m2!1sen!2sin!4v1711111111111" width="100%" height="300" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Location"/></div></div></section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2"><div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center"><Stethoscope className="h-4 w-4 text-white"/></div><span className="font-extrabold text-white">NovaMed</span></div>
            <p className="text-xs text-gray-500">© 2026 NovaMed Clinic · Built with ❤️ by SecureCodeReviews</p>
            <div className="flex gap-4 text-sm text-gray-400"><a href="tel:+919999999999" className="hover:text-emerald-400 transition-colors flex items-center gap-1"><Phone className="h-3.5 w-3.5"/>Call</a><a href="mailto:info@novamed.com" className="hover:text-emerald-400 transition-colors flex items-center gap-1"><Mail className="h-3.5 w-3.5"/>Email</a></div>
          </div>
        </div>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
