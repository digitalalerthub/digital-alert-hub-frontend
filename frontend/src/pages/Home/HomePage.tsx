import React from "react";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import NavBar from "../../components/NavBar";

import "./HomePage.css"; // CSS propio del Home

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <NavBar />

      <Hero />

      <Features />

      <Footer />
    </div>
  );
};

export default Home;
