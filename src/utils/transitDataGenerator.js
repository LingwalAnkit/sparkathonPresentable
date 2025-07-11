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
    temperature: { base: 22, variance: 2, trend: 0.1 },
    ethylene: { base: 15, variance: 3, trend: 0.2 },
    description: "Loading phase - moderate activity",
  },
  [TRANSPORT_STATES.HIGHWAY]: {
    temperature: { base: 18, variance: 1, trend: -0.05 },
    ethylene: { base: 12, variance: 2, trend: 0.1 },
    description: "Highway transport - steady conditions",
  },
  [TRANSPORT_STATES.CITY_TRAFFIC]: {
    temperature: { base: 24, variance: 3, trend: 0.15 },
    ethylene: { base: 18, variance: 4, trend: 0.3 },
    description: "City traffic - variable conditions",
  },
  [TRANSPORT_STATES.UNLOADING]: {
    temperature: { base: 25, variance: 2, trend: 0.2 },
    ethylene: { base: 20, variance: 3, trend: 0.4 },
    description: "Unloading phase - final destination",
  },
};

class TransportJourney {
  constructor() {
    this.currentState = TRANSPORT_STATES.LOADING;
    this.stateIndex = 0;
    this.readingCount = 0;
    this.journeyStates = [
      TRANSPORT_STATES.LOADING,
      TRANSPORT_STATES.HIGHWAY,
      TRANSPORT_STATES.CITY_TRAFFIC,
      TRANSPORT_STATES.UNLOADING,
    ];
    // Simulated journey: 2.5 - 4.5 hours
    this.journeyStartTime = this.generateRealisticStartTime();
    this.totalJourneyHours = 2.5 + Math.random() * 2;
    this.journeyEndTime =
      this.journeyStartTime + this.totalJourneyHours * 60 * 60 * 1000;
    this.simulationStart = Date.now();
    this.previousValues = {
      temperature: 20,
      ethylene: 15,
    };
  }

  generateRealisticStartTime() {
    // Simulate a morning start between 6-10am
    const now = new Date();
    const startHour = 6 + Math.random() * 4;
    const startMinute = Math.random() * 60;
    const startTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      Math.floor(startHour),
      Math.floor(startMinute)
    );
    return startTime.getTime();
  }

  getRealisticTimestamps() {
    return {
      startTime: this.journeyStartTime,
      endTime: this.journeyEndTime,
      startTimeFormatted: new Date(this.journeyStartTime).toLocaleString(),
      endTimeFormatted: new Date(this.journeyEndTime).toLocaleString(),
    };
  }

  getCurrentState() {
    return this.currentState;
  }

  getStateDescription() {
    return STATE_PROFILES[this.currentState].description;
  }

  updateState() {
    // Change state every reading (for 3 readings, cycle through 3-4 states)
    if (this.readingCount > 0 && this.readingCount % 1 === 0) {
      this.stateIndex = Math.min(
        this.stateIndex + 1,
        this.journeyStates.length - 1
      );
      this.currentState = this.journeyStates[this.stateIndex];
    }
  }

  generateReading(sensorType) {
    this.updateState();
    const profile = STATE_PROFILES[this.currentState][sensorType];
    const { base, variance, trend } = profile;
    const continuityFactor = 0.3;
    const previousValue = this.previousValues[sensorType] || base;
    let newValue =
      base +
      (Math.random() - 0.5) * variance * 2 +
      trend * this.readingCount +
      (previousValue - base) * continuityFactor;
    if (sensorType === "temperature") {
      newValue = Math.max(10, Math.min(40, newValue));
    } else if (sensorType === "ethylene") {
      newValue = Math.max(5, Math.min(100, newValue));
    }
    this.previousValues[sensorType] = newValue;
    return newValue;
  }

  getJourneyInfo() {
    const actualElapsed = Date.now() - this.simulationStart;
    const simulationTotal = 9000; // 9 seconds
    const progress = Math.min((actualElapsed / simulationTotal) * 100, 100);
    const journeyProgress = progress / 100;
    const currentJourneyTime =
      this.journeyStartTime +
      this.totalJourneyHours * 60 * 60 * 1000 * journeyProgress;
    return {
      progress: progress.toFixed(1),
      actualElapsed: Math.floor(actualElapsed / 1000),
      simulationTotal: Math.floor(simulationTotal / 1000),
      realisticCurrentTime: new Date(currentJourneyTime).toLocaleString(),
      totalJourneyHours: this.totalJourneyHours.toFixed(1),
      currentState: this.currentState,
      stateDescription: this.getStateDescription(),
      simulatedTimestamp: Math.floor(currentJourneyTime / 1000),
    };
  }

  nextReading() {
    this.readingCount++;
  }
}

// API
export function startTransportJourney() {
  journeyInstance = new TransportJourney();
  return journeyInstance;
}
export function getCurrentJourney() {
  return journeyInstance;
}
export function resetTransportJourney() {
  journeyInstance = null;
}
export function generateJourneyInfo() {
  if (!journeyInstance) {
    return {
      progress: "0",
      actualElapsed: 0,
      simulationTotal: 9,
      realisticCurrentTime: new Date().toLocaleString(),
      totalJourneyHours: "0",
      currentState: "loading",
      stateDescription: "Preparing for transport",
      simulatedTimestamp: Math.floor(Date.now() / 1000),
    };
  }
  return journeyInstance.getJourneyInfo();
}
export function generateTransportTemperature() {
  if (!journeyInstance) journeyInstance = new TransportJourney();
  const temp = journeyInstance.generateReading("temperature");
  return temp.toFixed(1);
}
export function generateTransportEthylene() {
  if (!journeyInstance) journeyInstance = new TransportJourney();
  const ethylene = journeyInstance.generateReading("ethylene");
  journeyInstance.nextReading();
  return Math.round(ethylene);
}
export function generateGPSCoordinates() {
  const startLat = 28.6139 + (Math.random() - 0.5) * 0.1;
  const startLng = 77.209 + (Math.random() - 0.5) * 0.1;
  const endLat = startLat + (Math.random() - 0.5) * 0.5;
  const endLng = startLng + (Math.random() - 0.5) * 0.5;
  return [
    `${startLat.toFixed(6)},${startLng.toFixed(6)}`,
    `${endLat.toFixed(6)},${endLng.toFixed(6)}`,
  ];
}
export function getRealisticTimestamps() {
  if (!journeyInstance) {
    return {
      startTimestamp: Math.floor(Date.now() / 1000),
      endTimestamp: Math.floor(Date.now() / 1000) + 3600,
    };
  }
  const timestamps = journeyInstance.getRealisticTimestamps();
  return {
    startTimestamp: Math.floor(timestamps.startTime / 1000),
    endTimestamp: Math.floor(timestamps.endTime / 1000),
    startTimeFormatted: timestamps.startTimeFormatted,
    endTimeFormatted: timestamps.endTimeFormatted,
  };
}
export function calculateJourneyMetrics() {
  if (!journeyInstance) return {};
  const journeyHours = journeyInstance.totalJourneyHours;
  const averageSpeed = 40 + Math.random() * 30; // 40–70 km/h
  const distanceCovered = averageSpeed * journeyHours;
  const fuelEfficiency = 5 + Math.random() * 10; // 5–15 km/l
  return {
    totalTime: journeyHours,
    distanceCovered: Math.round(distanceCovered * 100) / 100,
    averageSpeed: Math.round(averageSpeed * 100) / 100,
    fuelEfficiency: Math.round(fuelEfficiency * 100) / 100,
    totalJourneyHours: Math.round(journeyHours * 100) / 100,
  };
}
