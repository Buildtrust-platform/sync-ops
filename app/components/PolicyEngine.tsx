"use client";

import { useState, useEffect, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * POLICY ENGINE MODULE (Section 4.3)
 *
 * Purpose: Ensure full legal, cultural, and operational compliance anywhere in the world
 *
 * Capabilities:
 * - Filming laws (country/city-specific)
 * - Drone legality
 * - Consent requirements
 * - Cultural sensitivities
 * - Noise/time filming restrictions
 * - Visa & work permit rules
 * - Insurance minimums
 * - Religious/political restrictions
 *
 * Output: Location Policy Brief + Required Documents Checklist
 */

// Filming Laws Database - Country/City Specific
const FILMING_LAWS_DATABASE: Record<string, FilmingLaws> = {
  // United States
  "US": {
    country: "United States",
    permitRequired: true,
    permitAuthority: "Local Film Commission",
    permitLeadTime: "2-4 weeks",
    publicSpaceRestrictions: "Permit required for commercial filming in public spaces",
    dronePolicy: {
      allowed: true,
      requiresLicense: true,
      licenseType: "FAA Part 107 Remote Pilot Certificate",
      restrictions: ["No flying over crowds", "Max altitude 400ft AGL", "Visual line of sight required", "No flying near airports without authorization"],
      nightFlying: "Requires waiver",
    },
    consentRequirements: {
      minors: "Written parental consent required",
      general: "Model releases recommended for identifiable individuals",
      propertyReleases: "Required for private property",
    },
    workPermits: {
      foreignCrewRequired: true,
      visaType: "O-1 or P-1 visa for talent, O-1B for crew",
      processingTime: "2-6 months",
    },
    insuranceMinimums: {
      generalLiability: "$1,000,000",
      workersComp: "Required by state law",
      equipmentCoverage: "Recommended",
    },
    noiseRestrictions: {
      residentialHours: "7:00 AM - 10:00 PM",
      commercialHours: "6:00 AM - 11:00 PM",
      decibelLimit: "65 dB at property line",
    },
    unionRules: ["SAG-AFTRA", "DGA", "IATSE"],
    specialNotes: "Union rules vary by production type and location",
  },

  // United Kingdom
  "GB": {
    country: "United Kingdom",
    permitRequired: true,
    permitAuthority: "Local Council Film Office",
    permitLeadTime: "3-6 weeks",
    publicSpaceRestrictions: "License required for commercial filming",
    dronePolicy: {
      allowed: true,
      requiresLicense: true,
      licenseType: "CAA Operational Authorization (PfCO/GVC)",
      restrictions: ["50m from people/buildings", "120m max altitude", "Visual line of sight", "No flying in restricted airspace"],
      nightFlying: "Special permission required",
    },
    consentRequirements: {
      minors: "Parental consent required, chaperone needed on set",
      general: "GDPR compliance required for identifiable individuals",
      propertyReleases: "Required for private property",
    },
    workPermits: {
      foreignCrewRequired: true,
      visaType: "Skilled Worker visa or Temporary Worker visa",
      processingTime: "3-8 weeks",
    },
    insuranceMinimums: {
      generalLiability: "£5,000,000",
      workersComp: "Employer's Liability Insurance required",
      equipmentCoverage: "Recommended",
    },
    noiseRestrictions: {
      residentialHours: "8:00 AM - 9:00 PM weekdays, 9:00 AM - 6:00 PM weekends",
      commercialHours: "7:00 AM - 10:00 PM",
      decibelLimit: "Environmental Protection Act standards",
    },
    unionRules: ["BECTU", "Equity"],
    specialNotes: "Brexit has changed work permit requirements for EU nationals",
  },

  // France
  "FR": {
    country: "France",
    permitRequired: true,
    permitAuthority: "Prefecture and Film France",
    permitLeadTime: "4-8 weeks",
    publicSpaceRestrictions: "Authorization required from local authorities",
    dronePolicy: {
      allowed: true,
      requiresLicense: true,
      licenseType: "DGAC Certification",
      restrictions: ["No flying over urban areas without authorization", "150m max altitude", "Respect no-fly zones"],
      nightFlying: "Special authorization required",
    },
    consentRequirements: {
      minors: "Parental consent + work authorization from Labor Inspector",
      general: "Right to image law - explicit consent required",
      propertyReleases: "Required, including for building facades",
    },
    workPermits: {
      foreignCrewRequired: true,
      visaType: "Temporary worker visa or Passport Talent",
      processingTime: "4-12 weeks",
    },
    insuranceMinimums: {
      generalLiability: "€5,000,000",
      workersComp: "Sécurité Sociale coverage required",
      equipmentCoverage: "Recommended",
    },
    noiseRestrictions: {
      residentialHours: "7:00 AM - 10:00 PM",
      commercialHours: "7:00 AM - 11:00 PM",
      decibelLimit: "Prefecture regulations apply",
    },
    unionRules: ["Intermittent du spectacle status required"],
    specialNotes: "35-hour work week applies, tax rebates available for qualifying productions",
  },

  // Germany
  "DE": {
    country: "Germany",
    permitRequired: true,
    permitAuthority: "Local Film Commission (Filmförderung)",
    permitLeadTime: "3-6 weeks",
    publicSpaceRestrictions: "Permit required for commercial filming in public spaces",
    dronePolicy: {
      allowed: true,
      requiresLicense: true,
      licenseType: "EU Drone License + National Authorization",
      restrictions: ["100m max altitude", "1.5km from airports", "No flying over crowds", "Special permits for urban areas"],
      nightFlying: "Not permitted without special authorization",
    },
    consentRequirements: {
      minors: "Parental consent + Jugendamt (youth office) approval",
      general: "Right to own image strictly enforced under GDPR",
      propertyReleases: "Required for private property and recognizable buildings",
    },
    workPermits: {
      foreignCrewRequired: true,
      visaType: "National visa for employment or EU Blue Card",
      processingTime: "4-8 weeks",
    },
    insuranceMinimums: {
      generalLiability: "€3,000,000",
      workersComp: "BG coverage required",
      equipmentCoverage: "Recommended",
    },
    noiseRestrictions: {
      residentialHours: "6:00 AM - 10:00 PM",
      commercialHours: "6:00 AM - 10:00 PM",
      decibelLimit: "TA Lärm technical instructions apply",
    },
    unionRules: ["ver.di union coverage common"],
    specialNotes: "Regional funding incentives (DFFF) available, strict noise regulations",
  },

  // Japan
  "JP": {
    country: "Japan",
    permitRequired: true,
    permitAuthority: "Local Ward Office (Kuyakusho) and Film Commission",
    permitLeadTime: "4-8 weeks",
    publicSpaceRestrictions: "Detailed permits required, often restricted in tourist areas",
    dronePolicy: {
      allowed: true,
      requiresLicense: true,
      licenseType: "MLIT Aviation Bureau Registration and Approval",
      restrictions: ["No flying in Densely Inhabited Districts (DID)", "150m max altitude", "Strict no-fly zones around airports", "Daytime only without special permit"],
      nightFlying: "Requires special approval",
    },
    consentRequirements: {
      minors: "Parental consent required, strict child labor laws",
      general: "Consent required under Portrait Rights law",
      propertyReleases: "Required for private property",
    },
    workPermits: {
      foreignCrewRequired: true,
      visaType: "Entertainer visa or Working visa",
      processingTime: "3-6 months",
    },
    insuranceMinimums: {
      generalLiability: "¥100,000,000",
      workersComp: "Required under Japanese law",
      equipmentCoverage: "Highly recommended",
    },
    noiseRestrictions: {
      residentialHours: "8:00 AM - 7:00 PM",
      commercialHours: "7:00 AM - 9:00 PM",
      decibelLimit: "45-60 dB depending on zone",
    },
    unionRules: ["Japanese Actor's Union considerations"],
    specialNotes: "Extremely strict about public disruption, interpreter required for permits",
  },

  // UAE (Dubai)
  "AE": {
    country: "United Arab Emirates",
    permitRequired: true,
    permitAuthority: "Dubai Film & TV Commission / National Media Council",
    permitLeadTime: "2-4 weeks",
    publicSpaceRestrictions: "All filming requires permit, even smartphone",
    dronePolicy: {
      allowed: true,
      requiresLicense: true,
      licenseType: "GCAA Drone Registration + Filming Permit",
      restrictions: ["Restricted in most urban areas", "No flying near government buildings", "Prior authorization required"],
      nightFlying: "Special permission required",
    },
    consentRequirements: {
      minors: "Parental consent required",
      general: "Cannot film individuals without consent",
      propertyReleases: "Required, especially for government/religious buildings",
    },
    workPermits: {
      foreignCrewRequired: true,
      visaType: "Media production visa",
      processingTime: "2-4 weeks with approved production company",
    },
    insuranceMinimums: {
      generalLiability: "$1,000,000 USD equivalent",
      workersComp: "Required",
      equipmentCoverage: "Required for rental equipment",
    },
    noiseRestrictions: {
      residentialHours: "7:00 AM - 10:00 PM",
      commercialHours: "6:00 AM - 11:00 PM",
      decibelLimit: "Municipality regulations apply",
    },
    unionRules: [],
    specialNotes: "Content must not offend public morals, religious sensitivities, or political views",
  },

  // Australia
  "AU": {
    country: "Australia",
    permitRequired: true,
    permitAuthority: "State Film Commission (Screen Australia)",
    permitLeadTime: "2-4 weeks",
    publicSpaceRestrictions: "Permit required for commercial filming, varies by state",
    dronePolicy: {
      allowed: true,
      requiresLicense: true,
      licenseType: "CASA RePL (Remote Pilot License)",
      restrictions: ["30m from people", "120m max altitude", "5.5km from airports", "Visual line of sight"],
      nightFlying: "Requires special approval",
    },
    consentRequirements: {
      minors: "Parental consent + entertainment industry child license",
      general: "Model releases recommended",
      propertyReleases: "Required for private property",
    },
    workPermits: {
      foreignCrewRequired: true,
      visaType: "Subclass 408 (Entertainment Activities)",
      processingTime: "2-4 weeks",
    },
    insuranceMinimums: {
      generalLiability: "$20,000,000 AUD",
      workersComp: "Required by state law",
      equipmentCoverage: "Recommended",
    },
    noiseRestrictions: {
      residentialHours: "7:00 AM - 8:00 PM weekdays, 9:00 AM - 8:00 PM weekends",
      commercialHours: "7:00 AM - 10:00 PM",
      decibelLimit: "EPA regulations apply",
    },
    unionRules: ["MEAA (Media Entertainment & Arts Alliance)"],
    specialNotes: "Producer Offset tax rebate available (40%), Location Offset (16.5%)",
  },

  // Canada
  "CA": {
    country: "Canada",
    permitRequired: true,
    permitAuthority: "Provincial Film Commission",
    permitLeadTime: "2-4 weeks",
    publicSpaceRestrictions: "Permit required, varies by province and municipality",
    dronePolicy: {
      allowed: true,
      requiresLicense: true,
      licenseType: "Transport Canada RPAS Certificate",
      restrictions: ["30m from people", "120m max altitude", "5.6km from airports", "SFOC for complex operations"],
      nightFlying: "Requires special approval",
    },
    consentRequirements: {
      minors: "Parental consent + provincial requirements",
      general: "Model releases recommended, PIPEDA compliance",
      propertyReleases: "Required for private property",
    },
    workPermits: {
      foreignCrewRequired: true,
      visaType: "Work permit (C-44 category for film)",
      processingTime: "2-8 weeks",
    },
    insuranceMinimums: {
      generalLiability: "$5,000,000 CAD",
      workersComp: "Required by province",
      equipmentCoverage: "Recommended",
    },
    noiseRestrictions: {
      residentialHours: "7:00 AM - 11:00 PM",
      commercialHours: "7:00 AM - 11:00 PM",
      decibelLimit: "Municipal bylaws apply",
    },
    unionRules: ["ACTRA", "DGC", "IATSE"],
    specialNotes: "Federal tax credit (25%) + provincial incentives (varies 25-45%)",
  },
};

// Cultural Sensitivities Database
const CULTURAL_SENSITIVITIES: Record<string, CulturalSensitivity> = {
  "AE": {
    religiousConsiderations: [
      "No filming during prayer times (5 times daily)",
      "Ramadan: Additional restrictions on public eating/drinking",
      "Friday is the holy day - reduced activity",
      "Modest dress required at all times",
      "No filming of mosques without special permission",
    ],
    politicalRestrictions: [
      "No criticism of government or ruling family",
      "No filming of government buildings without permit",
      "Content must respect UAE values and traditions",
    ],
    socialNorms: [
      "Public displays of affection not permitted",
      "Alcohol only in licensed premises",
      "Photography of women requires explicit consent",
      "LGBT+ content prohibited",
    ],
    holidays: ["Eid al-Fitr", "Eid al-Adha", "UAE National Day", "Islamic New Year"],
    riskLevel: "MEDIUM",
  },
  "JP": {
    religiousConsiderations: [
      "Remove shoes when entering temples/shrines",
      "No photography in sacred areas",
      "Respect for ancestors and memorial sites",
    ],
    politicalRestrictions: [
      "Avoid filming Self-Defense Force installations",
      "Sensitive about WWII imagery",
    ],
    socialNorms: [
      "Bow as greeting, avoid physical contact",
      "Quiet behavior in public expected",
      "No eating while walking",
      "Tipping is not practiced",
    ],
    holidays: ["Golden Week", "Obon", "New Year (Jan 1-3)"],
    riskLevel: "LOW",
  },
  "US": {
    religiousConsiderations: [
      "Diverse religious landscape - be inclusive",
      "Major Christian holidays may affect crew availability",
    ],
    politicalRestrictions: [
      "First Amendment protections for most content",
      "Some restrictions near military installations",
    ],
    socialNorms: [
      "Diverse cultural expectations vary by region",
      "Southern states more conservative",
      "Major sports events affect availability",
    ],
    holidays: ["Thanksgiving", "July 4th", "Memorial Day", "Labor Day"],
    riskLevel: "LOW",
  },
  "GB": {
    religiousConsiderations: [
      "Multicultural society - respect diversity",
      "Bank holidays reduce crew availability",
    ],
    politicalRestrictions: [
      "OFCOM broadcast regulations apply",
      "Royal family content requires care",
    ],
    socialNorms: [
      "Queuing is important",
      "Reserved communication style",
      "Sunday trading restrictions in some areas",
    ],
    holidays: ["Christmas/Boxing Day", "Easter", "Bank Holidays"],
    riskLevel: "LOW",
  },
  "FR": {
    religiousConsiderations: [
      "Secular state - religious symbols may be restricted",
      "Major Catholic holidays observed",
    ],
    politicalRestrictions: [
      "Strong privacy laws",
      "Building facade rights",
    ],
    socialNorms: [
      "Long lunch breaks traditional",
      "August is vacation month - limited availability",
      "Formal communication style",
    ],
    holidays: ["Bastille Day", "August vacation", "All Saints Day"],
    riskLevel: "LOW",
  },
  "DE": {
    religiousConsiderations: [
      "Religious tax applies to crew",
      "Sunday is rest day - strict noise laws",
    ],
    politicalRestrictions: [
      "Nazi imagery prohibited",
      "Holocaust denial criminal offense",
      "Strong data protection (GDPR)",
    ],
    socialNorms: [
      "Punctuality essential",
      "Direct communication style",
      "Environmental consciousness",
    ],
    holidays: ["Oktoberfest", "Christmas markets", "Regional holidays vary"],
    riskLevel: "LOW",
  },
};

// City-specific overrides
const CITY_OVERRIDES: Record<string, CityOverride> = {
  "New York City": {
    country: "US",
    additionalPermits: ["Mayor's Office of Media & Entertainment permit"],
    restrictions: ["Times Square requires special permit", "Central Park filming limited"],
    fees: "Starting at $300/day for standard permits",
    contacts: ["Mayor's Office of Media & Entertainment: +1 212-489-6710"],
  },
  "Los Angeles": {
    country: "US",
    additionalPermits: ["FilmLA permit required"],
    restrictions: ["Residential neighborhoods have strict hours", "Highway filming requires CHP coordination"],
    fees: "Starting at $625 for first day",
    contacts: ["FilmLA: +1 213-977-8600"],
  },
  "London": {
    country: "GB",
    additionalPermits: ["Individual borough permits may be required"],
    restrictions: ["Trafalgar Square and Parliament Square require special permits", "The Mall restricted"],
    fees: "Varies by borough, typically £500-2000/day",
    contacts: ["Film London: +44 20 7613 7676"],
  },
  "Paris": {
    country: "FR",
    additionalPermits: ["Paris Film Office authorization"],
    restrictions: ["Eiffel Tower night lighting copyrighted", "Champs-Élysées heavily restricted"],
    fees: "€500-3000/day depending on location",
    contacts: ["Mission Cinema Paris: +33 1 44 90 58 24"],
  },
  "Tokyo": {
    country: "JP",
    additionalPermits: ["Each ward (ku) requires separate permit"],
    restrictions: ["Shibuya Crossing highly restricted", "Train stations require JR approval"],
    fees: "¥50,000-500,000 depending on location",
    contacts: ["Tokyo Location Box: +81 3-5220-2961"],
  },
  "Dubai": {
    country: "AE",
    additionalPermits: ["Dubai Film & TV Commission permit mandatory"],
    restrictions: ["Burj Khalifa requires special permission", "Mall filming restricted"],
    fees: "AED 500-5000 depending on scope",
    contacts: ["Dubai Film: +971 4 319 0301"],
  },
  "Sydney": {
    country: "AU",
    additionalPermits: ["Screen NSW recommended"],
    restrictions: ["Opera House and Harbour Bridge require specific permits"],
    fees: "AUD 200-2000/day",
    contacts: ["Screen NSW: +61 2 8376 4400"],
  },
  "Toronto": {
    country: "CA",
    additionalPermits: ["Toronto Film & Television Office permit"],
    restrictions: ["CN Tower requires special permission", "Major roads require traffic control"],
    fees: "CAD 200-1000/day base fee",
    contacts: ["TIFF: +1 416-392-7570"],
  },
  "Vancouver": {
    country: "CA",
    additionalPermits: ["City of Vancouver Film Office permit"],
    restrictions: ["Stanley Park has specific rules", "Downtown core time restrictions"],
    fees: "CAD 150-800/day base fee",
    contacts: ["Vancouver Film Office: +1 604-871-6440"],
  },
};

// Type definitions
interface FilmingLaws {
  country: string;
  permitRequired: boolean;
  permitAuthority: string;
  permitLeadTime: string;
  publicSpaceRestrictions: string;
  dronePolicy: {
    allowed: boolean;
    requiresLicense: boolean;
    licenseType: string;
    restrictions: string[];
    nightFlying: string;
  };
  consentRequirements: {
    minors: string;
    general: string;
    propertyReleases: string;
  };
  workPermits: {
    foreignCrewRequired: boolean;
    visaType: string;
    processingTime: string;
  };
  insuranceMinimums: {
    generalLiability: string;
    workersComp: string;
    equipmentCoverage: string;
  };
  noiseRestrictions: {
    residentialHours: string;
    commercialHours: string;
    decibelLimit: string;
  };
  unionRules: string[];
  specialNotes: string;
}

interface CulturalSensitivity {
  religiousConsiderations: string[];
  politicalRestrictions: string[];
  socialNorms: string[];
  holidays: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

interface CityOverride {
  country: string;
  additionalPermits: string[];
  restrictions: string[];
  fees: string;
  contacts: string[];
}

interface PolicyBrief {
  location: {
    country: string;
    countryCode: string;
    city?: string;
  };
  filmingLaws: FilmingLaws | null;
  culturalSensitivity: CulturalSensitivity | null;
  citySpecific: CityOverride | null;
  documentChecklist: DocumentChecklistItem[];
  riskAssessment: {
    overallRisk: "LOW" | "MEDIUM" | "HIGH";
    riskFactors: string[];
    recommendations: string[];
  };
  generatedAt: string;
}

interface DocumentChecklistItem {
  document: string;
  required: boolean;
  leadTime: string;
  notes: string;
  category: "PERMIT" | "LEGAL" | "INSURANCE" | "VISA" | "CONSENT";
}

interface PolicyEngineProps {
  projectId: string;
  country?: string;
  city?: string;
  hasDrones?: boolean;
  hasMinors?: boolean;
  hasForeignCrew?: boolean;
  shootDate?: string;
  onPolicyGenerated?: (brief: PolicyBrief) => void;
}

export default function PolicyEngine({
  projectId,
  country,
  city,
  hasDrones = false,
  hasMinors = false,
  hasForeignCrew = false,
  shootDate,
  onPolicyGenerated,
}: PolicyEngineProps) {
  const [selectedCountry, setSelectedCountry] = useState(country || "");
  const [selectedCity, setSelectedCity] = useState(city || "");
  const [useDrones, setUseDrones] = useState(hasDrones);
  const [useMinors, setUseMinors] = useState(hasMinors);
  const [useForeignCrew, setUseForeignCrew] = useState(hasForeignCrew);
  const [policyBrief, setPolicyBrief] = useState<PolicyBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "laws" | "cultural" | "checklist">("overview");
  const [client] = useState(() => generateClient<Schema>());

  // Available countries from database
  const availableCountries = Object.keys(FILMING_LAWS_DATABASE).map((code) => ({
    code,
    name: FILMING_LAWS_DATABASE[code].country,
  }));

  // Available cities for selected country
  const availableCities = Object.entries(CITY_OVERRIDES)
    .filter(([_, info]) => info.country === selectedCountry)
    .map(([city]) => city);

  // Generate Policy Brief
  const generatePolicyBrief = useCallback(() => {
    if (!selectedCountry) return;

    setIsGenerating(true);

    const filmingLaws = FILMING_LAWS_DATABASE[selectedCountry] || null;
    const culturalSensitivity = CULTURAL_SENSITIVITIES[selectedCountry] || null;
    const citySpecific = selectedCity ? CITY_OVERRIDES[selectedCity] : null;

    // Generate document checklist based on selections
    const documentChecklist: DocumentChecklistItem[] = [];

    // Always required documents
    if (filmingLaws?.permitRequired) {
      documentChecklist.push({
        document: "Filming Permit",
        required: true,
        leadTime: filmingLaws.permitLeadTime,
        notes: `Apply through ${filmingLaws.permitAuthority}`,
        category: "PERMIT",
      });
    }

    // Insurance documents
    documentChecklist.push({
      document: "General Liability Insurance",
      required: true,
      leadTime: "1-2 weeks",
      notes: `Minimum coverage: ${filmingLaws?.insuranceMinimums.generalLiability || "Check local requirements"}`,
      category: "INSURANCE",
    });

    documentChecklist.push({
      document: "Workers Compensation",
      required: true,
      leadTime: "1 week",
      notes: filmingLaws?.insuranceMinimums.workersComp || "Required",
      category: "INSURANCE",
    });

    // Drone-specific documents
    if (useDrones && filmingLaws?.dronePolicy) {
      documentChecklist.push({
        document: "Drone Pilot License",
        required: filmingLaws.dronePolicy.requiresLicense,
        leadTime: "2-4 weeks for certification",
        notes: filmingLaws.dronePolicy.licenseType,
        category: "PERMIT",
      });

      documentChecklist.push({
        document: "Drone Flight Authorization",
        required: true,
        leadTime: "2-4 weeks",
        notes: "Required for commercial drone operations",
        category: "PERMIT",
      });

      documentChecklist.push({
        document: "Drone Insurance",
        required: true,
        leadTime: "1 week",
        notes: "Aviation liability insurance required",
        category: "INSURANCE",
      });
    }

    // Minor-specific documents
    if (useMinors && filmingLaws?.consentRequirements) {
      documentChecklist.push({
        document: "Parental Consent Forms",
        required: true,
        leadTime: "Before shoot",
        notes: filmingLaws.consentRequirements.minors,
        category: "CONSENT",
      });

      documentChecklist.push({
        document: "Child Work Permit",
        required: true,
        leadTime: "2-4 weeks",
        notes: "Required for minors working in film",
        category: "LEGAL",
      });

      documentChecklist.push({
        document: "Studio Teacher / Welfare Worker",
        required: true,
        leadTime: "Book 2 weeks ahead",
        notes: "Required when filming with minors",
        category: "LEGAL",
      });
    }

    // Foreign crew documents
    if (useForeignCrew && filmingLaws?.workPermits) {
      documentChecklist.push({
        document: "Work Visas",
        required: filmingLaws.workPermits.foreignCrewRequired,
        leadTime: filmingLaws.workPermits.processingTime,
        notes: filmingLaws.workPermits.visaType,
        category: "VISA",
      });

      documentChecklist.push({
        document: "Equipment Carnet (ATA)",
        required: true,
        leadTime: "2-4 weeks",
        notes: "For temporary import of equipment",
        category: "LEGAL",
      });
    }

    // Standard consent documents
    documentChecklist.push({
      document: "Model Releases",
      required: true,
      leadTime: "Before shoot",
      notes: filmingLaws?.consentRequirements.general || "Required for identifiable individuals",
      category: "CONSENT",
    });

    documentChecklist.push({
      document: "Location Releases / Property Agreements",
      required: true,
      leadTime: "1-2 weeks before shoot",
      notes: filmingLaws?.consentRequirements.propertyReleases || "Required for private property",
      category: "CONSENT",
    });

    // City-specific permits
    if (citySpecific) {
      citySpecific.additionalPermits.forEach((permit) => {
        documentChecklist.push({
          document: permit,
          required: true,
          leadTime: "2-4 weeks",
          notes: `City-specific requirement for ${selectedCity}`,
          category: "PERMIT",
        });
      });
    }

    // Calculate risk assessment
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    if (useDrones) {
      riskFactors.push("Drone operations increase regulatory complexity");
      recommendations.push("Hire certified drone operator with local experience");
    }

    if (useMinors) {
      riskFactors.push("Working with minors requires additional compliance");
      recommendations.push("Ensure welfare worker/studio teacher is booked");
    }

    if (useForeignCrew) {
      riskFactors.push("Foreign crew requires visa processing time");
      recommendations.push("Start visa applications immediately");
    }

    if (culturalSensitivity?.riskLevel === "MEDIUM" || culturalSensitivity?.riskLevel === "HIGH") {
      riskFactors.push("Location has cultural/religious sensitivities");
      recommendations.push("Hire local cultural advisor/fixer");
    }

    if (citySpecific && citySpecific.restrictions.length > 0) {
      riskFactors.push(`${selectedCity} has specific filming restrictions`);
      recommendations.push("Contact local film commission early");
    }

    const overallRisk: "LOW" | "MEDIUM" | "HIGH" =
      riskFactors.length >= 4 ? "HIGH" : riskFactors.length >= 2 ? "MEDIUM" : "LOW";

    const brief: PolicyBrief = {
      location: {
        country: filmingLaws?.country || selectedCountry,
        countryCode: selectedCountry,
        city: selectedCity || undefined,
      },
      filmingLaws,
      culturalSensitivity,
      citySpecific,
      documentChecklist,
      riskAssessment: {
        overallRisk,
        riskFactors,
        recommendations,
      },
      generatedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setPolicyBrief(brief);
      setIsGenerating(false);
      onPolicyGenerated?.(brief);
    }, 500);
  }, [selectedCountry, selectedCity, useDrones, useMinors, useForeignCrew, onPolicyGenerated]);

  // Auto-generate when parameters change
  useEffect(() => {
    if (selectedCountry) {
      generatePolicyBrief();
    }
  }, [selectedCountry, selectedCity, useDrones, useMinors, useForeignCrew, generatePolicyBrief]);

  // Risk level badge color
  const getRiskBadgeColor = (risk: "LOW" | "MEDIUM" | "HIGH") => {
    switch (risk) {
      case "LOW":
        return "bg-green-500 text-white";
      case "MEDIUM":
        return "bg-yellow-500 text-black";
      case "HIGH":
        return "bg-red-500 text-white";
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚖️</span>
          <div>
            <h2 className="text-xl font-black text-white">Policy Engine</h2>
            <p className="text-purple-200 text-sm">
              Location compliance & regulatory intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="p-6 border-b border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Shoot Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Country Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedCity("");
              }}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Country...</option>
              {availableCountries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">
              City (Optional)
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedCountry || availableCities.length === 0}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <option value="">Select City...</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Production Features */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-bold text-slate-400 mb-2">
              Production Features
            </label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={useDrones}
                  onChange={(e) => setUseDrones(e.target.checked)}
                  className="w-4 h-4 rounded accent-purple-500"
                />
                <span className="text-white text-sm">🚁 Drones</span>
              </label>
              <label className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={useMinors}
                  onChange={(e) => setUseMinors(e.target.checked)}
                  className="w-4 h-4 rounded accent-purple-500"
                />
                <span className="text-white text-sm">👶 Minors</span>
              </label>
              <label className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={useForeignCrew}
                  onChange={(e) => setUseForeignCrew(e.target.checked)}
                  className="w-4 h-4 rounded accent-purple-500"
                />
                <span className="text-white text-sm">🌍 Foreign Crew</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Brief Display */}
      {policyBrief && (
        <>
          {/* Risk Assessment Banner */}
          <div
            className={`px-6 py-3 ${
              policyBrief.riskAssessment.overallRisk === "HIGH"
                ? "bg-red-900/50 border-b border-red-700"
                : policyBrief.riskAssessment.overallRisk === "MEDIUM"
                ? "bg-yellow-900/50 border-b border-yellow-700"
                : "bg-green-900/50 border-b border-green-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskBadgeColor(policyBrief.riskAssessment.overallRisk)}`}>
                  {policyBrief.riskAssessment.overallRisk} RISK
                </span>
                <span className="text-white font-medium">
                  {policyBrief.location.city
                    ? `${policyBrief.location.city}, ${policyBrief.location.country}`
                    : policyBrief.location.country}
                </span>
              </div>
              <span className="text-slate-400 text-sm">
                Generated: {new Date(policyBrief.generatedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-700">
            {[
              { id: "overview", label: "Overview", icon: "📋" },
              { id: "laws", label: "Filming Laws", icon: "⚖️" },
              { id: "cultural", label: "Cultural", icon: "🌍" },
              { id: "checklist", label: "Checklist", icon: "✅" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Risk Factors */}
                {policyBrief.riskAssessment.riskFactors.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">⚠️ Risk Factors</h4>
                    <ul className="space-y-2">
                      {policyBrief.riskAssessment.riskFactors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-2 text-yellow-400">
                          <span>•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {policyBrief.riskAssessment.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">💡 Recommendations</h4>
                    <ul className="space-y-2">
                      {policyBrief.riskAssessment.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-green-400">
                          <span>→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-3xl font-black text-purple-400">
                      {policyBrief.documentChecklist.filter((d) => d.required).length}
                    </div>
                    <div className="text-sm text-slate-400">Required Documents</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-3xl font-black text-purple-400">
                      {policyBrief.filmingLaws?.permitLeadTime || "N/A"}
                    </div>
                    <div className="text-sm text-slate-400">Permit Lead Time</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-3xl font-black text-purple-400">
                      {policyBrief.filmingLaws?.unionRules.length || 0}
                    </div>
                    <div className="text-sm text-slate-400">Union Considerations</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-3xl font-black text-purple-400">
                      {policyBrief.citySpecific ? "Yes" : "No"}
                    </div>
                    <div className="text-sm text-slate-400">City-Specific Rules</div>
                  </div>
                </div>

                {/* City-Specific Info */}
                {policyBrief.citySpecific && (
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-white mb-3">🏙️ {selectedCity} Specific</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 text-sm">Fees:</span>
                        <p className="text-white">{policyBrief.citySpecific.fees}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Restrictions:</span>
                        <ul className="text-white">
                          {policyBrief.citySpecific.restrictions.map((r, i) => (
                            <li key={i}>• {r}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Contacts:</span>
                        <ul className="text-purple-400">
                          {policyBrief.citySpecific.contacts.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Filming Laws Tab */}
            {activeTab === "laws" && policyBrief.filmingLaws && (
              <div className="space-y-6">
                {/* Permits */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-3">📋 Permits</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Required:</span>
                      <span className="text-white ml-2">{policyBrief.filmingLaws.permitRequired ? "Yes" : "No"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Authority:</span>
                      <span className="text-white ml-2">{policyBrief.filmingLaws.permitAuthority}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Lead Time:</span>
                      <span className="text-white ml-2">{policyBrief.filmingLaws.permitLeadTime}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400">Public Spaces:</span>
                      <span className="text-white ml-2">{policyBrief.filmingLaws.publicSpaceRestrictions}</span>
                    </div>
                  </div>
                </div>

                {/* Drone Policy */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-3">🚁 Drone Policy</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${policyBrief.filmingLaws.dronePolicy.allowed ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                        {policyBrief.filmingLaws.dronePolicy.allowed ? "ALLOWED" : "PROHIBITED"}
                      </span>
                      {policyBrief.filmingLaws.dronePolicy.requiresLicense && (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500 text-black">
                          LICENSE REQUIRED
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">License Type:</span>
                      <p className="text-white">{policyBrief.filmingLaws.dronePolicy.licenseType}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Restrictions:</span>
                      <ul className="text-white">
                        {policyBrief.filmingLaws.dronePolicy.restrictions.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Night Flying:</span>
                      <span className="text-white ml-2">{policyBrief.filmingLaws.dronePolicy.nightFlying}</span>
                    </div>
                  </div>
                </div>

                {/* Insurance Requirements */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-3">🛡️ Insurance Minimums</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-slate-400 text-sm">General Liability:</span>
                      <p className="text-white font-bold">{policyBrief.filmingLaws.insuranceMinimums.generalLiability}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Workers Comp:</span>
                      <p className="text-white font-bold">{policyBrief.filmingLaws.insuranceMinimums.workersComp}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Equipment:</span>
                      <p className="text-white font-bold">{policyBrief.filmingLaws.insuranceMinimums.equipmentCoverage}</p>
                    </div>
                  </div>
                </div>

                {/* Noise Restrictions */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-3">🔊 Noise Restrictions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-slate-400 text-sm">Residential Hours:</span>
                      <p className="text-white">{policyBrief.filmingLaws.noiseRestrictions.residentialHours}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Commercial Hours:</span>
                      <p className="text-white">{policyBrief.filmingLaws.noiseRestrictions.commercialHours}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Decibel Limit:</span>
                      <p className="text-white">{policyBrief.filmingLaws.noiseRestrictions.decibelLimit}</p>
                    </div>
                  </div>
                </div>

                {/* Work Permits */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-3">🛂 Work Permits</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-400 text-sm">Foreign Crew Visa Required:</span>
                      <span className="text-white ml-2">{policyBrief.filmingLaws.workPermits.foreignCrewRequired ? "Yes" : "No"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Visa Type:</span>
                      <p className="text-white">{policyBrief.filmingLaws.workPermits.visaType}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Processing Time:</span>
                      <span className="text-white ml-2">{policyBrief.filmingLaws.workPermits.processingTime}</span>
                    </div>
                  </div>
                </div>

                {/* Union Rules */}
                {policyBrief.filmingLaws.unionRules.length > 0 && (
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-white mb-3">🎬 Union Considerations</h4>
                    <div className="flex flex-wrap gap-2">
                      {policyBrief.filmingLaws.unionRules.map((union, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                          {union}
                        </span>
                      ))}
                    </div>
                    {policyBrief.filmingLaws.specialNotes && (
                      <p className="text-slate-400 text-sm mt-3">{policyBrief.filmingLaws.specialNotes}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Cultural Tab */}
            {activeTab === "cultural" && (
              <div className="space-y-6">
                {policyBrief.culturalSensitivity ? (
                  <>
                    {/* Religious Considerations */}
                    {policyBrief.culturalSensitivity.religiousConsiderations.length > 0 && (
                      <div className="bg-slate-800 rounded-lg p-4">
                        <h4 className="text-lg font-bold text-white mb-3">🙏 Religious Considerations</h4>
                        <ul className="space-y-2">
                          {policyBrief.culturalSensitivity.religiousConsiderations.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-white">
                              <span className="text-purple-400">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Political Restrictions */}
                    {policyBrief.culturalSensitivity.politicalRestrictions.length > 0 && (
                      <div className="bg-slate-800 rounded-lg p-4">
                        <h4 className="text-lg font-bold text-white mb-3">🏛️ Political Restrictions</h4>
                        <ul className="space-y-2">
                          {policyBrief.culturalSensitivity.politicalRestrictions.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-white">
                              <span className="text-red-400">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Social Norms */}
                    {policyBrief.culturalSensitivity.socialNorms.length > 0 && (
                      <div className="bg-slate-800 rounded-lg p-4">
                        <h4 className="text-lg font-bold text-white mb-3">👥 Social Norms</h4>
                        <ul className="space-y-2">
                          {policyBrief.culturalSensitivity.socialNorms.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-white">
                              <span className="text-blue-400">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Major Holidays */}
                    {policyBrief.culturalSensitivity.holidays.length > 0 && (
                      <div className="bg-slate-800 rounded-lg p-4">
                        <h4 className="text-lg font-bold text-white mb-3">📅 Major Holidays (Potential Disruptions)</h4>
                        <div className="flex flex-wrap gap-2">
                          {policyBrief.culturalSensitivity.holidays.map((holiday, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-700 text-white rounded-full text-sm">
                              {holiday}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <span className="text-4xl mb-4 block">🌍</span>
                    <p>No cultural sensitivity data available for this location</p>
                  </div>
                )}
              </div>
            )}

            {/* Checklist Tab */}
            {activeTab === "checklist" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">Required Documents Checklist</h4>
                  <span className="text-sm text-slate-400">
                    {policyBrief.documentChecklist.filter((d) => d.required).length} required items
                  </span>
                </div>

                {/* Group by category */}
                {(["PERMIT", "LEGAL", "INSURANCE", "VISA", "CONSENT"] as const).map((category) => {
                  const items = policyBrief.documentChecklist.filter((d) => d.category === category);
                  if (items.length === 0) return null;

                  const categoryLabels = {
                    PERMIT: { label: "Permits", icon: "📋" },
                    LEGAL: { label: "Legal Documents", icon: "⚖️" },
                    INSURANCE: { label: "Insurance", icon: "🛡️" },
                    VISA: { label: "Visas & Work Permits", icon: "🛂" },
                    CONSENT: { label: "Consent & Releases", icon: "✍️" },
                  };

                  return (
                    <div key={category} className="bg-slate-800 rounded-lg overflow-hidden">
                      <div className="bg-slate-700 px-4 py-2 flex items-center gap-2">
                        <span>{categoryLabels[category].icon}</span>
                        <span className="font-bold text-white">{categoryLabels[category].label}</span>
                        <span className="text-slate-400 text-sm">({items.length})</span>
                      </div>
                      <div className="divide-y divide-slate-700">
                        {items.map((item, i) => (
                          <div key={i} className="px-4 py-3 flex items-start gap-3">
                            <input
                              type="checkbox"
                              className="mt-1 w-5 h-5 rounded accent-purple-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{item.document}</span>
                                {item.required && (
                                  <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded">
                                    REQUIRED
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-slate-400 mt-1">{item.notes}</div>
                              <div className="text-xs text-purple-400 mt-1">Lead time: {item.leadTime}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {!policyBrief && !isGenerating && (
        <div className="p-12 text-center">
          <span className="text-6xl mb-4 block">🌍</span>
          <h3 className="text-xl font-bold text-white mb-2">Select a Location</h3>
          <p className="text-slate-400">
            Choose a country to generate a comprehensive policy brief with filming laws,
            cultural sensitivities, and required documents checklist.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="p-12 text-center">
          <div className="animate-spin text-6xl mb-4">⚖️</div>
          <h3 className="text-xl font-bold text-white mb-2">Generating Policy Brief...</h3>
          <p className="text-slate-400">Analyzing regulations and compliance requirements</p>
        </div>
      )}
    </div>
  );
}
