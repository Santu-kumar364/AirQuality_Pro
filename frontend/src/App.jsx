import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  RefreshCw,
  MapPin,
  Clock,
  Thermometer,
  Droplets,
  Eye,
  Wind,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_URL =
  "https://nenql5mpli.execute-api.ap-south-1.amazonaws.com/prod/data";

function App() {
  const [airQualityData, setAirQualityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const fetchAirQualityData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 FETCHING DATA...");

      const timestamp = Date.now();
      const response = await fetch(`${API_URL}?limit=10&_=${timestamp}`);
      const result = await response.json();

      console.log("📊 API RESPONSE:", {
        recordCount: result.data?.length,
        latestTimestamp: result.data?.[0]?.timestamp,
        latestRecordId: result.data?.[0]?.record_id,
      });

      if (response.ok && result.data && result.data.length > 0) {
        const newData = [...result.data];
        console.log("✅ UPDATING STATE WITH NEW DATA:", newData[0]?.timestamp);
        setAirQualityData(newData);
        setLastUpdate(Date.now()); // Force re-render
        setError(null);
      } else {
        setError(result.error || "No data received");
      }
    } catch (err) {
      setError("Failed to fetch air quality data");
      console.error("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAirQualityData();

    if (autoRefresh) {
      const interval = setInterval(fetchAirQualityData, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchAirQualityData]);

  const getAqiConfig = (aqi) => {
    if (aqi <= 50)
      return {
        label: "Good",
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        gradient: "from-green-500 to-emerald-500",
        icon: CheckCircle2,
      };
    if (aqi <= 100)
      return {
        label: "Moderate",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
        gradient: "from-yellow-500 to-amber-500",
        icon: Eye,
      };
    if (aqi <= 200)
      return {
        label: "Poor",
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
        gradient: "from-orange-500 to-red-500",
        icon: AlertCircle,
      };
    if (aqi <= 300)
      return {
        label: "Unhealthy",
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        gradient: "from-red-500 to-pink-500",
        icon: AlertCircle,
      };
    return {
      label: "Hazardous",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      gradient: "from-purple-500 to-violet-500",
      icon: AlertCircle,
    };
  };

  const latestReading = airQualityData[0];
  const aqiConfig = latestReading ? getAqiConfig(latestReading.aqi) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Wind className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AirQuality Pro</h1>
                <p className="text-sm text-white/60">
                  Real-time Environmental Monitoring
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  autoRefresh
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-white/5 text-white/60 border border-white/10"
                }`}
              >
                <RefreshCw
                  className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`}
                />
                <span className="text-sm">Auto-refresh</span>
              </button>

              <button
                onClick={fetchAirQualityData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Current AQI Overview */}
        {latestReading && aqiConfig && (
          <div
            key={latestReading.timestamp}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          >
            {/* Main AQI Card */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white/80 mb-1">
                    Current Air Quality
                  </h2>
                  <div className="flex items-center space-x-2 text-white/60">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{latestReading.location}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span className="text-sm">
                      {new Date(latestReading.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-full bg-gradient-to-r ${aqiConfig.gradient}`}
                >
                  {React.createElement(aqiConfig.icon, {
                    className: "h-6 w-6 text-white",
                  })}
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-5xl font-bold text-white mb-2">
                    {latestReading.aqi}
                  </div>
                  <div
                    className={`text-2xl font-semibold mb-4 ${aqiConfig.color}`}
                  >
                    {aqiConfig.label}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-white/60 text-sm mb-2">Last updated</div>
                  <div className="text-white text-sm">
                    {new Date(latestReading.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* AQI Scale */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-white/60 mb-2">
                  <span>0-50</span>
                  <span>51-100</span>
                  <span>101-200</span>
                  <span>201-300</span>
                  <span>300+</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${aqiConfig.gradient}`}
                    style={{
                      width: `${Math.min(
                        (latestReading.aqi / 500) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span className="text-green-400">Good</span>
                  <span className="text-yellow-400">Moderate</span>
                  <span className="text-orange-400">Poor</span>
                  <span className="text-red-400">Unhealthy</span>
                  <span className="text-purple-400">Hazardous</span>
                </div>
              </div>
            </div>

            {/* Sensor Readings */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white/80 mb-6">
                Sensor Readings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Eye className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-white/60">PM2.5</div>
                      <div className="text-white font-semibold">
                        {latestReading.pm25} µg/m³
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Wind className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-sm text-white/60">PM10</div>
                      <div className="text-white font-semibold">
                        {latestReading.pm10} µg/m³
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Thermometer className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Temperature</div>
                      <div className="text-white font-semibold">
                        {latestReading.temperature}°C
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Droplets className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Humidity</div>
                      <div className="text-white font-semibold">
                        {latestReading.humidity}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historical Data Table */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white/80">
              Historical Data
            </h2>
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <RefreshCw className="h-4 w-4" />
              <span>Auto-updates every 30 seconds</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    AQI
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    PM2.5
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    PM10
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Temperature
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Humidity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {airQualityData.map((reading) => {
                  const rowAqiConfig = getAqiConfig(reading.aqi);
                  return (
                    <tr
                      key={reading.record_id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Date(reading.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-white/40">
                          {new Date(reading.timestamp).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${rowAqiConfig.bgColor} ${rowAqiConfig.color}`}
                        >
                          {reading.aqi}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {React.createElement(rowAqiConfig.icon, {
                            className: `h-4 w-4 ${rowAqiConfig.color}`,
                          })}
                          <span
                            className={`text-sm font-medium ${rowAqiConfig.color}`}
                          >
                            {rowAqiConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {reading.pm25} µg/m³
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {reading.pm10} µg/m³
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {reading.temperature}°C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {reading.humidity}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {airQualityData.length === 0 && !loading && (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <div className="text-white/60">
                  No air quality data available
                </div>
                <div className="text-white/40 text-sm mt-1">
                  Start the data simulator to see readings
                </div>
              </div>
            )}

            {loading && airQualityData.length === 0 && (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 text-white/60 animate-spin mx-auto mb-4" />
                <div className="text-white/60">Loading air quality data...</div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-white/60 text-sm">
              Cloud Computing Project • IIT Patna • Real-time Air Quality
              Monitoring
            </div>
            <div className="text-white/40 text-sm">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
