import BannerQuienesSomos from "../components/About/BannerQuienesSomos";
import FirstSection from "../components/About/FirstSection";
import HistorySection from "../components/About/HistorySection";
import FoundersSection from "../components/About/FoundersSection";
import ImpactSection from "../components/About/ImpactSection";
import Footer from "./Home/components/Footer";

export default function QuienesSomosPage() {
  return (
    <>
      <BannerQuienesSomos />
      <HistorySection />
      <FirstSection />
      <FoundersSection />
      <ImpactSection />
      <Footer />
    </>
  );
}
