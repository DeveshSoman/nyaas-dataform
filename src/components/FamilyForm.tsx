import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { calculateAge } from '@/utils/ageCalculator';
import { toast } from '@/hooks/use-toast';

const familyHeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  nativePlace: z.string().min(1, 'Native place is required'),
  currentPlace: z.string().min(1, 'Current place is required'),
  contactNumber: z.string().regex(/^\d+$/, 'Contact number must contain only numbers'),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  occupation: z.enum(['retired', 'salaried', 'business']),
});

const spouseSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  contactNumber: z.string().regex(/^\d+$/, 'Contact number must contain only numbers'),
  nativePlace: z.string().min(1, 'Native place is required'),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  occupation: z.enum(['retired', 'housewife', 'salaried', 'business']),
  numberOfSons: z.number().min(0).max(20),
  numberOfDaughters: z.number().min(0).max(20),
});

const childSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  contactNumber: z.string().regex(/^\d+$/, 'Contact number must contain only numbers'),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  occupation: z.enum(['salaried', 'business', 'student', 'unemployed']),
  currentPlace: z.string().min(1, 'Current place is required'),
  phoneNumber: z.string().regex(/^\d+$/, 'Phone number must contain only numbers'),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
});

const childSpouseSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  contactNumber: z.string().regex(/^\d+$/, 'Contact number must contain only numbers'),
  nativePlace: z.string().min(1, 'Native place is required'),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  occupation: z.enum(['retired', 'housewife', 'salaried', 'business']),
  numberOfChildren: z.number().min(0).max(20),
});

const grandchildSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  contactNumber: z.string().regex(/^\d+$/, 'Contact number must contain only numbers'),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  occupation: z.enum(['salaried', 'business', 'student', 'unemployed']),
  currentPlace: z.string().min(1, 'Current place is required'),
  phoneNumber: z.string().regex(/^\d+$/, 'Phone number must contain only numbers'),
});

type FamilyHeadData = z.infer<typeof familyHeadSchema>;
type SpouseData = z.infer<typeof spouseSchema>;
type ChildData = z.infer<typeof childSchema>;
type ChildSpouseData = z.infer<typeof childSpouseSchema>;
type GrandchildData = z.infer<typeof grandchildSchema>;

interface ChildWithSpouse extends ChildData {
  spouse?: ChildSpouseData & {
    grandchildren?: GrandchildData[];
  };
}

const FamilyForm = () => {
  const [showSpouse, setShowSpouse] = useState(false);
  const [numberOfSons, setNumberOfSons] = useState(0);
  const [numberOfDaughters, setNumberOfDaughters] = useState(0);
  const [sons, setSons] = useState<ChildWithSpouse[]>([]);
  const [daughters, setDaughters] = useState<ChildWithSpouse[]>([]);

  const familyHeadForm = useForm<FamilyHeadData>({
    resolver: zodResolver(familyHeadSchema),
  });

  const spouseForm = useForm<SpouseData>({
    resolver: zodResolver(spouseSchema),
  });

  // Watch form values for display
  const familyHeadFirstName = familyHeadForm.watch('firstName') || '';
  const familyHeadLastName = familyHeadForm.watch('lastName') || '';
  const spouseFirstName = spouseForm.watch('firstName') || '';
  const spouseLastName = spouseForm.watch('lastName') || '';

  const handleMaritalStatusChange = (value: string) => {
    familyHeadForm.setValue('maritalStatus', value as any);
    setShowSpouse(value === 'married');
  };

  const handleNumberOfSonsChange = (value: number) => {
    setNumberOfSons(value);
    spouseForm.setValue('numberOfSons', value);
    
    const newSons = Array(value).fill(null).map(() => ({
      firstName: '',
      lastName: '',
      contactNumber: '',
      dateOfBirth: new Date(),
      occupation: 'student' as const,
      currentPlace: '',
      phoneNumber: '',
      maritalStatus: 'single' as const,
    }));
    setSons(newSons);
  };

  const handleNumberOfDaughtersChange = (value: number) => {
    setNumberOfDaughters(value);
    spouseForm.setValue('numberOfDaughters', value);
    
    const newDaughters = Array(value).fill(null).map(() => ({
      firstName: '',
      lastName: '',
      contactNumber: '',
      dateOfBirth: new Date(),
      occupation: 'student' as const,
      currentPlace: '',
      phoneNumber: '',
      maritalStatus: 'single' as const,
    }));
    setDaughters(newDaughters);
  };

  const updateChild = (type: 'son' | 'daughter', index: number, field: keyof ChildData, value: any) => {
    if (type === 'son') {
      const newSons = [...sons];
      newSons[index] = { ...newSons[index], [field]: value };
      
      // If marital status changes to married, initialize spouse; if not married, remove spouse
      if (field === 'maritalStatus') {
        if (value === 'married') {
          newSons[index].spouse = {
            firstName: '',
            lastName: '',
            contactNumber: '',
            nativePlace: '',
            dateOfBirth: new Date(),
            occupation: 'housewife',
            numberOfChildren: 0,
            grandchildren: [],
          };
        } else {
          delete newSons[index].spouse;
        }
      }
      
      setSons(newSons);
    } else {
      const newDaughters = [...daughters];
      newDaughters[index] = { ...newDaughters[index], [field]: value };
      
      // If marital status changes to married, initialize spouse; if not married, remove spouse
      if (field === 'maritalStatus') {
        if (value === 'married') {
          newDaughters[index].spouse = {
            firstName: '',
            lastName: '',
            contactNumber: '',
            nativePlace: '',
            dateOfBirth: new Date(),
            occupation: 'salaried',
            numberOfChildren: 0,
            grandchildren: [],
          };
        } else {
          delete newDaughters[index].spouse;
        }
      }
      
      setDaughters(newDaughters);
    }
  };

  const updateChildSpouse = (type: 'son' | 'daughter', index: number, field: keyof ChildSpouseData, value: any) => {
    if (type === 'son') {
      const newSons = [...sons];
      if (newSons[index].spouse) {
        newSons[index].spouse = { ...newSons[index].spouse!, [field]: value };
        
        // If numberOfChildren changes, update grandchildren array
        if (field === 'numberOfChildren') {
          const newGrandchildren = Array(value).fill(null).map(() => ({
            firstName: '',
            lastName: '',
            contactNumber: '',
            dateOfBirth: new Date(),
            occupation: 'student' as const,
            currentPlace: '',
            phoneNumber: '',
          }));
          newSons[index].spouse!.grandchildren = newGrandchildren;
        }
        
        setSons(newSons);
      }
    } else {
      const newDaughters = [...daughters];
      if (newDaughters[index].spouse) {
        newDaughters[index].spouse = { ...newDaughters[index].spouse!, [field]: value };
        
        // If numberOfChildren changes, update grandchildren array
        if (field === 'numberOfChildren') {
          const newGrandchildren = Array(value).fill(null).map(() => ({
            firstName: '',
            lastName: '',
            contactNumber: '',
            dateOfBirth: new Date(),
            occupation: 'student' as const,
            currentPlace: '',
            phoneNumber: '',
          }));
          newDaughters[index].spouse!.grandchildren = newGrandchildren;
        }
        
        setDaughters(newDaughters);
      }
    }
  };

  const updateGrandchild = (type: 'son' | 'daughter', childIndex: number, grandchildIndex: number, field: keyof GrandchildData, value: any) => {
    if (type === 'son') {
      const newSons = [...sons];
      if (newSons[childIndex].spouse?.grandchildren) {
        newSons[childIndex].spouse!.grandchildren![grandchildIndex] = {
          ...newSons[childIndex].spouse!.grandchildren![grandchildIndex],
          [field]: value
        };
        setSons(newSons);
      }
    } else {
      const newDaughters = [...daughters];
      if (newDaughters[childIndex].spouse?.grandchildren) {
        newDaughters[childIndex].spouse!.grandchildren![grandchildIndex] = {
          ...newDaughters[childIndex].spouse!.grandchildren![grandchildIndex],
          [field]: value
        };
        setDaughters(newDaughters);
      }
    }
  };

  const onSubmit = () => {
    const familyHeadValid = familyHeadForm.trigger();
    const spouseValid = showSpouse ? spouseForm.trigger() : true;
    
    Promise.all([familyHeadValid, spouseValid]).then(([headValid, spouseValidResult]) => {
      if (headValid && spouseValidResult) {
        const familyHeadData = familyHeadForm.getValues();
        const spouseData = showSpouse ? spouseForm.getValues() : null;
        
        console.log('Family Head Data:', familyHeadData);
        console.log('Spouse Data:', spouseData);
        console.log('Sons Data:', sons);
        console.log('Daughters Data:', daughters);
        
        toast({
          title: "Form Submitted Successfully!",
          description: "Family information has been saved.",
        });
      }
    });
  };

  const renderGrandchildForm = (grandchild: GrandchildData, childIndex: number, grandchildIndex: number, childType: 'son' | 'daughter') => (
    <div key={grandchildIndex} className="border rounded-lg p-4 bg-yellow-50 space-y-4">
      <h4 className="text-md font-semibold text-orange-700">Grandchild {grandchildIndex + 1}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input
            placeholder="Enter first name"
            value={grandchild.firstName}
            onChange={(e) => updateGrandchild(childType, childIndex, grandchildIndex, 'firstName', e.target.value)}
          />
        </div>
        
        <div>
          <Label>Last Name</Label>
          <Input
            placeholder="Enter last name"
            value={grandchild.lastName}
            onChange={(e) => updateGrandchild(childType, childIndex, grandchildIndex, 'lastName', e.target.value)}
          />
        </div>

        <div>
          <Label>Contact Number</Label>
          <Input
            placeholder="Enter contact number"
            value={grandchild.contactNumber}
            onChange={(e) => updateGrandchild(childType, childIndex, grandchildIndex, 'contactNumber', e.target.value)}
          />
        </div>

        <div>
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {grandchild.dateOfBirth ? (
                  <>
                    {format(grandchild.dateOfBirth, "PPP")} 
                    (Age: {calculateAge(grandchild.dateOfBirth)})
                  </>
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={grandchild.dateOfBirth}
                onSelect={(date) => {
                  if (date) {
                    updateGrandchild(childType, childIndex, grandchildIndex, 'dateOfBirth', date);
                  }
                }}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Occupation</Label>
          <Select onValueChange={(value) => updateGrandchild(childType, childIndex, grandchildIndex, 'occupation', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select occupation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salaried">Salaried</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="unemployed">Unemployed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Current Place</Label>
          <Input
            placeholder="Enter current place"
            value={grandchild.currentPlace}
            onChange={(e) => updateGrandchild(childType, childIndex, grandchildIndex, 'currentPlace', e.target.value)}
          />
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input
            placeholder="Enter phone number"
            value={grandchild.phoneNumber}
            onChange={(e) => updateGrandchild(childType, childIndex, grandchildIndex, 'phoneNumber', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderChildForm = (child: ChildWithSpouse, index: number, type: 'son' | 'daughter') => (
    <div key={index} className="border rounded-lg p-4 bg-gray-50 space-y-4">
      <h3 className="text-lg font-semibold text-purple-700 capitalize">{type} {index + 1}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input
            placeholder="Enter first name"
            value={child.firstName}
            onChange={(e) => updateChild(type, index, 'firstName', e.target.value)}
          />
        </div>
        
        <div>
          <Label>Last Name</Label>
          <Input
            placeholder="Enter last name"
            value={child.lastName}
            onChange={(e) => updateChild(type, index, 'lastName', e.target.value)}
          />
        </div>

        <div>
          <Label>Contact Number</Label>
          <Input
            placeholder="Enter contact number"
            value={child.contactNumber}
            onChange={(e) => updateChild(type, index, 'contactNumber', e.target.value)}
          />
        </div>

        <div>
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {child.dateOfBirth ? (
                  <>
                    {format(child.dateOfBirth, "PPP")} 
                    (Age: {calculateAge(child.dateOfBirth)})
                  </>
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={child.dateOfBirth}
                onSelect={(date) => {
                  if (date) {
                    updateChild(type, index, 'dateOfBirth', date);
                  }
                }}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Occupation</Label>
          <Select onValueChange={(value) => updateChild(type, index, 'occupation', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select occupation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salaried">Salaried</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="unemployed">Unemployed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Current Place</Label>
          <Input
            placeholder="Enter current place"
            value={child.currentPlace}
            onChange={(e) => updateChild(type, index, 'currentPlace', e.target.value)}
          />
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input
            placeholder="Enter phone number"
            value={child.phoneNumber}
            onChange={(e) => updateChild(type, index, 'phoneNumber', e.target.value)}
          />
        </div>

        <div>
          <Label>Marital Status</Label>
          <Select onValueChange={(value) => updateChild(type, index, 'maritalStatus', value)}>
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
      </div>

      {/* Spouse section for married children */}
      {child.maritalStatus === 'married' && child.spouse && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-4">
          <h4 className="text-md font-semibold text-blue-700 mb-3">{type === 'son' ? 'Wife' : 'Husband'} Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                placeholder="Enter first name"
                value={child.spouse.firstName}
                onChange={(e) => updateChildSpouse(type, index, 'firstName', e.target.value)}
              />
            </div>
            
            <div>
              <Label>Last Name</Label>
              <Input
                placeholder="Enter last name"
                value={child.spouse.lastName}
                onChange={(e) => updateChildSpouse(type, index, 'lastName', e.target.value)}
              />
            </div>

            <div>
              <Label>Contact Number</Label>
              <Input
                placeholder="Enter contact number"
                value={child.spouse.contactNumber}
                onChange={(e) => updateChildSpouse(type, index, 'contactNumber', e.target.value)}
              />
            </div>

            <div>
              <Label>Native Place</Label>
              <Input
                placeholder="Enter native place"
                value={child.spouse.nativePlace}
                onChange={(e) => updateChildSpouse(type, index, 'nativePlace', e.target.value)}
              />
            </div>

            <div>
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {child.spouse.dateOfBirth ? (
                      <>
                        {format(child.spouse.dateOfBirth, "PPP")} 
                        (Age: {calculateAge(child.spouse.dateOfBirth)})
                      </>
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={child.spouse.dateOfBirth}
                    onSelect={(date) => {
                      if (date) {
                        updateChildSpouse(type, index, 'dateOfBirth', date);
                      }
                    }}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Occupation</Label>
              <Select onValueChange={(value) => updateChildSpouse(type, index, 'occupation', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occupation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="housewife">Housewife</SelectItem>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Number of Children</Label>
              <Select onValueChange={(value) => updateChildSpouse(type, index, 'numberOfChildren', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of children" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grandchildren section */}
          {child.spouse.numberOfChildren > 0 && child.spouse.grandchildren && (
            <div className="mt-4 space-y-4">
              <h5 className="text-lg font-semibold text-orange-700">Grandchildren</h5>
              {child.spouse.grandchildren.map((grandchild, grandchildIndex) => 
                renderGrandchildForm(grandchild, index, grandchildIndex, type)
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const getDisplayName = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return '';
    return `${firstName} ${lastName}`.trim();
  };

  const getMarathiTranslation = (name: string) => {
    // Simple transliteration mapping - in a real app, you'd use a proper translation API
    const translationMap: { [key: string]: string } = {
      'a': 'अ', 'b': 'ब', 'c': 'च', 'd': 'द', 'e': 'ए', 'f': 'फ', 'g': 'ग', 'h': 'ह',
      'i': 'इ', 'j': 'ज', 'k': 'क', 'l': 'ल', 'm': 'म', 'n': 'न', 'o': 'ओ', 'p': 'प',
      'q': 'क्यू', 'r': 'र', 's': 'स', 't': 'त', 'u': 'उ', 'v': 'व', 'w': 'व', 'x': 'क्स',
      'y': 'य', 'z': 'झ', ' ': ' '
    };
    
    return name.toLowerCase().split('').map(char => translationMap[char] || char).join('');
  };

  return (
    <div className="space-y-6">
      {/* Family Head Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-blue-800">
            Family Head Information / कुटुंब प्रमुख माहिती
            {getDisplayName(familyHeadFirstName, familyHeadLastName) && (
              <span className="text-lg text-gray-600 ml-3">
                ({getDisplayName(familyHeadFirstName, familyHeadLastName)} / {getMarathiTranslation(getDisplayName(familyHeadFirstName, familyHeadLastName))})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="head-firstName">First Name / पहिले नाव</Label>
              <Input
                id="head-firstName"
                {...familyHeadForm.register('firstName')}
                placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
              />
              {familyHeadForm.formState.errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{familyHeadForm.formState.errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="head-lastName">Last Name / आडनाव</Label>
              <Input
                id="head-lastName"
                {...familyHeadForm.register('lastName')}
                placeholder="Enter last name / आडनाव प्रविष्ट करा"
              />
              {familyHeadForm.formState.errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{familyHeadForm.formState.errors.lastName.message}</p>
              )}
            </div>

            <div>
              <Label>Date of Birth / जन्म तारीख</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !familyHeadForm.watch('dateOfBirth') && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {familyHeadForm.watch('dateOfBirth') ? (
                      <>
                        {format(familyHeadForm.watch('dateOfBirth'), "PPP")} 
                        (Age: {calculateAge(familyHeadForm.watch('dateOfBirth'))})
                      </>
                    ) : (
                      <span>Pick a date / तारीख निवडा</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={familyHeadForm.watch('dateOfBirth')}
                    onSelect={(date) => date && familyHeadForm.setValue('dateOfBirth', date)}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="head-nativePlace">Native Place / मूळ गाव</Label>
              <Input
                id="head-nativePlace"
                {...familyHeadForm.register('nativePlace')}
                placeholder="Enter native place / मूळ गाव प्रविष्ट करा"
              />
            </div>

            <div>
              <Label htmlFor="head-currentPlace">Current Place / सध्याचे ठिकाण</Label>
              <Input
                id="head-currentPlace"
                {...familyHeadForm.register('currentPlace')}
                placeholder="Enter current place / सध्याचे ठिकाण प्रविष्ट करा"
              />
            </div>

            <div>
              <Label htmlFor="head-contactNumber">Contact Number / संपर्क क्रमांक</Label>
              <Input
                id="head-contactNumber"
                {...familyHeadForm.register('contactNumber')}
                placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
              />
              {familyHeadForm.formState.errors.contactNumber && (
                <p className="text-red-500 text-sm mt-1">{familyHeadForm.formState.errors.contactNumber.message}</p>
              )}
            </div>

            <div>
              <Label>Marital Status / वैवाहिक स्थिती</Label>
              <Select onValueChange={handleMaritalStatusChange}>
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
              <Label>Occupation / व्यवसाय</Label>
              <Select onValueChange={(value) => familyHeadForm.setValue('occupation', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occupation / व्यवसाय निवडा" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retired">Retired / निवृत्त</SelectItem>
                  <SelectItem value="salaried">Salaried / नोकरदार</SelectItem>
                  <SelectItem value="business">Business / व्यवसाय</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spouse Section */}
      {showSpouse && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-800">
              Spouse Information / जोडीदार माहिती
              {getDisplayName(spouseFirstName, spouseLastName) && (
                <span className="text-lg text-gray-600 ml-3">
                  ({getDisplayName(spouseFirstName, spouseLastName)} / {getMarathiTranslation(getDisplayName(spouseFirstName, spouseLastName))})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spouse-firstName">First Name / पहिले नाव</Label>
                <Input
                  id="spouse-firstName"
                  {...spouseForm.register('firstName')}
                  placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
                />
              </div>
              
              <div>
                <Label htmlFor="spouse-lastName">Last Name / आडनाव</Label>
                <Input
                  id="spouse-lastName"
                  {...spouseForm.register('lastName')}
                  placeholder="Enter last name / आडनाव प्रविष्ट करा"
                />
              </div>

              <div>
                <Label htmlFor="spouse-contactNumber">Contact Number / संपर्क क्रमांक</Label>
                <Input
                  id="spouse-contactNumber"
                  {...spouseForm.register('contactNumber')}
                  placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
                />
                {spouseForm.formState.errors.contactNumber && (
                  <p className="text-red-500 text-sm mt-1">{spouseForm.formState.errors.contactNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="spouse-nativePlace">Native Place / मूळ गाव</Label>
                <Input
                  id="spouse-nativePlace"
                  {...spouseForm.register('nativePlace')}
                  placeholder="Enter native place / मूळ गाव प्रविष्ट करा"
                />
              </div>

              <div>
                <Label>Date of Birth / जन्म तारीख</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !spouseForm.watch('dateOfBirth') && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {spouseForm.watch('dateOfBirth') ? (
                        <>
                          {format(spouseForm.watch('dateOfBirth'), "PPP")} 
                          (Age: {calculateAge(spouseForm.watch('dateOfBirth'))})
                        </>
                      ) : (
                        <span>Pick a date / तारीख निवडा</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={spouseForm.watch('dateOfBirth')}
                      onSelect={(date) => date && spouseForm.setValue('dateOfBirth', date)}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Occupation / व्यवसाय</Label>
                <Select onValueChange={(value) => spouseForm.setValue('occupation', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupation / व्यवसाय निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retired">Retired / निवृत्त</SelectItem>
                    <SelectItem value="housewife">Housewife / गृहिणी</SelectItem>
                    <SelectItem value="salaried">Salaried / नोकरदार</SelectItem>
                    <SelectItem value="business">Business / व्यवसाय</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Number of Sons / मुलांची संख्या</Label>
                <Select onValueChange={(value) => handleNumberOfSonsChange(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of sons / मुलांची संख्या निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Number of Daughters / मुलींची संख्या</Label>
                <Select onValueChange={(value) => handleNumberOfDaughtersChange(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of daughters / मुलींची संख्या निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sons Section */}
      {numberOfSons > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-purple-800">Sons Information / मुलांची माहिती</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sons.map((son, index) => renderChildForm(son, index, 'son'))}
          </CardContent>
        </Card>
      )}

      {/* Daughters Section */}
      {numberOfDaughters > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-pink-800">Daughters Information / मुलींची माहिती</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {daughters.map((daughter, index) => renderChildForm(daughter, index, 'daughter'))}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button 
          onClick={onSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
        >
          Submit Family Information / कुटुंब माहिती सबमिट करा
        </Button>
      </div>
    </div>
  );
};

export default FamilyForm;
