import React from 'react';
import { motion } from 'framer-motion';
import { Recycle, Feather, Heart } from 'lucide-react';

const benefits = [
  { icon: Recycle, title: 'Papel kraft sustentável', text: 'Reciclável, resistente e produzido com menor impacto ambiental.' },
  { icon: Feather, title: 'Forro de nuvens Céu', text: 'Um detalhe autoral que transforma a abertura em parte da experiência.' },
  { icon: Heart, title: 'Feita para encantar', text: 'Cada peça chega protegida e pronta para presentear ou colecionar.' },
];

export default function EcoPackaging() {
  return (
    <section className="bg-ceu-cloud py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="mb-5 inline-block rounded-full bg-ceu-sun/25 px-4 py-2 text-sm font-bold text-ceu-navy">Uma entrega para lembrar</span>
          <h2 className="text-4xl font-black tracking-tight text-ceu-navy lg:text-6xl">A embalagem kraft ecológica original Céu</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ceu-navy/65">Mais que entregar uma peça, criamos uma experiência afetiva e sustentável do lado de fora ao primeiro olhar.</p>
        </div>
        <div className="grid overflow-hidden rounded-[2rem] border border-ceu-sun/40 bg-card shadow-xl lg:grid-cols-[1.25fr_0.75fr]">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="min-h-[360px] lg:min-h-[560px]">
            <img src="https://media.base44.com/images/public/69431e0c00397efc6e14e9df/208543d05_generated_image.png" alt="Caixa kraft ecológica Céu aberta com uma peça autoral" className="h-full w-full object-cover" />
          </motion.div>
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <span className="mb-4 text-sm font-black uppercase tracking-widest text-ceu-aqua">Design tátil e emocional</span>
            <h3 className="mb-8 text-3xl font-black leading-tight text-ceu-navy">Uma obra de arte chegando à sua porta.</h3>
            <div className="space-y-4">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-ceu-sky/30 bg-ceu-cloud p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ceu-aqua/15"><Icon className="h-5 w-5 text-ceu-aqua" /></div>
                  <div><h4 className="font-bold text-ceu-navy">{title}</h4><p className="mt-1 text-sm leading-relaxed text-ceu-navy/60">{text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}