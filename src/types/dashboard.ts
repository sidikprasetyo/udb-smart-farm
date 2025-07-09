export interface SensorData {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  status: 'optimal' | 'normal' | 'high' | 'low' | 'medium';
  icon: string;
  progress: number;
  color: string;
}

export interface DashboardData {
  curah_hujan: SensorData;
  dht_humidity: SensorData;
  dht_temperature: SensorData;
  kecepatan_angin: SensorData;
  kelembaban: SensorData;
  kelembaban_tanah: SensorData;
  ph_tanah: SensorData;
  radiasi: SensorData;
  suhu: SensorData;
  timestamp: string;
}