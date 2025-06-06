import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Global variables
let familyData = {
  familyHead: {},
  spouse: {},
  sons: [],
  daughters: []
};

// Utility functions
function calculateAge(birthDate) {
  if (!birthDate) return '';
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

function showToast(title, message) {
  toast(title, { description: message });
}

function validateContactNumber(number) {
  return /^\d+$/.test(number);
}

function updateDisplayName(firstName, lastName, titleElementId) {
  const titleElement = document.getElementById(titleElementId);
  if (titleElement) {
    const baseTitle = titleElement.textContent.split(' (')[0];
    
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
        familyData.spouse = {};
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
function generateChildrenForms(type, count) {
  const container = document.getElementById(type === 'sons' ? 'sonsContainer' : 'daughtersContainer');
  const section = document.getElementById(type === 'sons' ? 'sonsSection' : 'daughtersSection');
  
  if (!container || !section) return;
  
  container.innerHTML = '';
  
  if (count > 0) {
    section.style.display = 'block';
    familyData[type] = [];
    
    for (let i = 0; i < count; i++) {
      const childData = {
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

function createChildForm(childData, index, type) {
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

function setupChildEventListeners(container, index, type) {
  const inputs = container.querySelectorAll('.child-input');
  
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      updateChildData(this, index, type);
    });
    
    input.addEventListener('change', function() {
      updateChildData(this, index, type);
    });
  });
}

function updateChildData(input, index, type) {
  const field = input.dataset.field;
  let value = input.value;
  
  // Convert text inputs to uppercase
  if (input.type === 'text') {
    value = value.toUpperCase();
    input.value = value;
  }
  
  familyData[type][index][field] = value;
  
  // Handle age calculation for date of birth
  if (field === 'dateOfBirth') {
    const ageElement = document.getElementById(`${type}Age${index}`);
    if (value) {
      if (ageElement) {
        ageElement.textContent = `Age: ${calculateAge(value)}`;
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

function createSpouseForm(container, childIndex, childType) {
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

function setupSpouseEventListeners(container, childIndex, childType) {
  const inputs = container.querySelectorAll('.spouse-input');
  
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      updateSpouseData(this, childIndex, childType);
    });
    
    input.addEventListener('change', function() {
      updateSpouseData(this, childIndex, childType);
    });
  });
}

function updateSpouseData(input, childIndex, childType) {
  const field = input.dataset.field;
  let value = input.value;
  
  // Convert text inputs to uppercase
  if (input.type === 'text') {
    value = value.toUpperCase();
    input.value = value;
  }
  
  // Handle number of children
  if (field === 'numberOfChildren') {
    value = parseInt(value) || 0;
  }
  
  familyData[childType][childIndex].spouse[field] = value;
  
  // Handle age calculation for date of birth
  if (field === 'dateOfBirth') {
    const ageElement = document.getElementById(`${childType}SpouseAge${childIndex}`);
    if (value) {
      if (ageElement) {
        ageElement.textContent = `Age: ${calculateAge(value)}`;
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
    if (value > 0) {
      if (grandchildrenContainer) {
        grandchildrenContainer.style.display = 'block';
        createGrandchildrenForms(grandchildrenContainer, value, childIndex, childType);
      }
    } else {
      if (grandchildrenContainer) {
        grandchildrenContainer.style.display = 'none';
      }
      familyData[childType][childIndex].spouse.grandchildren = [];
    }
  }
}

function createGrandchildrenForms(container, count, childIndex, childType) {
  familyData[childType][childIndex].spouse.grandchildren = [];
  
  container.innerHTML = '<h5>Grandchildren / नातवंडे</h5>';
  
  for (let i = 0; i < count; i++) {
    const grandchildData = {
      firstName: '',
      lastName: '',
      contactNumber: '',
      dateOfBirth: '',
      occupation: '',
      currentPlace: '',
      phoneNumber: ''
    };
    
    familyData[childType][childIndex].spouse.grandchildren.push(grandchildData);
    
    const grandchildForm = createGrandchildForm(grandchildData, i, childIndex, childType);
    container.appendChild(grandchildForm);
  }
}

function createGrandchildForm(grandchildData, grandchildIndex, childIndex, childType) {
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

function setupGrandchildEventListeners(container, grandchildIndex, childIndex, childType) {
  const inputs = container.querySelectorAll('.grandchild-input');
  
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      updateGrandchildData(this, grandchildIndex, childIndex, childType);
    });
    
    input.addEventListener('change', function() {
      updateGrandchildData(this, grandchildIndex, childIndex, childType);
    });
  });
}

function updateGrandchildData(input, grandchildIndex, childIndex, childType) {
  const field = input.dataset.field;
  let value = input.value;
  
  // Convert text inputs to uppercase
  if (input.type === 'text') {
    value = value.toUpperCase();
    input.value = value;
  }
  
  familyData[childType][childIndex].spouse.grandchildren[grandchildIndex][field] = value;
  
  // Handle age calculation for date of birth
  if (field === 'dateOfBirth') {
    const ageElement = document.getElementById(`${childType}GrandchildAge${childIndex}_${grandchildIndex}`);
    if (value) {
      if (ageElement) {
        ageElement.textContent = `Age: ${calculateAge(value)}`;
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
  const errors = [];
  
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
  const validation = validateForm();
  
  if (validation.isValid) {
    try {
      console.log('Family Head Data:', familyData.familyHead);
      console.log('Spouse Data:', familyData.spouse);
      console.log('Sons Data:', familyData.sons);
      console.log('Daughters Data:', familyData.daughters);
      
      // Calculate age for family head
      const headAge = calculateAge(familyData.familyHead.dateOfBirth);
      
      // Insert family head
      const { data: familyHeadData, error: familyHeadError } = await supabase
        .from('family_heads')
        .insert({
          first_name: familyData.familyHead.firstName,
          last_name: familyData.familyHead.lastName,
          date_of_birth: familyData.familyHead.dateOfBirth,
          age: headAge,
          native_place: familyData.familyHead.nativePlace || null,
          current_place: familyData.familyHead.currentPlace || null,
          contact_number: familyData.familyHead.contactNumber || null,
          marital_status: familyData.familyHead.maritalStatus,
          occupation: familyData.familyHead.occupation || null
        })
        .select()
        .single();

      if (familyHeadError) {
        throw familyHeadError;
      }

      const familyHeadId = familyHeadData.id;

      // Insert spouse if married
      if (familyData.familyHead.maritalStatus === 'married' && (familyData.spouse.firstName || familyData.spouse.lastName)) {
        const spouseAge = familyData.spouse.dateOfBirth ? calculateAge(familyData.spouse.dateOfBirth) : null;
        
        const { data: spouseData, error: spouseError } = await supabase
          .from('spouses')
          .insert({
            family_head_id: familyHeadId,
            first_name: familyData.spouse.firstName || null,
            last_name: familyData.spouse.lastName || null,
            date_of_birth: familyData.spouse.dateOfBirth || null,
            age: spouseAge,
            native_place: familyData.spouse.nativePlace || null,
            contact_number: familyData.spouse.contactNumber || null,
            occupation: familyData.spouse.occupation || null,
            number_of_sons: familyData.spouse.numberOfSons || 0,
            number_of_daughters: familyData.spouse.numberOfDaughters || 0
          })
          .select()
          .single();

        if (spouseError) {
          throw spouseError;
        }
      }

      // Insert children (sons)
      for (let i = 0; i < familyData.sons.length; i++) {
        const son = familyData.sons[i];
        if (!son.firstName && !son.lastName) continue;

        const sonAge = son.dateOfBirth ? calculateAge(son.dateOfBirth) : null;
        
        const { data: sonData, error: sonError } = await supabase
          .from('children')
          .insert({
            family_head_id: familyHeadId,
            first_name: son.firstName || null,
            last_name: son.lastName || null,
            contact_number: son.contactNumber || null,
            date_of_birth: son.dateOfBirth || null,
            age: sonAge,
            occupation: son.occupation || null,
            current_place: son.currentPlace || null,
            phone_number: son.phoneNumber || null,
            marital_status: son.maritalStatus || null,
            child_type: 'son',
            child_index: i
          })
          .select()
          .single();

        if (sonError) {
          throw sonError;
        }

        // Insert son's spouse if married
        if (son.maritalStatus === 'married' && son.spouse) {
          const sonSpouseAge = son.spouse.dateOfBirth ? calculateAge(son.spouse.dateOfBirth) : null;
          
          const { data: sonSpouseData, error: sonSpouseError } = await supabase
            .from('child_spouses')
            .insert({
              child_id: sonData.id,
              first_name: son.spouse.firstName || null,
              last_name: son.spouse.lastName || null,
              contact_number: son.spouse.contactNumber || null,
              native_place: son.spouse.nativePlace || null,
              date_of_birth: son.spouse.dateOfBirth || null,
              age: sonSpouseAge,
              occupation: son.spouse.occupation || null,
              number_of_children: son.spouse.numberOfChildren || 0
            })
            .select()
            .single();

          if (sonSpouseError) {
            throw sonSpouseError;
          }

          // Insert grandchildren
          if (son.spouse.grandchildren) {
            for (let j = 0; j < son.spouse.grandchildren.length; j++) {
              const grandchild = son.spouse.grandchildren[j];
              if (!grandchild.firstName && !grandchild.lastName) continue;

              const grandchildAge = grandchild.dateOfBirth ? calculateAge(grandchild.dateOfBirth) : null;
              
              const { error: grandchildError } = await supabase
                .from('grandchildren')
                .insert({
                  child_spouse_id: sonSpouseData.id,
                  first_name: grandchild.firstName || null,
                  last_name: grandchild.lastName || null,
                  contact_number: grandchild.contactNumber || null,
                  date_of_birth: grandchild.dateOfBirth || null,
                  age: grandchildAge,
                  occupation: grandchild.occupation || null,
                  current_place: grandchild.currentPlace || null,
                  phone_number: grandchild.phoneNumber || null,
                  grandchild_index: j
                });

              if (grandchildError) {
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
        
        const { data: daughterData, error: daughterError } = await supabase
          .from('children')
          .insert({
            family_head_id: familyHeadId,
            first_name: daughter.firstName || null,
            last_name: daughter.lastName || null,
            contact_number: daughter.contactNumber || null,
            date_of_birth: daughter.dateOfBirth || null,
            age: daughterAge,
            occupation: daughter.occupation || null,
            current_place: daughter.currentPlace || null,
            phone_number: daughter.phoneNumber || null,
            marital_status: daughter.maritalStatus || null,
            child_type: 'daughter',
            child_index: i
          })
          .select()
          .single();

        if (daughterError) {
          throw daughterError;
        }

        // Insert daughter's spouse if married
        if (daughter.maritalStatus === 'married' && daughter.spouse) {
          const daughterSpouseAge = daughter.spouse.dateOfBirth ? calculateAge(daughter.spouse.dateOfBirth) : null;
          
          const { data: daughterSpouseData, error: daughterSpouseError } = await supabase
            .from('child_spouses')
            .insert({
              child_id: daughterData.id,
              first_name: daughter.spouse.firstName || null,
              last_name: daughter.spouse.lastName || null,
              contact_number: daughter.spouse.contactNumber || null,
              native_place: daughter.spouse.nativePlace || null,
              date_of_birth: daughter.spouse.dateOfBirth || null,
              age: daughterSpouseAge,
              occupation: daughter.spouse.occupation || null,
              number_of_children: daughter.spouse.numberOfChildren || 0
            })
            .select()
            .single();

          if (daughterSpouseError) {
            throw daughterSpouseError;
          }

          // Insert grandchildren
          if (daughter.spouse.grandchildren) {
            for (let j = 0; j < daughter.spouse.grandchildren.length; j++) {
              const grandchild = daughter.spouse.grandchildren[j];
              if (!grandchild.firstName && !grandchild.lastName) continue;

              const grandchildAge = grandchild.dateOfBirth ? calculateAge(grandchild.dateOfBirth) : null;
              
              const { error: grandchildError } = await supabase
                .from('grandchildren')
                .insert({
                  child_spouse_id: daughterSpouseData.id,
                  first_name: grandchild.firstName || null,
                  last_name: grandchild.lastName || null,
                  contact_number: grandchild.contactNumber || null,
                  date_of_birth: grandchild.dateOfBirth || null,
                  age: grandchildAge,
                  occupation: grandchild.occupation || null,
                  current_place: grandchild.currentPlace || null,
                  phone_number: grandchild.phoneNumber || null,
                  grandchild_index: j
                });

              if (grandchildError) {
                throw grandchildError;
              }
            }
          }
        }
      }

      showToast('Form Submitted Successfully!', 'Family information has been saved.');
      
    } catch (error) {
      console.error('Form submission error:', error);
      showToast('Error', `Failed to save family information: ${error.message}`);
    }
  } else {
    showToast('Validation Error', validation.errors.join(', '));
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

const FamilyForm = () => {
  useEffect(() => {
    init();
  }, []);

  return null; // This component just adds functionality to the existing HTML
};

export default FamilyForm;
