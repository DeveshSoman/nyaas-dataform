
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PersonData } from '@/types/family';
import { calculateAge } from '@/utils/familyFormUtils';
import { downloadFormData } from '@/utils/csvExporter';
import FamilyHeadSection from '@/components/family/FamilyHeadSection';
import SpouseSection from '@/components/family/SpouseSection';
import ChildrenSection from '@/components/family/ChildrenSection';
import PasswordDialog from '@/components/family/PasswordDialog';
import ExportSection from '@/components/family/ExportSection';

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

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');

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

  const handleDownloadRequest = () => {
    setShowPasswordDialog(true);
    setPassword('');
  };

  const handlePasswordSubmit = async () => {
    if (password !== '3575') {
      toast.error('Incorrect password');
      return;
    }
    
    setShowPasswordDialog(false);
    try {
      await downloadFormData();
      toast.success('Family data downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background rounded-lg shadow-lg">
      <ExportSection onDownloadRequest={handleDownloadRequest} />

      <PasswordDialog
        isOpen={showPasswordDialog}
        password={password}
        onPasswordChange={setPassword}
        onSubmit={handlePasswordSubmit}
        onCancel={() => setShowPasswordDialog(false)}
      />

      <form onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
        <FamilyHeadSection
          familyHead={familyHead}
          onFamilyHeadChange={handleFamilyHeadChange}
        />

        {familyHead.maritalStatus === 'married' && (
          <SpouseSection
            spouse={spouse}
            onSpouseChange={handleSpouseChange}
            onChildrenCountChange={generateChildrenForms}
          />
        )}

        <ChildrenSection
          children={sons}
          childType="sons"
          onChildUpdate={(index, field, value) => updateChild('sons', index, field, value)}
        />

        <ChildrenSection
          children={daughters}
          childType="daughters"
          onChildUpdate={(index, field, value) => updateChild('daughters', index, field, value)}
        />

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
