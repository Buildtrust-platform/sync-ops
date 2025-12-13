'use client';

import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useToast } from '@/app/components/Toast';

const client = generateClient<Schema>();

interface CallSheetFormProps {
  projectId: string;
  onSuccess?: (callSheetId: string) => void;
  onCancel?: () => void;
}

export default function CallSheetForm({ projectId, onSuccess, onCancel }: CallSheetFormProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Production Information
    productionTitle: '',
    productionCompany: '',
    shootDayNumber: 1,
    totalShootDays: 1,
    shootDate: '',
    episodeNumber: '',

    // General Call Information
    generalCrewCall: '07:00',
    estimatedWrap: '18:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Location Information
    primaryLocation: '',
    primaryLocationAddress: '',
    parkingInstructions: '',
    nearestHospital: '',
    hospitalAddress: '',

    // Weather
    weatherForecast: '',
    temperature: '',
    sunset: '',

    // Production Contacts
    directorName: '',
    directorPhone: '',
    producerName: '',
    producerPhone: '',
    firstADName: '',
    firstADPhone: '',
    productionManagerName: '',
    productionManagerPhone: '',
    productionOfficePhone: '',

    // Additional Information
    mealTimes: '',
    cateringLocation: '',
    transportationNotes: '',
    safetyNotes: '',
    specialInstructions: '',
    nextDaySchedule: '',
  });

  const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'PUBLISHED') => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await client.models.CallSheet.create({
        projectId,
        ...formData,
        shootDayNumber: Number(formData.shootDayNumber),
        totalShootDays: Number(formData.totalShootDays),
        status,
        publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : undefined,
        lastUpdatedBy: 'current-user', // TODO: Get from auth context
      });

      if (result.data?.id && onSuccess) {
        onSuccess(result.data.id);
      }
    } catch (error) {
      console.error('Error creating call sheet:', error);
      toast.error('Error', 'Failed to create call sheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form className="space-y-8">
      {/* Production Information */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Production Information</h2>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="productionTitle" className="block text-sm font-medium leading-6 text-gray-900">
                Production Title
              </label>
              <input
                type="text"
                id="productionTitle"
                value={formData.productionTitle}
                onChange={(e) => handleChange('productionTitle', e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="productionCompany" className="block text-sm font-medium leading-6 text-gray-900">
                Production Company
              </label>
              <input
                type="text"
                id="productionCompany"
                value={formData.productionCompany}
                onChange={(e) => handleChange('productionCompany', e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="shootDate" className="block text-sm font-medium leading-6 text-gray-900">
                Shoot Date *
              </label>
              <input
                type="date"
                id="shootDate"
                required
                value={formData.shootDate}
                onChange={(e) => handleChange('shootDate', e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="episodeNumber" className="block text-sm font-medium leading-6 text-gray-900">
                Episode Number
              </label>
              <input
                type="text"
                id="episodeNumber"
                value={formData.episodeNumber}
                onChange={(e) => handleChange('episodeNumber', e.target.value)}
                placeholder="E.g., S01E01"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="shootDayNumber" className="block text-sm font-medium leading-6 text-gray-900">
                Shoot Day Number
              </label>
              <input
                type="number"
                id="shootDayNumber"
                min="1"
                value={formData.shootDayNumber}
                onChange={(e) => handleChange('shootDayNumber', parseInt(e.target.value))}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="totalShootDays" className="block text-sm font-medium leading-6 text-gray-900">
                Total Shoot Days
              </label>
              <input
                type="number"
                id="totalShootDays"
                min="1"
                value={formData.totalShootDays}
                onChange={(e) => handleChange('totalShootDays', parseInt(e.target.value))}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Call Times */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Call Times</h2>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="generalCrewCall" className="block text-sm font-medium leading-6 text-gray-900">
                General Crew Call
              </label>
              <input
                type="time"
                id="generalCrewCall"
                value={formData.generalCrewCall}
                onChange={(e) => handleChange('generalCrewCall', e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="estimatedWrap" className="block text-sm font-medium leading-6 text-gray-900">
                Estimated Wrap
              </label>
              <input
                type="time"
                id="estimatedWrap"
                value={formData.estimatedWrap}
                onChange={(e) => handleChange('estimatedWrap', e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="timezone" className="block text-sm font-medium leading-6 text-gray-900">
                Timezone
              </label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Australia/Sydney">Sydney (AEDT)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Location Information</h2>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="primaryLocation" className="block text-sm font-medium leading-6 text-gray-900">
                Primary Location
              </label>
              <input
                type="text"
                id="primaryLocation"
                value={formData.primaryLocation}
                onChange={(e) => handleChange('primaryLocation', e.target.value)}
                placeholder="E.g., Studio 5, Riverside Park"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="primaryLocationAddress" className="block text-sm font-medium leading-6 text-gray-900">
                Address
              </label>
              <input
                type="text"
                id="primaryLocationAddress"
                value={formData.primaryLocationAddress}
                onChange={(e) => handleChange('primaryLocationAddress', e.target.value)}
                placeholder="Full street address"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="parkingInstructions" className="block text-sm font-medium leading-6 text-gray-900">
                Parking Instructions
              </label>
              <textarea
                id="parkingInstructions"
                rows={2}
                value={formData.parkingInstructions}
                onChange={(e) => handleChange('parkingInstructions', e.target.value)}
                placeholder="Where to park, permits needed, etc."
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="nearestHospital" className="block text-sm font-medium leading-6 text-gray-900">
                Nearest Hospital
              </label>
              <input
                type="text"
                id="nearestHospital"
                value={formData.nearestHospital}
                onChange={(e) => handleChange('nearestHospital', e.target.value)}
                placeholder="Hospital name"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="hospitalAddress" className="block text-sm font-medium leading-6 text-gray-900">
                Hospital Address
              </label>
              <input
                type="text"
                id="hospitalAddress"
                value={formData.hospitalAddress}
                onChange={(e) => handleChange('hospitalAddress', e.target.value)}
                placeholder="Hospital address"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Production Contacts */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Production Contacts</h2>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="directorName" className="block text-sm font-medium leading-6 text-gray-900">
                Director Name
              </label>
              <input
                type="text"
                id="directorName"
                value={formData.directorName}
                onChange={(e) => handleChange('directorName', e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="directorPhone" className="block text-sm font-medium leading-6 text-gray-900">
                Director Phone
              </label>
              <input
                type="tel"
                id="directorPhone"
                value={formData.directorPhone}
                onChange={(e) => handleChange('directorPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="producerName" className="block text-sm font-medium leading-6 text-gray-900">
                Producer Name
              </label>
              <input
                type="text"
                id="producerName"
                value={formData.producerName}
                onChange={(e) => handleChange('producerName', e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="producerPhone" className="block text-sm font-medium leading-6 text-gray-900">
                Producer Phone
              </label>
              <input
                type="tel"
                id="producerPhone"
                value={formData.producerPhone}
                onChange={(e) => handleChange('producerPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="firstADName" className="block text-sm font-medium leading-6 text-gray-900">
                1st AD Name
              </label>
              <input
                type="text"
                id="firstADName"
                value={formData.firstADName}
                onChange={(e) => handleChange('firstADName', e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="firstADPhone" className="block text-sm font-medium leading-6 text-gray-900">
                1st AD Phone
              </label>
              <input
                type="tel"
                id="firstADPhone"
                value={formData.firstADPhone}
                onChange={(e) => handleChange('firstADPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="productionManagerName" className="block text-sm font-medium leading-6 text-gray-900">
                Production Manager Name
              </label>
              <input
                type="text"
                id="productionManagerName"
                value={formData.productionManagerName}
                onChange={(e) => handleChange('productionManagerName', e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="productionManagerPhone" className="block text-sm font-medium leading-6 text-gray-900">
                Production Manager Phone
              </label>
              <input
                type="tel"
                id="productionManagerPhone"
                value={formData.productionManagerPhone}
                onChange={(e) => handleChange('productionManagerPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="productionOfficePhone" className="block text-sm font-medium leading-6 text-gray-900">
                Production Office Phone
              </label>
              <input
                type="tel"
                id="productionOfficePhone"
                value={formData.productionOfficePhone}
                onChange={(e) => handleChange('productionOfficePhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Additional Information</h2>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="mealTimes" className="block text-sm font-medium leading-6 text-gray-900">
                Meal Times
              </label>
              <input
                type="text"
                id="mealTimes"
                value={formData.mealTimes}
                onChange={(e) => handleChange('mealTimes', e.target.value)}
                placeholder="E.g., Breakfast 7:30 AM, Lunch 1:00 PM"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="cateringLocation" className="block text-sm font-medium leading-6 text-gray-900">
                Catering Location
              </label>
              <input
                type="text"
                id="cateringLocation"
                value={formData.cateringLocation}
                onChange={(e) => handleChange('cateringLocation', e.target.value)}
                placeholder="Where meals will be served"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="transportationNotes" className="block text-sm font-medium leading-6 text-gray-900">
                Transportation Notes
              </label>
              <textarea
                id="transportationNotes"
                rows={2}
                value={formData.transportationNotes}
                onChange={(e) => handleChange('transportationNotes', e.target.value)}
                placeholder="Shuttle information, pickup points, etc."
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="safetyNotes" className="block text-sm font-medium leading-6 text-gray-900">
                Safety Notes
              </label>
              <textarea
                id="safetyNotes"
                rows={2}
                value={formData.safetyNotes}
                onChange={(e) => handleChange('safetyNotes', e.target.value)}
                placeholder="PPE requirements, hazards, etc."
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="specialInstructions" className="block text-sm font-medium leading-6 text-gray-900">
                Special Instructions
              </label>
              <textarea
                id="specialInstructions"
                rows={3}
                value={formData.specialInstructions}
                onChange={(e) => handleChange('specialInstructions', e.target.value)}
                placeholder="Any other important information"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="nextDaySchedule" className="block text-sm font-medium leading-6 text-gray-900">
                Next Day Schedule Preview
              </label>
              <textarea
                id="nextDaySchedule"
                rows={2}
                value={formData.nextDaySchedule}
                onChange={(e) => handleChange('nextDaySchedule', e.target.value)}
                placeholder="Brief preview of tomorrow's shoot"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-x-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold leading-6 text-gray-900"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'DRAFT')}
          disabled={loading}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'PUBLISHED')}
          disabled={loading}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish Call Sheet'}
        </button>
      </div>
    </form>
  );
}
