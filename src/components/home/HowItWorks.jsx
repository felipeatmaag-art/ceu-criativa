import React from 'react';
import { Sparkles, Upload, DollarSign, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      icon: Sparkles,
      title: "Crie sua Estampa",
      description: "Use nossa IA para gerar designs únicos ou envie sua própria arte",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: Upload,
      title: "Publique",
      description: "Escolha os produtos e publique sua estampa na plataforma",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: DollarSign,
      title: "Ganhe Comissões",
      description: "Receba até 30% de comissão em cada venda do seu design",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Truck,
      title: "Nós Entregamos",
      description: "Cuidamos da produção e entrega. Você só cria!",
      color: "from-blue-500 to-cyan-600"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
            Simples e Rápido
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Como Funciona
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Em poucos passos você começa a ganhar dinheiro com sua criatividade
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-200 to-transparent" />
                )}
                
                <div className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {step.description}
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