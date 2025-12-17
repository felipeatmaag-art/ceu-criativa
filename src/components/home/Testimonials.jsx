import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Artista Digital",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      content: "A Céu mudou minha vida! Consegui transformar minha paixão por arte em uma fonte de renda real. Já vendi mais de 200 estampas e conheci uma comunidade incrível.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Ilustrador",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      content: "Nunca imaginei que poderia viver da minha arte. Com a Céu, consigo criar designs que realmente representam minhas raízes e ainda ganhar por isso. É um sonho!",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Designer Freelancer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      content: "A plataforma é super intuitiva e o suporte da IA para criar designs é incrível. Já participei de várias competições e conheci artistas do Brasil inteiro.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-purple-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
            Histórias Reais
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Vozes da Nossa Comunidade
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Conheça as histórias de artistas que transformaram suas vidas através da arte
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 h-full">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center opacity-50">
                  <Quote className="w-6 h-6 text-purple-600" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array(testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-600 leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}