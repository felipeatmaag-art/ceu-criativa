import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, ArrowLeft, Trash2, CreditCard, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    number: '',
    city: '',
    state: '',
    zipcode: ''
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const removeItem = (index) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      localStorage.removeItem('cart');
      setCartItems([]);
      setShowCheckout(false);
      navigate(createPageUrl('MyOrders'));
    } catch (error) {
      console.error('Erro ao processar:', error);
    }
    setIsProcessing(false);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 15.00 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Explore')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meu Carrinho</h1>
            <p className="text-gray-500">{cartItems.length} itens</p>
          </div>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 shadow-sm flex gap-4"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={item.design_image}
                      alt={item.design_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.design_title}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {item.product_type} • {item.size}
                      {item.color && ` • ${item.color}`}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      R$ {item.price.toFixed(2)}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-600 self-start"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
              <h3 className="font-semibold text-lg mb-4">Resumo do Pedido</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'})</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frete</span>
                  <span className="font-medium">R$ {shipping.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="ceu-text-gradient">R$ {total.toFixed(2)}</span>
                </div>
              </div>
              <Button 
                onClick={() => setShowCheckout(true)}
                className="w-full mt-6 h-12 rounded-xl ceu-gradient text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Finalizar Compra
              </Button>
              <Link to={createPageUrl('Explore')}>
                <Button variant="outline" className="w-full mt-3 h-10 rounded-xl">
                  Continuar Comprando
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Seu carrinho está vazio
            </h3>
            <p className="text-gray-500 mb-6">
              Explore nossas estampas e encontre algo incrível!
            </p>
            <Link to={createPageUrl('Explore')}>
              <Button className="ceu-gradient text-white rounded-xl">
                Explorar Estampas
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Checkout Dialog */}
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Finalizar Compra
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>CEP</Label>
                <Input
                  placeholder="00000-000"
                  value={shippingAddress.zipcode}
                  onChange={(e) => setShippingAddress({...shippingAddress, zipcode: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Label>Rua</Label>
                  <Input
                    placeholder="Nome da rua"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input
                    placeholder="123"
                    value={shippingAddress.number}
                    onChange={(e) => setShippingAddress({...shippingAddress, number: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Cidade</Label>
                  <Input
                    placeholder="Cidade"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input
                    placeholder="UF"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-medium">R$ {shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="ceu-text-gradient">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isProcessing || !shippingAddress.zipcode || !shippingAddress.street}
                className="w-full h-12 rounded-xl ceu-gradient text-white"
              >
                {isProcessing ? 'Processando...' : 'Confirmar Pagamento'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}