import { Footer } from "@/components/Footer";
import { LandingSections } from "@/components/LandingSections";
import { Navbar } from "@/components/Navbar";
import { SupportWidget } from "@/components/SupportWidget";
import { TitleSync } from "@/components/TitleSync";

export default function HomePage() {
  return (
    <>
      <TitleSync pageKey="homeTitle" />
      <Navbar />
      <LandingSections />
      <Footer />
      <SupportWidget />
    </>
  );
}

