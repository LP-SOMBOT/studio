"use client";

export default function AnnouncementTicker() {
  const announcements = [
    "🔥 New BOOYAH PASS is now available! Get it cheap only at Oskar Shop.",
    "🚀 eFootball 2024 Coins Top-up: INSTANT delivery 24/7.",
    "🎁 Daily Spin to Win: Purchase any package and join our live stream!",
    "⭐ LEVEL UP PASS Special Discount - Limited Time Offer!",
  ];

  return (
    <div className="bg-primary/10 border-y border-primary/20 py-1.5 overflow-hidden whitespace-nowrap">
      <div className="flex animate-ticker">
        {[...announcements, ...announcements].map((text, i) => (
          <span key={i} className="mx-8 text-xs font-semibold text-primary uppercase tracking-wider">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
