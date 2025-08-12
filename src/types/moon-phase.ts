export interface SunData {
  sunrise: number;
  sunrise_timestamp: string;
  sunset: number;
  sunset_timestamp: string;
  solar_noon: string;
  day_length: string;
  sun_altitude: number;
  sun_distance: number;
  sun_azimuth: number;
  next_solar_eclipse: {
    timestamp: number;
    datestamp: string;
    type: string;
    visibility_regions: string;
  };
}

export interface MoonData {
  phase: number;
  phase_name: string;
  stage: 'waxing' | 'waning';
  illumination: string;
  age_days: number;
  lunar_cycle: string;
  emoji: string;
  zodiac: {
    sun_sign: string;
    moon_sign: string;
  };
  moonrise: string;
  moonrise_timestamp: number;
  moonset: string;
  moonset_timestamp: number;
  moon_altitude: number;
  moon_distance: number;
  moon_azimuth: number;
  moon_parallactic_angle: number;
  next_lunar_eclipse: {
    timestamp: number;
    datestamp: string;
    type: string;
    visibility_regions: string;
  };
}

export interface MoonPhase {
  last: {
    timestamp: number;
    datestamp: string;
    days_ago: number;
    name?: string;
    description?: string;
  };
  next: {
    timestamp: number;
    datestamp: string;
    days_ahead: number;
    name?: string;
    description?: string;
  };
}

export interface MoonPhases {
  new_moon: MoonPhase;
  first_quarter: MoonPhase;
  full_moon: MoonPhase;
  last_quarter: MoonPhase;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface MoonPhaseApiResponse {
  timestamp: number;
  datestamp: string;
  sun: SunData;
  moon: MoonData;
  moon_phases: MoonPhases;
  location: LocationData;
}

export interface SpiritualSignificance {
  phase_name: string;
  keywords: string[];
  energy: string;
  practices: string[];
  manifestation_focus: string;
  release_focus: string;
  meditation_theme: string;
  ritual_suggestions: string[];
  colors: string[];
  crystals: string[];
  herbs: string[];
}

export interface MoonPhaseDisplayData extends MoonPhaseApiResponse {
  spiritual_significance: SpiritualSignificance;
  cached_at: number;
  next_update: number;
}

export interface MoonPhaseError {
  error: string;
  code?: string;
  retryAfter?: number;
}
