import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./components/Home";
import { ServicePage } from "./components/ServicePage";
import { Booking } from "./components/Booking";
import { Admin } from "./components/Admin";
import { ReviewSubmit } from "./components/ReviewSubmit";
import { images, type Page } from "./data/images";
import {
  cakeSmashPackages,
  familyPackages,
  newbornPackages,
  weddingPackages,
} from "./data/packages";
import { weddingFaqs } from "./data/faqs";

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
            intro="Your wedding day passes in a heartbeat, but your photographs will tell your story for generations. Natural, unobtrusive storytelling focused on genuine emotion."
            packages={weddingPackages}
            faqs={weddingFaqs}
            gallery={[
              { src: images.coupleHill, alt: "Scottish handfasting ceremony" },
              { src: images.heroBride, alt: "Bride preparing in the mirror" },
              {
                src: images.weddingDoubleExposure,
                alt: "Artistic bridal double exposure portrait",
              },
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
            tag="Tiny Toes"
            title="Newborn"
            intro="Gentle, natural and baby-led sessions to capture your newborn in their earliest, most delicate days — images you'll treasure for generations."
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
            intro="Natural, relaxed sessions that capture connection, love and your unique family story. Perfect for creating timeless memories together."
            packages={familyPackages}
            gallery={[
              { src: images.familyCarry, alt: "Christmas family portrait" },
              { src: images.familyKiss, alt: "Christmas mother and toddler" },
              { src: images.familyReindeer, alt: "Holiday toddler portrait" },
              { src: images.familyRoseColor, alt: "Toddler with a white rose" },
            ]}
            setPage={setPage}
          />
        );
      case "cakesmash":
        return (
          <ServicePage
            hero={images.cakeKid}
            tag="Let's Celebrate"
            title="Cake Smash"
            intro="A fun-filled session to celebrate your little one's milestone in the sweetest way — giggles, frosting and memories you'll treasure forever. Sessions ideally take place just before or after a first birthday."
            packages={cakeSmashPackages}
            gallery={[
              { src: images.cakeKid, alt: "Born to rock cake smash on the drum" },
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
      <Route path="/admin" element={<Admin />} />
      <Route path="/review/:token" element={<ReviewSubmit />} />
      <Route path="/" element={<Site />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
