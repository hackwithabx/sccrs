"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Star, Menu, X, Clock,
  GraduationCap, BookOpen, FlaskConical, Trophy, Users, Award,
  MessageCircle, ChevronRight, Target, Atom,
} from "lucide-react";

const courses = [
  { name: "JEE Main & Advanced", duration: "2 Years (11th & 12th)", batch: "40 Students/Batch", timing: "6:00 AM – 9:00 AM", fees: "₹1,25,000/year", color: "from-blue-600 to-blue-400", icon: Atom },
  { name: "NEET UG", duration: "2 Years (11th & 12th)", batch: "45 Students/Batch", timing: "9:00 AM – 12:00 PM", fees: "₹1,15,000/year", color: "from-green-600 to-emerald-400", icon: FlaskConical },
  { name: "MHT-CET", duration: "1 Year (12th)", batch: "50 Students/Batch", timing: "4:00 PM – 7:00 PM", fees: "₹75,000/year", color: "from-purple-600 to-violet-400", icon: BookOpen },
  { name: "Foundation (8th–10th)", duration: "1–3 Years", batch: "35 Students/Batch", timing: "Weekend Batches", fees: "₹45,000/year", color: "from-orange-600 to-amber-400", icon: Target },
];

const toppers = [
  { name: "Aditya Sharma", rank: "AIR 156 – JEE Advanced", year: "2025", college: "IIT Bombay – CSE", score: "312/360" },
  { name: "Priya Patil", rank: "AIR 89 – NEET UG", year: "2025", college: "AIIMS Delhi – MBBS", score: "705/720" },
  { name: "Rahul Deshmukh", rank: "AIR 234 – JEE Main", year: "2025", college: "IIT Delhi – ECE", score: "298/300" },
  { name: "Sneha Kulkarni", rank: "99.8 Percentile – MHT-CET", year: "2024", college: "COEP Pune – CS", score: "196/200" },
  { name: "Vikram Joshi", rank: "AIR 412 – JEE Advanced", year: "2024", college: "IIT Madras – Mech", score: "289/360" },
  { name: "Ananya Rao", rank: "AIR 67 – NEET UG", year: "2024", college: "JIPMER – MBBS", score: "710/720" },
];

const faculty = [
  { name: "Prof. Suresh Iyer", subject: "Physics", qualification: "IIT Bombay Alumnus, M.Tech", exp: "18 Years", img: "https://placehold.co/300x360/1a3c6e/f97316?text=Prof.+Iyer" },
  { name: "Dr. Meena Shah", subject: "Chemistry", qualification: "PhD Chemistry, NIT Trichy", exp: "15 Years", img: "https://placehold.co/300x360/1a3c6e/f97316?text=Dr.+Shah" },
  { name: "Prof. Amit Kulkarni", subject: "Mathematics", qualification: "IIT Kanpur Alumnus, M.Sc", exp: "20 Years", img: "https://placehold.co/300x360/1a3c6e/f97316?text=Prof.+Kulkarni" },
];

const testimonials = [
  { name: "Aditya Sharma", rank: "AIR 156 – JEE", text: "The faculty here is world-class. Prof. Iyer's physics classes changed my entire approach to problem-solving. I owe my IIT selection to this institute." },
  { name: "Priya Patil", rank: "AIR 89 – NEET", text: "The doubt-clearing sessions and weekly tests kept me on track. Dr. Shah's chemistry tricks made organic chemistry fun and easy to remember." },
  { name: "Sneha Kulkarni", rank: "99.8% MHT-CET", text: "Joining the MHT-CET batch was the best decision. The focused syllabus coverage and mock tests prepared me perfectly for the exam." },
];

const navLinks = ["Home", "Courses", "Results", "Faculty", "Contact"];

export default function CoachingTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Demo Bar */}
      <div className="bg-[#f97316] text-white text-xs text-center py-2 px-4 font-medium">
        <span className="opacity-80">This is a demo template by </span>
        <Link href="/demos" className="underline font-bold hover:opacity-80 transition-opacity">SecureCodeReviews</Link>
        <span className="opacity-80"> · </span>
        <Link href="/demos" className="underline opacity-80 hover:opacity-100">← View all templates</Link>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#home" className="flex items-center gap-2">
              <div className="h-9 w-9 bg-[#1a3c6e] rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-[#f97316]" />
              </div>
              <span className="text-xl font-bold text-[#1a3c6e]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Apex<span className="text-[#f97316]">IQ</span>
              </span>
            </a>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-gray-600 hover:text-[#1a3c6e] transition-colors font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {link}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a href="#contact" className="hidden sm:inline-flex bg-[#f97316] hover:bg-[#ea6c0e] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Enquire Now
              </a>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm text-gray-600 hover:text-[#1a3c6e] font-medium">
                  {link}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section id="home" className="relative bg-[#1a3c6e] overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://placehold.co/1920x900/0f2a50/f97316?text=Students+Studying" alt="Students" className="w-full h-full object-cover opacity-15" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#f97316]/20 text-[#f97316] text-sm font-bold px-4 py-1.5 rounded-full mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <Trophy className="h-4 w-4" /> #1 Coaching Institute in Pune
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Pune&apos;s Most Trusted <span className="text-[#f97316]">JEE & NEET</span> Coaching
            </h1>
            <p className="text-lg text-gray-300 mb-10 leading-relaxed">
              Transform your dreams into reality. Expert faculty from IITs and NITs, proven methodology, and a track record of 200+ selections every year.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea6c0e] text-white font-bold px-7 py-3.5 rounded-lg transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Enquire Now <ChevronRight className="h-4 w-4" />
              </a>
              <a href="#courses" className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-bold px-7 py-3.5 rounded-lg transition-all" style={{ fontFamily: "'Poppins', sans-serif" }}>
                View Courses
              </a>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-8 border-t border-white/10">
            {[
              { value: "5,000+", label: "Students Enrolled" },
              { value: "12", label: "Years of Excellence" },
              { value: "200+", label: "Selections/Year" },
              { value: "95%", label: "Success Rate" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-[#f97316]" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ COURSES ══════════════════════ */}
      <section id="courses" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-[#f97316] mb-2 tracking-wide uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Programs</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>Our Courses & Batches</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {courses.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                  <div className={`h-2 bg-gradient-to-r ${c.color}`} />
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`h-14 w-14 bg-gradient-to-br ${c.color} rounded-xl flex items-center justify-center shrink-0`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>{c.name}</h3>
                        <p className="text-sm text-gray-500">{c.duration}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Batch Size</p>
                        <p className="text-sm font-semibold">{c.batch}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Timing</p>
                        <p className="text-sm font-semibold">{c.timing}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Starting from</p>
                        <p className="text-xl font-bold text-[#1a3c6e]" style={{ fontFamily: "'Poppins', sans-serif" }}>{c.fees}</p>
                      </div>
                      <a href="#contact" className="bg-[#f97316] hover:bg-[#ea6c0e] text-white font-bold px-5 py-2.5 rounded-lg transition-colors text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Enquire
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Batch Timing Table */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: "'Poppins', sans-serif" }}>Batch Schedule</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-[#1a3c6e] text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Batch</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Timing</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Physics</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Chemistry</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Maths/Bio</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { batch: "Morning A", time: "6:00 – 9:00 AM", phy: "Mon, Wed", chem: "Tue, Thu", math: "Fri, Sat" },
                    { batch: "Morning B", time: "9:00 – 12:00 PM", phy: "Tue, Thu", chem: "Mon, Wed", math: "Fri, Sat" },
                    { batch: "Evening", time: "4:00 – 7:00 PM", phy: "Mon, Wed", chem: "Tue, Thu", math: "Fri, Sat" },
                    { batch: "Weekend", time: "9:00 AM – 4:00 PM", phy: "Saturday", chem: "Saturday", math: "Sunday" },
                  ].map((row, i) => (
                    <tr key={row.batch} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-100`}>
                      <td className="px-6 py-3 text-sm font-semibold">{row.batch}</td>
                      <td className="px-6 py-3 text-sm text-[#f97316] font-medium">{row.time}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{row.phy}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{row.chem}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{row.math}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ TOPPERS ══════════════════════ */}
      <section id="results" className="py-20 bg-gradient-to-b from-[#1a3c6e] to-[#0f2a50]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-[#f97316] mb-2 tracking-wide uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Our Pride</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Star Performers</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {toppers.map((t) => (
              <div key={t.name} className="bg-white/5 backdrop-blur-sm border border-[#f97316]/20 rounded-2xl p-6 relative overflow-hidden hover:border-[#f97316]/50 transition-all group">
                {/* Gold highlight glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#f97316]/10 rounded-bl-full" />
                <div className="absolute top-3 right-3">
                  <Trophy className="h-5 w-5 text-[#f97316]" />
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-[#f97316] to-amber-400 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>{t.name.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>{t.name}</h3>
                    <p className="text-[#f97316] text-sm font-semibold">{t.rank}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white/5 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase">Score</p>
                    <p className="text-sm font-bold text-white">{t.score}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase">Year</p>
                    <p className="text-sm font-bold text-white">{t.year}</p>
                  </div>
                </div>
                <div className="bg-[#f97316]/10 rounded-lg p-2.5">
                  <p className="text-[10px] text-[#f97316] uppercase font-semibold">Selected At</p>
                  <p className="text-sm font-bold text-white">{t.college}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ FACULTY ══════════════════════ */}
      <section id="faculty" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-[#f97316] mb-2 tracking-wide uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Expert Faculty</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>Learn From the Best</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {faculty.map((f) => (
              <div key={f.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <img src={f.img} alt={f.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="text-lg font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>{f.name}</h3>
                  <p className="text-[#f97316] font-semibold text-sm">{f.subject}</p>
                  <p className="text-gray-500 text-sm mt-1">{f.qualification}</p>
                  <div className="mt-3 inline-flex items-center gap-1 bg-[#1a3c6e]/10 text-[#1a3c6e] text-xs font-semibold px-3 py-1 rounded-full">
                    <Award className="h-3.5 w-3.5" /> {f.exp} Experience
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-[#f97316] mb-2 tracking-wide uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Success Stories</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>Student Testimonials</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-[#f97316] fill-[#f97316]" />
                  ))}
                </div>
                <p className="text-gray-600 mb-5 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="h-10 w-10 bg-gradient-to-br from-[#f97316] to-amber-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-[#f97316]">{t.rank}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ ADMISSION FORM ══════════════════════ */}
      <section id="contact" className="py-20 bg-[#1a3c6e]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Admission Enquiry</h2>
            <p className="text-blue-200 mt-3">Fill the form and our counselors will contact you within 24 hours.</p>
          </div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Student Name *</label>
                <input type="text" name="student_name" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none" placeholder="Student's name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Name *</label>
                <input type="text" name="parent_name" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none" placeholder="Parent's name" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                <input type="tel" name="phone" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none" placeholder="+91 99999 99999" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none" placeholder="student@email.com" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Exam *</label>
                <select name="target_exam" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none">
                  <option value="">Select exam...</option>
                  <option>JEE Main & Advanced</option>
                  <option>NEET UG</option>
                  <option>MHT-CET</option>
                  <option>Foundation (8th-10th)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Batch *</label>
                <select name="batch" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none">
                  <option value="">Select batch...</option>
                  <option>Morning A (6-9 AM)</option>
                  <option>Morning B (9-12 PM)</option>
                  <option>Evening (4-7 PM)</option>
                  <option>Weekend</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message (Optional)</label>
              <textarea name="message" rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none resize-none" placeholder="Current class, school name, any specific questions..." />
            </div>
            <button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea6c0e] text-white font-bold py-3.5 rounded-lg transition-colors text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Submit Enquiry
            </button>
          </form>

          {/* Map */}
          <div className="mt-12 rounded-2xl overflow-hidden border border-white/10">
            {/*
              GOOGLE MAPS EMBED:
              Replace the src with your institute's Google Maps embed URL.
            */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d242117.68082427554!2d73.72288309453122!3d18.524598710773886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1711111111111"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Institute Location"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="bg-gray-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-9 w-9 bg-[#1a3c6e] rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-[#f97316]" />
                </div>
                <span className="text-xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>Apex<span className="text-[#f97316]">IQ</span></span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Pune&apos;s premier coaching institute for JEE, NEET, and MHT-CET. Shaping futures since 2014.
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
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Contact</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#f97316]" /> +91 99999 99999</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#f97316]" /> info@apexiq.edu</li>
                <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-[#f97316] mt-0.5" /> 78 Knowledge Park, Kothrud, Pune</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Affiliations</h4>
              <div className="flex flex-wrap gap-2">
                {["ISO 9001:2015", "AICTE Partner", "Education Board"].map((a) => (
                  <span key={a} className="text-[10px] bg-white/10 px-2 py-1 rounded-full text-gray-300">{a}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-8 text-center text-xs text-gray-500">
            © 2026 ApexIQ Coaching Institute. All rights reserved. | Built with ❤️ by SecureCodeReviews
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
