"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Star, Menu, X, Heart, Stethoscope, Brain, Eye, Smile, Baby, Calendar, MessageCircle, ChevronRight, Award, Users, Leaf } from "lucide-react";

const services = [
  { icon: Stethoscope, name: "General Medicine", desc: "Holistic primary care with a focus on wellness & prevention." },
  { icon: Baby, name: "Paediatrics", desc: "Gentle, caring healthcare for your little ones." },
  { icon: Heart, name: "Cardiology", desc: "Heart health monitoring with modern diagnostics." },
  { icon: Brain, name: "Mental Wellness", desc: "Counselling, therapy & stress management programs." },
  { icon: Smile, name: "Dental Care", desc: "Painless procedures in a calming environment." },
  { icon: Eye, name: "Eye Care", desc: "Comprehensive vision care & corrective treatments." },
];
const testimonials = [
  { name: "Meera Das", text: "The warmest clinic I've visited. It feels like family here. Dr. Kapoor is so patient.", img: "MD" },
  { name: "Suresh Iyer", text: "Love the holistic approach. They treat the person, not just the symptoms.", img: "SI" },
  { name: "Lakshmi Roy", text: "The ambiance is calming and the care is exceptional. My kids love coming here.", img: "LR" },
];
const navLinks = ["Home","Services","Doctor","Timings","Reviews","Contact"];

export default function ClinicV3() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2d3436]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .float{animation:float 6s ease-in-out infinite}
        h1,h2,h3{font-family:'DM Serif Display',serif} *{font-family:'DM Sans',system-ui,sans-serif}`}</style>

      <div className="bg-[#0d9488] text-white text-xs text-center py-2.5 px-4">
        <span className="opacity-80">Demo template by </span><Link href="/demos" className="underline font-semibold hover:text-teal-100">SecureCodeReviews</Link><span className="opacity-80"> · </span><Link href="/demos" className="underline opacity-80 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#faf7f2]/90 backdrop-blur-xl border-b border-[#e8dfd3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2.5">
            <div className="h-10 w-10 bg-[#0d9488] rounded-full flex items-center justify-center"><Leaf className="h-5 w-5 text-white"/></div>
            <div><span className="text-xl font-bold text-[#0d9488]" style={{fontFamily:"'DM Serif Display',serif"}}>CareNest</span><span className="block text-[9px] text-[#9b8e7e] font-medium tracking-[0.15em] uppercase -mt-0.5">Wellness Clinic</span></div>
          </a>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-[#7a7067] hover:text-[#0d9488] hover:bg-[#0d9488]/5 px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3">
            <a href="#appointment" className="hidden sm:inline-flex bg-[#0d9488] hover:bg-[#0b7e74] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-md shadow-[#0d9488]/20 hover:-translate-y-0.5">Book Visit</a>
            <button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-[#7a7067]"><Menu className="h-6 w-6"/></button>
          </div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-[#e8dfd3]">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-[#7a7067] hover:text-[#0d9488]">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden py-16 lg:py-28">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0d9488]/5 rounded-full blur-3xl"/>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#0d9488]/10 text-[#0d9488] text-sm font-semibold px-4 py-2 rounded-full mb-8"><Leaf className="h-4 w-4"/> Holistic Wellness</div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#2d3436] mb-6 leading-[1.1]" style={{fontFamily:"'DM Serif Display',serif"}}>
                Healing with <span className="text-[#0d9488]">Warmth</span> & Care
              </h1>
              <p className="text-lg text-[#7a7067] mb-10 leading-relaxed max-w-lg">Where modern medicine meets holistic wellness. Experience compassionate healthcare in a calming, home-like environment.</p>
              <div className="flex flex-wrap gap-3 mb-12">
                <a href="#appointment" className="inline-flex items-center gap-2 bg-[#0d9488] text-white font-semibold px-7 py-3.5 rounded-full shadow-lg shadow-[#0d9488]/20 hover:-translate-y-0.5 transition-all"><Calendar className="h-4 w-4"/> Book Visit</a>
                <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-[#2d3436] font-semibold px-7 py-3.5 rounded-full border border-[#e8dfd3] hover:border-[#0d9488] hover:text-[#0d9488] transition-all shadow-sm"><MessageCircle className="h-4 w-4"/> WhatsApp</a>
              </div>
              <div className="flex gap-8">
                {[{v:"12+",l:"Years"},{v:"8K+",l:"Patients"},{v:"4.8★",l:"Rating"}].map(s=><div key={s.l}><p className="text-2xl font-bold text-[#0d9488]">{s.v}</p><p className="text-xs text-[#9b8e7e]">{s.l}</p></div>)}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-[#0d9488]/10 border-4 border-white"><img src="https://placehold.co/600x720/e6f5f3/0d9488?text=Doctor" alt="Doctor" className="w-full"/></div>
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 float border border-[#e8dfd3]">
                <div className="h-11 w-11 bg-[#fef3cd] rounded-full flex items-center justify-center"><Heart className="h-5 w-5 text-[#f59e0b]"/></div>
                <div><p className="font-bold text-sm">Caring Since 2014</p><p className="text-xs text-[#9b8e7e]">12+ Years</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl sm:text-4xl font-bold text-[#2d3436] mb-4" style={{fontFamily:"'DM Serif Display',serif"}}>Our Services</h2><p className="text-[#7a7067] max-w-lg mx-auto">Gentle, evidence-based care across all specialties.</p></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(s=>{const Icon=s.icon;return(
              <div key={s.name} className="group bg-[#faf7f2] rounded-2xl p-6 border border-[#e8dfd3] hover:border-[#0d9488]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="h-14 w-14 bg-[#0d9488]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#0d9488] transition-colors"><Icon className="h-7 w-7 text-[#0d9488] group-hover:text-white transition-colors"/></div>
                <h3 className="text-lg font-bold mb-2" style={{fontFamily:"'DM Serif Display',serif"}}>{s.name}</h3>
                <p className="text-sm text-[#7a7067] leading-relaxed">{s.desc}</p>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* Doctor */}
      <section id="doctor" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{fontFamily:"'DM Serif Display',serif"}}>Dr. Nisha Kapoor</h2>
            <p className="text-[#0d9488] font-semibold mb-5">MBBS, MD — Family Medicine & Wellness</p>
            <div className="flex flex-wrap gap-2 mb-6">{["Holistic Approach","12+ Years","AFIH Certified","8K+ Families"].map(b=><span key={b} className="text-xs bg-[#0d9488]/10 text-[#0d9488] px-3 py-1.5 rounded-full font-semibold">{b}</span>)}</div>
            <p className="text-[#7a7067] leading-relaxed mb-4">Dr. Kapoor believes in treating the whole person — mind, body, and spirit. Her practice integrates modern diagnostics with wellness-focused prevention.</p>
            <p className="text-[#7a7067] leading-relaxed mb-8">She&apos;s known for her unhurried consultations, warm bedside manner, and her ability to make every patient feel truly heard.</p>
            <a href="#appointment" className="inline-flex items-center gap-2 bg-[#0d9488] text-white font-semibold px-6 py-3 rounded-full shadow-md shadow-[#0d9488]/20 hover:-translate-y-0.5 transition-all">Meet Dr. Kapoor <ChevronRight className="h-4 w-4"/></a>
          </div>
          <div className="order-1 lg:order-2 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white"><img src="https://placehold.co/550x650/e6f5f3/0d9488?text=Dr.+Kapoor" alt="Dr. Kapoor" className="w-full"/></div>
        </div>
      </section>

      {/* Timings */}
      <section id="timings" className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><h2 className="text-3xl font-bold mb-4" style={{fontFamily:"'DM Serif Display',serif"}}>Visit Timings</h2></div>
          <div className="bg-[#faf7f2] rounded-3xl overflow-hidden border border-[#e8dfd3]">
            <div className="bg-[#0d9488] p-4 grid grid-cols-3 text-white text-sm font-bold"><span className="px-4">Day</span><span className="px-4">Morning</span><span className="px-4">Evening</span></div>
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d,i)=><div key={d} className={`grid grid-cols-3 text-sm ${i%2===0?"bg-transparent":"bg-white/50"} border-b border-[#e8dfd3] hover:bg-[#0d9488]/5 transition-colors`}><span className="px-6 py-4 font-semibold">{d}</span><span className="px-6 py-4 text-[#7a7067]">9:30 AM – 1:00 PM</span><span className="px-6 py-4 text-[#7a7067]">4:30 PM – 7:30 PM</span></div>)}
            <div className="grid grid-cols-3 text-sm bg-amber-50"><span className="px-6 py-4 font-semibold text-amber-700">Sunday</span><span className="px-6 py-4 text-amber-600 col-span-2">10 AM – 1 PM (By Appointment)</span></div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl font-bold mb-4" style={{fontFamily:"'DM Serif Display',serif"}}>Kind Words</h2></div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(t=><div key={t.name} className="bg-white rounded-2xl p-6 border border-[#e8dfd3] hover:shadow-lg transition-all">
              <div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-[#f59e0b] fill-[#f59e0b]"/>)}</div>
              <p className="text-sm text-[#7a7067] leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#e8dfd3]"><div className="h-10 w-10 bg-[#0d9488]/10 rounded-full flex items-center justify-center text-[#0d9488] font-bold text-xs">{t.img}</div><div><p className="font-bold text-sm">{t.name}</p><p className="text-[11px] text-[#9b8e7e]">Verified Patient</p></div></div>
            </div>)}
          </div>
        </div>
      </section>

      {/* Appointment */}
      <section id="appointment" className="py-24 bg-[#0d9488]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-3xl font-bold text-white mb-3" style={{fontFamily:"'DM Serif Display',serif"}}>Visit Us</h2><p className="text-teal-100">Walk-ins welcome · Online booking available</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white rounded-3xl p-7 sm:p-10 shadow-2xl">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-[#2d3436] mb-1.5">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 border border-[#e8dfd3] rounded-xl text-sm focus:ring-2 focus:ring-[#0d9488] outline-none" placeholder="Your name"/></div><div><label className="block text-sm font-semibold text-[#2d3436] mb-1.5">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 border border-[#e8dfd3] rounded-xl text-sm focus:ring-2 focus:ring-[#0d9488] outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-[#2d3436] mb-1.5">Date *</label><input type="date" name="date" required className="w-full px-4 py-3 border border-[#e8dfd3] rounded-xl text-sm focus:ring-2 focus:ring-[#0d9488] outline-none"/></div><div><label className="block text-sm font-semibold text-[#2d3436] mb-1.5">Service</label><select name="service" className="w-full px-4 py-3 border border-[#e8dfd3] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#0d9488] outline-none"><option value="">Choose...</option>{services.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold text-[#2d3436] mb-1.5">Notes</label><textarea name="message" rows={3} className="w-full px-4 py-3 border border-[#e8dfd3] rounded-xl text-sm focus:ring-2 focus:ring-[#0d9488] outline-none resize-none" placeholder="Anything we should know..."/></div>
            <button type="submit" className="w-full bg-[#0d9488] hover:bg-[#0b7e74] text-white font-bold py-4 rounded-full shadow-md">Book Appointment</button>
          </form>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-12"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="rounded-3xl overflow-hidden border border-[#e8dfd3]"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.14571458693!2d72.71637258436986!3d19.08219783259688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai!5e0!3m2!1sen!2sin!4v1711111111111" width="100%" height="300" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Location"/></div></div></section>

      <footer className="bg-[#2d3436] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><div className="h-8 w-8 bg-[#0d9488] rounded-full flex items-center justify-center"><Leaf className="h-4 w-4 text-white"/></div><span className="font-bold" style={{fontFamily:"'DM Serif Display',serif"}}>CareNest</span></div>
          <p className="text-xs text-gray-500">© 2026 CareNest Wellness Clinic · Built with ❤️ by SecureCodeReviews</p>
          <div className="flex gap-4 text-sm text-gray-400"><a href="tel:+919999999999" className="hover:text-[#0d9488] flex items-center gap-1"><Phone className="h-3.5 w-3.5"/>Call</a><a href="mailto:hello@carenest.in" className="hover:text-[#0d9488] flex items-center gap-1"><Mail className="h-3.5 w-3.5"/>Email</a></div>
        </div>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
