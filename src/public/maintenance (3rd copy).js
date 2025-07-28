document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const maintenanceDropdown = document.getElementById('maintenanceDropdown');
  const menuMaintenance = document.getElementById('menuMaintenance');
  const otherMaintenance = document.getElementById('otherMaintenance');
  const emptyState = document.getElementById('emptyState');
  const maintenanceTitle = document.getElementById('maintenanceTitle');
  const maintenanceContent = document.getElementById('maintenanceContent');
  
  // Menu Maintenance Elements
  const menuItemsTable = document.getElementById('menuItemsTable');
  const addMenuItemBtn = document.getElementById('addMenuItem');
  const menuItemModal = document.getElementById('menuItemModal');
  const menuItemForm = document.getElementById('menuItemForm');
  const cancelMenuItemBtn = document.getElementById('cancelMenuItem');
  const modalTitle = document.getElementById('modalTitle');
  const itemCategorySelect = document.getElementById('itemCategory');

  // Lookup Maintenance Elements
  const lookupModal = document.getElementById('lookupModal');
  const lookupForm = document.getElementById('lookupForm');
  const cancelLookupBtn = document.getElementById('cancelLookup');
  const lookupModalTitle = document.getElementById('lookupModalTitle');

  // User Maintenance Elements
  const userModal = document.getElementById('userModal');
  const userForm = document.getElementById('userForm');
  const cancelUserBtn = document.getElementById('cancelUser');
  const userModalTitle = document.getElementById('userModalTitle');

  // Address Maintenance Elements
  const addressModal = document.getElementById('addressModal');
  const addressForm = document.getElementById('addressForm');
  const cancelAddressBtn = document.getElementById('cancelAddress');
  const addressModalTitle = document.getElementById('addressModalTitle');

  // Recipe Modal Elements
  const recipeModal = document.getElementById('recipeModal');
  const recipeForm = document.getElementById('recipeForm');
  const cancelRecipeBtn = document.getElementById('cancelRecipe');
  const recipeModalTitle = document.getElementById('recipeModalTitle');

  // Ingredient Maintenance Elements
  const ingredientModal = document.getElementById('ingredientModal');
  const ingredientForm = document.getElementById('ingredientForm');
  const cancelIngredientBtn = document.getElementById('cancelIngredient');
  const ingredientModalTitle = document.getElementById('ingredientModalTitle');

  // Vendor Maintenance Elements
  const vendorModal = document.getElementById('vendorModal');
  const vendorForm = document.getElementById('vendorForm');
  const cancelVendorBtn = document.getElementById('cancelVendor');
  const vendorModalTitle = document.getElementById('vendorModalTitle');

  // State
  let menuItems = [];
  let categories = [];
  let maintenanceOptions = [];
  let lookupItems = [];
  let users = [];
  let addresses = [];
  let ingredients = [];
  let vendors = [];

  // Initialize the page
  async function init() {
    await loadMaintenanceOptions();
    await loadCategories();
    setupEventListeners();
    showEmptyState();
  }

  // ======================
  // Core Functions
  // ======================

  function showEmptyState() {
    emptyState.classList.remove('hidden');
    menuMaintenance.classList.add('hidden');
    otherMaintenance.classList.add('hidden');
  }

  async function loadMaintenanceOptions() {
    try {
      const response = await fetch('/api/maintenance-options');
      if (!response.ok) throw new Error('Failed to load options');
      maintenanceOptions = await response.json();
      renderMaintenanceDropdown();
    } catch (err) {
      console.error('Error loading options:', err);
      showToast('Failed to load maintenance options', 'error');
    }
  }

  function renderMaintenanceDropdown() {
    maintenanceDropdown.innerHTML = '<option value="">Select Maintenance</option>';
    maintenanceOptions.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.id;
      opt.textContent = option.display;
      maintenanceDropdown.appendChild(opt);
    });
  }

  // ======================
  // Section Handling
  // ======================

  function showMaintenanceSection(sectionId) {
    // Hide everything first
    emptyState.classList.add('hidden');
    menuMaintenance.classList.add('hidden');
    otherMaintenance.classList.add('hidden');
    
    const selectedOption = maintenanceOptions.find(opt => opt.id == sectionId);
    
    if (selectedOption && selectedOption.display === 'Menu Maintenance') {
      showMenuItemsLoading();
      menuMaintenance.classList.remove('hidden');
      loadMenuItems();
    } 
    else if (selectedOption && selectedOption.display === 'Lookup Maintenance') {
      showLookupLoading();
      otherMaintenance.classList.remove('hidden');
      maintenanceTitle.textContent = 'Lookup Maintenance';
      loadLookupItems();
    }
    else if (selectedOption && selectedOption.display === 'User Maintenance') {
      showUserLoading();
      otherMaintenance.classList.remove('hidden');
      maintenanceTitle.textContent = 'User Maintenance';
      loadUsers();
    }
    else if (selectedOption && selectedOption.display === 'Address Maintenance') {
      showAddressLoading();
      otherMaintenance.classList.remove('hidden');
      maintenanceTitle.textContent = 'Address Maintenance';
      loadAddresses();
    }
    else if (selectedOption && selectedOption.display === 'Ingredients Maintenance') {
      showIngredientLoading();
      otherMaintenance.classList.remove('hidden');
      maintenanceTitle.textContent = 'Ingredients Maintenance';
      loadIngredients();
    }
    else if (selectedOption && selectedOption.display === 'Vendor Maintenance') {
      showVendorLoading();
      otherMaintenance.classList.remove('hidden');
      maintenanceTitle.textContent = 'Vendor Maintenance';
      loadVendors();
    }
    else if (sectionId) {
      showGenericLoading(sectionId);
    } else {
      showEmptyState();
    }
  }

  function showMenuItemsLoading() {
    menuItemsTable.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-4 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p class="mt-2 text-gray-600">Loading menu items...</p>
        </td>
      </tr>`;
  }

  function showLookupLoading() {
    maintenanceContent.innerHTML = `
      <div class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading lookup items...</p>
      </div>`;
  }

  function showUserLoading() {
    maintenanceContent.innerHTML = `
      <div class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading users...</p>
      </div>`;
  }

  function showAddressLoading() {
    maintenanceContent.innerHTML = `
      <div class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading addresses...</p>
      </div>`;
  }

  function showIngredientLoading() {
    maintenanceContent.innerHTML = `
      <div class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading ingredients...</p>
      </div>`;
  }

  function showVendorLoading() {
    maintenanceContent.innerHTML = `
      <div class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading vendors...</p>
      </div>`;
  }

  function showGenericLoading(sectionId) {
    otherMaintenance.classList.remove('hidden');
    maintenanceContent.innerHTML = `
      <div class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading content...</p>
      </div>`;
    
    setTimeout(() => {
      const section = maintenanceOptions.find(opt => opt.id == sectionId);
      maintenanceTitle.textContent = section?.display || 'Maintenance';
      maintenanceContent.innerHTML = `
        <div class="bg-white p-4 rounded shadow">
          <h3 class="text-lg font-semibold mb-2">${section?.display || 'Maintenance'}</h3>
          <p class="text-gray-600">This maintenance section is under development.</p>
        </div>`;
    }, 300);
  }

  // ======================
  // Menu Items Functions
  // ======================

  async function loadMenuItems() {
    try {
      const response = await fetch('/api/menu-maintenance');
      if (!response.ok) throw new Error('Failed to load menu items');
      menuItems = await response.json();
      renderMenuItems();
    } catch (err) {
      console.error('Error loading menu items:', err);
      showMenuItemsError(err.message);
    }
  }

  function renderMenuItems() {
    menuItemsTable.innerHTML = '';
    
    if (menuItems.length === 0) {
      menuItemsTable.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-4 text-center text-gray-500">
            No menu items found
          </td>
        </tr>`;
      return;
    }
    
    menuItems.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.menu_item_id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${safeToFixed(item.price)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.category}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button class="edit-item text-yellow-600 hover:text-yellow-900 mr-3" data-id="${item.menu_item_id}">Edit</button>
          <button class="delete-item text-red-600 hover:text-red-900 mr-3" data-id="${item.menu_item_id}">Delete</button>
          <button class="recipes-item text-blue-600 hover:text-blue-900" data-id="${item.menu_item_id}" data-name="${item.name}">Recipes</button>
        </td>`;
      menuItemsTable.appendChild(row);
    });
  }

  function showMenuItemsError(message) {
    menuItemsTable.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-4 text-center text-red-600">
          Error: ${message}
          <button class="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" 
                  onclick="location.reload()">
            Retry
          </button>
        </td>
      </tr>`;
  }

  async function loadCategories() {
    try {
      const response = await fetch('/api/menu-maintenance/categories');
      if (!response.ok) throw new Error('Failed to load categories');
      categories = await response.json();
      renderCategoryOptions();
    } catch (err) {
      console.error('Error loading categories:', err);
      showToast('Failed to load categories', 'error');
    }
  }

  function renderCategoryOptions() {
    itemCategorySelect.innerHTML = '';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.display;
      itemCategorySelect.appendChild(option);
    });
  }

  // ======================
  // Lookup Items Functions
  // ======================

  async function loadLookupItems() {
    try {
      const response = await fetch('/api/lookup-maintenance');
      if (!response.ok) throw new Error('Failed to load lookup items');
      const data = await response.json();
      lookupItems = Array.isArray(data) ? data : [];
      renderLookupItems(lookupItems);
    } catch (err) {
      console.error('Error loading lookup items:', err);
      showLookupItemsError(err.message);
    }
  }

  function renderLookupItems(items) {
    const safeItems = Array.isArray(items) ? items : [];
    
    maintenanceContent.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Lookup Items</h3>
        <button id="addLookupItem" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Add Lookup Item
        </button>
      </div>
      <div class="bg-white rounded shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody id="lookupItemsTable" class="bg-white divide-y divide-gray-200">
            ${safeItems.length > 0 ? 
              safeItems.map(item => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.id}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.group_id}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.group_name}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.display}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="edit-lookup text-yellow-600 hover:text-yellow-900 mr-3" data-id="${item.id}">Edit</button>
                    <button class="delete-lookup text-red-600 hover:text-red-900" data-id="${item.id}">Delete</button>
                  </td>
                </tr>
              `).join('') : 
              `<tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">No lookup items found</td>
              </tr>`}
          </tbody>
        </table>
      </div>`;
  }

  function showLookupItemsError(message) {
    maintenanceContent.innerHTML = `
      <div class="bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-2">Lookup Table Maintenance</h3>
        <p class="text-red-600">Error: ${message}</p>
        <button class="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" 
                onclick="loadLookupItems()">
          Retry
        </button>
      </div>`;
  }

  // ======================
  // User Maintenance Functions
  // ======================

  async function loadUsers() {
    try {
      const response = await fetch('/api/user-maintenance');
      if (!response.ok) throw new Error('Failed to load users');
      users = await response.json();
      renderUsers();
    } catch (err) {
      console.error('Error loading users:', err);
      showUserError(err.message);
    }
  }

  function renderUsers() {
    maintenanceContent.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Users</h3>
        <button id="addUserBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Add User
        </button>
      </div>
      <div class="bg-white rounded shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody id="usersTable" class="bg-white divide-y divide-gray-200">
            ${users.length > 0 ? 
              users.map(user => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.user_id}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.username}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.role}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="edit-user text-yellow-600 hover:text-yellow-900 mr-3" data-id="${user.user_id}">Edit</button>
                    <button class="delete-user text-red-600 hover:text-red-900" data-id="${user.user_id}">Delete</button>
                  </td>
                </tr>
              `).join('') : 
              `<tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">No users found</td>
              </tr>`}
          </tbody>
        </table>
      </div>`;
  }

  function showUserError(message) {
    maintenanceContent.innerHTML = `
      <div class="bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-2">User Management</h3>
        <p class="text-red-600">Error: ${message}</p>
        <button class="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" 
                onclick="loadUsers()">
          Retry
        </button>
      </div>`;
  }

  // ======================
  // Address Maintenance Functions
  // ======================

  async function loadAddresses() {
    try {
      const response = await fetch('/api/address-maintenance');
      if (!response.ok) throw new Error('Failed to load addresses');
      addresses = await response.json();
      renderAddresses();
    } catch (err) {
      console.error('Error loading addresses:', err);
      showAddressesError(err.message);
    }
  }

  function renderAddresses() {
    maintenanceContent.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Addresses</h3>
        <button id="addAddressBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Add Address
        </button>
      </div>
      <div class="bg-white rounded shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Street</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zip Code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody id="addressesTable" class="bg-white divide-y divide-gray-200">
            ${addresses.length > 0 ? 
              addresses.map(address => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${address.user_id || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${address.street}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${address.city}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${address.state}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${address.zip_code}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${address.country}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${address.is_default ? 'Yes' : 'No'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="edit-address text-yellow-600 hover:text-yellow-900 mr-3" data-id="${address.address_id}">Edit</button>
                    <button class="delete-address text-red-600 hover:text-red-900" data-id="${address.address_id}">Delete</button>
                  </td>
                </tr>
              `).join('') : 
              `<tr>
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">No addresses found</td>
              </tr>`}
          </tbody>
        </table>
      </div>`;
  }

  function showAddressesError(message) {
    maintenanceContent.innerHTML = `
      <div class="bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-2">Address Maintenance</h3>
        <p class="text-red-600">Error: ${message}</p>
        <button class="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" 
                onclick="loadAddresses()">
          Retry
        </button>
      </div>`;
  }

  // ======================
  // Ingredient Maintenance Functions
  // ======================

  async function loadIngredients() {
    try {
      const response = await fetch('/api/ingredients');
      if (!response.ok) throw new Error('Failed to load ingredients');
      ingredients = await response.json();
      renderIngredients();
    } catch (err) {
      console.error('Error loading ingredients:', err);
      showIngredientsError(err.message);
    }
  }

  function renderIngredients() {
    maintenanceContent.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Ingredients</h3>
        <button id="addIngredientBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Add Ingredient
        </button>
      </div>
      <div class="bg-white rounded shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody id="ingredientsTable" class="bg-white divide-y divide-gray-200">
            ${ingredients.length > 0 ? 
              ingredients.map(ing => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ing.ingredient_id}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ing.name}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ing.unit}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${safeToFixed(ing.cost_per_unit)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="edit-ingredient text-yellow-600 hover:text-yellow-900 mr-3" data-id="${ing.ingredient_id}">Edit</button>
                    <button class="delete-ingredient text-red-600 hover:text-red-900" data-id="${ing.ingredient_id}">Delete</button>
                  </td>
                </tr>
              `).join('') : 
              `<tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">No ingredients found</td>
              </tr>`}
          </tbody>
        </table>
      </div>`;
  }

  function showIngredientsError(message) {
    maintenanceContent.innerHTML = `
      <div class="bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-2">Ingredient Maintenance</h3>
        <p class="text-red-600">Error: ${message}</p>
        <button class="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" 
                onclick="loadIngredients()">
          Retry
        </button>
      </div>`;
  }

  // ======================
  // Vendor Maintenance Functions
  // ======================

  async function loadVendors() {
    try {
      const response = await fetch('/api/vendor-maintenance');
      if (!response.ok) throw new Error('Failed to load vendors');
      vendors = await response.json();
      renderVendors();
    } catch (err) {
      console.error('Error loading vendors:', err);
      showVendorsError(err.message);
    }
  }

  function renderVendors() {
    maintenanceContent.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Vendors</h3>
        <button id="addVendorBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Add Vendor
        </button>
      </div>
      <div class="bg-white rounded shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody id="vendorsTable" class="bg-white divide-y divide-gray-200">
            ${vendors.length > 0 ? 
              vendors.map(vendor => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vendor.vendor_id}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vendor.vendor_name}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vendor.contact_person || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vendor.email}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vendor.phone || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${[vendor.address_line1, vendor.address_line2, vendor.city, vendor.state_province, vendor.postal_code, vendor.country].filter(Boolean).join(', ') || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vendor.is_active ? 'Yes' : 'No'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vendor.rating || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="edit-vendor text-yellow-600 hover:text-yellow-900 mr-3" data-id="${vendor.vendor_id}">Edit</button>
                    <button class="delete-vendor text-red-600 hover:text-red-900" data-id="${vendor.vendor_id}">Delete</button>
                  </td>
                </tr>
              `).join('') : 
              `<tr>
                <td colspan="9" class="px-6 py-4 text-center text-gray-500">No vendors found</td>
              </tr>`}
          </tbody>
        </table>
      </div>`;
  }

  function showVendorsError(message) {
    maintenanceContent.innerHTML = `
      <div class="bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-2">Vendor Maintenance</h3>
        <p class="text-red-600">Error: ${message}</p>
        <button class="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" 
                onclick="loadVendors()">
          Retry
        </button>
      </div>`;
  }

  function showVendorModal(vendor = null) {
    if (vendor) {
      vendorModalTitle.textContent = 'Edit Vendor';
      document.getElementById('vendorId').value = vendor.vendor_id;
      document.getElementById('vendorName').value = vendor.vendor_name || '';
      document.getElementById('vendorContactPerson').value = vendor.contact_person || '';
      document.getElementById('vendorEmail').value = vendor.email || '';
      document.getElementById('vendorPhone').value = vendor.phone || '';
      document.getElementById('vendorAlternatePhone').value = vendor.alternate_phone || '';
      document.getElementById('vendorWebsite').value = vendor.website || '';
      document.getElementById('vendorAddressLine1').value = vendor.address_line1 || '';
      document.getElementById('vendorAddressLine2').value = vendor.address_line2 || '';
      document.getElementById('vendorCity').value = vendor.city || '';
      document.getElementById('vendorStateProvince').value = vendor.state_province || '';
      document.getElementById('vendorPostalCode').value = vendor.postal_code || '';
      document.getElementById('vendorCountry').value = vendor.country || '';
      document.getElementById('vendorTaxId').value = vendor.tax_id || '';
      document.getElementById('vendorBusinessRegNumber').value = vendor.business_registration_number || '';
      document.getElementById('vendorSince').value = vendor.vendor_since ? vendor.vendor_since.split('T')[0] : '';
      document.getElementById('vendorCategory').value = vendor.vendor_category || '';
      document.getElementById('vendorPaymentTerms').value = vendor.payment_terms || '';
      document.getElementById('vendorPaymentMethod').value = vendor.preferred_payment_method || '';
      document.getElementById('vendorCurrency').value = vendor.currency_preference || '';
      document.getElementById('vendorCreditLimit').value = vendor.credit_limit || '';
      document.getElementById('vendorIsActive').checked = vendor.is_active !== false;
      document.getElementById('vendorRating').value = vendor.rating || '';
      document.getElementById('vendorNotes').value = vendor.notes || '';
    } else {
      vendorModalTitle.textContent = 'Add Vendor';
      vendorForm.reset();
      document.getElementById('vendorId').value = '';
      document.getElementById('vendorIsActive').checked = true;
    }
    vendorModal.classList.remove('hidden');
  }

  async function handleVendorSubmit(e) {
    e.preventDefault();
    
    const formData = {
      vendor_name: document.getElementById('vendorName').value,
      contact_person: document.getElementById('vendorContactPerson').value || null,
      email: document.getElementById('vendorEmail').value,
      phone: document.getElementById('vendorPhone').value || null,
      alternate_phone: document.getElementById('vendorAlternatePhone').value || null,
      website: document.getElementById('vendorWebsite').value || null,
      address_line1: document.getElementById('vendorAddressLine1').value || null,
      address_line2: document.getElementById('vendorAddressLine2').value || null,
      city: document.getElementById('vendorCity').value || null,
      state_province: document.getElementById('vendorStateProvince').value || null,
      postal_code: document.getElementById('vendorPostalCode').value || null,
      country: document.getElementById('vendorCountry').value || null,
      tax_id: document.getElementById('vendorTaxId').value || null,
      business_registration_number: document.getElementById('vendorBusinessRegNumber').value || null,
      vendor_since: document.getElementById('vendorSince').value || null,
      vendor_category: document.getElementById('vendorCategory').value || null,
      payment_terms: document.getElementById('vendorPaymentTerms').value || null,
      preferred_payment_method: document.getElementById('vendorPaymentMethod').value || null,
      currency_preference: document.getElementById('vendorCurrency').value || null,
      credit_limit: parseFloat(document.getElementById('vendorCreditLimit').value) || null,
      is_active: document.getElementById('vendorIsActive').checked,
      rating: document.getElementById('vendorRating').value || null,
      notes: document.getElementById('vendorNotes').value || null
    };

    if (!formData.vendor_name || !formData.email) {
      showToast('Please fill in all required fields (Vendor Name, Email)', 'error');
      return;
    }

    const vendorId = document.getElementById('vendorId').value;
    const isEdit = !!vendorId;

    try {
      const response = await fetch(isEdit ? `/api/vendor-maintenance/${vendorId}` : '/api/vendor-maintenance', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save vendor');
      }

      showToast(`Vendor ${isEdit ? 'updated' : 'added'} successfully`, 'success');
      vendorModal.classList.add('hidden');
      await loadVendors();
    } catch (err) {
      console.error('Error saving vendor:', err);
      showToast(err.message || 'Failed to save vendor', 'error');
    }
  }

  async function deleteVendor(id) {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      const response = await fetch(`/api/vendor-maintenance/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete vendor');
      }

      showToast('Vendor deleted successfully', 'success');
      await loadVendors();
    } catch (err) {
      console.error('Error deleting vendor:', err);
      showToast(err.message || 'Failed to delete vendor', 'error');
    }
  }

  // ======================
  // Modal Functions
  // ======================

  function showMenuItemModal(item = null) {
    if (item) {
      modalTitle.textContent = 'Edit Menu Item';
      document.getElementById('menuItemId').value = item.menu_item_id;
      document.getElementById('itemName').value = item.name;
      document.getElementById('itemPrice').value = item.price;
      document.getElementById('itemCategory').value = item.category_id;
      document.getElementById('itemImage').value = item.image || '';
    } else {
      modalTitle.textContent = 'Add Menu Item';
      menuItemForm.reset();
      document.getElementById('menuItemId').value = '';
    }
    menuItemModal.classList.remove('hidden');
  }

  function showLookupModal(item = null) {
    if (item) {
      lookupModalTitle.textContent = 'Edit Lookup Item';
      document.getElementById('lookupId').value = item.id;
      document.getElementById('lookupGroupId').value = item.group_id;
      document.getElementById('lookupGroupName').value = item.group_name;
      document.getElementById('lookupDisplay').value = item.display;
    } else {
      lookupModalTitle.textContent = 'Add Lookup Item';
      lookupForm.reset();
      document.getElementById('lookupId').value = '';
    }
    lookupModal.classList.remove('hidden');
  }

  function showUserModal(user = null) {
    if (user) {
      userModalTitle.textContent = 'Edit User';
      document.getElementById('userId').value = user.user_id;
      document.getElementById('username').value = user.username;
      document.getElementById('email').value = user.email;
      document.getElementById('role').value = user.role;
    } else {
      userModalTitle.textContent = 'Add User';
      userForm.reset();
      document.getElementById('userId').value = '';
    }
    userModal.classList.remove('hidden');
  }

  function showIngredientModal(ingredient = null) {
    if (ingredient) {
      ingredientModalTitle.textContent = 'Edit Ingredient';
      document.getElementById('ingredientId').value = ingredient.ingredient_id;
      document.getElementById('ingredientName').value = ingredient.name;
      document.getElementById('ingredientUnit').value = ingredient.unit;
      document.getElementById('ingredientCost').value = ingredient.cost_per_unit || '';
      document.getElementById('ingredientDescription').value = ingredient.description || '';
    } else {
      ingredientModalTitle.textContent = 'Add Ingredient';
      ingredientForm.reset();
      document.getElementById('ingredientId').value = '';
    }
    ingredientModal.classList.remove('hidden');
  }

  // Recipes Modal
  async function openRecipeModal(menuItemId, menuItemName) {
    const modal = document.getElementById('recipeModal');
    const recipeList = document.getElementById('recipeList');
    const ingredientSelect = document.getElementById('ingredientSelect');
    document.getElementById('recipeModalTitle').textContent = `Recipes for ${menuItemName}`;
    document.getElementById('recipeMenuItemId').value = menuItemId;

    // Load ingredients for dropdown
    try {
      const response = await fetch('/api/recipes/ingredients');
      if (!response.ok) throw new Error(`Failed to fetch ingredients: ${response.status} ${response.statusText}`);
      const ingredients = await response.json();
      ingredientSelect.innerHTML = '<option value="">Select Ingredient</option>';
      ingredients.forEach(ing => {
        const option = document.createElement('option');
        option.value = ing.ingredient_id;
        option.textContent = `${ing.name} (${ing.unit})`;
        ingredientSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading ingredients:', error);
      showToast('Failed to load ingredients', 'error');
      ingredientSelect.innerHTML = '<option value="">Error loading ingredients</option>';
    }

    // Load recipes
    try {
      const response = await fetch(`/api/recipes?menu_item_id=${menuItemId}`);
      if (!response.ok) throw new Error(`Failed to fetch recipes: ${response.status} ${response.statusText}`);
      const recipes = await response.json();
      recipeList.innerHTML = '';
      recipes.forEach(recipe => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${recipe.ingredient_name}: ${recipe.quantity} ${recipe.unit}
          <button class="edit-recipe bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 ml-2" data-menu-id="${menuItemId}" data-ingredient-id="${recipe.ingredient_id}" data-quantity="${recipe.quantity}" data-unit="${recipe.unit}">Edit</button>
          <button class="delete-recipe bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2" data-menu-id="${menuItemId}" data-ingredient-id="${recipe.ingredient_id}">Delete</button>
        `;
        recipeList.appendChild(li);
      });
    } catch (error) {
      console.error('Error loading recipes:', error);
      showToast('Failed to load recipes', 'error');
      recipeList.innerHTML = '<li>Error loading recipes</li>';
    }

    modal.classList.remove('hidden');
  }

  async function addRecipe() {
    const menuItemId = document.getElementById('recipeMenuItemId').value;
    const ingredientId = document.getElementById('ingredientSelect').value;
    const quantity = document.getElementById('recipeQuantity').value;
    const unit = document.getElementById('recipeUnit').value;
    if (!ingredientId || !quantity || !unit) {
      showToast('Please fill all fields', 'error');
      return;
    }
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu_item_id: menuItemId, ingredient_id: ingredientId, quantity, unit })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add recipe');
      }
      showToast('Recipe added successfully', 'success');
      openRecipeModal(menuItemId, document.getElementById('recipeModalTitle').textContent.replace('Recipes for ', ''));
    } catch (error) {
      console.error('Error adding recipe:', error);
      showToast('Failed to add recipe', 'error');
    }
  }

  async function editRecipe(menuItemId, ingredientId, currentQuantity, currentUnit) {
    const quantity = prompt('Enter new quantity:', currentQuantity);
    const unit = prompt('Enter new unit:', currentUnit);
    if (!quantity || !unit) {
      showToast('Quantity and unit are required', 'error');
      return;
    }
    try {
      const response = await fetch(`/api/recipes/${menuItemId}/${ingredientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, unit })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update recipe');
      }
      showToast('Recipe updated successfully', 'success');
      openRecipeModal(menuItemId, document.getElementById('recipeModalTitle').textContent.replace('Recipes for ', ''));
    } catch (error) {
      console.error('Error updating recipe:', error);
      showToast('Failed to update recipe', 'error');
    }
  }

  async function deleteRecipe(menuItemId, ingredientId) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    try {
      const response = await fetch(`/api/recipes/${menuItemId}/${ingredientId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete recipe');
      }
      showToast('Recipe deleted successfully', 'success');
      openRecipeModal(menuItemId, document.getElementById('recipeModalTitle').textContent.replace('Recipes for ', ''));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      showToast('Failed to delete recipe', 'error');
    }
  }

  // ======================
  // Form Handlers
  // ======================

  async function handleMenuItemSubmit(e) {
    e.preventDefault();
    
    const price = parseFloat(document.getElementById('itemPrice').value);
    if (isNaN(price)) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    const formData = {
      name: document.getElementById('itemName').value,
      price: price,
      category_id: document.getElementById('itemCategory').value,
      image: document.getElementById('itemImage').value
    };
    
    const itemId = document.getElementById('menuItemId').value;
    const isEdit = !!itemId;

    try {
      const response = await fetch(isEdit ? `/api/menu-maintenance/${itemId}` : '/api/menu-maintenance', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save menu item');
      }

      showToast(`Menu item ${isEdit ? 'updated' : 'added'} successfully`, 'success');
      menuItemModal.classList.add('hidden');
      await loadMenuItems();
    } catch (err) {
      console.error('Error saving menu item:', err);
      showToast(err.message || 'Failed to save menu item', 'error');
    }
  }

  async function handleLookupSubmit(e) {
    e.preventDefault();
    
    const groupId = parseInt(document.getElementById('lookupGroupId').value);
    if (isNaN(groupId)) {
      showToast('Please enter a valid group ID', 'error');
      return;
    }

    const formData = {
      group_id: groupId,
      group_name: document.getElementById('lookupGroupName').value,
      display: document.getElementById('lookupDisplay').value
    };
    
    const itemId = document.getElementById('lookupId').value;
    const isEdit = !!itemId;

    try {
      const response = await fetch(isEdit ? `/api/lookup-maintenance/${itemId}` : '/api/lookup-maintenance', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save lookup item');
      }

      showToast(`Lookup item ${isEdit ? 'updated' : 'added'} successfully`, 'success');
      lookupModal.classList.add('hidden');
      await loadLookupItems();
    } catch (err) {
      console.error('Error saving lookup item:', err);
      showToast(err.message || 'Failed to save lookup item', 'error');
    }
  }

  async function handleUserSubmit(e) {
    e.preventDefault();
    
    const formData = {
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      role: document.getElementById('role').value
    };
    
    const userId = document.getElementById('userId').value;
    const isEdit = !!userId;

    try {
      const response = await fetch(isEdit ? `/api/user-maintenance/${userId}` : '/api/user-maintenance', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save user');
      }

      showToast(`User ${isEdit ? 'updated' : 'added'} successfully`, 'success');
      userModal.classList.add('hidden');
      await loadUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      showToast(err.message || 'Failed to save user', 'error');
    }
  }

  async function handleIngredientSubmit(e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('ingredientName').value,
      unit: document.getElementById('ingredientUnit').value,
      cost_per_unit: parseFloat(document.getElementById('ingredientCost').value) || null,
      description: document.getElementById('ingredientDescription').value || null
    };

    if (!formData.name || !formData.unit) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const ingredientId = document.getElementById('ingredientId').value;
    const isEdit = !!ingredientId;

    try {
      const response = await fetch(isEdit ? `/api/ingredients/${ingredientId}` : '/api/ingredients', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save ingredient');
      }

      showToast(`Ingredient ${isEdit ? 'updated' : 'added'} successfully`, 'success');
      ingredientModal.classList.add('hidden');
      await loadIngredients();
    } catch (err) {
      console.error('Error saving ingredient:', err);
      showToast(err.message || 'Failed to save ingredient', 'error');
    }
  }

  async function handleAddressSubmit(e) {
    e.preventDefault();
    
    const formData = {
      user_id: document.getElementById('addressUserId').value || null,
      street: document.getElementById('street').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zip_code: document.getElementById('zipCode').value,
      country: document.getElementById('country').value,
      is_default: document.getElementById('isDefault').checked
    };

    if (!formData.street || !formData.city || !formData.state || !formData.zip_code || !formData.country) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const addressId = document.getElementById('addressId').value;
    const isEdit = !!addressId;

    try {
      const response = await fetch(isEdit ? `/api/address-maintenance/${addressId}` : '/api/address-maintenance', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save address');
      }

      showToast(`Address ${isEdit ? 'updated' : 'added'} successfully`, 'success');
      addressModal.classList.add('hidden');
      await loadAddresses();
    } catch (err) {
      console.error('Error saving address:', err);
      showToast(err.message || 'Failed to save address', 'error');
    }
  }

  // ======================
  // Delete Functions
  // ======================

  async function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      const response = await fetch(`/api/menu-maintenance/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete menu item');
      }

      showToast('Menu item deleted successfully', 'success');
      await loadMenuItems();
    } catch (err) {
      console.error('Error deleting menu item:', err);
      showToast(err.message || 'Failed to delete menu item', 'error');
    }
  }

  async function deleteLookupItem(id) {
    if (!confirm('Are you sure you want to delete this lookup item?')) return;
    
    try {
      const response = await fetch(`/api/lookup-maintenance/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete lookup item');
      }

      showToast('Lookup item deleted successfully', 'success');
      await loadLookupItems();
    } catch (err) {
      console.error('Error deleting lookup item:', err);
      showToast(err.message || 'Failed to delete lookup item', 'error');
    }
  }

  async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/user-maintenance/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      showToast('User deleted successfully', 'success');
      await loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      showToast(err.message || 'Failed to delete user', 'error');
    }
  }

  async function deleteIngredient(id) {
    if (!confirm('Are you sure you want to delete this ingredient?')) return;
    
    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete ingredient');
      }

      showToast('Ingredient deleted successfully', 'success');
      await loadIngredients();
    } catch (err) {
      console.error('Error deleting ingredient:', err);
      showToast(err.message || 'Failed to delete ingredient', 'error');
    }
  }

  // ======================
  // Utility Functions
  // ======================

  function safeToFixed(value, decimals = 2) {
    if (value === null || value === undefined) return '0.00';
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  }

  function showToast(message, type = 'info') {
    const colors = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      error: 'bg-red-500'
    };
    
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg flex items-center`;
    toast.innerHTML = `
      <span>${message}</span>
      <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.remove()">
        &times;
      </button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  // ======================
  // Event Listeners
  // ======================

  function setupEventListeners() {
    // Dropdown change
    maintenanceDropdown.addEventListener('change', (e) => {
      showMaintenanceSection(e.target.value);
    });

    // Menu items - Add new
    addMenuItemBtn.addEventListener('click', () => showMenuItemModal());

    // Menu items - Edit/Delete
    menuItemsTable.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-item')) {
        const id = parseInt(e.target.dataset.id);
        const item = menuItems.find(i => i.menu_item_id === id);
        if (item) showMenuItemModal(item);
      }
      if (e.target.classList.contains('delete-item')) {
        const id = parseInt(e.target.dataset.id);
        deleteMenuItem(id);
      }
      if (e.target.classList.contains('recipes-item')) {
        const id = parseInt(e.target.dataset.id);
        const name = e.target.dataset.name;
        openRecipeModal(id, name);
      }
    });

    // Menu item form
    menuItemForm.addEventListener('submit', handleMenuItemSubmit);
    cancelMenuItemBtn.addEventListener('click', () => {
      menuItemModal.classList.add('hidden');
    });

    // Lookup form
    lookupForm.addEventListener('submit', handleLookupSubmit);
    cancelLookupBtn.addEventListener('click', () => {
      lookupModal.classList.add('hidden');
    });

    // User form
    userForm.addEventListener('submit', handleUserSubmit);
    cancelUserBtn.addEventListener('click', () => {
      userModal.classList.add('hidden');
    });

    // Address form
    addressForm.addEventListener('submit', handleAddressSubmit);
    cancelAddressBtn.addEventListener('click', () => {
      addressModal.classList.add('hidden');
    });

    // Ingredient form
    ingredientForm.addEventListener('submit', handleIngredientSubmit);
    cancelIngredientBtn.addEventListener('click', () => {
      ingredientModal.classList.add('hidden');
    });

    // Vendor form
    vendorForm.addEventListener('submit', handleVendorSubmit);
    cancelVendorBtn.addEventListener('click', () => {
      vendorModal.classList.add('hidden');
    });

    // Recipe form
    recipeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addRecipe();
    });
    cancelRecipeBtn.addEventListener('click', () => {
      recipeModal.classList.add('hidden');
    });

    // Use event delegation for dynamically created elements
    document.addEventListener('click', (e) => {
      // Lookup items
      if (e.target.id === 'addLookupItem') {
        showLookupModal();
      }
      if (e.target.classList.contains('edit-lookup')) {
        const id = parseInt(e.target.dataset.id);
        const item = lookupItems.find(i => i.id === id);
        if (item) showLookupModal(item);
      }
      if (e.target.classList.contains('delete-lookup')) {
        const id = parseInt(e.target.dataset.id);
        deleteLookupItem(id);
      }

      // Users
      if (e.target.id === 'addUserBtn') {
        showUserModal();
      }
      if (e.target.classList.contains('edit-user')) {
        const id = parseInt(e.target.dataset.id);
        const user = users.find(u => u.user_id === id);
        if (user) showUserModal(user);
      }
      if (e.target.classList.contains('delete-user')) {
        const id = parseInt(e.target.dataset.id);
        deleteUser(id);
      }

      // Addresses
      if (e.target.id === 'addAddressBtn') {
        showAddressModal();
      }
      if (e.target.classList.contains('edit-address')) {
        const id = parseInt(e.target.dataset.id);
        const address = addresses.find(a => a.address_id === id);
        if (address) showAddressModal(address);
      }
      if (e.target.classList.contains('delete-address')) {
        const id = parseInt(e.target.dataset.id);
        deleteAddress(id);
      }

      // Ingredients
      if (e.target.id === 'addIngredientBtn') {
        showIngredientModal();
      }
      if (e.target.classList.contains('edit-ingredient')) {
        const id = parseInt(e.target.dataset.id);
        const ingredient = ingredients.find(i => i.ingredient_id === id);
        if (ingredient) showIngredientModal(ingredient);
      }
      if (e.target.classList.contains('delete-ingredient')) {
        const id = parseInt(e.target.dataset.id);
        deleteIngredient(id);
      }

      // Vendors
      if (e.target.id === 'addVendorBtn') {
        showVendorModal();
      }
      if (e.target.classList.contains('edit-vendor')) {
        const id = parseInt(e.target.dataset.id);
        const vendor = vendors.find(v => v.vendor_id === id);
        if (vendor) showVendorModal(vendor);
      }
      if (e.target.classList.contains('delete-vendor')) {
        const id = parseInt(e.target.dataset.id);
        deleteVendor(id);
      }

      // Recipes
      if (e.target.classList.contains('edit-recipe')) {
        const menuId = parseInt(e.target.dataset.menuId);
        const ingredientId = parseInt(e.target.dataset.ingredientId);
        const quantity = parseFloat(e.target.dataset.quantity);
        const unit = e.target.dataset.unit;
        editRecipe(menuId, ingredientId, quantity, unit);
      }
      if (e.target.classList.contains('delete-recipe')) {
        const menuId = parseInt(e.target.dataset.menuId);
        const ingredientId = parseInt(e.target.dataset.ingredientId);
        deleteRecipe(menuId, ingredientId);
      }
    });
  }

  // Initialize
  init();
});
