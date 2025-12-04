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
const findStationObj = (stationsDict: any, keywords: string[]): any | undefined => {
  if (!stationsDict) return undefined;

  // Check for the legacy monolith key first
  if (stationsDict["INDUS RIVER SYSTEM AUTHORITY"]) {
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

  // ===== DAMS (Flood management - prioritize LEVEL + INFLOW/OUTFLOW) =====

  // 1. TARBELA DAM
  const tarbelaRaw = findStationObj(rawStations, ["TARBELA", "INDUS @ TARBELA"]);
  if (tarbelaRaw) {
    const level = getVal(tarbelaRaw, ["INDUS@TARBELA KABUL@NOWSHERA\nLEVEL", "INDUS @ TARBELA KABUL @ NOWSHERA\nLEVEL", "LEVEL"]);
    const inflow = getVal(tarbelaRaw, ["MEAN INFLOW", "MEANINFLOW"]);
    const outflow = getVal(tarbelaRaw, ["MEAN OUTFLOW", "MEANOUTFLOW"]);

    if (level !== undefined || inflow !== undefined) {
      stations.push({
        id: 'tarbela',
        ...STATION_COORDINATES.TARBELA,
        metrics: [
          { label: "Reservoir Level", value: level || 0, unit: "ft", type: 'level' },
          { label: "Mean Inflow", value: inflow || 0, unit: "cusecs", type: 'inflow' },
          { label: "Mean Outflow", value: outflow || 0, unit: "cusecs", type: 'outflow' }
        ],
        historical: getHistoricalData('tarbela', allData)
      });
    }
  }

  // 2. MANGLA DAM
  const manglaRaw = findStationObj(rawStations, ["MANGLA", "JHELUM @ MANGLA"]);
  if (manglaRaw) {
    const level = getVal(manglaRaw, ["LEVEL"]);
    const inflow = getVal(manglaRaw, ["MEAN INFLOW", "MEANU/SDISCHARGE", "MEAN U/S DISCHARGE"]);
    const outflow = getVal(manglaRaw, ["MEAN OUTFLOW", "MEAND/SDISCHARGE", "MEAN D/S DISCHARGE"]);

    if (level !== undefined) {
      stations.push({
        id: 'mangla',
        ...STATION_COORDINATES.MANGLA,
        metrics: [
          { label: "Reservoir Level", value: level || 0, unit: "ft", type: 'level' },
          { label: "Inflow", value: inflow || 0, unit: "cusecs", type: 'inflow' },
          { label: "Outflow", value: outflow || 0, unit: "cusecs", type: 'outflow' }
        ],
        historical: getHistoricalData('mangla', allData)
      });
    }
  }

  // ===== BARRAGES (Flood forecasting - prioritize UPSTREAM & DOWNSTREAM DISCHARGE) =====

  // 3. CHASHMA BARRAGE
  const chashmaRaw = findStationObj(rawStations, ["CHASHMA", "CHASMA"]);
  if (chashmaRaw) {
    const upDis = getVal(chashmaRaw, ["U/SDISCHARGE", "U/S DISCHARGE"]);
    const downDis = getVal(chashmaRaw, ["D/SDISCHARGE", "D/S DISCHARGE"]);
    const level = getVal(chashmaRaw, ["LEVEL"]);

    if (upDis !== undefined || downDis !== undefined) {
      stations.push({
        id: 'chashma',
        ...STATION_COORDINATES.CHASHMA,
        metrics: [
          { label: "Upstream Discharge", value: upDis || 0, unit: "cusecs", type: 'inflow' },
          { label: "Downstream Discharge", value: downDis || 0, unit: "cusecs", type: 'outflow' },
          { label: "Level", value: level || 0, unit: "ft", type: 'level' }
        ],
        historical: getHistoricalData('chashma', allData)
      });
    }
  }

  // 4. TAUNSA BARRAGE
  const taunsaRaw = findStationObj(rawStations, ["TAUNSA"]);
  if (taunsaRaw) {
    const upDis = getVal(taunsaRaw, ["U/SDISCHARGE", "U/S DISCHARGE"]);
    const downDis = getVal(taunsaRaw, ["D/SDISCHARGE", "D/S DISCHARGE"]);

    if (upDis !== undefined || downDis !== undefined) {
      stations.push({
        id: 'taunsa',
        ...STATION_COORDINATES.TAUNSA,
        metrics: [
          { label: "Upstream Discharge", value: upDis || 0, unit: "cusecs", type: 'inflow' },
          { label: "Downstream Discharge", value: downDis || 0, unit: "cusecs", type: 'outflow' }
        ],
        historical: getHistoricalData('taunsa', allData)
      });
    }
  }

  // 5. GUDDU BARRAGE
  const gudduRaw = findStationObj(rawStations, ["GUDDU"]);
  if (gudduRaw) {
    const upDis = getVal(gudduRaw, ["U/SDISCHARGE", "U/S DISCHARGE"]);
    const downDis = getVal(gudduRaw, ["D/SDISCHARGE", "D/S DISCHARGE"]);

    if (upDis !== undefined || downDis !== undefined) {
      stations.push({
        id: 'guddu',
        ...STATION_COORDINATES.GUDDU,
        metrics: [
          { label: "Upstream Discharge", value: upDis || 0, unit: "cusecs", type: 'inflow' },
          { label: "Downstream Discharge", value: downDis || 0, unit: "cusecs", type: 'outflow' }
        ],
        historical: getHistoricalData('guddu', allData)
      });
    }
  }

  // 6. SUKKUR BARRAGE
  const sukkurRaw = findStationObj(rawStations, ["SUKKUR"]);
  if (sukkurRaw) {
    const upDis = getVal(sukkurRaw, ["U/SDISCHARGE", "U/S DISCHARGE"]);
    const downDis = getVal(sukkurRaw, ["D/SDISCHARGE", "D/S DISCHARGE"]);

    if (upDis !== undefined || downDis !== undefined) {
      stations.push({
        id: 'sukkur',
        ...STATION_COORDINATES.SUKKUR,
        metrics: [
          { label: "Upstream Discharge", value: upDis || 0, unit: "cusecs", type: 'inflow' },
          { label: "Downstream Discharge", value: downDis || 0, unit: "cusecs", type: 'outflow' }
        ],
        historical: getHistoricalData('sukkur', allData)
      });
    }
  }

  // 7. KOTRI BARRAGE
  const kotriRaw = findStationObj(rawStations, ["KOTRI"]);
  if (kotriRaw) {
    const upDis = getVal(kotriRaw, ["U/SDISCHARGE", "U/S DISCHARGE"]);
    const downDis = getVal(kotriRaw, ["D/SDISCHARGE", "D/S DISCHARGE"]);

    if (upDis !== undefined || downDis !== undefined) {
      stations.push({
        id: 'kotri',
        ...STATION_COORDINATES.KOTRI,
        metrics: [
          { label: "Upstream Discharge", value: upDis || 0, unit: "cusecs", type: 'inflow' },
          { label: "Downstream Discharge", value: downDis || 0, unit: "cusecs", type: 'outflow' }
        ],
        historical: getHistoricalData('kotri', allData)
      });
    }
  }

  // ===== TRIBUTARY STATIONS (Important for total inflow) =====

  // 8. NOWSHERA (Kabul River)
  const nowsheraRaw = findStationObj(rawStations, ["NOWSHERA", "KABUL @ NOWSHERA"]);
  if (nowsheraRaw) {
    const discharge = getVal(nowsheraRaw, ["MEAN DISCHARGE", "MEANDISCHARGE"]);

    if (discharge !== undefined) {
      stations.push({
        id: 'nowshera',
        ...STATION_COORDINATES.NOWSHERA,
        metrics: [
          { label: "Mean Discharge", value: discharge, unit: "cusecs", type: 'discharge' }
        ],
        historical: getHistoricalData('nowshera', allData)
      });
    }
  }

  // 9. MARALA (Chenab River)
  const maralaRaw = findStationObj(rawStations, ["MARALA", "CHENAB @ MARALA"]);
  if (maralaRaw) {
    const upDis = getVal(maralaRaw, ["MEANU/SDISCHARGE", "MEAN U/S DISCHARGE"]);
    const downDis = getVal(maralaRaw, ["MEAND/SDISCHARGE", "MEAN D/S DISCHARGE"]);
    const level = getVal(maralaRaw, ["LEVEL"]);

    if (upDis !== undefined || downDis !== undefined) {
      stations.push({
        id: 'marala',
        ...STATION_COORDINATES.MARALA,
        metrics: [
          { label: "Mean Upstream Discharge", value: upDis || 0, unit: "cusecs", type: 'inflow' },
          { label: "Mean Downstream Discharge", value: downDis || 0, unit: "cusecs", type: 'outflow' },
          { label: "Level", value: level || 0, unit: "ft", type: 'level' }
        ],
        historical: getHistoricalData('marala', allData)
      });
    }
  }

  // 10. PANJNAD (Confluence Point)
  const panjnadRaw = findStationObj(rawStations, ["PANJNAD"]);
  if (panjnadRaw) {
    const upDis = getVal(panjnadRaw, ["U/SDISCHARGE", "U/S DISCHARGE", "PANJNAD\nU/SDISCHARGE"]);
    const downDis = getVal(panjnadRaw, ["D/SDISCHARGE", "D/S DISCHARGE", "IRSARELEASES\nD/SDISCHARGE"]);

    if (upDis !== undefined || downDis !== undefined) {
      stations.push({
        id: 'panjnad',
        ...STATION_COORDINATES.PANJNAD,
        metrics: [
          { label: "Upstream Discharge", value: upDis || 0, unit: "cusecs", type: 'inflow' },
          { label: "Downstream Discharge", value: downDis || 0, unit: "cusecs", type: 'outflow' }
        ],
        historical: getHistoricalData('panjnad', allData)
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
    let type = '';

    switch (stationId) {
      case 'tarbela':
        const t = findStationObj(rawStations, ["TARBELA", "INDUS @ TARBELA"]);
        value = getVal(t, ["INDUS@TARBELA KABUL@NOWSHERA\nLEVEL", "LEVEL"]) || 0;
        type = 'Level';
        break;

      case 'mangla':
        const m = findStationObj(rawStations, ["MANGLA", "JHELUM @ MANGLA"]);
        value = getVal(m, ["LEVEL"]) || 0;
        type = 'Level';
        break;

      case 'chashma':
        const ch = findStationObj(rawStations, ["CHASHMA", "CHASMA"]);
        value = getVal(ch, ["U/SDISCHARGE", "U/S DISCHARGE"]) || 0;
        type = 'Inflow';
        break;

      case 'taunsa':
      case 'guddu':
      case 'sukkur':
      case 'kotri':
        const b = findStationObj(rawStations, [stationId.toUpperCase()]);
        value = getVal(b, ["D/SDISCHARGE", "D/S DISCHARGE"]) || 0;
        type = 'Downstream';
        break;

      case 'nowshera':
        const n = findStationObj(rawStations, ["NOWSHERA", "KABUL @ NOWSHERA"]);
        value = getVal(n, ["MEAN DISCHARGE", "MEANDISCHARGE"]) || 0;
        type = 'Discharge';
        break;

      case 'marala':
        const ma = findStationObj(rawStations, ["MARALA", "CHENAB @ MARALA"]);
        value = getVal(ma, ["MEANU/SDISCHARGE", "MEAN U/S DISCHARGE"]) || 0;
        type = 'Inflow';
        break;

      case 'panjnad':
        const p = findStationObj(rawStations, ["PANJNAD"]);
        value = getVal(p, ["U/SDISCHARGE", "U/S DISCHARGE", "PANJNAD\nU/SDISCHARGE"]) || 0;
        type = 'Inflow';
        break;
    }

    // Simple check to ensure we aren't plotting zeros if data is missing for that day
    if (!value) return null;

    return { date: date.split('.')[0] + '/' + date.split('.')[1], value, type };
  }).filter(Boolean) as { date: string; value: number; type: string }[];
};
