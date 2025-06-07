
import React from 'react';
import { PersonData } from '@/types/family';
import { calculateAge, validateContactNumber } from '@/utils/familyFormUtils';

interface FamilyHeadSectionProps {
  familyHead: PersonData;
  onFamilyHeadChange: (field: keyof PersonData, value: string | number) => void;
}

const FamilyHeadSection: React.FC<FamilyHeadSectionProps> = ({ familyHead, onFamilyHeadChange }) => {
  return (
    <div className="mb-8 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Family Head Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name / पहिले नाव *
          </label>
          <input
            type="text"
            value={familyHead.firstName}
            onChange={(e) => onFamilyHeadChange('firstName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name / आडनाव *
          </label>
          <input
            type="text"
            value={familyHead.lastName}
            onChange={(e) => onFamilyHeadChange('lastName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter last name / आडनाव प्रविष्ट करा"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth / जन्म तारीख *
          </label>
          <input
            type="date"
            value={familyHead.dateOfBirth}
            onChange={(e) => onFamilyHeadChange('dateOfBirth', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {familyHead.dateOfBirth && (
            <div className="text-sm text-gray-600 mt-1">
              Age: {calculateAge(familyHead.dateOfBirth)}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Native Place / मूळ गाव
          </label>
          <input
            type="text"
            value={familyHead.nativePlace}
            onChange={(e) => onFamilyHeadChange('nativePlace', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter native place / मूळ गाव प्रविष्ट करा"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Place / सध्याचे ठिकाण
          </label>
          <input
            type="text"
            value={familyHead.currentPlace}
            onChange={(e) => onFamilyHeadChange('currentPlace', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter current place / सध्याचे ठिकाण प्रविष्ट करा"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number / संपर्क क्रमांक
          </label>
          <input
            type="text"
            value={familyHead.contactNumber}
            onChange={(e) => onFamilyHeadChange('contactNumber', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
          />
          {familyHead.contactNumber && !validateContactNumber(familyHead.contactNumber) && (
            <div className="text-red-500 text-sm mt-1">
              Contact number must contain only numbers
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marital Status / वैवाहिक स्थिती *
          </label>
          <select
            value={familyHead.maritalStatus}
            onChange={(e) => onFamilyHeadChange('maritalStatus', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select marital status / वैवाहिक स्थिती निवडा</option>
            <option value="single">Single / अविवाहित</option>
            <option value="married">Married / विवाहित</option>
            <option value="divorced">Divorced / घटस्फोटित</option>
            <option value="widowed">Widowed / विधवा</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Occupation / व्यवसाय
          </label>
          <select
            value={familyHead.occupation}
            onChange={(e) => onFamilyHeadChange('occupation', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select occupation / व्यवसाय निवडा</option>
            <option value="retired">Retired / निवृत्त</option>
            <option value="housewife">Housewife / गृहिणी</option>
            <option value="salaried">Salaried / नोकरदार</option>
            <option value="business">Business / व्यवसाय</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FamilyHeadSection;
