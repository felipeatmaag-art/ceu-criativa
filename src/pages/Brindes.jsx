import React from 'react';
import AboutHero from '@/components/about/AboutHero';
import AboutPillars from '@/components/about/AboutPillars';
import AboutJourney from '@/components/about/AboutJourney';
import AboutImpact from '@/components/about/AboutImpact';

export default function Brindes() {
  return (
    <div className="overflow-hidden bg-ceu-navy">
      <AboutHero />
      <AboutPillars />
      <AboutJourney />
      <AboutImpact />
    </div>
  );
}