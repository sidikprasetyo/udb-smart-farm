'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">ESP32 Snapshot</h1>
      <img
        src={`/images/esp32.jpg?ts=${timestamp}`}
        alt="ESP32 Snapshot"
        className="rounded shadow-md max-w-full h-auto"
      />
    </main>
  );
}
