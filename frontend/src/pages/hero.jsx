import React from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";
import NavigationBar from "./NavigationBar";

const Hero = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login"); // ✅ go to /login page
  };

  return (
    <div>

      <NavigationBar />

      <div className="hero">
      {/* Background video */}
      <video autoPlay loop muted playsInline className="back-video">
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    </div>
    
  );
};

export default Hero;
