
import React from 'react';
import { PersonData } from '@/types/family';
import { calculateAge } from '@/utils/familyFormUtils';

interface ChildrenSectionProps {
  children: PersonData[];
  childType: 'sons' | 'daughters';
  onChildUpdate: (index: number, field: keyof PersonData, value: string) => void;
}

const ChildrenSection: React.FC<ChildrenSectionProps> = ({ children, childType, onChildUpdate }) => {
  if (children.length === 0) return null;

  const title = childType === 'sons' ? 'Sons Information' : 'Daughters Information';
  const childLabel = childType === 'sons' ? 'Son' : 'Daughter';

  return (
    <div className="mb-8 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">{title}</h2>
      {children.map((child, index) => (
        <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">{childLabel} {index + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name / पहिले नाव
              </label>
              <input
                type="text"
                value={child.firstName}
                onChange={(e) => onChildUpdate(index, 'firstName', e.target.value)}
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
                value={child.lastName}
                onChange={(e) => onChildUpdate(index, 'lastName', e.target.value)}
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
                value={child.dateOfBirth}
                onChange={(e) => onChildUpdate(index, 'dateOfBirth', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {child.dateOfBirth && (
                <div className="text-sm text-gray-600 mt-1">
                  Age: {calculateAge(child.dateOfBirth)}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number / संपर्क क्रमांक
              </label>
              <input
                type="text"
                value={child.contactNumber}
                onChange={(e) => onChildUpdate(index, 'contactNumber', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Place / सध्याचे ठिकाण
              </label>
              <input
                type="text"
                value={child.currentPlace}
                onChange={(e) => onChildUpdate(index, 'currentPlace', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current place / सध्याचे ठिकाण प्रविष्ट करा"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number / फोन नंबर
              </label>
              <input
                type="text"
                value={child.phoneNumber || ''}
                onChange={(e) => onChildUpdate(index, 'phoneNumber', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number / फोन नंबर प्रविष्ट करा"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Occupation / व्यवसाय
              </label>
              <select
                value={child.occupation}
                onChange={(e) => onChildUpdate(index, 'occupation', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select occupation / व्यवसाय निवडा</option>
                <option value="salaried">Salaried / नोकरदार</option>
                <option value="business">Business / व्यवसाय</option>
                <option value="student">Student / विद्यार्थी</option>
                <option value="unemployed">Unemployed / बेरोजगार</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marital Status / वैवाहिक स्थिती
              </label>
              <select
                value={child.maritalStatus}
                onChange={(e) => onChildUpdate(index, 'maritalStatus', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select marital status / वैवाहिक स्थिती निवडा</option>
                <option value="single">Single / अविवाहित</option>
                <option value="married">Married / विवाहित</option>
                <option value="divorced">Divorced / घटस्फोटित</option>
                <option value="widowed">Widowed / विधवा</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChildrenSection;
