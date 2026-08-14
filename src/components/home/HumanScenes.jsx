import React from 'react';
import { motion } from 'framer-motion';
import { Scissors, Smartphone, Store } from 'lucide-react';

const scenes = [
  {
    image: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/67a1035e2_Seamstress_sewing_tag_on_shirt_202608132018.jpeg',
    icon: Scissors,
    title: 'Feito à mão, com cuidado',
    text: 'Cada peça carrega o toque de quem a produziu — do ateliê até a sua porta.',
  },
  {
    image: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/46723f304_Man_looking_at_smartphone_screen_202608131924.jpeg',
    icon: Smartphone,
    title: 'Seu estúdio no bolso',
    text: 'Acompanhe vendas, saldo e pontos de fidelidade de onde estiver.',
  },
  {
    image: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/f34d3a16d_Man_watching_t-shirt_printing_202608131923.jpeg',
    icon: Store,
    title: 'A Céu no mundo real',
    text: 'Pop-ups e experiências que levam a sua arte para além da tela.',
  },
];

export default function HumanScenes() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass-effect text-xs font-medium tracking-wide text-gray-200 mb-4">
            Por trás da marca
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Pessoas reais, <span className="ceu-text-gradient">arte real</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Da costura da etiqueta ao balcão do pop-up — a jornada humana por trás de cada criação.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {scenes.map((scene, i) => {
            const Icon = scene.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-3xl overflow-hidden glass-card"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={scene.image}
                    alt={scene.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="w-11 h-11 rounded-xl ceu-gradient flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1.5">
                    {scene.title}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {scene.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}