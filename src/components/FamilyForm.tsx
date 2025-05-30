
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
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  occupation: z.enum(['retired', 'housewife', 'salaried', 'business']),
  numberOfChildren: z.number().min(0).max(20),
});

const grandChildSchema = z.object({
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
type GrandChildData = z.infer<typeof grandChildSchema>;

const FamilyForm = () => {
  const [showSpouse, setShowSpouse] = useState(false);
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [grandChildren, setGrandChildren] = useState<GrandChildData[]>([]);

  const familyHeadForm = useForm<FamilyHeadData>({
    resolver: zodResolver(familyHeadSchema),
  });

  const spouseForm = useForm<SpouseData>({
    resolver: zodResolver(spouseSchema),
  });

  const handleMaritalStatusChange = (value: string) => {
    familyHeadForm.setValue('maritalStatus', value as any);
    setShowSpouse(value === 'married');
  };

  const handleNumberOfChildrenChange = (value: number) => {
    setNumberOfChildren(value);
    spouseForm.setValue('numberOfChildren', value);
    
    // Initialize grandchildren array
    const newGrandChildren = Array(value).fill(null).map(() => ({
      firstName: '',
      lastName: '',
      contactNumber: '',
      dateOfBirth: new Date(),
      occupation: 'student' as const,
      currentPlace: '',
      phoneNumber: '',
    }));
    setGrandChildren(newGrandChildren);
  };

  const updateGrandChild = (index: number, field: keyof GrandChildData, value: any) => {
    const newChildren = [...grandChildren];
    newChildren[index] = { ...newChildren[index], [field]: value };
    setGrandChildren(newChildren);
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
        console.log('Grand Children Data:', grandChildren);
        
        toast({
          title: "Form Submitted Successfully!",
          description: "Family information has been saved.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Family Head Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-blue-800">Family Head Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="head-firstName">First Name</Label>
              <Input
                id="head-firstName"
                {...familyHeadForm.register('firstName')}
                placeholder="Enter first name"
              />
              {familyHeadForm.formState.errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{familyHeadForm.formState.errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="head-lastName">Last Name</Label>
              <Input
                id="head-lastName"
                {...familyHeadForm.register('lastName')}
                placeholder="Enter last name"
              />
              {familyHeadForm.formState.errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{familyHeadForm.formState.errors.lastName.message}</p>
              )}
            </div>

            <div>
              <Label>Date of Birth</Label>
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
                      <span>Pick a date</span>
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
              <Label htmlFor="head-nativePlace">Native Place</Label>
              <Input
                id="head-nativePlace"
                {...familyHeadForm.register('nativePlace')}
                placeholder="Enter native place"
              />
            </div>

            <div>
              <Label htmlFor="head-currentPlace">Current Place</Label>
              <Input
                id="head-currentPlace"
                {...familyHeadForm.register('currentPlace')}
                placeholder="Enter current place"
              />
            </div>

            <div>
              <Label htmlFor="head-contactNumber">Contact Number</Label>
              <Input
                id="head-contactNumber"
                {...familyHeadForm.register('contactNumber')}
                placeholder="Enter contact number"
              />
              {familyHeadForm.formState.errors.contactNumber && (
                <p className="text-red-500 text-sm mt-1">{familyHeadForm.formState.errors.contactNumber.message}</p>
              )}
            </div>

            <div>
              <Label>Marital Status</Label>
              <Select onValueChange={handleMaritalStatusChange}>
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
              <Select onValueChange={(value) => familyHeadForm.setValue('occupation', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occupation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
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
            <CardTitle className="text-2xl text-green-800">Spouse Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spouse-firstName">First Name</Label>
                <Input
                  id="spouse-firstName"
                  {...spouseForm.register('firstName')}
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <Label htmlFor="spouse-lastName">Last Name</Label>
                <Input
                  id="spouse-lastName"
                  {...spouseForm.register('lastName')}
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <Label htmlFor="spouse-contactNumber">Contact Number (Required)</Label>
                <Input
                  id="spouse-contactNumber"
                  {...spouseForm.register('contactNumber')}
                  placeholder="Enter contact number"
                />
                {spouseForm.formState.errors.contactNumber && (
                  <p className="text-red-500 text-sm mt-1">{spouseForm.formState.errors.contactNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="spouse-nativePlace">Native Place</Label>
                <Input
                  id="spouse-nativePlace"
                  {...spouseForm.register('nativePlace')}
                  placeholder="Enter native place"
                />
              </div>

              <div>
                <Label>Date of Birth</Label>
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
                        <span>Pick a date</span>
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
                <Label>Marital Status</Label>
                <Select onValueChange={(value) => spouseForm.setValue('maritalStatus', value as any)}>
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
                <Select onValueChange={(value) => spouseForm.setValue('occupation', value as any)}>
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
                <Select onValueChange={(value) => handleNumberOfChildrenChange(parseInt(value))}>
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
          </CardContent>
        </Card>
      )}

      {/* Grand Children Section */}
      {numberOfChildren > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-purple-800">Children Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: numberOfChildren }, (_, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Child {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      placeholder="Enter first name"
                      value={grandChildren[index]?.firstName || ''}
                      onChange={(e) => updateGrandChild(index, 'firstName', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      placeholder="Enter last name"
                      value={grandChildren[index]?.lastName || ''}
                      onChange={(e) => updateGrandChild(index, 'lastName', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Contact Number</Label>
                    <Input
                      placeholder="Enter contact number"
                      value={grandChildren[index]?.contactNumber || ''}
                      onChange={(e) => updateGrandChild(index, 'contactNumber', e.target.value)}
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
                          {grandChildren[index]?.dateOfBirth ? (
                            <>
                              {format(grandChildren[index].dateOfBirth, "PPP")} 
                              (Age: {calculateAge(grandChildren[index].dateOfBirth)})
                            </>
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={grandChildren[index]?.dateOfBirth}
                          onSelect={(date) => {
                            if (date) {
                              updateGrandChild(index, 'dateOfBirth', date);
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
                    <Select onValueChange={(value) => updateGrandChild(index, 'occupation', value)}>
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
                      value={grandChildren[index]?.currentPlace || ''}
                      onChange={(e) => updateGrandChild(index, 'currentPlace', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      placeholder="Enter phone number"
                      value={grandChildren[index]?.phoneNumber || ''}
                      onChange={(e) => updateGrandChild(index, 'phoneNumber', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button 
          onClick={onSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
        >
          Submit Family Information
        </Button>
      </div>
    </div>
  );
};

export default FamilyForm;
