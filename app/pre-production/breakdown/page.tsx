'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button, Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * BREAKDOWN PAGE
 * Script breakdown with tagged elements by scene.
 */

type IntExt = 'INTERIOR' | 'EXTERIOR';
type DayNight = 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK';

interface SceneElements {
  cast: string[];
  props: string[];
  wardrobe: string[];
  vehicles: string[];
  specialEffects: string[];
  extras: number;
}

interface SceneBreakdown {
  id: string;
  sceneNumber: string;
  description: string;
  intExt: IntExt;
  dayNight: DayNight;
  location: string;
  pageCount: number;
  elements: SceneElements;
}

// Mock data with 10 scene breakdowns
const MOCK_DATA: SceneBreakdown[] = [
  {
    id: '1',
    sceneNumber: '1',
    description: 'Detective Morgan arrives at the crime scene',
    intExt: 'EXTERIOR',
    dayNight: 'NIGHT',
    location: 'Downtown Alley',
    pageCount: 2.5,
    elements: {
      cast: ['Detective Morgan', 'Officer Chen', 'Forensics Team'],
      props: ['Police Badge', 'Flashlight', 'Evidence Markers', 'Crime Scene Tape'],
      wardrobe: ['Detective Coat', 'Police Uniform', 'Forensics Suit'],
      vehicles: ['Police Cruiser', 'Forensics Van'],
      specialEffects: ['Rain', 'Fog Machine'],
      extras: 8,
    },
  },
  {
    id: '2',
    sceneNumber: '2',
    description: 'Interrogation with the suspect',
    intExt: 'INTERIOR',
    dayNight: 'NIGHT',
    location: 'Police Station - Interrogation Room',
    pageCount: 3.0,
    elements: {
      cast: ['Detective Morgan', 'Suspect James Hart', 'Officer Chen'],
      props: ['Table', 'Chairs', 'One-way Mirror', 'Recording Device', 'Case Files'],
      wardrobe: ['Detective Suit', 'Suspect Orange Jumpsuit', 'Police Uniform'],
      vehicles: [],
      specialEffects: [],
      extras: 0,
    },
  },
  {
    id: '3',
    sceneNumber: '3',
    description: 'Chase sequence through the market',
    intExt: 'EXTERIOR',
    dayNight: 'DAY',
    location: 'Chinatown Market',
    pageCount: 4.5,
    elements: {
      cast: ['Detective Morgan', 'Suspect Runner', 'Market Vendor'],
      props: ['Fruit Stands', 'Market Carts', 'Hanging Lanterns', 'Crates'],
      wardrobe: ['Detective Casual', 'Runner Hoodie', 'Vendor Apron'],
      vehicles: [],
      specialEffects: ['Practical Breakaway Props', 'Dust Effects'],
      extras: 25,
    },
  },
  {
    id: '4',
    sceneNumber: '4',
    description: 'Meeting with the informant at the diner',
    intExt: 'INTERIOR',
    dayNight: 'DAWN',
    location: 'Roadside Diner',
    pageCount: 2.0,
    elements: {
      cast: ['Detective Morgan', 'Informant Leo', 'Waitress'],
      props: ['Coffee Cups', 'Menu', 'Cash', 'Envelope', 'Photographs'],
      wardrobe: ['Detective Wrinkled Shirt', 'Informant Leather Jacket', 'Waitress Uniform'],
      vehicles: ['Detective Sedan'],
      specialEffects: [],
      extras: 6,
    },
  },
  {
    id: '5',
    sceneNumber: '5',
    description: 'Stakeout in the parking garage',
    intExt: 'INTERIOR',
    dayNight: 'NIGHT',
    location: 'Underground Parking Garage',
    pageCount: 3.5,
    elements: {
      cast: ['Detective Morgan', 'Officer Chen', 'Target Vincent Cross'],
      props: ['Binoculars', 'Radio', 'Takeout Coffee', 'Camera with Telephoto Lens'],
      wardrobe: ['Detective Dark Jacket', 'Officer Tactical Vest', 'Target Business Suit'],
      vehicles: ['Unmarked Police Car', 'Target Black SUV'],
      specialEffects: ['Car Headlights', 'Atmospheric Haze'],
      extras: 4,
    },
  },
  {
    id: '6',
    sceneNumber: '6',
    description: 'Confrontation at the warehouse',
    intExt: 'INTERIOR',
    dayNight: 'NIGHT',
    location: 'Abandoned Warehouse',
    pageCount: 5.0,
    elements: {
      cast: ['Detective Morgan', 'Vincent Cross', 'Armed Guards (3)'],
      props: ['Shipping Containers', 'Crates', 'Weapons', 'Flashlights', 'Handcuffs'],
      wardrobe: ['Detective Tactical Gear', 'Cross Business Suit', 'Guard Security Uniforms'],
      vehicles: [],
      specialEffects: ['Muzzle Flashes', 'Squibs', 'Smoke', 'Sparks'],
      extras: 2,
    },
  },
  {
    id: '7',
    sceneNumber: '7',
    description: 'Captain briefs the team in the precinct',
    intExt: 'INTERIOR',
    dayNight: 'DAY',
    location: 'Police Precinct - Briefing Room',
    pageCount: 1.5,
    elements: {
      cast: ['Captain Sarah Walsh', 'Detective Morgan', 'Officer Chen', 'Task Force Members'],
      props: ['Whiteboard', 'Case Photos', 'Projector', 'Laptops', 'Evidence Boards'],
      wardrobe: ['Captain Dress Uniform', 'Detective Business Casual', 'Officer Uniforms'],
      vehicles: [],
      specialEffects: [],
      extras: 12,
    },
  },
  {
    id: '8',
    sceneNumber: '8',
    description: 'Car crash and rescue',
    intExt: 'EXTERIOR',
    dayNight: 'DUSK',
    location: 'Highway Overpass',
    pageCount: 4.0,
    elements: {
      cast: ['Detective Morgan', 'Officer Chen', 'EMT Team', 'Witness'],
      props: ['Medical Kit', 'Fire Extinguisher', 'Flares', 'Crowbar'],
      wardrobe: ['Detective Damaged Clothes', 'Officer Uniform', 'EMT Uniforms', 'Civilian Clothes'],
      vehicles: ['Detective Sedan (Crashed)', 'Ambulance', 'Fire Truck', 'Police Cruisers (2)'],
      specialEffects: ['Car Crash Rig', 'Fire Effects', 'Smoke', 'Broken Glass'],
      extras: 15,
    },
  },
  {
    id: '9',
    sceneNumber: '9',
    description: 'Final showdown at the penthouse',
    intExt: 'INTERIOR',
    dayNight: 'NIGHT',
    location: 'Luxury Penthouse - 40th Floor',
    pageCount: 6.0,
    elements: {
      cast: ['Detective Morgan', 'Vincent Cross', 'Hostage Sarah', 'SWAT Team'],
      props: ['Luxury Furniture', 'Weapons', 'Champagne Glasses', 'Safe', 'Helicopter Radio'],
      wardrobe: ['Detective Tactical Gear', 'Cross Tuxedo', 'Hostage Evening Gown', 'SWAT Uniforms'],
      vehicles: ['Police Helicopter'],
      specialEffects: ['Muzzle Flashes', 'Window Break Rig', 'Blood Effects', 'Wind Machine'],
      extras: 6,
    },
  },
  {
    id: '10',
    sceneNumber: '10',
    description: 'Epilogue - Morgan reflects at the memorial',
    intExt: 'EXTERIOR',
    dayNight: 'DAY',
    location: 'Police Memorial Park',
    pageCount: 1.5,
    elements: {
      cast: ['Detective Morgan', 'Officer Chen'],
      props: ['Memorial Plaque', 'Flowers', 'Coffee Cups'],
      wardrobe: ['Detective Dress Uniform', 'Officer Dress Uniform'],
      vehicles: [],
      specialEffects: ['Natural Sunlight', 'Leaf Scatter'],
      extras: 8,
    },
  },
];

const initialBreakdowns: SceneBreakdown[] = MOCK_DATA;

export default function BreakdownPage() {
  const router = useRouter();
  const [breakdowns, setBreakdowns] = useState<SceneBreakdown[]>(initialBreakdowns);
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());

  // Modal states
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
  const [isAddElementModalOpen, setIsAddElementModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Edit/Create scene state
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [sceneFormData, setSceneFormData] = useState({
    sceneNumber: '',
    description: '',
    intExt: 'INTERIOR' as IntExt,
    dayNight: 'DAY' as DayNight,
    location: '',
    pageCount: '',
  });

  // Add element state
  const [addElementSceneId, setAddElementSceneId] = useState<string | null>(null);
  const [elementFormData, setElementFormData] = useState({
    elementType: 'cast' as keyof SceneElements,
    elementValue: '',
    extrasCount: '',
  });

  // Export state
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const toggleExpanded = (sceneId: string) => {
    const newExpanded = new Set(expandedScenes);
    if (newExpanded.has(sceneId)) {
      newExpanded.delete(sceneId);
    } else {
      newExpanded.add(sceneId);
    }
    setExpandedScenes(newExpanded);
  };

  const handleAddScene = () => {
    setEditingSceneId(null);
    setSceneFormData({
      sceneNumber: '',
      description: '',
      intExt: 'INTERIOR',
      dayNight: 'DAY',
      location: '',
      pageCount: '',
    });
    setIsSceneModalOpen(true);
  };

  const handleEdit = (sceneId: string) => {
    const scene = breakdowns.find((s) => s.id === sceneId);
    if (scene) {
      setEditingSceneId(sceneId);
      setSceneFormData({
        sceneNumber: scene.sceneNumber,
        description: scene.description,
        intExt: scene.intExt,
        dayNight: scene.dayNight,
        location: scene.location,
        pageCount: scene.pageCount.toString(),
      });
      setIsSceneModalOpen(true);
    }
  };

  const handleSaveScene = () => {
    const pageCount = parseFloat(sceneFormData.pageCount);
    if (!sceneFormData.sceneNumber || !sceneFormData.description || !sceneFormData.location || isNaN(pageCount)) {
      return;
    }

    if (editingSceneId) {
      // Edit existing scene
      setBreakdowns(breakdowns.map((scene) =>
        scene.id === editingSceneId
          ? {
              ...scene,
              sceneNumber: sceneFormData.sceneNumber,
              description: sceneFormData.description,
              intExt: sceneFormData.intExt,
              dayNight: sceneFormData.dayNight,
              location: sceneFormData.location,
              pageCount,
            }
          : scene
      ));
    } else {
      // Add new scene
      const newScene: SceneBreakdown = {
        id: Date.now().toString(),
        sceneNumber: sceneFormData.sceneNumber,
        description: sceneFormData.description,
        intExt: sceneFormData.intExt,
        dayNight: sceneFormData.dayNight,
        location: sceneFormData.location,
        pageCount,
        elements: {
          cast: [],
          props: [],
          wardrobe: [],
          vehicles: [],
          specialEffects: [],
          extras: 0,
        },
      };
      setBreakdowns([...breakdowns, newScene]);
    }

    setIsSceneModalOpen(false);
  };

  const handlePrint = () => {
    console.log('Print clicked');
    window.print();
  };

  const handleAddElement = (sceneId: string) => {
    setAddElementSceneId(sceneId);
    setElementFormData({
      elementType: 'cast',
      elementValue: '',
      extrasCount: '',
    });
    setIsAddElementModalOpen(true);
  };

  const handleSaveElement = () => {
    if (!addElementSceneId) return;

    if (elementFormData.elementType === 'extras') {
      const extrasCount = parseInt(elementFormData.extrasCount);
      if (isNaN(extrasCount) || extrasCount <= 0) return;

      setBreakdowns(breakdowns.map((scene) =>
        scene.id === addElementSceneId
          ? {
              ...scene,
              elements: {
                ...scene.elements,
                extras: extrasCount,
              },
            }
          : scene
      ));
    } else {
      if (!elementFormData.elementValue.trim()) return;

      setBreakdowns(breakdowns.map((scene) =>
        scene.id === addElementSceneId
          ? {
              ...scene,
              elements: {
                ...scene.elements,
                [elementFormData.elementType]: [
                  ...scene.elements[elementFormData.elementType] as string[],
                  elementFormData.elementValue.trim(),
                ],
              },
            }
          : scene
      ));
    }

    setIsAddElementModalOpen(false);
  };

  const handleExport = () => {
    setExportFormat('csv');
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = () => {
    if (exportFormat === 'csv') {
      // Generate CSV
      const headers = ['Scene Number', 'Description', 'Int/Ext', 'Day/Night', 'Location', 'Page Count', 'Cast', 'Props', 'Wardrobe', 'Vehicles', 'Special Effects', 'Extras'];
      const rows = breakdowns.map((scene) => [
        scene.sceneNumber,
        `"${scene.description}"`,
        scene.intExt,
        scene.dayNight,
        `"${scene.location}"`,
        scene.pageCount,
        `"${scene.elements.cast.join(', ')}"`,
        `"${scene.elements.props.join(', ')}"`,
        `"${scene.elements.wardrobe.join(', ')}"`,
        `"${scene.elements.vehicles.join(', ')}"`,
        `"${scene.elements.specialEffects.join(', ')}"`,
        scene.elements.extras,
      ]);
      const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scene-breakdown.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Generate JSON
      const json = JSON.stringify(breakdowns, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scene-breakdown.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    setIsExportModalOpen(false);
  };

  const totalPages = breakdowns.reduce((sum, b) => sum + b.pageCount, 0);
  const totalElements = breakdowns.reduce((sum, scene) => {
    const { cast, props, wardrobe, vehicles, specialEffects, extras } = scene.elements;
    return sum + cast.length + props.length + wardrobe.length + vehicles.length + specialEffects.length + (extras > 0 ? 1 : 0);
  }, 0);

  const getIntExtColor = (intExt: IntExt) => {
    return intExt === 'INTERIOR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getDayNightColor = (dayNight: DayNight) => {
    switch (dayNight) {
      case 'DAY':
        return 'bg-yellow-100 text-yellow-800';
      case 'NIGHT':
        return 'bg-indigo-100 text-indigo-800';
      case 'DAWN':
        return 'bg-orange-100 text-orange-800';
      case 'DUSK':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pre-production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-preproduction)', color: 'white' }}
              >
                <Icons.Scissors className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Scene Breakdown</h1>
                <p className="text-sm text-[var(--text-secondary)]">Detailed breakdown of all production elements by scene</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handlePrint}>
                <Icons.Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExport}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddScene}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Scene
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Scenes</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{breakdowns.length}</p>
              </div>
              <Icons.Film className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Pages</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{totalPages.toFixed(1)}</p>
              </div>
              <Icons.FileText className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Elements Count</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{totalElements}</p>
              </div>
              <Icons.Package className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Scene Breakdown Cards */}
        <div className="space-y-4">
          {breakdowns.map((scene) => {
            const isExpanded = expandedScenes.has(scene.id);
            const elementCount =
              scene.elements.cast.length +
              scene.elements.props.length +
              scene.elements.wardrobe.length +
              scene.elements.vehicles.length +
              scene.elements.specialEffects.length +
              (scene.elements.extras > 0 ? 1 : 0);

            return (
              <Card key={scene.id} className="overflow-hidden">
                {/* Scene Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-[var(--bg-1)] transition-colors"
                  onClick={() => toggleExpanded(scene.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-[var(--text-primary)]">
                          Scene {scene.sceneNumber}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntExtColor(scene.intExt)}`}>
                          {scene.intExt}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDayNightColor(scene.dayNight)}`}>
                          {scene.dayNight}
                        </span>
                        <span className="text-sm text-[var(--text-tertiary)]">{scene.pageCount} pages</span>
                      </div>
                      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                        {scene.description}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Icons.MapPin className="w-4 h-4" />
                        <span>{scene.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{elementCount}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">Elements</p>
                      </div>
                      <Icons.ChevronDown
                        className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform ${
                          isExpanded ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Element Summary */}
                  {!isExpanded && (
                    <div className="flex gap-4 mt-4 text-sm">
                      {scene.elements.cast.length > 0 && (
                        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <Icons.Users className="w-4 h-4" />
                          <span>{scene.elements.cast.length} Cast</span>
                        </div>
                      )}
                      {scene.elements.props.length > 0 && (
                        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <Icons.Package className="w-4 h-4" />
                          <span>{scene.elements.props.length} Props</span>
                        </div>
                      )}
                      {scene.elements.wardrobe.length > 0 && (
                        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <Icons.Shirt className="w-4 h-4" />
                          <span>{scene.elements.wardrobe.length} Wardrobe</span>
                        </div>
                      )}
                      {scene.elements.vehicles.length > 0 && (
                        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <Icons.Truck className="w-4 h-4" />
                          <span>{scene.elements.vehicles.length} Vehicles</span>
                        </div>
                      )}
                      {scene.elements.specialEffects.length > 0 && (
                        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <Icons.Sparkles className="w-4 h-4" />
                          <span>{scene.elements.specialEffects.length} VFX</span>
                        </div>
                      )}
                      {scene.elements.extras > 0 && (
                        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <Icons.UserPlus className="w-4 h-4" />
                          <span>{scene.elements.extras} Extras</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded Elements */}
                {isExpanded && (
                  <div className="border-t border-[var(--border-default)] bg-[var(--bg-0)]">
                    <div className="p-6 space-y-6">
                      {/* Cast */}
                      {scene.elements.cast.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Icons.Users className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-[var(--text-primary)]">Cast ({scene.elements.cast.length})</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {scene.elements.cast.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Props */}
                      {scene.elements.props.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Icons.Package className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-[var(--text-primary)]">Props ({scene.elements.props.length})</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {scene.elements.props.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Wardrobe */}
                      {scene.elements.wardrobe.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Icons.Shirt className="w-5 h-5 text-pink-600" />
                            <h4 className="font-semibold text-[var(--text-primary)]">Wardrobe ({scene.elements.wardrobe.length})</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {scene.elements.wardrobe.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vehicles */}
                      {scene.elements.vehicles.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Icons.Truck className="w-5 h-5 text-green-600" />
                            <h4 className="font-semibold text-[var(--text-primary)]">Vehicles ({scene.elements.vehicles.length})</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {scene.elements.vehicles.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Special Effects */}
                      {scene.elements.specialEffects.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Icons.Sparkles className="w-5 h-5 text-orange-600" />
                            <h4 className="font-semibold text-[var(--text-primary)]">Special Effects ({scene.elements.specialEffects.length})</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {scene.elements.specialEffects.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extras */}
                      {scene.elements.extras > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Icons.UserPlus className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-semibold text-[var(--text-primary)]">Background Extras</h4>
                          </div>
                          <div className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg inline-block">
                            {scene.elements.extras} extras required
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-[var(--border-default)]">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(scene.id);
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          <Icons.Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddElement(scene.id);
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          <Icons.Plus className="w-4 h-4 mr-1" />
                          Add Element
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Scene Create/Edit Modal */}
      <Modal
        isOpen={isSceneModalOpen}
        onClose={() => setIsSceneModalOpen(false)}
        title={editingSceneId ? 'Edit Scene' : 'Add New Scene'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Scene Number
            </label>
            <Input
              value={sceneFormData.sceneNumber}
              onChange={(e) => setSceneFormData({ ...sceneFormData, sceneNumber: e.target.value })}
              placeholder="e.g., 1, 2A, 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Description
            </label>
            <Textarea
              value={sceneFormData.description}
              onChange={(e) => setSceneFormData({ ...sceneFormData, description: e.target.value })}
              placeholder="Brief description of the scene"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Int/Ext
              </label>
              <select
                value={sceneFormData.intExt}
                onChange={(e) => setSceneFormData({ ...sceneFormData, intExt: e.target.value as IntExt })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="INTERIOR">INTERIOR</option>
                <option value="EXTERIOR">EXTERIOR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Day/Night
              </label>
              <select
                value={sceneFormData.dayNight}
                onChange={(e) => setSceneFormData({ ...sceneFormData, dayNight: e.target.value as DayNight })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="DAY">DAY</option>
                <option value="NIGHT">NIGHT</option>
                <option value="DAWN">DAWN</option>
                <option value="DUSK">DUSK</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Location
            </label>
            <Input
              value={sceneFormData.location}
              onChange={(e) => setSceneFormData({ ...sceneFormData, location: e.target.value })}
              placeholder="e.g., Downtown Alley, Police Station"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Page Count
            </label>
            <Input
              type="number"
              step="0.1"
              value={sceneFormData.pageCount}
              onChange={(e) => setSceneFormData({ ...sceneFormData, pageCount: e.target.value })}
              placeholder="e.g., 2.5"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsSceneModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveScene}
              className="flex-1"
            >
              {editingSceneId ? 'Save Changes' : 'Add Scene'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Element Modal */}
      <Modal
        isOpen={isAddElementModalOpen}
        onClose={() => setIsAddElementModalOpen(false)}
        title="Add Element to Scene"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Element Type
            </label>
            <select
              value={elementFormData.elementType}
              onChange={(e) => setElementFormData({ ...elementFormData, elementType: e.target.value as keyof SceneElements })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="cast">Cast</option>
              <option value="props">Props</option>
              <option value="wardrobe">Wardrobe</option>
              <option value="vehicles">Vehicles</option>
              <option value="specialEffects">Special Effects</option>
              <option value="extras">Background Extras</option>
            </select>
          </div>

          {elementFormData.elementType === 'extras' ? (
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Number of Extras
              </label>
              <Input
                type="number"
                value={elementFormData.extrasCount}
                onChange={(e) => setElementFormData({ ...elementFormData, extrasCount: e.target.value })}
                placeholder="e.g., 10"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Element Name
              </label>
              <Input
                value={elementFormData.elementValue}
                onChange={(e) => setElementFormData({ ...elementFormData, elementValue: e.target.value })}
                placeholder={`Enter ${elementFormData.elementType} name`}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAddElementModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveElement}
              className="flex-1"
            >
              Add Element
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Scene Breakdown"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="csv">CSV (Comma-Separated Values)</option>
              <option value="json">JSON (JavaScript Object Notation)</option>
            </select>
          </div>

          <div className="p-4 bg-[var(--bg-1)] rounded-lg">
            <p className="text-sm text-[var(--text-secondary)]">
              {exportFormat === 'csv'
                ? 'Export all scene breakdowns as a CSV file that can be opened in spreadsheet applications like Excel or Google Sheets.'
                : 'Export all scene breakdowns as a JSON file for programmatic use or importing into other applications.'}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsExportModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmExport}
              className="flex-1"
            >
              <Icons.Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
