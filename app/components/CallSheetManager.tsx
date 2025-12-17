'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import type { Schema } from '@/amplify/data/resource';
import { Icons, Button, Badge } from './ui';

const client = generateClient<Schema>({ authMode: 'userPool' });

interface CallSheetManagerProps {
  projectId: string;
  project: Schema['Project']['type'];
}

// Types based on the schema
interface CallSheetScene {
  id: string;
  sceneNumber: string;
  sceneHeading?: string;
  description?: string;
  location?: string;
  pageCount?: number;
  estimatedDuration?: number;
  scheduledTime?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MOVED';
  notes?: string;
  sortOrder: number;
}

interface CallSheetCast {
  id: string;
  actorName: string;
  characterName?: string;
  phone?: string;
  email?: string;
  makeupCall?: string;
  wardrobeCall?: string;
  callToSet?: string;
  pickupLocation?: string;
  pickupTime?: string;
  notes?: string;
  sortOrder: number;
}

interface CallSheetCrew {
  id: string;
  name: string;
  role: string;
  department: string;
  phone?: string;
  email?: string;
  callTime?: string;
  walkieChannel?: string;
  notes?: string;
  sortOrder: number;
}

interface CallSheetData {
  id?: string;
  productionTitle: string;
  productionCompany: string;
  shootDayNumber: number;
  totalShootDays: number;
  shootDate: string;
  episodeNumber?: string;

  // General Call Information
  generalCrewCall: string;
  estimatedWrap: string;
  timezone: string;

  // Location Information
  primaryLocation: string;
  primaryLocationAddress: string;
  parkingInstructions?: string;
  nearestHospital?: string;
  hospitalAddress?: string;

  // Weather
  weatherForecast?: string;
  temperature?: string;
  sunset?: string;

  // Production Contacts
  directorName?: string;
  directorPhone?: string;
  producerName?: string;
  producerPhone?: string;
  firstADName?: string;
  firstADPhone?: string;
  productionManagerName?: string;
  productionManagerPhone?: string;
  productionOfficePhone?: string;

  // Additional Information
  mealTimes?: string;
  cateringLocation?: string;
  transportationNotes?: string;
  safetyNotes?: string;
  specialInstructions?: string;
  nextDaySchedule?: string;

  // Status
  status: 'DRAFT' | 'PUBLISHED' | 'UPDATED' | 'CANCELLED';
  version: number;

  // Related data
  scenes: CallSheetScene[];
  cast: CallSheetCast[];
  crew: CallSheetCrew[];
}

const DEPARTMENTS = [
  'CAMERA', 'SOUND', 'LIGHTING', 'GRIP', 'ELECTRIC',
  'PRODUCTION', 'ART', 'MAKEUP', 'WARDROBE', 'VFX', 'OTHER'
];

export default function CallSheetManager({ projectId, project }: CallSheetManagerProps) {
  const [callSheets, setCallSheets] = useState<Schema['CallSheet']['type'][]>([]);
  const [selectedCallSheet, setSelectedCallSheet] = useState<CallSheetData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'scenes' | 'cast' | 'crew'>('overview');
  const [userEmail, setUserEmail] = useState<string>('');
  const [organizationId, setOrganizationId] = useState<string>('');

  // Initialize empty call sheet
  const emptyCallSheet: CallSheetData = {
    productionTitle: project?.name || '',
    productionCompany: '',
    shootDayNumber: 1,
    totalShootDays: 1,
    shootDate: new Date().toISOString().split('T')[0],
    generalCrewCall: '07:00',
    estimatedWrap: '19:00',
    timezone: 'America/Los_Angeles',
    primaryLocation: '',
    primaryLocationAddress: '',
    status: 'DRAFT',
    version: 1,
    scenes: [],
    cast: [],
    crew: [],
  };

  useEffect(() => {
    fetchCallSheets();
    fetchUserInfo();
  }, [projectId]);

  async function fetchUserInfo() {
    try {
      const attributes = await fetchUserAttributes();
      setUserEmail(attributes.email || '');

      // Get organization ID
      const { data: memberships } = await client.models.OrganizationMember.list({
        filter: { email: { eq: attributes.email || '' } }
      });
      if (memberships && memberships.length > 0) {
        setOrganizationId(memberships[0].organizationId);
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  }

  async function fetchCallSheets() {
    setLoading(true);
    try {
      const { data } = await client.models.CallSheet.list({
        filter: { projectId: { eq: projectId } }
      });
      if (data) {
        // Sort by shoot date descending
        const sorted = [...data].sort((a, b) =>
          new Date(b.shootDate || '').getTime() - new Date(a.shootDate || '').getTime()
        );
        setCallSheets(sorted);
      }
    } catch (err) {
      console.error('Error fetching call sheets:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCallSheetDetails(callSheetId: string) {
    try {
      // Get the main call sheet
      const { data: callSheet } = await client.models.CallSheet.get({ id: callSheetId });
      if (!callSheet) return;

      // Get scenes
      const { data: scenes } = await client.models.CallSheetScene.list({
        filter: { callSheetId: { eq: callSheetId } }
      });

      // Get cast
      const { data: cast } = await client.models.CallSheetCast.list({
        filter: { callSheetId: { eq: callSheetId } }
      });

      // Get crew
      const { data: crew } = await client.models.CallSheetCrew.list({
        filter: { callSheetId: { eq: callSheetId } }
      });

      setSelectedCallSheet({
        id: callSheet.id,
        productionTitle: callSheet.productionTitle || '',
        productionCompany: callSheet.productionCompany || '',
        shootDayNumber: callSheet.shootDayNumber || 1,
        totalShootDays: callSheet.totalShootDays || 1,
        shootDate: callSheet.shootDate || '',
        episodeNumber: callSheet.episodeNumber || undefined,
        generalCrewCall: callSheet.generalCrewCall || '07:00',
        estimatedWrap: callSheet.estimatedWrap || '19:00',
        timezone: callSheet.timezone || 'America/Los_Angeles',
        primaryLocation: callSheet.primaryLocation || '',
        primaryLocationAddress: callSheet.primaryLocationAddress || '',
        parkingInstructions: callSheet.parkingInstructions || undefined,
        nearestHospital: callSheet.nearestHospital || undefined,
        hospitalAddress: callSheet.hospitalAddress || undefined,
        weatherForecast: callSheet.weatherForecast || undefined,
        temperature: callSheet.temperature || undefined,
        sunset: callSheet.sunset || undefined,
        directorName: callSheet.directorName || undefined,
        directorPhone: callSheet.directorPhone || undefined,
        producerName: callSheet.producerName || undefined,
        producerPhone: callSheet.producerPhone || undefined,
        firstADName: callSheet.firstADName || undefined,
        firstADPhone: callSheet.firstADPhone || undefined,
        productionManagerName: callSheet.productionManagerName || undefined,
        productionManagerPhone: callSheet.productionManagerPhone || undefined,
        productionOfficePhone: callSheet.productionOfficePhone || undefined,
        mealTimes: callSheet.mealTimes || undefined,
        cateringLocation: callSheet.cateringLocation || undefined,
        transportationNotes: callSheet.transportationNotes || undefined,
        safetyNotes: callSheet.safetyNotes || undefined,
        specialInstructions: callSheet.specialInstructions || undefined,
        nextDaySchedule: callSheet.nextDaySchedule || undefined,
        status: (callSheet.status as CallSheetData['status']) || 'DRAFT',
        version: callSheet.version || 1,
        scenes: (scenes || []).map(s => ({
          id: s.id,
          sceneNumber: s.sceneNumber || '',
          sceneHeading: s.sceneHeading || undefined,
          description: s.description || undefined,
          location: s.location || undefined,
          pageCount: s.pageCount || undefined,
          estimatedDuration: s.estimatedDuration || undefined,
          scheduledTime: s.scheduledTime || undefined,
          status: (s.status as CallSheetScene['status']) || 'SCHEDULED',
          notes: s.notes || undefined,
          sortOrder: s.sortOrder || 0,
        })).sort((a, b) => a.sortOrder - b.sortOrder),
        cast: (cast || []).map(c => ({
          id: c.id,
          actorName: c.actorName || '',
          characterName: c.characterName || undefined,
          phone: c.phone || undefined,
          email: c.email || undefined,
          makeupCall: c.makeupCall || undefined,
          wardrobeCall: c.wardrobeCall || undefined,
          callToSet: c.callToSet || undefined,
          pickupLocation: c.pickupLocation || undefined,
          pickupTime: c.pickupTime || undefined,
          notes: c.notes || undefined,
          sortOrder: c.sortOrder || 0,
        })).sort((a, b) => a.sortOrder - b.sortOrder),
        crew: (crew || []).map(cr => ({
          id: cr.id,
          name: cr.name || '',
          role: cr.role || '',
          department: cr.department || 'OTHER',
          phone: cr.phone || undefined,
          email: cr.email || undefined,
          callTime: cr.callTime || undefined,
          walkieChannel: cr.walkieChannel || undefined,
          notes: cr.notes || undefined,
          sortOrder: cr.sortOrder || 0,
        })).sort((a, b) => a.sortOrder - b.sortOrder),
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error loading call sheet details:', err);
    }
  }

  async function saveCallSheet() {
    if (!selectedCallSheet || !organizationId) return;
    setSaving(true);

    try {
      let callSheetId = selectedCallSheet.id;

      // Create or update the main call sheet
      if (callSheetId) {
        await client.models.CallSheet.update({
          id: callSheetId,
          productionTitle: selectedCallSheet.productionTitle,
          productionCompany: selectedCallSheet.productionCompany,
          shootDayNumber: selectedCallSheet.shootDayNumber,
          totalShootDays: selectedCallSheet.totalShootDays,
          shootDate: selectedCallSheet.shootDate,
          episodeNumber: selectedCallSheet.episodeNumber,
          generalCrewCall: selectedCallSheet.generalCrewCall,
          estimatedWrap: selectedCallSheet.estimatedWrap,
          timezone: selectedCallSheet.timezone,
          primaryLocation: selectedCallSheet.primaryLocation,
          primaryLocationAddress: selectedCallSheet.primaryLocationAddress,
          parkingInstructions: selectedCallSheet.parkingInstructions,
          nearestHospital: selectedCallSheet.nearestHospital,
          hospitalAddress: selectedCallSheet.hospitalAddress,
          weatherForecast: selectedCallSheet.weatherForecast,
          temperature: selectedCallSheet.temperature,
          sunset: selectedCallSheet.sunset,
          directorName: selectedCallSheet.directorName,
          directorPhone: selectedCallSheet.directorPhone,
          producerName: selectedCallSheet.producerName,
          producerPhone: selectedCallSheet.producerPhone,
          firstADName: selectedCallSheet.firstADName,
          firstADPhone: selectedCallSheet.firstADPhone,
          productionManagerName: selectedCallSheet.productionManagerName,
          productionManagerPhone: selectedCallSheet.productionManagerPhone,
          productionOfficePhone: selectedCallSheet.productionOfficePhone,
          mealTimes: selectedCallSheet.mealTimes,
          cateringLocation: selectedCallSheet.cateringLocation,
          transportationNotes: selectedCallSheet.transportationNotes,
          safetyNotes: selectedCallSheet.safetyNotes,
          specialInstructions: selectedCallSheet.specialInstructions,
          nextDaySchedule: selectedCallSheet.nextDaySchedule,
          status: selectedCallSheet.status,
          version: selectedCallSheet.version,
          lastUpdatedBy: userEmail,
        });
      } else {
        const { data: newCallSheet } = await client.models.CallSheet.create({
          organizationId,
          projectId,
          productionTitle: selectedCallSheet.productionTitle,
          productionCompany: selectedCallSheet.productionCompany,
          shootDayNumber: selectedCallSheet.shootDayNumber,
          totalShootDays: selectedCallSheet.totalShootDays,
          shootDate: selectedCallSheet.shootDate,
          episodeNumber: selectedCallSheet.episodeNumber,
          generalCrewCall: selectedCallSheet.generalCrewCall,
          estimatedWrap: selectedCallSheet.estimatedWrap,
          timezone: selectedCallSheet.timezone,
          primaryLocation: selectedCallSheet.primaryLocation,
          primaryLocationAddress: selectedCallSheet.primaryLocationAddress,
          parkingInstructions: selectedCallSheet.parkingInstructions,
          nearestHospital: selectedCallSheet.nearestHospital,
          hospitalAddress: selectedCallSheet.hospitalAddress,
          weatherForecast: selectedCallSheet.weatherForecast,
          temperature: selectedCallSheet.temperature,
          sunset: selectedCallSheet.sunset,
          directorName: selectedCallSheet.directorName,
          directorPhone: selectedCallSheet.directorPhone,
          producerName: selectedCallSheet.producerName,
          producerPhone: selectedCallSheet.producerPhone,
          firstADName: selectedCallSheet.firstADName,
          firstADPhone: selectedCallSheet.firstADPhone,
          productionManagerName: selectedCallSheet.productionManagerName,
          productionManagerPhone: selectedCallSheet.productionManagerPhone,
          productionOfficePhone: selectedCallSheet.productionOfficePhone,
          mealTimes: selectedCallSheet.mealTimes,
          cateringLocation: selectedCallSheet.cateringLocation,
          transportationNotes: selectedCallSheet.transportationNotes,
          safetyNotes: selectedCallSheet.safetyNotes,
          specialInstructions: selectedCallSheet.specialInstructions,
          nextDaySchedule: selectedCallSheet.nextDaySchedule,
          status: selectedCallSheet.status,
          version: 1,
          lastUpdatedBy: userEmail,
        });
        callSheetId = newCallSheet?.id;
      }

      if (!callSheetId) throw new Error('Failed to save call sheet');

      // Save scenes (delete existing and recreate for simplicity)
      const { data: existingScenes } = await client.models.CallSheetScene.list({
        filter: { callSheetId: { eq: callSheetId } }
      });
      for (const scene of existingScenes || []) {
        await client.models.CallSheetScene.delete({ id: scene.id });
      }
      for (let i = 0; i < selectedCallSheet.scenes.length; i++) {
        const scene = selectedCallSheet.scenes[i];
        await client.models.CallSheetScene.create({
          callSheetId,
          sceneNumber: scene.sceneNumber,
          sceneHeading: scene.sceneHeading,
          description: scene.description,
          location: scene.location,
          pageCount: scene.pageCount,
          estimatedDuration: scene.estimatedDuration,
          scheduledTime: scene.scheduledTime,
          status: scene.status,
          notes: scene.notes,
          sortOrder: i,
        });
      }

      // Save cast
      const { data: existingCast } = await client.models.CallSheetCast.list({
        filter: { callSheetId: { eq: callSheetId } }
      });
      for (const cast of existingCast || []) {
        await client.models.CallSheetCast.delete({ id: cast.id });
      }
      for (let i = 0; i < selectedCallSheet.cast.length; i++) {
        const cast = selectedCallSheet.cast[i];
        await client.models.CallSheetCast.create({
          callSheetId,
          actorName: cast.actorName,
          characterName: cast.characterName,
          phone: cast.phone,
          email: cast.email,
          makeupCall: cast.makeupCall,
          wardrobeCall: cast.wardrobeCall,
          callToSet: cast.callToSet,
          pickupLocation: cast.pickupLocation,
          pickupTime: cast.pickupTime,
          notes: cast.notes,
          sortOrder: i,
        });
      }

      // Save crew
      const { data: existingCrew } = await client.models.CallSheetCrew.list({
        filter: { callSheetId: { eq: callSheetId } }
      });
      for (const crew of existingCrew || []) {
        await client.models.CallSheetCrew.delete({ id: crew.id });
      }
      for (let i = 0; i < selectedCallSheet.crew.length; i++) {
        const crew = selectedCallSheet.crew[i];
        await client.models.CallSheetCrew.create({
          callSheetId,
          name: crew.name,
          role: crew.role,
          department: crew.department as Schema['CallSheetCrew']['type']['department'],
          phone: crew.phone,
          email: crew.email,
          callTime: crew.callTime,
          walkieChannel: crew.walkieChannel,
          notes: crew.notes,
          sortOrder: i,
        });
      }

      await fetchCallSheets();
      setIsCreating(false);
      setIsEditing(false);
      if (callSheetId) {
        loadCallSheetDetails(callSheetId);
      }
    } catch (err) {
      console.error('Error saving call sheet:', err);
    } finally {
      setSaving(false);
    }
  }

  async function publishCallSheet() {
    if (!selectedCallSheet?.id) return;
    setSaving(true);
    try {
      await client.models.CallSheet.update({
        id: selectedCallSheet.id,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
      });
      setSelectedCallSheet({
        ...selectedCallSheet,
        status: 'PUBLISHED',
      });
      await fetchCallSheets();
    } catch (err) {
      console.error('Error publishing call sheet:', err);
    } finally {
      setSaving(false);
    }
  }

  function addScene() {
    if (!selectedCallSheet) return;
    const newScene: CallSheetScene = {
      id: `temp-${Date.now()}`,
      sceneNumber: '',
      status: 'SCHEDULED',
      sortOrder: selectedCallSheet.scenes.length,
    };
    setSelectedCallSheet({
      ...selectedCallSheet,
      scenes: [...selectedCallSheet.scenes, newScene],
    });
  }

  function updateScene(index: number, updates: Partial<CallSheetScene>) {
    if (!selectedCallSheet) return;
    const newScenes = [...selectedCallSheet.scenes];
    newScenes[index] = { ...newScenes[index], ...updates };
    setSelectedCallSheet({ ...selectedCallSheet, scenes: newScenes });
  }

  function removeScene(index: number) {
    if (!selectedCallSheet) return;
    const newScenes = selectedCallSheet.scenes.filter((_, i) => i !== index);
    setSelectedCallSheet({ ...selectedCallSheet, scenes: newScenes });
  }

  function addCast() {
    if (!selectedCallSheet) return;
    const newCast: CallSheetCast = {
      id: `temp-${Date.now()}`,
      actorName: '',
      sortOrder: selectedCallSheet.cast.length,
    };
    setSelectedCallSheet({
      ...selectedCallSheet,
      cast: [...selectedCallSheet.cast, newCast],
    });
  }

  function updateCast(index: number, updates: Partial<CallSheetCast>) {
    if (!selectedCallSheet) return;
    const newCast = [...selectedCallSheet.cast];
    newCast[index] = { ...newCast[index], ...updates };
    setSelectedCallSheet({ ...selectedCallSheet, cast: newCast });
  }

  function removeCast(index: number) {
    if (!selectedCallSheet) return;
    const newCast = selectedCallSheet.cast.filter((_, i) => i !== index);
    setSelectedCallSheet({ ...selectedCallSheet, cast: newCast });
  }

  function addCrew() {
    if (!selectedCallSheet) return;
    const newCrew: CallSheetCrew = {
      id: `temp-${Date.now()}`,
      name: '',
      role: '',
      department: 'PRODUCTION',
      sortOrder: selectedCallSheet.crew.length,
    };
    setSelectedCallSheet({
      ...selectedCallSheet,
      crew: [...selectedCallSheet.crew, newCrew],
    });
  }

  function updateCrew(index: number, updates: Partial<CallSheetCrew>) {
    if (!selectedCallSheet) return;
    const newCrew = [...selectedCallSheet.crew];
    newCrew[index] = { ...newCrew[index], ...updates };
    setSelectedCallSheet({ ...selectedCallSheet, crew: newCrew });
  }

  function removeCrew(index: number) {
    if (!selectedCallSheet) return;
    const newCrew = selectedCallSheet.crew.filter((_, i) => i !== index);
    setSelectedCallSheet({ ...selectedCallSheet, crew: newCrew });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500/20 text-green-400';
      case 'DRAFT': return 'bg-yellow-500/20 text-yellow-400';
      case 'UPDATED': return 'bg-blue-500/20 text-blue-400';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  // List View
  if (!selectedCallSheet && !isCreating) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-default)]">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Call Sheets</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Manage production call sheets for {project?.name}
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedCallSheet({ ...emptyCallSheet });
              setIsCreating(true);
              setIsEditing(true);
            }}
            className="flex items-center gap-2"
          >
            <Icons.Plus className="w-4 h-4" />
            New Call Sheet
          </Button>
        </div>

        {/* Call Sheet List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
            </div>
          ) : callSheets.length === 0 ? (
            <div className="text-center py-12">
              <Icons.ClipboardList className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--text-primary)]">No Call Sheets Yet</h3>
              <p className="text-[var(--text-secondary)] mt-2">
                Create your first call sheet to start organizing your production days.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {callSheets.map((cs) => (
                <div
                  key={cs.id}
                  onClick={() => loadCallSheetDetails(cs.id)}
                  className="bg-[var(--bg-2)] rounded-lg p-4 cursor-pointer hover:bg-[var(--bg-3)] transition-colors border border-[var(--border-default)]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          Day {cs.shootDayNumber} of {cs.totalShootDays}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(cs.status || 'DRAFT')}`}>
                          {cs.status || 'DRAFT'}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {new Date(cs.shootDate || '').toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {cs.primaryLocation && (
                        <p className="text-sm text-[var(--text-tertiary)] mt-1 flex items-center gap-1">
                          <Icons.MapPin className="w-3 h-3" />
                          {cs.primaryLocation}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-[var(--text-tertiary)]">
                      <p>Call: {cs.generalCrewCall || '--:--'}</p>
                      <p>Wrap: {cs.estimatedWrap || '--:--'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detail/Edit View
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setSelectedCallSheet(null);
              setIsCreating(false);
              setIsEditing(false);
            }}
            className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
          >
            <Icons.ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {isCreating ? 'New Call Sheet' : `Day ${selectedCallSheet?.shootDayNumber}`}
            </h2>
            {selectedCallSheet?.shootDate && (
              <p className="text-sm text-[var(--text-secondary)]">
                {new Date(selectedCallSheet.shootDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && selectedCallSheet?.id && (
            <>
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Icons.Edit className="w-4 h-4" />
                Edit
              </Button>
              {selectedCallSheet.status === 'DRAFT' && (
                <Button
                  onClick={publishCallSheet}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Icons.Send className="w-4 h-4" />
                  Publish
                </Button>
              )}
            </>
          )}
          {isEditing && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  if (isCreating) {
                    setSelectedCallSheet(null);
                    setIsCreating(false);
                  }
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={saveCallSheet}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icons.Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-default)] px-4">
        {(['overview', 'scenes', 'cast', 'crew'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
            {tab === 'scenes' && selectedCallSheet?.scenes.length ? (
              <span className="ml-2 px-1.5 py-0.5 bg-[var(--bg-3)] rounded text-xs">
                {selectedCallSheet.scenes.length}
              </span>
            ) : null}
            {tab === 'cast' && selectedCallSheet?.cast.length ? (
              <span className="ml-2 px-1.5 py-0.5 bg-[var(--bg-3)] rounded text-xs">
                {selectedCallSheet.cast.length}
              </span>
            ) : null}
            {tab === 'crew' && selectedCallSheet?.crew.length ? (
              <span className="ml-2 px-1.5 py-0.5 bg-[var(--bg-3)] rounded text-xs">
                {selectedCallSheet.crew.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && selectedCallSheet && (
          <div className="max-w-4xl space-y-6">
            {/* Production Info */}
            <div className="bg-[var(--bg-2)] rounded-lg p-4 border border-[var(--border-default)]">
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
                Production Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Production Title</label>
                  <input
                    type="text"
                    value={selectedCallSheet.productionTitle}
                    onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, productionTitle: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Production Company</label>
                  <input
                    type="text"
                    value={selectedCallSheet.productionCompany}
                    onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, productionCompany: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Shoot Day</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={selectedCallSheet.shootDayNumber}
                      onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, shootDayNumber: parseInt(e.target.value) || 1 })}
                      disabled={!isEditing}
                      className="w-20 px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60"
                    />
                    <span className="text-[var(--text-secondary)]">of</span>
                    <input
                      type="number"
                      min="1"
                      value={selectedCallSheet.totalShootDays}
                      onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, totalShootDays: parseInt(e.target.value) || 1 })}
                      disabled={!isEditing}
                      className="w-20 px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Shoot Date</label>
                  <input
                    type="date"
                    value={selectedCallSheet.shootDate}
                    onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, shootDate: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Call Times */}
            <div className="bg-[var(--bg-2)] rounded-lg p-4 border border-[var(--border-default)]">
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
                Call Times
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">General Crew Call</label>
                  <input
                    type="time"
                    value={selectedCallSheet.generalCrewCall}
                    onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, generalCrewCall: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Estimated Wrap</label>
                  <input
                    type="time"
                    value={selectedCallSheet.estimatedWrap}
                    onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, estimatedWrap: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Timezone</label>
                  <select
                    value={selectedCallSheet.timezone}
                    onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, timezone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60"
                  >
                    <option value="America/Los_Angeles">Pacific (PT)</option>
                    <option value="America/Denver">Mountain (MT)</option>
                    <option value="America/Chicago">Central (CT)</option>
                    <option value="America/New_York">Eastern (ET)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-[var(--bg-2)] rounded-lg p-4 border border-[var(--border-default)]">
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
                Location
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Primary Location</label>
                  <input
                    type="text"
                    value={selectedCallSheet.primaryLocation}
                    onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, primaryLocation: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Location name"
                    className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60 placeholder:text-[var(--text-tertiary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Address</label>
                  <input
                    type="text"
                    value={selectedCallSheet.primaryLocationAddress}
                    onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, primaryLocationAddress: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Full address"
                    className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60 placeholder:text-[var(--text-tertiary)]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Parking Instructions</label>
                  <textarea
                    value={selectedCallSheet.parkingInstructions || ''}
                    onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, parkingInstructions: e.target.value })}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Key Contacts */}
            <div className="bg-[var(--bg-2)] rounded-lg p-4 border border-[var(--border-default)]">
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
                Key Contacts
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Director</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedCallSheet.directorName || ''}
                      onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, directorName: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Name"
                      className="flex-1 px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60 placeholder:text-[var(--text-tertiary)]"
                    />
                    <input
                      type="tel"
                      value={selectedCallSheet.directorPhone || ''}
                      onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, directorPhone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Phone"
                      className="w-36 px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60 placeholder:text-[var(--text-tertiary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Producer</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedCallSheet.producerName || ''}
                      onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, producerName: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Name"
                      className="flex-1 px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60 placeholder:text-[var(--text-tertiary)]"
                    />
                    <input
                      type="tel"
                      value={selectedCallSheet.producerPhone || ''}
                      onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, producerPhone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Phone"
                      className="w-36 px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60 placeholder:text-[var(--text-tertiary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">1st AD</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedCallSheet.firstADName || ''}
                      onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, firstADName: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Name"
                      className="flex-1 px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60 placeholder:text-[var(--text-tertiary)]"
                    />
                    <input
                      type="tel"
                      value={selectedCallSheet.firstADPhone || ''}
                      onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, firstADPhone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Phone"
                      className="w-36 px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60 placeholder:text-[var(--text-tertiary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Production Manager</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedCallSheet.productionManagerName || ''}
                      onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, productionManagerName: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Name"
                      className="flex-1 px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60 placeholder:text-[var(--text-tertiary)]"
                    />
                    <input
                      type="tel"
                      value={selectedCallSheet.productionManagerPhone || ''}
                      onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, productionManagerPhone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Phone"
                      className="w-36 px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60 placeholder:text-[var(--text-tertiary)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-[var(--bg-2)] rounded-lg p-4 border border-[var(--border-default)]">
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
                Additional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Safety Notes</label>
                  <textarea
                    value={selectedCallSheet.safetyNotes || ''}
                    onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, safetyNotes: e.target.value })}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Special Instructions</label>
                  <textarea
                    value={selectedCallSheet.specialInstructions || ''}
                    onChange={(e) => setSelectedCallSheet({ ...selectedCallSheet, specialInstructions: e.target.value })}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenes' && selectedCallSheet && (
          <div className="space-y-4">
            {isEditing && (
              <Button onClick={addScene} variant="secondary" className="flex items-center gap-2">
                <Icons.Plus className="w-4 h-4" />
                Add Scene
              </Button>
            )}
            {selectedCallSheet.scenes.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-secondary)]">
                No scenes added yet
              </div>
            ) : (
              <div className="space-y-3">
                {selectedCallSheet.scenes.map((scene, index) => (
                  <div key={scene.id} className="bg-[var(--bg-2)] rounded-lg p-4 border border-[var(--border-default)]">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Scene #</label>
                          <input
                            type="text"
                            value={scene.sceneNumber}
                            onChange={(e) => updateScene(index, { sceneNumber: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Time</label>
                          <input
                            type="time"
                            value={scene.scheduledTime || ''}
                            onChange={(e) => updateScene(index, { scheduledTime: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Duration (min)</label>
                          <input
                            type="number"
                            value={scene.estimatedDuration || ''}
                            onChange={(e) => updateScene(index, { estimatedDuration: parseInt(e.target.value) || undefined })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Pages</label>
                          <input
                            type="number"
                            step="0.125"
                            value={scene.pageCount || ''}
                            onChange={(e) => updateScene(index, { pageCount: parseFloat(e.target.value) || undefined })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Description</label>
                          <input
                            type="text"
                            value={scene.description || ''}
                            onChange={(e) => updateScene(index, { description: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeScene(index)}
                          className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                        >
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cast' && selectedCallSheet && (
          <div className="space-y-4">
            {isEditing && (
              <Button onClick={addCast} variant="secondary" className="flex items-center gap-2">
                <Icons.Plus className="w-4 h-4" />
                Add Cast Member
              </Button>
            )}
            {selectedCallSheet.cast.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-secondary)]">
                No cast members added yet
              </div>
            ) : (
              <div className="space-y-3">
                {selectedCallSheet.cast.map((cast, index) => (
                  <div key={cast.id} className="bg-[var(--bg-2)] rounded-lg p-4 border border-[var(--border-default)]">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Actor Name</label>
                          <input
                            type="text"
                            value={cast.actorName}
                            onChange={(e) => updateCast(index, { actorName: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Character</label>
                          <input
                            type="text"
                            value={cast.characterName || ''}
                            onChange={(e) => updateCast(index, { characterName: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Makeup Call</label>
                          <input
                            type="time"
                            value={cast.makeupCall || ''}
                            onChange={(e) => updateCast(index, { makeupCall: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Call to Set</label>
                          <input
                            type="time"
                            value={cast.callToSet || ''}
                            onChange={(e) => updateCast(index, { callToSet: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Phone</label>
                          <input
                            type="tel"
                            value={cast.phone || ''}
                            onChange={(e) => updateCast(index, { phone: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Notes</label>
                          <input
                            type="text"
                            value={cast.notes || ''}
                            onChange={(e) => updateCast(index, { notes: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeCast(index)}
                          className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                        >
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'crew' && selectedCallSheet && (
          <div className="space-y-4">
            {isEditing && (
              <Button onClick={addCrew} variant="secondary" className="flex items-center gap-2">
                <Icons.Plus className="w-4 h-4" />
                Add Crew Member
              </Button>
            )}
            {selectedCallSheet.crew.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-secondary)]">
                No crew members added yet
              </div>
            ) : (
              <div className="space-y-3">
                {selectedCallSheet.crew.map((crew, index) => (
                  <div key={crew.id} className="bg-[var(--bg-2)] rounded-lg p-4 border border-[var(--border-default)]">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-5 gap-4">
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Name</label>
                          <input
                            type="text"
                            value={crew.name}
                            onChange={(e) => updateCrew(index, { name: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Role</label>
                          <input
                            type="text"
                            value={crew.role}
                            onChange={(e) => updateCrew(index, { role: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Department</label>
                          <select
                            value={crew.department}
                            onChange={(e) => updateCrew(index, { department: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          >
                            {DEPARTMENTS.map((dept) => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Call Time</label>
                          <input
                            type="time"
                            value={crew.callTime || ''}
                            onChange={(e) => updateCrew(index, { callTime: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Phone</label>
                          <input
                            type="tel"
                            value={crew.phone || ''}
                            onChange={(e) => updateCrew(index, { phone: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-2 py-1 bg-[var(--bg-1)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] disabled:opacity-60"
                          />
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeCrew(index)}
                          className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                        >
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
