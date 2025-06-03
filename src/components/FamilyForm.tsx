import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define proper types for the family data structure
interface FamilyHead {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nativePlace: string;
  currentPlace: string;
  contactNumber: string;
  maritalStatus: string;
  occupation: string;
}

interface Spouse {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nativePlace: string;
  contactNumber: string;
  occupation: string;
  numberOfSons: number;
  numberOfDaughters: number;
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

interface ChildSpouse {
  firstName: string;
  lastName: string;
  contactNumber: string;
  nativePlace: string;
  dateOfBirth: string;
  occupation: string;
  numberOfChildren: number;
  grandchildren: GrandchildData[];
}

interface Child {
  firstName: string;
  lastName: string;
  contactNumber: string;
  dateOfBirth: string;
  occupation: string;
  currentPlace: string;
  phoneNumber: string;
  maritalStatus: string;
  spouse: ChildSpouse | null;
}

interface FamilyData {
  familyHead: FamilyHead;
  spouse: Spouse;
  sons: Child[];
  daughters: Child[];
}

// Initialize with proper structure
let familyData: FamilyData = {
  familyHead: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nativePlace: '',
    currentPlace: '',
    contactNumber: '',
    maritalStatus: '',
    occupation: ''
  },
  spouse: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nativePlace: '',
    contactNumber: '',
    occupation: '',
    numberOfSons: 0,
    numberOfDaughters: 0
  },
  sons: [],
  daughters: []
};

// Utility functions
function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  
  let date: Date;
  if (birthDate.includes('/')) {
    const [day, month, year] = birthDate.split('/');
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else {
    date = new Date(birthDate);
  }
  
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  
  return age;
}

function convertDateFormat(dateString: string): string | null {
  if (!dateString) return null;
  
  if (dateString.includes('-')) {
    return dateString;
  }
  
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return dateString;
}

function validateContactNumber(number: string): boolean {
  return /^\d+$/.test(number);
}

function updateDisplayName(firstName: string, lastName: string, titleElementId: string) {
  const titleElement = document.getElementById(titleElementId);
  if (titleElement) {
    const baseTitle = titleElement.textContent?.split(' (')[0] || '';
    
    if (firstName || lastName) {
      const displayName = `${firstName} ${lastName}`.trim();
      titleElement.textContent = `${baseTitle} (${displayName})`;
    } else {
      titleElement.textContent = baseTitle;
    }
  }
}

// Event listeners for Family Head
function setupFamilyHeadEvents() {
  const firstNameInput = document.getElementById('headFirstName') as HTMLInputElement;
  const lastNameInput = document.getElementById('headLastName') as HTMLInputElement;
  const dateInput = document.getElementById('headDateOfBirth') as HTMLInputElement;
  const nativeInput = document.getElementById('headNativePlace') as HTMLInputElement;
  const currentInput = document.getElementById('headCurrentPlace') as HTMLInputElement;
  const contactInput = document.getElementById('headContactNumber') as HTMLInputElement;
  const maritalSelect = document.getElementById('headMaritalStatus') as HTMLSelectElement;
  const occupationSelect = document.getElementById('headOccupation') as HTMLSelectElement;

  if (firstNameInput) {
    firstNameInput.addEventListener('input', function() {
      this.value = this.value.toUpperCase();
      familyData.familyHead.firstName = this.value;
      updateDisplayName(this.value, lastNameInput?.value || '', 'familyHeadTitle');
    });
  }

  if (lastNameInput) {
    lastNameInput.addEventListener('input', function() {
      this.value = this.value.toUpperCase();
      familyData.familyHead.lastName = this.value;
      updateDisplayName(firstNameInput?.value || '', this.value, 'familyHeadTitle');
    });
  }

  if (nativeInput) {
    nativeInput.addEventListener('input', function() {
      this.value = this.value.toUpperCase();
      familyData.familyHead.nativePlace = this.value;
    });
  }

  if (currentInput) {
    currentInput.addEventListener('input', function() {
      this.value = this.value.toUpperCase();
      familyData.familyHead.currentPlace = this.value;
    });
  }

  if (contactInput) {
    contactInput.addEventListener('input', function() {
      familyData.familyHead.contactNumber = this.value;
      const errorElement = document.getElementById('headContactNumberError');
      if (this.value && !validateContactNumber(this.value)) {
        if (errorElement) {
          errorElement.textContent = 'Contact number must contain only numbers';
          errorElement.classList.add('show');
        }
      } else {
        if (errorElement) {
          errorElement.classList.remove('show');
        }
      }
    });
  }

  if (dateInput) {
    dateInput.addEventListener('change', function() {
      familyData.familyHead.dateOfBirth = this.value;
      const ageElement = document.getElementById('headAge');
      if (this.value) {
        const age = calculateAge(this.value);
        if (ageElement) {
          ageElement.textContent = `Age: ${age}`;
        }
      } else {
        if (ageElement) {
          ageElement.textContent = '';
        }
      }
    });
  }

  if (maritalSelect) {
    maritalSelect.addEventListener('change', function() {
      familyData.familyHead.maritalStatus = this.value;
      const spouseSection = document.getElementById('spouseSection');
      if (this.value === 'married') {
        if (spouseSection) {
          spouseSection.style.display = 'block';
        }
      } else {
        if (spouseSection) {
          spouseSection.style.display = 'none';
        }
        // Reset spouse data
        familyData.spouse = {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          nativePlace: '',
          contactNumber: '',
          occupation: '',
          numberOfSons: 0,
          numberOfDaughters: 0
        };
        resetSpouseForm();
      }
    });
  }

  if (occupationSelect) {
    occupationSelect.addEventListener('change', function() {
      familyData.familyHead.occupation = this.value;
    });
  }
}

// Event listeners for Spouse
function setupSpouseEvents() {
  const firstNameInput = document.getElementById('spouseFirstName') as HTMLInputElement;
  const lastNameInput = document.getElementById('spouseLastName') as HTMLInputElement;
  const dateInput = document.getElementById('spouseDateOfBirth') as HTMLInputElement;
  const nativeInput = document.getElementById('spouseNativePlace') as HTMLInputElement;
  const contactInput = document.getElementById('spouseContactNumber') as HTMLInputElement;
  const occupationSelect = document.getElementById('spouseOccupation') as HTMLSelectElement;
  const sonsSelect = document.getElementById('numberOfSons') as HTMLSelectElement;
  const daughtersSelect = document.getElementById('numberOfDaughters') as HTMLSelectElement;

  if (firstNameInput) {
    firstNameInput.addEventListener('input', function() {
      this.value = this.value.toUpperCase();
      familyData.spouse.firstName = this.value;
      updateDisplayName(this.value, lastNameInput?.value || '', 'spouseTitle');
    });
  }

  if (lastNameInput) {
    lastNameInput.addEventListener('input', function() {
      this.value = this.value.toUpperCase();
      familyData.spouse.lastName = this.value;
      updateDisplayName(firstNameInput?.value || '', this.value, 'spouseTitle');
    });
  }

  if (nativeInput) {
    nativeInput.addEventListener('input', function() {
      this.value = this.value.toUpperCase();
      familyData.spouse.nativePlace = this.value;
    });
  }

  if (contactInput) {
    contactInput.addEventListener('input', function() {
      familyData.spouse.contactNumber = this.value;
      const errorElement = document.getElementById('spouseContactNumberError');
      if (this.value && !validateContactNumber(this.value)) {
        if (errorElement) {
          errorElement.textContent = 'Contact number must contain only numbers';
          errorElement.classList.add('show');
        }
      } else {
        if (errorElement) {
          errorElement.classList.remove('show');
        }
      }
    });
  }

  if (dateInput) {
    dateInput.addEventListener('change', function() {
      familyData.spouse.dateOfBirth = this.value;
      const ageElement = document.getElementById('spouseAge');
      if (this.value) {
        const age = calculateAge(this.value);
        if (ageElement) {
          ageElement.textContent = `Age: ${age}`;
        }
      } else {
        if (ageElement) {
          ageElement.textContent = '';
        }
      }
    });
  }

  if (occupationSelect) {
    occupationSelect.addEventListener('change', function() {
      familyData.spouse.occupation = this.value;
    });
  }

  if (sonsSelect) {
    sonsSelect.addEventListener('change', function() {
      const numberOfSons = parseInt(this.value) || 0;
      familyData.spouse.numberOfSons = numberOfSons;
      generateChildrenForms('sons', numberOfSons);
    });
  }

  if (daughtersSelect) {
    daughtersSelect.addEventListener('change', function() {
      const numberOfDaughters = parseInt(this.value) || 0;
      familyData.spouse.numberOfDaughters = numberOfDaughters;
      generateChildrenForms('daughters', numberOfDaughters);
    });
  }
}

function resetSpouseForm() {
  const spouseInputs = ['spouseFirstName', 'spouseLastName', 'spouseContactNumber', 'spouseNativePlace', 'spouseDateOfBirth'];
  spouseInputs.forEach(id => {
    const element = document.getElementById(id) as HTMLInputElement;
    if (element) {
      element.value = '';
    }
  });
  
  const spouseOccupation = document.getElementById('spouseOccupation') as HTMLSelectElement;
  const numberOfSons = document.getElementById('numberOfSons') as HTMLSelectElement;
  const numberOfDaughters = document.getElementById('numberOfDaughters') as HTMLSelectElement;
  const spouseAge = document.getElementById('spouseAge');
  
  if (spouseOccupation) spouseOccupation.selectedIndex = 0;
  if (numberOfSons) numberOfSons.selectedIndex = 0;
  if (numberOfDaughters) numberOfDaughters.selectedIndex = 0;
  if (spouseAge) spouseAge.textContent = '';
  
  // Hide children sections
  const sonsSection = document.getElementById('sonsSection');
  const daughtersSection = document.getElementById('daughtersSection');
  if (sonsSection) sonsSection.style.display = 'none';
  if (daughtersSection) daughtersSection.style.display = 'none';
}

// Generate children forms
function generateChildrenForms(type: 'sons' | 'daughters', count: number) {
  const container = document.getElementById(type === 'sons' ? 'sonsContainer' : 'daughtersContainer');
  const section = document.getElementById(type === 'sons' ? 'sonsSection' : 'daughtersSection');
  
  if (!container || !section) return;
  
  container.innerHTML = '';
  
  if (count > 0) {
    section.style.display = 'block';
    familyData[type] = [];
    
    for (let i = 0; i < count; i++) {
      const childData: Child = {
        firstName: '',
        lastName: '',
        contactNumber: '',
        dateOfBirth: '',
        occupation: '',
        currentPlace: '',
        phoneNumber: '',
        maritalStatus: '',
        spouse: null
      };
      
      familyData[type].push(childData);
      
      const childForm = createChildForm(childData, i, type);
      container.appendChild(childForm);
    }
  } else {
    section.style.display = 'none';
    familyData[type] = [];
  }
}

function createChildForm(childData: Child, index: number, type: 'sons' | 'daughters') {
  const div = document.createElement('div');
  div.className = 'child-form';
  div.innerHTML = `
    <h3>${type === 'sons' ? 'Son' : 'Daughter'} ${index + 1}</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="label">First Name / पहिले नाव</label>
        <input type="text" class="input child-input" data-field="firstName" data-type="${type}" data-index="${index}" placeholder="Enter first name / पहिले नाव प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Last Name / आडनाव</label>
        <input type="text" class="input child-input" data-field="lastName" data-type="${type}" data-index="${index}" placeholder="Enter last name / आडनाव प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Contact Number / संपर्क क्रमांक</label>
        <input type="text" class="input child-input" data-field="contactNumber" data-type="${type}" data-index="${index}" placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Date of Birth / जन्म तारीख</label>
        <input type="date" class="input child-input" data-field="dateOfBirth" data-type="${type}" data-index="${index}">
        <div class="age-display" id="${type}Age${index}"></div>
      </div>
      <div>
        <label class="label">Occupation / व्यवसाय</label>
        <select class="input child-input" data-field="occupation" data-type="${type}" data-index="${index}">
          <option value="">Select occupation / व्यवसाय निवडा</option>
          <option value="salaried">Salaried / नोकरदार</option>
          <option value="business">Business / व्यवसाय</option>
          <option value="student">Student / विद्यार्थी</option>
          <option value="unemployed">Unemployed / बेरोजगार</option>
        </select>
      </div>
      <div>
        <label class="label">Current Place / सध्याचे ठिकाण</label>
        <input type="text" class="input child-input" data-field="currentPlace" data-type="${type}" data-index="${index}" placeholder="Enter current place / सध्याचे ठिकाण प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Phone Number / फोन नंबर</label>
        <input type="text" class="input child-input" data-field="phoneNumber" data-type="${type}" data-index="${index}" placeholder="Enter phone number / फोन नंबर प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Marital Status / वैवाहिक स्थिती</label>
        <select class="input child-input" data-field="maritalStatus" data-type="${type}" data-index="${index}">
          <option value="">Select marital status / वैवाहिक स्थिती निवडा</option>
          <option value="single">Single / अविवाहित</option>
          <option value="married">Married / विवाहित</option>
          <option value="divorced">Divorced / घटस्फोटित</option>
          <option value="widowed">Widowed / विधवा</option>
        </select>
      </div>
    </div>
    <div class="spouse-section" id="${type}Spouse${index}" style="display: none;">
    </div>
  `;
  
  setupChildEventListeners(div, index, type);
  return div;
}

function setupChildEventListeners(container: HTMLElement, index: number, type: 'sons' | 'daughters') {
  const inputs = container.querySelectorAll('.child-input');
  
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      updateChildData(this as HTMLInputElement | HTMLSelectElement, index, type);
    });
    
    input.addEventListener('change', function() {
      updateChildData(this as HTMLInputElement | HTMLSelectElement, index, type);
    });
  });
}

function updateChildData(input: HTMLInputElement | HTMLSelectElement, index: number, type: 'sons' | 'daughters') {
  const field = input.dataset.field as keyof Child;
  let value = input.value;
  
  // Convert text inputs to uppercase
  if (input.type === 'text') {
    value = value.toUpperCase();
    (input as HTMLInputElement).value = value;
  }
  
  (familyData[type][index] as any)[field] = value;
  
  // Handle age calculation for date of birth
  if (field === 'dateOfBirth') {
    const ageElement = document.getElementById(`${type}Age${index}`);
    if (value) {
      const age = calculateAge(value);
      if (ageElement) {
        ageElement.textContent = `Age: ${age}`;
      }
    } else {
      if (ageElement) {
        ageElement.textContent = '';
      }
    }
  }
  
  // Handle marital status change
  if (field === 'maritalStatus') {
    const spouseContainer = document.getElementById(`${type}Spouse${index}`);
    if (value === 'married') {
      if (spouseContainer) {
        spouseContainer.style.display = 'block';
        createSpouseForm(spouseContainer, index, type);
      }
    } else {
      if (spouseContainer) {
        spouseContainer.style.display = 'none';
      }
      familyData[type][index].spouse = null;
    }
  }
}

function createSpouseForm(container: HTMLElement, childIndex: number, childType: 'sons' | 'daughters') {
  if (!familyData[childType][childIndex].spouse) {
    familyData[childType][childIndex].spouse = {
      firstName: '',
      lastName: '',
      contactNumber: '',
      nativePlace: '',
      dateOfBirth: '',
      occupation: '',
      numberOfChildren: 0,
      grandchildren: []
    };
  }
  
  const spouseTitle = childType === 'sons' ? 'Wife' : 'Husband';
  
  container.innerHTML = `
    <h4>${spouseTitle} Information</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="label">First Name / पहिले नाव</label>
        <input type="text" class="input spouse-input" data-field="firstName" data-child-type="${childType}" data-child-index="${childIndex}" placeholder="Enter first name / पहिले नाव प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Last Name / आडनाव</label>
        <input type="text" class="input spouse-input" data-field="lastName" data-child-type="${childType}" data-child-index="${childIndex}" placeholder="Enter last name / आडनाव प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Contact Number / संपर्क क्रमांक</label>
        <input type="text" class="input spouse-input" data-field="contactNumber" data-child-type="${childType}" data-child-index="${childIndex}" placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Native Place / मूळ गाव</label>
        <input type="text" class="input spouse-input" data-field="nativePlace" data-child-type="${childType}" data-child-index="${childIndex}" placeholder="Enter native place / मूळ गाव प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Date of Birth / जन्म तारीख</label>
        <input type="date" class="input spouse-input" data-field="dateOfBirth" data-child-type="${childType}" data-child-index="${childIndex}">
        <div class="age-display" id="${childType}SpouseAge${childIndex}"></div>
      </div>
      <div>
        <label class="label">Occupation / व्यवसाय</label>
        <select class="input spouse-input" data-field="occupation" data-child-type="${childType}" data-child-index="${childIndex}">
          <option value="">Select occupation / व्यवसाय निवडा</option>
          <option value="retired">Retired / निवृत्त</option>
          <option value="housewife">Housewife / गृहिणी</option>
          <option value="salaried">Salaried / नोकरदार</option>
          <option value="business">Business / व्यवसाय</option>
        </select>
      </div>
      <div>
        <label class="label">Number of Children / मुलांची संख्या</label>
        <select class="input spouse-input" data-field="numberOfChildren" data-child-type="${childType}" data-child-index="${childIndex}">
          <option value="">Select number of children / मुलांची संख्या निवडा</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>
    </div>
    <div class="grandchildren-section" id="${childType}Grandchildren${childIndex}" style="display: none;">
    </div>
  `;
  
  setupSpouseEventListeners(container, childIndex, childType);
}

function setupSpouseEventListeners(container: HTMLElement, childIndex: number, childType: 'sons' | 'daughters') {
  const inputs = container.querySelectorAll('.spouse-input');
  
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      updateSpouseData(this as HTMLInputElement | HTMLSelectElement, childIndex, childType);
    });
    
    input.addEventListener('change', function() {
      updateSpouseData(this as HTMLInputElement | HTMLSelectElement, childIndex, childType);
    });
  });
}

function updateSpouseData(input: HTMLInputElement | HTMLSelectElement, childIndex: number, childType: 'sons' | 'daughters') {
  const field = input.dataset.field as keyof ChildSpouse;
  let value: string | number = input.value;
  
  // Convert text inputs to uppercase
  if (input.type === 'text') {
    value = value.toUpperCase();
    (input as HTMLInputElement).value = value as string;
  }
  
  // Handle number of children
  if (field === 'numberOfChildren') {
    value = parseInt(value as string) || 0;
  }
  
  if (familyData[childType][childIndex].spouse) {
    (familyData[childType][childIndex].spouse as any)[field] = value;
  }
  
  // Handle age calculation for date of birth
  if (field === 'dateOfBirth') {
    const ageElement = document.getElementById(`${childType}SpouseAge${childIndex}`);
    if (value) {
      const age = calculateAge(value as string);
      if (ageElement) {
        ageElement.textContent = `Age: ${age}`;
      }
    } else {
      if (ageElement) {
        ageElement.textContent = '';
      }
    }
  }
  
  // Handle number of children change
  if (field === 'numberOfChildren') {
    const grandchildrenContainer = document.getElementById(`${childType}Grandchildren${childIndex}`);
    if (value as number > 0) {
      if (grandchildrenContainer) {
        grandchildrenContainer.style.display = 'block';
        createGrandchildrenForms(grandchildrenContainer, value as number, childIndex, childType);
      }
    } else {
      if (grandchildrenContainer) {
        grandchildrenContainer.style.display = 'none';
      }
      if (familyData[childType][childIndex].spouse) {
        familyData[childType][childIndex].spouse!.grandchildren = [];
      }
    }
  }
}

function createGrandchildrenForms(container: HTMLElement, count: number, childIndex: number, childType: 'sons' | 'daughters') {
  if (familyData[childType][childIndex].spouse) {
    familyData[childType][childIndex].spouse!.grandchildren = [];
  }
  
  container.innerHTML = '<h5>Grandchildren / नातवंडे</h5>';
  
  for (let i = 0; i < count; i++) {
    const grandchildData: GrandchildData = {
      firstName: '',
      lastName: '',
      contactNumber: '',
      dateOfBirth: '',
      occupation: '',
      currentPlace: '',
      phoneNumber: ''
    };
    
    if (familyData[childType][childIndex].spouse) {
      familyData[childType][childIndex].spouse!.grandchildren.push(grandchildData);
    }
    
    const grandchildForm = createGrandchildForm(grandchildData, i, childIndex, childType);
    container.appendChild(grandchildForm);
  }
}

function createGrandchildForm(grandchildData: GrandchildData, grandchildIndex: number, childIndex: number, childType: 'sons' | 'daughters') {
  const div = document.createElement('div');
  div.className = 'grandchild-form';
  div.innerHTML = `
    <h4>Grandchild ${grandchildIndex + 1}</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="label">First Name / पहिले नाव</label>
        <input type="text" class="input grandchild-input" data-field="firstName" data-child-type="${childType}" data-child-index="${childIndex}" data-grandchild-index="${grandchildIndex}" placeholder="Enter first name / पहिले नाव प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Last Name / आडनाव</label>
        <input type="text" class="input grandchild-input" data-field="lastName" data-child-type="${childType}" data-child-index="${childIndex}" data-grandchild-index="${grandchildIndex}" placeholder="Enter last name / आडनाव प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Contact Number / संपर्क क्रमांक</label>
        <input type="text" class="input grandchild-input" data-field="contactNumber" data-child-type="${childType}" data-child-index="${childIndex}" data-grandchild-index="${grandchildIndex}" placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Date of Birth / जन्म तारीख</label>
        <input type="date" class="input grandchild-input" data-field="dateOfBirth" data-child-type="${childType}" data-child-index="${childIndex}" data-grandchild-index="${grandchildIndex}">
        <div class="age-display" id="${childType}GrandchildAge${childIndex}_${grandchildIndex}"></div>
      </div>
      <div>
        <label class="label">Occupation / व्यवसाय</label>
        <select class="input grandchild-input" data-field="occupation" data-child-type="${childType}" data-child-index="${childIndex}" data-grandchild-index="${grandchildIndex}">
          <option value="">Select occupation / व्यवसाय निवडा</option>
          <option value="salaried">Salaried / नोकरदार</option>
          <option value="business">Business / व्यवसाय</option>
          <option value="student">Student / विद्यार्थी</option>
          <option value="unemployed">Unemployed / बेरोजगार</option>
        </select>
      </div>
      <div>
        <label class="label">Current Place / सध्याचे ठिकाण</label>
        <input type="text" class="input grandchild-input" data-field="currentPlace" data-child-type="${childType}" data-child-index="${childIndex}" data-grandchild-index="${grandchildIndex}" placeholder="Enter current place / सध्याचे ठिकाण प्रविष्ट करा">
      </div>
      <div>
        <label class="label">Phone Number / फोन नंबर</label>
        <input type="text" class="input grandchild-input" data-field="phoneNumber" data-child-type="${childType}" data-child-index="${childIndex}" data-grandchild-index="${grandchildIndex}" placeholder="Enter phone number / फोन नंबर प्रविष्ट करा">
      </div>
    </div>
  `;
  
  setupGrandchildEventListeners(div, grandchildIndex, childIndex, childType);
  return div;
}

function setupGrandchildEventListeners(container: HTMLElement, grandchildIndex: number, childIndex: number, childType: 'sons' | 'daughters') {
  const inputs = container.querySelectorAll('.grandchild-input');
  
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      updateGrandchildData(this as HTMLInputElement | HTMLSelectElement, grandchildIndex, childIndex, childType);
    });
    
    input.addEventListener('change', function() {
      updateGrandchildData(this as HTMLInputElement | HTMLSelectElement, grandchildIndex, childIndex, childType);
    });
  });
}

function updateGrandchildData(input: HTMLInputElement | HTMLSelectElement, grandchildIndex: number, childIndex: number, childType: 'sons' | 'daughters') {
  const field = input.dataset.field as keyof GrandchildData;
  let value = input.value;
  
  // Convert text inputs to uppercase
  if (input.type === 'text') {
    value = value.toUpperCase();
    (input as HTMLInputElement).value = value;
  }
  
  if (familyData[childType][childIndex].spouse) {
    (familyData[childType][childIndex].spouse!.grandchildren[grandchildIndex] as any)[field] = value;
  }
  
  // Handle age calculation for date of birth
  if (field === 'dateOfBirth') {
    const ageElement = document.getElementById(`${childType}GrandchildAge${childIndex}_${grandchildIndex}`);
    if (value) {
      const age = calculateAge(value);
      if (ageElement) {
        ageElement.textContent = `Age: ${age}`;
      }
    } else {
      if (ageElement) {
        ageElement.textContent = '';
      }
    }
  }
}

// Form validation
function validateForm() {
  let isValid = true;
  const errors: string[] = [];
  
  // Validate family head
  if (!familyData.familyHead.firstName) {
    errors.push('Family head first name is required');
    isValid = false;
  }
  
  if (!familyData.familyHead.lastName) {
    errors.push('Family head last name is required');
    isValid = false;
  }
  
  if (!familyData.familyHead.dateOfBirth) {
    errors.push('Family head date of birth is required');
    isValid = false;
  }
  
  if (familyData.familyHead.contactNumber && !validateContactNumber(familyData.familyHead.contactNumber)) {
    errors.push('Family head contact number must contain only numbers');
    isValid = false;
  }
  
  // Validate spouse if married
  if (familyData.familyHead.maritalStatus === 'married') {
    if (familyData.spouse.contactNumber && !validateContactNumber(familyData.spouse.contactNumber)) {
      errors.push('Spouse contact number must contain only numbers');
      isValid = false;
    }
  }
  
  return { isValid, errors };
}

// Submit form
async function submitForm() {
  console.log('Starting form submission...');
  console.log('Current familyData:', familyData);
  
  const validation = validateForm();
  
  if (!validation.isValid) {
    toast.error('Validation Error', { description: validation.errors.join(', ') });
    return;
  }

  try {
    // Calculate age for family head
    const headAge = calculateAge(familyData.familyHead.dateOfBirth);
    const convertedHeadDate = convertDateFormat(familyData.familyHead.dateOfBirth);
    
    console.log('Inserting family head with data:', {
      first_name: familyData.familyHead.firstName,
      last_name: familyData.familyHead.lastName,
      date_of_birth: convertedHeadDate!,
      age: headAge
    });
    
    // Insert family head
    const { data: familyHeadData, error: familyHeadError } = await supabase
      .from('family_heads')
      .insert({
        first_name: familyData.familyHead.firstName,
        last_name: familyData.familyHead.lastName,
        date_of_birth: convertedHeadDate!,
        age: headAge,
        native_place: familyData.familyHead.nativePlace || null,
        current_place: familyData.familyHead.currentPlace || null,
        contact_number: familyData.familyHead.contactNumber || null,
        marital_status: familyData.familyHead.maritalStatus as any,
        occupation: familyData.familyHead.occupation as any || null
      })
      .select()
      .single();

    if (familyHeadError) {
      console.error('Family head error:', familyHeadError);
      throw familyHeadError;
    }

    console.log('Family head inserted:', familyHeadData);
    const familyHeadId = familyHeadData.id;

    // Insert spouse if married
    if (familyData.familyHead.maritalStatus === 'married' && (familyData.spouse.firstName || familyData.spouse.lastName)) {
      const spouseAge = familyData.spouse.dateOfBirth ? calculateAge(familyData.spouse.dateOfBirth) : null;
      const convertedSpouseDate = convertDateFormat(familyData.spouse.dateOfBirth);
      
      const { data: spouseData, error: spouseError } = await supabase
        .from('spouses')
        .insert({
          family_head_id: familyHeadId,
          first_name: familyData.spouse.firstName || null,
          last_name: familyData.spouse.lastName || null,
          date_of_birth: convertedSpouseDate,
          age: spouseAge,
          native_place: familyData.spouse.nativePlace || null,
          contact_number: familyData.spouse.contactNumber || null,
          occupation: familyData.spouse.occupation as any || null,
          number_of_sons: familyData.spouse.numberOfSons || 0,
          number_of_daughters: familyData.spouse.numberOfDaughters || 0
        })
        .select()
        .single();

      if (spouseError) {
        console.error('Spouse error:', spouseError);
        throw spouseError;
      }
      
      console.log('Spouse inserted:', spouseData);
    }

    // Insert children (sons)
    for (let i = 0; i < familyData.sons.length; i++) {
      const son = familyData.sons[i];
      if (!son.firstName && !son.lastName) continue;

      const sonAge = son.dateOfBirth ? calculateAge(son.dateOfBirth) : null;
      const convertedSonDate = convertDateFormat(son.dateOfBirth);
      
      const { data: sonData, error: sonError } = await supabase
        .from('children')
        .insert({
          family_head_id: familyHeadId,
          first_name: son.firstName || null,
          last_name: son.lastName || null,
          contact_number: son.contactNumber || null,
          date_of_birth: convertedSonDate,
          age: sonAge,
          occupation: son.occupation as any || null,
          current_place: son.currentPlace || null,
          phone_number: son.phoneNumber || null,
          marital_status: son.maritalStatus as any || null,
          child_type: 'son',
          child_index: i
        })
        .select()
        .single();

      if (sonError) {
        console.error('Son error:', sonError);
        throw sonError;
      }

      console.log('Son inserted:', sonData);

      // Insert son's spouse if married
      if (son.maritalStatus === 'married' && son.spouse) {
        const sonSpouseAge = son.spouse.dateOfBirth ? calculateAge(son.spouse.dateOfBirth) : null;
        const convertedSonSpouseDate = convertDateFormat(son.spouse.dateOfBirth);
        
        const { data: sonSpouseData, error: sonSpouseError } = await supabase
          .from('child_spouses')
          .insert({
            child_id: sonData.id,
            first_name: son.spouse.firstName || null,
            last_name: son.spouse.lastName || null,
            contact_number: son.spouse.contactNumber || null,
            native_place: son.spouse.nativePlace || null,
            date_of_birth: convertedSonSpouseDate,
            age: sonSpouseAge,
            occupation: son.spouse.occupation as any || null,
            number_of_children: son.spouse.numberOfChildren || 0
          })
          .select()
          .single();

        if (sonSpouseError) {
          console.error('Son spouse error:', sonSpouseError);
          throw sonSpouseError;
        }

        console.log('Son spouse inserted:', sonSpouseData);

        // Insert grandchildren
        if (son.spouse.grandchildren) {
          for (let j = 0; j < son.spouse.grandchildren.length; j++) {
            const grandchild = son.spouse.grandchildren[j];
            if (!grandchild.firstName && !grandchild.lastName) continue;

            const grandchildAge = grandchild.dateOfBirth ? calculateAge(grandchild.dateOfBirth) : null;
            const convertedGrandchildDate = convertDateFormat(grandchild.dateOfBirth);
            
            const { error: grandchildError } = await supabase
              .from('grandchildren')
              .insert({
                child_spouse_id: sonSpouseData.id,
                first_name: grandchild.firstName || null,
                last_name: grandchild.lastName || null,
                contact_number: grandchild.contactNumber || null,
                date_of_birth: convertedGrandchildDate,
                age: grandchildAge,
                occupation: grandchild.occupation as any || null,
                current_place: grandchild.currentPlace || null,
                phone_number: grandchild.phoneNumber || null,
                grandchild_index: j
              });

            if (grandchildError) {
              console.error('Grandchild error:', grandchildError);
              throw grandchildError;
            }
          }
        }
      }
    }

    // Insert children (daughters)
    for (let i = 0; i < familyData.daughters.length; i++) {
      const daughter = familyData.daughters[i];
      if (!daughter.firstName && !daughter.lastName) continue;

      const daughterAge = daughter.dateOfBirth ? calculateAge(daughter.dateOfBirth) : null;
      const convertedDaughterDate = convertDateFormat(daughter.dateOfBirth);
      
      const { data: daughterData, error: daughterError } = await supabase
        .from('children')
        .insert({
          family_head_id: familyHeadId,
          first_name: daughter.firstName || null,
          last_name: daughter.lastName || null,
          contact_number: daughter.contactNumber || null,
          date_of_birth: convertedDaughterDate,
          age: daughterAge,
          occupation: daughter.occupation as any || null,
          current_place: daughter.currentPlace || null,
          phone_number: daughter.phoneNumber || null,
          marital_status: daughter.maritalStatus as any || null,
          child_type: 'daughter',
          child_index: i
        })
        .select()
        .single();

      if (daughterError) {
        console.error('Daughter error:', daughterError);
        throw daughterError;
      }

      console.log('Daughter inserted:', daughterData);

      // Insert daughter's spouse if married
      if (daughter.maritalStatus === 'married' && daughter.spouse) {
        const daughterSpouseAge = daughter.spouse.dateOfBirth ? calculateAge(daughter.spouse.dateOfBirth) : null;
        const convertedDaughterSpouseDate = convertDateFormat(daughter.spouse.dateOfBirth);
        
        const { data: daughterSpouseData, error: daughterSpouseError } = await supabase
          .from('child_spouses')
          .insert({
            child_id: daughterData.id,
            first_name: daughter.spouse.firstName || null,
            last_name: daughter.spouse.lastName || null,
            contact_number: daughter.spouse.contactNumber || null,
            native_place: daughter.spouse.nativePlace || null,
            date_of_birth: convertedDaughterSpouseDate,
            age: daughterSpouseAge,
            occupation: daughter.spouse.occupation as any || null,
            number_of_children: daughter.spouse.numberOfChildren || 0
          })
          .select()
          .single();

        if (daughterSpouseError) {
          console.error('Daughter spouse error:', daughterSpouseError);
          throw daughterSpouseError;
        }

        console.log('Daughter spouse inserted:', daughterSpouseData);

        // Insert grandchildren
        if (daughter.spouse.grandchildren) {
          for (let j = 0; j < daughter.spouse.grandchildren.length; j++) {
            const grandchild = daughter.spouse.grandchildren[j];
            if (!grandchild.firstName && !grandchild.lastName) continue;

            const grandchildAge = grandchild.dateOfBirth ? calculateAge(grandchild.dateOfBirth) : null;
            const convertedGrandchildDate = convertDateFormat(grandchild.dateOfBirth);
            
            const { error: grandchildError } = await supabase
              .from('grandchildren')
              .insert({
                child_spouse_id: daughterSpouseData.id,
                first_name: grandchild.firstName || null,
                last_name: grandchild.lastName || null,
                contact_number: grandchild.contactNumber || null,
                date_of_birth: convertedGrandchildDate,
                age: grandchildAge,
                occupation: grandchild.occupation as any || null,
                current_place: grandchild.currentPlace || null,
                phone_number: grandchild.phoneNumber || null,
                grandchild_index: j
              });

            if (grandchildError) {
              console.error('Grandchild error:', grandchildError);
              throw grandchildError;
            }
          }
        }
      }
    }

    toast.success('Success!', { description: 'Family information has been saved successfully.' });
    console.log('Form submission completed successfully');
    
  } catch (error) {
    console.error('Form submission error:', error);
    toast.error('Error', { description: `Failed to save family information: ${(error as Error).message}` });
  }
}

// Initialize the application
function init() {
  setupFamilyHeadEvents();
  setupSpouseEvents();
  
  // Submit button event
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitForm);
  }
  
  console.log('Family form initialized');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

const FamilyForm = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Family Head Section */}
        <div className="border-b pb-6">
          <h2 id="familyHeadTitle" className="text-2xl font-semibold text-gray-800 mb-6">
            Family Head Information / कुटुंब प्रमुखाची माहिती
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="headFirstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name / पहिले नाव *
              </label>
              <input
                type="text"
                id="headFirstName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
                required
              />
            </div>
            <div>
              <label htmlFor="headLastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name / आडनाव *
              </label>
              <input
                type="text"
                id="headLastName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter last name / आडनाव प्रविष्ट करा"
                required
              />
            </div>
            <div>
              <label htmlFor="headDateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth / जन्म तारीख *
              </label>
              <input
                type="date"
                id="headDateOfBirth"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div id="headAge" className="text-sm text-gray-500 mt-1"></div>
            </div>
            <div>
              <label htmlFor="headNativePlace" className="block text-sm font-medium text-gray-700 mb-2">
                Native Place / मूळ गाव
              </label>
              <input
                type="text"
                id="headNativePlace"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter native place / मूळ गाव प्रविष्ट करा"
              />
            </div>
            <div>
              <label htmlFor="headCurrentPlace" className="block text-sm font-medium text-gray-700 mb-2">
                Current Place / सध्याचे ठिकाण
              </label>
              <input
                type="text"
                id="headCurrentPlace"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current place / सध्याचे ठिकाण प्रविष्ट करा"
              />
            </div>
            <div>
              <label htmlFor="headContactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number / संपर्क क्रमांक
              </label>
              <input
                type="text"
                id="headContactNumber"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
              />
              <div id="headContactNumberError" className="text-red-500 text-sm mt-1 hidden"></div>
            </div>
            <div>
              <label htmlFor="headMaritalStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Marital Status / वैवाहिक स्थिती *
              </label>
              <select
                id="headMaritalStatus"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label htmlFor="headOccupation" className="block text-sm font-medium text-gray-700 mb-2">
                Occupation / व्यवसाय
              </label>
              <select
                id="headOccupation"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select occupation / व्यवसाय निवडा</option>
                <option value="retired">Retired / निवृत्त</option>
                <option value="housewife">Housewife / गृहिणी</option>
                <option value="salaried">Salaried / नोकरदार</option>
                <option value="business">Business / व्यवसाय</option>
                <option value="student">Student / विद्यार्थी</option>
                <option value="unemployed">Unemployed / बेरोजगार</option>
              </select>
            </div>
          </div>
        </div>

        {/* Spouse Section */}
        <div id="spouseSection" className="border-b pb-6" style={{ display: 'none' }}>
          <h2 id="spouseTitle" className="text-2xl font-semibold text-gray-800 mb-6">
            Spouse Information / जीवनसाथी माहिती
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="spouseFirstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name / पहिले नाव
              </label>
              <input
                type="text"
                id="spouseFirstName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter first name / पहिले नाव प्रविष्ट करा"
              />
            </div>
            <div>
              <label htmlFor="spouseLastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name / आडनाव
              </label>
              <input
                type="text"
                id="spouseLastName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter last name / आडनाव प्रविष्ट करा"
              />
            </div>
            <div>
              <label htmlFor="spouseDateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth / जन्म तारीख
              </label>
              <input
                type="date"
                id="spouseDateOfBirth"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div id="spouseAge" className="text-sm text-gray-500 mt-1"></div>
            </div>
            <div>
              <label htmlFor="spouseNativePlace" className="block text-sm font-medium text-gray-700 mb-2">
                Native Place / मूळ गाव
              </label>
              <input
                type="text"
                id="spouseNativePlace"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter native place / मूळ गाव प्रविष्ट करा"
              />
            </div>
            <div>
              <label htmlFor="spouseContactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number / संपर्क क्रमांक
              </label>
              <input
                type="text"
                id="spouseContactNumber"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter contact number / संपर्क क्रमांक प्रविष्ट करा"
              />
              <div id="spouseContactNumberError" className="text-red-500 text-sm mt-1 hidden"></div>
            </div>
            <div>
              <label htmlFor="spouseOccupation" className="block text-sm font-medium text-gray-700 mb-2">
                Occupation / व्यवसाय
              </label>
              <select
                id="spouseOccupation"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select occupation / व्यवसाय निवडा</option>
                <option value="retired">Retired / निवृत्त</option>
                <option value="housewife">Housewife / गृहिणी</option>
                <option value="salaried">Salaried / नोकरदार</option>
                <option value="business">Business / व्यवसाय</option>
              </select>
            </div>
            <div>
              <label htmlFor="numberOfSons" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Sons / मुलांची संख्या
              </label>
              <select
                id="numberOfSons"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select number of sons / मुलांची संख्या निवडा</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <div>
              <label htmlFor="numberOfDaughters" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Daughters / मुलींची संख्या
              </label>
              <select
                id="numberOfDaughters"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select number of daughters / मुलींची संख्या निवडा</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sons Section */}
        <div id="sonsSection" className="border-b pb-6" style={{ display: 'none' }}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Sons Information / मुलांची माहिती
          </h2>
          <div id="sonsContainer" className="space-y-6"></div>
        </div>

        {/* Daughters Section */}
        <div id="daughtersSection" className="border-b pb-6" style={{ display: 'none' }}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Daughters Information / मुलींची माहिती
          </h2>
          <div id="daughtersContainer" className="space-y-6"></div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            id="submitBtn"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-lg"
          >
            Submit Family Information / कुटुंब माहिती सादर करा
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyForm;
