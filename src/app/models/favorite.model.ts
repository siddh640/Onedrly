export interface FavoriteItemDetails {
  externalId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  location?: {
    city?: string;
    country?: string;
    address?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  rating?: {
    value?: number;
    count?: number;
  };
  priceLevel?: string | number;
  category?: string[];
  tags?: string[];
  route?: {
    origin?: string;
    destination?: string;
    originCode?: string;
    destinationCode?: string;
  };
}

export interface Favorite {
  _id: string;
  favoriteType: string;
  itemDetails: FavoriteItemDetails;
  userNotes?: string;
  userTags?: string[];
  priority?: number;
  visited?: boolean;
  visitedDate?: string;
  savedAt?: string;
}

