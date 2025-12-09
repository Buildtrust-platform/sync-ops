"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * FIELD INTELLIGENCE WIDGET
 *
 * PRD Module 2.3: Field Intelligence Engine
 *
 * Provides situational awareness for shoot locations:
 * - Weather Intelligence (current + 5-day forecast)
 * - Feasibility Score (0-100)
 * - Risk Alerts (weather-based warnings)
 * - Health Alerts (air quality, temperature extremes)
 *
 * Uses OpenWeatherMap API (free tier: 1000 calls/day)
 */

interface FieldIntelligenceProps {
  project: Schema["Project"]["type"];
  onUpdate: () => Promise<void>;
}

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    uvi: number;
  };
  daily: Array<{
    dt: number;
    temp: {
      day: number;
      min: number;
      max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind_speed: number;
    pop: number; // Probability of precipitation
  }>;
}

export default function FieldIntelligence({ project, onUpdate }: FieldIntelligenceProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(
    project.fieldIntelligenceWeatherData as WeatherData | null
  );

  const hasLocation = !!(project.shootLocationCity && project.shootLocationCountry);
  const hasCoordinates = !!project.shootLocationCoordinates;

  // Calculate feasibility score
  const calculateFeasibilityScore = (weather: WeatherData, project: Schema["Project"]["type"]): number => {
    let score = 100;

    // Weather conditions (40 points)
    const windSpeed = weather.current.wind_speed;
    if (windSpeed > 10) score -= 15; // High winds problematic for drones, audio
    if (windSpeed > 15) score -= 10; // Very high winds

    const temp = weather.current.temp;
    if (temp < 0 || temp > 35) score -= 10; // Extreme temperatures

    const humidity = weather.current.humidity;
    if (humidity > 80) score -= 5; // High humidity affects equipment

    // Check next 5 days for rain probability
    const avgRainProbability = weather.daily.slice(0, 5).reduce((acc, day) => acc + day.pop, 0) / 5;
    if (avgRainProbability > 0.5) score -= 10; // High rain probability

    // Time to shoot date (30 points)
    const productionStartDate = project.productionStartDate;
    if (productionStartDate) {
      const daysUntilShoot = Math.floor((new Date(productionStartDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilShoot < 7) score -= 15; // Less than a week
      if (daysUntilShoot < 3) score -= 10; // Less than 3 days - very tight
    }

    // Documents & approvals ready (30 points)
    const greenlightComplete = project.greenlightProducerApproved &&
                                project.greenlightLegalApproved &&
                                project.greenlightFinanceApproved &&
                                project.greenlightExecutiveApproved;
    if (!greenlightComplete) score -= 20;
    if (!project.brief) score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  // Generate risk alerts based on weather
  const generateRiskAlerts = (weather: WeatherData): string[] => {
    const alerts: string[] = [];

    if (weather.current.wind_speed > 10) {
      alerts.push(`⚠️ High winds (${Math.round(weather.current.wind_speed)} m/s) - Drone filming may be unsafe`);
    }

    if (weather.current.temp < 0) {
      alerts.push(`❄️ Freezing temperatures (${Math.round(weather.current.temp)}°C) - Equipment protection required`);
    }

    if (weather.current.temp > 35) {
      alerts.push(`🌡️ Extreme heat (${Math.round(weather.current.temp)}°C) - Crew safety & equipment cooling needed`);
    }

    const avgRainProbability = weather.daily.slice(0, 5).reduce((acc, day) => acc + day.pop, 0) / 5;
    if (avgRainProbability > 0.6) {
      alerts.push(`🌧️ High rain probability (${Math.round(avgRainProbability * 100)}%) over next 5 days`);
    }

    if (weather.current.uvi > 8) {
      alerts.push(`☀️ Very high UV index (${weather.current.uvi}) - Sun protection essential for crew`);
    }

    return alerts;
  };

  // Generate health alerts
  const generateHealthAlerts = (weather: WeatherData): string[] => {
    const alerts: string[] = [];

    if (weather.current.temp > 32) {
      alerts.push(`🥵 Heat exhaustion risk - Ensure hydration and shade for crew`);
    }

    if (weather.current.temp < 5) {
      alerts.push(`🥶 Hypothermia risk - Ensure warm clothing and heated breaks`);
    }

    if (weather.current.humidity > 85) {
      alerts.push(`💧 High humidity - Equipment condensation risk`);
    }

    return alerts;
  };

  // Fetch weather data from OpenWeatherMap
  const fetchWeatherData = async () => {
    if (!hasCoordinates) {
      setError("No shoot location coordinates set. Please add location first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [lat, lng] = project.shootLocationCoordinates!.split(',');

      // Using OpenWeatherMap One Call API 3.0 (free tier)
      // Note: In production, this should be a serverless function to protect API key
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

      if (!apiKey) {
        throw new Error('OpenWeatherMap API key not configured. Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to your .env.local file.');
      }

      // Real API call to OpenWeatherMap
      const response = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data: WeatherData = await response.json();
      setWeatherData(data);

      // Calculate scores and alerts
      const feasibilityScore = calculateFeasibilityScore(data, project);
      const riskAlerts = generateRiskAlerts(data);
      const healthAlerts = generateHealthAlerts(data);

      // Update project with new field intelligence data
      const client = generateClient<Schema>();

      await client.models.Project.update({
        id: project.id,
        fieldIntelligenceLastUpdated: new Date().toISOString(),
        fieldIntelligenceFeasibilityScore: feasibilityScore,
        fieldIntelligenceWeatherData: data as any,
        fieldIntelligenceRiskAlerts: riskAlerts,
        fieldIntelligenceHealthAlerts: healthAlerts,
      });

      await onUpdate();
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching weather data:', err);
      setError(err.message || 'Failed to fetch weather data');
      setLoading(false);
    }
  };

  const feasibilityScore = project.fieldIntelligenceFeasibilityScore || 0;
  const riskAlerts = project.fieldIntelligenceRiskAlerts || [];
  const healthAlerts = project.fieldIntelligenceHealthAlerts || [];

  // Determine feasibility color
  const getFeasibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getFeasibilityBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    if (score >= 40) return 'bg-orange-600';
    return 'bg-red-600';
  };

  if (!hasLocation) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🌍</span>
          <h3 className="text-lg font-bold text-white">Field Intelligence</h3>
        </div>
        <p className="text-slate-400 text-sm">
          Add a shoot location to enable weather intelligence and feasibility scoring.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl p-6 border-2 border-blue-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            🌍 Field Intelligence
          </h3>
          <p className="text-blue-200 text-sm mt-1">
            {project.shootLocationCity}, {project.shootLocationCountry}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getFeasibilityColor(feasibilityScore)}`}>
            {feasibilityScore}
          </div>
          <div className="text-xs text-blue-300">Feasibility Score</div>
          {project.fieldIntelligenceLastUpdated && (
            <div className="text-xs text-blue-400 mt-1">
              Updated {new Date(project.fieldIntelligenceLastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Feasibility Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-blue-950 h-4 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getFeasibilityBgColor(feasibilityScore)}`}
            style={{ width: `${feasibilityScore}%` }}
          />
        </div>
      </div>

      {/* Weather Data */}
      {weatherData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-950/50 rounded-lg p-3">
            <div className="text-xs text-blue-300 mb-1">Temperature</div>
            <div className="text-2xl font-bold text-white">
              {Math.round(weatherData.current.temp)}°C
            </div>
            <div className="text-xs text-blue-400">
              Feels like {Math.round(weatherData.current.feels_like)}°C
            </div>
          </div>
          <div className="bg-blue-950/50 rounded-lg p-3">
            <div className="text-xs text-blue-300 mb-1">Wind</div>
            <div className="text-2xl font-bold text-white">
              {Math.round(weatherData.current.wind_speed)} m/s
            </div>
            <div className="text-xs text-blue-400">
              {weatherData.current.wind_speed > 10 ? '⚠️ High' : '✓ Normal'}
            </div>
          </div>
          <div className="bg-blue-950/50 rounded-lg p-3">
            <div className="text-xs text-blue-300 mb-1">Humidity</div>
            <div className="text-2xl font-bold text-white">
              {weatherData.current.humidity}%
            </div>
          </div>
          <div className="bg-blue-950/50 rounded-lg p-3">
            <div className="text-xs text-blue-300 mb-1">Conditions</div>
            <div className="text-sm font-bold text-white capitalize">
              {weatherData.current.weather[0]?.description || 'Unknown'}
            </div>
          </div>
        </div>
      )}

      {/* Risk Alerts */}
      {riskAlerts.length > 0 && (
        <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4 mb-4">
          <div className="font-bold text-orange-200 mb-2">⚠️ Risk Alerts</div>
          <ul className="space-y-1">
            {riskAlerts.map((alert, index) => (
              <li key={index} className="text-orange-300 text-sm">
                {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Health Alerts */}
      {healthAlerts.length > 0 && (
        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-4">
          <div className="font-bold text-red-200 mb-2">🏥 Health & Safety Alerts</div>
          <ul className="space-y-1">
            {healthAlerts.map((alert, index) => (
              <li key={index} className="text-red-300 text-sm">
                {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-4">
          <div className="font-bold text-red-200 mb-1">Error</div>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchWeatherData}
        disabled={loading || !hasCoordinates}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Updating Field Intelligence...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Field Intelligence</span>
          </>
        )}
      </button>

      {!hasCoordinates && (
        <p className="text-blue-300 text-xs text-center mt-3">
          Note: Add GPS coordinates (lat,lng) to enable weather data
        </p>
      )}
    </div>
  );
}
