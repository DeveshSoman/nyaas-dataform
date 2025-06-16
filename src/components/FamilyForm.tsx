
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { calculateAge } from '@/utils/ageCalculator';
import ExportButton from './ExportButton';

interface FamilyHead {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number | null;
  contactNumber: string;
  nativePlace: string;
  currentPlace: string;
  maritalStatus: string;
  occupation: string;
}

interface Spouse {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number | null;
  contactNumber: string;
  nativePlace: string;
  occupation: string;
  numberOfSons: number;
  numberOfDaughters: number;
}

interface Child {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number | null;
  contactNumber: string;
  occupation: string;
  currentPlace: string;
  phoneNumber: string;
  maritalStatus: string;
  childType: 'sons' | 'daughters';
  childIndex: number;
}

const initialFamilyHead: FamilyHead = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  age: null,
  contactNumber: '',
  nativePlace: '',
  currentPlace: '',
  maritalStatus: '',
  occupation: '',
};

const initialSpouse: Spouse = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  age: null,
  contactNumber: '',
  nativePlace: '',
  occupation: '',
  numberOfSons: 0,
  numberOfDaughters: 0,
};

const FamilyForm = () => {
  const [familyHead, setFamilyHead] = useState<FamilyHead>(initialFamilyHead);
  const [spouse, setSpouse] = useState<Spouse>(initialSpouse);
  const [sons, setSons] = useState<Child[]>([]);
  const [daughters, setDaughters] = useState<Child[]>([]);
  const [showSpouseSection, setShowSpouseSection] = useState(false);
  const [numberOfSons, setNumberOfSons] = useState(0);
  const [numberOfDaughters, setNumberOfDaughters] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, entity: 'familyHead' | 'spouse', field: keyof FamilyHead | keyof Spouse) => {
    const value = e.target.value;

    if (entity === 'familyHead') {
      setFamilyHead(prev => ({ ...prev, [field]: value }));
    } else if (entity === 'spouse') {
      setSpouse(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleChildInputChange = (index: number, field: keyof Child, value: string, childType: 'sons' | 'daughters') => {
    const updatedChildren = (childType === 'sons' ? [...sons] : [...daughters]).map((child, i) => {
      if (i === index) {
        return { ...child, [field]: value };
      }
      return child;
    });

    if (childType === 'sons') {
      setSons(updatedChildren);
    } else {
      setDaughters(updatedChildren);
    }
  };

  const handleMaritalStatusChange = (value: string) => {
    setFamilyHead(prev => ({ ...prev, maritalStatus: value }));
    setShowSpouseSection(value === 'married');
  };

  const handleNumberOfChildrenChange = (type: 'sons' | 'daughters', count: number) => {
    if (type === 'sons') {
      setNumberOfSons(count);
      setSons(prev => {
        const newSons = Array(count).fill(null).map((_, i) => ({
          firstName: prev[i]?.firstName || '',
          lastName: prev[i]?.lastName || '',
          dateOfBirth: prev[i]?.dateOfBirth || '',
          age: prev[i]?.age || null,
          contactNumber: prev[i]?.contactNumber || '',
          occupation: prev[i]?.occupation || '',
          currentPlace: prev[i]?.currentPlace || '',
          phoneNumber: prev[i]?.phoneNumber || '',
          maritalStatus: prev[i]?.maritalStatus || '',
          childType: 'sons' as const,
          childIndex: i,
        }));
        return newSons;
      });
    } else {
      setNumberOfDaughters(count);
      setDaughters(prev => {
        const newDaughters = Array(count).fill(null).map((_, i) => ({
          firstName: prev[i]?.firstName || '',
          lastName: prev[i]?.lastName || '',
          dateOfBirth: prev[i]?.dateOfBirth || '',
          age: prev[i]?.age || null,
          contactNumber: prev[i]?.contactNumber || '',
          occupation: prev[i]?.occupation || '',
          currentPlace: prev[i]?.currentPlace || '',
          phoneNumber: prev[i]?.phoneNumber || '',
          maritalStatus: prev[i]?.maritalStatus || '',
          childType: 'daughters' as const,
          childIndex: i,
        }));
        return newDaughters;
      });
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate Family Head
      if (!familyHead.firstName || !familyHead.lastName || !familyHead.dateOfBirth) {
        toast.error('Please fill in all required fields for Family Head.');
        return;
      }

      // Validate Spouse if Marital Status is Married
      if (familyHead.maritalStatus === 'married' && (!spouse.firstName || !spouse.lastName)) {
        toast.error('Please fill in all required fields for Spouse.');
        return;
      }

      // Insert Family Head
      const { data: familyHeadData, error: familyHeadError } = await supabase
        .from('family_heads')
        .insert({
          first_name: familyHead.firstName,
          last_name: familyHead.lastName,
          date_of_birth: familyHead.dateOfBirth,
          age: calculateAge(new Date(familyHead.dateOfBirth)),
          contact_number: familyHead.contactNumber,
          native_place: familyHead.nativePlace,
          current_place: familyHead.currentPlace,
          marital_status: familyHead.maritalStatus as 'single' | 'married' | 'divorced' | 'widowed',
          occupation: familyHead.occupation as 'retired' | 'housewife' | 'salaried' | 'business' | 'student' | 'unemployed',
        })
        .select()

      if (familyHeadError) {
        console.error('Family Head Error:', familyHeadError);
        toast.error('Failed to save family head information.');
        return;
      }

      const familyHeadId = familyHeadData?.[0]?.id;

      // Insert Spouse if Marital Status is Married
      if (familyHead.maritalStatus === 'married' && familyHeadId) {
        const { error: spouseError } = await supabase
          .from('spouses')
          .insert({
            first_name: spouse.firstName,
            last_name: spouse.lastName,
            date_of_birth: spouse.dateOfBirth,
            age: calculateAge(new Date(spouse.dateOfBirth)),
            contact_number: spouse.contactNumber,
            native_place: spouse.nativePlace,
            occupation: spouse.occupation as 'retired' | 'housewife' | 'salaried' | 'business' | 'student' | 'unemployed',
            number_of_sons: numberOfSons,
            number_of_daughters: numberOfDaughters,
            family_head_id: familyHeadId,
          });

        if (spouseError) {
          console.error('Spouse Error:', spouseError);
          toast.error('Failed to save spouse information.');
          return;
        }
      }

      // Insert Children (Sons)
      if (familyHeadId) {
        for (const son of sons) {
          const { error: sonError } = await supabase
            .from('children')
            .insert({
              first_name: son.firstName,
              last_name: son.lastName,
              date_of_birth: son.dateOfBirth,
              age: calculateAge(new Date(son.dateOfBirth)),
              contact_number: son.contactNumber,
              child_type: 'sons',
              child_index: son.childIndex,
              occupation: son.occupation as 'retired' | 'housewife' | 'salaried' | 'business' | 'student' | 'unemployed',
              current_place: son.currentPlace,
              phone_number: son.phoneNumber,
              marital_status: son.maritalStatus as 'single' | 'married' | 'divorced' | 'widowed',
              family_head_id: familyHeadId,
            });

          if (sonError) {
            console.error('Son Error:', sonError);
            toast.error(`Failed to save son ${son.childIndex + 1} information.`);
            return;
          }
        }
      }

      // Insert Children (Daughters)
      if (familyHeadId) {
        for (const daughter of daughters) {
          const { error: daughterError } = await supabase
            .from('children')
            .insert({
              first_name: daughter.firstName,
              last_name: daughter.lastName,
              date_of_birth: daughter.dateOfBirth,
              age: calculateAge(new Date(daughter.dateOfBirth)),
              contact_number: daughter.contactNumber,
              child_type: 'daughters',
              child_index: daughter.childIndex,
              occupation: daughter.occupation as 'retired' | 'housewife' | 'salaried' | 'business' | 'student' | 'unemployed',
              current_place: daughter.currentPlace,
              phone_number: daughter.phoneNumber,
              marital_status: daughter.maritalStatus as 'single' | 'married' | 'divorced' | 'widowed',
              family_head_id: familyHeadId,
            });

          if (daughterError) {
            console.error('Daughter Error:', daughterError);
            toast.error(`Failed to save daughter ${daughter.childIndex + 1} information.`);
            return;
          }
        }
      }

      toast.success('Family information saved successfully!');
    } catch (error) {
      console.error('Submission Error:', error);
      toast.error('An error occurred while saving family information.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Family Information Form</h2>
          <p className="text-gray-600">Please fill out the details for your family members</p>
        </div>
        <ExportButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Family Head Information</CardTitle>
          <CardDescription>Enter details of the family head</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headFirstName">First Name</Label>
              <Input
                id="headFirstName"
                value={familyHead.firstName}
                onChange={(e) => handleInputChange(e, 'familyHead', 'firstName')}
              />
            </div>
            <div>
              <Label htmlFor="headLastName">Last Name</Label>
              <Input
                id="headLastName"
                value={familyHead.lastName}
                onChange={(e) => handleInputChange(e, 'familyHead', 'lastName')}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headDateOfBirth">Date of Birth</Label>
              <Input
                type="date"
                id="headDateOfBirth"
                value={familyHead.dateOfBirth}
                onChange={(e) => handleInputChange(e, 'familyHead', 'dateOfBirth')}
              />
            </div>
            <div>
              <Label htmlFor="headContactNumber">Contact Number</Label>
              <Input
                id="headContactNumber"
                value={familyHead.contactNumber}
                onChange={(e) => handleInputChange(e, 'familyHead', 'contactNumber')}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headNativePlace">Native Place</Label>
              <Input
                id="headNativePlace"
                value={familyHead.nativePlace}
                onChange={(e) => handleInputChange(e, 'familyHead', 'nativePlace')}
              />
            </div>
            <div>
              <Label htmlFor="headCurrentPlace">Current Place</Label>
              <Input
                id="headCurrentPlace"
                value={familyHead.currentPlace}
                onChange={(e) => handleInputChange(e, 'familyHead', 'currentPlace')}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headMaritalStatus">Marital Status</Label>
              <Select onValueChange={handleMaritalStatusChange}>
                <SelectTrigger className="w-full">
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
              <Label htmlFor="headOccupation">Occupation</Label>
              <Input
                id="headOccupation"
                value={familyHead.occupation}
                onChange={(e) => handleInputChange(e, 'familyHead', 'occupation')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {showSpouseSection && (
        <Card>
          <CardHeader>
            <CardTitle>Spouse Information</CardTitle>
            <CardDescription>Enter details of the spouse</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spouseFirstName">First Name</Label>
                <Input
                  id="spouseFirstName"
                  value={spouse.firstName}
                  onChange={(e) => handleInputChange(e, 'spouse', 'firstName')}
                />
              </div>
              <div>
                <Label htmlFor="spouseLastName">Last Name</Label>
                <Input
                  id="spouseLastName"
                  value={spouse.lastName}
                  onChange={(e) => handleInputChange(e, 'spouse', 'lastName')}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spouseDateOfBirth">Date of Birth</Label>
                <Input
                  type="date"
                  id="spouseDateOfBirth"
                  value={spouse.dateOfBirth}
                  onChange={(e) => handleInputChange(e, 'spouse', 'dateOfBirth')}
                />
              </div>
              <div>
                <Label htmlFor="spouseContactNumber">Contact Number</Label>
                <Input
                  id="spouseContactNumber"
                  value={spouse.contactNumber}
                  onChange={(e) => handleInputChange(e, 'spouse', 'contactNumber')}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spouseNativePlace">Native Place</Label>
                <Input
                  id="spouseNativePlace"
                  value={spouse.nativePlace}
                  onChange={(e) => handleInputChange(e, 'spouse', 'nativePlace')}
                />
              </div>
              <div>
                <Label htmlFor="spouseOccupation">Occupation</Label>
                <Input
                  id="spouseOccupation"
                  value={spouse.occupation}
                  onChange={(e) => handleInputChange(e, 'spouse', 'occupation')}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numberOfSons">Number of Sons</Label>
                <Select onValueChange={(value) => handleNumberOfChildrenChange('sons', parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select number of sons" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(11)].map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="numberOfDaughters">Number of Daughters</Label>
                <Select onValueChange={(value) => handleNumberOfChildrenChange('daughters', parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select number of daughters" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(11)].map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {numberOfSons > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sons Information</CardTitle>
            <CardDescription>Enter details of the sons</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {sons.map((son, index) => (
              <div key={`son-${index}`} className="space-y-4 border p-4 rounded-md">
                <Separator />
                <h3 className="text-lg font-semibold">Son {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`sonFirstName-${index}`}>First Name</Label>
                    <Input
                      id={`sonFirstName-${index}`}
                      value={son.firstName}
                      onChange={(e) => handleChildInputChange(index, 'firstName', e.target.value, 'sons')}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`sonLastName-${index}`}>Last Name</Label>
                    <Input
                      id={`sonLastName-${index}`}
                      value={son.lastName}
                      onChange={(e) => handleChildInputChange(index, 'lastName', e.target.value, 'sons')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`sonDateOfBirth-${index}`}>Date of Birth</Label>
                    <Input
                      type="date"
                      id={`sonDateOfBirth-${index}`}
                      value={son.dateOfBirth}
                      onChange={(e) => handleChildInputChange(index, 'dateOfBirth', e.target.value, 'sons')}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`sonContactNumber-${index}`}>Contact Number</Label>
                    <Input
                      id={`sonContactNumber-${index}`}
                      value={son.contactNumber}
                      onChange={(e) => handleChildInputChange(index, 'contactNumber', e.target.value, 'sons')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`sonOccupation-${index}`}>Occupation</Label>
                    <Input
                      id={`sonOccupation-${index}`}
                      value={son.occupation}
                      onChange={(e) => handleChildInputChange(index, 'occupation', e.target.value, 'sons')}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`sonCurrentPlace-${index}`}>Current Place</Label>
                    <Input
                      id={`sonCurrentPlace-${index}`}
                      value={son.currentPlace}
                      onChange={(e) => handleChildInputChange(index, 'currentPlace', e.target.value, 'sons')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`sonPhoneNumber-${index}`}>Phone Number</Label>
                    <Input
                      id={`sonPhoneNumber-${index}`}
                      value={son.phoneNumber}
                      onChange={(e) => handleChildInputChange(index, 'phoneNumber', e.target.value, 'sons')}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`sonMaritalStatus-${index}`}>Marital Status</Label>
                    <Input
                      id={`sonMaritalStatus-${index}`}
                      value={son.maritalStatus}
                      onChange={(e) => handleChildInputChange(index, 'maritalStatus', e.target.value, 'sons')}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {numberOfDaughters > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daughters Information</CardTitle>
            <CardDescription>Enter details of the daughters</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {daughters.map((daughter, index) => (
              <div key={`daughter-${index}`} className="space-y-4 border p-4 rounded-md">
                <Separator />
                <h3 className="text-lg font-semibold">Daughter {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`daughterFirstName-${index}`}>First Name</Label>
                    <Input
                      id={`daughterFirstName-${index}`}
                      value={daughter.firstName}
                      onChange={(e) => handleChildInputChange(index, 'firstName', e.target.value, 'daughters')}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`daughterLastName-${index}`}>Last Name</Label>
                    <Input
                      id={`daughterLastName-${index}`}
                      value={daughter.lastName}
                      onChange={(e) => handleChildInputChange(index, 'lastName', e.target.value, 'daughters')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`daughterDateOfBirth-${index}`}>Date of Birth</Label>
                    <Input
                      type="date"
                      id={`daughterDateOfBirth-${index}`}
                      value={daughter.dateOfBirth}
                      onChange={(e) => handleChildInputChange(index, 'dateOfBirth', e.target.value, 'daughters')}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`daughterContactNumber-${index}`}>Contact Number</Label>
                    <Input
                      id={`daughterContactNumber-${index}`}
                      value={daughter.contactNumber}
                      onChange={(e) => handleChildInputChange(index, 'contactNumber', e.target.value, 'daughters')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`daughterOccupation-${index}`}>Occupation</Label>
                    <Input
                      id={`daughterOccupation-${index}`}
                      value={daughter.occupation}
                      onChange={(e) => handleChildInputChange(index, 'occupation', e.target.value, 'daughters')}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`daughterCurrentPlace-${index}`}>Current Place</Label>
                    <Input
                      id={`daughterCurrentPlace-${index}`}
                      value={daughter.currentPlace}
                      onChange={(e) => handleChildInputChange(index, 'currentPlace', e.target.value, 'daughters')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`daughterPhoneNumber-${index}`}>Phone Number</Label>
                    <Input
                      id={`daughterPhoneNumber-${index}`}
                      value={daughter.phoneNumber}
                      onChange={(e) => handleChildInputChange(index, 'phoneNumber', e.target.value, 'daughters')}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`daughterMaritalStatus-${index}`}>Marital Status</Label>
                    <Input
                      id={`daughterMaritalStatus-${index}`}
                      value={daughter.maritalStatus}
                      onChange={(e) => handleChildInputChange(index, 'maritalStatus', e.target.value, 'daughters')}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
};

export default FamilyForm;
