"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Star, Menu, X, Clock,
  Calculator, FileText, Building, Shield, Users, BarChart3,
  ChevronDown, ChevronUp, MessageCircle, Linkedin,
} from "lucide-react";

const services = [
  { icon: FileText, name: "GST Filing & Compliance", desc: "Complete GST registration, monthly/quarterly filing, GST audits, and compliance advisory for all business types." },
  { icon: Calculator, name: "Income Tax Returns", desc: "ITR filing for individuals, HUFs, firms, and corporates. Tax planning, advance tax, and refund assistance." },
  { icon: Building, name: "Company Registration", desc: "Private Ltd, LLP, OPC, Partnership firm registration. Complete ROC compliance and annual filings." },
  { icon: Shield, name: "Audit & Assurance", desc: "Statutory audits, internal audits, tax audits, and management audits with detailed reporting." },
  { icon: Users, name: "Payroll Management", desc: "End-to-end payroll processing, PF/ESI compliance, TDS on salary, and Form 16 generation." },
  { icon: BarChart3, name: "Financial Advisory", desc: "Business financial planning, investment advisory, loan facilitation, and restructuring guidance." },
];

const team = [
  { name: "CA Rajesh Gupta", qualification: "FCA, DISA", specialization: "Tax & Audit", exp: "22 Years", img: "https://placehold.co/300x360/1e3a5f/b8960c?text=CA+Rajesh" },
  { name: "CA Priya Nair", qualification: "ACA, CPA", specialization: "Corporate Law & GST", exp: "15 Years", img: "https://placehold.co/300x360/1e3a5f/b8960c?text=CA+Priya" },
  { name: "CA Amit Verma", qualification: "FCA, LLB", specialization: "Financial Advisory", exp: "18 Years", img: "https://placehold.co/300x360/1e3a5f/b8960c?text=CA+Amit" },
];

const faqs = [
  { q: "How do I file GST returns?", a: "GST returns are filed monthly (GSTR-1, GSTR-3B) or quarterly (under QRMP scheme). You need to report your sales, purchases, and tax liability. We handle the entire process — from data collection to filing and reconciliation." },
  { q: "What documents are needed for ITR filing?", a: "For salaried individuals: Form 16, bank statements, investment proofs, property documents. For businesses: P&L statement, balance sheet, bank statements, GST returns, TDS certificates. We provide a complete checklist." },
  { q: "How long does Company Registration take?", a: "Private Limited company registration typically takes 10-15 working days after document submission. This includes DIN, DSC, name approval, and incorporation certificate from MCA." },
  { q: "What is the penalty for late GST filing?", a: "Late filing attracts a penalty of ₹50/day (₹25 CGST + ₹25 SGST) for nil returns, and ₹100/day for regular returns, up to a maximum of ₹5,000. Interest at 18% p.a. is charged on outstanding tax." },
  { q: "Do you handle GST audits?", a: "Yes, we conduct comprehensive GST audits (GSTR-9C) for businesses with turnover exceeding ₹5 crore. Our audit covers reconciliation, input tax credit verification, and compliance review." },
];

const testimonials = [
  { name: "Rahul Mehta", business: "E-Commerce", rating: 5, text: "The best CA firm I've worked with. They saved us lakhs in taxes through proper planning. Extremely responsive and professional." },
  { name: "Sneha Kapoor", business: "Restaurant Chain", rating: 5, text: "Managing GST compliance for multiple outlets was a nightmare until we found Gupta & Associates. Now everything is seamless." },
  { name: "Vikram Joshi", business: "IT Startup", rating: 4, text: "From company registration to ongoing compliance, they've handled everything. Their financial advisory helped us secure funding." },
];

const navLinks = ["Home", "Services", "Team", "Contact"];

export default function CAFirmTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap');`}</style>

      {/* Demo Bar */}
      <div className="bg-[#1e3a5f] text-white text-xs text-center py-2 px-4">
        <span className="opacity-70">This is a demo template by </span>
        <Link href="/demos" className="underline font-medium text-[#b8960c] hover:text-white transition-colors">SecureCodeReviews</Link>
        <span className="opacity-70"> · </span>
        <Link href="/demos" className="underline opacity-70 hover:opacity-100 transition-opacity">← View all templates</Link>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#home" className="flex items-center gap-2">
              <div className="h-9 w-9 bg-[#1e3a5f] rounded flex items-center justify-center">
                <Calculator className="h-5 w-5 text-[#b8960c]" />
              </div>
              <div>
                <span className="text-lg font-bold text-[#1e3a5f]" style={{ fontFamily: "'Merriweather', serif" }}>Gupta & Associates</span>
                <p className="text-[10px] text-gray-400 -mt-0.5 tracking-wide">Chartered Accountants</p>
              </div>
            </a>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-gray-600 hover:text-[#1e3a5f] transition-colors font-medium">
                  {link}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a href="#contact" className="hidden sm:inline-flex bg-[#1e3a5f] hover:bg-[#152d4a] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                Book Free Consultation
              </a>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm text-gray-600 hover:text-[#1e3a5f] font-medium">
                  {link}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section id="home" className="relative bg-[#1e3a5f] overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://placehold.co/1920x800/152d4a/b8960c?text=Professional+Office" alt="Office" className="w-full h-full object-cover opacity-15" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-[#b8960c] text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-[#b8960c]/20">
              <Shield className="h-4 w-4" /> ICAI Registered · Since 2004
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Merriweather', serif" }}>
              Trusted Chartered Accountants in <span className="text-[#b8960c]">Mumbai</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Expert GST compliance, tax planning, audit services, and business advisory for individuals and enterprises. Over 20 years of excellence.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="inline-flex items-center gap-2 bg-[#b8960c] hover:bg-[#a6850b] text-white font-medium px-6 py-3 rounded-lg transition-colors">
                Book Free Consultation
              </a>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-medium px-6 py-3 rounded-lg transition-all">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials Bar */}
      <section className="bg-[#152d4a] border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "ICAI Member", label: "Registered Firm" },
              { value: "20+ Years", label: "of Experience" },
              { value: "500+", label: "Active Clients" },
              { value: "GST Certified", label: "Practitioner" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold text-[#b8960c]" style={{ fontFamily: "'Merriweather', serif" }}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ SERVICES ══════════════════════ */}
      <section id="services" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#b8960c] mb-2 tracking-wide uppercase">What We Do</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Merriweather', serif" }}>Our Services</h2>
            <p className="text-gray-600 max-w-xl mx-auto mt-3">Comprehensive financial and compliance services to help your business grow with confidence.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1e3a5f]/20 transition-all group">
                  <div className="h-14 w-14 bg-[#1e3a5f]/5 group-hover:bg-[#1e3a5f] rounded-xl flex items-center justify-center mb-5 transition-colors">
                    <Icon className="h-7 w-7 text-[#1e3a5f] group-hover:text-[#b8960c] transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Merriweather', serif" }}>{s.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════ TEAM ══════════════════════ */}
      <section id="team" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#b8960c] mb-2 tracking-wide uppercase">Our Partners</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Merriweather', serif" }}>Meet the Team</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                <img src={t.img} alt={t.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="text-lg font-bold" style={{ fontFamily: "'Merriweather', serif" }}>{t.name}</h3>
                  <p className="text-[#b8960c] text-sm font-medium">{t.qualification}</p>
                  <p className="text-gray-500 text-sm mt-1">{t.specialization} · {t.exp}</p>
                  <a href="#" className="inline-flex items-center gap-1 text-[#1e3a5f] text-sm font-medium mt-3 hover:text-[#b8960c] transition-colors">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ FAQ ══════════════════════ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#b8960c] mb-2 tracking-wide uppercase">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Merriweather', serif" }}>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-sm pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-[#b8960c] shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#b8960c] mb-2 tracking-wide uppercase">Client Words</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Merriweather', serif" }}>What Clients Say</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? "text-[#b8960c] fill-[#b8960c]" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-gray-600 mb-5 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-gray-100">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CONSULTATION FORM ══════════════════════ */}
      <section id="contact" className="py-20 bg-[#1e3a5f]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="text-white">
              <p className="text-sm font-semibold text-[#b8960c] mb-2 tracking-wide uppercase">Get Started</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ fontFamily: "'Merriweather', serif" }}>Book a Free Consultation</h2>
              <p className="text-gray-300 leading-relaxed mb-8">
                Schedule a no-obligation consultation with our experts. We&apos;ll understand your requirements and provide a tailored solution.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: MapPin, value: "Gupta & Associates, 45-B, Marine Drive, Fort, Mumbai – 400001" },
                  { icon: Phone, value: "+91 99999 99999" },
                  { icon: Mail, value: "info@gupta-ca.com" },
                  { icon: Clock, value: "Mon–Sat: 10 AM – 7 PM" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.value} className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-[#b8960c] mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-300">{item.value}</span>
                    </div>
                  );
                })}
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-white/10">
                {/*
                  GOOGLE MAPS EMBED:
                  Replace the src with your office's Google Maps embed URL.
                */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.14571458693!2d72.71637258436986!3d19.08219783259688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1711111111111"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office Location"
                />
              </div>
            </div>

            <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl h-fit">
              <h3 className="text-xl font-bold mb-6" style={{ fontFamily: "'Merriweather', serif" }}>Free Consultation Request</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input type="text" name="name" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none" placeholder="Your name" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                    <input type="tel" name="phone" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none" placeholder="+91 99999 99999" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input type="email" name="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none" placeholder="you@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Needed *</label>
                  <select name="service" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none">
                    <option value="">Select a service...</option>
                    {services.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Brief Requirement</label>
                  <textarea name="requirement" rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none resize-none" placeholder="Tell us about your requirements..." />
                </div>
                <button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#152d4a] text-white font-semibold py-3.5 rounded-lg transition-colors">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="bg-gray-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Merriweather', serif" }}>Gupta & Associates</h3>
              <p className="text-xs text-gray-500 mb-3">Chartered Accountants</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Trusted financial partners for businesses and individuals since 2004.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Quick Links</h4>
              <ul className="space-y-2.5">
                {navLinks.map((l) => (
                  <li key={l}><a href={`#${l.toLowerCase()}`} className="text-sm text-gray-400 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Services</h4>
              <ul className="space-y-2.5">
                {services.slice(0, 4).map((s) => (
                  <li key={s.name} className="text-sm text-gray-400">{s.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Legal</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li>ICAI Reg: 12345W</li>
                <li>UDIN: XXXXXXXXXXXXXXXX</li>
                <li>GST: 27XXXXXXXXXXXZX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-8 text-center text-xs text-gray-500">
            © 2026 Gupta & Associates, Chartered Accountants. All rights reserved. | Built with ❤️ by SecureCodeReviews
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
