"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, ChevronRight, MessageCircle, UtensilsCrossed, Leaf, Salad, Sun, Heart } from "lucide-react";

const menuCategories = ["Antipasti","Pasta","Pizza","Dolci"] as const;
const menuItems: Record<string,{name:string;desc:string;price:string;tag?:string}[]> = {
  Antipasti:[{name:"Bruschetta al Pomodoro",desc:"Grilled bread, heirloom tomatoes, fresh basil",price:"₹349"},{name:"Burrata con Prosciutto",desc:"Creamy burrata, parma ham, roasted figs",price:"₹549",tag:"Signature"},{name:"Carpaccio di Manzo",desc:"Wagyu beef, truffle oil, arugula, parmesan",price:"₹599"},{name:"Zuppa di Pomodoro",desc:"Slow-roasted tomato soup, garlic croutons",price:"₹249"}],
  Pasta:[{name:"Spaghetti Carbonara",desc:"Guanciale, egg yolk, pecorino, black pepper",price:"₹449",tag:"Classic"},{name:"Linguine ai Frutti di Mare",desc:"Seafood medley, white wine, cherry tomatoes",price:"₹649"},{name:"Pappardelle al Ragù",desc:"Slow-braised beef, fresh pappardelle",price:"₹549"},{name:"Truffle Mushroom Risotto",desc:"Arborio rice, wild mushrooms, truffle cream",price:"₹599",tag:"Chef's Pick"}],
  Pizza:[{name:"Margherita DOC",desc:"San Marzano, fior di latte, fresh basil",price:"₹399",tag:"Bestseller"},{name:"Tartufo e Funghi",desc:"Truffle cream, mixed mushrooms, fontina",price:"₹599"},{name:"Prosciutto e Rucola",desc:"Parma ham, arugula, shaved parmesan",price:"₹549"},{name:"Quattro Formaggi",desc:"Mozzarella, gorgonzola, taleggio, parmesan",price:"₹499"}],
  Dolci:[{name:"Tiramisu",desc:"Classic espresso-soaked ladyfingers, mascarpone",price:"₹349",tag:"Must Try"},{name:"Panna Cotta",desc:"Vanilla bean cream, passion fruit coulis",price:"₹299"},{name:"Cannoli Siciliani",desc:"Crispy shells, ricotta, pistachio, chocolate",price:"₹349"},{name:"Affogato al Caffè",desc:"Vanilla gelato, double espresso, amaretti",price:"₹249"}],
};
const reviews = [{name:"Anisha R.",text:"The Burrata is heavenly! Warm, rustic Italian vibes with exceptional food. Our new favorite.",stars:5},{name:"Vikram D.",text:"Authentic Neapolitan pizza in Mumbai. The Margherita DOC is perfection — simple and sublime.",stars:5},{name:"Priya T.",text:"Sunday brunch here is divine. The homemade pasta and tiramisu transport you straight to Tuscany.",stars:5}];
const navLinks = ["Home","Menu","Story","Events","Book"];

export default function RestaurantV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>("Antipasti");
  return (
    <div className="min-h-screen bg-[#fffbf5] text-[#2c1810]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap');
        h1,h2,.serif{font-family:'Cormorant Garamond',serif} *{font-family:'Inter',system-ui,sans-serif}
        @keyframes fadeUp{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.8s ease forwards}`}</style>

      <div className="bg-[#c2410c] text-white text-xs text-center py-2.5 px-4">
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:opacity-100">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#fffbf5]/95 backdrop-blur-xl border-b border-[#2c1810]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-2.5">
            <div className="h-10 w-10 bg-[#c2410c] rounded-full flex items-center justify-center"><Leaf className="h-5 w-5 text-white"/></div>
            <div><span className="text-2xl font-bold serif text-[#2c1810]">Trattoria</span><span className="block text-[9px] text-[#c2410c] tracking-[0.25em] uppercase -mt-0.5 font-semibold">Bella Vita</span></div>
          </a>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-[#8b7355] hover:text-[#c2410c] px-3.5 py-2 rounded-full transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3"><a href="#book" className="hidden sm:inline-flex bg-[#c2410c] text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-[#c2410c]/20 hover:shadow-[#c2410c]/40 hover:-translate-y-0.5 transition-all">Book a Table</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-[#8b7355]"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-[#2c1810]/5">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-sm text-[#8b7355] hover:text-[#c2410c]">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0"><img src="https://placehold.co/1920x1080/f5e6d3/c2410c?text=Italian+Trattoria" alt="Trattoria" className="w-full h-full object-cover"/><div className="absolute inset-0 bg-gradient-to-r from-[#fffbf5] via-[#fffbf5]/80 to-transparent"/></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#c2410c]/10 text-[#c2410c] px-4 py-2 rounded-full text-sm font-semibold mb-8"><Sun className="h-4 w-4"/>Authentic Italian Cuisine</div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 serif text-[#2c1810]">
              La Dolce<br/><em className="text-[#c2410c]">Vita</em> Awaits
            </h1>
            <p className="text-lg text-[#8b7355] mb-10 leading-relaxed max-w-lg">Handmade pasta, wood-fired pizzas, and soulful Italian flavours — crafted with love, served with warmth. From our family to yours.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#book" className="inline-flex items-center gap-2 bg-[#c2410c] text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-[#c2410c]/25 hover:-translate-y-0.5 transition-all text-sm">Reserve Your Table <ChevronRight className="h-4 w-4"/></a>
              <a href="#menu" className="inline-flex items-center gap-2 text-[#2c1810] font-semibold px-8 py-4 rounded-full border-2 border-[#2c1810]/20 hover:bg-[#2c1810]/5 transition-all text-sm">Explore Menu</a>
            </div>
            <div className="flex gap-8 mt-12">{[{v:"10+",l:"Years of Passion"},{v:"48K+",l:"Happy Guests"},{v:"4.9★",l:"Google Rating"}].map(s=><div key={s.l}><p className="text-2xl font-bold text-[#c2410c] serif">{s.v}</p><p className="text-xs text-[#8b7355]">{s.l}</p></div>)}</div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="story" className="py-24 bg-[#f9f0e3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="rounded-[2rem] overflow-hidden shadow-2xl"><img src="https://placehold.co/600x500/e8d5c0/c2410c?text=Our+Kitchen" alt="Kitchen" className="w-full"/></div>
          <div>
            <div className="inline-flex items-center gap-2 bg-[#c2410c]/10 text-[#c2410c] px-4 py-2 rounded-full text-sm font-semibold mb-6"><Heart className="h-4 w-4"/>Our Story</div>
            <h2 className="text-4xl font-bold serif mb-4">From Nonna&apos;s Kitchen to Yours</h2>
            <p className="text-[#8b7355] leading-relaxed mb-4">Trattoria Bella Vita was born from a simple dream — to bring the warmth of an Italian family kitchen to the heart of Mumbai. Chef Marco Russo, born in Naples, trained in Modena, and in love with India.</p>
            <p className="text-[#8b7355] leading-relaxed mb-6">Every morning, our pasta is made fresh by hand. Our pizza dough ferments for 72 hours. Our ingredients are imported weekly from Italy. This is not just food — it&apos;s a love letter to la bella Italia.</p>
            <div className="grid grid-cols-3 gap-4">{[{v:"72hr",l:"Dough Ferment"},{v:"Fresh",l:"Daily Pasta"},{v:"Italian",l:"Imports Weekly"}].map(s=><div key={s.l} className="bg-white rounded-2xl p-4 text-center shadow-sm"><p className="text-xl font-bold text-[#c2410c] serif">{s.v}</p><p className="text-[10px] text-[#8b7355] mt-1 uppercase tracking-wider">{s.l}</p></div>)}</div>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><div className="inline-flex items-center gap-2 bg-[#c2410c]/10 text-[#c2410c] px-4 py-2 rounded-full text-sm font-semibold mb-4"><UtensilsCrossed className="h-4 w-4"/>Il Nostro Menu</div><h2 className="text-4xl font-bold serif">Curated with Love</h2></div>
          <div className="flex flex-wrap justify-center gap-3 mb-12">{menuCategories.map(c=><button key={c} onClick={()=>setActiveMenu(c)} className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeMenu===c?"bg-[#c2410c] text-white shadow-lg":"bg-[#2c1810]/5 text-[#8b7355] hover:bg-[#2c1810]/10"}`}>{c}</button>)}</div>
          <div className="space-y-3">
            {menuItems[activeMenu]?.map(item=><div key={item.name} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-[#2c1810]/5 hover:shadow-md hover:border-[#c2410c]/20 transition-all group">
              <div className="flex-1"><div className="flex items-center gap-2 mb-1"><h3 className="font-bold group-hover:text-[#c2410c] transition-colors serif text-lg">{item.name}</h3>{item.tag&&<span className="text-[10px] bg-[#c2410c]/10 text-[#c2410c] px-2 py-0.5 rounded-full font-bold">{item.tag}</span>}</div><p className="text-sm text-[#8b7355]">{item.desc}</p></div>
              <span className="text-[#c2410c] font-bold text-lg serif shrink-0 ml-4">{item.price}</span>
            </div>)}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 bg-[#f9f0e3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><h2 className="text-4xl font-bold serif">Moments & Flavours</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({length:6}).map((_,i)=><div key={i} className="group rounded-2xl overflow-hidden shadow-md"><img src={`https://placehold.co/400x300/e8d5c0/c2410c?text=Dish+${i+1}`} alt={`Dish ${i+1}`} className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-700"/></div>)}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-4xl font-bold serif">What Our Guests Say</h2></div>
          <div className="grid md:grid-cols-3 gap-5">{reviews.map(r=><div key={r.name} className="bg-white rounded-2xl p-7 shadow-sm border border-[#2c1810]/5 hover:shadow-lg transition-all"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-[#c2410c] fill-[#c2410c]"/>)}</div><p className="text-sm text-[#8b7355] leading-relaxed mb-4 italic serif text-base">&ldquo;{r.text}&rdquo;</p><p className="text-sm font-bold text-[#c2410c]">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="py-24 bg-[#2c1810] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold serif mb-4">Private Events & Catering</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">From intimate dinners to grand celebrations — let us curate an unforgettable Italian feast for your special occasion.</p>
          <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-10">
            {[{icon:UtensilsCrossed,t:"Private Dining",d:"Up to 40 guests"},{icon:Heart,t:"Celebrations",d:"Birthdays to weddings"},{icon:Salad,t:"Catering",d:"Custom Italian menus"}].map(e=><div key={e.t} className="bg-white/10 rounded-2xl p-5 border border-white/10"><e.icon className="h-6 w-6 text-[#c2410c] mx-auto mb-2"/><h3 className="font-bold text-sm mb-1">{e.t}</h3><p className="text-xs text-white/50">{e.d}</p></div>)}
          </div>
          <a href="#book" className="inline-flex bg-[#c2410c] text-white font-bold px-8 py-4 rounded-full shadow-lg hover:-translate-y-0.5 transition-all text-sm">Enquire Now</a>
        </div>
      </section>

      {/* Booking */}
      <section id="book" className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h2 className="text-4xl font-bold serif mb-3">Reserve Your Table</h2><p className="text-[#8b7355]">Join us for an evening of Italian hospitality.</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="bg-white rounded-3xl p-7 sm:p-10 shadow-lg border border-[#2c1810]/5">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-semibold text-[#2c1810] mb-1.5">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-[#fffbf5] border border-[#2c1810]/10 rounded-xl text-sm placeholder-[#8b7355]/50 focus:ring-2 focus:ring-[#c2410c] outline-none" placeholder="Your name"/></div><div><label className="block text-sm font-semibold text-[#2c1810] mb-1.5">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-[#fffbf5] border border-[#2c1810]/10 rounded-xl text-sm placeholder-[#8b7355]/50 focus:ring-2 focus:ring-[#c2410c] outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-3 gap-4 mb-4"><div><label className="block text-sm font-semibold text-[#2c1810] mb-1.5">Date *</label><input type="date" name="date" required className="w-full px-4 py-3 bg-[#fffbf5] border border-[#2c1810]/10 rounded-xl text-sm focus:ring-2 focus:ring-[#c2410c] outline-none"/></div><div><label className="block text-sm font-semibold text-[#2c1810] mb-1.5">Time *</label><select name="time" required className="w-full px-4 py-3 bg-[#fffbf5] border border-[#2c1810]/10 rounded-xl text-sm focus:ring-2 focus:ring-[#c2410c] outline-none"><option value="">Select...</option>{["12:30 PM","1:30 PM","7:00 PM","8:00 PM","9:30 PM"].map(t=><option key={t} value={t}>{t}</option>)}</select></div><div><label className="block text-sm font-semibold text-[#2c1810] mb-1.5">Guests *</label><select name="guests" required className="w-full px-4 py-3 bg-[#fffbf5] border border-[#2c1810]/10 rounded-xl text-sm focus:ring-2 focus:ring-[#c2410c] outline-none"><option value="">Select...</option>{[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} {n===1?"Guest":"Guests"}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-sm font-semibold text-[#2c1810] mb-1.5">Special Requests</label><textarea name="requests" rows={3} className="w-full px-4 py-3 bg-[#fffbf5] border border-[#2c1810]/10 rounded-xl text-sm placeholder-[#8b7355]/50 focus:ring-2 focus:ring-[#c2410c] outline-none resize-none" placeholder="Allergies, celebrations, seating preference..."/></div>
            <button type="submit" className="w-full bg-[#c2410c] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#c2410c]/20 hover:shadow-[#c2410c]/40 transition-all">Confirm Reservation</button>
          </form>
        </div>
      </section>

      {/* Hours + Map */}
      <section className="py-16 bg-[#f9f0e3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-7 shadow-sm">
            <h3 className="text-xl font-bold serif mb-4">Hours & Location</h3>
            <div className="space-y-3 text-sm text-[#8b7355]"><p className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#c2410c]"/>Tue – Sun: 12:00 PM – 11:00 PM</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#c2410c]"/>123, Hill Road, Bandra West, Mumbai 400050</p><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#c2410c]"/>+91 22 9876 5432</p></div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-sm"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.4!2d72.83!3d19.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAzJzAuMCJOIDcywrA0OScwLjAiRQ!5e0!3m2!1sen!2sin!4v1" width="100%" height="250" className="border-0" loading="lazy" title="Map"/></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2c1810] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5"><div className="h-9 w-9 bg-[#c2410c] rounded-full flex items-center justify-center"><Leaf className="h-4 w-4 text-white"/></div><span className="font-bold serif text-xl">Trattoria Bella Vita</span></div>
          <p className="text-sm text-white/50">© 2026 Trattoria Bella Vita · Built with ❤️ by SecureCodeReviews</p>
        </div>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
