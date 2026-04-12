"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Menu, X, ChevronRight, MessageCircle, UtensilsCrossed, Flame, CircleDot } from "lucide-react";

const menuCategories = ["Sushi","Ramen","Yakitori","Desserts"] as const;
const menuItems: Record<string,{name:string;desc:string;price:string;tag?:string}[]> = {
  Sushi:[{name:"Omakase Selection",desc:"Chef's choice — 12-piece premium nigiri platter",price:"₹1,999",tag:"Signature"},{name:"Dragon Roll",desc:"Tempura shrimp, avocado, eel glaze, tobiko",price:"₹699"},{name:"Salmon Sashimi",desc:"12 slices of Norwegian salmon, fresh wasabi",price:"₹799"},{name:"Spicy Tuna Tartare",desc:"Diced tuna, chili oil, crispy wonton, yuzu",price:"₹649"}],
  Ramen:[{name:"Tonkotsu Classic",desc:"18-hour pork bone broth, chashu, ajitama",price:"₹549",tag:"Bestseller"},{name:"Miso Black Garlic",desc:"Rich miso, black garlic oil, corn, butter",price:"₹599"},{name:"Spicy Tantanmen",desc:"Sesame-chili broth, ground pork, bok choy",price:"₹549"},{name:"Vegan Shiitake",desc:"Mushroom dashi, tofu, seasonal vegetables",price:"₹449"}],
  Yakitori:[{name:"Moriawase Set",desc:"Chef's 8-skewer assortment, tare & shio",price:"₹699"},{name:"Wagyu Kushiyaki",desc:"Premium beef, truffle salt, wasabi",price:"₹899",tag:"Premium"},{name:"Tsukune",desc:"Chicken meatball, egg yolk, negi",price:"₹349"},{name:"Shiitake & Shishito",desc:"Grilled mushroom, peppers, ponzu",price:"₹299"}],
  Desserts:[{name:"Matcha Lava Cake",desc:"Molten green tea center, vanilla cream",price:"₹399",tag:"Must Try"},{name:"Mochi Ice Cream",desc:"Assorted flavors — yuzu, black sesame, sakura",price:"₹349"},{name:"Hojicha Crème Brûlée",desc:"Roasted tea custard, torched sugar",price:"₹349"},{name:"Dorayaki",desc:"Fluffy pancake, sweet azuki bean, cream",price:"₹249"}],
};
const reviews = [{name:"Karan S.",text:"The Omakase is a masterclass. Minimalist space, maximal flavour. Tokyo quality in Mumbai.",stars:5},{name:"Sneha V.",text:"The ramen here is soul-warming. Tonkotsu broth is rich, deep, and absolutely perfect.",stars:5},{name:"Aditya R.",text:"An extraordinary Japanese dining experience. The attention to detail is on another level entirely.",stars:5}];
const navLinks = ["Home","Menu","Philosophy","Reserve"];

export default function RestaurantV3() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>("Sushi");
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700;900&family=Inter:wght@400;500;600;700&display=swap');
        h1,h2,.serif{font-family:'Noto Serif JP',serif} *{font-family:'Inter',system-ui,sans-serif}
        @keyframes brush{0%{width:0}100%{width:100%}}.brush{animation:brush 1.5s ease forwards}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.float{animation:float 4s ease-in-out infinite}`}</style>

      <div className="bg-[#dc2626]/10 text-[#dc2626] text-xs text-center py-2.5 px-4 border-b border-[#dc2626]/10">
        <span className="opacity-70">Demo by </span><Link href="/demos" className="underline font-semibold hover:text-white">SecureCodeReviews</Link><span className="opacity-70"> · </span><Link href="/demos" className="underline opacity-70 hover:opacity-100">← All templates</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <a href="#home" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#dc2626] rounded-sm flex items-center justify-center"><CircleDot className="h-5 w-5 text-white"/></div>
            <div><span className="text-xl font-bold serif">園 SONO</span><span className="block text-[9px] text-gray-500 tracking-[0.3em] uppercase -mt-0.5">Japanese Kitchen</span></div>
          </a>
          <div className="hidden md:flex items-center gap-6">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-xs text-gray-500 hover:text-[#dc2626] tracking-[0.15em] uppercase transition-all font-medium">{l}</a>)}</div>
          <div className="flex items-center gap-3"><a href="#reserve" className="hidden sm:inline-flex bg-[#dc2626] text-white text-xs font-bold px-6 py-2.5 rounded-sm tracking-wider uppercase">Reserve</a><button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-500"><Menu className="h-6 w-6"/></button></div>
        </div>
        {menuOpen&&<div className="md:hidden px-4 pb-4 border-t border-white/5">{navLinks.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block py-3 text-xs text-gray-500 hover:text-[#dc2626] tracking-[0.15em] uppercase">{l}</a>)}</div>}
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-[92vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0"><img src="https://placehold.co/1920x1080/111111/dc2626?text=Japanese+Kitchen" alt="Japanese dining" className="w-full h-full object-cover opacity-30"/><div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50"/></div>
        <div className="relative px-4 sm:px-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8"><div className="h-px w-16 bg-[#dc2626]/50"/><span className="text-[#dc2626] text-xs tracking-[0.35em] uppercase font-medium">Japanese Culinary Art</span><div className="h-px w-16 bg-[#dc2626]/50"/></div>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold serif mb-6 leading-[1]">
            <span className="text-[#dc2626]">園</span><br/><span className="text-4xl sm:text-5xl lg:text-6xl">SONO</span>
          </h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-lg mx-auto">Where precision meets passion. A minimalist sanctuary for authentic Japanese cuisine — sushi, ramen, and omakase.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#reserve" className="inline-flex items-center gap-2 bg-[#dc2626] text-white font-bold px-8 py-4 rounded-sm text-xs tracking-[0.2em] uppercase">Reserve Now</a>
            <a href="#menu" className="inline-flex items-center gap-2 text-white font-medium px-8 py-4 rounded-sm border border-white/20 hover:bg-white/5 text-xs tracking-[0.2em] uppercase">Our Menu</a>
          </div>
          <div className="flex justify-center gap-12 mt-14">{[{v:"8+",l:"Yrs of Craft"},{v:"36K+",l:"Guests Served"},{v:"4.9",l:"Rating"}].map(s=><div key={s.l}><p className="text-2xl font-bold text-[#dc2626] serif">{s.v}</p><p className="text-[10px] text-gray-600 uppercase tracking-wider">{s.l}</p></div>)}</div>
        </div>
      </section>

      {/* Philosophy */}
      <section id="philosophy" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6"><div className="h-px w-8 bg-[#dc2626]"/><span className="text-[#dc2626] text-xs tracking-[0.2em] uppercase font-medium">Our Philosophy</span></div>
            <h2 className="text-4xl font-bold serif mb-5">一期一会<br/><span className="text-xl text-gray-500">Ichigo Ichie — One Lifetime, One Meeting</span></h2>
            <p className="text-gray-400 leading-relaxed mb-4">At Sono, we believe every meal is a once-in-a-lifetime encounter. Master Chef Takeshi Yamamoto trained for 15 years in Tokyo&apos;s Tsukiji district before bringing his craft to India.</p>
            <p className="text-gray-400 leading-relaxed mb-6">Each ingredient is treated with reverence. Our fish is flown in from Tsukiji Market. Our rice is Koshihikari from Niigata. The attention is in every grain, every slice.</p>
            <div className="grid grid-cols-3 gap-4">{[{v:"Tsukiji",l:"Fish Source"},{v:"15+",l:"Years Training"},{v:"Omakase",l:"Available Daily"}].map(s=><div key={s.l} className="border border-white/10 rounded-sm p-4 text-center"><p className="text-base font-bold text-[#dc2626] serif">{s.v}</p><p className="text-[9px] text-gray-600 mt-1 uppercase tracking-wider">{s.l}</p></div>)}</div>
          </div>
          <div className="rounded-sm overflow-hidden border border-white/10"><img src="https://placehold.co/600x500/111111/dc2626?text=Chef+Takeshi" alt="Chef" className="w-full"/></div>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="py-24 bg-[#111]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14"><span className="text-[#dc2626] text-xs tracking-[0.3em] uppercase font-medium">お品書き</span><h2 className="text-4xl font-bold serif mt-2">Our Menu</h2></div>
          <div className="flex flex-wrap justify-center gap-3 mb-12">{menuCategories.map(c=><button key={c} onClick={()=>setActiveMenu(c)} className={`px-6 py-2.5 rounded-sm text-xs font-bold tracking-[0.1em] uppercase transition-all ${activeMenu===c?"bg-[#dc2626] text-white":"bg-white/5 text-gray-500 hover:text-white border border-white/10"}`}>{c}</button>)}</div>
          <div className="space-y-2">
            {menuItems[activeMenu]?.map(item=><div key={item.name} className="flex items-center justify-between p-5 border-b border-white/[0.06] hover:bg-white/[0.02] transition-all group">
              <div className="flex-1"><div className="flex items-center gap-2 mb-1"><h3 className="font-bold text-sm group-hover:text-[#dc2626] transition-colors">{item.name}</h3>{item.tag&&<span className="text-[10px] bg-[#dc2626]/20 text-[#dc2626] px-2 py-0.5 rounded-sm font-bold">{item.tag}</span>}</div><p className="text-xs text-gray-600">{item.desc}</p></div>
              <div className="h-px flex-1 mx-6 border-b border-dotted border-white/10 hidden sm:block"></div>
              <span className="text-[#dc2626] font-bold serif text-lg shrink-0">{item.price}</span>
            </div>)}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-3xl font-bold serif">The Art of Food</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({length:8}).map((_,i)=><div key={i} className="group overflow-hidden"><img src={`https://placehold.co/400x400/111111/dc2626?text=料理+${i+1}`} alt={`Dish ${i+1}`} className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 hover:opacity-100"/></div>)}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-[#111]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"><div className="text-center mb-14"><h2 className="text-3xl font-bold serif">Guest Reviews</h2></div>
          <div className="grid md:grid-cols-3 gap-5">{reviews.map(r=><div key={r.name} className="border border-white/[0.06] rounded-sm p-6 hover:border-[#dc2626]/20 transition-all"><div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-3.5 w-3.5 text-[#dc2626] fill-[#dc2626]"/>)}</div><p className="text-sm text-gray-400 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p><p className="text-xs font-bold text-[#dc2626] tracking-wider uppercase">{r.name}</p></div>)}</div>
        </div>
      </section>

      {/* Reservation */}
      <section id="reserve" className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><span className="text-[#dc2626] text-xs tracking-[0.3em] uppercase font-medium">予約</span><h2 className="text-4xl font-bold serif mt-2 mb-3">Reserve Your Seat</h2><p className="text-gray-500 text-sm">Limited seating. Omakase available by reservation only.</p></div>
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="border border-white/10 rounded-sm p-7 sm:p-10 bg-white/[0.02]">
            <div className="grid sm:grid-cols-2 gap-4 mb-4"><div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Name *</label><input type="text" name="name" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-sm text-white placeholder-gray-600 focus:ring-1 focus:ring-[#dc2626] outline-none" placeholder="Your name"/></div><div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Phone *</label><input type="tel" name="phone" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-sm text-white placeholder-gray-600 focus:ring-1 focus:ring-[#dc2626] outline-none" placeholder="+91 99999 99999"/></div></div>
            <div className="grid sm:grid-cols-3 gap-4 mb-4"><div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Date *</label><input type="date" name="date" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-sm text-white focus:ring-1 focus:ring-[#dc2626] outline-none"/></div><div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Time *</label><select name="time" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-sm text-white focus:ring-1 focus:ring-[#dc2626] outline-none"><option value="">Select...</option>{["12:00 PM","1:00 PM","7:00 PM","8:00 PM","9:00 PM"].map(t=><option key={t} value={t}>{t}</option>)}</select></div><div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Guests *</label><select name="guests" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-sm text-white focus:ring-1 focus:ring-[#dc2626] outline-none"><option value="">Select...</option>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></div></div>
            <div className="mb-6"><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Notes</label><textarea name="notes" rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-sm text-white placeholder-gray-600 focus:ring-1 focus:ring-[#dc2626] outline-none resize-none" placeholder="Omakase request, dietary restrictions..."/></div>
            <button type="submit" className="w-full bg-[#dc2626] text-white font-bold py-4 rounded-sm text-xs tracking-[0.15em] uppercase">Confirm Reservation</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5"><div className="h-8 w-8 bg-[#dc2626] rounded-sm flex items-center justify-center"><CircleDot className="h-4 w-4 text-white"/></div><span className="font-bold serif text-lg">園 SONO</span></div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-600"><span><MapPin className="h-3.5 w-3.5 inline mr-1"/>Lower Parel, Mumbai</span><span><Clock className="h-3.5 w-3.5 inline mr-1"/>12 PM – 11 PM</span><span><Phone className="h-3.5 w-3.5 inline mr-1"/>+91 98765 43210</span></div>
        </div>
        <p className="text-center text-[10px] text-gray-700 mt-8 tracking-wider uppercase">© 2026 Sono Japanese Kitchen · Built by SecureCodeReviews</p>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all" aria-label="WhatsApp"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
    </div>
  );
}
