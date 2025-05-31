import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateAge } from "@/utils/ageCalculator";

interface FamilyMember {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  nativePlace?: string;
  currentPlace?: string;
  contactNumber?: string;
  occupation?: string;
}

interface Child extends FamilyMember {
  phoneNumber?: string;
  maritalStatus?: string;
  spouse: ChildSpouse | null;
}

interface ChildSpouse extends FamilyMember {
  numberOfChildren: number;
  grandchildren: Grandchild[];
}

interface Grandchild extends FamilyMember {
  phoneNumber?: string;
  currentPlace?: string;
}

interface FamilyData {
  familyHead: FamilyMember & {
    maritalStatus: string;
  };
  spouse: FamilyMember & {
    numberOfSons: number;
    numberOfDaughters: number;
  };
  sons: Child[];
  daughters: Child[];
}

const FamilyForm = () => {
  const [familyData, setFamilyData] = useState<FamilyData>({
    familyHead: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      age: 0,
      maritalStatus: '',
    },
    spouse: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      age: 0,
      numberOfSons: 0,
      numberOfDaughters: 0,
    },
    sons: [],
    daughters: [],
  });

  const updateFamilyHead = (field: string, value: any) => {
    setFamilyData(prev => ({
      ...prev,
      familyHead: {
        ...prev.familyHead,
        [field]: value
      }
    }));
  };

  const updateSpouse = (field: string, value: any) => {
    setFamilyData(prev => ({
      ...prev,
      spouse: {
        ...prev.spouse,
        [field]: value
      }
    }));
  };

  const updateChild = (type: 'sons' | 'daughters', index: number, field: string, value: any) => {
    setFamilyData(prev => {
      const updatedChildren = [...prev[type]];
      if (!updatedChildren[index]) {
        updatedChildren[index] = {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          age: 0,
          spouse: null
        };
      }
      updatedChildren[index] = {
        ...updatedChildren[index],
        [field]: value
      };
      return {
        ...prev,
        [type]: updatedChildren
      };
    });
  };

  const updateChildSpouse = (type: 'sons' | 'daughters', childIndex: number, field: string, value: any) => {
    setFamilyData(prev => {
      const updatedChildren = [...prev[type]];
      if (!updatedChildren[childIndex].spouse) {
        updatedChildren[childIndex].spouse = {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          age: 0,
          numberOfChildren: 0,
          grandchildren: []
        };
      }
      updatedChildren[childIndex].spouse = {
        ...updatedChildren[childIndex].spouse!,
        [field]: value
      };
      return {
        ...prev,
        [type]: updatedChildren
      };
    });
  };

  const updateGrandchild = (
    type: 'sons' | 'daughters',
    childIndex: number,
    grandchildIndex: number,
    field: string,
    value: any
  ) => {
    setFamilyData(prev => {
      const updatedChildren = [...prev[type]];
      const spouse = updatedChildren[childIndex].spouse;
      if (!spouse) return prev;

      const updatedGrandchildren = [...spouse.grandchildren];
      if (!updatedGrandchildren[grandchildIndex]) {
        updatedGrandchildren[grandchildIndex] = {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          age: 0
        };
      }
      updatedGrandchildren[grandchildIndex] = {
        ...updatedGrandchildren[grandchildIndex],
        [field]: value
      };

      spouse.grandchildren = updatedGrandchildren;
      return {
        ...prev,
        [type]: updatedChildren
      };
    });
  };

  const generateChildForms = (type: 'sons' | 'daughters', count: number) => {
    setFamilyData(prev => {
      const children = Array(count).fill(null).map((_, i) => {
        return prev[type][i] || {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          age: 0,
          spouse: null
        };
      });
      return {
        ...prev,
        [type]: children
      };
    });
  };

  const generateGrandchildForms = (type: 'sons' | 'daughters', childIndex: number, count: number) => {
    setFamilyData(prev => {
      const updatedChildren = [...prev[type]];
      const spouse = updatedChildren[childIndex].spouse;
      if (!spouse) return prev;

      spouse.grandchildren = Array(count).fill(null).map((_, i) => {
        return spouse.grandchildren[i] || {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          age: 0
        };
      });

      return {
        ...prev,
        [type]: updatedChildren
      };
    });
  };

  const validateForm = () => {
    if (!familyData.familyHead.firstName || !familyData.familyHead.lastName || !familyData.familyHead.dateOfBirth) {
      toast.error("Please fill in all required family head fields");
      return false;
    }
    return true;
  };

  const submitForm = async () => {
    if (!validateForm()) return;

    try {
      console.log('Starting form submission...');
      
      // Insert family head
      const familyHeadData = {
        first_name: familyData.familyHead.firstName,
        last_name: familyData.familyHead.lastName,
        date_of_birth: familyData.familyHead.dateOfBirth,
        age: familyData.familyHead.age,
        native_place: familyData.familyHead.nativePlace || null,
        current_place: familyData.familyHead.currentPlace || null,
        contact_number: familyData.familyHead.contactNumber || null,
        marital_status: familyData.familyHead.maritalStatus as 'single' | 'married' | 'divorced' | 'widowed',
        occupation: familyData.familyHead.occupation as 'retired' | 'housewife' | 'salaried' | 'business' | 'student' | 'unemployed' || null
      };

      const { data: familyHead, error: familyHeadError } = await supabase
        .from('family_heads')
        .insert([familyHeadData])
        .select()
        .single();

      if (familyHeadError) throw familyHeadError;

      console.log('Family head saved:', familyHead);

      // Insert spouse if married
      if (familyData.familyHead.maritalStatus === 'married' && familyData.spouse.firstName) {
        const spouseData = {
          family_head_id: familyHead.id,
          first_name: familyData.spouse.firstName,
          last_name: familyData.spouse.lastName || null,
          date_of_birth: familyData.spouse.dateOfBirth || null,
          age: familyData.spouse.age || null,
          native_place: familyData.spouse.nativePlace || null,
          contact_number: familyData.spouse.contactNumber || null,
          occupation: familyData.spouse.occupation as 'retired' | 'housewife' | 'salaried' | 'business' | 'student' | 'unemployed' || null,
          number_of_sons: familyData.spouse.numberOfSons || 0,
          number_of_daughters: familyData.spouse.numberOfDaughters || 0
        };

        const { data: spouse, error: spouseError } = await supabase
          .from('spouses')
          .insert([spouseData])
          .select()
          .single();

        if (spouseError) throw spouseError;
        console.log('Spouse saved:', spouse);
      }

      // Insert children (sons and daughters)
      for (const [type, children] of [['son', familyData.sons], ['daughter', familyData.daughters]] as const) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child.firstName) {
            const childData = {
              family_head_id: familyHead.id,
              first_name: child.firstName,
              last_name: child.lastName || null,
              contact_number: child.contactNumber || null,
              date_of_birth: child.dateOfBirth || null,
              age: child.age || null,
              occupation: child.occupation as 'retired' | 'housewife' | 'salaried' | 'business' | 'student' | 'unemployed' || null,
              current_place: child.currentPlace || null,
              phone_number: child.phoneNumber || null,
              marital_status: child.maritalStatus as 'single' | 'married' | 'divorced' | 'widowed' || null,
              child_type: type,
              child_index: i
            };

            const { data: savedChild, error: childError } = await supabase
              .from('children')
              .insert([childData])
              .select()
              .single();

            if (childError) throw childError;
            console.log(`${type} saved:`, savedChild);

            // Insert child spouse if married
            if (child.maritalStatus === 'married' && child.spouse?.firstName) {
              const childSpouseData = {
                child_id: savedChild.id,
                first_name: child.spouse.firstName,
                last_name: child.spouse.lastName || null,
                contact_number: child.spouse.contactNumber || null,
                native_place: child.spouse.nativePlace || null,
                date_of_birth: child.spouse.dateOfBirth || null,
                age: child.spouse.age || null,
                occupation: child.spouse.occupation as 'retired' | 'housewife' | 'salaried' | 'business' | 'student' | 'unemployed' || null,
                number_of_children: child.spouse.numberOfChildren || 0
              };

              const { data: savedChildSpouse, error: childSpouseError } = await supabase
                .from('child_spouses')
                .insert([childSpouseData])
                .select()
                .single();

              if (childSpouseError) throw childSpouseError;
              console.log('Child spouse saved:', savedChildSpouse);

              // Insert grandchildren
              if (child.spouse.grandchildren) {
                for (let j = 0; j < child.spouse.grandchildren.length; j++) {
                  const grandchild = child.spouse.grandchildren[j];
                  if (grandchild.firstName) {
                    const grandchildData = {
                      child_spouse_id: savedChildSpouse.id,
                      first_name: grandchild.firstName,
                      last_name: grandchild.lastName || null,
                      contact_number: grandchild.contactNumber || null,
                      date_of_birth: grandchild.dateOfBirth || null,
                      age: grandchild.age || null,
                      occupation: grandchild.occupation as 'retired' | 'housewife' | 'salaried' | 'business' | 'student' | 'unemployed' || null,
                      current_place: grandchild.currentPlace || null,
                      phone_number: grandchild.phoneNumber || null,
                      grandchild_index: j
                    };

                    const { error: grandchildError } = await supabase
                      .from('grandchildren')
                      .insert([grandchildData]);

                    if (grandchildError) throw grandchildError;
                  }
                }
              }
            }
          }
        }
      }

      toast.success("Family information saved successfully!");
      console.log('All family data saved successfully');
      
    } catch (error) {
      console.error('Error saving family data:', error);
      toast.error("Failed to save family information. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Family Head Section */}
      <Card>
        <CardHeader>
          <CardTitle id="familyHeadTitle">Family Head Information</CardTitle>
          <CardDescription>Enter details for the head of the family</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headFirstName">First Name / पहिले नाव *</Label>
              <Input
                id="headFirstName"
                value={familyData.familyHead.firstName}
                onChange={(e) => updateFamilyHead('firstName', e.target.value.toUpperCase())}
                placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
                required
              />
            </div>
            <div>
              <Label htmlFor="headLastName">Last Name / आडनाव *</Label>
              <Input
                id="headLastName"
                value={familyData.familyHead.lastName}
                onChange={(e) => updateFamilyHead('lastName', e.target.value.toUpperCase())}
                placeholder="Enter last name / आडनाव प्रविष्ट करा"
                required
              />
            </div>
            <div>
              <Label htmlFor="headDateOfBirth">Date of Birth / जन्म तारीख *</Label>
              <Input
                id="headDateOfBirth"
                type="date"
                value={familyData.familyHead.dateOfBirth}
                onChange={(e) => {
                  const date = e.target.value;
                  const age = date ? calculateAge(date) : 0;
                  updateFamilyHead('dateOfBirth', date);
                  updateFamilyHead('age', age);
                }}
                required
              />
              {familyData.familyHead.age > 0 && (
                <div className="text-sm text-gray-600 mt-1">Age: {familyData.familyHead.age}</div>
              )}
            </div>
            <div>
              <Label htmlFor="headNativePlace">Native Place / मूळ गाव</Label>
              <Input
                id="headNativePlace"
                value={familyData.familyHead.nativePlace}
                onChange={(e) => updateFamilyHead('nativePlace', e.target.value.toUpperCase())}
                placeholder="Enter native place / मूळ गाव प्रविष्ट करा"
              />
            </div>
            <div>
              <Label htmlFor="headCurrentPlace">Current Place / सध्याचे ठिकाण</Label>
              <Input
                id="headCurrentPlace"
                value={familyData.familyHead.currentPlace}
                onChange={(e) => updateFamilyHead('currentPlace', e.target.value.toUpperCase())}
                placeholder="Enter current place / सध्याचे ठिकाण प्रविष्ट करा"
              />
            </div>
            <div>
              <Label htmlFor="headContactNumber">Contact Number / संपर्क क्रमांक</Label>
              <Input
                id="headContactNumber"
                value={familyData.familyHead.contactNumber}
                onChange={(e) => updateFamilyHead('contactNumber', e.target.value)}
                placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
              />
            </div>
            <div>
              <Label htmlFor="headMaritalStatus">Marital Status / वैवाहिक स्थिती *</Label>
              <Select 
                value={familyData.familyHead.maritalStatus} 
                onValueChange={(value) => updateFamilyHead('maritalStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select marital status / वैवाहिक स्थिती निवडा" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single / अविवाहित</SelectItem>
                  <SelectItem value="married">Married / विवाहित</SelectItem>
                  <SelectItem value="divorced">Divorced / घटस्फोटित</SelectItem>
                  <SelectItem value="widowed">Widowed / विधवा</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="headOccupation">Occupation / व्यवसाय</Label>
              <Select 
                value={familyData.familyHead.occupation} 
                onValueChange={(value) => updateFamilyHead('occupation', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select occupation / व्यवसाय निवडा" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retired">Retired / निवृत्त</SelectItem>
                  <SelectItem value="housewife">Housewife / गृहिणी</SelectItem>
                  <SelectItem value="salaried">Salaried / नोकरदार</SelectItem>
                  <SelectItem value="business">Business / व्यवसाय</SelectItem>
                  <SelectItem value="student">Student / विद्यार्थी</SelectItem>
                  <SelectItem value="unemployed">Unemployed / बेरोजगार</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spouse Section */}
      {familyData.familyHead.maritalStatus === 'married' && (
        <Card>
          <CardHeader>
            <CardTitle id="spouseTitle">Spouse Information</CardTitle>
            <CardDescription>Enter details for the spouse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spouseFirstName">First Name / पहिले नाव</Label>
                <Input
                  id="spouseFirstName"
                  value={familyData.spouse.firstName}
                  onChange={(e) => updateSpouse('firstName', e.target.value.toUpperCase())}
                  placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
                />
              </div>
              <div>
                <Label htmlFor="spouseLastName">Last Name / आडनाव</Label>
                <Input
                  id="spouseLastName"
                  value={familyData.spouse.lastName}
                  onChange={(e) => updateSpouse('lastName', e.target.value.toUpperCase())}
                  placeholder="Enter last name / आडनाव प्रविष्ट करा"
                />
              </div>
              <div>
                <Label htmlFor="spouseDateOfBirth">Date of Birth / जन्म तारीख</Label>
                <Input
                  id="spouseDateOfBirth"
                  type="date"
                  value={familyData.spouse.dateOfBirth}
                  onChange={(e) => {
                    const date = e.target.value;
                    const age = date ? calculateAge(date) : 0;
                    updateSpouse('dateOfBirth', date);
                    updateSpouse('age', age);
                  }}
                />
                {familyData.spouse.age > 0 && (
                  <div className="text-sm text-gray-600 mt-1">Age: {familyData.spouse.age}</div>
                )}
              </div>
              <div>
                <Label htmlFor="spouseNativePlace">Native Place / मूळ गाव</Label>
                <Input
                  id="spouseNativePlace"
                  value={familyData.spouse.nativePlace}
                  onChange={(e) => updateSpouse('nativePlace', e.target.value.toUpperCase())}
                  placeholder="Enter native place / मूळ गाव प्रविष्ट करा"
                />
              </div>
              <div>
                <Label htmlFor="spouseContactNumber">Contact Number / संपर्क क्रमांक</Label>
                <Input
                  id="spouseContactNumber"
                  value={familyData.spouse.contactNumber}
                  onChange={(e) => updateSpouse('contactNumber', e.target.value)}
                  placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
                />
              </div>
              <div>
                <Label htmlFor="spouseOccupation">Occupation / व्यवसाय</Label>
                <Select 
                  value={familyData.spouse.occupation} 
                  onValueChange={(value) => updateSpouse('occupation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupation / व्यवसाय निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retired">Retired / निवृत्त</SelectItem>
                    <SelectItem value="housewife">Housewife / गृहिणी</SelectItem>
                    <SelectItem value="salaried">Salaried / नोकरदार</SelectItem>
                    <SelectItem value="business">Business / व्यवसाय</SelectItem>
                    <SelectItem value="student">Student / विद्यार्थी</SelectItem>
                    <SelectItem value="unemployed">Unemployed / बेरोजगार</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="numberOfSons">Number of Sons / मुलांची संख्या</Label>
                <Select 
                  value={String(familyData.spouse.numberOfSons)} 
                  onValueChange={(value) => {
                    const count = parseInt(value);
                    updateSpouse('numberOfSons', count);
                    generateChildForms('sons', count);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of sons / मुलांची संख्या निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="numberOfDaughters">Number of Daughters / मुलींची संख्या</Label>
                <Select 
                  value={String(familyData.spouse.numberOfDaughters)} 
                  onValueChange={(value) => {
                    const count = parseInt(value);
                    updateSpouse('numberOfDaughters', count);
                    generateChildForms('daughters', count);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of daughters / मुलींची संख्या निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sons Section */}
      {familyData.spouse.numberOfSons > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sons Information</CardTitle>
            <CardDescription>Enter details for each son</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {familyData.sons.map((son, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Son {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name / पहिले नाव</Label>
                    <Input
                      value={son.firstName}
                      onChange={(e) => updateChild('sons', index, 'firstName', e.target.value.toUpperCase())}
                      placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
                    />
                  </div>
                  <div>
                    <Label>Last Name / आडनाव</Label>
                    <Input
                      value={son.lastName}
                      onChange={(e) => updateChild('sons', index, 'lastName', e.target.value.toUpperCase())}
                      placeholder="Enter last name / आडनाव प्रविष्ट करा"
                    />
                  </div>
                  <div>
                    <Label>Contact Number / संपर्क क्रमांक</Label>
                    <Input
                      value={son.contactNumber}
                      onChange={(e) => updateChild('sons', index, 'contactNumber', e.target.value)}
                      placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
                    />
                  </div>
                  <div>
                    <Label>Date of Birth / जन्म तारीख</Label>
                    <Input
                      type="date"
                      value={son.dateOfBirth}
                      onChange={(e) => {
                        const date = e.target.value;
                        const age = date ? calculateAge(date) : 0;
                        updateChild('sons', index, 'dateOfBirth', date);
                        updateChild('sons', index, 'age', age);
                      }}
                    />
                    {son.age > 0 && (
                      <div className="text-sm text-gray-600 mt-1">Age: {son.age}</div>
                    )}
                  </div>
                  <div>
                    <Label>Occupation / व्यवसाय</Label>
                    <Select 
                      value={son.occupation} 
                      onValueChange={(value) => updateChild('sons', index, 'occupation', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select occupation / व्यवसाय निवडा" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salaried">Salaried / नोकरदार</SelectItem>
                        <SelectItem value="business">Business / व्यवसाय</SelectItem>
                        <SelectItem value="student">Student / विद्यार्थी</SelectItem>
                        <SelectItem value="unemployed">Unemployed / बेरोजगार</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Current Place / सध्याचे ठिकाण</Label>
                    <Input
                      value={son.currentPlace}
                      onChange={(e) => updateChild('sons', index, 'currentPlace', e.target.value.toUpperCase())}
                      placeholder="Enter current place / सध्याचे ठिकाण प्रविष्ट करा"
                    />
                  </div>
                  <div>
                    <Label>Phone Number / फोन नंबर</Label>
                    <Input
                      value={son.phoneNumber}
                      onChange={(e) => updateChild('sons', index, 'phoneNumber', e.target.value)}
                      placeholder="Enter phone number / फोन नंबर प्रविष्ट करा"
                    />
                  </div>
                  <div>
                    <Label>Marital Status / वैवाहिक स्थिती</Label>
                    <Select 
                      value={son.maritalStatus} 
                      onValueChange={(value) => updateChild('sons', index, 'maritalStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status / वैवाहिक स्थिती निवडा" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single / अविवाहित</SelectItem>
                        <SelectItem value="married">Married / विवाहित</SelectItem>
                        <SelectItem value="divorced">Divorced / घटस्फोटित</SelectItem>
                        <SelectItem value="widowed">Widowed / विधवा</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Son's Spouse Section */}
                {son.maritalStatus === 'married' && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-md font-medium mb-4">Wife Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>First Name / पहिले नाव</Label>
                        <Input
                          value={son.spouse?.firstName || ''}
                          onChange={(e) => updateChildSpouse('sons', index, 'firstName', e.target.value.toUpperCase())}
                          placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
                        />
                      </div>
                      <div>
                        <Label>Last Name / आडनाव</Label>
                        <Input
                          value={son.spouse?.lastName || ''}
                          onChange={(e) => updateChildSpouse('sons', index, 'lastName', e.target.value.toUpperCase())}
                          placeholder="Enter last name / आडनाव प्रविष्ट करा"
                        />
                      </div>
                      <div>
                        <Label>Contact Number / संपर्क क्रमांक</Label>
                        <Input
                          value={son.spouse?.contactNumber || ''}
                          onChange={(e) => updateChildSpouse('sons', index, 'contactNumber', e.target.value)}
                          placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
                        />
                      </div>
                      <div>
                        <Label>Native Place / मूळ गाव</Label>
                        <Input
                          value={son.spouse?.nativePlace || ''}
                          onChange={(e) => updateChildSpouse('sons', index, 'nativePlace', e.target.value.toUpperCase())}
                          placeholder="Enter native place / मूळ गाव प्रविष्ट करा"
                        />
                      </div>
                      <div>
                        <Label>Date of Birth / जन्म तारीख</Label>
                        <Input
                          type="date"
                          value={son.spouse?.dateOfBirth || ''}
                          onChange={(e) => {
                            const date = e.target.value;
                            const age = date ? calculateAge(date) : 0;
                            updateChildSpouse('sons', index, 'dateOfBirth', date);
                            updateChildSpouse('sons', index, 'age', age);
                          }}
                        />
                        {son.spouse?.age > 0 && (
                          <div className="text-sm text-gray-600 mt-1">Age: {son.spouse.age}</div>
                        )}
                      </div>
                      <div>
                        <Label>Occupation / व्यवसाय</Label>
                        <Select 
                          value={son.spouse?.occupation || ''} 
                          onValueChange={(value) => updateChildSpouse('sons', index, 'occupation', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select occupation / व्यवसाय निवडा" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="housewife">Housewife / गृहिणी</SelectItem>
                            <SelectItem value="salaried">Salaried / नोकरदार</SelectItem>
                            <SelectItem value="business">Business / व्यवसाय</SelectItem>
                            <SelectItem value="student">Student / विद्यार्थी</SelectItem>
                            <SelectItem value="unemployed">Unemployed / बेरोजगार</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Number of Children / मुलांची संख्या</Label>
                        <Select 
                          value={String(son.spouse?.numberOfChildren || 0)} 
                          onValueChange={(value) => {
                            const count = parseInt(value);
                            updateChildSpouse('sons', index, 'numberOfChildren', count);
                            generateGrandchildForms('sons', index, count);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of children / मुलांची संख्या निवडा" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5].map(num => (
                              <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Grandchildren Section */}
                    {son.spouse?.numberOfChildren > 0 && (
                      <div className="mt-6 border-t pt-4">
                        <h5 className="text-md font-medium mb-4">Grandchildren / नातवंडे</h5>
                        {son.spouse.grandchildren.map((grandchild, gIndex) => (
                          <div key={gIndex} className="mb-6 p-3 bg-gray-50 rounded-lg">
                            <h6 className="text-sm font-medium mb-3">Grandchild {gIndex + 1}</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label>First Name / पहिले नाव</Label>
                                <Input
                                  value={grandchild.firstName}
                                  onChange={(e) => updateGrandchild('sons', index, gIndex, 'firstName', e.target.value.toUpperCase())}
                                  placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
                                />
                              </div>
                              <div>
                                <Label>Last Name / आडनाव</Label>
                                <Input
                                  value={grandchild.lastName}
                                  onChange={(e) => updateGrandchild('sons', index, gIndex, 'lastName', e.target.value.toUpperCase())}
                                  placeholder="Enter last name / आडनाव प्रविष्ट करा"
                                />
                              </div>
                              <div>
                                <Label>Contact Number / संपर्क क्रमांक</Label>
                                <Input
                                  value={grandchild.contactNumber}
                                  onChange={(e) => updateGrandchild('sons', index, gIndex, 'contactNumber', e.target.value)}
                                  placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
                                />
                              </div>
                              <div>
                                <Label>Date of Birth / जन्म तारीख</Label>
                                <Input
                                  type="date"
                                  value={grandchild.dateOfBirth}
                                  onChange={(e) => {
                                    const date = e.target.value;
                                    const age = date ? calculateAge(date) : 0;
                                    updateGrandchild('sons', index, gIndex, 'dateOfBirth', date);
                                    updateGrandchild('sons', index, gIndex, 'age', age);
                                  }}
                                />
                                {grandchild.age > 0 && (
                                  <div className="text-sm text-gray-600 mt-1">Age: {grandchild.age}</div>
                                )}
                              </div>
                              <div>
                                <Label>Occupation / व्यवसाय</Label>
                                <Select 
                                  value={grandchild.occupation} 
                                  onValueChange={(value) => updateGrandchild('sons', index, gIndex, 'occupation', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select occupation / व्यवसाय निवडा" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="salaried">Salaried / नोकरदार</SelectItem>
                                    <SelectItem value="business">Business / व्यवसाय</SelectItem>
                                    <SelectItem value="student">Student / विद्यार्थी</SelectItem>
                                    <SelectItem value="unemployed">Unemployed / बेरोजगार</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Current Place / सध्याचे ठिकाण</Label>
                                <Input
                                  value={grandchild.currentPlace}
                                  onChange={(e) => updateGrandchild('sons', index, gIndex, 'currentPlace', e.target.value.toUpperCase())}
                                  placeholder="Enter current place / सध्याचे ठिकाण प्रविष्ट करा"
                                />
                              </div>
                              <div>
                                <Label>Phone Number / फोन नंबर</Label>
                                <Input
                                  value={grandchild.phoneNumber}
                                  onChange={(e) => updateGrandchild('sons', index, gIndex, 'phoneNumber', e.target.value)}
                                  placeholder="Enter phone number / फोन नंबर प्रविष्ट करा"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Daughters Section */}
      {familyData.spouse.numberOfDaughters > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daughters Information</CardTitle>
            <CardDescription>Enter details for each daughter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {familyData.daughters.map((daughter, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Daughter {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name / पहिले नाव</Label>
                    <Input
                      value={daughter.firstName}
                      onChange={(e) => updateChild('daughters', index, 'firstName', e.target.value.toUpperCase())}
                      placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
                    />
                  </div>
                  <div>
                    <Label>Last Name / आडनाव</Label>
                    <Input
                      value={daughter.lastName}
                      onChange={(e) => updateChild('daughters', index, 'lastName', e.target.value.toUpperCase())}
                      placeholder="Enter last name / आडनाव प्रविष्ट करा"
                    />
                  </div>
                  <div>
                    <Label>Contact Number / संपर्क क्रमांक</Label>
                    <Input
                      value={daughter.contactNumber}
                      onChange={(e) => updateChild('daughters', index, 'contactNumber', e.target.value)}
                      placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
                    />
                  </div>
                  <div>
                    <Label>Date of Birth / जन्म तारीख</Label>
                    <Input
                      type="date"
                      value={daughter.dateOfBirth}
                      onChange={(e) => {
                        const date = e.target.value;
                        const age = date ? calculateAge(date) : 0;
                        updateChild('daughters', index, 'dateOfBirth', date);
                        updateChild('daughters', index, 'age', age);
                      }}
                    />
                    {daughter.age > 0 && (
                      <div className="text-sm text-gray-600 mt-1">Age: {daughter.age}</div>
                    )}
                  </div>
                  <div>
                    <Label>Occupation / व्यवसाय</Label>
                    <Select 
                      value={daughter.occupation} 
                      onValueChange={(value) => updateChild('daughters', index, 'occupation', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select occupation / व्यवसाय निवडा" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="housewife">Housewife / गृहिणी</SelectItem>
                        <SelectItem value="salaried">Salaried / नोकरदार</SelectItem>
                        <SelectItem value="business">Business / व्यवसाय</SelectItem>
                        <SelectItem value="student">Student / विद्यार्थी</SelectItem>
                        <SelectItem value="unemployed">Unemployed / बेरोजगार</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Current Place / सध्याचे ठिकाण</Label>
                    <Input
                      value={daughter.currentPlace}
                      onChange={(e) => updateChild('daughters', index, 'currentPlace', e.target.value.toUpperCase())}
                      placeholder="Enter current place / सध्याचे ठिकाण प्रविष्ट करा"
                    />
                  </div>
                  <div>
                    <Label>Phone Number / फोन नंबर</Label>
                    <Input
                      value={daughter.phoneNumber}
                      onChange={(e) => updateChild('daughters', index, 'phoneNumber', e.target.value)}
                      placeholder="Enter phone number / फोन नंबर प्रविष्ट करा"
                    />
                  </div>
                  <div>
                    <Label>Marital Status / वैवाहिक स्थिती</Label>
                    <Select 
                      value={daughter.maritalStatus} 
                      onValueChange={(value) => updateChild('daughters', index, 'maritalStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status / वैवाहिक स्थिती निवडा" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single / अविवाहित</SelectItem>
                        <SelectItem value="married">Married / विवाहित</SelectItem>
                        <SelectItem value="divorced">Divorced / घटस्फोटित</SelectItem>
                        <SelectItem value="widowed">Widowed / विधवा</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Daughter's Spouse Section */}
                {daughter.maritalStatus === 'married' && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-md font-medium mb-4">Husband Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>First Name / पहिले नाव</Label>
                        <Input
                          value={daughter.spouse?.firstName || ''}
                          onChange={(e) => updateChildSpouse('daughters', index, 'firstName', e.target.value.toUpperCase())}
                          placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
                        />
                      </div>
                      <div>
                        <Label>Last Name / आडनाव</Label>
                        <Input
                          value={daughter.spouse?.lastName || ''}
                          onChange={(e) => updateChildSpouse('daughters', index, 'lastName', e.target.value.toUpperCase())}
                          placeholder="Enter last name / आडनाव प्रविष्ट करा"
                        />
                      </div>
                      <div>
                        <Label>Contact Number / संपर्क क्रमांक</Label>
                        <Input
                          value={daughter.spouse?.contactNumber || ''}
                          onChange={(e) => updateChildSpouse('daughters', index, 'contactNumber', e.target.value)}
                          placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
                        />
                      </div>
                      <div>
                        <Label>Native Place / मूळ गाव</Label>
                        <Input
                          value={daughter.spouse?.nativePlace || ''}
                          onChange={(e) => updateChildSpouse('daughters', index, 'nativePlace', e.target.value.toUpperCase())}
                          placeholder="Enter native place / मूळ गाव प्रविष्ट करा"
                        />
                      </div>
                      <div>
                        <Label>Date of Birth / जन्म तारीख</Label>
                        <Input
                          type="date"
                          value={daughter.spouse?.dateOfBirth || ''}
                          onChange={(e) => {
                            const date = e.target.value;
                            const age = date ? calculateAge(date) : 0;
                            updateChildSpouse('daughters', index, 'dateOfBirth', date);
                            updateChildSpouse('daughters', index, 'age', age);
                          }}
                        />
                        {daughter.spouse?.age > 0 && (
                          <div className="text-sm text-gray-600 mt-1">Age: {daughter.spouse.age}</div>
                        )}
                      </div>
                      <div>
                        <Label>Occupation / व्यवसाय</Label>
                        <Select 
                          value={daughter.spouse?.occupation || ''} 
                          onValueChange={(value) => updateChildSpouse('daughters', index, 'occupation', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select occupation / व्यवसाय निवडा" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="salaried">Salaried / नोकरदार</SelectItem>
                            <SelectItem value="business">Business / व्यवसाय</SelectItem>
                            <SelectItem value="student">Student / विद्यार्थी</SelectItem>
                            <SelectItem value="unemployed">Unemployed / बेरोजगार</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Number of Children / मुलांची संख्या</Label>
                        <Select 
                          value={String(daughter.spouse?.numberOfChildren || 0)} 
                          onValueChange={(value) => {
                            const count = parseInt(value);
                            updateChildSpouse('daughters', index, 'numberOfChildren', count);
                            generateGrandchildForms('daughters', index, count);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of children / मुलांची संख्या निवडा" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5].map(num => (
                              <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Grandchildren Section */}
                    {daughter.spouse?.numberOfChildren > 0 && (
                      <div className="mt-6 border-t pt-4">
                        <h5 className="text-md font-medium mb-4">Grandchildren / नातवंडे</h5>
                        {daughter.spouse.grandchildren.map((grandchild, gIndex) => (
                          <div key={gIndex} className="mb-6 p-3 bg-gray-50 rounded-lg">
                            <h6 className="text-sm font-medium mb-3">Grandchild {gIndex + 1}</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label>First Name / पहिले नाव</Label>
                                <Input
                                  value={grandchild.firstName}
                                  onChange={(e) => updateGrandchild('daughters', index, gIndex, 'firstName', e.target.value.toUpperCase())}
                                  placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
                                />
                              </div>
                              <div>
                                <Label>Last Name / आडनाव</Label>
                                <Input
                                  value={grandchild.lastName}
                                  onChange={(e) => updateGrandchild('daughters', index, gIndex, 'lastName', e.target.value.toUpperCase())}
                                  placeholder="Enter last name / आडनाव प्रविष्ट करा"
                                />
                              </div>
                              <div>
                                <Label>Contact Number / संपर्क क्रमांक</Label>
                                <Input
                                  value={grandchild.contactNumber}
                                  onChange={(e) => updateGrandchild('daughters', index, gIndex, 'contactNumber', e.target.value)}
                                  placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
                                />
                              </div>
                              <div>
                                <Label>Date of Birth / जन्म तारीख</Label>
                                <Input
                                  type="date"
                                  value={grandchild.dateOfBirth}
                                  onChange={(e) => {
                                    const date = e.target.value;
                                    const age = date ? calculateAge(date) : 0;
                                    updateGrandchild('daughters', index, gIndex, 'dateOfBirth', date);
                                    updateGrandchild('daughters', index, gIndex, 'age', age);
                                  }}
                                />
                                {grandchild.age > 0 && (
                                  <div className="text-sm text-gray-600 mt-1">Age: {grandchild.age}</div>
                                )}
                              </div>
                              <div>
                                <Label>Occupation / व्यवसाय</Label>
                                <Select 
                                  value={grandchild.occupation} 
                                  onValueChange={(value) => updateGrandchild('daughters', index, gIndex, 'occupation', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select occupation / व्यवसाय निवडा" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="salaried">Salaried / नोकरदार</SelectItem>
                                    <SelectItem value="business">Business / व्यवसाय</SelectItem>
                                    <SelectItem value="student">Student / विद्यार्थी</SelectItem>
                                    <SelectItem value="unemployed">Unemployed / बेरोजगार</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Current Place / सध्याचे ठिकाण</Label>
                                <Input
                                  value={grandchild.currentPlace}
                                  onChange={(e) => updateGrandchild('daughters', index, gIndex, 'currentPlace', e.target.value.toUpperCase())}
                                  placeholder="Enter current place / सध्याचे ठिकाण प्रविष्ट करा"
                                />
                              </div>
                              <div>
                                <Label>Phone Number / फोन नंबर</Label>
                                <Input
                                  value={grandchild.phoneNumber}
                                  onChange={(e) => updateGrandchild('daughters', index, gIndex, 'phoneNumber', e.target.value)}
                                  placeholder="Enter phone number / फोन नंबर प्रविष्ट करा"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <Button onClick={submitForm} size="lg" className="px-8">
          Submit Family Information / कुटुंब माहिती सादर करा
        </Button>
      </div>
    </div>
  );
};

export default FamilyForm;
