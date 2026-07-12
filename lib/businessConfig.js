import { UtensilsCrossed, Drumstick, Scissors, ShoppingBag, Store, Wrench, Rocket } from 'lucide-react';

export const businessCategories = [
  { key: 'restaurante', label: 'Restaurantes', icon: UtensilsCrossed, color: 'orange' },
  { key: 'polleria', label: 'Pollerías', icon: Drumstick, color: 'orange' },
  { key: 'barberia', label: 'Barberías', icon: Scissors, color: 'blue' },
  { key: 'bodega', label: 'Bodegas', icon: ShoppingBag, color: 'green' },
  { key: 'tienda', label: 'Tiendas', icon: Store, color: 'blue' },
  { key: 'servicio_tecnico', label: 'Servicios técnicos', icon: Wrench, color: 'slate' },
  { key: 'emprendimiento', label: 'Emprendimientos', icon: Rocket, color: 'green' },
];

export const districtLabels = {
  collique: 'Collique',
  comas: 'Comas',
  lima_norte: 'Lima Norte',
};

export function getCategoryInfo(key) {
  return businessCategories.find(c => c.key === key) || { key, label: key, icon: Store, color: 'slate' };
}