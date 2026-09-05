import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const REVEAL = 'main section, main article, main [class*="rounded-3xl"], main [class*="rounded-2xl"]';
const ART = 'main img:not([class*="avatar"]):not([class*="w-9"]):not([class*="w-10"]):not([class*="w-12"]):not([class*="w-14"])';

export default function ScrollSceneMotion() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observed = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('scroll-scene-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    const register = () => {
      document.querySelectorAll(REVEAL).forEach((element, index) => {
        if (observed.has(element) || element.closest('[role="dialog"]') || element.parentElement?.closest(REVEAL)) return;
        observed.add(element);
        element.classList.add('scroll-scene-reveal');
        element.style.setProperty('--scene-delay', `${Math.min(index % 4, 3) * 55}ms`);
        observer.observe(element);
      });
      document.querySelectorAll(ART).forEach((image, index) => {
        if (image.closest('header, footer, [role="dialog"]')) return;
        image.classList.add(index % 2 ? 'scene-float-soft' : 'scene-float-slow');
      });
    };
    const frame = requestAnimationFrame(register);
    const mutations = new MutationObserver(register);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { cancelAnimationFrame(frame); mutations.disconnect(); observer.disconnect(); };
  }, [pathname]);

  return null;
}