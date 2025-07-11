// utils/transitDataGenerator.js

let journeyInstance = null;

const TRANSPORT_STATES = {
  LOADING: "loading",
  HIGHWAY: "highway",
  CITY_TRAFFIC: "city_traffic",
  UNLOADING: "unloading",
};

// Realistic profiles for apple transport with spoilage progression
const STATE_PROFILES = {
  [TRANSPORT_STATES.LOADING]: {
    temperature: { base: 8, variance: 2, trend: 0.3 }, // Loading dock temperature
    ethylene: { base: 0.1, variance: 0.05, trend: 0.02 }, // Initial low ethylene
    description: "Loading phase - temperature rising from cold storage",
  },
  [TRANSPORT_STATES.HIGHWAY]: {
    temperature: { base: 6, variance: 1.5, trend: 0.1 }, // Better refrigeration on highway
    ethylene: { base: 0.2, variance: 0.1, trend: 0.05 }, // Gradual ethylene increase
    description: "Highway transport - steady refrigerated conditions",
  },
  [TRANSPORT_STATES.CITY_TRAFFIC]: {
    temperature: { base: 12, variance: 3, trend: 0.4 }, // Poor refrigeration in traffic
    ethylene: { base: 0.5, variance: 0.2, trend: 0.15 }, // Accelerated ethylene production
    description: "City traffic - variable conditions, frequent stops",
  },
  [TRANSPORT_STATES.UNLOADING]: {
    temperature: { base: 15, variance: 2, trend: 0.5 }, // Ambient temperature exposure
    ethylene: { base: 1.0, variance: 0.3, trend: 0.25 }, // High ethylene production
    description: "Unloading phase - exposure to ambient temperature",
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

    // Start with optimal cold storage conditions
    this.previousValues = {
      temperature: 2.0, // Cold storage temperature
      ethylene: 0.05, // Very low initial ethylene
    };

    // Track cumulative spoilage factors
    this.cumulativeEthylene = 0.05;
    this.temperatureExposureTime = 0;
  }

  generateRealisticStartTime() {
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
    // Progress through states based on reading count
    const stateTransitionPoints = [0, 3, 6, 9]; // Readings per state
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
      // Temperature with realistic cold chain breaks
      const continuityFactor = 0.4;
      const previousValue = this.previousValues[sensorType];

      let newValue =
        base +
        (Math.random() - 0.5) * variance * 2 +
        trend * this.readingCount +
        (previousValue - base) * continuityFactor;

      // Realistic temperature bounds for apple transport
      newValue = Math.max(0, Math.min(25, newValue));

      // Track temperature abuse
      if (newValue > 4) {
        this.temperatureExposureTime++;
      }

      this.previousValues[sensorType] = newValue;
      return newValue;
    } else if (sensorType === "ethylene") {
      // Ethylene - always increasing, accelerated by temperature abuse
      const baseIncrease = trend * (this.readingCount + 1);
      const temperatureAcceleration = this.temperatureExposureTime * 0.02;
      const randomVariation = Math.random() * variance;

      // Autocatalytic effect - ethylene production accelerates over time
      const autocatalyticFactor = Math.pow(this.cumulativeEthylene, 0.3) * 0.1;

      this.cumulativeEthylene +=
        baseIncrease +
        temperatureAcceleration +
        randomVariation +
        autocatalyticFactor;

      // Ensure ethylene never decreases and stays within realistic bounds
      this.cumulativeEthylene = Math.max(
        0.05,
        Math.min(50, this.cumulativeEthylene)
      );

      return this.cumulativeEthylene;
    }
  }

  getSpoilageLevel() {
    // Calculate spoilage based on temperature exposure and ethylene levels
    const tempFactor = this.temperatureExposureTime * 0.1;
    const ethyleneFactor = this.cumulativeEthylene * 0.2;
    const spoilageScore = tempFactor + ethyleneFactor;

    if (spoilageScore < 1) return "Fresh";
    if (spoilageScore < 3) return "Early Ripening";
    if (spoilageScore < 6) return "Advanced Ripening";
    if (spoilageScore < 10) return "Overripe";
    return "Spoiled";
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
      spoilageLevel: this.getSpoilageLevel(),
      cumulativeEthylene: this.cumulativeEthylene.toFixed(3),
      temperatureExposureTime: this.temperatureExposureTime,
    };
  }

  nextReading() {
    this.readingCount++;
  }
}

// API Functions
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
      spoilageLevel: "Fresh",
      cumulativeEthylene: "0.050",
      temperatureExposureTime: 0,
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
  return ethylene.toFixed(3); // Return precise ethylene readings
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
