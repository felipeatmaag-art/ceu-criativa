import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ShoppingBag, ArrowLeft, Trash2, CreditCard, Package,
  ShieldCheck, Lock, Zap, Minus, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PaymentMethodSelector, { PAYMENT_METHODS } from '@/components/checkout/PaymentMethodSelector';
import FreeShippingBar, { FREE_SHIPPING_THRESHOLD } from '@/components/checkout/FreeShippingBar';
import ProductionFiles from '@/components/create/ProductionFiles';
import useCartStore from '@/services/cartStore';
import EmbeddedCheckout from '@/components/checkout/EmbeddedCheckout';

export default function Cart() {
  const [cartItems, persist] = useCartStore();
  const [paidOrder, setPaidOrder] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [checkoutError, setCheckoutError] = useState('');
  const [customer, setCustomer] = useState({ name: '', email: '' });
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    number: '',
    city: '',
    state: '',
    zipcode: ''
  });



  const removeItem = (index) => {
    persist(cartItems.filter((_, i) => i !== index));
  };

  const updateQty = (index, delta) => {
    const newCart = [...cartItems];
    const newQty = Math.min(10, Math.max(1, (newCart[index].quantity || 1) + delta));
    newCart[index] = { ...newCart[index], quantity: newQty };
    persist(newCart);
  };

  const applyCoupon = () => {
    setCouponError('');
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    if (code === 'CRIATIVO10') {
      setCouponApplied({ code, discount: 0.10 });
    } else if (code === 'BEMVINDO') {
      setCouponApplied({ code, discount: 0.05 });
    } else {
      setCouponApplied(null);
      setCouponError('Cupom inválido');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = subtotal > 0 ? (hasFreeShipping ? 0 : 15.00) : 0;

  const paymentDiscount = PAYMENT_METHODS.find(m => m.id === paymentMethod)?.discount || 0;
  const couponDiscount = couponApplied?.discount || 0;
  const discountValue = subtotal * (paymentDiscount + couponDiscount);
  const total = Math.max(0, subtotal - discountValue + shipping);

  const isAddressValid = shippingAddress.zipcode && shippingAddress.street && shippingAddress.number && shippingAddress.city && shippingAddress.state;
  const isCustomerValid = customer.name.trim() && /\S+@\S+\.\S+/.test(customer.email);

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
            <p className="text-gray-500">{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</p>
          </div>
        </div>

        {paidOrder && <div role="status" className="mb-6 rounded-2xl border bg-card p-6 text-card-foreground">Pedido {paidOrder.orderNumber} confirmado. Seu insumo foi reservado — tamo junto!</div>}
        {cartItems.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <FreeShippingBar subtotal={subtotal} />
              {cartItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 shadow-sm flex gap-4"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={item.mockup_url || item.design_image}
                      alt={item.design_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.design_title}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {item.product_type} • {item.size}
                      {item.color && ` • ${item.color}`}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      R$ {item.price.toFixed(2)}
                    </p>
                    <ProductionFiles production={item.production} />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        aria-label={`Diminuer quantidade de ${item.design_title}`}
                        onClick={() => updateQty(index, -1)}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity || 1}</span>
                      <button
                        aria-label={`Aumentar quantidade de ${item.design_title}`}
                        onClick={() => updateQty(index, 1)}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <button
                    aria-label={`Remover ${item.design_title}`}
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-600 self-start"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm h-fit lg:sticky lg:top-6">
              <h3 className="font-semibold text-lg mb-4">Resumo do Pedido</h3>

              {/* Coupon */}
              <div className="mb-4">
                <Label className="text-xs text-gray-500">Cupom de desconto</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Ex: CRIATIVO10"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    className="rounded-xl text-sm h-10"
                  />
                  <Button
                    variant="outline"
                    onClick={applyCoupon}
                    className="rounded-xl h-10 px-4 shrink-0"
                  >
                    Aplicar
                  </Button>
                </div>
                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                {couponApplied && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ {couponApplied.code} aplicado ({couponApplied.discount * 100}% off)
                  </p>
                )}
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'})</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Descontos</span>
                    <span className="font-medium">- R$ {discountValue.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Frete</span>
                  <span className="font-medium">
                    {shipping === 0 ? <span className="text-emerald-600">Grátis</span> : `R$ ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="pt-3 border-t flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="ceu-text-gradient">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => setShowCheckout(true)}
                className="w-full mt-5 h-12 rounded-xl ceu-gradient text-white font-semibold"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Finalizar Compra
              </Button>
              <Link to={createPageUrl('Explore')}>
                <Button variant="outline" className="w-full mt-3 h-10 rounded-xl">
                  Continuar Comprando
                </Button>
              </Link>

              {/* Trust signals */}
              <div className="mt-5 pt-5 border-t space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Pagamento 100% seguro
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Produção sob demanda, com estoque físico
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Compra protegida
                </div>
              </div>
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
          <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Finalizar Compra
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              {/* Order summary mini */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resumo</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {discountValue > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Descontos</span>
                      <span className="font-medium">- R$ {discountValue.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frete</span>
                    <span className="font-medium">
                      {shipping === 0 ? <span className="text-emerald-600">Grátis</span> : `R$ ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="ceu-text-gradient">R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Seus dados</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label className="text-xs">Nome completo</Label><Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="rounded-xl" /></div>
                  <div><Label className="text-xs">E-mail</Label><Input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="rounded-xl" /></div>
                </div>
              </div>

              {/* Shipping address */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Endereço de Entrega</p>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">CEP</Label>
                    <Input
                      placeholder="00000-000"
                      value={shippingAddress.zipcode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zipcode: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs">Rua</Label>
                      <Input
                        placeholder="Nome da rua"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Número</Label>
                      <Input
                        placeholder="123"
                        value={shippingAddress.number}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, number: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Cidade</Label>
                      <Input
                        placeholder="Cidade"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Estado</Label>
                      <Input
                        placeholder="UF"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Forma de Pagamento</p>
                <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
              </div>

              <EmbeddedCheckout payload={{ items: cartItems, customer, shippingAddress, couponCode: couponApplied?.code || '' }} valid={!!isAddressValid && !!isCustomerValid} onPaid={result => { setPaidOrder(result); setShowCheckout(false); }} />
              <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Compra protegida • Dados criptografados
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}