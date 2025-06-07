
import React from 'react';
import { PersonData } from '@/types/family';
import { calculateAge } from '@/utils/familyFormUtils';

interface SpouseSectionProps {
  spouse: PersonData;
  onSpouseChange: (field: keyof PersonData, value: string | number) => void;
  onChildrenCountChange: (type: 'sons' | 'daughters', count: number) => void;
}

const SpouseSection: React.FC<SpouseSectionProps> = ({ spouse, onSpouseChange, onChildrenCountChange }) => {
  return (
    <div className="mb-8 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Spouse Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name / पहिले नाव
          </label>
          <input
            type="text"
            value={spouse.firstName}
            onChange={(e) => onSpouseChange('firstName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name / आडनाव
          </label>
          <input
            type="text"
            value={spouse.lastName}
            onChange={(e) => onSpouseChange('lastName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter last name / आडनाव प्रविष्ट करा"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth / जन्म तारीख
          </label>
          <input
            type="date"
            value={spouse.dateOfBirth}
            onChange={(e) => onSpouseChange('dateOfBirth', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {spouse.dateOfBirth && (
            <div className="text-sm text-gray-600 mt-1">
              Age: {calculateAge(spouse.dateOfBirth)}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Native Place / मूळ गाव
          </label>
          <input
            type="text"
            value={spouse.nativePlace}
            onChange={(e) => onSpouseChange('nativePlace', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter native place / मूळ गाव प्रविष्ट करा"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number / संपर्क क्रमांक
          </label>
          <input
            type="text"
            value={spouse.contactNumber}
            onChange={(e) => onSpouseChange('contactNumber', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Occupation / व्यवसाय
          </label>
          <select
            value={spouse.occupation}
            onChange={(e) => onSpouseChange('occupation', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select occupation / व्यवसाय निवडा</option>
            <option value="retired">Retired / निवृत्त</option>
            <option value="housewife">Housewife / गृहिणी</option>
            <option value="salaried">Salaried / नोकरदार</option>
            <option value="business">Business / व्यवसाय</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Sons / मुलांची संख्या
          </label>
          <select
            value={spouse.numberOfSons || 0}
            onChange={(e) => {
              const count = parseInt(e.target.value);
              onSpouseChange('numberOfSons', count);
              onChildrenCountChange('sons', count);
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[...Array(11)].map((_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Daughters / मुलींची संख्या
          </label>
          <select
            value={spouse.numberOfDaughters || 0}
            onChange={(e) => {
              const count = parseInt(e.target.value);
              onSpouseChange('numberOfDaughters', count);
              onChildrenCountChange('daughters', count);
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[...Array(11)].map((_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SpouseSection;
