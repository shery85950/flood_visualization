import { STATION_COORDINATES } from "../constants";
import { StationLocation, StationMetric, RawDataEntry } from "../types";

// Helper to find a value in a flexible way (handles inconsistent keys from scraping)
const getVal = (obj: any, candidates: string[]): number | undefined => {
  if (!obj) return undefined;

  const objKeys = Object.keys(obj);

  for (const candidate of candidates) {
    // 1. Direct match
    if (obj[candidate] !== undefined) return obj[candidate];

    // 2. Normalize spaces (remove all spaces) and match case-insensitive
    const cleanCandidate = candidate.replace(/\s/g, '').toUpperCase();
    const foundKey = objKeys.find(k => k.replace(/\s/g, '').toUpperCase() === cleanCandidate);
    if (foundKey && obj[foundKey] !== undefined) return obj[foundKey];
  }
  return undefined;
};

// Helper to find a station object within the stations dictionary
// The new scraper returns keys like "INDUS @ TARBELA", old data has "INDUS RIVER SYSTEM AUTHORITY"
const findStationObj = (stationsDict: any, keywords: string[]): any | undefined => {
  if (!stationsDict) return undefined;

  // Check for the legacy monolith key first if we are processing old data
  if (stationsDict["INDUS RIVER SYSTEM AUTHORITY"]) {
    // If we are looking for a specific sub-station, the old data has everything in one object.
    // So we return that main object, and let getVal find the specific keys.
    return stationsDict["INDUS RIVER SYSTEM AUTHORITY"];
  }

  // New Scraper Logic: Search top-level keys for keywords
  const keys = Object.keys(stationsDict);
  for (const k of keys) {
    if (keywords.some(keyword => k.toUpperCase().includes(keyword.toUpperCase()))) {
      return stationsDict[k];
    }
  }
  return undefined;
};

export const getAvailableDates = (data: RawDataEntry[]): string[] => {
  const dates = data
    .filter(d => d.date)
    .map(d => d.date as string);

  // Sort dates descending (newest first)
  return Array.from(new Set(dates)).sort((a, b) => {
    const [d1, m1, y1] = a.split('.').map(Number);
    const [d2, m2, y2] = b.split('.').map(Number);
    return new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime();
  });
};

export const parseStationData = (dateStr: string, allData: RawDataEntry[]): StationLocation[] => {
  const entry = allData.find(d => d.date === dateStr);
  if (!entry || !entry.stations) return [];

  const rawStations = entry.stations;
  const stations: StationLocation[] = [];

  // --- 1. Tarbela (Indus) ---
  const tarbelaRaw = findStationObj(rawStations, ["TARBELA", "INDUS @ TARBELA"]);
  if (tarbelaRaw) {
    // Check specific Tarbela key first, then generic LEVEL
    const level = getVal(tarbelaRaw, ["INDUS@TARBELA KABUL@NOWSHERA\nLEVEL", "INDUS @ TARBELA KABUL @ NOWSHERA\nLEVEL", "LEVEL"]);
    const inflow = getVal(tarbelaRaw, ["MEAN INFLOW", "MEANINFLOW"]);
    const outflow = getVal(tarbelaRaw, ["MEAN OUTFLOW", "MEANOUTFLOW"]);

    if (level || inflow) {
      stations.push({
        id: 'tarbela',
        ...STATION_COORDINATES.TARBELA,
        metrics: [
          { label: "Level", value: level || 0, unit: "ft", type: 'level' },
          { label: "Mean Inflow", value: inflow || 0, unit: "cusecs", type: 'inflow' },
          { label: "Mean Outflow", value: outflow || 0, unit: "cusecs", type: 'outflow' }
        ],
        historical: getHistoricalData('tarbela', allData)
      });
    }
  }

  // --- 2. Mangla (Jhelum) ---
  const manglaRaw = findStationObj(rawStations, ["MANGLA", "JHELUM @ MANGLA"]);
  // Fallback: in old data, everything is in the same object, so findStationObj might return the same big object
  // We distinguish by looking for "LEVEL" (Mangla) vs Tarbela keys, or assuming getVal priority.
  // In new scraper, manglaRaw will be a distinct object.
  if (manglaRaw) {
    const level = getVal(manglaRaw, ["LEVEL"]);
    // In scraped PDF, typically "MEAN INFLOW" exists in the Mangla section. 
    // In old messy data, it was "MEANU/SDISCHARGE".
    const inflow = getVal(manglaRaw, ["MEAN INFLOW", "MEANU/SDISCHARGE", "MEAN U/S DISCHARGE"]);
    const outflow = getVal(manglaRaw, ["MEAN OUTFLOW", "MEAND/SDISCHARGE", "MEAN D/S DISCHARGE"]);

    if (level) {
      stations.push({
        id: 'mangla',
        ...STATION_COORDINATES.MANGLA,
        metrics: [
          { label: "Level", value: level || 0, unit: "ft", type: 'level' },
          { label: "Inflow", value: inflow || 0, unit: "cusecs", type: 'inflow' },
          { label: "Outflow", value: outflow || 0, unit: "cusecs", type: 'outflow' }
        ],
        historical: getHistoricalData('mangla', allData)
      });
    }
  }

  // --- 3. Nowshera (Kabul) ---
  const nowsheraRaw = findStationObj(rawStations, ["NOWSHERA", "KABUL @ NOWSHERA"]);
  if (nowsheraRaw) {
    const discharge = getVal(nowsheraRaw, ["MEAN DISCHARGE", "MEANDISCHARGE"]);
    if (discharge) {
      stations.push({
        id: 'nowshera',
        ...STATION_COORDINATES.NOWSHERA,
        metrics: [
          { label: "Discharge", value: discharge, unit: "cusecs", type: 'discharge' }
        ],
        historical: getHistoricalData('nowshera', allData)
      });
    }
  }

  // --- 4. Panjnad ---
  const panjnadRaw = findStationObj(rawStations, ["PANJNAD"]);
  if (panjnadRaw) {
    const up = getVal(panjnadRaw, ["U/S DISCHARGE", "PANJNAD\nU/SDISCHARGE"]);
    const down = getVal(panjnadRaw, ["D/S DISCHARGE", "IRSARELEASES\nD/SDISCHARGE"]);

    if (up || down) {
      stations.push({
        id: 'panjnad',
        ...STATION_COORDINATES.PANJNAD,
        metrics: [
          { label: "Upstream", value: up || 0, unit: "cusecs", type: 'inflow' },
          { label: "Downstream", value: down || 0, unit: "cusecs", type: 'outflow' }
        ],
        historical: getHistoricalData('panjnad', allData)
      });
    }
  }

  // --- 5. Chashma (CRBC) ---
  const chashmaRaw = findStationObj(rawStations, ["CHASMA", "CHASHMA", "CRBC"]);
  // Sometimes CRBC is inside INDUS @ TARBELA section or standalone. 
  // If we found a specific Chasma section, good. If not, try the generic one again (old data).
  const rawForChashma = chashmaRaw || (rawStations["INDUS RIVER SYSTEM AUTHORITY"] ? rawStations["INDUS RIVER SYSTEM AUTHORITY"] : null);

  if (rawForChashma) {
    const crbc = getVal(rawForChashma, ["CRBC"]);
    if (crbc) {
      stations.push({
        id: 'chashma',
        ...STATION_COORDINATES.CHASHMA,
        metrics: [
          { label: "CRBC Withdrawal", value: crbc, unit: "cusecs", type: 'outflow' }
        ],
        historical: getHistoricalData('chashma', allData)
      });
    }
  }

  return stations;
};

// Extract historical trends for a station ID across all available dates
const getHistoricalData = (stationId: string, allData: RawDataEntry[]) => {
  const dates = getAvailableDates(allData).reverse(); // Oldest first for chart

  return dates.map(date => {
    const entry = allData.find(d => d.date === date);
    if (!entry || !entry.stations) return null;

    const rawStations = entry.stations;
    let value = 0;
    let type = 'Level';

    switch (stationId) {
      case 'tarbela':
        const t = findStationObj(rawStations, ["TARBELA", "INDUS @ TARBELA"]);
        value = getVal(t, ["INDUS@TARBELA KABUL@NOWSHERA\nLEVEL", "INDUS @ TARBELA KABUL @ NOWSHERA\nLEVEL", "LEVEL"]) || 0;
        type = 'Level';
        break;
      case 'mangla':
        const m = findStationObj(rawStations, ["MANGLA", "JHELUM @ MANGLA"]);
        value = getVal(m, ["LEVEL"]) || 0;
        type = 'Level';
        break;
      case 'nowshera':
        const n = findStationObj(rawStations, ["NOWSHERA", "KABUL @ NOWSHERA"]);
        value = getVal(n, ["MEAN DISCHARGE", "MEANDISCHARGE"]) || 0;
        type = 'Flow';
        break;
      case 'panjnad':
        const p = findStationObj(rawStations, ["PANJNAD"]);
        value = getVal(p, ["U/S DISCHARGE", "PANJNAD\nU/SDISCHARGE"]) || 0;
        type = 'Inflow';
        break;
      case 'chashma':
        const c = findStationObj(rawStations, ["CHASMA", "CHASHMA", "CRBC"]) || rawStations["INDUS RIVER SYSTEM AUTHORITY"];
        value = getVal(c, ["CRBC"]) || 0;
        type = 'Withdrawal';
        break;
    }

    // Simple check to ensure we aren't plotting zeros if data is missing for that day
    if (!value) return null;

    return { date: date.split('.')[0] + '/' + date.split('.')[1], value, type };
  }).filter(Boolean) as { date: string; value: number; type: string }[];
};
