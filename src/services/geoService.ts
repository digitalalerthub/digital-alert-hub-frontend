import api from "./api";

type GeoSearchResponse = {
  query: string;
  usedQuery?: string;
  results: Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>;
};

type ReverseResponse = {
  display_name?: string;
  address?: {
    road?: string;
    residential?: string;
    pedestrian?: string;
    footway?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
};

const geoService = {
  search: async (
    query: string,
    limit = 5,
    strict = false
  ): Promise<GeoSearchResponse["results"]> => {
    const { data } = await api.get<GeoSearchResponse>("/geo/search", {
      params: { q: query, limit, strict },
    });
    return data.results || [];
  },

  reverse: async (lat: number, lon: number): Promise<ReverseResponse> => {
    const { data } = await api.get<ReverseResponse>("/geo/reverse", {
      params: { lat, lon },
    });
    return data;
  },
};

export default geoService;
