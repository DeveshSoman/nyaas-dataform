
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FamilyData {
  familyHead: any;
  spouse: any;
  sons: any[];
  daughters: any[];
}

const FamilyForm = () => {
  const { toast } = useToast();
  const [familyData, setFamilyData] = useState<FamilyData>({
    familyHead: {},
    spouse: {},
    sons: [],
    daughters: []
  });

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    
    let dateObj: Date;
    
    // Handle dd/mm/yyyy format
    if (birthDate.includes('/')) {
      const [day, month, year] = birthDate.split('/');
      dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // Handle yyyy-mm-dd format (from date input)
      dateObj = new Date(birthDate);
    }
    
    if (isNaN(dateObj.getTime())) return 0;
    
    const today = new Date();
    let age = today.getFullYear() - dateObj.getFullYear();
    const monthDiff = today.getMonth() - dateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
      age--;
    }
    
    return age;
  };

  const convertToDBDate = (dateStr: string): string => {
    if (!dateStr) return '';
    
    // If it's already in yyyy-mm-dd format, return as is
    if (dateStr.includes('-')) {
      return dateStr;
    }
    
    // Convert dd/mm/yyyy to yyyy-mm-dd
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateStr;
  };

  const handleSubmit = async () => {
    console.log('Starting form submission...');
    console.log('Current family data:', familyData);

    try {
      // Insert family head
      console.log('Inserting family head:', familyData.familyHead);
      
      const familyHeadData = {
        first_name: familyData.familyHead.firstName || '',
        last_name: familyData.familyHead.lastName || '',
        date_of_birth: convertToDBDate(familyData.familyHead.dateOfBirth),
        age: familyData.familyHead.dateOfBirth ? calculateAge(familyData.familyHead.dateOfBirth) : 0,
        native_place: familyData.familyHead.nativePlace || '',
        current_place: familyData.familyHead.currentPlace || '',
        contact_number: familyData.familyHead.contactNumber || '',
        marital_status: familyData.familyHead.maritalStatus || 'single',
        occupation: familyData.familyHead.occupation || 'unemployed'
      };

      console.log('Processed family head data:', familyHeadData);

      const { data: familyHeadResult, error: familyHeadError } = await supabase
        .from('family_heads')
        .insert([familyHeadData])
        .select()
        .single();

      if (familyHeadError) {
        console.error('Family head insert error:', familyHeadError);
        throw familyHeadError;
      }

      console.log('Family head inserted successfully:', familyHeadResult);

      // Insert spouse if married
      if (familyData.familyHead.maritalStatus === 'married' && familyData.spouse) {
        console.log('Inserting spouse:', familyData.spouse);
        
        const spouseData = {
          family_head_id: familyHeadResult.id,
          first_name: familyData.spouse.firstName || '',
          last_name: familyData.spouse.lastName || '',
          date_of_birth: convertToDBDate(familyData.spouse.dateOfBirth),
          age: familyData.spouse.dateOfBirth ? calculateAge(familyData.spouse.dateOfBirth) : 0,
          native_place: familyData.spouse.nativePlace || '',
          contact_number: familyData.spouse.contactNumber || '',
          occupation: familyData.spouse.occupation || 'unemployed',
          number_of_sons: familyData.spouse.numberOfSons || 0,
          number_of_daughters: familyData.spouse.numberOfDaughters || 0
        };

        console.log('Processed spouse data:', spouseData);

        const { data: spouseResult, error: spouseError } = await supabase
          .from('spouses')
          .insert([spouseData])
          .select()
          .single();

        if (spouseError) {
          console.error('Spouse insert error:', spouseError);
          throw spouseError;
        }

        console.log('Spouse inserted successfully:', spouseResult);
      }

      // Insert children
      const allChildren = [...familyData.sons, ...familyData.daughters];
      console.log('Inserting children:', allChildren);

      for (const child of allChildren) {
        if (child.firstName || child.lastName) {
          const childData = {
            family_head_id: familyHeadResult.id,
            first_name: child.firstName || '',
            last_name: child.lastName || '',
            date_of_birth: convertToDBDate(child.dateOfBirth),
            age: child.dateOfBirth ? calculateAge(child.dateOfBirth) : 0,
            contact_number: child.contactNumber || '',
            occupation: child.occupation || 'unemployed',
            current_place: child.currentPlace || '',
            phone_number: child.phoneNumber || '',
            marital_status: child.maritalStatus || 'single',
            child_type: child.type || 'son',
            child_index: child.index || 0
          };

          console.log('Inserting child:', childData);

          const { data: childResult, error: childError } = await supabase
            .from('children')
            .insert([childData])
            .select()
            .single();

          if (childError) {
            console.error('Child insert error:', childError);
            throw childError;
          }

          console.log('Child inserted successfully:', childResult);

          // Insert child spouse if married
          if (child.maritalStatus === 'married' && child.spouse) {
            const childSpouseData = {
              child_id: childResult.id,
              first_name: child.spouse.firstName || '',
              last_name: child.spouse.lastName || '',
              date_of_birth: convertToDBDate(child.spouse.dateOfBirth),
              age: child.spouse.dateOfBirth ? calculateAge(child.spouse.dateOfBirth) : 0,
              contact_number: child.spouse.contactNumber || '',
              native_place: child.spouse.nativePlace || '',
              occupation: child.spouse.occupation || 'unemployed',
              number_of_children: child.spouse.numberOfChildren || 0
            };

            console.log('Inserting child spouse:', childSpouseData);

            const { data: childSpouseResult, error: childSpouseError } = await supabase
              .from('child_spouses')
              .insert([childSpouseData])
              .select()
              .single();

            if (childSpouseError) {
              console.error('Child spouse insert error:', childSpouseError);
              throw childSpouseError;
            }

            console.log('Child spouse inserted successfully:', childSpouseResult);

            // Insert grandchildren
            if (child.spouse.grandchildren && child.spouse.grandchildren.length > 0) {
              for (const grandchild of child.spouse.grandchildren) {
                if (grandchild.firstName || grandchild.lastName) {
                  const grandchildData = {
                    child_spouse_id: childSpouseResult.id,
                    first_name: grandchild.firstName || '',
                    last_name: grandchild.lastName || '',
                    date_of_birth: convertToDBDate(grandchild.dateOfBirth),
                    age: grandchild.dateOfBirth ? calculateAge(grandchild.dateOfBirth) : 0,
                    contact_number: grandchild.contactNumber || '',
                    occupation: grandchild.occupation || 'unemployed',
                    current_place: grandchild.currentPlace || '',
                    phone_number: grandchild.phoneNumber || '',
                    grandchild_index: grandchild.index || 0
                  };

                  console.log('Inserting grandchild:', grandchildData);

                  const { error: grandchildError } = await supabase
                    .from('grandchildren')
                    .insert([grandchildData]);

                  if (grandchildError) {
                    console.error('Grandchild insert error:', grandchildError);
                    throw grandchildError;
                  }

                  console.log('Grandchild inserted successfully');
                }
              }
            }
          }
        }
      }

      console.log('All data inserted successfully!');
      toast({
        title: "Success!",
        description: "Family information has been saved successfully.",
      });

    } catch (error) {
      console.error('Error saving family data:', error);
      toast({
        title: "Error",
        description: `Failed to save family information: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Family Head Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={familyData.familyHead.firstName || ''}
                onChange={(e) => setFamilyData(prev => ({
                  ...prev,
                  familyHead: { ...prev.familyHead, firstName: e.target.value.toUpperCase() }
                }))}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={familyData.familyHead.lastName || ''}
                onChange={(e) => setFamilyData(prev => ({
                  ...prev,
                  familyHead: { ...prev.familyHead, lastName: e.target.value.toUpperCase() }
                }))}
                placeholder="Enter last name"
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={familyData.familyHead.dateOfBirth || ''}
                onChange={(e) => setFamilyData(prev => ({
                  ...prev,
                  familyHead: { ...prev.familyHead, dateOfBirth: e.target.value }
                }))}
              />
              {familyData.familyHead.dateOfBirth && (
                <p className="text-sm text-gray-600 mt-1">
                  Age: {calculateAge(familyData.familyHead.dateOfBirth)}
                </p>
              )}
            </div>
            <div>
              <Label>Native Place</Label>
              <Input
                value={familyData.familyHead.nativePlace || ''}
                onChange={(e) => setFamilyData(prev => ({
                  ...prev,
                  familyHead: { ...prev.familyHead, nativePlace: e.target.value.toUpperCase() }
                }))}
                placeholder="Enter native place"
              />
            </div>
            <div>
              <Label>Current Place</Label>
              <Input
                value={familyData.familyHead.currentPlace || ''}
                onChange={(e) => setFamilyData(prev => ({
                  ...prev,
                  familyHead: { ...prev.familyHead, currentPlace: e.target.value.toUpperCase() }
                }))}
                placeholder="Enter current place"
              />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input
                value={familyData.familyHead.contactNumber || ''}
                onChange={(e) => setFamilyData(prev => ({
                  ...prev,
                  familyHead: { ...prev.familyHead, contactNumber: e.target.value }
                }))}
                placeholder="Enter contact number"
              />
            </div>
            <div>
              <Label>Marital Status</Label>
              <Select
                value={familyData.familyHead.maritalStatus || ''}
                onValueChange={(value) => setFamilyData(prev => ({
                  ...prev,
                  familyHead: { ...prev.familyHead, maritalStatus: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Occupation</Label>
              <Select
                value={familyData.familyHead.occupation || ''}
                onValueChange={(value) => setFamilyData(prev => ({
                  ...prev,
                  familyHead: { ...prev.familyHead, occupation: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select occupation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleSubmit} className="px-8 py-3">
          Submit Family Information
        </Button>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(familyData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default FamilyForm;
