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
  ec_tanah: SensorData;
  kalium: SensorData;
  kecepatan_angin: SensorData;
  kelembaban_tanah: SensorData;
  kelembaban_udara: SensorData;
  nitrogen: SensorData;
  ph_tanah: SensorData;
  phosphorus: SensorData;
  radiasi: SensorData;
  suhu_tanah: SensorData;
  suhu_udara: SensorData;
  waktu: string;
}