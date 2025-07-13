import { io } from "socket.io-client";

const socket = io(import.meta.env.REACT_APP_BACKEND_URL || "http://localhost:3001");

const subscribeToAppleUpdates = (callback) => {
  socket.on("appleDataUpdated", callback);
};

const unsubscribeFromAppleUpdates = () => {
  socket.off("appleDataUpdated");
};

export default {
  subscribeToAppleUpdates,
  unsubscribeFromAppleUpdates,
};
