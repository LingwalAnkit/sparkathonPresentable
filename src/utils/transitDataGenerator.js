// utils/transitDataGenerator.js

let journeyInstance = null;

const TRANSPORT_STATES = {
  LOADING: "loading",
  HIGHWAY: "highway",
  CITY_TRAFFIC: "city_traffic",
  UNLOADING: "unloading",
};

const STATE_PROFILES = {
  [TRANSPORT_STATES.LOADING]: {
    temperature: { base: 2, variance: 1, trend: 1 },
    ethylene: { base: 1, variance: 1, trend: 1 },
    description: "Loading phase",
  },
  [TRANSPORT_STATES.HIGHWAY]: {
    temperature: { base: 3, variance: 1, trend: 1 },
    ethylene: { base: 1, variance: 1, trend: 1 },
    description: "Highway transport",
  },
  [TRANSPORT_STATES.CITY_TRAFFIC]: {
    temperature: { base: 5, variance: 2, trend: 1 },
    ethylene: { base: 2, variance: 1, trend: 1 },
    description: "City traffic",
  },
  [TRANSPORT_STATES.UNLOADING]: {
    temperature: { base: 6, variance: 1, trend: 1 },
    ethylene: { base: 2, variance: 1, trend: 1 },
    description: "Unloading phase",
  },
};

class TransportJourney {
  constructor() {
    this.currentState = TRANSPORT_STATES.LOADING;
    this.stateIndex = 0;
    this.readingCount = 0;
    this.journeyStates = Object.values(TRANSPORT_STATES);

    this.journeyStartTime = this.generateStartTime();
    this.totalJourneyHours = Math.round(2 + Math.random() * 3); // Pure integer
    this.journeyEndTime =
      this.journeyStartTime + this.totalJourneyHours * 3600000;
    this.simulationStart = Date.now();

    // Start with integer base values
    this.baseTemperature = Math.floor(Math.random() * 2);
    this.baseEthylene = Math.floor(Math.random() * 1);
  }

  generateStartTime() {
    const now = new Date();
    const startHour = 5 + Math.floor(Math.random() * 5);
    const startMinute = Math.floor(Math.random() * 60);
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      startHour,
      startMinute
    ).getTime();
  }

  updateState() {
    const stateTransitionPoints = [0, 1, 2, 3];
    for (let i = 0; i < stateTransitionPoints.length; i++) {
      if (this.readingCount >= stateTransitionPoints[i]) {
        this.stateIndex = i;
        this.currentState = this.journeyStates[this.stateIndex];
      }
    }
  }

  generateReading(sensorType) {
    this.updateState();
    const profile = STATE_PROFILES[this.currentState][sensorType];
    const { base, variance, trend } = profile;

    if (sensorType === "temperature") {
      const randomFactor = Math.floor(Math.random() * variance * 2) - variance;
      const trendFactor = trend * this.readingCount;
      let newValue = this.baseTemperature + base + randomFactor + trendFactor;
      newValue = Math.max(0, Math.min(8, Math.floor(newValue))); // Pure integer 0-8
      return newValue;
    }

    if (sensorType === "ethylene") {
      const randomFactor = Math.floor(Math.random() * variance);
      const trendFactor = trend * this.readingCount;
      let newValue = this.baseEthylene + base + randomFactor + trendFactor;
      newValue = Math.max(0, Math.min(3, Math.floor(newValue))); // Pure integer 0-3
      this.baseEthylene = newValue; // Make it increasing
      return newValue;
    }
  }

  getJourneyInfo() {
    const now = Date.now();
    const elapsed = now - this.simulationStart;
    const simTotal = 9000;
    const progress = Math.min(Math.floor((elapsed / simTotal) * 100), 100); // Integer progress

    return {
      progress,
      actualElapsed: Math.floor(elapsed / 1000),
      simulationTotal: simTotal / 1000,
      realisticCurrentTime: new Date().toLocaleString(),
      totalJourneyHours: this.totalJourneyHours,
      currentState: this.currentState,
      stateDescription: STATE_PROFILES[this.currentState].description,
      simulatedTimestamp: Math.floor(Date.now() / 1000),
    };
  }

  nextReading() {
    this.readingCount++;
  }
}

export function generateTransportTemperature() {
  if (!journeyInstance) journeyInstance = new TransportJourney();
  return journeyInstance.generateReading("temperature"); // Returns pure integer
}

export function generateTransportEthylene() {
  if (!journeyInstance) journeyInstance = new TransportJourney();
  const ethylene = journeyInstance.generateReading("ethylene"); // Returns pure integer
  journeyInstance.nextReading();
  return ethylene;
}

// Other functions remain the same...
export function startTransportJourney() {
  journeyInstance = new TransportJourney();
  return journeyInstance;
}

export function resetTransportJourney() {
  journeyInstance = null;
}

export function generateJourneyInfo() {
  return journeyInstance
    ? journeyInstance.getJourneyInfo()
    : {
        progress: 0,
        actualElapsed: 0,
        simulationTotal: 9,
        realisticCurrentTime: new Date().toLocaleString(),
        totalJourneyHours: 0,
        currentState: "loading",
        stateDescription: "Preparing for transport",
        simulatedTimestamp: Math.floor(Date.now() / 1000),
      };
}

export function generateGPSCoordinates() {
  const startLat = (28.6139 + (Math.random() - 0.5) * 0.1).toFixed(5);
  const startLng = (77.209 + (Math.random() - 0.5) * 0.1).toFixed(5);
  const distance = 80 + Math.random() * 150;
  const bearing = Math.random() * 2 * Math.PI;
  const deltaLat = (distance / 111) * Math.cos(bearing);
  const deltaLng =
    (distance / (111 * Math.cos((parseFloat(startLat) * Math.PI) / 180))) *
    Math.sin(bearing);

  return [
    `${startLat},${startLng}`,
    `${(parseFloat(startLat) + deltaLat).toFixed(5)},${(
      parseFloat(startLng) + deltaLng
    ).toFixed(5)}`,
  ];
}

export function calculateJourneyMetrics() {
  if (!journeyInstance) return {};
  const hours = journeyInstance.totalJourneyHours;
  const speed = Math.floor(40 + Math.random() * 30); // Integer speed
  const distance = Math.floor(speed * hours); // Integer distance
  const mileage = Math.floor(5 + Math.random() * 10); // Integer mileage

  return {
    totalTime: hours,
    distanceCovered: distance,
    averageSpeed: speed,
    fuelEfficiency: mileage,
  };
}
