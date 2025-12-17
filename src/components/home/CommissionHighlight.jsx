import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Percent, Wallet } from 'lucide-react';

export default function CommissionHighlight() {
  const stats = [
    {
      value: "30%",
      label: "de comissão em cada venda",
      icon: Percent,
      color: "from-green-500 to-emerald-600"
    },
    {
      value: "R$ 890",
      label: "ganho médio mensal por artista",
      icon: Wallet,
      color: "from-blue-500 to-cyan-600"
    },
    {
      value: "R$ 250K",
      label: "pagos aos artistas em 2024",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
            <DollarSign className="w-4 h-4" />
            Comissão Generosa
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Ganhe de Verdade com sua Arte
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Sem taxas escondidas. Transparência total. Você cria, a gente vende, você lucra.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border-2 border-gray-100 h-full">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-5xl font-bold text-gray-900 mb-3 text-center">
                    {stat.value}
                  </p>
                  <p className="text-gray-500 text-center leading-relaxed">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Calculation Example */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-[3rem] p-8 lg:p-12 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <h3 className="text-3xl lg:text-4xl font-bold mb-8 text-center">
              Veja como funciona na prática
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-white/80 text-sm mb-2">Preço da camiseta</p>
                <p className="text-4xl font-bold mb-2">R$ 79,90</p>
                <p className="text-white/60 text-xs">Valor final para o cliente</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border-2 border-white/40 transform scale-105">
                <p className="text-yellow-300 text-sm mb-2 font-semibold">Sua comissão (30%)</p>
                <p className="text-5xl font-bold mb-2 text-yellow-300">R$ 23,97</p>
                <p className="text-white/80 text-xs">Por cada venda</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-white/80 text-sm mb-2">10 vendas/mês</p>
                <p className="text-4xl font-bold mb-2">R$ 239,70</p>
                <p className="text-white/60 text-xs">Renda mensal extra</p>
              </div>
            </div>

            <p className="text-center mt-8 text-white/90 text-lg">
              E isso é só o começo! Muitos artistas vendem 50+ peças por mês 🚀
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}