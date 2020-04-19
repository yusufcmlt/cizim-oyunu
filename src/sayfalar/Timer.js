import React, { useState, useEffect } from "react";
import { socket } from "../oyun-ogeleri/socketExport";

export default function Timer({ sure }) {
  const [seconds, setSeconds] = useState(sure);

  useEffect(() => {
    socket.on("timerDegistir", (timerData) => setSeconds(timerData));
  });
  return (
    <div>
      <p className="h1 text-danger">{seconds}</p>
    </div>
  );
}
