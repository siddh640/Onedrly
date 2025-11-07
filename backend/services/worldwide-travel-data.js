/**
 * WORLDWIDE TRAVEL DATA GENERATOR
 * Works for ANY two cities on Earth!
 * Generates realistic travel options (Flights, Trains, Buses, Hotels, Rides)
 */

class WorldwideTravelData {
  constructor() {
    // Major worldwide cities database
    this.cities = {
      // Asia
      'mumbai': { country: 'India', lat: 19.0760, lng: 72.8777, airport: 'BOM', timezone: 'Asia/Kolkata' },
      'delhi': { country: 'India', lat: 28.7041, lng: 77.1025, airport: 'DEL', timezone: 'Asia/Kolkata' },
      'bangalore': { country: 'India', lat: 12.9716, lng: 77.5946, airport: 'BLR', timezone: 'Asia/Kolkata' },
      'tokyo': { country: 'Japan', lat: 35.6762, lng: 139.6503, airport: 'NRT', timezone: 'Asia/Tokyo' },
      'beijing': { country: 'China', lat: 39.9042, lng: 116.4074, airport: 'PEK', timezone: 'Asia/Shanghai' },
      'shanghai': { country: 'China', lat: 31.2304, lng: 121.4737, airport: 'PVG', timezone: 'Asia/Shanghai' },
      'singapore': { country: 'Singapore', lat: 1.3521, lng: 103.8198, airport: 'SIN', timezone: 'Asia/Singapore' },
      'dubai': { country: 'UAE', lat: 25.2048, lng: 55.2708, airport: 'DXB', timezone: 'Asia/Dubai' },
      'bangkok': { country: 'Thailand', lat: 13.7563, lng: 100.5018, airport: 'BKK', timezone: 'Asia/Bangkok' },
      'hong kong': { country: 'Hong Kong', lat: 22.3193, lng: 114.1694, airport: 'HKG', timezone: 'Asia/Hong_Kong' },
      'seoul': { country: 'South Korea', lat: 37.5665, lng: 126.9780, airport: 'ICN', timezone: 'Asia/Seoul' },
      
      // Europe
      'london': { country: 'UK', lat: 51.5074, lng: -0.1278, airport: 'LHR', timezone: 'Europe/London' },
      'paris': { country: 'France', lat: 48.8566, lng: 2.3522, airport: 'CDG', timezone: 'Europe/Paris' },
      'berlin': { country: 'Germany', lat: 52.5200, lng: 13.4050, airport: 'TXL', timezone: 'Europe/Berlin' },
      'rome': { country: 'Italy', lat: 41.9028, lng: 12.4964, airport: 'FCO', timezone: 'Europe/Rome' },
      'madrid': { country: 'Spain', lat: 40.4168, lng: -3.7038, airport: 'MAD', timezone: 'Europe/Madrid' },
      'amsterdam': { country: 'Netherlands', lat: 52.3676, lng: 4.9041, airport: 'AMS', timezone: 'Europe/Amsterdam' },
      'zurich': { country: 'Switzerland', lat: 47.3769, lng: 8.5417, airport: 'ZRH', timezone: 'Europe/Zurich' },
      
      // North America
      'new york': { country: 'USA', lat: 40.7128, lng: -74.0060, airport: 'JFK', timezone: 'America/New_York' },
      'los angeles': { country: 'USA', lat: 34.0522, lng: -118.2437, airport: 'LAX', timezone: 'America/Los_Angeles' },
      'chicago': { country: 'USA', lat: 41.8781, lng: -87.6298, airport: 'ORD', timezone: 'America/Chicago' },
      'toronto': { country: 'Canada', lat: 43.6532, lng: -79.3832, airport: 'YYZ', timezone: 'America/Toronto' },
      'mexico city': { country: 'Mexico', lat: 19.4326, lng: -99.1332, airport: 'MEX', timezone: 'America/Mexico_City' },
      
      // South America
      'sao paulo': { country: 'Brazil', lat: -23.5505, lng: -46.6333, airport: 'GRU', timezone: 'America/Sao_Paulo' },
      'rio de janeiro': { country: 'Brazil', lat: -22.9068, lng: -43.1729, airport: 'GIG', timezone: 'America/Sao_Paulo' },
      'buenos aires': { country: 'Argentina', lat: -34.6037, lng: -58.3816, airport: 'EZE', timezone: 'America/Argentina/Buenos_Aires' },
      
      // Africa
      'cairo': { country: 'Egypt', lat: 30.0444, lng: 31.2357, airport: 'CAI', timezone: 'Africa/Cairo' },
      'cape town': { country: 'South Africa', lat: -33.9249, lng: 18.4241, airport: 'CPT', timezone: 'Africa/Johannesburg' },
      'nairobi': { country: 'Kenya', lat: -1.2921, lng: 36.8219, airport: 'NBO', timezone: 'Africa/Nairobi' },
      
      // Oceania
      'sydney': { country: 'Australia', lat: -33.8688, lng: 151.2093, airport: 'SYD', timezone: 'Australia/Sydney' },
      'melbourne': { country: 'Australia', lat: -37.8136, lng: 144.9631, airport: 'MEL', timezone: 'Australia/Melbourne' },
      'auckland': { country: 'New Zealand', lat: -36.8485, lng: 174.7633, airport: 'AKL', timezone: 'Pacific/Auckland' }
    };

    // Major airlines by region
    this.airlines = {
      asia: ['Air India', 'Emirates', 'Singapore Airlines', 'Cathay Pacific', 'ANA', 'Thai Airways'],
      europe: ['British Airways', 'Lufthansa', 'Air France', 'KLM', 'Ryanair', 'EasyJet'],
      americas: ['American Airlines', 'United', 'Delta', 'Air Canada', 'LATAM', 'Aeromexico'],
      global: ['Emirates', 'Qatar Airways', 'Singapore Airlines', 'Etihad', 'Turkish Airlines']
    };
  }

  /**
   * GENERATE FLIGHTS - Works for ANY city pair worldwide
   */
  generateFlights(from, to, departureDate, passengers = 1) {
    console.log(`🌍 Generating worldwide flights: ${from} → ${to}`);
    
    const fromCity = this.getCityData(from);
    const toCity = this.getCityData(to);
    
    if (!fromCity || !toCity) {
      console.warn(`City not in database: ${from} or ${to}`);
      return this.generateGenericFlights(from, to, departureDate, passengers);
    }

    const distance = this.calculateDistance(fromCity.lat, fromCity.lng, toCity.lat, toCity.lng);
    const flightTime = this.estimateFlightTime(distance);
    const basePrice = this.calculateFlightPrice(distance);
    const sameCountry = fromCity.country === toCity.country;
    
    const airlines = sameCountry ? 
      this.getRegionalAirlines(fromCity.country) : 
      this.airlines.global;

    const flights = [];
    const numFlights = sameCountry ? 8 : 12; // More options for international

    for (let i = 0; i < numFlights; i++) {
      const departTime = new Date(departureDate);
      departTime.setHours(6 + i * 2, Math.floor(Math.random() * 60));
      
      const arrivalTime = new Date(departTime);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + flightTime);
      
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNumber = `${this.getAirlineCode(airline)}${Math.floor(100 + Math.random() * 900)}`;
      const stops = distance > 3000 && Math.random() > 0.6 ? 1 : 0;
      
      // Price varies by time, class, and demand
      const timeMultiplier = (i < 2 || i > numFlights - 3) ? 1.3 : 1.0; // Early/late flights more expensive
      const stopsDiscount = stops > 0 ? 0.8 : 1.0;
      const price = Math.round(basePrice * timeMultiplier * stopsDiscount * (0.9 + Math.random() * 0.3));

      flights.push({
        id: `flight-${flightNumber}-${i}`,
        source: 'worldwide_generator',
        airline: airline,
        flightNumber: flightNumber,
        origin: {
          city: from,
          country: fromCity.country,
          airport: fromCity.airport,
          code: fromCity.airport
        },
        destination: {
          city: to,
          country: toCity.country,
          airport: toCity.airport,
          code: toCity.airport
        },
        departureTime: departTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        duration: this.formatDuration(flightTime),
        stops: stops,
        stopCities: stops > 0 ? [this.getRandomHub(fromCity, toCity)] : [],
        price: price,
        currency: sameCountry ? this.getCurrency(fromCity.country) : 'USD',
        available: true,
        seatsAvailable: Math.floor(50 + Math.random() * 150),
        cabinClass: 'Economy',
        aircraft: this.getAircraftType(distance),
        amenities: this.getFlightAmenities(distance, airline),
        baggage: {
          checkedIncluded: distance > 1000 ? 2 : 1,
          carryOn: 1,
          totalWeight: distance > 1000 ? '40kg' : '25kg'
        },
        refundable: Math.random() > 0.7,
        changeable: Math.random() > 0.5
      });
    }

    return flights.sort((a, b) => a.price - b.price);
  }

  /**
   * GENERATE TRAINS - Works worldwide (where trains exist)
   */
  generateTrains(from, to, departureDate) {
    console.log(`🚂 Generating worldwide trains: ${from} → ${to}`);
    
    const fromCity = this.getCityData(from);
    const toCity = this.getCityData(to);
    
    if (!fromCity || !toCity) {
      return [];
    }

    // Check if countries have good rail networks
    const railCountries = ['India', 'Japan', 'China', 'UK', 'France', 'Germany', 'Spain', 'Italy'];
    const sameCountry = fromCity.country === toCity.country;
    
    if (!sameCountry || !railCountries.includes(fromCity.country)) {
      console.log(`⚠️ No train service between ${from} and ${to}`);
      return [];
    }

    const distance = this.calculateDistance(fromCity.lat, fromCity.lng, toCity.lat, toCity.lng);
    const trainTime = this.estimateTrainTime(distance, fromCity.country);
    const basePrice = this.calculateTrainPrice(distance, fromCity.country);
    
    const trains = [];
    const trainTypes = this.getTrainTypes(fromCity.country);
    const numTrains = 6;

    for (let i = 0; i < numTrains; i++) {
      const trainType = trainTypes[Math.floor(Math.random() * trainTypes.length)];
      const departTime = new Date(departureDate);
      departTime.setHours(6 + i * 2.5, Math.floor(Math.random() * 60));
      
      const arrivalTime = new Date(departTime);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + trainTime);

      trains.push({
        id: `train-${i}`,
        source: 'worldwide_generator',
        trainNumber: `${this.getCountryPrefix(fromCity.country)}${Math.floor(1000 + Math.random() * 9000)}`,
        trainName: `${trainType.name} ${from} - ${to}`,
        trainType: trainType.type,
        origin: from,
        destination: to,
        departureTime: departTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        duration: this.formatDuration(trainTime),
        price: Math.round(basePrice * trainType.priceMultiplier),
        currency: this.getCurrency(fromCity.country),
        available: true,
        seatsAvailable: Math.floor(30 + Math.random() * 100),
        classes: trainType.classes,
        amenities: trainType.amenities,
        operator: this.getTrainOperator(fromCity.country)
      });
    }

    return trains;
  }

  /**
   * GENERATE BUSES - Works worldwide
   */
  generateBuses(from, to, departureDate) {
    console.log(`🚌 Generating worldwide buses: ${from} → ${to}`);
    
    const fromCity = this.getCityData(from);
    const toCity = this.getCityData(to);
    
    if (!fromCity || !toCity) {
      return this.generateGenericBuses(from, to, departureDate);
    }

    const distance = this.calculateDistance(fromCity.lat, fromCity.lng, toCity.lat, toCity.lng);
    
    // Buses only for short to medium distances
    if (distance > 500) {
      console.log(`⚠️ Distance too far for buses: ${distance}km`);
      return [];
    }

    const busTime = this.estimateBusTime(distance);
    const basePrice = distance * 0.08; // $0.08 per km
    const buses = [];

    for (let i = 0; i < 6; i++) {
      const departTime = new Date(departureDate);
      departTime.setHours(7 + i * 3, Math.floor(Math.random() * 60));
      
      const arrivalTime = new Date(departTime);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + busTime);

      const busType = i < 2 ? 'Luxury' : (i < 4 ? 'Semi-Luxury' : 'Standard');
      const multiplier = busType === 'Luxury' ? 1.5 : (busType === 'Semi-Luxury' ? 1.2 : 1.0);

      buses.push({
        id: `bus-${i}`,
        source: 'worldwide_generator',
        operator: this.getBusOperator(fromCity.country),
        busType: busType,
        origin: from,
        destination: to,
        departureTime: departTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        duration: this.formatDuration(busTime),
        price: Math.round(basePrice * multiplier),
        currency: this.getCurrency(fromCity.country),
        available: true,
        seatsAvailable: Math.floor(10 + Math.random() * 30),
        amenities: busType === 'Luxury' ? ['WiFi', 'AC', 'Reclining Seats', 'Charging Ports'] :
                  busType === 'Semi-Luxury' ? ['AC', 'Reclining Seats'] : ['AC'],
        totalSeats: busType === 'Luxury' ? 20 : 40
      });
    }

    return buses;
  }

  /**
   * GENERATE HOTELS - Works worldwide with REALISTIC details
   */
  generateHotels(destination, checkIn, checkOut) {
    console.log(`🏨 Generating worldwide hotels in: ${destination}`);
    
    const cityData = this.getCityData(destination);
    const basePricePerNight = cityData ? this.getHotelBasePrice(cityData.country) : 50;
    
    const hotels = [];
    
    // Real hotel chains and brands
    const hotelBrands = {
      5: ['The Taj Palace', 'ITC Grand', 'The Oberoi', 'Marriott Executive', 'Hyatt Regency', 'Shangri-La', 'Four Seasons', 'The Leela Palace', 'JW Marriott'],
      4: ['Radisson Blu', 'Holiday Inn', 'Courtyard by Marriott', 'Hilton Garden Inn', 'Novotel', 'Ramada', 'Crowne Plaza', 'The Park', 'Lemon Tree Premier'],
      3: ['ibis', 'Red Fox Hotel', 'Treebo', 'FabHotel', 'Ginger Hotel', 'Sarovar Portico', 'Keys Hotel', 'Country Inn'],
      2: ['OYO Flagship', 'Super OYO', 'Collection O', 'Townhouse', 'Capital O']
    };

    const hotelTypes = [
      { 
        stars: 5, 
        name: 'Luxury', 
        multiplier: 300, // ₹8000-15000 for India
        amenities: ['Swimming Pool', 'Full-Service Spa', 'Fitness Center', 'Multiple Restaurants', 'Bar & Lounge', 'Concierge Service', '24/7 Room Service', 'Valet Parking', 'Business Center', 'Airport Shuttle', 'WiFi', 'Mini Bar', 'In-room Dining'],
        description: 'Experience world-class luxury with exceptional service, premium amenities, and elegant rooms designed for the discerning traveler.'
      },
      { 
        stars: 4, 
        name: 'Premium', 
        multiplier: 150, // ₹4000-6000 for India
        amenities: ['Swimming Pool', 'Gym', 'Restaurant', 'Free WiFi', 'Room Service', 'Business Center', 'Parking', 'AC', 'Breakfast Buffet'],
        description: 'Premium comfort meets modern convenience. Perfect blend of luxury amenities and value for business and leisure travelers.'
      },
      { 
        stars: 3, 
        name: 'Comfort', 
        multiplier: 80, // ₹2000-3000 for India
        amenities: ['Free WiFi', 'AC', 'Restaurant', 'Breakfast', 'Parking', 'Room Service', 'Travel Desk'],
        description: 'Comfortable accommodations with essential amenities. Great value for travelers seeking quality and convenience.'
      },
      { 
        stars: 2, 
        name: 'Budget', 
        multiplier: 40, // ₹1000-1500 for India
        amenities: ['Free WiFi', 'AC', 'Daily Housekeeping', 'Front Desk'],
        description: 'Clean, budget-friendly rooms perfect for travelers who value affordability without compromising on basic comforts.'
      }
    ];

    const locations = [
      'Connaught Place', 'Airport Road', 'City Center', 'Railway Station Area', 
      'Business District', 'Near Metro Station', 'Tourist Area', 'Shopping District'
    ];

    hotelTypes.forEach((type, typeIndex) => {
      const brands = hotelBrands[type.stars];
      
      for (let i = 0; i < 3; i++) {
        const brand = brands[i % brands.length];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const distanceFromCenter = (0.5 + Math.random() * 5).toFixed(1);
        
        // More realistic pricing with variation
        const basePrice = basePricePerNight * type.multiplier;
        const priceVariation = 0.85 + Math.random() * 0.3; // ±15% variation
        const finalPrice = Math.round(basePrice * priceVariation);

        hotels.push({
          id: `hotel-${typeIndex}-${i}`,
          source: 'worldwide_generator',
          name: `${brand} ${destination}`,
          starRating: type.stars,
          rating: (3.5 + Math.random() * 1.5).toFixed(1),
          reviewCount: Math.floor(100 + Math.random() * 2500),
          pricePerNight: finalPrice,
          originalPrice: type.stars >= 4 ? Math.round(finalPrice * 1.2) : null, // Show discount
          currency: cityData ? this.getCurrency(cityData.country) : 'USD',
          address: `${location}, ${destination}`,
          location: location,
          distanceFromCenter: `${distanceFromCenter} km`,
          distanceFromAirport: `${(5 + Math.random() * 15).toFixed(1)} km`,
          amenities: type.amenities,
          roomType: i === 0 ? 'Deluxe Room' : (i === 1 ? 'Superior Room' : 'Standard Room'),
          bedType: i === 0 ? 'King Bed' : (i === 1 ? 'Queen Bed' : 'Twin Beds'),
          roomSize: type.stars >= 4 ? `${25 + type.stars * 5} sqm` : `${15 + type.stars * 3} sqm`,
          maxOccupancy: type.stars >= 4 ? '3 adults' : '2 adults',
          description: type.description,
          available: true,
          roomsAvailable: Math.floor(3 + Math.random() * 20),
          breakfast: type.stars >= 3 ? 'Complimentary breakfast included' : 'Breakfast available at extra cost',
          checkIn: '2:00 PM',
          checkOut: '12:00 PM',
          cancellation: type.stars >= 3 ? 'Free cancellation up to 24 hours before check-in' : 'Non-refundable',
          paymentOptions: ['Pay at hotel', 'Pay online', 'Credit/Debit cards accepted'],
          propertyType: type.stars >= 4 ? 'Hotel' : (type.stars === 3 ? 'Hotel' : 'Budget Hotel'),
          images: [
            `https://source.unsplash.com/800x600/?hotel,${type.stars}star,luxury`,
            `https://source.unsplash.com/800x600/?hotelroom,bedroom`,
            `https://source.unsplash.com/800x600/?hotel,lobby`
          ]
        });
      }
    });

    return hotels;
  }

  /**
   * GENERATE RIDES - Works worldwide
   */
  generateRides(from, to) {
    console.log(`🚗 Generating worldwide ride options: ${from} → ${to}`);
    
    const fromCity = this.getCityData(from);
    const toCity = this.getCityData(to);
    
    if (!fromCity || !toCity) {
      return this.generateGenericRides(from, to);
    }

    const distance = this.calculateDistance(fromCity.lat, fromCity.lng, toCity.lat, toCity.lng);
    
    // Rides only for reasonable distances
    if (distance > 300) {
      console.log(`⚠️ Distance too far for rides: ${distance}km`);
      return [];
    }

    const basePrice = distance * 1.5; // $1.5 per km
    const duration = Math.round(distance * 1.2); // mins

    return [
      {
        id: 'ride-economy',
        source: 'worldwide_generator',
        service: 'Economy',
        provider: 'Uber / Lyft',
        vehicleType: 'Sedan',
        capacity: 4,
        estimatedPrice: Math.round(basePrice * 1.0),
        currency: 'USD',
        duration: this.formatDuration(duration),
        distance: `${distance.toFixed(1)} km`
      },
      {
        id: 'ride-comfort',
        source: 'worldwide_generator',
        service: 'Comfort',
        provider: 'Uber / Lyft',
        vehicleType: 'Premium Sedan',
        capacity: 4,
        estimatedPrice: Math.round(basePrice * 1.5),
        currency: 'USD',
        duration: this.formatDuration(duration),
        distance: `${distance.toFixed(1)} km`
      },
      {
        id: 'ride-xl',
        source: 'worldwide_generator',
        service: 'XL',
        provider: 'Uber / Lyft',
        vehicleType: 'SUV',
        capacity: 6,
        estimatedPrice: Math.round(basePrice * 2.0),
        currency: 'USD',
        duration: this.formatDuration(duration),
        distance: `${distance.toFixed(1)} km`
      },
      {
        id: 'ride-premium',
        source: 'worldwide_generator',
        service: 'Premium',
        provider: 'Uber / Lyft',
        vehicleType: 'Luxury Car',
        capacity: 4,
        estimatedPrice: Math.round(basePrice * 2.5),
        currency: 'USD',
        duration: this.formatDuration(duration),
        distance: `${distance.toFixed(1)} km`
      }
    ];
  }

  // ==================== HELPER METHODS ====================

  getCityData(cityName) {
    return this.cities[cityName.toLowerCase()];
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  estimateFlightTime(distanceKm) {
    // Average speed: 800 km/h for jets
    const flightTime = (distanceKm / 800) * 60; // minutes
    const taxiTime = 40; // takeoff and landing
    return Math.round(flightTime + taxiTime);
  }

  estimateTrainTime(distanceKm, country) {
    // High-speed rail countries
    const speed = ['Japan', 'China', 'France', 'Spain'].includes(country) ? 250 : 100;
    return Math.round((distanceKm / speed) * 60);
  }

  estimateBusTime(distanceKm) {
    return Math.round((distanceKm / 60) * 60); // 60 km/h average
  }

  calculateFlightPrice(distanceKm) {
    // Realistic flight pricing formula
    let basePrice;
    if (distanceKm < 500) {
      // Short domestic: ₹2500-4000
      basePrice = 2500 + (distanceKm * 3);
    } else if (distanceKm < 1500) {
      // Medium domestic: ₹4000-7000
      basePrice = 3500 + (distanceKm * 2.5);
    } else if (distanceKm < 3000) {
      // Long domestic/regional: ₹7000-12000
      basePrice = 5000 + (distanceKm * 2);
    } else {
      // International: ₹12000+
      basePrice = 8000 + (distanceKm * 1.5);
    }
    return Math.round(basePrice);
  }

  calculateTrainPrice(distanceKm, country) {
    // Realistic train pricing by country
    if (country === 'India') {
      // Indian Railways: ₹1.5-2.5 per km for AC classes
      return Math.round(distanceKm * 2.0) + 500; // Base fare + distance
    } else if (country === 'Japan') {
      // Shinkansen: ¥10,000-20,000 for medium distances
      return Math.round(distanceKm * 15) + 3000;
    } else if (country === 'China') {
      // High-speed rail
      return Math.round(distanceKm * 0.6) + 100;
    } else if (['UK', 'France', 'Germany', 'Spain', 'Italy'].includes(country)) {
      // European high-speed trains: €80-150 typical
      return Math.round(distanceKm * 0.15) + 50;
    }
    return Math.round(distanceKm * 1.0) + 200; // Default
  }

  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  }

  getCurrency(country) {
    const currencies = {
      'India': 'INR', 'Japan': 'JPY', 'China': 'CNY', 'UK': 'GBP',
      'France': 'EUR', 'Germany': 'EUR', 'Spain': 'EUR', 'Italy': 'EUR',
      'USA': 'USD', 'Canada': 'CAD', 'Australia': 'AUD', 'Brazil': 'BRL'
    };
    return currencies[country] || 'USD';
  }

  getAirlineCode(airline) {
    const codes = {
      'Air India': 'AI', 'Emirates': 'EK', 'British Airways': 'BA',
      'Lufthansa': 'LH', 'American Airlines': 'AA', 'United': 'UA',
      'Delta': 'DL', 'Singapore Airlines': 'SQ', 'Cathay Pacific': 'CX'
    };
    return codes[airline] || 'XX';
  }

  getRegionalAirlines(country) {
    const regional = {
      'India': ['Air India', 'IndiGo', 'SpiceJet', 'Vistara'],
      'USA': ['American Airlines', 'United', 'Delta', 'Southwest'],
      'UK': ['British Airways', 'EasyJet', 'Ryanair'],
      'Japan': ['ANA', 'Japan Airlines', 'Peach']
    };
    return regional[country] || this.airlines.global;
  }

  getAircraftType(distance) {
    if (distance > 5000) return 'Boeing 777';
    if (distance > 2000) return 'Boeing 737';
    return 'Airbus A320';
  }

  getFlightAmenities(distance, airline) {
    const base = ['In-flight entertainment', 'Meals'];
    if (distance > 3000) base.push('WiFi', 'Extra legroom');
    if (airline.includes('Emirates') || airline.includes('Singapore')) base.push('Premium service');
    return base;
  }

  getRandomHub(fromCity, toCity) {
    const hubs = ['Dubai', 'Singapore', 'Istanbul', 'Frankfurt', 'Amsterdam'];
    return hubs[Math.floor(Math.random() * hubs.length)];
  }

  getTrainTypes(country) {
    if (country === 'India') {
      return [
        { name: 'Vande Bharat Express', type: 'Premium', priceMultiplier: 2.5, classes: ['CC', 'EC'], amenities: ['WiFi', 'Meals', 'Modern coaches'] },
        { name: 'Rajdhani Express', type: 'Superfast', priceMultiplier: 2.0, classes: ['1A', '2A', '3A'], amenities: ['Meals', 'AC'] },
        { name: 'Shatabdi Express', type: 'Daytime', priceMultiplier: 1.5, classes: ['CC'], amenities: ['Meals'] }
      ];
    }
    if (country === 'Japan') {
      return [
        { name: 'Shinkansen Nozomi', type: 'Bullet Train', priceMultiplier: 3.0, classes: ['Green', 'Ordinary'], amenities: ['High speed', 'WiFi'] }
      ];
    }
    return [
      { name: 'Express', type: 'Express', priceMultiplier: 1.5, classes: ['1st', '2nd'], amenities: ['WiFi'] }
    ];
  }

  getCountryPrefix(country) {
    return { 'India': 'IR', 'Japan': 'JR', 'China': 'CR', 'UK': 'BR', 'France': 'TGV' }[country] || 'TR';
  }

  getTrainOperator(country) {
    return { 'India': 'Indian Railways', 'Japan': 'JR', 'UK': 'National Rail', 'France': 'SNCF' }[country] || 'National Railways';
  }

  getBusOperator(country) {
    return { 'India': 'RedBus', 'USA': 'Greyhound', 'UK': 'National Express' }[country] || 'Coach Services';
  }

  getHotelBasePrice(country) {
    // Base price per night in local currency (will be multiplied by hotel type)
    const prices = {
      'India': 35, // INR base for multipliers (₹1200-15000)
      'Thailand': 30, // THB
      'USA': 100, // USD
      'UK': 90, // GBP
      'France': 85, // EUR
      'Germany': 80, // EUR
      'Japan': 120, // JPY hundreds
      'Switzerland': 140, // CHF
      'UAE': 110, // AED
      'Singapore': 115, // SGD
      'Australia': 95, // AUD
      'China': 60, // CNY
      'Brazil': 50, // BRL
      'South Africa': 45, // ZAR
      'Mexico': 55 // MXN
    };
    return prices[country] || 60;
  }

  // Generic fallbacks for unknown cities
  generateGenericFlights(from, to, date, passengers) {
    console.log(`Generating generic flights for ${from} → ${to}`);
    return this.generateFlights('mumbai', 'delhi', date, passengers)
      .map(f => ({ ...f, origin: { ...f.origin, city: from }, destination: { ...f.destination, city: to } }));
  }

  generateGenericBuses(from, to, date) {
    return [];
  }

  generateGenericRides(from, to) {
    return [];
  }
}

module.exports = new WorldwideTravelData();

