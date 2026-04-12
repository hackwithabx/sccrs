"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, ChevronRight, MessageCircle, Instagram, Facebook, UtensilsCrossed, Wine, Flame, ChefHat } from "lucide-react";

const menuCategories = ["Starters","Main Course","Desserts","Drinks"] as const;
const menuItems: Record<string,{name:string;desc:string;price:string;tag?:string}[]> = {
  Starters:[{name:"Paneer Tikka",desc:"Smoky cottage cheese with mint chutney",price:"₹349"},{name:"Mutton Seekh Kebab",desc:"Hand-minced spiced lamb on charcoal",price:"₹429",tag:"Chef's Pick"},{name:"Prawn Tempura",desc:"Crispy battered prawns, wasabi mayo",price:"₹499"},{name:"Mushroom Galouti",desc:"Melt-in-mouth mushroom patties",price:"₹299"}],
  "Main Course":[{name:"Butter Chicken",desc:"Iconic creamy tomato curry, naan",price:"₹449",tag:"Bestseller"},{name:"Dal Makhani",desc:"24-hour slow cooked black lentils",price:"₹349"},{name:"Grilled Sea Bass",desc:"Herb-crusted with lemon beurre blanc",price:"₹699"},{name:"Lamb Biryani",desc:"Fragrant basmati, tender lamb, saffron",price:"₹549"}],
  Desserts:[{name:"Gulab Jamun Cheesecake",desc:"Fusion dessert with cardamom cream",price:"₹299",tag:"Must Try"},{name:"Rasmalai Tres Leches",desc:"Indian-inspired milk cake",price:"₹349"},{name:"Dark Chocolate Fondant",desc:"Molten center, vanilla ice cream",price:"₹399"},{name:"Kulfi Falooda",desc:"Traditional Indian ice cream parfait",price:"₹249"}],
  Drinks:[{name:"Signature Old Fashioned",desc:"Bourbon, bitters, orange zest",price:"₹549"},{name:"Mango Lassi Martini",desc:"Tropical yogurt cocktail",price:"₹449"},{name:"Masala Chai Espresso",desc:"Spiced tea meets Italian coffee",price:"₹249"},{name:"Rose Sharbat Mojito",desc:"Refreshing rose & mint cooler",price:"₹299"}],
};
const reviews = [{name:"Arjun M.",text:"The ambiance is absolutely breathtaking. Butter Chicken here is the best I've had. Period.",stars:5},{name:"Meera S.",text:"We hosted our anniversary here. The service, food, and attention to detail were impeccable.",stars:5},{name:"Rohan K.",text:"Gulab Jamun Cheesecake is a must-try. Creative menu with incredible execution.",stars:5}];
const navLinks = ["Home","Menu","Gallery","About","Reserve"];

export default function RestaurantV1() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>("Starters");
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .float{animation:float 6s ease-in-out infinite}
        h1,h2,.serif{font-family:'Playfair Display',serif} *{font-family:'Plus Jakarta Sans',system-ui,sans-serif}`}</style>

      <div className="bg-[#d4a017]/10 text-[#d4a017] text-xs text-center py-2.5 px-4 border-b border-[#d4a017]/10">
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:text-white">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#0c0c0c]/90 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2"><div className="h-9 w-9 bg-[#d4a017] rounded-lg flex items-center justify-center"><UtensilsCrossed className="h-4 w-4 text-black"/></div><div><span className="text-xl font-bold serif text-[#d4a017]">Saffron</span><span className="block text-[9px] text-gray-500 tracking-[0.2em] uppercase -mt-0.5">Fine Dining</span></div></a>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-400 hover:text-[#d4a017] px-3.5 py-2 rounded-lg transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3"><a href="#reserve" className="hidden sm:inline-flex bg-[#d4a017] text-black text-sm font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-[#d4a017]/20 hover:-translate-y-0.5 transition-all">Reserve Table</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-white/5">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-gray-400 hover:text-[#d4a017]">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0"><img src="https://placehold.co/1920x1080/1a1a1a/d4a017?text=Fine+Dining+Ambiance" alt="Restaurant" className="w-full h-full object-cover opacity-40"/><div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"/></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-8"><div className="h-px w-12 bg-[#d4a017]"/><span className="text-[#d4a017] text-sm font-semibold tracking-[0.2em] uppercase">Est. 2015</span></div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 serif">
              Where <span className="text-[#d4a017] italic">Flavour</span><br/>Meets Art
            </h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-lg">An exquisite culinary journey blending Indian heritage with modern gastronomy. Every dish tells a story.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#reserve" className="inline-flex items-center gap-2 bg-[#d4a017] text-black font-bold px-8 py-4 rounded-lg shadow-xl shadow-[#d4a017]/20 hover:-translate-y-0.5 transition-all text-sm tracking-wide uppercase">Reserve a Table</a>
              <a href="#menu" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-lg border border-white/20 hover:bg-white/5 transition-all text-sm tracking-wide uppercase">View Menu</a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-8 text-center">
          {[{v:"10+",l:"Years"},{v:"50K+",l:"Guests"},{v:"4.9",l:"Rating"}].map(s=><div key={s.l}><p className="text-2xl font-bold text-[#d4a017] serif">{s.v}</p><p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.l}</p></div>)}
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><div className="flex items-center justify-center gap-3 mb-4"><div className="h-px w-8 bg-[#d4a017]"/><span className="text-[#d4a017] text-xs tracking-[0.2em] uppercase font-semibold">Culinary Excellence</span><div className="h-px w-8 bg-[#d4a017]"/></div><h2 className="text-4xl font-bold serif">Our Menu</h2></div>
          <div className="flex flex-wrap justify-center gap-3 mb-12">{menuCategories.map(c=><button key={c} onClick={()=>setActiveMenu(c)} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeMenu===c?"bg-[#d4a017] text-black shadow-lg shadow-[#d4a017]/20":"bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"}`}>{c}</button>)}</div>
          <div className="space-y-3">
            {menuItems[activeMenu]?.map(item=><div key={item.name} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-[#d4a017]/5 hover:border-[#d4a017]/20 transition-all group">
              <div className="flex-1"><div className="flex items-center gap-2 mb-1"><h3 className="font-bold group-hover:text-[#d4a017] transition-colors">{item.name}</h3>{item.tag&&<span className="text-[10px] bg-[#d4a017]/20 text-[#d4a017] px-2 py-0.5 rounded-full font-semibold">{item.tag}</span>}</div><p className="text-sm text-gray-500">{item.desc}</p></div>
              <span className="text-[#d4a017] font-bold text-lg serif shrink-0 ml-4">{item.price}</span>
            </div>)}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-24 bg-[#111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><h2 className="text-4xl font-bold serif">Gallery</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({length:6}).map((_,i)=><div key={i} className="group rounded-xl overflow-hidden"><img src={`https://placehold.co/400x300/1a1a1a/d4a017?text=Dish+${i+1}`} alt={`Dish ${i+1}`} className="w-full h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-700"/></div>)}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="rounded-2xl overflow-hidden border border-white/10"><img src="https://placehold.co/600x500/1a1a1a/d4a017?text=Our+Chef" alt="Chef" className="w-full"/></div>
          <div>
            <div className="flex items-center gap-3 mb-6"><div className="h-px w-8 bg-[#d4a017]"/><span className="text-[#d4a017] text-xs tracking-[0.2em] uppercase font-semibold">Our Story</span></div>
            <h2 className="text-3xl font-bold serif mb-4">Chef Arjun Raghav</h2>
            <p className="text-gray-400 leading-relaxed mb-4">Trained at Le Cordon Bleu, Paris, Chef Arjun brings 18 years of culinary mastery to Saffron. His philosophy: honor Indian ingredients with global techniques.</p>
            <p className="text-gray-400 leading-relaxed mb-6">Every dish is crafted from locally-sourced, seasonal ingredients — ensuring peak freshness and flavour in every bite.</p>
            <div className="flex gap-6">{[{v:"18+",l:"Years"},{v:"5",l:"Awards"},{v:"200+",l:"Recipes"}].map(s=><div key={s.l}><p className="text-xl font-bold text-[#d4a017] serif">{s.v}</p><p className="text-xs text-gray-500">{s.l}</p></div>)}</div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-[#111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-3xl font-bold serif">Guest Reviews</h2></div>
          <div className="grid md:grid-cols-3 gap-5">{reviews.map(r=><div key={r.name} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-[#d4a017]/20 transition-all"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-[#d4a017] fill-[#d4a017]"/>)}</div><p className="text-sm text-gray-300 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-[#d4a017]">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Reservation */}
      <section id="reserve" className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-4xl font-bold serif mb-3">Reserve a Table</h2><p className="text-gray-400">Book your unforgettable dining experience.</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-7 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-[#d4a017] outline-none" placeholder="Your name"/></div><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-[#d4a017] outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-3 gap-4 mb-4"><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Date *</label><input type="date" name="date" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-[#d4a017] outline-none"/></div><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Time *</label><select name="time" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-[#d4a017] outline-none"><option value="">Select...</option>{["12:00 PM","1:00 PM","7:00 PM","8:00 PM","9:00 PM"].map(t=><option key={t} value={t}>{t}</option>)}</select></div><div><label className="block text-sm font-semibold text-gray-300 mb-1.5">Guests *</label><select name="guests" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-[#d4a017] outline-none"><option value="">Select...</option>{[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} {n===1?"Guest":"Guests"}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold text-gray-300 mb-1.5">Special Requests</label><textarea name="requests" rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-[#d4a017] outline-none resize-none" placeholder="Dietary needs, celebrations..."/></div>
            <button type="submit" className="w-full bg-[#d4a017] text-black font-bold py-4 rounded-xl shadow-lg shadow-[#d4a017]/20">Confirm Reservation</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2"><div className="h-8 w-8 bg-[#d4a017] rounded-lg flex items-center justify-center"><UtensilsCrossed className="h-4 w-4 text-black"/></div><span className="font-bold serif text-[#d4a017]">Saffron</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>Bandra West, Mumbai</span><span><Clock className="h-3.5 w-3.5 inline mr-1"/>12 PM – 11 PM</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 99999 99999</span></div>
          <div className="flex gap-3">{[Instagram,Facebook].map((Icon,i)=><a key={i} href="#" className="h-9 w-9 bg-white/5 hover:bg-[#d4a017] rounded-lg flex items-center justify-center text-gray-400 hover:text-black transition-all"><Icon className="h-4 w-4"/></a>)}</div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-8">© 2026 Saffron Fine Dining · Built with ❤️ by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
