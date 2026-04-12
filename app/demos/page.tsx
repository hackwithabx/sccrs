"use client";
import Link from "next/link";
import { ArrowRight, Sparkles, ExternalLink } from "lucide-react";

const categories = [
  {
    name: "Clinic & Healthcare",
    color: "from-blue-500 to-cyan-500",
    ring: "ring-blue-500/20",
    templates: [
      { name: "MediCare", desc: "Modern premium clinic — blue gradient, glassmorphism", href: "/demos/clinic", tag: "Light" },
      { name: "NovaMed", desc: "Dark luxe medical — emerald glow, futuristic", href: "/demos/clinic-2", tag: "Dark" },
      { name: "CareNest", desc: "Warm & caring — cream + teal, serif typography", href: "/demos/clinic-3", tag: "Creative" },
    ],
  },
  {
    name: "Restaurant & Dining",
    color: "from-amber-500 to-orange-500",
    ring: "ring-amber-500/20",
    templates: [
      { name: "Saffron Fine Dining", desc: "Dark luxury — gold accents, Indian fine dining", href: "/demos/restaurant", tag: "Dark" },
      { name: "Trattoria Bella Vita", desc: "Warm Italian — terracotta, rustic charm", href: "/demos/restaurant-2", tag: "Warm" },
      { name: "SONO Japanese Kitchen", desc: "Minimalist Japanese — black + red, zen aesthetic", href: "/demos/restaurant-3", tag: "Minimal" },
    ],
  },
  {
    name: "Real Estate",
    color: "from-blue-600 to-indigo-600",
    ring: "ring-blue-600/20",
    templates: [
      { name: "Prestige Realty", desc: "Clean professional — blue gradient, property cards", href: "/demos/real-estate", tag: "Light" },
      { name: "Nexus Prop-Tech", desc: "AI-powered dark — emerald glow, tech-forward", href: "/demos/real-estate-2", tag: "Dark" },
      { name: "Maison Luxury", desc: "Ultra-luxury — cream + gold, serif elegance", href: "/demos/real-estate-3", tag: "Luxury" },
    ],
  },
  {
    name: "CA & Accounting Firm",
    color: "from-slate-600 to-slate-800",
    ring: "ring-slate-500/20",
    templates: [
      { name: "Mehta & Associates", desc: "Modern professional — navy-blue, clean layout", href: "/demos/ca-firm", tag: "Light" },
      { name: "Shah & Co.", desc: "Startup-focused — dark + indigo, tech-forward", href: "/demos/ca-firm-2", tag: "Dark" },
      { name: "Kapoor & Partners", desc: "Heritage firm — cream + burgundy, classic serif", href: "/demos/ca-firm-3", tag: "Classic" },
    ],
  },
  {
    name: "Coaching & Education",
    color: "from-orange-500 to-red-500",
    ring: "ring-orange-500/20",
    templates: [
      { name: "Pinnacle Academy", desc: "IIT-JEE & NEET — blue-orange gradient, results focus", href: "/demos/coaching", tag: "Light" },
      { name: "Drishti IAS", desc: "UPSC coaching — dark + yellow, authoritative", href: "/demos/coaching-2", tag: "Dark" },
      { name: "NeoCode Bootcamp", desc: "Tech bootcamp — green vibrant, placement-focused", href: "/demos/coaching-3", tag: "Modern" },
    ],
  },
  {
    name: "Salon & Beauty",
    color: "from-pink-500 to-rose-500",
    ring: "ring-pink-500/20",
    templates: [
      { name: "Aura Salon & Spa", desc: "Modern blush — rose-pink gradient, premium feel", href: "/demos/salon", tag: "Light" },
      { name: "Noir Beauty Lounge", desc: "Dark glamour — black + gold, luxury night", href: "/demos/salon-2", tag: "Dark" },
      { name: "Lavande", desc: "Dreamy lavender — purple aesthetic, Korean beauty", href: "/demos/salon-3", tag: "Creative" },
    ],
  },
];

export default function DemosPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4" />18 Premium Templates
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
            Website Demo<br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Templates</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Explore our collection of premium, production-ready website templates.
            Each template is fully responsive, beautifully designed, and ready to customize for your business.
          </p>
          <Link href="/services" className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-full hover:-translate-y-0.5 transition-all text-sm shadow-xl">
            Get Your Website Built <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="space-y-16">
          {categories.map((cat, idx) => (
            <section key={cat.name}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${cat.color}`} />
                <h2 className="text-xl sm:text-2xl font-extrabold">{cat.name}</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{cat.templates.length} designs</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.templates.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={`group relative bg-gray-50 hover:bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:ring-2 ${cat.ring} hover:-translate-y-1 transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r ${cat.color} text-white`}>
                        {t.tag}
                      </span>
                      <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold mb-1.5 group-hover:text-gray-900">{t.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">
                      Preview <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Want a website like these?</h2>
          <p className="text-gray-500 mb-6 max-w-xl mx-auto">We build custom, high-performance websites for businesses. Starting at just ₹4,999. Get yours live in 48 hours.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/services" className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-full hover:-translate-y-0.5 transition-all text-sm">
              View Our Services <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 text-white font-bold px-6 py-3 rounded-full hover:-translate-y-0.5 transition-all text-sm">
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
