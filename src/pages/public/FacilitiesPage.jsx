import React from "react";
import { BookOpen, Cpu, Shield, Sparkles, Utensils, Wifi, Activity, Home } from "lucide-react";

export const FacilitiesPage = () => {
  const facilityList = [
    {
      title: "Advanced Cloud & Supercomputing Laboratory",
      icon: Cpu,
      category: "Academic & Research",
      description: "Houses 120 high-performance workstations connected to an NVIDIA GPU cluster for Deep Learning, Data Analytics, and Computer Vision experimentation.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Central Digital Library & Research Center",
      icon: BookOpen,
      category: "Information Resources",
      description: "60,000+ volumes, automated RFID circulation, digital catalog kiosks, and subscriptions to IEEE Xplore, ScienceDirect, and ACM Digital Library.",
      image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Robotics, IoT & Embedded Systems Hub",
      icon: Sparkles,
      category: "Hardware Prototyping",
      description: "Rapid electronics prototyping with digital oscilloscopes, spectrum analyzers, pick-and-place SMD rework stations, and 3D printing equipment.",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Indoor Sports Complex & Gymnasium",
      icon: Activity,
      category: "Recreation & Athletics",
      description: "Badminton courts, synthetic basketball court, table tennis hall, well-equipped cardiovascular training gym, and professional sports trainers.",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Modern Student Residencies (Hostels)",
      icon: Home,
      category: "Campus Living",
      description: "Separate air-conditioned accommodations for male and female scholars with high-speed Wi-Fi, laundry facilities, study lounges, and 24/7 biometric security.",
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Multi-Cuisine Dining Hall & Cafeteria",
      icon: Utensils,
      category: "Dining & Social",
      description: "Hygienic food preparation with certified nutritionists, nutritious multi-cuisine menus, barista coffee bar, and spacious outdoor seating patio.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Campus Infrastructure
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Modern Learning & Living Facilities
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Providing scholars with an environment optimized for focus, practical mastery, and holistic personal growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {facilityList.map((fac, idx) => {
          const Icon = fac.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="h-48 overflow-hidden bg-slate-100">
                  <img
                    src={fac.image}
                    alt={fac.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {fac.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {fac.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {fac.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
