import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./components/Home";
import { ServicePage } from "./components/ServicePage";
import { Booking } from "./components/Booking";
import { Admin } from "./components/Admin";
import { images, type Page } from "./data/images";

const weddingPackages = [
  {
    icon: "💍",
    name: "Half Day",
    price: "£400",
    duration: "£80 deposit",
    includes: [
      "Consultation 3 weeks before",
      "Ceremony coverage",
      "Family/couple formal photos",
      "Speeches",
      "Cake cutting",
      "1st–3rd dance",
      "Minimum of 350 edited digital images on a USB",
      "Print licence",
    ],
  },
  {
    icon: "💍",
    name: "Full Day",
    price: "£550",
    duration: "£110 deposit",
    includes: [
      "Consultation 3 weeks before",
      "Bridal preparation",
      "Ceremony coverage",
      "Family/couple formal photos",
      "Speeches",
      "Cake cutting",
      "1st–3rd dance",
      "Minimum of 350 edited digital images on a USB",
      "Print licence",
    ],
  },
];

const miniPhotoshootPackage = {
  icon: "✨",
  name: "Mini Photoshoot",
  price: "£30",
  duration: "30 minutes",
  includes: [
    "10–15 edited digital photos",
    "Any type of photoshoot",
    "Newborn, family & children",
    "Maternity & engagement",
    "Pets, brands & company",
  ],
};

const newbornPackages = [
  miniPhotoshootPackage,
  {
    icon: "👶",
    name: "Newborn Session",
    price: "From £30",
    duration: "Mini or bespoke",
    includes: [
      "Mini photoshoot option available",
      "Soft, unhurried approach",
      "In-home or studio setups",
      "Parent & sibling shots available",
      "Edited digital images",
    ],
  },
];

const familyPackages = [
  {
    ...miniPhotoshootPackage,
    icon: "👨‍👩‍👧‍👦",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    name: "Full Session",
    price: "Bespoke quote",
    duration: "60–90 minutes",
    includes: [
      "Outdoor or indoor location",
      "Multiple outfit changes",
      "Extended edited gallery",
      "Print licence available",
      "Sibling & individual shots",
    ],
  },
];

const cakeSmashPackages = [
  {
    ...miniPhotoshootPackage,
    icon: "🎂",
    name: "Mini Photoshoot",
  },
  {
    icon: "🎂",
    name: "Cake Smash",
    price: "Bespoke quote",
    duration: "Themed session",
    includes: [
      "Studio setup & themed backdrop",
      "Cake smash coverage",
      "Pre-smash portrait shots",
      "Edited digital images",
      "Print licence available",
    ],
  },
];

function Site() {
  const [page, setPage] = useState<Page>("home");

  const content = (() => {
    switch (page) {
      case "home":
        return <Home setPage={setPage} />;
      case "weddings":
        return (
          <ServicePage
            hero={images.coupleHill}
            tag="Wedding Photography"
            title="Weddings"
            intro="Your wedding day is one of the most precious chapters of your story. I document it with sensitivity, artistry, and a gentle eye — capturing the moments you'll return to for the rest of your lives."
            packages={weddingPackages}
            gallery={[
              { src: images.coupleHill, alt: "Scottish handfasting ceremony" },
              { src: images.heroBride, alt: "Bride preparing in the mirror" },
              {
                src: images.weddingRings,
                alt: "Wedding rings on the certificate",
              },
            ]}
            setPage={setPage}
          />
        );
      case "newborn":
        return (
          <ServicePage
            hero={images.newbornPink}
            tag="Newborn Photography"
            title="Newborn"
            intro="Those first tiny days pass in a heartbeat. I come to you — your home, your space — and document your new arrival with softness, patience, and complete care, creating heirlooms you'll treasure for generations."
            packages={newbornPackages}
            gallery={[
              { src: images.newbornPink, alt: "Baby jungle birthday portrait" },
              { src: images.babyField, alt: "Laughing baby in safari crown" },
              { src: images.familyBaby, alt: "Black and white baby portrait" },
              { src: images.familyRoseColor, alt: "Toddler with a white rose" },
            ]}
            setPage={setPage}
          />
        );
      case "family":
        return (
          <ServicePage
            hero={images.familyCarry}
            tag="Family Photography"
            title="Family"
            intro="Family sessions are all about connection — the laughter, the chaos, the love. I create a relaxed, fun atmosphere so your family can just be yourselves, resulting in authentic photographs that truly capture who you are."
            packages={familyPackages}
            gallery={[
              { src: images.familyCarry, alt: "Christmas family portrait" },
              { src: images.familyKiss, alt: "Christmas mother and toddler" },
              { src: images.familyReindeer, alt: "Holiday toddler portrait" },
              { src: images.familyWindowNight, alt: "Child at the window" },
              {
                src: images.familyDoubleExposure,
                alt: "Artistic double exposure portrait",
              },
              { src: images.familyRoseColor, alt: "Toddler with a white rose" },
            ]}
            setPage={setPage}
          />
        );
      case "cakesmash":
        return (
          <ServicePage
            hero={images.cakeKid}
            tag="Cake Smash Photography"
            title="Cake Smash"
            intro="Celebrate your little one's first birthday in the most delightful way. Cake Smash sessions are pure joy from start to finish — and the photos are absolutely priceless."
            packages={cakeSmashPackages}
            gallery={[
              { src: images.cakeKid, alt: "Rock and roll cake smash" },
              { src: images.cakeRockSmash, alt: "Born to rock birthday session" },
              { src: images.cakeRockBw, alt: "Black and white cake smash" },
              { src: images.cakeGirl, alt: "Safari cake smash laughter" },
              { src: images.cakeSafariLook, alt: "Wild One birthday portrait" },
              { src: images.cakeBirthday, alt: "Jungle cake smash" },
              { src: images.newbornPink, alt: "Jungle tub birthday portrait" },
            ]}
            setPage={setPage}
          />
        );
      case "booking":
        return <Booking />;
      default:
        return <Home setPage={setPage} />;
    }
  })();

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <Header page={page} setPage={setPage} />
      <main style={{ paddingTop: page === "home" ? 0 : "72px" }}>
        {content}
      </main>
      <Footer setPage={setPage} />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Site />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
