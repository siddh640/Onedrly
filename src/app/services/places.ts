/**
 * Places Service - Real-time destination data and photos
 * 
 * This service provides comprehensive place information from multiple sources:
 * 1. Google Places API (OPTIONAL) - Real-time, verified photos (requires API key)
 * 2. OpenStreetMap (Nominatim + Overpass) - Free place data and coordinates
 * 3. Wikimedia Commons - Free high-quality place photos
 * 4. Wikipedia - Photo sources with metadata
 * 5. Unique placeholders - Fallback for places without photos
 * 
 * Photo priority order:
 * 1. Google Places API (if configured)
 * 2. Direct OSM image links
 * 3. Wikimedia Commons
 * 4. Wikipedia
 * 5. Wikidata
 * 6. Unique placeholders
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface Place {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  photos?: string[];
  description?: string;
  types?: string[];
  openNow?: boolean;
  priceLevel?: number;
  vicinity?: string;
  phone?: string;
  website?: string;
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  internationalPhone?: string;
  openingHours?: string;
  placeId?: string;
  cuisine?: string;
  amenity?: string;
  tourism?: string;
  historic?: string;
  location?: {
    lat: number;
    lng: number;
  };
  // Additional Google Places data
  businessStatus?: string;
  googleMapsUrl?: string;
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
    time: string;
  }>;
  // Amenities
  wheelchairAccessible?: boolean;
  delivery?: boolean;
  dineIn?: boolean;
  takeout?: boolean;
  reservable?: boolean;
  servesBreakfast?: boolean;
  servesLunch?: boolean;
  servesDinner?: boolean;
  servesBeer?: boolean;
  servesWine?: boolean;
  servesVegetarian?: boolean;
}

export interface DestinationData {
  destination: string;
  attractions: Place[];
  restaurants: Place[];
  shopping: Place[];
}

@Injectable({
  providedIn: 'root'
})
export class Places {
  private readonly NOMINATIM_API = 'https://nominatim.openstreetmap.org';
  private readonly OVERPASS_API = 'https://overpass-api.de/api/interpreter';
  private readonly WIKIMEDIA_API = 'https://en.wikipedia.org/w/api.php';
  private readonly GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY'; // Replace with your actual API key
  private readonly GOOGLE_PLACES_TEXT_SEARCH = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  private readonly GOOGLE_PLACES_DETAILS = 'https://maps.googleapis.com/maps/api/place/details/json';
  private readonly GOOGLE_PLACES_PHOTO = 'https://maps.googleapis.com/maps/api/place/photo';
  private placeMetadata = new Map<string, any>();
  private googlePlaceCache = new Map<string, any>(); // Cache Google Places data

  constructor(private http: HttpClient) {}

  searchDestination(destination: string): Observable<DestinationData> {
    console.log(`🔍 Searching destination: ${destination}`);
    
    // Try backend API first (if running)
    return this.http.get<any>(`http://localhost:3000/api/places/search/${encodeURIComponent(destination)}`).pipe(
      map(response => {
        console.log('✅ Got places from backend API:', response.data);
        return {
          destination: response.data.destination || destination,
          attractions: response.data.attractions || [],
          restaurants: response.data.restaurants || [],
          shopping: response.data.shopping || []
        };
      }),
      catchError((error: any) => {
        console.warn('Backend API not available, using local search:', error.message);
        
        // Fallback to local OpenStreetMap search
        return this.searchLocalPlaces(destination);
      })
    );
  }

  /**
   * Local search using OpenStreetMap (fallback)
   */
  private searchLocalPlaces(destination: string): Observable<DestinationData> {
    // Clear metadata from previous search
    this.placeMetadata.clear();
    
    // First, geocode the destination to get coordinates
    return this.geocodeDestination(destination).pipe(
      switchMap((coords: { lat: number; lon: number } | null) => {
        if (!coords) {
          // Fallback to mock data if geocoding fails
          console.log('⚠️ Geocoding failed, using enhanced mock data');
          return this.getMockData(destination);
        }
        
        // Fetch real places data
        return forkJoin({
          attractions: this.getAttractions(coords.lat, coords.lon, destination),
          restaurants: this.getRestaurants(coords.lat, coords.lon, destination),
          shopping: this.getShopping(coords.lat, coords.lon, destination)
        }).pipe(
          map((data: { attractions: Place[]; restaurants: Place[]; shopping: Place[] }) => ({
            destination,
            attractions: data.attractions.length > 0 ? data.attractions : this.getEnhancedMockPlaces(destination, 'attractions'),
            restaurants: data.restaurants.length > 0 ? data.restaurants : this.getEnhancedMockPlaces(destination, 'restaurants'),
            shopping: data.shopping.length > 0 ? data.shopping : this.getEnhancedMockPlaces(destination, 'shopping')
          }))
        );
      }),
      catchError((error: any) => {
        console.error('Error fetching real data, using mock data:', error);
        return this.getMockData(destination);
      })
    );
  }

  private geocodeDestination(destination: string): Observable<{ lat: number; lon: number } | null> {
    const url = `${this.NOMINATIM_API}/search?format=json&q=${encodeURIComponent(destination)}&limit=1`;
    
    console.log(`🔍 Geocoding destination: ${destination}`);
    
    return this.http.get<any[]>(url, {
      headers: {
        'User-Agent': 'Onedrly-App/1.0'
      }
    }).pipe(
      map((results: any[]) => {
        if (results && results.length > 0) {
          const coords = {
            lat: parseFloat(results[0].lat),
            lon: parseFloat(results[0].lon)
          };
          console.log(`✅ Geocoded ${destination}: ${coords.lat}, ${coords.lon}`);
          return coords;
        }
        console.warn(`⚠️ No geocoding results for: ${destination}`);
        return null;
      }),
      catchError((error) => {
        console.error(`❌ Geocoding failed for ${destination}:`, error);
        return of(null);
      })
    );
  }

  // Reverse geocode coordinates to get detailed address
  private reverseGeocode(lat: number, lon: number): Observable<string | null> {
    const url = `${this.NOMINATIM_API}/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    
    return this.http.get<any>(url, {
      headers: {
        'User-Agent': 'Onedrly-App/1.0'
      }
    }).pipe(
      map((result: any) => {
        if (result && result.address) {
          const addr = result.address;
          const parts: string[] = [];
          
          // Build address from most specific to least specific
          if (addr.road) parts.push(addr.road);
          if (addr.house_number) parts.unshift(addr.house_number); // Add house number at start
          if (addr.neighbourhood || addr.suburb) parts.push(addr.neighbourhood || addr.suburb);
          if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
          if (addr.state) parts.push(addr.state);
          if (addr.postcode) parts.push(addr.postcode);
          
          return parts.length > 0 ? parts.join(', ') : null;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  // Google Places API methods for real-time data and photos
  private searchGooglePlaces(query: string, type?: string): Observable<any[]> {
    if (this.GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
      console.log('⚠️ Google Places API key not configured');
      return of([]);
    }

    const searchType = type ? `&type=${type}` : '';
    const url = `${this.GOOGLE_PLACES_TEXT_SEARCH}?query=${encodeURIComponent(query)}${searchType}&key=${this.GOOGLE_PLACES_API_KEY}`;
    
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        if (response.status === 'OK' && response.results) {
          return response.results;
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching from Google Places API:', error);
        return of([]);
      })
    );
  }

  private getGooglePhotoUrl(photoReference: string, maxWidth: number = 400): string {
    if (this.GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
      return '';
    }
    return `${this.GOOGLE_PLACES_PHOTO}?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.GOOGLE_PLACES_API_KEY}`;
  }

  // Get Google Places details (including Place Details API)
  private getGooglePlacesDetails(placeName: string, destination: string): Observable<any> {
    if (this.GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
      return of(null);
    }

    // Check cache first
    const cacheKey = `${placeName}_${destination}`;
    if (this.googlePlaceCache.has(cacheKey)) {
      console.log(`✅ Using cached Google data for: ${placeName}`);
      return of(this.googlePlaceCache.get(cacheKey));
    }

    const searchQuery = `${placeName} ${destination}`;
    
    return this.searchGooglePlaces(searchQuery).pipe(
      switchMap((results: any[]) => {
        if (results && results.length > 0) {
          // Find best match by name similarity
          const bestMatch = results.find(result => 
            result.name.toLowerCase().includes(placeName.toLowerCase()) ||
            placeName.toLowerCase().includes(result.name.toLowerCase())
          ) || results[0];

          // Get Place ID and fetch detailed information
          if (bestMatch.place_id) {
            return this.getPlaceDetails(bestMatch.place_id).pipe(
              map((details: any) => {
                const enrichedData = {
                  ...bestMatch,
                  ...details,
                  photoUrl: bestMatch.photos && bestMatch.photos.length > 0 
                    ? this.getGooglePhotoUrl(bestMatch.photos[0].photo_reference) 
                    : null
                };
                // Cache the data
                this.googlePlaceCache.set(cacheKey, enrichedData);
                console.log(`✅ Google data enriched for: ${placeName}`);
                return enrichedData;
              })
            );
          }
          // No Place ID, return basic data
          const basicData = {
            ...bestMatch,
            photoUrl: bestMatch.photos && bestMatch.photos.length > 0 
              ? this.getGooglePhotoUrl(bestMatch.photos[0].photo_reference) 
              : null
          };
          this.googlePlaceCache.set(cacheKey, basicData);
          return of(basicData);
        }
        return of(null);
      }),
      catchError(() => of(null))
    );
  }

  // Fetch detailed place information from Google Places Details API
  private getPlaceDetails(placeId: string): Observable<any> {
    if (this.GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
      return of(null);
    }

    const url = `${this.GOOGLE_PLACES_DETAILS}?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,opening_hours,rating,user_ratings_total&key=${this.GOOGLE_PLACES_API_KEY}`;
    
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        if (response.status === 'OK' && response.result) {
          return response.result;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching place details:', error);
        return of(null);
      })
    );
  }

  // Try to get Google Places data for a place and return photo if found
  private tryGooglePlacesPhoto(placeName: string, destination: string, placeTypes?: string[]): Observable<string | null> {
    return this.getGooglePlacesDetails(placeName, destination).pipe(
      map((data: any) => data?.photoUrl || null)
    );
  }

  private getAttractions(lat: number, lon: number, destination: string): Observable<Place[]> {
    const radius = 10000; // 10km radius for more comprehensive results
    const query = `
      [out:json][timeout:30];
      (
        node["tourism"="museum"](around:${radius},${lat},${lon});
        node["tourism"="attraction"](around:${radius},${lat},${lon});
        node["historic"](around:${radius},${lat},${lon});
        node["tourism"="viewpoint"](around:${radius},${lat},${lon});
        node["amenity"="theatre"](around:${radius},${lat},${lon});
        node["tourism"="gallery"](around:${radius},${lat},${lon});
        node["tourism"="artwork"](around:${radius},${lat},${lon});
        node["leisure"="park"](around:${radius},${lat},${lon});
        node["tourism"="zoo"](around:${radius},${lat},${lon});
        node["tourism"="aquarium"](around:${radius},${lat},${lon});
        way["tourism"="museum"](around:${radius},${lat},${lon});
        way["tourism"="attraction"](around:${radius},${lat},${lon});
        way["historic"](around:${radius},${lat},${lon});
        way["leisure"="park"](around:${radius},${lat},${lon});
        way["tourism"="zoo"](around:${radius},${lat},${lon});
        way["tourism"="aquarium"](around:${radius},${lat},${lon});
      );
      out body 200;
    `;

    return this.http.post<any>(this.OVERPASS_API, query, {
      headers: { 'Content-Type': 'text/plain' }
    }).pipe(
      map((response: any) => {
        const places = this.parseOverpassResponse(response, 'attraction', destination);
        console.log(`🎯 Found ${places.length} attractions for ${destination}`);
        return places;
      }),
      catchError((error) => {
        console.error(`❌ Error fetching attractions for ${destination}:`, error);
        return of([]);
      })
    );
  }

  private getRestaurants(lat: number, lon: number, destination: string): Observable<Place[]> {
    const radius = 8000; // 8km radius for more restaurants
    const query = `
      [out:json][timeout:30];
      (
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        node["amenity"="cafe"](around:${radius},${lat},${lon});
        node["amenity"="fast_food"](around:${radius},${lat},${lon});
        node["amenity"="bar"](around:${radius},${lat},${lon});
        node["amenity"="pub"](around:${radius},${lat},${lon});
        node["amenity"="food_court"](around:${radius},${lat},${lon});
        node["amenity"="ice_cream"](around:${radius},${lat},${lon});
        way["amenity"="restaurant"](around:${radius},${lat},${lon});
        way["amenity"="cafe"](around:${radius},${lat},${lon});
        way["amenity"="fast_food"](around:${radius},${lat},${lon});
      );
      out body 200;
    `;

    return this.http.post<any>(this.OVERPASS_API, query, {
      headers: { 'Content-Type': 'text/plain' }
    }).pipe(
      map((response: any) => {
        const places = this.parseOverpassResponse(response, 'restaurant', destination);
        console.log(`🍽️ Found ${places.length} restaurants for ${destination}`);
        return places;
      }),
      catchError((error) => {
        console.error(`❌ Error fetching restaurants for ${destination}:`, error);
        return of([]);
      })
    );
  }

  private getShopping(lat: number, lon: number, destination: string): Observable<Place[]> {
    const radius = 8000; // 8km radius for more shopping
    const query = `
      [out:json][timeout:30];
      (
        node["shop"="mall"](around:${radius},${lat},${lon});
        node["shop"="department_store"](around:${radius},${lat},${lon});
        node["shop"="supermarket"](around:${radius},${lat},${lon});
        node["shop"="convenience"](around:${radius},${lat},${lon});
        node["shop"="clothes"](around:${radius},${lat},${lon});
        node["shop"="electronics"](around:${radius},${lat},${lon});
        node["shop"="books"](around:${radius},${lat},${lon});
        node["shop"="jewelry"](around:${radius},${lat},${lon});
        node["shop"="shoes"](around:${radius},${lat},${lon});
        node["amenity"="marketplace"](around:${radius},${lat},${lon});
        way["shop"="mall"](around:${radius},${lat},${lon});
        way["building"="retail"](around:${radius},${lat},${lon});
        way["amenity"="marketplace"](around:${radius},${lat},${lon});
        way["shop"="department_store"](around:${radius},${lat},${lon});
      );
      out body 200;
    `;

    return this.http.post<any>(this.OVERPASS_API, query, {
      headers: { 'Content-Type': 'text/plain' }
    }).pipe(
      map((response: any) => {
        const places = this.parseOverpassResponse(response, 'shopping', destination);
        console.log(`🛍️ Found ${places.length} shopping places for ${destination}`);
        return places;
      }),
      catchError((error) => {
        console.error(`❌ Error fetching shopping for ${destination}:`, error);
        return of([]);
      })
    );
  }

  private parseOverpassResponse(response: any, type: string, destination: string): Place[] {
    if (!response || !response.elements) {
      console.warn(`⚠️ No elements in Overpass response for ${type} in ${destination}`);
      return [];
    }

    console.log(`📊 Overpass returned ${response.elements.length} raw elements for ${type} in ${destination}`);

    const places: Place[] = [];
    const seenNames = new Set<string>();
    const seenLocations = new Set<string>();

    for (const element of response.elements) {
      // Priority: native name, then international name, then English
      const name = element.tags?.name || element.tags?.['name:local'] || element.tags?.['name:en'] || element.tags?.int_name;
      
      if (!name) {
        continue;
      }

      // Create unique key from name + location to avoid duplicates
      const lat = element.lat || element.center?.lat;
      const lon = element.lon || element.center?.lon;
      const locationKey = `${name.toLowerCase()}|${lat?.toFixed(4)}|${lon?.toFixed(4)}`;
      
      // Skip duplicates by name or location
      if (seenNames.has(name.toLowerCase()) || seenLocations.has(locationKey)) {
        continue;
      }

      // Validate place has valid coordinates
      if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        continue;
      }

      seenNames.add(name.toLowerCase());
      seenLocations.add(locationKey);

      const street = element.tags?.['addr:street'] || '';
      const houseNumber = element.tags?.['addr:housenumber'] || '';
      const city = element.tags?.['addr:city'] || destination;
      const postcode = element.tags?.['addr:postcode'] || '';
      const district = element.tags?.['addr:district'] || '';
      const state = element.tags?.['addr:state'] || '';
      
      let address = '';
      if (houseNumber && street) {
        address = `${houseNumber} ${street}`;
        if (district) address += `, ${district}`;
        if (postcode) address += ` ${postcode}`;
        address += `, ${city}`;
      } else if (street) {
        address = street;
        if (district) address += `, ${district}`;
        if (postcode) address += ` ${postcode}`;
        address += `, ${city}`;
      } else if (district) {
        address = `${district}, ${city}`;
      } else {
        address = city;
      }
      
      // Try to get location-based description for better address
      const location = element.tags?.location || element.tags?.description || '';
      if (location && !street) {
        address = `${location}, ${city}`;
      }

      // Generate random but realistic rating
      const rating = this.generateRealisticRating();
      const reviewCount = Math.floor(Math.random() * 1000) + 50;

      // Check for existing image in OSM data
      const osmImage = element.tags?.image || element.tags?.wikimedia_commons;
      const wikipediaTag = element.tags?.wikipedia;
      const wikidataId = element.tags?.wikidata;
      
      const placeId = element.id?.toString() || Math.random().toString();

      // Store metadata separately (including coordinates for reverse geocoding)
      this.placeMetadata.set(placeId, {
        osmImage,
        wikipediaTag,
        wikidataId,
        destination,
        lat,
        lon
      });

      // Get real opening hours if available
      const openingHours = element.tags?.opening_hours;
      const isOpen = this.determineOpenStatusFromHours(openingHours);

      // Get real website if available
      const website = element.tags?.website || element.tags?.contact?.website;

      // Get real phone if available
      const phone = element.tags?.phone || element.tags?.['contact:phone'];

      // Get cuisine type for restaurants
      const cuisine = element.tags?.cuisine;

      // Get types once
      const placeTypes = this.getTypesFromTags(element.tags);

      places.push({
        id: placeId,
        name: name,
        address: address,
        vicinity: city,
        rating: rating,
        userRatingsTotal: reviewCount,
        photos: [this.getUniquePhotoForPlace(name, placeTypes)], // Start with placeholder immediately
        types: placeTypes,
        openNow: isOpen,
        priceLevel: type === 'restaurant' ? this.getRealPriceLevel(element.tags) : undefined
      });

      // No limit - show ALL places found
    }

    // Fetch REAL photos and addresses for ALL places
    this.fetchPhotosAndAddressesForPlaces(places, destination);

    console.log(`✅ Found ${places.length} unique ${type}s in ${destination}`);
    return places;
  }

  private generateRealisticRating(): number {
    // Generate ratings between 3.5 and 5.0, weighted towards higher ratings
    const base = 3.5;
    const range = 1.5;
    const random = Math.random();
    // Use square to weight towards higher values
    const rating = base + (random * random * range);
    return Math.round(rating * 10) / 10;
  }

  private fetchPhotosAndAddressesForPlaces(places: Place[], destination: string): void {
    const usedPhotoUrls = new Set<string>();
    
    // Show warning once if Google API key is not configured
    if (this.GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY' && places.length > 0) {
      console.warn('⚠️ IMPORTANT: Google Places API key not configured! Without it, you get:');
      console.warn('❌ Random fake ratings');
      console.warn('❌ Incomplete addresses (often just city names)');
      console.warn('❌ No phone numbers or contact info');
      console.warn('✅ To fix: Set your API key in src/app/services/places.ts line 58');
      console.warn('📖 Full setup guide: See GOOGLE_PLACES_SETUP.md');
    }
    
    places.forEach((place, index) => {
      setTimeout(() => {
        const metadata = this.placeMetadata.get(place.id);
        
        // ONLY use Google Places API for REAL addresses and contact info
        this.getGooglePlacesDetails(place.name, destination).subscribe({
          next: (googleData: any) => {
            if (googleData) {
              // Update rating if Google has it
              if (googleData.rating) {
                place.rating = googleData.rating;
                place.userRatingsTotal = googleData.user_ratings_total || googleData.userRatingsTotal;
              }
              
              // UPDATE ADDRESS - Google provides real formatted addresses
              if (googleData.formatted_address) {
                place.formattedAddress = googleData.formatted_address;
                place.address = googleData.formatted_address;
                console.log(`✅ Real Google address: ${place.name} - ${googleData.formatted_address}`);
              }
              
              // Add contact information
              if (googleData.formatted_phone_number) {
                place.phone = googleData.formatted_phone_number;
              }
              if (googleData.international_phone_number) {
                place.internationalPhoneNumber = googleData.international_phone_number;
              }
              if (googleData.website) {
                place.website = googleData.website;
              }
              
              // Add opening hours
              if (googleData.opening_hours?.weekday_text) {
                place.openingHours = googleData.opening_hours.weekday_text.join('\n');
              }
              
              // Add place ID
              if (googleData.place_id) {
                place.placeId = googleData.place_id;
              }
              
              // Update photo if available
              if (googleData.photoUrl && !usedPhotoUrls.has(googleData.photoUrl)) {
                place.photos = [googleData.photoUrl];
                usedPhotoUrls.add(googleData.photoUrl);
              }
              
              console.log(`✅ Google data enriched for: ${place.name}`);
            } else {
              // Fallback to other photo sources if Google doesn't have data
              this.getRealPhoto(place.name, destination, metadata).subscribe({
                next: (photoUrl: string | null) => {
                  if (photoUrl && !usedPhotoUrls.has(photoUrl)) {
                    place.photos = [photoUrl];
                    usedPhotoUrls.add(photoUrl);
                    console.log(`✅ Real photo loaded for: ${place.name}`);
                  }
                },
                error: () => {
                  console.log(`❌ Error loading photo for: ${place.name}`);
                }
              });
            }
          },
          error: () => {
            // Fallback on error - try photo sources only
            this.getRealPhoto(place.name, destination, metadata).subscribe({
              next: (photoUrl: string | null) => {
                if (photoUrl && !usedPhotoUrls.has(photoUrl)) {
                  place.photos = [photoUrl];
                  usedPhotoUrls.add(photoUrl);
                }
              }
            });
          }
        });
      }, index * 100);
    });
  }

  private getUniquePhotoForPlace(placeName: string, types?: string[]): string {
    // Generate a unique photo URL based on place name to avoid duplicates
    const hash = this.simpleHash(placeName);
    const photoIndex = hash % 5; // Use hash to pick from 5 different photos
    
    // Determine category from types
    let category = 'attraction';
    if (types?.some(t => t.includes('restaurant') || t.includes('food') || t.includes('cafe'))) {
      category = 'restaurant';
    } else if (types?.some(t => t.includes('shop') || t.includes('mall') || t.includes('market'))) {
      category = 'shopping';
    }
    
    const photoMap: { [key: string]: string[] } = {
      'attraction': [
        'https://images.unsplash.com/photo-1565882767981-b285dc1bb1ef?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1549498721-13b1cd7d6e13?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
      ],
      'restaurant': [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop'
      ],
      'shopping': [
        'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=300&fit=crop'
      ]
    };
    
    return photoMap[category][photoIndex];
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private getRealPhoto(placeName: string, destination: string, metadata: any): Observable<string | null> {
    // Priority 1: Google Places API (real-time, high quality photos)
    return this.tryGooglePlacesPhoto(placeName, destination).pipe(
      switchMap((googlePhoto: string | null) => {
        if (googlePhoto) {
          return of(googlePhoto);
        }
        
        // Priority 2: Direct OSM image link
        if (metadata?.osmImage && metadata.osmImage.startsWith('http')) {
          return of(metadata.osmImage);
        }

        // Priority 3: Wikimedia Commons from OSM
        if (metadata?.wikimedia_commons) {
          return this.getWikimediaCommonsPhoto(metadata.wikimedia_commons);
        }

        // Priority 4: Wikipedia page from OSM tag
        if (metadata?.wikipediaTag) {
          return this.getWikipediaPhotoFromTag(metadata.wikipediaTag);
        }

        // Priority 5: Try Wikidata ID if available
        if (metadata?.wikidata) {
          return this.getWikidataPhoto(metadata.wikidata).pipe(
            switchMap((photoUrl: string | null) => {
              if (photoUrl) {
                return of(photoUrl);
              }
              // Continue to next priority
              return this.tryWikipediaSearches(placeName, destination);
            })
          );
        }

        // Priority 6 & 7: Wikipedia searches
        return this.tryWikipediaSearches(placeName, destination);
      })
    );
  }

  private tryWikipediaSearches(placeName: string, destination: string): Observable<string | null> {
    // Try place + destination first
    return this.searchWikipediaPhoto(`${placeName} ${destination}`).pipe(
      switchMap((photoUrl: string | null) => {
        if (photoUrl) {
          return of(photoUrl);
        }
        // Try just the place name
        return this.searchWikipediaPhoto(placeName).pipe(
          switchMap((url: string | null) => {
            if (url) {
              return of(url);
            }
            // Last resort: try with destination first
            return this.searchWikipediaPhoto(`${destination} ${placeName}`);
          })
        );
      })
    );
  }

  private getWikidataPhoto(wikidataId: string): Observable<string | null> {
    // Clean the ID
    const id = wikidataId.replace('Q', '').replace(/[^0-9]/g, '');
    const sparqlQuery = `
      SELECT ?image WHERE {
        wd:Q${id} wdt:P18 ?image.
      } LIMIT 1
    `;
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
    
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        const imageUrl = response?.results?.bindings?.[0]?.image?.value;
        if (imageUrl) {
          // Convert to thumbnail URL
          const fileName = imageUrl.split('/').pop();
          return `https://commons.wikimedia.org/wiki/Special:FilePath/${fileName}?width=400`;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  private getWikimediaCommonsPhoto(commonsFile: string): Observable<string | null> {
    // Handle different formats
    let fileName = commonsFile.replace('File:', '').replace('Image:', '').replace('Category:', '').trim();
    
    // If it's a full URL, extract filename
    if (fileName.includes('commons.wikimedia.org')) {
      const parts = fileName.split('/');
      fileName = decodeURIComponent(parts[parts.length - 1]);
    }
    
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`;
    
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        const pages = response.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1') {
            const imageUrl = pages[pageId]?.imageinfo?.[0]?.thumburl || pages[pageId]?.imageinfo?.[0]?.url;
            if (imageUrl) {
              return imageUrl;
            }
          }
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  private getWikipediaPhotoFromTag(wikipediaTag: string): Observable<string | null> {
    // Format: "en:Article Name" or just "Article Name"
    const articleName = wikipediaTag.includes(':') ? wikipediaTag.split(':')[1] : wikipediaTag;
    return this.searchWikipediaPhoto(articleName);
  }

  private searchWikipediaPhoto(searchTerm: string): Observable<string | null> {
    // First try direct page lookup
    const url = `${this.WIKIMEDIA_API}?action=query&titles=${encodeURIComponent(searchTerm)}&prop=pageimages|images&format=json&pithumbsize=400&imlimit=1&origin=*`;
    
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        const pages = response.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1') {
            const thumbnail = pages[pageId]?.thumbnail?.source;
            if (thumbnail) {
              return thumbnail;
            }
            // Try getting first image
            const firstImage = pages[pageId]?.images?.[0]?.title;
            if (firstImage) {
              // This would require another API call, so skip for now
            }
          }
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }


  private getTypesFromTags(tags: any): string[] {
    const types: string[] = [];
    
    if (tags.tourism) types.push(tags.tourism);
    if (tags.amenity) types.push(tags.amenity);
    if (tags.historic) types.push('historic');
    if (tags.shop) types.push(tags.shop);
    
    return types;
  }

  private determineOpenStatusFromHours(openingHours?: string): boolean {
    if (!openingHours) {
      // Default to open if no hours specified
      return true;
    }

    // Check if currently open based on opening_hours tag
    // This is a simplified version - full implementation would parse the hours
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // If it says 24/7, it's open
    if (openingHours.includes('24/7') || openingHours.includes('24h')) {
      return true;
    }

    // If it says closed, it's closed
    if (openingHours.toLowerCase().includes('closed')) {
      return false;
    }

    // Default: open during typical business hours (9am-9pm)
    return currentHour >= 9 && currentHour < 21;
  }

  private getRealPriceLevel(tags: any): number | undefined {
    // Try to get price level from various OSM tags
    if (tags.payment?.credit_cards === 'yes' || tags['payment:credit_cards'] === 'yes') {
      return 3; // Likely mid to upscale
    }
    
    // Check for specific price indicators
    const cuisine = tags.cuisine?.toLowerCase() || '';
    if (cuisine.includes('fine_dining') || tags.stars) {
      return 4; // Expensive
    }
    if (cuisine.includes('fast_food')) {
      return 1; // Cheap
    }

    // Default to moderate
    return 2;
  }

  private getMockData(destination: string): Observable<DestinationData> {
    // Mock data for demonstration
    const mockAttractions: Place[] = [
      {
        id: '1',
        name: `${destination} Museum`,
        address: `123 Main Street, ${destination}`,
        rating: 4.5,
        userRatingsTotal: 1234,
        photos: ['https://images.unsplash.com/photo-1565882767981-b285dc1bb1ef?w=400'],
        types: ['museum', 'tourist_attraction'],
        openNow: true
      },
      {
        id: '2',
        name: `Historic ${destination} Cathedral`,
        address: `456 Cathedral Ave, ${destination}`,
        rating: 4.7,
        userRatingsTotal: 2341,
        photos: ['https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400'],
        types: ['church', 'tourist_attraction'],
        openNow: true
      },
      {
        id: '3',
        name: `${destination} Central Park`,
        address: `789 Park Road, ${destination}`,
        rating: 4.6,
        userRatingsTotal: 3452,
        photos: ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400'],
        types: ['park', 'tourist_attraction'],
        openNow: true
      },
      {
        id: '4',
        name: `${destination} Art Gallery`,
        address: `321 Art Lane, ${destination}`,
        rating: 4.4,
        userRatingsTotal: 876,
        photos: ['https://images.unsplash.com/photo-1549498721-13b1cd7d6e13?w=400'],
        types: ['art_gallery', 'tourist_attraction'],
        openNow: false
      },
      {
        id: '5',
        name: `${destination} Waterfront`,
        address: `654 Harbor Drive, ${destination}`,
        rating: 4.8,
        userRatingsTotal: 4321,
        photos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'],
        types: ['tourist_attraction', 'point_of_interest'],
        openNow: true
      }
    ];

    const mockRestaurants: Place[] = [
      {
        id: '11',
        name: `The Gourmet Kitchen`,
        address: `100 Food Street, ${destination}`,
        rating: 4.6,
        userRatingsTotal: 892,
        priceLevel: 3,
        photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'],
        types: ['restaurant', 'food'],
        openNow: true,
        vicinity: `Downtown ${destination}`
      },
      {
        id: '12',
        name: `Bella Italia`,
        address: `234 Italian Way, ${destination}`,
        rating: 4.7,
        userRatingsTotal: 1245,
        priceLevel: 2,
        photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'],
        types: ['restaurant', 'italian'],
        openNow: true,
        vicinity: `City Center ${destination}`
      },
      {
        id: '13',
        name: `Sushi Paradise`,
        address: `567 Ocean Drive, ${destination}`,
        rating: 4.8,
        userRatingsTotal: 2134,
        priceLevel: 3,
        photos: ['https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'],
        types: ['restaurant', 'japanese'],
        openNow: true,
        vicinity: `Waterfront ${destination}`
      },
      {
        id: '14',
        name: `The Local Bistro`,
        address: `890 Bistro Lane, ${destination}`,
        rating: 4.5,
        userRatingsTotal: 678,
        priceLevel: 2,
        photos: ['https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400'],
        types: ['restaurant', 'cafe'],
        openNow: false,
        vicinity: `Old Town ${destination}`
      },
      {
        id: '15',
        name: `Steakhouse Prime`,
        address: `432 Meat Market, ${destination}`,
        rating: 4.9,
        userRatingsTotal: 1876,
        priceLevel: 4,
        photos: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'],
        types: ['restaurant', 'steakhouse'],
        openNow: true,
        vicinity: `Downtown ${destination}`
      }
    ];

    const mockShopping: Place[] = [
      {
        id: '21',
        name: `${destination} Grand Mall`,
        address: `1000 Shopping Blvd, ${destination}`,
        rating: 4.4,
        userRatingsTotal: 3456,
        photos: ['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400'],
        types: ['shopping_mall'],
        openNow: true,
        vicinity: `City Center ${destination}`
      },
      {
        id: '22',
        name: `Fashion District`,
        address: `2000 Style Street, ${destination}`,
        rating: 4.5,
        userRatingsTotal: 2345,
        photos: ['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400'],
        types: ['shopping_mall', 'clothing_store'],
        openNow: true,
        vicinity: `Downtown ${destination}`
      },
      {
        id: '23',
        name: `Tech Plaza`,
        address: `3000 Electronics Ave, ${destination}`,
        rating: 4.3,
        userRatingsTotal: 1234,
        photos: ['https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400'],
        types: ['shopping_mall', 'electronics_store'],
        openNow: true,
        vicinity: `Tech District ${destination}`
      },
      {
        id: '24',
        name: `Artisan Market`,
        address: `4000 Craft Lane, ${destination}`,
        rating: 4.6,
        userRatingsTotal: 987,
        photos: ['https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400'],
        types: ['shopping_mall', 'store'],
        openNow: false,
        vicinity: `Old Town ${destination}`
      },
      {
        id: '25',
        name: `Luxury Boutiques`,
        address: `5000 Premium Street, ${destination}`,
        rating: 4.7,
        userRatingsTotal: 1567,
        photos: ['https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400'],
        types: ['shopping_mall', 'luxury'],
        openNow: true,
        vicinity: `Uptown ${destination}`
      }
    ];

    return of({
      destination,
      attractions: mockAttractions,
      restaurants: mockRestaurants,
      shopping: mockShopping
    });
  }

  /**
   * Get enhanced mock places with photos for any category
   */
  private getEnhancedMockPlaces(destination: string, category: string): Place[] {
    const templates: any = {
      'attractions': [
        { name: 'Historic Monument', type: 'monument' },
        { name: 'City Museum', type: 'museum' },
        { name: 'Art Gallery', type: 'gallery' },
        { name: 'Cultural Center', type: 'culture' },
        { name: 'Famous Temple', type: 'temple' },
        { name: 'Ancient Fort', type: 'fort' },
        { name: 'Heritage Site', type: 'heritage' },
        { name: 'Public Garden', type: 'garden' },
        { name: 'Observation Tower', type: 'tower' },
        { name: 'Palace', type: 'palace' }
      ],
      'restaurants': [
        { name: 'Fine Dining', type: 'restaurant' },
        { name: 'Local Cuisine', type: 'food' },
        { name: 'Rooftop Cafe', type: 'cafe' },
        { name: 'Street Food Hub', type: 'street food' },
        { name: 'Multi-Cuisine Restaurant', type: 'restaurant' },
        { name: 'Traditional Eatery', type: 'traditional' }
      ],
      'shopping': [
        { name: 'Shopping Mall', type: 'mall' },
        { name: 'Local Market', type: 'market' },
        { name: 'Fashion Boutique', type: 'fashion' },
        { name: 'Handicrafts Store', type: 'handicrafts' },
        { name: 'Souvenir Shop', type: 'souvenirs' }
      ]
    };

    const items = templates[category] || templates['attractions'];

    return items.map((item: any, index: number) => ({
      id: `${category}-${index}`,
      name: `${item.name} - ${destination}`,
      address: `${100 + index} Main Street, ${destination}`,
      rating: 3.5 + Math.random() * 1.5,
      userRatingsTotal: Math.floor(Math.random() * 500) + 100,
      photos: [
        `https://source.unsplash.com/800x600/?${encodeURIComponent(destination + ' ' + item.type)}`
      ],
      types: [category],
      vicinity: destination,
      placeId: `enhanced-${category}-${index}`
    }));
  }
}
