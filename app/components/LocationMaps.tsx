'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useToast } from './Toast';

type Project = Schema['Project']['type'];

interface LocationMapsProps {
  projectId: string;
  project: Project;
  currentUserEmail: string;
}

interface ProductionLocation {
  id: string;
  projectId: string;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  latitude: number;
  longitude: number;
  locationType: 'PRIMARY' | 'SECONDARY' | 'BASE_CAMP' | 'UNIT_BASE' | 'CATERING' | 'PARKING' | 'CREW_PARKING' | 'EQUIPMENT' | 'OTHER';
  description?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  permitRequired?: boolean | null;
  permitStatus?: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'DENIED' | null;
  permitNumber?: string | null;
  locationFee?: number | null;
  shootDates?: string[] | null;
  notes?: string | null;
  photos?: string[] | null;
  isActive?: boolean | null;
  createdAt?: string | null;
}

interface DistanceResult {
  from: string;
  to: string;
  distance: number; // in kilometers
  duration: number; // in minutes
  distanceText: string;
  durationText: string;
}

const LOCATION_TYPES = {
  PRIMARY: { label: 'Primary Location', icon: '🎬', color: 'bg-red-500' },
  SECONDARY: { label: 'Secondary Location', icon: '📍', color: 'bg-orange-500' },
  BASE_CAMP: { label: 'Base Camp', icon: '🏕️', color: 'bg-green-500' },
  UNIT_BASE: { label: 'Unit Base', icon: '🚐', color: 'bg-blue-500' },
  CATERING: { label: 'Catering', icon: '🍽️', color: 'bg-yellow-500' },
  PARKING: { label: 'Parking', icon: '🅿️', color: 'bg-purple-500' },
  CREW_PARKING: { label: 'Crew Parking', icon: '🚗', color: 'bg-indigo-500' },
  EQUIPMENT: { label: 'Equipment Storage', icon: '📦', color: 'bg-teal-500' },
  OTHER: { label: 'Other', icon: '📌', color: 'bg-slate-500' },
};

const PERMIT_STATUS_CONFIG = {
  NOT_REQUIRED: { label: 'Not Required', color: 'bg-slate-500' },
  PENDING: { label: 'Pending', color: 'bg-yellow-500' },
  APPROVED: { label: 'Approved', color: 'bg-green-500' },
  DENIED: { label: 'Denied', color: 'bg-red-500' },
};

export default function LocationMaps({ projectId, project, currentUserEmail }: LocationMapsProps) {
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [locations, setLocations] = useState<ProductionLocation[]>([]);

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'distances' | 'route'>('map');
  const [selectedLocation, setSelectedLocation] = useState<ProductionLocation | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [distances, setDistances] = useState<DistanceResult[]>([]);
  const [calculatingDistances, setCalculatingDistances] = useState(false);
  const [selectedLocationsForRoute, setSelectedLocationsForRoute] = useState<string[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ totalDistance: string; totalDuration: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // New location form
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    latitude: 0,
    longitude: 0,
    locationType: 'PRIMARY' as ProductionLocation['locationType'],
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    permitRequired: false,
    permitStatus: 'NOT_REQUIRED' as ProductionLocation['permitStatus'],
    locationFee: '',
    notes: '',
  });

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => setMapLoaded(true));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => console.error('Failed to load Google Maps');
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const defaultCenter = { lat: 34.0522, lng: -118.2437 }; // Los Angeles

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 10,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      map: mapInstanceRef.current,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#14b8a6',
        strokeWeight: 4,
      },
    });
  }, [mapLoaded]);

  // Setup autocomplete
  useEffect(() => {
    if (!mapLoaded || !searchInputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
      types: ['establishment', 'geocode'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setNewLocation(prev => ({
          ...prev,
          name: place.name || '',
          address: place.formatted_address || '',
          latitude: lat,
          longitude: lng,
          city: place.address_components?.find(c => c.types.includes('locality'))?.long_name || '',
          state: place.address_components?.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '',
          country: place.address_components?.find(c => c.types.includes('country'))?.long_name || '',
          postalCode: place.address_components?.find(c => c.types.includes('postal_code'))?.long_name || '',
        }));

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(15);
        }
      }
    });
  }, [mapLoaded, showAddModal]);

  // Load locations (mock data for now - would come from database)
  useEffect(() => {
    setIsLoading(true);

    // Mock locations based on project data
    const mockLocations: ProductionLocation[] = [];

    if (project.shootLocationCity && project.shootLocationCountry) {
      mockLocations.push({
        id: 'primary-1',
        projectId,
        name: 'Primary Shoot Location',
        address: `${project.shootLocationCity}, ${project.shootLocationCountry}`,
        city: project.shootLocationCity || undefined,
        country: project.shootLocationCountry || undefined,
        latitude: 34.0522, // Default LA coordinates
        longitude: -118.2437,
        locationType: 'PRIMARY',
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    }

    setLocations(mockLocations);
    setIsLoading(false);
  }, [projectId, project]);

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null as any));
    markersRef.current = [];

    // Add markers for each location
    locations.forEach(location => {
      const typeConfig = LOCATION_TYPES[location.locationType] || LOCATION_TYPES.OTHER;

      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: mapInstanceRef.current || undefined,
        title: location.name,
        label: {
          text: typeConfig.icon,
          fontSize: '20px',
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #1e293b; padding: 8px; max-width: 250px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${location.name}</h3>
            <p style="font-size: 12px; color: #64748b;">${location.address}</p>
            <p style="font-size: 11px; margin-top: 4px;">
              <span style="background: ${typeConfig.color.replace('bg-', '')}; padding: 2px 6px; border-radius: 4px; color: white;">
                ${typeConfig.label}
              </span>
            </p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current || undefined, marker);
        setSelectedLocation(location);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if multiple locations
    if (locations.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      locations.forEach(loc => bounds.extend({ lat: loc.latitude, lng: loc.longitude }));
      mapInstanceRef.current.fitBounds(bounds);
    } else if (locations.length === 1) {
      mapInstanceRef.current.setCenter({ lat: locations[0].latitude, lng: locations[0].longitude });
      mapInstanceRef.current.setZoom(14);
    }
  }, [locations, mapLoaded]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location Not Supported', 'Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
          mapInstanceRef.current.setZoom(15);

          // Add user location marker
          new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: mapInstanceRef.current,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Location Error', 'Unable to get your location. Please check your permissions.');
      }
    );
  };

  // Calculate distances between all locations
  const calculateAllDistances = async () => {
    if (locations.length < 2 || !mapLoaded) return;

    setCalculatingDistances(true);
    const results: DistanceResult[] = [];
    const service = new google.maps.DistanceMatrixService();

    const origins = locations.map(l => ({ lat: l.latitude, lng: l.longitude }));
    const destinations = locations.map(l => ({ lat: l.latitude, lng: l.longitude }));

    try {
      const response = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
        service.getDistanceMatrix({
          origins,
          destinations,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        }, (response, status) => {
          if (status === 'OK' && response) {
            resolve(response);
          } else {
            reject(new Error(status));
          }
        });
      });

      for (let i = 0; i < locations.length; i++) {
        for (let j = i + 1; j < locations.length; j++) {
          const element = response.rows[i].elements[j];
          if (element.status === 'OK') {
            results.push({
              from: locations[i].name,
              to: locations[j].name,
              distance: element.distance.value / 1000, // Convert to km
              duration: element.duration.value / 60, // Convert to minutes
              distanceText: element.distance.text,
              durationText: element.duration.text,
            });
          }
        }
      }

      setDistances(results);
    } catch (error) {
      console.error('Error calculating distances:', error);
      toast.error('Calculation Failed', 'Failed to calculate distances. Please try again.');
    } finally {
      setCalculatingDistances(false);
    }
  };

  // Calculate route between selected locations
  const calculateRoute = async () => {
    if (selectedLocationsForRoute.length < 2 || !mapLoaded || !directionsRendererRef.current) return;

    const directionsService = new google.maps.DirectionsService();
    const selectedLocs = selectedLocationsForRoute.map(id => locations.find(l => l.id === id)!);

    const origin = { lat: selectedLocs[0].latitude, lng: selectedLocs[0].longitude };
    const destination = { lat: selectedLocs[selectedLocs.length - 1].latitude, lng: selectedLocs[selectedLocs.length - 1].longitude };
    const waypoints = selectedLocs.slice(1, -1).map(loc => ({
      location: { lat: loc.latitude, lng: loc.longitude },
      stopover: true,
    }));

    try {
      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route({
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        }, (result, status) => {
          if (status === 'OK' && result) {
            resolve(result);
          } else {
            reject(new Error(status));
          }
        });
      });

      directionsRendererRef.current.setDirections(result);

      // Calculate total distance and duration
      let totalDistance = 0;
      let totalDuration = 0;
      result.routes[0].legs.forEach(leg => {
        totalDistance += leg.distance?.value || 0;
        totalDuration += leg.duration?.value || 0;
      });

      setRouteInfo({
        totalDistance: `${(totalDistance / 1000).toFixed(1)} km`,
        totalDuration: `${Math.round(totalDuration / 60)} min`,
      });
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Route Calculation Failed', 'Failed to calculate route. Please try again.');
    }
  };

  // Clear route
  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
    }
    setSelectedLocationsForRoute([]);
    setRouteInfo(null);
  };

  // Add new location
  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.address || !newLocation.latitude) {
      toast.warning('Missing Information', 'Please fill in required fields and select a location from the map');
      return;
    }

    const location: ProductionLocation = {
      id: `loc-${Date.now()}`,
      projectId,
      name: newLocation.name,
      address: newLocation.address,
      city: newLocation.city || null,
      state: newLocation.state || null,
      country: newLocation.country || null,
      postalCode: newLocation.postalCode || null,
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      locationType: newLocation.locationType,
      description: newLocation.description || null,
      contactName: newLocation.contactName || null,
      contactPhone: newLocation.contactPhone || null,
      contactEmail: newLocation.contactEmail || null,
      permitRequired: newLocation.permitRequired,
      permitStatus: newLocation.permitStatus,
      locationFee: newLocation.locationFee ? parseFloat(newLocation.locationFee) : null,
      notes: newLocation.notes || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setLocations(prev => [...prev, location]);
    setShowAddModal(false);
    setNewLocation({
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      latitude: 0,
      longitude: 0,
      locationType: 'PRIMARY',
      description: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      permitRequired: false,
      permitStatus: 'NOT_REQUIRED',
      locationFee: '',
      notes: '',
    });
  };

  // Filter locations
  const filteredLocations = useMemo(() => {
    if (!searchQuery) return locations;
    const query = searchQuery.toLowerCase();
    return locations.filter(loc =>
      loc.name.toLowerCase().includes(query) ||
      loc.address.toLowerCase().includes(query) ||
      loc.city?.toLowerCase().includes(query)
    );
  }, [locations, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: locations.length,
      primary: locations.filter(l => l.locationType === 'PRIMARY').length,
      pendingPermits: locations.filter(l => l.permitStatus === 'PENDING').length,
      totalFees: locations.reduce((sum, l) => sum + (l.locationFee || 0), 0),
    };
  }, [locations]);

  const tabs = [
    { id: 'map', label: 'Map View', icon: '🗺️' },
    { id: 'list', label: 'Location List', icon: '📋' },
    { id: 'distances', label: 'Distances', icon: '📏' },
    { id: 'route', label: 'Route Planner', icon: '🚗' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Location Maps</h2>
          <p className="text-slate-400 mt-1">Manage production locations with GPS and distance calculations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <span>📍</span> My Location
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
          >
            + Add Location
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Total Locations</span>
            <span className="text-2xl">📍</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Primary Locations</span>
            <span className="text-2xl">🎬</span>
          </div>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.primary}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Pending Permits</span>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pendingPermits}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Total Location Fees</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-teal-400 mt-1">${stats.totalFees.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Map View */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Map Container */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {!mapLoaded ? (
              <div className="h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-slate-400">Loading map...</p>
                  {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                    <p className="text-yellow-400 text-sm mt-2">
                      Note: Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable Google Maps
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div ref={mapRef} className="h-[500px] w-full" />
            )}
          </div>

          {/* Location Legend */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(LOCATION_TYPES).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1 text-sm text-slate-400">
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
          />

          {filteredLocations.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
              <span className="text-6xl">📍</span>
              <h3 className="text-xl font-bold text-white mt-4">No Locations Yet</h3>
              <p className="text-slate-400 mt-2">Add your first production location to get started</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
              >
                + Add Location
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLocations.map(location => {
                const typeConfig = LOCATION_TYPES[location.locationType];
                const permitConfig = location.permitStatus ? PERMIT_STATUS_CONFIG[location.permitStatus] : null;

                return (
                  <div
                    key={location.id}
                    className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-teal-500/50 transition-colors"
                  >
                    <div className={`${typeConfig.color} px-4 py-2 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{typeConfig.icon}</span>
                        <span className="text-white font-bold text-sm">{typeConfig.label}</span>
                      </div>
                      {permitConfig && (
                        <span className={`${permitConfig.color} px-2 py-0.5 rounded text-xs font-bold text-white`}>
                          {permitConfig.label}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white">{location.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{location.address}</p>

                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                        <span>📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                        {location.locationFee && (
                          <span className="text-teal-400">${location.locationFee.toLocaleString()}</span>
                        )}
                      </div>

                      {location.contactName && (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          <p className="text-sm text-slate-400">
                            <span className="font-medium text-white">{location.contactName}</span>
                            {location.contactPhone && <span className="ml-2">{location.contactPhone}</span>}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => {
                            if (mapInstanceRef.current) {
                              mapInstanceRef.current.setCenter({ lat: location.latitude, lng: location.longitude });
                              mapInstanceRef.current.setZoom(16);
                              setActiveTab('map');
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg"
                        >
                          View on Map
                        </button>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg"
                        >
                          Get Directions
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Distances Tab */}
      {activeTab === 'distances' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-slate-400">Calculate driving distances between all locations</p>
            <button
              onClick={calculateAllDistances}
              disabled={locations.length < 2 || calculatingDistances}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
            >
              {calculatingDistances ? 'Calculating...' : 'Calculate Distances'}
            </button>
          </div>

          {distances.length > 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">From</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">To</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase">Distance</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase">Drive Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {distances.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-700/50">
                      <td className="px-4 py-3 text-sm text-white">{d.from}</td>
                      <td className="px-4 py-3 text-sm text-white">{d.to}</td>
                      <td className="px-4 py-3 text-sm text-teal-400 text-right">{d.distanceText}</td>
                      <td className="px-4 py-3 text-sm text-slate-300 text-right">{d.durationText}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
              <span className="text-6xl">📏</span>
              <h3 className="text-xl font-bold text-white mt-4">Distance Calculator</h3>
              <p className="text-slate-400 mt-2">
                {locations.length < 2
                  ? 'Add at least 2 locations to calculate distances'
                  : 'Click "Calculate Distances" to see driving times between locations'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Route Planner Tab */}
      {activeTab === 'route' && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="font-bold text-white mb-3">Select Locations for Route</h3>
            <div className="space-y-2">
              {locations.map(location => (
                <label key={location.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLocationsForRoute.includes(location.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLocationsForRoute(prev => [...prev, location.id]);
                      } else {
                        setSelectedLocationsForRoute(prev => prev.filter(id => id !== location.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
                  />
                  <span className="text-xl">{LOCATION_TYPES[location.locationType].icon}</span>
                  <span className="text-white">{location.name}</span>
                  <span className="text-xs text-slate-500">{location.address}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={calculateRoute}
                disabled={selectedLocationsForRoute.length < 2}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
              >
                Calculate Route
              </button>
              <button
                onClick={clearRoute}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium"
              >
                Clear Route
              </button>
            </div>

            {routeInfo && (
              <div className="mt-4 p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                <h4 className="font-bold text-teal-400 mb-2">Route Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Total Distance</p>
                    <p className="text-xl font-bold text-white">{routeInfo.totalDistance}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Estimated Time</p>
                    <p className="text-xl font-bold text-white">{routeInfo.totalDuration}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Route Map */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {!mapLoaded ? (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-slate-400">Loading map...</p>
              </div>
            ) : (
              <div ref={mapRef} className="h-[400px] w-full" />
            )}
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Production Location</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Location Search */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Search Location</label>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for a place or address..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                />
                <p className="text-xs text-slate-500 mt-1">Start typing to search for locations using Google Places</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-400 mb-1">Location Name *</label>
                  <input
                    type="text"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Downtown Studio"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-400 mb-1">Address *</label>
                  <input
                    type="text"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Full address"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Location Type</label>
                  <select
                    value={newLocation.locationType}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, locationType: e.target.value as ProductionLocation['locationType'] }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    {Object.entries(LOCATION_TYPES).map(([key, config]) => (
                      <option key={key} value={key}>{config.icon} {config.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Location Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={newLocation.locationFee}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, locationFee: e.target.value }))}
                      placeholder="0.00"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    value={newLocation.latitude || ''}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                    step="0.0001"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    value={newLocation.longitude || ''}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                    step="0.0001"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              {/* Permit Section */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-bold text-slate-300 mb-3">Permit Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newLocation.permitRequired}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, permitRequired: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-600 text-teal-500"
                    />
                    <span className="text-sm text-slate-300">Permit Required</span>
                  </label>

                  {newLocation.permitRequired && (
                    <select
                      value={newLocation.permitStatus || 'PENDING'}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, permitStatus: e.target.value as ProductionLocation['permitStatus'] }))}
                      className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
                    >
                      {Object.entries(PERMIT_STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Contact Section */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-bold text-slate-300 mb-3">Contact Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={newLocation.contactName}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Contact Name"
                    className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
                  />
                  <input
                    type="tel"
                    value={newLocation.contactPhone}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="Phone"
                    className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
                  />
                  <input
                    type="email"
                    value={newLocation.contactEmail}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="Email"
                    className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Notes</label>
                <textarea
                  value={newLocation.notes}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this location..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLocation}
                disabled={!newLocation.name || !newLocation.address}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium"
              >
                Add Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
