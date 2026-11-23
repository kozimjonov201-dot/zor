/**
 * YANDEX GO SUPERAPP - TASHKENT (UZBEKISTAN)
 * High-Performance, 60fps, 1:1 Pixel-Accurate Interactive Clone
 * Localized in Uzbek & UZS currency
 */

// ============================================================================
// 1. SOUND SYNTHESIZER (WEB AUDIO API) - Zero external audio file lag
// ============================================================================
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTap() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch(e) {}
  }

  playScooterBeep() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Double chirp
      [0, 0.14].forEach(delay => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now + delay);
        gain.gain.setValueAtTime(0.2, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.1);
      });
    } catch(e) {}
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch(e) {}
  }

  playCarArrival() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [440, 554.37, 659.25];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.22);
      });
    } catch(e) {}
  }
}

const sounds = new SoundEffects();

// ============================================================================
// 2. CENTRALIZED APPLICATION STATE
// ============================================================================
const appState = {
  activeView: 'hub', // 'hub', 'taxi', 'scooters', 'lavka', 'delivery', 'transport'
  language: 'uz', // 'uz' | 'ru'
  user: {
    name: 'Alisher Usmonov',
    phone: '+998 90 123-45-67',
    plusPoints: 14500,
    address: "Toshkent, Amir Temur shoh ko'chasi, 108",
    rating: 4.97
  },
  taxi: {
    pickup: {
      name: "Amir Temur xiyoboni",
      address: "Toshkent markazi",
      lat: 41.3111,
      lng: 69.2797
    },
    destination: {
      name: "Tashkent City Mall",
      address: "Shayxontohur tumani",
      lat: 41.3168,
      lng: 69.2483
    },
    tariff: 'start', // 'start', 'komfort', 'komfort_plus', 'biznes'
    paymentMethod: 'uzcard', // 'uzcard', 'humo', 'cash', 'plus'
    promoCode: '',
    discount: 0,
    distanceKm: 3.8,
    durationMin: 9,
    status: 'idle', // 'idle', 'searching', 'assigned', 'on_way', 'in_trip', 'completed'
    driver: null,
    carMarker: null,
    routeLine: null,
    comments: {
      quiet: false,
      ac: true,
      babySeat: false
    }
  },
  scooter: {
    selectedScooter: null,
    rideActive: false,
    rideSeconds: 0,
    speed: 0,
    mode: 'drive', // 'eco', 'drive', 'sport'
    cost: 0,
    timerId: null,
    speedInterval: null,
    battery: 88,
    lightOn: false
  },
  lavka: {
    category: 'all',
    search: '',
    cart: {}, // id -> count
    activeOrder: null,
    orderStep: 0
  },
  delivery: {
    type: 'foot', // 'foot', 'auto', 'cargo'
    doorToDoor: true,
    senderPhone: '+998 90 123-45-67',
    recipientPhone: '+998 97 987-65-43',
    comment: 'Hujjatlar va sovg\'a',
    activeOrder: null
  },
  transport: {
    tab: 'metro',
    search: ''
  },
  stories: {
    currentIndex: 0,
    active: false,
    interval: null
  },
  history: [
    {
      id: 'TX-9482',
      service: 'Taksi (Komfort)',
      from: 'Amir Temur xiyoboni',
      to: 'Toshkent Xalqaro Aeroporti',
      date: 'Bugun, 11:20',
      price: '28 500 so\'m',
      car: 'Chevrolet Cobalt • 01 777 AAA',
      rating: 5
    },
    {
      id: 'SC-1029',
      service: 'Samokat Ninebot',
      from: 'Tashkent City Park',
      to: 'Milliy Bog\'',
      date: 'Kecha, 18:45',
      price: '11 880 so\'m (12 daq)',
      car: 'Samokat #742',
      rating: 5
    },
    {
      id: 'LV-5521',
      service: 'Yandex Lavka',
      from: 'Lavka Markaziy ombori',
      to: 'Amir Temur 108',
      date: '21 Noyabr, 14:10',
      price: '74 000 so\'m',
      car: 'Kuryer Ravshan',
      rating: 5
    }
  ]
};

// ============================================================================
// 3. TASHKENT PRESETS & LOCATIONS DATABASE
// ============================================================================
const TASHKENT_LOCATIONS = [
  {
    name: "Tashkent City Mall",
    address: "Botir Zokirov ko'chasi, 7",
    lat: 41.3168,
    lng: 69.2483,
    distanceKm: 3.6,
    durationMin: 8,
    icon: "shopping-bag"
  },
  {
    name: "Chorsu Bozori",
    address: "Navoiy shoh ko'chasi",
    lat: 41.3265,
    lng: 69.2343,
    distanceKm: 5.2,
    durationMin: 12,
    icon: "store"
  },
  {
    name: "Islom Karimov nomidagi Aeroport",
    address: "Qumariq ko'chasi, Terminal 2",
    lat: 41.2579,
    lng: 69.2812,
    distanceKm: 7.8,
    durationMin: 16,
    icon: "plane"
  },
  {
    name: "Magic City Park",
    address: "Bobur ko'chasi, 174",
    lat: 41.3025,
    lng: 69.2458,
    distanceKm: 4.1,
    durationMin: 10,
    icon: "sparkles"
  },
  {
    name: "Amir Temur Xiyoboni",
    address: "Amir Temur maydoni",
    lat: 41.3111,
    lng: 69.2797,
    distanceKm: 0.5,
    durationMin: 2,
    icon: "map-pin"
  },
  {
    name: "Minor Masjidi",
    address: "Kichik halqa yo'li",
    lat: 41.3328,
    lng: 69.2831,
    distanceKm: 3.9,
    durationMin: 9,
    icon: "landmark"
  },
  {
    name: "Samarqand Darvoza Mall",
    address: "Qoratosh ko'chasi, 5A",
    lat: 41.3160,
    lng: 69.2220,
    distanceKm: 6.0,
    durationMin: 14,
    icon: "shopping-bag"
  },
  {
    name: "Eco Park Tashkent",
    address: "O'zbekiston ovozi ko'chasi",
    lat: 41.3105,
    lng: 69.3005,
    distanceKm: 2.4,
    durationMin: 6,
    icon: "trees"
  }
];

const TARIFFS = {
  start: {
    id: 'start',
    name: 'Start',
    basePrice: 12500,
    perKm: 2000,
    eta: '3 daq',
    cars: 'Spark, Matiz',
    desc: 'Har kungi qulay narx',
    icon: 'spark'
  },
  komfort: {
    id: 'komfort',
    name: 'Komfort',
    basePrice: 18000,
    perKm: 2800,
    eta: '4 daq',
    cars: 'Cobalt, Lacetti, Gentra',
    desc: 'Keng salon va konditsioner',
    icon: 'cobalt'
  },
  komfort_plus: {
    id: 'komfort_plus',
    name: 'Komfort+',
    basePrice: 26500,
    perKm: 3800,
    eta: '6 daq',
    cars: 'Malibu 2, BYD Song Plus',
    desc: 'Yuqori darajadagi qulaylik',
    icon: 'byd'
  },
  biznes: {
    id: 'biznes',
    name: 'Biznes',
    basePrice: 45000,
    perKm: 5500,
    eta: '8 daq',
    cars: 'Kia K5, Mercedes-Benz E-Class',
    desc: 'Premium xizmat va suv',
    icon: 'mercedes'
  }
};

// Scooters distributed in Tashkent hotspots
const SCOOTERS_DATA = [
  { id: 'SC-881', model: 'Ninebot Max Pro', lat: 41.3175, lng: 69.2492, battery: 94, range: 28, status: 'available' },
  { id: 'SC-442', model: 'Ninebot Max Pro', lat: 41.3152, lng: 69.2465, battery: 87, range: 25, status: 'available' },
  { id: 'SC-910', model: 'Ninebot Max Pro', lat: 41.3118, lng: 69.2785, battery: 76, range: 22, status: 'available' },
  { id: 'SC-204', model: 'Ninebot Max Pro', lat: 41.3129, lng: 69.2810, battery: 98, range: 30, status: 'available' },
  { id: 'SC-715', model: 'Ninebot Max Pro', lat: 41.3032, lng: 69.2445, battery: 64, range: 18, status: 'available' },
  { id: 'SC-331', model: 'Ninebot Max Pro', lat: 41.3098, lng: 69.2985, battery: 82, range: 24, status: 'available' },
  { id: 'SC-559', model: 'Ninebot Max Pro', lat: 41.3120, lng: 69.2840, battery: 45, range: 12, status: 'available' },
  { id: 'SC-680', model: 'Ninebot Max Pro', lat: 41.3255, lng: 69.2360, battery: 91, range: 27, status: 'available' },
  { id: 'SC-114', model: 'Ninebot Max Pro', lat: 41.3188, lng: 69.2520, battery: 73, range: 21, status: 'available' },
  { id: 'SC-490', model: 'Ninebot Max Pro', lat: 41.3050, lng: 69.2410, battery: 89, range: 26, status: 'available' }
];

// Product catalog for Lavka / Supermarket
const LAVKA_PRODUCTS = [
  {
    id: 'p1',
    name: 'Coca-Cola Classic',
    weight: '1.5 litr',
    category: 'drinks',
    price: 13500,
    oldPrice: 15000,
    tag: 'Chegirma',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'p2',
    name: 'Chortoq Mineral Suvi',
    weight: '0.5 litr, shisha',
    category: 'drinks',
    price: 6500,
    tag: 'Tavsiya',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'p3',
    name: 'Musaffo Sut 3.2%',
    weight: '1 litr, Tetra Pak',
    category: 'dairy',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'p4',
    name: 'Kamilka Qatiq 2.5%',
    weight: '900 g',
    category: 'dairy',
    price: 9000,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'p5',
    name: 'Toshkent To\'y Palovi',
    weight: '450 g, issiq porsiya',
    category: 'food',
    price: 36000,
    oldPrice: 42000,
    tag: 'Issiq taom',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'p6',
    name: 'Mol go\'shtli Lavash Big',
    weight: 'Standart, sousli',
    category: 'food',
    price: 29000,
    tag: 'Xit',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'p7',
    name: 'Oltin Olma (Golden)',
    weight: '1 kg, shirin',
    category: 'fruits',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'p8',
    name: 'Samarqand Non Tandir',
    weight: '1 dona, issiq',
    category: 'bakery',
    price: 6000,
    tag: 'Yangi yopilgan',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'p9',
    name: 'Nutella Fındıq Kremi',
    weight: '350 g',
    category: 'sweets',
    price: 44000,
    oldPrice: 49000,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'p10',
    name: 'Red Bull Energetik Ichimlik',
    weight: '250 ml',
    category: 'drinks',
    price: 19500,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'p11',
    name: 'Banan Premium Ekvador',
    weight: '1 kg',
    category: 'fruits',
    price: 23000,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'p12',
    name: 'Oreo Pechenye Original',
    weight: '176 g',
    category: 'sweets',
    price: 14500,
    image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=300&auto=format&fit=crop&q=80'
  }
];

// Tashkent Metro Lines
const METRO_LINES = [
  {
    id: 'chilonzor',
    name: "Chilonzor yo'li",
    color: '#E53935',
    stations: [
      { name: "Buyuk Ipak Yo'li", time: '2 daq' },
      { name: "Pushkin", time: '4 daq' },
      { name: "Hamid Olimjon", time: '6 daq' },
      { name: "Amir Temur xiyoboni", time: '1 daq' },
      { name: "Mustaqillik maydoni", time: '3 daq' },
      { name: "Paxtakor", time: '5 daq' },
      { name: "Xalqlar do'stligi", time: '7 daq' },
      { name: "Novza", time: '9 daq' },
      { name: "Chilonzor", time: '12 daq' }
    ]
  },
  {
    id: 'ozbekiston',
    name: "O'zbekiston yo'li",
    color: '#1E88E5',
    stations: [
      { name: "Beruniy", time: '3 daq' },
      { name: "Tinchlik", time: '5 daq' },
      { name: "Chorsu", time: '2 daq' },
      { name: "G'afur G'ulom", time: '4 daq' },
      { name: "Alisher Navoiy", time: '1 daq' },
      { name: "O'zbekiston", time: '3 daq' },
      { name: "Kosmonavtlar", time: '5 daq' },
      { name: "Oybek", time: '7 daq' },
      { name: "Toshkent (Vokzal)", time: '9 daq' }
    ]
  },
  {
    id: 'yunusobod',
    name: "Yunusobod yo'li",
    color: '#43A047',
    stations: [
      { name: "Turkiston", time: '2 daq' },
      { name: "Yunusobod", time: '4 daq' },
      { name: "Shahriston", time: '6 daq' },
      { name: "Bodomzor", time: '8 daq' },
      { name: "Minor", time: '3 daq' },
      { name: "Abdulla Qodiriy", time: '5 daq' },
      { name: "Yunus Rajabiy", time: '2 daq' },
      { name: "Ming O'rik", time: '4 daq' }
    ]
  }
];

// Stories Feed
const STORIES_DATA = [
  {
    id: 's1',
    title: 'Yandex Plus',
    subtitle: '10% Keshbek har bir taksidan',
    bg: 'from-purple-600 via-indigo-600 to-pink-500',
    tag: 'Plus',
    text: 'Toshkentda har bir Komfort va Komfort+ safaridan 10% ball oling. Ballarni keyingi safarlar va Lavkada sarflang!',
    cta: 'Plusga ulanish'
  },
  {
    id: 's2',
    title: 'Yangi BYD Taksi',
    subtitle: 'Toshkent ko\'chalarida elektr qulaylik',
    bg: 'from-emerald-500 via-teal-600 to-cyan-700',
    tag: 'Komfort+',
    text: 'Komfort+ tarifida yangi zamonaviy BYD Song Plus va Changan elektromobillari sizni kutmoqda. Jim va sokin harakatlaning.',
    cta: 'Buyurtma berish'
  },
  {
    id: 's3',
    title: 'Samokatlar mavsumi',
    subtitle: 'Tirbandliksiz Toshkent',
    bg: 'from-amber-400 via-yellow-500 to-lime-500',
    tag: 'Samokat',
    text: 'Amir Temur, Toshkent City va barcha xiyobonlarda Yandex samokatlari xizmatingizda. Start 0 so\'m, daqiqasi 990 so\'m.',
    cta: 'Samokat topish'
  },
  {
    id: 's4',
    title: 'Lavka: 15 daqiqa',
    subtitle: 'Issiq non va sevimli ichimliklar',
    bg: 'from-orange-500 via-red-500 to-rose-600',
    tag: 'Lavka',
    text: 'Xarid qilishga vaqt ketkazmang. Yandex Lavka kuryerlari 15 daqiqada kerakli mahsulotlarni to\'g\'ridan-to\'g\'ri eshigingizgacha yetkazadi.',
    cta: 'Do\'konga o\'tish'
  }
];

// ============================================================================
// 4. MAPS CONTROLLER (LEAFLET.JS)
// ============================================================================
class MapController {
  constructor() {
    this.map = null;
    this.pickupMarker = null;
    this.destMarker = null;
    this.routePolyline = null;
    this.taxiMarkers = [];
    this.scooterMarkers = [];
    this.driverMarker = null;
    this.carAnimationTimer = null;
    this.trafficRoamInterval = null;
  }

  init(containerId = 'taxiMap') {
    if (this.map) return;
    
    // Centered on Tashkent, Amir Temur
    this.map = L.map(containerId, {
      zoomControl: false,
      attributionControl: false
    }).setView([41.3111, 69.2797], 14);

    // Ultra-clean CartoDB Positron tiles for authentic Yandex look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    this.spawnIdleTaxis();
    this.updatePickupPin();
    this.startTrafficSimulation();
  }

  updatePickupPin() {
    if (!this.map) return;
    const { lat, lng } = appState.taxi.pickup;

    if (this.pickupMarker) {
      this.pickupMarker.setLatLng([lat, lng]);
    } else {
      const pickupHtml = `
        <div class="pickup-pulse-marker">
          <div class="pulse-circle"></div>
          <div class="center-pin">A</div>
        </div>
      `;
      const icon = L.divIcon({
        className: 'custom-pin',
        html: pickupHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      this.pickupMarker = L.marker([lat, lng], { icon }).addTo(this.map);
    }
  }

  setDestinationPin(lat, lng) {
    if (!this.map) return;
    if (this.destMarker) {
      this.destMarker.setLatLng([lat, lng]);
    } else {
      const destHtml = `
        <div class="destination-pin">
          <span>B</span>
        </div>
      `;
      const icon = L.divIcon({
        className: 'custom-pin-dest',
        html: destHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      this.destMarker = L.marker([lat, lng], { icon }).addTo(this.map);
    }

    this.drawRoute([appState.taxi.pickup.lat, appState.taxi.pickup.lng], [lat, lng]);
  }

  drawRoute(from, to) {
    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
    }

    // Generate smooth realistic road curve points between A and B
    const points = this.generateRoadPath(from, to);
    this.routePolyline = L.polyline(points, {
      color: '#21201F',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: null
    }).addTo(this.map);

    // Fit bounds smoothly with nice padding
    this.map.fitBounds(this.routePolyline.getBounds(), {
      padding: [80, 80],
      maxZoom: 15,
      animate: true,
      duration: 0.8
    });
  }

  generateRoadPath(start, end) {
    // Generates simulated realistic road turns in Tashkent grid
    const [lat1, lng1] = start;
    const [lat2, lng2] = end;
    
    const midLat = lat1 + (lat2 - lat1) * 0.45;
    const midLng = lng1 + (lng2 - lng1) * 0.55;

    // A few realistic bezier-like bends
    return [
      [lat1, lng1],
      [lat1 + (midLat - lat1) * 0.5, lng1 + 0.001],
      [midLat, midLng - 0.001],
      [midLat + (lat2 - midLat) * 0.6, midLng + (lng2 - midLng) * 0.4],
      [lat2, lng2]
    ];
  }

  spawnIdleTaxis() {
    // 8 yellow taxi cars moving in Tashkent center
    const carOffsets = [
      { lat: 41.3125, lng: 69.2815, deg: 45 },
      { lat: 41.3090, lng: 69.2760, deg: 120 },
      { lat: 41.3140, lng: 69.2740, deg: 270 },
      { lat: 41.3080, lng: 69.2850, deg: 180 },
      { lat: 41.3165, lng: 69.2820, deg: 90 },
      { lat: 41.3060, lng: 69.2700, deg: 310 },
      { lat: 41.3180, lng: 69.2650, deg: 20 },
      { lat: 41.3030, lng: 69.2800, deg: 200 }
    ];

    this.taxiMarkers = carOffsets.map((pos) => {
      const carSvg = `
        <div style="transform: rotate(${pos.deg}deg); transition: transform 0.5s ease;">
          <svg class="taxi-car-svg" width="30" height="30" viewBox="0 0 48 48" fill="none">
            <!-- Shadow -->
            <rect x="12" y="8" width="24" height="32" rx="7" fill="black" fill-opacity="0.25"/>
            <!-- Car body Yellow -->
            <rect x="13" y="7" width="22" height="34" rx="6" fill="#FCE000" stroke="#21201F" stroke-width="2"/>
            <!-- Roof / Windows -->
            <rect x="16" y="15" width="16" height="18" rx="3" fill="#21201F"/>
            <rect x="17" y="17" width="14" height="6" rx="1.5" fill="#5A5957"/>
            <rect x="17" y="25" width="14" height="6" rx="1.5" fill="#5A5957"/>
            <!-- Taxi Checker on Roof -->
            <rect x="20" y="13" width="8" height="3" rx="1" fill="#FFFFFF"/>
            <!-- Lights -->
            <circle cx="16" cy="9" r="1.5" fill="#FFF"/>
            <circle cx="32" cy="9" r="1.5" fill="#FFF"/>
            <circle cx="16" cy="39" r="1.5" fill="#E53935"/>
            <circle cx="32" cy="39" r="1.5" fill="#E53935"/>
          </svg>
        </div>
      `;

      const icon = L.divIcon({
        className: 'taxi-marker-icon',
        html: carSvg,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      return {
        marker: L.marker([pos.lat, pos.lng], { icon }).addTo(this.map),
        lat: pos.lat,
        lng: pos.lng,
        deg: pos.deg
      };
    });
  }

  startTrafficSimulation() {
    if (this.trafficRoamInterval) clearInterval(this.trafficRoamInterval);
    
    // Slight wandering movement simulating real GPS pings
    this.trafficRoamInterval = setInterval(() => {
      if (!this.map) return;
      this.taxiMarkers.forEach((car) => {
        const dLat = (Math.random() - 0.5) * 0.0006;
        const dLng = (Math.random() - 0.5) * 0.0006;
        car.lat += dLat;
        car.lng += dLng;
        const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
        car.marker.setLatLng([car.lat, car.lng]);
        
        const el = car.marker.getElement();
        if (el) {
          const inner = el.querySelector('div');
          if (inner) inner.style.transform = `rotate(${Math.round(angle)}deg)`;
        }
      });
    }, 2800);
  }

  showScooters() {
    this.clearScooterMarkers();
    
    SCOOTERS_DATA.forEach(sc => {
      const batteryColor = sc.battery > 70 ? '#00C853' : (sc.battery > 40 ? '#FF9100' : '#E53935');
      const html = `
        <div class="scooter-badge active-press-sm" id="scooter-pin-${sc.id}" onclick="window.selectScooter('${sc.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${batteryColor}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10l-3-6H8"/>
            <circle cx="7" cy="17" r="3.5"/>
            <path d="M9 17h6"/>
            <circle cx="17" cy="17" r="3.5"/>
          </svg>
          <span>${sc.battery}%</span>
        </div>
      `;

      const icon = L.divIcon({
        className: 'scooter-pin-custom',
        html,
        iconSize: [60, 26],
        iconAnchor: [30, 13]
      });

      const marker = L.marker([sc.lat, sc.lng], { icon }).addTo(this.map);
      this.scooterMarkers.push(marker);
    });

    // Center to Tashkent City park
    this.map.setView([41.3140, 69.2550], 14, { animate: true });
  }

  clearScooterMarkers() {
    this.scooterMarkers.forEach(m => this.map.removeLayer(m));
    this.scooterMarkers = [];
  }

  simulateDriverApproaching(onArrived, onProgress) {
    if (this.driverMarker) {
      this.map.removeLayer(this.driverMarker);
    }

    const startLat = appState.taxi.pickup.lat + 0.007;
    const startLng = appState.taxi.pickup.lng - 0.006;
    const endLat = appState.taxi.pickup.lat;
    const endLng = appState.taxi.pickup.lng;

    const carSvg = `
      <div id="activeDriverCar" style="transform: rotate(45deg); transition: transform 0.3s ease;">
        <svg class="taxi-car-svg" width="36" height="36" viewBox="0 0 48 48" fill="none">
          <rect x="11" y="6" width="26" height="36" rx="8" fill="#FCE000" stroke="#000" stroke-width="2.5"/>
          <rect x="15" y="14" width="18" height="20" rx="4" fill="#000"/>
          <rect x="17" y="16" width="14" height="7" rx="1.5" fill="#757575"/>
          <rect x="17" y="25" width="14" height="7" rx="1.5" fill="#757575"/>
          <rect x="19" y="12" width="10" height="4" rx="1.5" fill="#FFF"/>
          <circle cx="15" cy="8" r="2" fill="#FFF"/>
          <circle cx="33" cy="8" r="2" fill="#FFF"/>
          <circle cx="15" cy="40" r="2" fill="#E53935"/>
          <circle cx="33" cy="40" r="2" fill="#E53935"/>
        </svg>
      </div>
    `;

    const icon = L.divIcon({
      className: 'driver-car-icon',
      html: carSvg,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    this.driverMarker = L.marker([startLat, startLng], { icon }).addTo(this.map);

    let progress = 0;
    const totalSteps = 60; // ~6 seconds animation
    const stepTime = 100;

    if (this.carAnimationTimer) clearInterval(this.carAnimationTimer);

    this.carAnimationTimer = setInterval(() => {
      progress++;
      const ratio = progress / totalSteps;
      const currentLat = startLat + (endLat - startLat) * ratio;
      const currentLng = startLng + (endLng - startLng) * ratio;

      this.driverMarker.setLatLng([currentLat, currentLng]);

      if (onProgress) {
        const remainingMin = Math.max(1, Math.ceil((1 - ratio) * 3));
        onProgress(remainingMin, ratio);
      }

      if (progress >= totalSteps) {
        clearInterval(this.carAnimationTimer);
        sounds.playCarArrival();
        if (onArrived) onArrived();
      }
    }, stepTime);
  }

  simulateTripToDestination(onFinished, onProgress) {
    if (!this.driverMarker) return;
    
    const startLat = appState.taxi.pickup.lat;
    const startLng = appState.taxi.pickup.lng;
    const endLat = appState.taxi.destination.lat;
    const endLng = appState.taxi.destination.lng;

    let progress = 0;
    const totalSteps = 80; // ~8 seconds trip simulation
    const stepTime = 100;

    if (this.carAnimationTimer) clearInterval(this.carAnimationTimer);

    this.carAnimationTimer = setInterval(() => {
      progress++;
      const ratio = progress / totalSteps;
      const currentLat = startLat + (endLat - startLat) * ratio;
      const currentLng = startLng + (endLng - startLng) * ratio;

      this.driverMarker.setLatLng([currentLat, currentLng]);

      if (onProgress) {
        const remainingMin = Math.max(1, Math.ceil((1 - ratio) * appState.taxi.durationMin));
        onProgress(remainingMin, ratio);
      }

      if (progress >= totalSteps) {
        clearInterval(this.carAnimationTimer);
        sounds.playSuccess();
        if (onFinished) onFinished();
      }
    }, stepTime);
  }
}

const mapCtrl = new MapController();

// ============================================================================
// 5. TOAST NOTIFICATION ENGINE
// ============================================================================
function showToast(message, type = 'info', iconName = 'bell') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  
  let bgBadge = '#FCE000';
  let textColor = '#21201F';
  if (type === 'success') { bgBadge = '#00C853'; textColor = '#FFFFFF'; }
  if (type === 'danger') { bgBadge = '#E53935'; textColor = '#FFFFFF'; }

  toast.innerHTML = `
    <div style="background: ${bgBadge}; color: ${textColor}; padding: 6px; border-radius: 50%; display: flex;">
      <i data-lucide="${iconName}" style="width: 16px; height: 16px;"></i>
    </div>
    <div style="flex: 1; line-height: 1.35;">${message}</div>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// ============================================================================
// 6. UI NAVIGATION & VIEW SWITCHING
// ============================================================================
function switchView(viewName) {
  sounds.playTap();
  appState.activeView = viewName;

  // View containers
  const views = ['hubView', 'taxiView', 'scooterActiveHUD', 'lavkaView', 'transportView'];
  views.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.classList.add('hidden');
  });

  // Bottom Navigation Bar state
  updateBottomNav(viewName);

  if (viewName === 'hub') {
    document.getElementById('hubView').classList.remove('hidden');
    closeAllSheets();
  } else if (viewName === 'taxi') {
    document.getElementById('taxiView').classList.remove('hidden');
    // Ensure Leaflet map recalculates its dimensions
    setTimeout(() => {
      mapCtrl.init('taxiMap');
      mapCtrl.map.invalidateSize();
      mapCtrl.updatePickupPin();
      if (appState.taxi.destination) {
        mapCtrl.setDestinationPin(appState.taxi.destination.lat, appState.taxi.destination.lng);
      }
      openBottomSheet('taxiTariffSheet');
    }, 100);
  } else if (viewName === 'scooters') {
    document.getElementById('taxiView').classList.remove('hidden');
    setTimeout(() => {
      mapCtrl.init('taxiMap');
      mapCtrl.map.invalidateSize();
      mapCtrl.showScooters();
      openBottomSheet('scootersHubSheet');
    }, 100);
  } else if (viewName === 'lavka') {
    document.getElementById('lavkaView').classList.remove('hidden');
    renderLavkaCatalog();
    updateCartUI();
  } else if (viewName === 'transport') {
    document.getElementById('transportView').classList.remove('hidden');
    renderTransport();
  }
}

function updateBottomNav(active) {
  const tabs = ['hub', 'taxi', 'scooters', 'lavka', 'menu'];
  tabs.forEach(tab => {
    const btn = document.getElementById(`nav-btn-${tab}`);
    if (btn) {
      if (tab === active || (tab === 'hub' && active === 'hub')) {
        btn.classList.add('text-black', 'font-bold');
        btn.classList.remove('text-neutral-400');
        const iconWrapper = btn.querySelector('.icon-circle');
        if (iconWrapper) iconWrapper.classList.add('bg-[#FCE000]');
      } else {
        btn.classList.remove('text-black', 'font-bold');
        btn.classList.add('text-neutral-400');
        const iconWrapper = btn.querySelector('.icon-circle');
        if (iconWrapper) iconWrapper.classList.remove('bg-[#FCE000]');
      }
    }
  });
}

function openBottomSheet(sheetId) {
  closeAllSheets(sheetId);
  const sheet = document.getElementById(sheetId);
  const overlay = document.getElementById('modalOverlay');
  if (sheet) {
    sheet.classList.add('open');
  }
  if (overlay && sheetId !== 'taxiTariffSheet' && sheetId !== 'scootersHubSheet') {
    overlay.classList.add('open');
  }
}

function closeBottomSheet(sheetId) {
  const sheet = document.getElementById(sheetId);
  if (sheet) sheet.classList.remove('open');
  checkOverlayState();
}

function closeAllSheets(exceptId = null) {
  const sheets = document.querySelectorAll('.bottom-sheet');
  sheets.forEach(s => {
    if (s.id !== exceptId) s.classList.remove('open');
  });
  checkOverlayState();
}

function checkOverlayState() {
  const openSheets = document.querySelectorAll('.bottom-sheet.open');
  const overlay = document.getElementById('modalOverlay');
  let hasBlockingModal = false;

  openSheets.forEach(s => {
    if (s.id !== 'taxiTariffSheet' && s.id !== 'scootersHubSheet') {
      hasBlockingModal = true;
    }
  });

  // Check if side menu drawer is open
  const sideMenu = document.getElementById('sideMenuDrawer');
  if (sideMenu && sideMenu.classList.contains('translate-x-0')) {
    hasBlockingModal = true;
  }

  if (overlay) {
    if (hasBlockingModal) overlay.classList.add('open');
    else overlay.classList.remove('open');
  }
}

// ============================================================================
// 7. TAXI MODULE INTERACTIONS & LOGIC
// ============================================================================
function selectTariff(tariffKey) {
  sounds.playTap();
  appState.taxi.tariff = tariffKey;
  
  // Update tariff card styles
  document.querySelectorAll('.tariff-card').forEach(c => {
    c.classList.remove('ring-2', 'ring-black', 'bg-yellow-50', 'scale-[1.02]');
  });

  const selectedEl = document.getElementById(`tariff-${tariffKey}`);
  if (selectedEl) {
    selectedEl.classList.add('ring-2', 'ring-black', 'bg-yellow-50', 'scale-[1.02]');
  }

  calculateTaxiPrice();
}

function calculateTaxiPrice() {
  const t = TARIFFS[appState.taxi.tariff];
  const km = appState.taxi.distanceKm;
  let total = t.basePrice + Math.round(km * t.perKm);

  if (appState.taxi.discount > 0) {
    total = Math.max(5000, total - appState.taxi.discount);
  }

  const priceEl = document.getElementById('taxiOrderButtonPrice');
  if (priceEl) {
    priceEl.innerText = `${formatMoney(total)} so'm`;
  }
  const etaEl = document.getElementById('taxiEtaText');
  if (etaEl) {
    etaEl.innerText = `~${t.eta} yetib keladi`;
  }
}

function selectDestination(dest) {
  sounds.playTap();
  appState.taxi.destination = dest;
  appState.taxi.distanceKm = dest.distanceKm;
  appState.taxi.durationMin = dest.durationMin;

  const destInput = document.getElementById('taxiDestInput');
  if (destInput) destInput.value = dest.name;

  closeBottomSheet('destPickerSheet');
  
  // Set marker and route on map
  mapCtrl.setDestinationPin(dest.lat, dest.lng);
  calculateTaxiPrice();
  openBottomSheet('taxiTariffSheet');
  
  showToast(`Manzil tanlandi: ${dest.name}`, 'info', 'navigation');
}

function startTaxiOrder() {
  sounds.playSuccess();
  appState.taxi.status = 'searching';

  closeBottomSheet('taxiTariffSheet');
  openBottomSheet('taxiSearchingSheet');

  // Dynamic Island status indicator
  const island = document.getElementById('dynamicIsland');
  if (island) {
    island.classList.add('expanded');
    island.innerHTML = `
      <div class="flex items-center gap-2 w-full text-white text-xs">
        <div class="w-3 h-3 rounded-full bg-yellow-400 animate-ping"></div>
        <span class="font-bold flex-1">Haydovchi qidirilmoqda...</span>
        <span class="text-neutral-400">Taksi</span>
      </div>
    `;
  }

  // Simulated search delay -> Driver Assigned
  setTimeout(() => {
    if (appState.taxi.status !== 'searching') return;
    assignDriver();
  }, 2600);
}

function assignDriver() {
  sounds.playSuccess();
  appState.taxi.status = 'assigned';

  const mockDriver = {
    name: 'Jasur Rahimov',
    rating: '4.98',
    trips: '2 840 safar',
    carModel: 'Chevrolet Cobalt',
    carColor: 'Oq',
    plate: '01 A 777 AA',
    phone: '+998 90 999-11-22',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };
  appState.taxi.driver = mockDriver;

  closeBottomSheet('taxiSearchingSheet');
  
  // Fill Driver Card UI
  document.getElementById('driverName').innerText = mockDriver.name;
  document.getElementById('driverRating').innerText = `${mockDriver.rating} ★ (${mockDriver.trips})`;
  document.getElementById('driverCar').innerText = `${mockDriver.carColor} ${mockDriver.carModel}`;
  document.getElementById('driverPlate').innerText = mockDriver.plate;

  openBottomSheet('taxiDriverSheet');

  // Dynamic Island driver on way
  const island = document.getElementById('dynamicIsland');
  if (island) {
    island.innerHTML = `
      <div class="flex items-center justify-between w-full text-white text-xs">
        <div class="flex items-center gap-2">
          <span class="text-yellow-400 font-bold">🚕 Cobalt</span>
          <span class="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">01 A 777 AA</span>
        </div>
        <span id="islandEta" class="text-green-400 font-bold">3 daq</span>
      </div>
    `;
  }

  showToast(`Haydovchi qabul qildi: ${mockDriver.carModel} (${mockDriver.plate})`, 'success', 'car');

  // Start animated driver movement on map
  mapCtrl.simulateDriverApproaching(
    () => {
      // Driver arrived at pickup
      appState.taxi.status = 'arrived';
      const statusTitle = document.getElementById('driverStatusTitle');
      if (statusTitle) {
        statusTitle.innerHTML = `<span class="text-green-600 font-bold">Haydovchi sizni kutmoqda!</span>`;
      }
      showToast('Haydovchi yetib keldi! Chiqishingiz mumkin.', 'success', 'check-circle');

      // After 3s -> Start trip to destination B
      setTimeout(() => {
        startTripToDestination();
      }, 3500);
    },
    (remainingMin) => {
      const etaText = document.getElementById('driverEtaCounter');
      if (etaText) etaText.innerText = `${remainingMin} daqiqada keladi`;
      const islandEta = document.getElementById('islandEta');
      if (islandEta) islandEta.innerText = `${remainingMin} daq`;
    }
  );
}

function startTripToDestination() {
  appState.taxi.status = 'in_trip';
  const statusTitle = document.getElementById('driverStatusTitle');
  if (statusTitle) {
    statusTitle.innerHTML = `<span class="text-blue-600 font-bold">Safar davom etmoqda...</span>`;
  }
  showToast('Safar boshlandi. Yoqimli sayohat!', 'info', 'navigation');

  mapCtrl.simulateTripToDestination(
    () => {
      // Trip completed
      completeTaxiTrip();
    },
    (remainingMin) => {
      const etaText = document.getElementById('driverEtaCounter');
      if (etaText) etaText.innerText = `Yetib borish: ${remainingMin} daqiqa`;
    }
  );
}

function completeTaxiTrip() {
  appState.taxi.status = 'completed';
  closeBottomSheet('taxiDriverSheet');

  // Reset Dynamic Island
  const island = document.getElementById('dynamicIsland');
  if (island) {
    island.classList.remove('expanded');
    island.innerHTML = `
      <div class="w-3 h-3 rounded-full bg-green-500"></div>
      <div class="w-3 h-3 rounded-full bg-neutral-800"></div>
    `;
  }

  // Calculate cashback points
  const t = TARIFFS[appState.taxi.tariff];
  const finalPrice = t.basePrice + Math.round(appState.taxi.distanceKm * t.perKm);
  const plusEarned = Math.round(finalPrice * 0.1);
  appState.user.plusPoints += plusEarned;
  updateUserBadges();

  // Populate Receipt Modal
  document.getElementById('receiptFrom').innerText = appState.taxi.pickup.name;
  document.getElementById('receiptTo').innerText = appState.taxi.destination.name;
  document.getElementById('receiptTotal').innerText = `${formatMoney(finalPrice)} so'm`;
  document.getElementById('receiptPlusEarned').innerText = `+${formatMoney(plusEarned)} ball`;

  openBottomSheet('tripReceiptSheet');
  showToast(`Safar yakunlandi! +${plusEarned} Plus ball berildi!`, 'success', 'sparkles');
}

function cancelTaxiOrder() {
  sounds.playTap();
  appState.taxi.status = 'idle';
  closeAllSheets();
  openBottomSheet('taxiTariffSheet');

  const island = document.getElementById('dynamicIsland');
  if (island) {
    island.classList.remove('expanded');
    island.innerHTML = `
      <div class="w-3 h-3 rounded-full bg-neutral-800"></div>
      <div class="w-3 h-3 rounded-full bg-neutral-800"></div>
    `;
  }

  showToast('Buyurtma bekor qilindi', 'info', 'x-circle');
}

// In-app interactive chat with taxi driver
function sendDriverChatMessage() {
  const input = document.getElementById('driverChatInput');
  const text = input ? input.value.trim() : '';
  if (!text) return;

  sounds.playTap();
  const chatBox = document.getElementById('chatMessagesContainer');
  
  // User bubble
  const userMsg = document.createElement('div');
  userMsg.className = 'flex justify-end mb-2';
  userMsg.innerHTML = `
    <div class="bg-[#FCE000] text-black font-semibold text-xs py-2 px-3 rounded-2xl rounded-tr-none max-w-[80%]">
      ${escapeHtml(text)}
      <div class="text-[9px] text-neutral-600 text-right mt-0.5">Hozir</div>
    </div>
  `;
  chatBox.appendChild(userMsg);
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  // Auto driver reply simulation
  setTimeout(() => {
    sounds.playTap();
    const driverMsg = document.createElement('div');
    driverMsg.className = 'flex justify-start mb-2';
    
    let replyText = "Tushunarli, 2 daqiqada o'sha yerdaman!";
    if (text.toLowerCase().includes('konditsioner')) replyText = "Konditsionerni yoqib qo'ydim, marhamat!";
    if (text.toLowerCase().includes('chiqdim')) replyText = "Ajoyib, avariyniy chiroqlarni yoqib turibman.";

    driverMsg.innerHTML = `
      <div class="bg-neutral-100 text-neutral-900 font-semibold text-xs py-2 px-3 rounded-2xl rounded-tl-none max-w-[80%]">
        ${replyText}
        <div class="text-[9px] text-neutral-400 mt-0.5">Hozir</div>
      </div>
    `;
    chatBox.appendChild(driverMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 1200);
}

// ============================================================================
// 8. SAMOKAT (ELECTRIC SCOOTERS) MODULE
// ============================================================================
window.selectScooter = function(scooterId) {
  sounds.playTap();
  const scooter = SCOOTERS_DATA.find(s => s.id === scooterId);
  if (!scooter) return;

  appState.scooter.selectedScooter = scooter;
  appState.scooter.battery = scooter.battery;

  document.getElementById('scooterDetailId').innerText = scooter.id;
  document.getElementById('scooterDetailBattery').innerText = `${scooter.battery}%`;
  document.getElementById('scooterDetailRange').innerText = `~${scooter.range} km yura oladi`;

  openBottomSheet('scooterDetailSheet');
};

function triggerScooterBell() {
  sounds.playScooterBeep();
  showToast('Samokat signal bermoqda: Bi-biip! 🔊', 'info', 'volume-2');
}

function startScooterQRScan() {
  sounds.playTap();
  closeBottomSheet('scooterDetailSheet');
  
  // Show Camera Scanner Mock
  const scanner = document.getElementById('qrScannerModal');
  if (scanner) scanner.classList.remove('hidden');

  // Auto scan after 2 seconds
  setTimeout(() => {
    sounds.playSuccess();
    if (scanner) scanner.classList.add('hidden');
    startScooterRide();
  }, 2200);
}

function startScooterRide() {
  appState.scooter.rideActive = true;
  appState.scooter.rideSeconds = 0;
  appState.scooter.cost = 0;
  appState.scooter.speed = 18;

  closeAllSheets();
  document.getElementById('scooterActiveHUD').classList.remove('hidden');

  // Dynamic Island
  const island = document.getElementById('dynamicIsland');
  if (island) {
    island.classList.add('expanded');
    island.innerHTML = `
      <div class="flex items-center justify-between w-full text-white text-xs">
        <span class="text-green-400 font-bold">🛴 Samokatda</span>
        <span id="islandScooterSpeed" class="text-yellow-400 font-mono">18 km/h</span>
      </div>
    `;
  }

  // Timer Interval
  if (appState.scooter.timerId) clearInterval(appState.scooter.timerId);
  appState.scooter.timerId = setInterval(() => {
    appState.scooter.rideSeconds++;
    const sec = appState.scooter.rideSeconds;
    const mins = Math.floor(sec / 60);
    const remainderSec = sec % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(remainderSec).padStart(2, '0')}`;

    document.getElementById('scooterRideTimer').innerText = timeFormatted;

    // Cost: 990 so'm per minute
    const cost = Math.max(990, Math.ceil(sec / 60) * 990);
    appState.scooter.cost = cost;
    document.getElementById('scooterRideCost').innerText = `${formatMoney(cost)} so'm`;
  }, 1000);

  // Speedometer fluctuation simulation
  if (appState.scooter.speedInterval) clearInterval(appState.scooter.speedInterval);
  appState.scooter.speedInterval = setInterval(() => {
    let maxModeSpeed = 20;
    if (appState.scooter.mode === 'eco') maxModeSpeed = 15;
    if (appState.scooter.mode === 'sport') maxModeSpeed = 25;

    const current = maxModeSpeed - Math.floor(Math.random() * 4);
    appState.scooter.speed = current;
    const speedEl = document.getElementById('scooterLiveSpeed');
    if (speedEl) speedEl.innerText = current;
    const islandSpeed = document.getElementById('islandScooterSpeed');
    if (islandSpeed) islandSpeed.innerText = `${current} km/h`;
  }, 800);

  showToast('Safaringiz boshlandi! Yo\'l harakati qoidalariga rioya qiling 🛴', 'success', 'shield-check');
}

function setScooterMode(mode) {
  sounds.playTap();
  appState.scooter.mode = mode;
  ['eco', 'drive', 'sport'].forEach(m => {
    const el = document.getElementById(`mode-${m}`);
    if (el) {
      if (m === mode) el.classList.add('bg-black', 'text-white');
      else el.classList.remove('bg-black', 'text-white');
    }
  });
  showToast(`Rejim almashtirildi: ${mode.toUpperCase()}`, 'info', 'zap');
}

function toggleScooterLight() {
  sounds.playTap();
  appState.scooter.lightOn = !appState.scooter.lightOn;
  const btn = document.getElementById('scooterLightBtn');
  if (btn) {
    if (appState.scooter.lightOn) {
      btn.classList.add('bg-yellow-400', 'text-black');
      btn.classList.remove('bg-white/20', 'text-white');
      showToast('Samokat fonari yoqildi 💡', 'info', 'lightbulb');
    } else {
      btn.classList.remove('bg-yellow-400', 'text-black');
      btn.classList.add('bg-white/20', 'text-white');
      showToast('Fonar o\'chirildi', 'info', 'lightbulb');
    }
  }
}

function finishScooterRide() {
  sounds.playTap();
  // Open Parking Photo Modal
  document.getElementById('parkingPhotoModal').classList.remove('hidden');
}

function confirmParkingPhoto() {
  sounds.playSuccess();
  document.getElementById('parkingPhotoModal').classList.add('hidden');
  document.getElementById('scooterActiveHUD').classList.add('hidden');

  if (appState.scooter.timerId) clearInterval(appState.scooter.timerId);
  if (appState.scooter.speedInterval) clearInterval(appState.scooter.speedInterval);
  appState.scooter.rideActive = false;

  // Reset Dynamic Island
  const island = document.getElementById('dynamicIsland');
  if (island) {
    island.classList.remove('expanded');
    island.innerHTML = `
      <div class="w-3 h-3 rounded-full bg-neutral-800"></div>
      <div class="w-3 h-3 rounded-full bg-neutral-800"></div>
    `;
  }

  // Scooter summary modal
  const durationMin = Math.max(1, Math.ceil(appState.scooter.rideSeconds / 60));
  document.getElementById('scooterReceiptTime').innerText = `${durationMin} daqiqa`;
  document.getElementById('scooterReceiptCost').innerText = `${formatMoney(appState.scooter.cost)} so'm`;

  openBottomSheet('scooterReceiptSheet');
  showToast('Samokat safari muvaffaqiyatli yakunlandi!', 'success', 'check-circle');
}

// ============================================================================
// 9. YANDEX LAVKA & FOOD CATALOG INTERACTIONS
// ============================================================================
function renderLavkaCatalog() {
  const container = document.getElementById('lavkaProductGrid');
  if (!container) return;

  let filtered = LAVKA_PRODUCTS;
  if (appState.lavka.category !== 'all') {
    filtered = filtered.filter(p => p.category === appState.lavka.category);
  }

  if (appState.lavka.search) {
    const q = appState.lavka.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
  }

  container.innerHTML = filtered.map(item => {
    const count = appState.lavka.cart[item.id] || 0;
    return `
      <div class="bg-white rounded-2xl p-2.5 shadow-sm border border-neutral-100 flex flex-col justify-between">
        <div class="relative overflow-hidden rounded-xl h-28 bg-neutral-50 mb-2">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-xl" loading="lazy">
          ${item.tag ? `<span class="absolute top-1.5 left-1.5 bg-[#FCE000] text-black font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-sm">${item.tag}</span>` : ''}
        </div>
        <div>
          <div class="text-[11px] text-neutral-400 font-medium">${item.weight}</div>
          <div class="text-xs font-bold text-neutral-900 line-clamp-1">${item.name}</div>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="text-xs font-extrabold text-neutral-900">${formatMoney(item.price)} so'm</span>
            ${item.oldPrice ? `<span class="text-[10px] line-through text-neutral-400">${formatMoney(item.oldPrice)}</span>` : ''}
          </div>
        </div>

        <div class="mt-2.5">
          ${count === 0 ? `
            <button onclick="changeCartItem('${item.id}', 1)" class="w-full py-1.5 bg-neutral-100 hover:bg-[#FCE000] text-neutral-900 font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1">
              <i data-lucide="plus" style="width: 14px; height: 14px;"></i> Savatga
            </button>
          ` : `
            <div class="flex items-center justify-between bg-[#FCE000] text-black font-extrabold text-xs rounded-xl py-1 px-2 shadow-sm">
              <button onclick="changeCartItem('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center active:scale-75 text-base leading-none">
                −
              </button>
              <span>${count}</span>
              <button onclick="changeCartItem('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center active:scale-75 text-base leading-none">
                +
              </button>
            </div>
          `}
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function setLavkaCategory(catKey) {
  sounds.playTap();
  appState.lavka.category = catKey;

  document.querySelectorAll('.lavka-cat-pill').forEach(pill => {
    pill.classList.remove('bg-neutral-900', 'text-white');
    pill.classList.add('bg-white', 'text-neutral-700');
  });

  const activePill = document.getElementById(`lavka-cat-${catKey}`);
  if (activePill) {
    activePill.classList.remove('bg-white', 'text-neutral-700');
    activePill.classList.add('bg-neutral-900', 'text-white');
  }

  renderLavkaCatalog();
}

function changeCartItem(itemId, delta) {
  sounds.playTap();
  const current = appState.lavka.cart[itemId] || 0;
  const next = current + delta;

  if (next <= 0) {
    delete appState.lavka.cart[itemId];
  } else {
    appState.lavka.cart[itemId] = next;
  }

  renderLavkaCatalog();
  updateCartUI();
}

function updateCartUI() {
  const cartEntries = Object.entries(appState.lavka.cart);
  let totalCount = 0;
  let totalPrice = 0;

  cartEntries.forEach(([id, count]) => {
    const prod = LAVKA_PRODUCTS.find(p => p.id === id);
    if (prod) {
      totalCount += count;
      totalPrice += prod.price * count;
    }
  });

  const floatingBar = document.getElementById('lavkaFloatingCartBar');
  if (floatingBar) {
    if (totalCount > 0) {
      floatingBar.classList.remove('hidden');
      document.getElementById('floatingCartCount').innerText = `${totalCount} ta tovar`;
      document.getElementById('floatingCartPrice').innerText = `${formatMoney(totalPrice)} so'm`;
    } else {
      floatingBar.classList.add('hidden');
    }
  }

  // Update Free Delivery Progress Bar (Free at 80 000 so'm)
  const freeThreshold = 80000;
  const deliveryLeft = Math.max(0, freeThreshold - totalPrice);
  const progressBar = document.getElementById('cartDeliveryProgress');
  const deliveryText = document.getElementById('cartDeliveryText');
  if (progressBar) {
    const pct = Math.min(100, Math.round((totalPrice / freeThreshold) * 100));
    progressBar.style.width = `${pct}%`;
  }
  if (deliveryText) {
    if (deliveryLeft === 0) {
      deliveryText.innerHTML = `<span class="text-green-600 font-bold">Yetkazib berish tekin! 🎉</span>`;
    } else {
      deliveryText.innerText = `Yana ${formatMoney(deliveryLeft)} so'm xarid qiling — bepul yetkazamiz`;
    }
  }
}

function openCartDrawer() {
  sounds.playTap();
  renderCartDrawerItems();
  openBottomSheet('lavkaCartSheet');
}

function renderCartDrawerItems() {
  const container = document.getElementById('cartDrawerItemsList');
  if (!container) return;

  const entries = Object.entries(appState.lavka.cart);
  if (entries.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-neutral-400 font-medium">Savat bo'sh</div>`;
    return;
  }

  let subtotal = 0;
  container.innerHTML = entries.map(([id, count]) => {
    const prod = LAVKA_PRODUCTS.find(p => p.id === id);
    if (!prod) return '';
    const itemTotal = prod.price * count;
    subtotal += itemTotal;

    return `
      <div class="flex items-center justify-between py-2 border-b border-neutral-100">
        <div class="flex items-center gap-3">
          <img src="${prod.image}" class="w-12 h-12 object-cover rounded-xl" />
          <div>
            <div class="text-xs font-bold text-neutral-900">${prod.name}</div>
            <div class="text-[11px] text-neutral-400">${formatMoney(prod.price)} so'm</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="changeCartItem('${id}', -1); renderCartDrawerItems();" class="w-7 h-7 bg-neutral-100 rounded-lg flex items-center justify-center font-bold text-sm active:scale-75">
            −
          </button>
          <span class="text-xs font-extrabold w-4 text-center">${count}</span>
          <button onclick="changeCartItem('${id}', 1); renderCartDrawerItems();" class="w-7 h-7 bg-neutral-100 rounded-lg flex items-center justify-center font-bold text-sm active:scale-75">
            +
          </button>
        </div>
      </div>
    `;
  }).join('');

  const deliveryFee = subtotal >= 80000 ? 0 : 9000;
  const finalTotal = subtotal + deliveryFee;

  document.getElementById('cartSubtotalText').innerText = `${formatMoney(subtotal)} so'm`;
  document.getElementById('cartDeliveryFeeText').innerText = deliveryFee === 0 ? 'Bepul' : `${formatMoney(deliveryFee)} so'm`;
  document.getElementById('cartFinalTotalButton').innerText = `Buyurtma berish: ${formatMoney(finalTotal)} so'm`;
}

function submitLavkaOrder() {
  sounds.playSuccess();
  closeBottomSheet('lavkaCartSheet');

  // Clear cart
  appState.lavka.cart = {};
  updateCartUI();
  renderLavkaCatalog();

  // Open live tracking modal
  openBottomSheet('lavkaTrackingSheet');
  
  // Progress tracker simulation
  simulateLavkaTracking();
}

function simulateLavkaTracking() {
  const steps = [
    { title: "Buyurtma qabul qilindi & omborda yig'ilmoqda", icon: "package-check", time: "1 daq" },
    { title: "Kuryer buyurtmani oldi va yo'lga chiqdi", icon: "bike", time: "8 daq" },
    { title: "Kuryer eshigingiz oldida! Qabul qilib oling", icon: "home", time: "Yetib keldi" }
  ];

  let current = 0;
  const interval = setInterval(() => {
    current++;
    if (current < steps.length) {
      document.getElementById('trackingStatusTitle').innerText = steps[current].title;
      document.getElementById('trackingEtaText').innerText = steps[current].time;
      showToast(steps[current].title, 'info', steps[current].icon);
    } else {
      clearInterval(interval);
      sounds.playSuccess();
      showToast("Buyurtma yetkazildi! Yoqimli ishtaha!", 'success', 'sparkles');
    }
  }, 3500);
}

// ============================================================================
// 10. COURIER / YETKAZIB BERISH MODULE
// ============================================================================
function setDeliveryType(type) {
  sounds.playTap();
  appState.delivery.type = type;

  ['foot', 'auto', 'cargo'].forEach(t => {
    const el = document.getElementById(`delivery-type-${t}`);
    if (el) {
      if (t === type) {
        el.classList.add('ring-2', 'ring-black', 'bg-yellow-50');
      } else {
        el.classList.remove('ring-2', 'ring-black', 'bg-yellow-50');
      }
    }
  });

  const priceMap = { foot: 14000, auto: 22000, cargo: 45000 };
  let price = priceMap[type];
  if (appState.delivery.doorToDoor) price += 4000;

  document.getElementById('deliveryOrderButtonPrice').innerText = `${formatMoney(price)} so'm`;
}

function toggleDoorToDoor() {
  sounds.playTap();
  appState.delivery.doorToDoor = !appState.delivery.doorToDoor;
  const toggle = document.getElementById('doorToDoorToggle');
  if (toggle) {
    if (appState.delivery.doorToDoor) {
      toggle.classList.add('bg-[#00C853]');
      toggle.querySelector('span').classList.add('translate-x-5');
    } else {
      toggle.classList.remove('bg-[#00C853]');
      toggle.querySelector('span').classList.remove('translate-x-5');
    }
  }
  setDeliveryType(appState.delivery.type);
}

function submitDeliveryOrder() {
  sounds.playSuccess();
  closeBottomSheet('deliveryModalSheet');

  showToast('Kuryer chaqirildi! Eng yaqin kuryer qabul qilmoqda.', 'success', 'send');
}

// ============================================================================
// 11. TRANSPORT & TASHKENT METRO/BUS TRACKER
// ============================================================================
function renderTransport() {
  const container = document.getElementById('transportLinesList');
  if (!container) return;

  container.innerHTML = METRO_LINES.map(line => `
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 mb-3">
      <div class="flex items-center gap-2 mb-3">
        <span class="w-3.5 h-3.5 rounded-full" style="background-color: ${line.color}"></span>
        <h4 class="font-bold text-sm text-neutral-900">${line.name}</h4>
      </div>
      <div class="space-y-2">
        ${line.stations.map(st => `
          <div class="flex items-center justify-between text-xs py-1 border-b border-neutral-50 last:border-none">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full border border-neutral-400"></span>
              <span class="font-medium text-neutral-800">${st.name}</span>
            </div>
            <span class="bg-neutral-100 text-neutral-600 font-bold px-2 py-0.5 rounded-md text-[10px]">${st.time}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ============================================================================
// 12. STORIES ENGINE (INSTAGRAM / YANDEX GO STYLE)
// ============================================================================
function openStory(index) {
  sounds.playTap();
  appState.stories.active = true;
  appState.stories.currentIndex = index;

  const modal = document.getElementById('storyViewerModal');
  if (modal) modal.classList.remove('hidden');

  renderCurrentStory();
}

function renderCurrentStory() {
  const story = STORIES_DATA[appState.stories.currentIndex];
  if (!story) return;

  const content = document.getElementById('storyContentContainer');
  content.className = `w-full h-full p-6 flex flex-col justify-between text-white bg-gradient-to-br ${story.bg}`;

  content.innerHTML = `
    <div>
      <div class="flex items-center justify-between mb-4">
        <span class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide">${story.tag}</span>
        <button onclick="closeStory()" class="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
          <i data-lucide="x" style="width: 18px; height: 18px;"></i>
        </button>
      </div>
      <h2 class="text-2xl font-black leading-tight mt-6">${story.title}</h2>
      <p class="text-white/80 font-medium text-sm mt-2">${story.subtitle}</p>
    </div>

    <div class="space-y-6">
      <div class="bg-black/25 backdrop-blur-md rounded-2xl p-4 text-xs font-semibold leading-relaxed border border-white/10">
        ${story.text}
      </div>
      <button onclick="handleStoryAction()" class="w-full py-3.5 bg-[#FCE000] text-black font-extrabold rounded-2xl active:scale-95 transition-transform text-sm shadow-lg">
        ${story.cta}
      </button>
    </div>
  `;

  lucide.createIcons();

  // Progress Bar Animation
  const bar = document.getElementById('storyProgressBar');
  if (bar) {
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.transition = 'width 5s linear';
      bar.style.width = '100%';
    }, 50);
  }

  if (appState.stories.interval) clearTimeout(appState.stories.interval);
  appState.stories.interval = setTimeout(() => {
    nextStory();
  }, 5000);
}

function nextStory() {
  if (appState.stories.currentIndex < STORIES_DATA.length - 1) {
    appState.stories.currentIndex++;
    renderCurrentStory();
  } else {
    closeStory();
  }
}

function closeStory() {
  appState.stories.active = false;
  if (appState.stories.interval) clearTimeout(appState.stories.interval);
  document.getElementById('storyViewerModal').classList.add('hidden');
}

function handleStoryAction() {
  const story = STORIES_DATA[appState.stories.currentIndex];
  closeStory();
  if (story.tag === 'Plus') showToast('Yandex Plus faollashtirildi!', 'success', 'sparkles');
  if (story.tag === 'Komfort+') {
    switchView('taxi');
    selectTariff('komfort_plus');
  }
  if (story.tag === 'Samokat') switchView('scooters');
  if (story.tag === 'Lavka') switchView('lavka');
}

// ============================================================================
// 13. SIDE MENU DRAWER & USER PROFILE
// ============================================================================
function toggleSideMenu() {
  sounds.playTap();
  const drawer = document.getElementById('sideMenuDrawer');
  const overlay = document.getElementById('modalOverlay');

  if (drawer.classList.contains('-translate-x-full')) {
    drawer.classList.remove('-translate-x-full');
    drawer.classList.add('translate-x-0');
    overlay.classList.add('open');
  } else {
    drawer.classList.add('-translate-x-full');
    drawer.classList.remove('translate-x-0');
    overlay.classList.remove('open');
  }
}

function openHistoryModal() {
  sounds.playTap();
  toggleSideMenu();
  
  const container = document.getElementById('historyItemsList');
  container.innerHTML = appState.history.map(item => `
    <div class="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 mb-2">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-bold text-neutral-900">${item.service}</span>
        <span class="text-xs font-extrabold text-neutral-900">${item.price}</span>
      </div>
      <div class="text-[11px] text-neutral-500 mb-1">
        ${item.from} → ${item.to}
      </div>
      <div class="flex items-center justify-between text-[10px] text-neutral-400">
        <span>${item.date}</span>
        <span>${'★'.repeat(item.rating)}</span>
      </div>
    </div>
  `).join('');

  openBottomSheet('historyModalSheet');
}

function openSupportChat() {
  sounds.playTap();
  toggleSideMenu();
  openBottomSheet('supportChatSheet');
}

function applyPromoCode() {
  const input = document.getElementById('promoCodeInput');
  const code = input ? input.value.trim().toUpperCase() : '';
  if (!code) return;

  sounds.playSuccess();
  if (code === 'TOSHKENT' || code === 'YANDEX2025' || code === 'PLUS') {
    appState.taxi.discount = 10000;
    calculateTaxiPrice();
    showToast(`Promokod qabul qilindi: 10 000 so'm chegirma! 🎉`, 'success', 'tag');
    closeBottomSheet('promoCodeSheet');
  } else {
    showToast('Bunday promokod mavjud emas', 'danger', 'alert-circle');
  }
}

function updateUserBadges() {
  const plusBadges = document.querySelectorAll('.user-plus-badge');
  plusBadges.forEach(b => {
    b.innerText = `${formatMoney(appState.user.plusPoints)} ball`;
  });
}

// ============================================================================
// 14. HELPER UTILITIES
// ============================================================================
function formatMoney(num) {
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Update digital clock in mobile status bar
function updateClock() {
  const clockEl = document.getElementById('phoneStatusTime');
  if (clockEl) {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    clockEl.innerText = `${hrs}:${mins}`;
  }
}

// ============================================================================
// 15. INITIALIZATION ON DOM READY
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Update Tashkent clock every minute
  updateClock();
  setInterval(updateClock, 10000);

  // Initialize Lucide icons
  lucide.createIcons();

  // Initial calculations
  calculateTaxiPrice();
  updateUserBadges();

  // Populate Destination quick picks
  const quickList = document.getElementById('recentDestinationsList');
  if (quickList) {
    quickList.innerHTML = TASHKENT_LOCATIONS.slice(0, 4).map(loc => `
      <div onclick="switchView('taxi'); selectDestination(TASHKENT_LOCATIONS.find(l => l.name === '${loc.name}'))" class="flex items-center gap-3.5 p-3 bg-white rounded-2xl active:scale-[0.98] transition-transform cursor-pointer border border-neutral-100 shadow-sm">
        <div class="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
          <i data-lucide="${loc.icon}" style="width: 18px; height: 18px;"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-neutral-900 truncate">${loc.name}</div>
          <div class="text-[11px] text-neutral-400 truncate">${loc.address}</div>
        </div>
        <span class="text-[11px] font-bold text-neutral-400">${loc.durationMin} daq</span>
      </div>
    `).join('');
    lucide.createIcons();
  }

  // Populate preset destinations inside modal picker
  const pickerList = document.getElementById('destPickerList');
  if (pickerList) {
    pickerList.innerHTML = TASHKENT_LOCATIONS.map(loc => `
      <div onclick="selectDestination(TASHKENT_LOCATIONS.find(l => l.name === '${loc.name}'))" class="flex items-center gap-3.5 p-3 hover:bg-neutral-50 rounded-2xl cursor-pointer active:scale-95 transition-all">
        <div class="w-8 h-8 rounded-full bg-yellow-100 text-neutral-900 flex items-center justify-center">
          <i data-lucide="${loc.icon}" style="width: 16px; height: 16px;"></i>
        </div>
        <div class="flex-1">
          <div class="text-xs font-bold text-neutral-900">${loc.name}</div>
          <div class="text-[10px] text-neutral-400">${loc.address}</div>
        </div>
        <div class="text-right">
          <div class="text-xs font-extrabold text-neutral-900">${loc.distanceKm} km</div>
          <div class="text-[10px] text-neutral-400">~${loc.durationMin} daq</div>
        </div>
      </div>
    `).join('');
    lucide.createIcons();
  }

  // Initialize Stories bar
  const storiesBar = document.getElementById('storiesBarContainer');
  if (storiesBar) {
    storiesBar.innerHTML = STORIES_DATA.map((st, idx) => `
      <div onclick="openStory(${idx})" class="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform flex-shrink-0">
        <div class="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr ${st.bg} shadow-sm">
          <div class="w-full h-full bg-white rounded-[14px] p-0.5 flex flex-col justify-end overflow-hidden relative">
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <span class="relative z-10 text-[9px] font-extrabold text-white text-center leading-tight mb-1 px-1 line-clamp-1">${st.tag}</span>
          </div>
        </div>
        <span class="text-[10px] font-bold text-neutral-700 truncate w-16 text-center">${st.title}</span>
      </div>
    `).join('');
  }

  // Click handler for backdrop overlay to close modals
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeAllSheets();
      const drawer = document.getElementById('sideMenuDrawer');
      if (drawer) {
        drawer.classList.add('-translate-x-full');
        drawer.classList.remove('translate-x-0');
      }
      overlay.classList.remove('open');
    });
  }

  // Welcome toast
  setTimeout(() => {
    showToast("Xush kelibsiz! Yandex Go Toshkent tayyor 🚕", "success", "check");
  }, 600);
});
