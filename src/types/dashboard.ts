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
  soilMoisture: SensorData;
  soilPH: SensorData;
  windSpeed: SensorData;
  rainfall: SensorData;
  radiation: SensorData;
  soilTemperature: SensorData;
  dhtTemperature: SensorData;
  dhtHumidity: SensorData;
}