"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Clock, Star, Menu, X,
  Heart, Stethoscope, Brain, Eye, Smile, Baby,
  Calendar, MessageCircle, ChevronRight, Shield,
} from "lucide-react";

const services = [
  { icon: Stethoscope, name: "General Medicine", desc: "Comprehensive primary care for all ages including routine checkups, preventive care, and management of common illnesses." },
  { icon: Baby, name: "Paediatrics", desc: "Specialized healthcare for infants, children, and adolescents including vaccinations and developmental assessments." },
  { icon: Heart, name: "Cardiology", desc: "Advanced heart care including ECG, echo, stress tests, and management of cardiovascular conditions." },
  { icon: Brain, name: "Dermatology", desc: "Expert treatment for skin conditions, acne, allergies, and cosmetic dermatology procedures." },
  { icon: Smile, name: "Dental Care", desc: "Complete dental services from routine cleaning and fillings to root canals and cosmetic dentistry." },
  { icon: Eye, name: "Eye Care", desc: "Comprehensive eye examinations, vision correction, cataract assessment, and treatment of eye diseases." },
];

const testimonials = [
  { name: "Priya Sharma", rating: 5, text: "Dr. Mehta is extremely knowledgeable and caring. The clinic is clean and well-maintained. Highly recommended for families!" },
  { name: "Rajesh Kumar", rating: 5, text: "Been visiting this clinic for 3 years now. The staff is professional and wait times are minimal. Best doctor in the area." },
  { name: "Anita Desai", rating: 4, text: "Excellent paediatric care for my children. The doctor takes time to explain everything clearly. Very trustworthy." },
];

const navLinks = ["Home", "Services", "About", "Timings", "Testimonials", "Contact"];

export default function ClinicTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Demo Bar */}
      <div className="bg-gray-900 text-white text-xs text-center py-2 px-4">
        <span className="opacity-70">This is a demo template by </span>
        <Link href="/demos" className="underline font-medium hover:text-blue-400 transition-colors">SecureCodeReviews</Link>
        <span className="opacity-70"> · </span>
        <Link href="/demos" className="underline opacity-70 hover:opacity-100 transition-opacity">← View all templates</Link>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#home" className="flex items-center gap-2">
              <div className="h-9 w-9 bg-[#1a56db] rounded-lg flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1a56db]">MediCare</span>
            </a>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-gray-600 hover:text-[#1a56db] transition-colors font-medium">
                  {link}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a href="#appointment" className="hidden sm:inline-flex bg-[#1a56db] hover:bg-[#1544b5] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                Book Appointment
              </a>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm text-gray-600 hover:text-[#1a56db] font-medium">
                  {link}
                </a>
              ))}
              <a href="#appointment" onClick={() => setMenuOpen(false)} className="block mt-2 bg-[#1a56db] text-white text-sm font-medium px-4 py-2.5 rounded-lg text-center">
                Book Appointment
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section id="home" className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1a56db] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <Heart className="h-4 w-4" /> Trusted Healthcare
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Your Health, Our <span className="text-[#1a56db]">Priority</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Providing compassionate, comprehensive healthcare for you and your family. With over 15 years of experience, our team delivers personalized medical care you can trust.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#appointment" className="inline-flex items-center gap-2 bg-[#1a56db] hover:bg-[#1544b5] text-white font-medium px-6 py-3 rounded-lg transition-colors">
                  <Calendar className="h-4 w-4" /> Book Appointment
                </a>
                <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                  <MessageCircle className="h-4 w-4" /> WhatsApp Us
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-100">
                <div>
                  <p className="text-3xl font-bold text-[#1a56db]">15+</p>
                  <p className="text-sm text-gray-500">Years Experience</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#1a56db]">10K+</p>
                  <p className="text-sm text-gray-500">Happy Patients</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#1a56db]">6</p>
                  <p className="text-sm text-gray-500">Specializations</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img src="https://placehold.co/600x700/1a56db/white?text=Doctor+Photo" alt="Doctor" className="rounded-2xl shadow-2xl w-full object-cover" />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 hidden lg:flex items-center gap-3">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Open Today</p>
                  <p className="text-xs text-gray-500">9:00 AM – 8:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ SERVICES ══════════════════════ */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#1a56db] mb-2 tracking-wide uppercase">What We Offer</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Medical Services</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Comprehensive medical services to keep you and your family healthy and happy.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
                  <div className="h-14 w-14 bg-blue-50 group-hover:bg-[#1a56db] rounded-xl flex items-center justify-center mb-5 transition-colors">
                    <Icon className="h-7 w-7 text-[#1a56db] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{s.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                  <a href="#appointment" className="inline-flex items-center gap-1 text-sm text-[#1a56db] font-medium mt-4 hover:gap-2 transition-all">
                    Book Now <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════ ABOUT / DOCTOR PROFILE ══════════════════════ */}
      <section id="about" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img src="https://placehold.co/550x650/e8f0fe/1a56db?text=Dr.+Mehta" alt="Dr. Rajesh Mehta" className="rounded-2xl shadow-lg w-full object-cover" />
              <div className="absolute -bottom-4 -right-4 bg-[#1a56db] text-white rounded-xl p-4 shadow-lg hidden lg:block">
                <p className="text-2xl font-bold">15+</p>
                <p className="text-xs text-blue-200">Years of Practice</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a56db] mb-2 tracking-wide uppercase">Meet Our Doctor</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">Dr. Rajesh Mehta</h2>
              <p className="text-[#1a56db] font-medium text-lg mb-4">MBBS, MD (Internal Medicine)</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["15+ Years Experience", "MCI Registered", "Gold Medalist", "10,000+ Patients"].map((b) => (
                  <span key={b} className="text-xs bg-blue-50 text-[#1a56db] px-3 py-1.5 rounded-full font-medium">{b}</span>
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Dr. Rajesh Mehta is a highly experienced physician with over 15 years of practice in internal medicine. A gold medalist from Grant Medical College, Mumbai, he has treated over 10,000 patients with compassion and expertise.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                He specializes in preventive healthcare, chronic disease management, and lifestyle medicine. His patient-first approach and thorough diagnostic methods have earned him the trust of families across the city.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-[#1a56db]">10K+</p>
                  <p className="text-xs text-gray-500 mt-1">Patients Treated</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-[#1a56db]">15+</p>
                  <p className="text-xs text-gray-500 mt-1">Years Practice</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-[#1a56db]">4.9★</p>
                  <p className="text-xs text-gray-500 mt-1">Patient Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ TIMINGS ══════════════════════ */}
      <section id="timings" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#1a56db] mb-2 tracking-wide uppercase">Schedule</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Clinic Timings</h2>
            <p className="text-gray-600">Visit us during our working hours or book an appointment online.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1a56db] text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Day</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Morning</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Evening</th>
                </tr>
              </thead>
              <tbody>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, i) => (
                  <tr key={day} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-100`}>
                    <td className="px-6 py-4 text-sm font-semibold">{day}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">9:00 AM – 1:00 PM</td>
                    <td className="px-6 py-4 text-sm text-gray-600">5:00 PM – 8:00 PM</td>
                  </tr>
                ))}
                <tr className="bg-red-50">
                  <td className="px-6 py-4 text-sm font-semibold text-red-600">Sunday</td>
                  <td colSpan={2} className="px-6 py-4 text-sm text-red-500 font-medium">Closed</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Emergency consultations available 24/7 via phone.</p>
            <a href="tel:+919999999999" className="inline-flex items-center gap-2 text-[#1a56db] font-medium text-sm mt-2">
              <Phone className="h-4 w-4" /> +91 99999 99999
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
      <section id="testimonials" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#1a56db] mb-2 tracking-wide uppercase">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Patients Say</h2>
            <p className="text-gray-600">Trusted by thousands of patients across the city.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-gray-600 mb-5 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-[#1a56db] font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">Verified Patient</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ APPOINTMENT FORM ══════════════════════ */}
      <section id="appointment" className="py-20 bg-[#1a56db]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Book an Appointment</h2>
            <p className="text-blue-200">Fill out the form below and we&apos;ll confirm your appointment within 24 hours.</p>
          </div>
          {/* Formspree — replace YOUR_FORM_ID with actual Formspree endpoint */}
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input type="text" name="name" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a56db] focus:border-transparent outline-none transition-shadow" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                <input type="tel" name="phone" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a56db] focus:border-transparent outline-none transition-shadow" placeholder="+91 99999 99999" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a56db] focus:border-transparent outline-none transition-shadow" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Date *</label>
                <input type="date" name="date" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a56db] focus:border-transparent outline-none transition-shadow" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Service *</label>
              <select name="service" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a56db] focus:border-transparent outline-none transition-shadow bg-white">
                <option value="">Choose a service...</option>
                {services.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message (Optional)</label>
              <textarea name="message" rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a56db] focus:border-transparent outline-none resize-none transition-shadow" placeholder="Any additional information..." />
            </div>
            <button type="submit" className="w-full bg-[#1a56db] hover:bg-[#1544b5] text-white font-semibold py-3.5 rounded-lg transition-colors text-base">
              Confirm Appointment
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">We&apos;ll send a confirmation via SMS and email.</p>
          </form>
        </div>
      </section>

      {/* ══════════════════════ CONTACT / MAP ══════════════════════ */}
      <section id="contact" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#1a56db] mb-2 tracking-wide uppercase">Get In Touch</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Find Us</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              {[
                { icon: MapPin, label: "Address", value: "MediCare Clinic, 123 Health Avenue,\nNear City Hospital, Mumbai – 400001" },
                { icon: Phone, label: "Phone", value: "+91 99999 99999" },
                { icon: Mail, label: "Email", value: "info@medicare-clinic.com" },
                { icon: Clock, label: "Working Hours", value: "Mon–Sat: 9 AM – 1 PM, 5 PM – 8 PM\nSunday: Closed" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-[#1a56db]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">{item.label}</p>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              {/*
                GOOGLE MAPS EMBED:
                1. Go to Google Maps → Search your clinic location
                2. Click Share → Embed a map → Copy the iframe src URL
                3. Replace the src below with your URL
              */}
              <div className="rounded-2xl overflow-hidden h-full min-h-[320px] shadow-sm border border-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.14571458693!2d72.71637258436986!3d19.08219783259688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1711111111111"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "320px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Clinic Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="bg-gray-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-9 w-9 bg-[#1a56db] rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">MediCare</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Providing quality healthcare with a patient-first approach for over 15 years.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-2.5">
                {navLinks.map((l) => (
                  <li key={l}><a href={`#${l.toLowerCase()}`} className="text-sm text-gray-400 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Our Services</h4>
              <ul className="space-y-2.5">
                {services.map((s) => (
                  <li key={s.name} className="text-sm text-gray-400">{s.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Contact</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#1a56db]" /> +91 99999 99999</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#1a56db]" /> info@medicare-clinic.com</li>
                <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-[#1a56db] mt-0.5" /> 123 Health Avenue, Mumbai</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-8 text-center text-xs text-gray-500">
            © 2026 MediCare Clinic. All rights reserved. | Built with ❤️ by SecureCodeReviews
          </div>
        </div>
      </footer>

      {/* ══════════════════════ FLOATING WHATSAPP ══════════════════════ */}
      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
