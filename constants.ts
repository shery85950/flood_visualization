import { RawDataEntry } from "./types";

export const STATION_COORDINATES = {
  TARBELA: { lat: 34.0858, lng: 72.6989, name: "Tarbela Dam", river: "Indus" },
  MANGLA: { lat: 33.1485, lng: 73.6409, name: "Mangla Dam", river: "Jhelum" },
  NOWSHERA: { lat: 34.0155, lng: 71.9747, name: "Nowshera", river: "Kabul" },
  PANJNAD: { lat: 29.3444, lng: 71.0258, name: "Panjnad Headworks", river: "Panjnad" },
  // Adding Chashma approximately based on CRBC presence in data
  CHASHMA: { lat: 32.4338, lng: 71.3653, name: "Chashma Barrage", river: "Indus" }
};

export const RAW_DATA: RawDataEntry[] = [
  {
    "file": "IRSA Press Release 4th November, 2025",
    "date": null,
    "stations": {},
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  },
  {
    "file": "More",
    "date": null,
    "stations": {},
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  },
  {
    "file": "IRSA Press Release 5th May, 2025",
    "date": null,
    "stations": {},
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  },
  {
    "file": "More",
    "date": null,
    "stations": {},
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  },
  {
    "file": "IRSA Press Release 26th March, 2025",
    "date": null,
    "stations": {},
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  },
  {
    "file": "More",
    "date": null,
    "stations": {},
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  },
  {
    "file": "Daily Data 04_12_2025",
    "date": "04.12.2025",
    "stations": {
      "INDUS RIVER SYSTEM AUTHORITY": {
        "INDUS@TARBELA KABUL@NOWSHERA\nLEVEL": 1491.77,
        "MEANDISCHARGE": 7300.0,
        "DEADLEVEL": 1050.0,
        "MEANINFLOW": 4900.0,
        "MEANOUTFLOW": 37000.0,
        "LEVEL": 1215.55,
        "U/SDISCHARGE": 43100.0,
        "D/SDISCHARGE": 14550.0,
        "CRBC": 3000.0,
        "MEANU/SDISCHARGE": 7605.0,
        "MEAND/SDISCHARGE": 1656.0,
        "RIMSTATIONINFLOWS\nMEANOUTFLOW": 33000.0,
        "TOTAL": 41105.0,
        "RIMSTATIONOUTFLOWS\nTOTAL": 80905.0,
        "PANJNAD\nU/SDISCHARGE": 17773.0,
        "IRSARELEASES\nD/SDISCHARGE": 11773.0
      }
    },
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  },
  {
    "file": "Daily Data 03_12_2025",
    "date": "03.12.2025",
    "stations": {
      "INDUS RIVER SYSTEM AUTHORITY": {
        "INDUS@TARBELA KABUL@NOWSHERA\nLEVEL": 1492.29,
        "MEANDISCHARGE": 7200.0,
        "DEADLEVEL": 1050.0,
        "MEANINFLOW": 5412.0,
        "MEANOUTFLOW": 50000.0,
        "LEVEL": 1216.35,
        "U/SDISCHARGE": 42050.0,
        "D/SDISCHARGE": 13220.0,
        "CRBC": 3000.0,
        "MEANU/SDISCHARGE": 8553.0,
        "MEAND/SDISCHARGE": 2363.0,
        "RIMSTATIONINFLOWS\nMEANOUTFLOW": 30000.0,
        "TOTAL": 41565.0,
        "RIMSTATIONOUTFLOWS\nTOTAL": 78753.0,
        "PANJNAD\nU/SDISCHARGE": 21951.0,
        "IRSARELEASES\nD/SDISCHARGE": 15951.0
      }
    },
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  },
  {
    "file": "Daily Data 02_12_2025",
    "date": "02.12.2025",
    "stations": {
      "INDUS RIVER SYSTEM AUTHORITY": {
        "INDUS@TARBELA KABUL@NOWSHERA\nLEVEL": 1492.85,
        "MEANDISCHARGE": 7300.0,
        "DEADLEVEL": 1050.0,
        "MEANINFLOW": 3657.0,
        "MEANOUTFLOW": 52716.0,
        "LEVEL": 1217.05,
        "U/SDISCHARGE": 40845.0,
        "D/SDISCHARGE": 11755.0,
        "CRBC": 3088.0,
        "MEANU/SDISCHARGE": 9744.0,
        "MEAND/SDISCHARGE": 3570.0,
        "RIMSTATIONINFLOWS\nMEANOUTFLOW": 30000.0,
        "TOTAL": 41601.0,
        "RIMSTATIONOUTFLOWS\nTOTAL": 87044.0,
        "PANJNAD\nU/SDISCHARGE": 21951.0,
        "IRSARELEASES\nD/SDISCHARGE": 15951.0
      }
    },
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  },
  {
    "file": "Daily Data 01_12_2025",
    "date": "01.12.2025",
    "stations": {
      "INDUS RIVER SYSTEM AUTHORITY": {
        "INDUS@TARBELA KABUL@NOWSHERA\nLEVEL": 1493.69,
        "MEANDISCHARGE": 6800.0,
        "DEADLEVEL": 1050.0,
        "MEANINFLOW": 3656.0,
        "MEANOUTFLOW": 50000.0,
        "LEVEL": 1217.8,
        "U/SDISCHARGE": 41635.0,
        "D/SDISCHARGE": 12465.0,
        "CRBC": 3200.0,
        "MEANU/SDISCHARGE": 10787.0,
        "MEAND/SDISCHARGE": 4487.0,
        "RIMSTATIONINFLOWS\nMEANOUTFLOW": 30000.0,
        "TOTAL": 42443.0,
        "RIMSTATIONOUTFLOWS\nTOTAL": 97587.0,
        "PANJNAD\nU/SDISCHARGE": 21951.0,
        "IRSARELEASES\nD/SDISCHARGE": 15951.0
      }
    },
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  },
  {
    "file": "Daily Data 30_11_2025",
    "date": "30.11.2025",
    "stations": {
      "INDUS RIVER SYSTEM AUTHORITY": {
        "INDUS@TARBELA KABUL@NOWSHERA\nLEVEL": 1494.95,
        "MEANDISCHARGE": 8600.0,
        "DEADLEVEL": 1050.0,
        "MEANINFLOW": 3656.0,
        "MEANOUTFLOW": 55000.0,
        "LEVEL": 1218.55,
        "U/SDISCHARGE": 41635.0,
        "D/SDISCHARGE": 12465.0,
        "CRBC": 3200.0,
        "MEANU/SDISCHARGE": 9582.0,
        "MEAND/SDISCHARGE": 3282.0,
        "RIMSTATIONINFLOWS\nMEANOUTFLOW": 30000.0,
        "TOTAL": 41438.0,
        "RIMSTATIONOUTFLOWS\nTOTAL": 118182.0,
        "PANJNAD\nU/SDISCHARGE": 21242.0,
        "IRSARELEASES\nD/SDISCHARGE": 15242.0
      }
    },
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  },
  {
    "file": "Daily Data 29_11_2025",
    "date": "29.11.2025",
    "stations": {
      "INDUS RIVER SYSTEM AUTHORITY": {
        "INDUS @ TARBELA KABUL @ NOWSHERA\nLEVEL": 1497.14,
        "MEAN DISCHARGE": 7200.0,
        "DEAD LEVEL": 1050.0,
        "MEAN INFLOW": 5413.0,
        "MEAN OUTFLOW": 55000.0,
        "LEVEL": 1219.3,
        "U/S DISCHARGE": 42015.0,
        "D/S DISCHARGE": 12465.0,
        "CRBC": 3200.0,
        "MEAN U/S DISCHARGE": 8321.0,
        "MEAN D/S DISCHARGE": 2021.0,
        "RIM STATION INFLOWS\nMEAN OUTFLOW": 30000.0,
        "TOTAL": 43134.0,
        "RIM STATION OUTFLOWS\nTOTAL": 115521.0,
        "PANJNAD\nU/S DISCHARGE": 8909.0,
        "IRSA RELEASES\nD/S DISCHARGE": 2909.0
      }
    },
    "rim_inflows": null,
    "rim_outflows": 115521,
    "irsa_releases": {}
  },
  {
    "file": "Daily Data 28_11_2025",
    "date": "28.11.2025",
    "stations": {
      "INDUS RIVER SYSTEM AUTHORITY": {
        "INDUS@TARBELA KABUL@NOWSHERA\nLEVEL": 1499.22,
        "MEANDISCHARGE": 7200.0,
        "DEADLEVEL": 1050.0,
        "MEANINFLOW": 4430.0,
        "MEANOUTFLOW": 55000.0,
        "LEVEL": 1220.0,
        "U/SDISCHARGE": 41563.0,
        "D/SDISCHARGE": 11753.0,
        "CRBC": 3200.0,
        "MEANU/SDISCHARGE": 8709.0,
        "MEAND/SDISCHARGE": 2409.0,
        "RIMSTATIONINFLOWS\nMEANOUTFLOW": 23000.0,
        "TOTAL": 42239.0,
        "RIMSTATIONOUTFLOWS\nTOTAL": 108909.0,
        "PANJNAD\nU/SDISCHARGE": 8548.0,
        "IRSARELEASES\nD/SDISCHARGE": 2548.0
      }
    },
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  },
  {
    "file": "Daily Data 27_11_2025",
    "date": "27.11.2025",
    "stations": {
      "INDUS RIVER SYSTEM AUTHORITY": {
        "INDUS@TARBELA KABUL@NOWSHERA\nLEVEL": 1501.26,
        "MEANDISCHARGE": 7200.0,
        "DEADLEVEL": 1050.0,
        "MEANINFLOW": 5217.0,
        "MEANOUTFLOW": 55000.0,
        "LEVEL": 1220.5,
        "U/SDISCHARGE": 41563.0,
        "D/SDISCHARGE": 11753.0,
        "CRBC": 3200.0,
        "MEANU/SDISCHARGE": 8291.0,
        "MEAND/SDISCHARGE": 1991.0,
        "RIMSTATIONINFLOWS\nMEANOUTFLOW": 21930.0,
        "TOTAL": 44508.0,
        "RIMSTATIONOUTFLOWS\nTOTAL": 107421.0,
        "PANJNAD\nU/SDISCHARGE": 8548.0,
        "IRSARELEASES\nD/SDISCHARGE": 2548.0
      }
    },
    "rim_inflows": null,
    "rim_outflows": null,
    "irsa_releases": {}
  }
];