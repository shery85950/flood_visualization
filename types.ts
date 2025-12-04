// The shape of the raw JSON data provided by the user
export interface RawStationData {
  "INDUS@TARBELA KABUL@NOWSHERA\nLEVEL"?: number; // Tarbela Level
  "MEANDISCHARGE"?: number; // Nowshera Flow
  "DEADLEVEL"?: number;
  "MEANINFLOW"?: number; // Tarbela Inflow
  "MEANOUTFLOW"?: number; // Tarbela Outflow
  "LEVEL"?: number; // Mangla Level
  "U/SDISCHARGE"?: number;
  "D/SDISCHARGE"?: number;
  "CRBC"?: number; // Chashma Right Bank Canal
  "MEANU/SDISCHARGE"?: number; // Mangla Inflow (inferred)
  "MEAND/SDISCHARGE"?: number; // Mangla Outflow (inferred)
  "RIMSTATIONINFLOWS\nMEANOUTFLOW"?: number;
  "TOTAL"?: number;
  "RIMSTATIONOUTFLOWS\nTOTAL"?: number;
  "PANJNAD\nU/SDISCHARGE"?: number; // Panjnad Upstream
  "IRSARELEASES\nD/SDISCHARGE"?: number; // Panjnad Downstream
  [key: string]: number | undefined;
}

export interface RawDataEntry {
  file: string;
  date: string | null;
  stations: {
    "INDUS RIVER SYSTEM AUTHORITY"?: RawStationData;
    [key: string]: any;
  };
  rim_inflows: any;
  rim_outflows: any;
  irsa_releases: any;
}

// Normalized Data Structure for the App
export interface StationMetric {
  label: string;
  value: number;
  unit: string;
  type: 'level' | 'inflow' | 'outflow' | 'discharge';
}

export interface StationLocation {
  id: string;
  name: string;
  river: string;
  lat: number;
  lng: number;
  metrics: StationMetric[];
  historical: { date: string; value: number; type: string }[];
}

export interface AppState {
  selectedDate: string;
  stations: StationLocation[];
  allDates: string[];
}