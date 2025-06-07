
export interface PersonData {
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

export interface SpouseData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  nativePlace: string;
  dateOfBirth: string;
  occupation: string;
  numberOfChildren: number;
  grandchildren: GrandchildData[];
}

export interface GrandchildData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  dateOfBirth: string;
  occupation: string;
  currentPlace: string;
  phoneNumber: string;
}
