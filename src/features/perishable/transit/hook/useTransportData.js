import { useState } from "react";
import {
  generateTransportTemperature,
  generateTransportEthylene,
  generateJourneyInfo,
  generateGPSCoordinates,
  startTransportJourney,
  resetTransportJourney,
  calculateJourneyMetrics,
} from "../../../../utils/transitDataGenerator";

export function useTransportData() {
  const [journeyInfo, setJourneyInfo] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [readings, setReadings] = useState([]);
  const [current, setCurrent] = useState(null);
  const [gps, setGps] = useState([]);
  const [temps, setTemps] = useState([]);
  const [ethy, setEthy] = useState([]);
  const [startT, setStartT] = useState("");
  const [endT, setEndT] = useState("");
  const [journeyMetrics, setJourneyMetrics] = useState(null);

  const startJourney = () => {
    resetTransportJourney();
    const info = startTransportJourney();

    const startTime = Math.floor(info.journeyStartTime / 1000);
    const endTime = Math.floor(info.journeyEndTime / 1000);

    setStartT(String(startTime));
    setEndT(String(endTime));
    setGps(generateGPSCoordinates());
    setIsCollecting(true);

    let i = 0;
    const max = 3;
    const tArr = [];
    const eArr = [];

    const journeyInterval = setInterval(() => {
      const journeyData = generateJourneyInfo();
      setJourneyInfo(journeyData);
      if (i >= max) clearInterval(journeyInterval);
    }, 1000);

    const sensorInterval = setInterval(() => {
      if (i >= max) {
        clearInterval(sensorInterval);
        clearInterval(journeyInterval);

        setTemps(tArr);
        setEthy(eArr);
        setIsCollecting(false);
        setJourneyMetrics(calculateJourneyMetrics());
        return;
      }

      const t = parseFloat(generateTransportTemperature());
      const e = parseInt(generateTransportEthylene());
      const journeyData = generateJourneyInfo();

      tArr.push(t);
      eArr.push(e);

      const reading = {
        idx: i + 1,
        t,
        e,
        phase: journeyData.stateDescription,
        timestamp: journeyData.realisticCurrentTime,
        progress: journeyData.progress,
      };

      setCurrent(reading);
      setReadings((prev) => [...prev, reading]);
      setJourneyInfo(journeyData);
      i++;
    }, 3000);

    return () => {
      clearInterval(sensorInterval);
      clearInterval(journeyInterval);
    };
  };

  return {
    journeyInfo,
    isCollecting,
    readings,
    current,
    gps,
    temps,
    ethy,
    startT,
    endT,
    journeyMetrics,
    startJourney,
  };
}
