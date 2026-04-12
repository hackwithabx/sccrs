"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Star, Menu, X, Heart, Stethoscope, Brain, Eye, Smile, Baby, Calendar, MessageCircle, ChevronRight, Shield, Activity, Award, Users } from "lucide-react";

const services = [
  { icon: Stethoscope, name: "General Medicine", desc: "Comprehensive primary care including routine checkups, preventive care, and illness management.", color: "from-blue-500 to-cyan-500" },
  { icon: Baby, name: "Paediatrics", desc: "Specialized healthcare for infants, children, and adolescents including vaccinations.", color: "from-pink-500 to-rose-400" },
  { icon: Heart, name: "Cardiology", desc: "Advanced heart care including ECG, echo, stress tests, and cardiovascular management.", color: "from-red-500 to-orange-400" },
  { icon: Brain, name: "Dermatology", desc: "Expert treatment for skin conditions, acne, allergies, and cosmetic procedures.", color: "from-purple-500 to-violet-400" },
  { icon: Smile, name: "Dental Care", desc: "Complete dental services from routine cleaning to cosmetic dentistry.", color: "from-emerald-500 to-teal-400" },
  { icon: Eye, name: "Eye Care", desc: "Comprehensive eye exams, vision correction, cataract assessment, and treatments.", color: "from-amber-500 to-yellow-400" },
];
const testimonials = [
  { name: "Priya Sharma", text: "Dr. Mehta is extremely knowledgeable and caring. The clinic is immaculate. Highly recommend!", img: "PS" },
  { name: "Rajesh Kumar", text: "Professional staff, minimal wait times. Been visiting for 3 years now. Best doctor in the area.", img: "RK" },
  { name: "Anita Desai", text: "Excellent paediatric care. The doctor explains everything clearly. Very trustworthy.", img: "AD" },
  { name: "Vikram Joshi", text: "The cardiology care here saved my life. State-of-the-art equipment and compassionate team.", img: "VJ" },
];
const navLinks = ["Home","Services","About","Timings","Reviews","Contact"];

export default function ClinicV1() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .float{animation:float 6s ease-in-out infinite}
        .shimmer{background:linear-gradient(90deg,transparent 30%,rgba(255,255,255,.4) 50%,transparent 70%);background-size:200% 100%;animation:shimmer 3s infinite}
        *{font-family:'Plus Jakarta Sans',system-ui,sans-serif}`}</style>

      {/* Demo bar */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white text-xs text-center py-2.5 px-4">
        <span className="opacity-70">Demo template by </span>
        <Link href="/demos" className="underline font-semibold text-blue-300 hover:text-white">SecureCodeReviews</Link>
        <span className="opacity-70"> · </span>
        <Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-[0_1px_20px_rgba(0,0,0,0.04)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2.5">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"><Stethoscope className="h-5 w-5 text-white"/></div>
            <div><span className="text-xl font-extrabold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">MediCare</span><span className="block text-[9px] text-gray-400 font-medium tracking-[0.2em] uppercase -mt-0.5">Health Clinic</span></div>
          </a>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3">
            <a href="#appointment" className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">Book Now</a>
            <button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600"><Menu className="h-6 w-6"/></button>
          </div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-gray-100">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-gray-600 hover:text-blue-600 font-medium">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50"/>
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl"/>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-100/40 rounded-full blur-3xl"/>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100/80 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-8 border border-blue-200/50"><Activity className="h-4 w-4"/> #1 Rated Clinic in Mumbai</div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
                Your Health, <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Our Priority</span>
              </h1>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-lg">Compassionate, comprehensive healthcare for your family. 15+ years of trusted medical expertise.</p>
              <div className="flex flex-wrap gap-3 mb-12">
                <a href="#appointment" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold px-7 py-3.5 rounded-xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"><Calendar className="h-4 w-4"/> Book Appointment</a>
                <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold px-7 py-3.5 rounded-xl border border-gray-200 hover:border-green-300 hover:text-green-600 transition-all shadow-sm"><MessageCircle className="h-4 w-4"/> WhatsApp</a>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[{v:"15+",l:"Years Exp.",ic:Award},{v:"10K+",l:"Patients",ic:Users},{v:"4.9★",l:"Rating",ic:Star}].map(s=>(
                  <div key={s.l} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <s.ic className="h-5 w-5 text-blue-500 mb-2"/><p className="text-2xl font-extrabold">{s.v}</p><p className="text-xs text-gray-400">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10"><img src="https://placehold.co/600x720/0066FF/white?text=Doctor" alt="Doctor" className="w-full"/></div>
              <div className="absolute -bottom-4 -left-4 z-20 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 float border border-gray-100">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center relative"><Clock className="h-6 w-6 text-green-600"/><span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"/></div>
                <div><p className="font-bold text-sm">Open Now</p><p className="text-xs text-gray-400">9 AM – 8 PM</p></div>
              </div>
              <div className="absolute -top-4 -right-4 z-20 bg-white rounded-2xl shadow-xl p-4 float" style={{animationDelay:"2s"}}>
                <div className="flex gap-0.5 mb-1">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400"/>)}</div>
                <p className="text-xs font-bold">4.9 Rating</p><p className="text-[10px] text-gray-400">2,500+ Reviews</p>
              </div>
              <div className="absolute -z-10 top-8 right-8 w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl opacity-20 blur-sm"/>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-gray-50/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><div className="inline-flex items-center gap-2 text-blue-600 text-sm font-semibold bg-blue-50 px-4 py-1.5 rounded-full mb-4"><Shield className="h-4 w-4"/> Our Specialties</div><h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Medical Services</h2><p className="text-gray-500 max-w-lg mx-auto">World-class healthcare across 6 specializations.</p></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(s=>{const Icon=s.icon;return(
              <div key={s.name} className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                <div className="relative z-10">
                  <div className={`h-14 w-14 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}><Icon className="h-7 w-7 text-white"/></div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-white transition-colors">{s.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed group-hover:text-blue-100 transition-colors">{s.desc}</p>
                  <a href="#appointment" className="inline-flex items-center gap-1 text-sm text-blue-600 group-hover:text-white font-semibold mt-4 hover:gap-2 transition-all">Book Now <ChevronRight className="h-4 w-4"/></a>
                </div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative"><div className="rounded-3xl overflow-hidden shadow-2xl"><img src="https://placehold.co/550x660/e0f2fe/0066FF?text=Dr.+Mehta" alt="Dr. Mehta" className="w-full"/></div><div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl p-5 shadow-xl hidden lg:block"><p className="text-3xl font-extrabold">15+</p><p className="text-xs text-blue-100">Years Experience</p></div></div>
          <div>
            <div className="inline-flex items-center gap-2 text-blue-600 text-sm font-semibold bg-blue-50 px-4 py-1.5 rounded-full mb-6"><Award className="h-4 w-4"/> Lead Physician</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">Dr. Rajesh Mehta</h2>
            <p className="text-blue-600 font-semibold text-lg mb-5">MBBS, MD — Internal Medicine</p>
            <div className="flex flex-wrap gap-2 mb-6">{["Gold Medalist","MCI Registered","15+ Years","10K+ Patients"].map(b=><span key={b} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-semibold border border-blue-100">{b}</span>)}</div>
            <p className="text-gray-500 leading-relaxed mb-4">A gold medalist from Grant Medical College, Mumbai, Dr. Mehta specializes in preventive healthcare, chronic disease management, and lifestyle medicine.</p>
            <p className="text-gray-500 leading-relaxed mb-8">His patient-first approach has earned the trust of thousands of families across the city.</p>
            <a href="#appointment" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all">Book Consultation <ChevronRight className="h-4 w-4"/></a>
          </div>
        </div>
      </section>

      {/* Timings */}
      <section id="timings" className="py-24 bg-gray-50/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><div className="inline-flex items-center gap-2 text-blue-600 text-sm font-semibold bg-blue-50 px-4 py-1.5 rounded-full mb-4"><Clock className="h-4 w-4"/> Schedule</div><h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Clinic Timings</h2></div>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 grid grid-cols-3 text-white text-sm font-bold"><span className="px-4">Day</span><span className="px-4">Morning</span><span className="px-4">Evening</span></div>
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d,i)=><div key={d} className={`grid grid-cols-3 text-sm ${i%2===0?"bg-white":"bg-blue-50/30"} border-b border-gray-100 hover:bg-blue-50/60 transition-colors`}><span className="px-6 py-4 font-semibold">{d}</span><span className="px-6 py-4 text-gray-500">9:00 AM – 1:00 PM</span><span className="px-6 py-4 text-gray-500">5:00 PM – 8:00 PM</span></div>)}
            <div className="grid grid-cols-3 text-sm bg-red-50/60"><span className="px-6 py-4 font-semibold text-red-600">Sunday</span><span className="px-6 py-4 text-red-500 font-medium col-span-2">Closed</span></div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">Emergency 24/7 · <a href="tel:+919999999999" className="text-blue-600 font-semibold">+91 99999 99999</a></p>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Loved by Thousands</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map(t=><div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400"/>)}</div>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100"><div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xs">{t.img}</div><div><p className="font-bold text-sm">{t.name}</p><p className="text-[11px] text-gray-400">Verified Patient</p></div></div>
            </div>)}
          </div>
        </div>
      </section>

      {/* Appointment */}
      <section id="appointment" className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"/><div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"/></div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Book an Appointment</h2><p className="text-blue-200">We'll confirm within 24 hours.</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white/95 backdrop-blur-xl rounded-3xl p-7 sm:p-10 shadow-2xl">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label><input type="text" name="name" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="John Doe"/></div><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label><input type="email" name="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="john@example.com"/></div><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Date *</label><input type="date" name="date" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"/></div></div>
            <div className="mb-4"><label className="block text-sm font-semibold text-gray-700 mb-1.5">Service *</label><select name="service" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"><option value="">Choose...</option>{services.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}</select></div>
            <div className="mb-6"><label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label><textarea name="message" rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Additional info..."/></div>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25">Confirm Appointment</button>
          </form>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">{[{icon:MapPin,label:"Address",value:"MediCare Clinic, 123 Health Avenue, Mumbai – 400001"},{icon:Phone,label:"Phone",value:"+91 99999 99999"},{icon:Mail,label:"Email",value:"info@medicare-clinic.com"},{icon:Clock,label:"Hours",value:"Mon–Sat: 9 AM – 1 PM, 5 PM – 8 PM"}].map(item=>{const I=item.icon;return<div key={item.label} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl hover:bg-blue-50/50 transition-colors"><div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0"><I className="h-5 w-5 text-blue-600"/></div><div><p className="font-bold text-sm">{item.label}</p><p className="text-sm text-gray-500">{item.value}</p></div></div>})}</div>
          <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 min-h-[380px]"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.14571458693!2d72.71637258436986!3d19.08219783259688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1711111111111" width="100%" height="100%" style={{border:0,minHeight:"380px"}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Location"/></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div><div className="flex items-center gap-2.5 mb-4"><div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center"><Stethoscope className="h-5 w-5 text-white"/></div><span className="text-xl font-extrabold">MediCare</span></div><p className="text-sm text-gray-400 leading-relaxed">Quality healthcare with a patient-first approach for 15+ years.</p></div>
            <div><h4 className="font-bold mb-4 text-sm">Quick Links</h4><ul className="space-y-2.5">{navLinks.map(l=><li key={l}><a href={`#${l.toLowerCase()}`} className="text-sm text-gray-400 hover:text-white transition-colors">{l}</a></li>)}</ul></div>
            <div><h4 className="font-bold mb-4 text-sm">Services</h4><ul className="space-y-2.5">{services.map(s=><li key={s.name} className="text-sm text-gray-400">{s.name}</li>)}</ul></div>
            <div><h4 className="font-bold mb-4 text-sm">Contact</h4><ul className="space-y-2.5 text-sm text-gray-400"><li>+91 99999 99999</li><li>info@medicare-clinic.com</li><li>123 Health Avenue, Mumbai</li></ul></div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-xs text-gray-500">© 2026 MediCare Clinic · Built with ❤️ by SecureCodeReviews</div>
        </div>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg shadow-green-500/25 hover:scale-110 hover:-translate-y-1 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
