import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Stethoscope,
  UtensilsCrossed,
  Building2,
  Calculator,
  GraduationCap,
  Scissors,
} from "lucide-react";

const templates = [
  {
    slug: "clinic",
    name: "Clinic & Doctor",
    description:
      "Professional medical website with appointment booking, doctor profiles, and service showcases.",
    icon: Stethoscope,
    color: "#1a56db",
    gradient: "from-blue-600 to-blue-400",
    features: [
      "Appointment Booking Form",
      "Doctor Profile & Qualifications",
      "6 Medical Services",
      "Clinic Timings Table",
      "Patient Testimonials",
    ],
    pages: 5,
  },
  {
    slug: "restaurant",
    name: "Restaurant & Café",
    description:
      "Elegant dark-themed dining website with interactive menu, photo gallery, and table reservations.",
    icon: UtensilsCrossed,
    color: "#d4a017",
    gradient: "from-amber-600 to-yellow-500",
    features: [
      "Interactive Menu Categories",
      "Table Reservation Form",
      "Photo Gallery Grid",
      "Chef's Special Section",
      "Customer Reviews",
    ],
    pages: 6,
  },
  {
    slug: "real-estate",
    name: "Real Estate Agent",
    description:
      "Premium property listing website with search filters, property details, and agent profiles.",
    icon: Building2,
    color: "#c9a84c",
    gradient: "from-yellow-700 to-amber-500",
    features: [
      "Property Search & Filters",
      "6 Property Listing Cards",
      "Detailed Property Page",
      "Agent Profile Section",
      "Inquiry & Callback Form",
    ],
    pages: 5,
  },
  {
    slug: "ca-firm",
    name: "CA / Law Firm",
    description:
      "Trustworthy corporate website for chartered accountants or law firms with FAQ and consultation.",
    icon: Calculator,
    color: "#b8960c",
    gradient: "from-yellow-800 to-yellow-600",
    features: [
      "6 Service Categories",
      "Team Partner Profiles",
      "FAQ Accordion (5 items)",
      "Free Consultation Form",
      "Client Testimonials",
    ],
    pages: 4,
  },
  {
    slug: "coaching",
    name: "Coaching Institute",
    description:
      "Motivational education website with course details, topper showcases, and admission enquiry.",
    icon: GraduationCap,
    color: "#f97316",
    gradient: "from-orange-600 to-orange-400",
    features: [
      "Course & Batch Details",
      "Toppers Showcase (Gold)",
      "Faculty Profiles",
      "Admission Enquiry Form",
      "Batch Timing Table",
    ],
    pages: 5,
  },
  {
    slug: "salon",
    name: "Salon & Spa",
    description:
      "Luxurious beauty website with services pricing, gallery, and appointment booking.",
    icon: Scissors,
    color: "#b76e79",
    gradient: "from-rose-500 to-pink-400",
    features: [
      "Service Category Tabs",
      "Membership Plans (3 Tiers)",
      "Before/After Gallery",
      "Stylist Profiles",
      "Appointment Booking Form",
    ],
    pages: 5,
  },
];

export default function DemosPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/services"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Services
          </Link>
          <Link href="/" className="text-lg font-bold">
            Secure<span className="text-blue-500">Code</span>Reviews
          </Link>
          <Link
            href="/contact"
            className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <div className="inline-block text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full mb-6">
            6 Premium Templates
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Website Templates for{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Every Business
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Professional, responsive, mobile-first websites ready to launch.
            Pick a template, customize it, and go live in days — not months.
          </p>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.slug}
                  className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Color gradient banner */}
                  <div
                    className={`h-36 bg-gradient-to-br ${t.gradient} flex items-center justify-center relative`}
                  >
                    <Icon className="h-14 w-14 text-white/80" />
                    <div className="absolute top-3 right-3 text-[10px] bg-black/20 text-white/80 px-2 py-1 rounded-full backdrop-blur-sm">
                      {t.pages} pages
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{t.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                      {t.description}
                    </p>

                    <ul className="space-y-1.5 mb-6">
                      {t.features.map((f) => (
                        <li
                          key={f}
                          className="text-xs text-gray-500 flex items-center gap-2"
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: t.color }}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/demos/${t.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg w-full justify-center transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        backgroundColor: t.color + "20",
                        color: t.color,
                      }}
                    >
                      View Live Demo <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              {
                step: "01",
                title: "Pick a Template",
                desc: "Browse our demos and choose the perfect template for your business.",
              },
              {
                step: "02",
                title: "Customize",
                desc: "We personalize colors, content, images, and branding to match your identity.",
              },
              {
                step: "03",
                title: "Go Live",
                desc: "Your website is deployed, connected to your domain, and ready for customers.",
              },
            ].map((s) => (
              <div key={s.step}>
                <div className="text-3xl font-bold text-blue-500 mb-3">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/10">
        <div className="mx-auto max-w-2xl text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Like what you see?
          </h2>
          <p className="text-gray-400 mb-8">
            Let us build a custom website tailored to your brand, audience, and
            business goals. Starting at just ₹9,999.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/919999999999?text=Hi%2C%20I%20saw%20your%20website%20demos%20and%20I%27m%20interested%20in%20getting%20a%20website%20built."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Us
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} SecureCodeReviews. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
