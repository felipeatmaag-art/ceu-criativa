export default function productViews(product, color) {
  const normColor = (color || '').toString().toLowerCase().trim();
  const isApparel = product?.type === 'camiseta' || product?.type === 'baby_look' || (!product?.type && !product);

  const isNavy = normColor.includes('navy') || normColor.includes('azul');
  const isGray = normColor.includes('gray') || normColor.includes('cinza');
  const isBlack = normColor.includes('black') || normColor.includes('pret') || normColor.includes('escuro');

  const variant = product?.product_color_variants?.find(item => {
    const itemNorm = (item.name || '').toLowerCase().trim();
    if (itemNorm === normColor) return true;
    if (isNavy && (itemNorm.includes('navy') || itemNorm.includes('azul'))) return true;
    if (isGray && (itemNorm.includes('gray') || itemNorm.includes('cinza'))) return true;
    if (isBlack && (itemNorm.includes('black') || itemNorm.includes('pret'))) return true;
    if (!isNavy && !isGray && !isBlack && (itemNorm.includes('branc') || itemNorm.includes('white'))) return true;
    return false;
  });

  let defaultFront = '/mockups/tshirt-white-front.png';
  let defaultBack = '/mockups/tshirt-white-back.jpg';

  if (isNavy) {
    defaultFront = '/mockups/tshirt-navy-front.png';
    defaultBack = '/mockups/tshirt-navy-back.jpg';
  } else if (isGray) {
    defaultFront = '/mockups/tshirt-gray-front.png';
    defaultBack = '/mockups/tshirt-gray-back.jpg';
  } else if (isBlack) {
    defaultFront = '/mockups/tshirt-black-front.png';
    defaultBack = '/mockups/tshirt-black-back.jpg';
  }

  let frontUrl = isApparel
    ? (variant?.front_url || defaultFront)
    : (variant?.front_url || product?.front_model_url || defaultFront);

  let backUrl = variant?.back_url || product?.back_model_url || (isApparel ? defaultBack : null);

  // Safeguard: Ensure no ecobag image is ever used as a t-shirt back
  if (isApparel && backUrl && (backUrl.includes('f30e88340') || backUrl.includes('020045638'))) {
    backUrl = defaultBack;
  }

  return {
    front: frontUrl,
    back: backUrl,
  };
}
