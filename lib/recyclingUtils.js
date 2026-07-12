export const CATEGORY_CONFIG = [
  { key: 'papel', label: 'Papel' },
  { key: 'carton', label: 'Cartón' },
  { key: 'plastico', label: 'Plástico' },
  { key: 'vidrio', label: 'Vidrio' },
  { key: 'metal', label: 'Metal' },
  { key: 'electronicos', label: 'Electrónicos' },
  { key: 'pilas', label: 'Pilas' },
  { key: 'organicos', label: 'Orgánicos' },
  { key: 'aceite', label: 'Aceite usado' },
  { key: 'textiles', label: 'Textiles' },
];

const OSM_TAG_MAP = {
  'recycling:paper': 'papel',
  'recycling:cardboard': 'carton',
  'recycling:plastic_bottles': 'plastico',
  'recycling:plastic_packaging': 'plastico',
  'recycling:glass_bottles': 'vidrio',
  'recycling:glass': 'vidrio',
  'recycling:cans': 'metal',
  'recycling:scrap_metal': 'metal',
  'recycling:electrical_appliances': 'electronicos',
  'recycling:e_waste': 'electronicos',
  'recycling:batteries': 'pilas',
  'recycling:organic': 'organicos',
  'recycling:cooking_oil': 'aceite',
  'recycling:engine_oil': 'aceite',
  'recycling:clothes': 'textiles',
  'recycling:textiles': 'textiles',
};

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export function parseMaterials(tags) {
  const materials = [];
  Object.entries(OSM_TAG_MAP).forEach(([tag, material]) => {
    if (tags[tag] === 'yes' && !materials.includes(material)) {
      materials.push(material);
    }
  });
  return materials;
}

export function isOpenNow(hoursStr) {
  if (!hoursStr) return null;
  if (hoursStr === '24/7') return true;
  try {
    const now = new Date();
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const currentDay = now.getDay();
    const time = now.getHours() * 60 + now.getMinutes();
    const ranges = hoursStr.split(';');
    for (const range of ranges) {
      const match = range.trim().match(/([A-Za-z]{2})(?:-([A-Za-z]{2}))?\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
      if (match) {
        const startDay = days.indexOf(match[1]);
        const endDay = match[2] ? days.indexOf(match[2]) : startDay;
        const openTime = parseInt(match[3]) * 60 + parseInt(match[4]);
        const closeTime = parseInt(match[5]) * 60 + parseInt(match[6]);
        if (currentDay >= startDay && currentDay <= endDay && time >= openTime && time < closeTime) {
          return true;
        }
      }
    }
    return false;
  } catch (e) {
    return null;
  }
}

export async function fetchRecyclingPoints(lat, lon, radius = 5000) {
  const query = `[out:json][timeout:25];
    (
      node["amenity"="recycling"](around:${radius},${lat},${lon});
      way["amenity"="recycling"](around:${radius},${lat},${lon});
    );
    out center tags;`;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) throw new Error('Failed to fetch recycling points');

  const data = await response.json();

  return data.elements.map(el => {
    const pLat = el.lat || el.center?.lat;
    const pLon = el.lon || el.center?.lon;
    const tags = el.tags || {};
    return {
      id: 'osm_' + el.id,
      name: tags.name || tags.operator || 'Punto de reciclaje',
      lat: pLat,
      lon: pLon,
      address: [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ').trim() || null,
      district: tags['addr:suburb'] || tags['addr:city'] || tags['addr:neighbourhood'] || null,
      phone: tags['phone'] || tags['contact:phone'] || null,
      hours: tags['opening_hours'] || null,
      materials: parseMaterials(tags),
      website: tags.website || tags['contact:website'] || null,
      source: 'osm',
    };
  }).filter(p => p.lat && p.lon).slice(0, 50);
}

export function getReportedPoints() {
  try {
    return JSON.parse(localStorage.getItem('reported_recycling_points') || '[]');
  } catch {
    return [];
  }
}

export function saveReportedPoint(point) {
  const points = getReportedPoints();
  const newPoint = {
    id: 'local_' + Date.now(),
    ...point,
    source: 'user',
  };
  points.unshift(newPoint);
  localStorage.setItem('reported_recycling_points', JSON.stringify(points));
  return newPoint;
}