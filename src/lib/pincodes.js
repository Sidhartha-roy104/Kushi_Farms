export const RATE_PER_KM = 10;
export const FREE_DELIVERY_RADIUS_KM = 5;

export const PINCODE_ZONES = {
  '532401': {
    area: 'Arasavilli / Patrunivalasa / Chaparam',
    distanceKm: 3
  },
  '532001': {
    area: 'Srikakulam Town',
    distanceKm: 4
  },
  '532402': {
    area: 'S.M. Puram / Ponduru',
    distanceKm: 8
  },
  '532410': {
    area: 'Etcherla',
    distanceKm: 13
  },
  '532403': {
    area: 'Murapaka / Laveru',
    distanceKm: 14
  },
  '532405': {
    area: 'Gara',
    distanceKm: 15
  }
};

export const ACTIVE_PINCODES = Object.keys(PINCODE_ZONES);

export function getMinOrderForDistance(distanceKm) {
  return Number(distanceKm) <= 7 ? 199 : 399;
}

export function getPincodeDeliveryInfo(rawPincode, subtotal = 0, freeThreshold = 199) {
  const pin = String(rawPincode || '').trim();
  const zone = PINCODE_ZONES[pin];
  if (!zone) return null;

  const isWithin5Km = zone.distanceKm <= FREE_DELIVERY_RADIUS_KM;
  const minOrderAmount = getMinOrderForDistance(zone.distanceKm);
  const meetsMinOrder = Number(subtotal) >= minOrderAmount;
  const isFree = isWithin5Km && Number(subtotal) >= Number(freeThreshold);
  const deliveryFee = isFree ? 0 : zone.distanceKm * RATE_PER_KM;

  return {
    pincode: pin,
    area: zone.area,
    distanceKm: zone.distanceKm,
    isWithin5Km,
    minOrderAmount,
    meetsMinOrder,
    shortfall: Math.max(0, minOrderAmount - Number(subtotal)),
    isFree,
    deliveryFee
  };
}
