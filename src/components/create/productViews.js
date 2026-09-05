export default function productViews(product, color) {
  const variant = product?.product_color_variants?.find(item => item.name === color);
  return {
    front: variant?.front_url || product?.front_model_url || 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/5c58a6c71_generated_a3b8e9d6.png',
    back: variant?.back_url || product?.back_model_url || null,
  };
}