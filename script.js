
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
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

function validateContactNumber(number) {
  return /^\d+$/.test(number);
}

function updateDisplayName(firstName, lastName, titleElementId) {
  const titleElement = document.getElementById(titleElementId);
  const baseTitle = titleElement.textContent.split(' (')[0];
  
  if (firstName || lastName) {
    const displayName = `${firstName} ${lastName}`.trim();
    titleElement.textContent = `${baseTitle} (${displayName})`;
  } else {
    titleElement.textContent = baseTitle;
  }
}

// Event listeners for Family Head
function setupFamilyHeadEvents() {
  const firstNameInput = document.getElementById('headFirstName');
  const lastNameInput = document.getElementById('headLastName');
  const dateInput = document.getElementById('headDateOfBirth');
  const nativeInput = document.getElementById('headNativePlace');
  const currentInput = document.getElementById('headCurrentPlace');
  const contactInput = document.getElementById('headContactNumber');
  const maritalSelect = document.getElementById('headMaritalStatus');
  const occupationSelect = document.getElementById('headOccupation');

  // Convert to uppercase and update display
  firstNameInput.addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    familyData.familyHead.firstName = this.value;
    updateDisplayName(this.value, lastNameInput.value, 'familyHeadTitle');
  });

  lastNameInput.addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    familyData.familyHead.lastName = this.value;
    updateDisplayName(firstNameInput.value, this.value, 'familyHeadTitle');
  });

  nativeInput.addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    familyData.familyHead.nativePlace = this.value;
  });

  currentInput.addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    familyData.familyHead.currentPlace = this.value;
  });

  contactInput.addEventListener('input', function() {
    familyData.familyHead.contactNumber = this.value;
    const errorElement = document.getElementById('headContactNumberError');
    if (this.value && !validateContactNumber(this.value)) {
      errorElement.textContent = 'Contact number must contain only numbers';
      errorElement.classList.add('show');
    } else {
      errorElement.classList.remove('show');
    }
  });

  dateInput.addEventListener('change', function() {
    familyData.familyHead.dateOfBirth = this.value;
    const ageElement = document.getElementById('headAge');
    if (this.value) {
      ageElement.textContent = `Age: ${calculateAge(this.value)}`;
    } else {
      ageElement.textContent = '';
    }
  });

  maritalSelect.addEventListener('change', function() {
    familyData.familyHead.maritalStatus = this.value;
    const spouseSection = document.getElementById('spouseSection');
    if (this.value === 'married') {
      spouseSection.style.display = 'block';
    } else {
      spouseSection.style.display = 'none';
      // Reset spouse data
      familyData.spouse = {};
      resetSpouseForm();
    }
  });

  occupationSelect.addEventListener('change', function() {
    familyData.familyHead.occupation = this.value;
  });
}

// Event listeners for Spouse
function setupSpouseEvents() {
  const firstNameInput = document.getElementById('spouseFirstName');
  const lastNameInput = document.getElementById('spouseLastName');
  const dateInput = document.getElementById('spouseDateOfBirth');
  const nativeInput = document.getElementById('spouseNativePlace');
  const contactInput = document.getElementById('spouseContactNumber');
  const occupationSelect = document.getElementById('spouseOccupation');
  const sonsSelect = document.getElementById('numberOfSons');
  const daughtersSelect = document.getElementById('numberOfDaughters');

  firstNameInput.addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    familyData.spouse.firstName = this.value;
    updateDisplayName(this.value, lastNameInput.value, 'spouseTitle');
  });

  lastNameInput.addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    familyData.spouse.lastName = this.value;
    updateDisplayName(firstNameInput.value, this.value, 'spouseTitle');
  });

  nativeInput.addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    familyData.spouse.nativePlace = this.value;
  });

  contactInput.addEventListener('input', function() {
    familyData.spouse.contactNumber = this.value;
    const errorElement = document.getElementById('spouseContactNumberError');
    if (this.value && !validateContactNumber(this.value)) {
      errorElement.textContent = 'Contact number must contain only numbers';
      errorElement.classList.add('show');
    } else {
      errorElement.classList.remove('show');
    }
  });

  dateInput.addEventListener('change', function() {
    familyData.spouse.dateOfBirth = this.value;
    const ageElement = document.getElementById('spouseAge');
    if (this.value) {
      ageElement.textContent = `Age: ${calculateAge(this.value)}`;
    } else {
      ageElement.textContent = '';
    }
  });

  occupationSelect.addEventListener('change', function() {
    familyData.spouse.occupation = this.value;
  });

  sonsSelect.addEventListener('change', function() {
    const numberOfSons = parseInt(this.value) || 0;
    familyData.spouse.numberOfSons = numberOfSons;
    generateChildrenForms('sons', numberOfSons);
  });

  daughtersSelect.addEventListener('change', function() {
    const numberOfDaughters = parseInt(this.value) || 0;
    familyData.spouse.numberOfDaughters = numberOfDaughters;
    generateChildrenForms('daughters', numberOfDaughters);
  });
}

function resetSpouseForm() {
  const spouseInputs = ['spouseFirstName', 'spouseLastName', 'spouseContactNumber', 'spouseNativePlace', 'spouseDateOfBirth'];
  spouseInputs.forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('spouseOccupation').selectedIndex = 0;
  document.getElementById('numberOfSons').selectedIndex = 0;
  document.getElementById('numberOfDaughters').selectedIndex = 0;
  document.getElementById('spouseAge').textContent = '';
  
  // Hide children sections
  document.getElementById('sonsSection').style.display = 'none';
  document.getElementById('daughtersSection').style.display = 'none';
}

// Generate children forms
function generateChildrenForms(type, count) {
  const container = document.getElementById(type === 'sons' ? 'sonsContainer' : 'daughtersContainer');
  const section = document.getElementById(type === 'sons' ? 'sonsSection' : 'daughtersSection');
  
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
      ageElement.textContent = `Age: ${calculateAge(value)}`;
    } else {
      ageElement.textContent = '';
    }
  }
  
  // Handle marital status change
  if (field === 'maritalStatus') {
    const spouseContainer = document.getElementById(`${type}Spouse${index}`);
    if (value === 'married') {
      spouseContainer.style.display = 'block';
      createSpouseForm(spouseContainer, index, type);
    } else {
      spouseContainer.style.display = 'none';
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
      ageElement.textContent = `Age: ${calculateAge(value)}`;
    } else {
      ageElement.textContent = '';
    }
  }
  
  // Handle number of children change
  if (field === 'numberOfChildren') {
    const grandchildrenContainer = document.getElementById(`${childType}Grandchildren${childIndex}`);
    if (value > 0) {
      grandchildrenContainer.style.display = 'block';
      createGrandchildrenForms(grandchildrenContainer, value, childIndex, childType);
    } else {
      grandchildrenContainer.style.display = 'none';
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
      ageElement.textContent = `Age: ${calculateAge(value)}`;
    } else {
      ageElement.textContent = '';
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
function submitForm() {
  const validation = validateForm();
  
  if (validation.isValid) {
    console.log('Family Head Data:', familyData.familyHead);
    console.log('Spouse Data:', familyData.spouse);
    console.log('Sons Data:', familyData.sons);
    console.log('Daughters Data:', familyData.daughters);
    
    showToast('Form Submitted Successfully!', 'Family information has been saved.');
  } else {
    showToast('Validation Error', validation.errors.join(', '));
  }
}

// Initialize the application
function init() {
  setupFamilyHeadEvents();
  setupSpouseEvents();
  
  // Submit button event
  document.getElementById('submitBtn').addEventListener('click', submitForm);
  
  console.log('Family form initialized');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
