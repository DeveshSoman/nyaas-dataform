
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type definitions
interface PersonData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nativePlace: string;
  currentPlace: string;
  contactNumber: string;
  maritalStatus: string;
  occupation: string;
  numberOfSons?: number;
  numberOfDaughters?: number;
  phoneNumber?: string;
  spouse?: SpouseData | null;
}

interface SpouseData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  nativePlace: string;
  dateOfBirth: string;
  occupation: string;
  numberOfChildren: number;
  grandchildren: GrandchildData[];
}

interface GrandchildData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  dateOfBirth: string;
  occupation: string;
  currentPlace: string;
  phoneNumber: string;
}

const FamilyForm = () => {
  const [familyHead, setFamilyHead] = useState<PersonData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nativePlace: '',
    currentPlace: '',
    contactNumber: '',
    maritalStatus: '',
    occupation: ''
  });

  const [spouse, setSpouse] = useState<PersonData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nativePlace: '',
    currentPlace: '',
    contactNumber: '',
    maritalStatus: '',
    occupation: '',
    numberOfSons: 0,
    numberOfDaughters: 0
  });

  const [sons, setSons] = useState<PersonData[]>([]);
  const [daughters, setDaughters] = useState<PersonData[]>([]);

  // Utility functions
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateContactNumber = (number: string): boolean => {
    return /^\d+$/.test(number);
  };

  const handleFamilyHeadChange = (field: keyof PersonData, value: string | number) => {
    setFamilyHead(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.toUpperCase() : value
    }));
  };

  const handleSpouseChange = (field: keyof PersonData, value: string | number) => {
    setSpouse(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.toUpperCase() : value
    }));
  };

  const generateChildrenForms = (type: 'sons' | 'daughters', count: number) => {
    const newChildren: PersonData[] = [];
    for (let i = 0; i < count; i++) {
      newChildren.push({
        firstName: '',
        lastName: '',
        contactNumber: '',
        dateOfBirth: '',
        occupation: '',
        currentPlace: '',
        phoneNumber: '',
        maritalStatus: '',
        nativePlace: '',
        spouse: null
      });
    }
    
    if (type === 'sons') {
      setSons(newChildren);
    } else {
      setDaughters(newChildren);
    }
  };

  const updateChild = (type: 'sons' | 'daughters', index: number, field: keyof PersonData, value: string) => {
    const updateFunction = type === 'sons' ? setSons : setDaughters;
    const currentChildren = type === 'sons' ? sons : daughters;
    
    updateFunction(prev => prev.map((child, i) => 
      i === index 
        ? { ...child, [field]: typeof value === 'string' ? value.toUpperCase() : value }
        : child
    ));
  };

  const submitForm = async () => {
    console.log('=== STARTING FORM SUBMISSION ===');
    console.log('Family head data:', familyHead);
    console.log('Spouse data:', spouse);
    console.log('Sons data:', sons);
    console.log('Daughters data:', daughters);

    // Basic validation
    if (!familyHead.firstName || !familyHead.lastName || !familyHead.dateOfBirth) {
      toast.error('Please fill in family head details');
      return;
    }

    try {
      // Calculate age for family head
      const headAge = calculateAge(familyHead.dateOfBirth);
      
      // Insert family head
      const { data: familyHeadData, error: familyHeadError } = await supabase
        .from('family_heads')
        .insert({
          first_name: familyHead.firstName,
          last_name: familyHead.lastName,
          date_of_birth: familyHead.dateOfBirth,
          age: headAge,
          native_place: familyHead.nativePlace || null,
          current_place: familyHead.currentPlace || null,
          contact_number: familyHead.contactNumber || null,
          marital_status: familyHead.maritalStatus as any,
          occupation: familyHead.occupation as any || null
        })
        .select()
        .single();

      if (familyHeadError) {
        console.error('Family head insertion error:', familyHeadError);
        throw familyHeadError;
      }

      console.log('Family head inserted successfully:', familyHeadData);
      const familyHeadId = familyHeadData.id;

      // Insert spouse if married
      if (familyHead.maritalStatus === 'married' && (spouse.firstName || spouse.lastName)) {
        const spouseAge = spouse.dateOfBirth ? calculateAge(spouse.dateOfBirth) : null;
        
        const { error: spouseError } = await supabase
          .from('spouses')
          .insert({
            family_head_id: familyHeadId,
            first_name: spouse.firstName || null,
            last_name: spouse.lastName || null,
            date_of_birth: spouse.dateOfBirth || null,
            age: spouseAge,
            native_place: spouse.nativePlace || null,
            contact_number: spouse.contactNumber || null,
            occupation: spouse.occupation as any || null,
            number_of_sons: spouse.numberOfSons || 0,
            number_of_daughters: spouse.numberOfDaughters || 0
          });

        if (spouseError) {
          console.error('Spouse insertion error:', spouseError);
          throw spouseError;
        }
        console.log('Spouse inserted successfully');
      }

      // Insert children (sons and daughters)
      const allChildren = [
        ...sons.map((son, index) => ({ ...son, child_type: 'son', child_index: index })),
        ...daughters.map((daughter, index) => ({ ...daughter, child_type: 'daughter', child_index: index }))
      ];

      for (const child of allChildren) {
        if (!child.firstName && !child.lastName) continue;

        const childAge = child.dateOfBirth ? calculateAge(child.dateOfBirth) : null;
        
        const { error: childError } = await supabase
          .from('children')
          .insert({
            family_head_id: familyHeadId,
            first_name: child.firstName || null,
            last_name: child.lastName || null,
            contact_number: child.contactNumber || null,
            date_of_birth: child.dateOfBirth || null,
            age: childAge,
            occupation: child.occupation as any || null,
            current_place: child.currentPlace || null,
            phone_number: child.phoneNumber || null,
            marital_status: child.maritalStatus as any || null,
            child_type: child.child_type,
            child_index: child.child_index
          });

        if (childError) {
          console.error('Child insertion error:', childError);
          throw childError;
        }
      }

      console.log('=== ALL DATA SAVED SUCCESSFULLY ===');
      toast.success('Family information has been saved successfully!');
      
      // Reset form
      setFamilyHead({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nativePlace: '',
        currentPlace: '',
        contactNumber: '',
        maritalStatus: '',
        occupation: ''
      });
      setSpouse({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nativePlace: '',
        currentPlace: '',
        contactNumber: '',
        maritalStatus: '',
        occupation: '',
        numberOfSons: 0,
        numberOfDaughters: 0
      });
      setSons([]);
      setDaughters([]);
      
    } catch (error) {
      console.error('=== FORM SUBMISSION ERROR ===', error);
      toast.error(`Failed to save family information: ${(error as Error).message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
        {/* Family Head Section */}
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
                onChange={(e) => handleFamilyHeadChange('firstName', e.target.value)}
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
                onChange={(e) => handleFamilyHeadChange('lastName', e.target.value)}
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
                onChange={(e) => handleFamilyHeadChange('dateOfBirth', e.target.value)}
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
                onChange={(e) => handleFamilyHeadChange('nativePlace', e.target.value)}
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
                onChange={(e) => handleFamilyHeadChange('currentPlace', e.target.value)}
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
                onChange={(e) => handleFamilyHeadChange('contactNumber', e.target.value)}
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
                onChange={(e) => handleFamilyHeadChange('maritalStatus', e.target.value)}
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
                onChange={(e) => handleFamilyHeadChange('occupation', e.target.value)}
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

        {/* Spouse Section */}
        {familyHead.maritalStatus === 'married' && (
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
                  onChange={(e) => handleSpouseChange('firstName', e.target.value)}
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
                  onChange={(e) => handleSpouseChange('lastName', e.target.value)}
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
                  onChange={(e) => handleSpouseChange('dateOfBirth', e.target.value)}
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
                  onChange={(e) => handleSpouseChange('nativePlace', e.target.value)}
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
                  onChange={(e) => handleSpouseChange('contactNumber', e.target.value)}
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
                  onChange={(e) => handleSpouseChange('occupation', e.target.value)}
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
                    handleSpouseChange('numberOfSons', count);
                    generateChildrenForms('sons', count);
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
                    handleSpouseChange('numberOfDaughters', count);
                    generateChildrenForms('daughters', count);
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
        )}

        {/* Sons Section */}
        {sons.length > 0 && (
          <div className="mb-8 p-6 border rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Sons Information</h2>
            {sons.map((son, index) => (
              <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Son {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name / पहिले नाव
                    </label>
                    <input
                      type="text"
                      value={son.firstName}
                      onChange={(e) => updateChild('sons', index, 'firstName', e.target.value)}
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
                      value={son.lastName}
                      onChange={(e) => updateChild('sons', index, 'lastName', e.target.value)}
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
                      value={son.dateOfBirth}
                      onChange={(e) => updateChild('sons', index, 'dateOfBirth', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {son.dateOfBirth && (
                      <div className="text-sm text-gray-600 mt-1">
                        Age: {calculateAge(son.dateOfBirth)}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number / संपर्क क्रमांक
                    </label>
                    <input
                      type="text"
                      value={son.contactNumber}
                      onChange={(e) => updateChild('sons', index, 'contactNumber', e.target.value)}
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
                      value={son.currentPlace}
                      onChange={(e) => updateChild('sons', index, 'currentPlace', e.target.value)}
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
                      value={son.phoneNumber || ''}
                      onChange={(e) => updateChild('sons', index, 'phoneNumber', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number / फोन नंबर प्रविष्ट करा"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occupation / व्यवसाय
                    </label>
                    <select
                      value={son.occupation}
                      onChange={(e) => updateChild('sons', index, 'occupation', e.target.value)}
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
                      value={son.maritalStatus}
                      onChange={(e) => updateChild('sons', index, 'maritalStatus', e.target.value)}
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
        )}

        {/* Daughters Section */}
        {daughters.length > 0 && (
          <div className="mb-8 p-6 border rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Daughters Information</h2>
            {daughters.map((daughter, index) => (
              <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Daughter {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name / पहिले नाव
                    </label>
                    <input
                      type="text"
                      value={daughter.firstName}
                      onChange={(e) => updateChild('daughters', index, 'firstName', e.target.value)}
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
                      value={daughter.lastName}
                      onChange={(e) => updateChild('daughters', index, 'lastName', e.target.value)}
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
                      value={daughter.dateOfBirth}
                      onChange={(e) => updateChild('daughters', index, 'dateOfBirth', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {daughter.dateOfBirth && (
                      <div className="text-sm text-gray-600 mt-1">
                        Age: {calculateAge(daughter.dateOfBirth)}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number / संपर्क क्रमांक
                    </label>
                    <input
                      type="text"
                      value={daughter.contactNumber}
                      onChange={(e) => updateChild('daughters', index, 'contactNumber', e.target.value)}
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
                      value={daughter.currentPlace}
                      onChange={(e) => updateChild('daughters', index, 'currentPlace', e.target.value)}
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
                      value={daughter.phoneNumber || ''}
                      onChange={(e) => updateChild('daughters', index, 'phoneNumber', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number / फोन नंबर प्रविष्ट करा"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occupation / व्यवसाय
                    </label>
                    <select
                      value={daughter.occupation}
                      onChange={(e) => updateChild('daughters', index, 'occupation', e.target.value)}
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
                      value={daughter.maritalStatus}
                      onChange={(e) => updateChild('daughters', index, 'maritalStatus', e.target.value)}
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
        )}

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105"
          >
            Submit Family Information / कुटुंब माहिती सबमिट करा
          </button>
        </div>
      </form>
    </div>
  );
};

export default FamilyForm;
