// Google Maps TypeScript declarations
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      fitBounds(bounds: LatLngBounds): void;
      getCenter(): LatLng | null;
      getZoom(): number;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: () => void): MapsEventListener;
      getPosition(): LatLng | null;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map, anchor?: Marker): void;
      close(): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor();
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
    }

    class DirectionsService {
      route(
        request: DirectionsRequest,
        callback: (result: DirectionsResult | null, status: DirectionsStatus) => void
      ): void;
    }

    class DirectionsRenderer {
      constructor(opts?: DirectionsRendererOptions);
      setDirections(directions: DirectionsResult | { routes: [] }): void;
      setMap(map: Map | null): void;
    }

    class DistanceMatrixService {
      getDistanceMatrix(
        request: DistanceMatrixRequest,
        callback: (response: DistanceMatrixResponse | null, status: DistanceMatrixStatus) => void
      ): void;
    }

    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
        addListener(eventName: string, handler: () => void): MapsEventListener;
        getPlace(): PlaceResult;
      }

      interface PlaceResult {
        name?: string;
        formatted_address?: string;
        geometry?: {
          location: LatLng;
        };
        address_components?: Array<{
          long_name: string;
          short_name: string;
          types: string[];
        }>;
      }

      interface AutocompleteOptions {
        types?: string[];
        componentRestrictions?: { country: string | string[] };
      }
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      styles?: MapTypeStyle[];
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      label?: string | MarkerLabel;
      icon?: string | Icon | Symbol;
    }

    interface MarkerLabel {
      text: string;
      fontSize?: string;
      fontWeight?: string;
      color?: string;
    }

    interface Icon {
      url: string;
      scaledSize?: Size;
    }

    interface Symbol {
      path: SymbolPath | string;
      scale?: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeWeight?: number;
    }

    enum SymbolPath {
      CIRCLE = 0,
      FORWARD_CLOSED_ARROW = 1,
      FORWARD_OPEN_ARROW = 2,
      BACKWARD_CLOSED_ARROW = 3,
      BACKWARD_OPEN_ARROW = 4,
    }

    class Size {
      constructor(width: number, height: number);
    }

    interface InfoWindowOptions {
      content?: string | Element;
      position?: LatLng | LatLngLiteral;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapTypeStyle {
      elementType?: string;
      featureType?: string;
      stylers: Array<{ [key: string]: string | number }>;
    }

    interface DirectionsRequest {
      origin: LatLng | LatLngLiteral | string;
      destination: LatLng | LatLngLiteral | string;
      waypoints?: DirectionsWaypoint[];
      optimizeWaypoints?: boolean;
      travelMode: TravelMode;
    }

    interface DirectionsWaypoint {
      location: LatLng | LatLngLiteral | string;
      stopover?: boolean;
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      legs: DirectionsLeg[];
    }

    interface DirectionsLeg {
      distance?: Distance;
      duration?: Duration;
    }

    interface Distance {
      text: string;
      value: number;
    }

    interface Duration {
      text: string;
      value: number;
    }

    type DirectionsStatus = 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' | 'MAX_WAYPOINTS_EXCEEDED' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';

    interface DirectionsRendererOptions {
      map?: Map;
      suppressMarkers?: boolean;
      polylineOptions?: PolylineOptions;
    }

    interface PolylineOptions {
      strokeColor?: string;
      strokeWeight?: number;
      strokeOpacity?: number;
    }

    interface DistanceMatrixRequest {
      origins: (LatLng | LatLngLiteral | string)[];
      destinations: (LatLng | LatLngLiteral | string)[];
      travelMode: TravelMode;
      unitSystem?: UnitSystem;
    }

    interface DistanceMatrixResponse {
      rows: DistanceMatrixResponseRow[];
      originAddresses: string[];
      destinationAddresses: string[];
    }

    interface DistanceMatrixResponseRow {
      elements: DistanceMatrixResponseElement[];
    }

    interface DistanceMatrixResponseElement {
      status: DistanceMatrixElementStatus;
      distance: Distance;
      duration: Duration;
    }

    type DistanceMatrixStatus = 'OK' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';
    type DistanceMatrixElementStatus = 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS';

    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT',
    }

    enum UnitSystem {
      METRIC = 0,
      IMPERIAL = 1,
    }

    interface MapsEventListener {
      remove(): void;
    }
  }
}

interface Window {
  google: typeof google;
}
