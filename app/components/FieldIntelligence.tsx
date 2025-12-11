"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * FIELD INTELLIGENCE WIDGET
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const ThermometerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
  </svg>
);

const WindIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
  </svg>
);

const DropletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>
);

const CloudIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const HeartPulseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6"/>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
    <path d="M3 22v-6h6"/>
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
  </svg>
);

const LoaderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

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
    pop: number;
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

  const calculateFeasibilityScore = (weather: WeatherData, project: Schema["Project"]["type"]): number => {
    let score = 100;

    const windSpeed = weather.current.wind_speed;
    if (windSpeed > 10) score -= 15;
    if (windSpeed > 15) score -= 10;

    const temp = weather.current.temp;
    if (temp < 0 || temp > 35) score -= 10;

    const humidity = weather.current.humidity;
    if (humidity > 80) score -= 5;

    const avgRainProbability = weather.daily.slice(0, 5).reduce((acc, day) => acc + day.pop, 0) / 5;
    if (avgRainProbability > 0.5) score -= 10;

    const productionStartDate = project.productionStartDate;
    if (productionStartDate) {
      const daysUntilShoot = Math.floor((new Date(productionStartDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilShoot < 7) score -= 15;
      if (daysUntilShoot < 3) score -= 10;
    }

    const greenlightComplete = project.greenlightProducerApproved &&
                                project.greenlightLegalApproved &&
                                project.greenlightFinanceApproved &&
                                project.greenlightExecutiveApproved;
    if (!greenlightComplete) score -= 20;
    if (!project.brief) score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  const generateRiskAlerts = (weather: WeatherData): string[] => {
    const alerts: string[] = [];

    if (weather.current.wind_speed > 10) {
      alerts.push(`High winds (${Math.round(weather.current.wind_speed)} m/s) - Drone filming may be unsafe`);
    }

    if (weather.current.temp < 0) {
      alerts.push(`Freezing temperatures (${Math.round(weather.current.temp)}°C) - Equipment protection required`);
    }

    if (weather.current.temp > 35) {
      alerts.push(`Extreme heat (${Math.round(weather.current.temp)}°C) - Crew safety & equipment cooling needed`);
    }

    const avgRainProbability = weather.daily.slice(0, 5).reduce((acc, day) => acc + day.pop, 0) / 5;
    if (avgRainProbability > 0.6) {
      alerts.push(`High rain probability (${Math.round(avgRainProbability * 100)}%) over next 5 days`);
    }

    if (weather.current.uvi > 8) {
      alerts.push(`Very high UV index (${weather.current.uvi}) - Sun protection essential for crew`);
    }

    return alerts;
  };

  const generateHealthAlerts = (weather: WeatherData): string[] => {
    const alerts: string[] = [];

    if (weather.current.temp > 32) {
      alerts.push(`Heat exhaustion risk - Ensure hydration and shade for crew`);
    }

    if (weather.current.temp < 5) {
      alerts.push(`Hypothermia risk - Ensure warm clothing and heated breaks`);
    }

    if (weather.current.humidity > 85) {
      alerts.push(`High humidity - Equipment condensation risk`);
    }

    return alerts;
  };

  const fetchWeatherData = async () => {
    if (!hasCoordinates) {
      setError("No shoot location coordinates set. Please add location first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [lat, lng] = project.shootLocationCoordinates!.split(',');
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

      if (!apiKey) {
        throw new Error('OpenWeatherMap API key not configured. Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to your .env.local file.');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data: WeatherData = await response.json();
      setWeatherData(data);

      const feasibilityScore = calculateFeasibilityScore(data, project);
      const riskAlerts = generateRiskAlerts(data);
      const healthAlerts = generateHealthAlerts(data);

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

  const getFeasibilityColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    if (score >= 40) return '#F97316'; // orange
    return 'var(--error)';
  };

  if (!hasLocation) {
    return (
      <div
        className="rounded-[12px] p-6"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span style={{ color: 'var(--primary)' }}><GlobeIcon /></span>
          <h3 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Field Intelligence
          </h3>
        </div>
        <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>
          Add a shoot location to enable weather intelligence and feasibility scoring.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[12px] p-6"
      style={{
        background: 'linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)',
        border: '2px solid var(--primary)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[20px] font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--primary)' }}><GlobeIcon /></span>
            Field Intelligence
          </h3>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            {project.shootLocationCity}, {project.shootLocationCountry}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[36px] font-bold" style={{ color: getFeasibilityColor(feasibilityScore) }}>
            {feasibilityScore}
          </div>
          <div className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
            Feasibility Score
          </div>
          {project.fieldIntelligenceLastUpdated && (
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Updated {new Date(project.fieldIntelligenceLastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Feasibility Progress Bar */}
      <div className="mb-6">
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-2)' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${feasibilityScore}%`,
              background: getFeasibilityColor(feasibilityScore),
            }}
          />
        </div>
      </div>

      {/* Weather Data */}
      {weatherData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            className="rounded-[10px] p-4"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: 'var(--primary)' }}><ThermometerIcon /></span>
              <span className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                Temperature
              </span>
            </div>
            <div className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {Math.round(weatherData.current.temp)}°C
            </div>
            <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              Feels like {Math.round(weatherData.current.feels_like)}°C
            </div>
          </div>

          <div
            className="rounded-[10px] p-4"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: 'var(--primary)' }}><WindIcon /></span>
              <span className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                Wind
              </span>
            </div>
            <div className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {Math.round(weatherData.current.wind_speed)} m/s
            </div>
            <div
              className="text-[12px]"
              style={{ color: weatherData.current.wind_speed > 10 ? 'var(--warning)' : 'var(--success)' }}
            >
              {weatherData.current.wind_speed > 10 ? 'High' : 'Normal'}
            </div>
          </div>

          <div
            className="rounded-[10px] p-4"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: 'var(--primary)' }}><DropletIcon /></span>
              <span className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                Humidity
              </span>
            </div>
            <div className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {weatherData.current.humidity}%
            </div>
          </div>

          <div
            className="rounded-[10px] p-4"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: 'var(--primary)' }}><CloudIcon /></span>
              <span className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                Conditions
              </span>
            </div>
            <div className="text-[14px] font-bold capitalize" style={{ color: 'var(--text-primary)' }}>
              {weatherData.current.weather[0]?.description || 'Unknown'}
            </div>
          </div>
        </div>
      )}

      {/* Risk Alerts */}
      {riskAlerts.length > 0 && (
        <div
          className="rounded-[10px] p-4 mb-4"
          style={{ background: 'var(--warning-muted)', border: '1px solid var(--warning)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: 'var(--warning)' }}><AlertTriangleIcon /></span>
            <span className="font-bold text-[14px]" style={{ color: 'var(--warning)' }}>
              Risk Alerts
            </span>
          </div>
          <ul className="space-y-1">
            {riskAlerts.map((alert, index) => (
              <li key={index} className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                • {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Health Alerts */}
      {healthAlerts.length > 0 && (
        <div
          className="rounded-[10px] p-4 mb-4"
          style={{ background: 'var(--error-muted)', border: '1px solid var(--error)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: 'var(--error)' }}><HeartPulseIcon /></span>
            <span className="font-bold text-[14px]" style={{ color: 'var(--error)' }}>
              Health & Safety Alerts
            </span>
          </div>
          <ul className="space-y-1">
            {healthAlerts.map((alert, index) => (
              <li key={index} className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                • {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          className="rounded-[10px] p-4 mb-4"
          style={{ background: 'var(--error-muted)', border: '1px solid var(--error)' }}
        >
          <div className="font-bold text-[14px] mb-1" style={{ color: 'var(--error)' }}>
            Error
          </div>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchWeatherData}
        disabled={loading || !hasCoordinates}
        className="w-full py-3 px-6 rounded-[6px] font-semibold text-[14px] flex items-center justify-center gap-3 transition-all duration-[80ms] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
      >
        {loading ? (
          <>
            <LoaderIcon />
            <span>Updating Field Intelligence...</span>
          </>
        ) : (
          <>
            <RefreshIcon />
            <span>Refresh Field Intelligence</span>
          </>
        )}
      </button>

      {!hasCoordinates && (
        <p className="text-[12px] text-center mt-3" style={{ color: 'var(--text-tertiary)' }}>
          Note: Add GPS coordinates (lat,lng) to enable weather data
        </p>
      )}
    </div>
  );
}
