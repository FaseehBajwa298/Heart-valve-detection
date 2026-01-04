import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Contact from '../components/Contact';

const Home = () => {
  return (
    <div className="flex flex-col">
      <Hero />
      <Services />
      <About />
      <Contact />
    </div>
  );
};

export default Home;
