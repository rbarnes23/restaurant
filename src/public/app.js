document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, initializing page');
  const path = window.location.pathname;
  if (path === '/') {
    console.log('Initializing menu page');
    initMenuPage();
  } else if (path === '/orders') {
    console.log('Initializing orders page');
    initOrdersPage();
  } else if (path === '/menu-maintenance') {
    console.log('Initializing menu maintenance page');
    initMenuMaintenancePage();
  } else {
    console.log('Unknown path:', path);
  }
});

// --- Menu Page Functions ---
async function initMenuPage() {
  console.log('Starting initMenuPage');
  const categoryFilter = document.getElementById('categoryFilter');
  const menuItemsDiv = document.getElementById('menuItems');
  const cartItemsDiv = document.getElementById('cartItems');
  const cartTotalSpan = document.getElementById('cartTotal');
  const clearCartBtn = document.getElementById('clearCart');
  const checkoutBtn = document.getElementById('checkout');
  const addressModal = document.getElementById('addressModal');
  const addressSelect = document.getElementById('addressSelect');
  const confirmAddressBtn = document.getElementById('confirmAddress');
  const closeModalBtn = document.getElementById('closeModal');
  const addNewAddressBtn = document.getElementById('addNewAddressBtn');
  const newAddressForm = document.getElementById('newAddressForm');
  const cancelNewAddressBtn = document.getElementById('cancelNewAddress');
  const saveNewAddressBtn = document.getElementById('saveNewAddress');

  if (!menuItemsDiv) {
    console.error('menuItemsDiv not found');
    showToast('Failed to initialize menu page');
    return;
  }

  let cart = [];
  let transactionId = null;

  // --- Helper Functions ---
  function showToast(message) {
    console.log('Showing toast:', message);
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // --- Menu Functions ---
  async function loadCategories() {
    try {
      console.log('Fetching menu categories');
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      const categories = await response.json();
      
      categoryFilter.innerHTML = '<option value="">All</option>';
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.display;
        categoryFilter.appendChild(option);
      });
    } catch (err) {
      console.error('Error loading categories:', err);
      showToast('Failed to load menu categories');
    }
  }

  async function loadMenuItems(categoryId = '') {
    try {
      console.log('Fetching menu items, category:', categoryId);
      let url = '/api/menu-items';
      if (categoryId) {
        url += `?category_id=${categoryId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch menu items: ${response.status} ${response.statusText}`);
      const items = await response.json();
      
      menuItemsDiv.innerHTML = '';
      items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'bg-white p-4 rounded shadow flex items-center';
        itemCard.innerHTML = `
          <div class="flex-1">
            <h3 class="text-lg font-semibold">${item.name}</h3>
            <p class="text-gray-500">${item.category}</p>
            <p class="mt-2">$${parseFloat(item.price).toFixed(2)}</p>
            <button class="add-to-cart mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" data-id="${item.menu_item_id}">Add to Cart</button>
          </div>
          ${item.image ? `<img src="/images/${item.image}" alt="${item.name}" class="menu-item-image ml-4">` : '<div class="ml-4 w-24 h-24 bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>'}
        `;
        menuItemsDiv.appendChild(itemCard);
      });
    } catch (err) {
      console.error('Error loading menu items:', err);
      showToast('Failed to load menu items');
    }
  }

  // --- Cart Functions ---
  function updateCart() {
    console.log('Updating cart');
    cartItemsDiv.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
      const itemTotal = item.price * (item.quantity || 0); // Fix for undefined quantity
      total += itemTotal;
      const div = document.createElement('div');
      div.className = 'flex justify-between items-center mb-2';
      div.innerHTML = `
        <span>${item.name || 'Unknown Item'} ($${item.price.toFixed(2)} x ${item.quantity || 0})</span>
        <div>
          <button class="decrement bg-gray-300 px-2 py-1 rounded" data-index="${index}">-</button>
          <button class="increment bg-gray-300 px-2 py-1 rounded" data-index="${index}">+</button>
          <button class="remove bg-red-500 text-white px-2 py-1 rounded" data-index="${index}">Remove</button>
        </div>
      `;
      cartItemsDiv.appendChild(div);
    });
    cartTotalSpan.textContent = total.toFixed(2);
    clearCartBtn.disabled = cart.length === 0;
    checkoutBtn.disabled = cart.length === 0 || !transactionId;

    // Update transaction total_amount in the backend
    if (transactionId) {
      fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_amount: total })
      }).catch(err => {
        console.error('Error updating transaction total:', err);
        showToast('Failed to update cart total');
      });
    }
  }

  async function addToCart(menuItemId) {
    try {
      console.log('Adding to cart, menuItemId:', menuItemId);
      if (!transactionId) {
        try {
          await createTransaction();
          if (!transactionId) {
            throw new Error("Transaction ID not available after creation attempt");
          }
        } catch (transactionError) {
          console.error("Transaction creation failed:", transactionError);
          showToast('Failed to create transaction');
          return;
        }
      }
      const response = await fetch(`/api/menu-items/${menuItemId}`);
      if (!response.ok) throw new Error(`Failed to fetch menu item: ${response.status} ${response.statusText}`);
      const item = await response.json();
      const existingItem = cart.find(i => i.menu_item_id === item.menu_item_id);
      if (existingItem) {
        existingItem.quantity += 1;
        await fetch(`/api/cart-items/${existingItem.cart_item_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: existingItem.quantity })
        });
      } else {
        const response = await fetch('/api/cart-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ menu_item_id: item.menu_item_id, quantity: 1, transaction_id: transactionId })
        });
        const cartItem = await response.json();
        cart.push({
          ...cartItem,
          price: parseFloat(item.price),
          name: item.name,
          quantity: cartItem.quantity
        });
      }
      updateCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
      showToast('Failed to add to cart');
    }
  }

  async function updateCartItem(index, delta) {
    console.log('Updating cart item, index:', index, 'delta:', delta);
    const item = cart[index];
    item.quantity = (item.quantity || 0) + delta; // Fix for undefined quantity
    if (item.quantity <= 0) {
      await removeCartItem(index);
    } else {
      try {
        const response = await fetch(`/api/cart-items/${item.cart_item_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: item.quantity })
        });
        if (!response.ok) throw new Error(`Failed to update cart item: ${response.status} ${response.statusText}`);
        updateCart();
      } catch (err) {
        console.error('Error updating cart item:', err);
        showToast('Failed to update cart');
      }
    }
  }

  async function removeCartItem(index) {
    console.log('Removing cart item at index:', index);
    const item = cart[index];
    cart.splice(index, 1);
    try {
      const response = await fetch(`/api/cart-items/${item.cart_item_id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to remove cart item: ${response.status} ${response.statusText}`);
      updateCart();
    } catch (err) {
      console.error('Error removing cart item:', err);
      showToast('Failed to remove from cart');
    }
  }

  async function clearCart() {
    console.log('Clearing cart');
    if (transactionId) {
      try {
        const response = await fetch(`/api/cart-items?transaction_id=${transactionId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Failed to clear cart: ${response.status} ${response.statusText}`);
        cart = [];
        updateCart();
        transactionId = null;
        showToast('Cart cleared');
      } catch (err) {
        console.error('Error clearing cart:', err);
        showToast('Failed to clear cart');
      }
    } else {
      cart = [];
      updateCart();
      showToast('Cart cleared');
    }
  }

  // --- Transaction Functions ---
  async function createTransaction() {
    try {
      console.log('Creating transaction');
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_amount: 0, status_id: 7 }) // Pending
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create transaction: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      if (!data || !data.transaction_id) {
        throw new Error('Transaction creation failed: No transaction ID received');
      }
      transactionId = data.transaction_id;
      console.log('Transaction created:', transactionId);
    } catch (err) {
      console.error('Error creating transaction:', err);
      showToast('Failed to create transaction');
      throw err;
    }
  }

  // --- Address Functions ---
  async function loadAddresses() {
    try {
      console.log('Fetching addresses');
      const response = await fetch('/api/addresses');
      if (!response.ok) throw new Error(`Failed to fetch addresses: ${response.status} ${response.statusText}`);
      const addresses = await response.json();
      addressSelect.innerHTML = '<option value="">Select an address</option>';
      addresses.forEach(addr => {
        const option = document.createElement('option');
        option.value = addr.address_id;
        option.textContent = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip_code}, ${addr.country}${addr.is_default ? ' (Default)' : ''}`;
        addressSelect.appendChild(option);
      });
      confirmAddressBtn.disabled = !addressSelect.value;
    } catch (err) {
      console.error('Error loading addresses:', err);
      showToast('Failed to load addresses');
    }
  }

  async function attachAddress() {
    const addressId = addressSelect.value;
    
    if (!addressId) {
      showToast('Please select a delivery address');
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address_id: addressId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to attach address');
      }

      showToast('Address attached successfully!');
      addressModal.classList.add('hidden');
      
    } catch (err) {
      console.error('Address attachment error:', err);
      showToast(err.message || 'Failed to attach address');
    }
  }

  // --- Event Listeners ---
  categoryFilter.addEventListener('change', (e) => {
    loadMenuItems(e.target.value);
  });

  menuItemsDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      const menuItemId = e.target.dataset.id;
      addToCart(menuItemId);
    }
  });

  cartItemsDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('increment')) {
      const index = e.target.dataset.index;
      updateCartItem(index, 1);
    } else if (e.target.classList.contains('decrement')) {
      const index = e.target.dataset.index;
      updateCartItem(index, -1);
    } else if (e.target.classList.contains('remove')) {
      const index = e.target.dataset.index;
      removeCartItem(index);
    }
  });

  clearCartBtn.addEventListener('click', clearCart);

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return;
    }
    addressModal.classList.remove('hidden');
    loadAddresses();
  });

  confirmAddressBtn.addEventListener('click', attachAddress);

  closeModalBtn.addEventListener('click', () => {
    addressModal.classList.add('hidden');
  });

  addressSelect.addEventListener('change', () => {
    confirmAddressBtn.disabled = !addressSelect.value;
  });

  addNewAddressBtn.addEventListener('click', () => {
    document.getElementById('addressSelect').disabled = true;
    newAddressForm.classList.remove('hidden');
    document.getElementById('confirmAddress').disabled = true;
  });

  cancelNewAddressBtn.addEventListener('click', () => {
    document.getElementById('addressSelect').disabled = false;
    newAddressForm.classList.add('hidden');
    document.getElementById('confirmAddress').disabled = 
      document.getElementById('addressSelect').value === '';
  });

  saveNewAddressBtn.addEventListener('click', async () => {
    const newAddress = {
      street: document.getElementById('newStreet').value,
      city: document.getElementById('newCity').value,
      state: document.getElementById('newState').value,
      zip_code: document.getElementById('newZipCode').value,
      country: document.getElementById('newCountry').value,
      is_default: document.getElementById('newIsDefault').checked
    };

    // Basic validation
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip_code || !newAddress.country) {
      alert('Please fill in all address fields');
      return;
    }

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAddress)
      });

      if (!response.ok) {
        throw new Error('Failed to save address');
      }

      const savedAddress = await response.json();
      
      // Add the new address to the dropdown
      const option = document.createElement('option');
      option.value = savedAddress.address_id;
      option.textContent = `${savedAddress.street}, ${savedAddress.city}, ${savedAddress.state}`;
      option.selected = true;
      document.getElementById('addressSelect').appendChild(option);
      
      // Reset form
      newAddressForm.classList.add('hidden');
      document.getElementById('addressSelect').disabled = false;
      document.getElementById('confirmAddress').disabled = false;
      document.getElementById('newAddressForm').reset();
      
      // If this is set as default, reload addresses to update the list
      if (newAddress.is_default) {
        loadAddresses();
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  });

  // --- Initialization ---
  async function initializePage() {
    await loadCategories();
    await loadMenuItems();
    updateCart();
  }

  initializePage();
}

// --- Orders Page Functions ---
async function initOrdersPage() {
  console.log('Starting initOrdersPage');
  const ordersList = document.getElementById('ordersList');
  const statusFilter = document.getElementById('statusFilter');

  if (!ordersList || !statusFilter) {
    console.error('ordersList or statusFilter not found');
    showToast('Failed to initialize orders page');
    return;
  }

  let cachedStatuses = null;

  async function loadStatuses() {
    if (cachedStatuses) {
      console.log('Using cached statuses:', cachedStatuses);
      return cachedStatuses;
    }
    try {
      console.log('Fetching order statuses from /api/statuses');
      const response = await fetch('/api/statuses');
      console.log('Status fetch response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch statuses: ${response.status} ${response.statusText}`);
      }
      const statuses = await response.json();
      console.log('Statuses received:', statuses);
      if (!Array.isArray(statuses) || statuses.length === 0) {
        console.warn('No statuses returned from /api/statuses');
        showToast('No order statuses available');
        statusFilter.disabled = true;
        return [];
      }
      cachedStatuses = statuses;

      statusFilter.innerHTML = '<option value="">All Statuses</option>';
      statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.id;
        option.textContent = status.display;
        statusFilter.appendChild(option);
      });

      return statuses;
    } catch (err) {
      console.error('Error fetching statuses:', err.message);
      showToast('Failed to load order statuses');
      statusFilter.disabled = true;
      return [];
    }
  }

  async function updateOrderStatus(transactionId, statusId) {
    try {
      console.log('Updating status for transaction:', transactionId, 'to status:', statusId);
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: parseInt(statusId) })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update status: ${response.status} ${response.statusText} - ${errorText}`);
      }
      showToast('Order status updated successfully');
      // Reload orders with the current filter
      loadOrders(statusFilter.value);
    } catch (err) {
      console.error('Error updating order status:', err.message);
      showToast('Failed to update order status');
    }
  }

  async function loadOrders(filterStatusId = '') {
    try {
      console.log('Fetching orders from /api/transactions', { filterStatusId });
      let url = '/api/transactions';
      if (filterStatusId) {
        url += `?status_id=${filterStatusId}`;
      }
      const response = await fetch(url);
      console.log('Transactions fetch response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }
      const orders = await response.json();
      console.log('Orders received:', orders);
      ordersList.innerHTML = '';
      if (!Array.isArray(orders) || orders.length === 0) {
        console.log('No orders found for filter:', filterStatusId);
        ordersList.innerHTML = `<p class="text-gray-500 text-center py-4">No orders found${filterStatusId ? ' for selected status' : ''}.</p>`;
        return;
      }
      const statuses = await loadStatuses();
      orders.forEach(order => {
        // Calculate total from cart_items as a fallback
        const fallbackTotal = order.cart_items && Array.isArray(order.cart_items)
          ? order.cart_items.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0)
          : 0;
        const totalAmount = parseFloat(order.total_amount) || fallbackTotal;
        const div = document.createElement('div');
        div.className = 'bg-white p-4 rounded shadow';
        const address = order.address_id && order.street ?
          `${order.street}, ${order.city || 'N/A'}, ${order.state || 'N/A'} ${order.zip_code || 'N/A'}, ${order.country || 'N/A'}` :
          'No address';
        const isStatusDisabled = statuses.length === 0;

        const itemsHtml = order.cart_items && Array.isArray(order.cart_items) && order.cart_items.length > 0 ?
          order.cart_items.map(item => `
            <li class="ml-4">${item.item_name || 'Unknown'} ($${parseFloat(item.price || 0).toFixed(2)} x ${item.quantity || 0}) - ${item.category || 'N/A'}</li>
          `).join('') :
          '<li class="ml-4">No items found</li>';

        div.innerHTML = `
          <h3 class="text-lg font-semibold">Order #${order.transaction_id}</h3>
          <p>Date: ${new Date(order.transaction_date || Date.now()).toLocaleString()}</p>
          <p>Total: $${totalAmount.toFixed(2)}</p>
          <p>Delivery Address: ${address}</p>
          <div class="mt-2">
            <label for="status-select-${order.transaction_id}" class="mr-2 font-medium">Status:</label>
            <select id="status-select-${order.transaction_id}" class="status-select bg-white border border-gray-300 rounded px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-id="${order.transaction_id}" ${isStatusDisabled ? 'disabled' : ''}>
              <option value="">Select Status</option>
              ${statuses.map(status => `
                <option value="${status.id}" ${status.id === order.status_id ? 'selected' : ''}>${status.display}</option>
              `).join('')}
            </select>
          </div>
          <div class="mt-2">
            <h4 class="font-semibold">Order Items:</h4>
            <ul class="list-disc">
              ${itemsHtml}
            </ul>
          </div>
        `;
        ordersList.appendChild(div);
      });
    } catch (err) {
      console.error('Error loading orders:', err.message);
      showToast('Failed to load orders');
      ordersList.innerHTML = `<p class="text-red-500 text-center py-4">Error loading orders. Please try again.</p>`;
    }
  }

  // Event listener for status filter
  statusFilter.addEventListener('change', () => {
    const selectedStatusId = statusFilter.value;
    console.log('Filtering orders by status:', selectedStatusId);
    loadOrders(selectedStatusId);
  });

  // Event listener for status updates
  ordersList.addEventListener('change', (e) => {
    if (e.target.classList.contains('status-select')) {
      const transactionId = e.target.dataset.id;
      const statusId = e.target.value;
      if (statusId) {
        console.log('Status changed, id:', transactionId, 'status:', statusId);
        updateOrderStatus(transactionId, statusId);
      } else {
        showToast('Please select a valid status');
      }
    }
  });

  // Initialize page
  console.log('Initializing orders page');
  loadStatuses(); // Load statuses first to populate dropdown
  loadOrders(); // Load all orders initially
}

// --- Menu Maintenance Functions ---
async function initMenuMaintenancePage() {
  console.log('Starting initMenuMaintenancePage');
  const menuList = document.getElementById('menu-maintenance-list');
  if (!menuList) {
    console.error('menu-maintenance-list not found');
    showToast('Failed to initialize menu maintenance page');
    return;
  }

  async function loadMenuItems() {
    try {
      console.log('Fetching menu items for maintenance');
      const response = await fetch('/api/menu-items');
      if (!response.ok) throw new Error(`Failed to fetch menu items: ${response.status} ${response.statusText}`);
      const menuItems = await response.json();
      
      menuList.innerHTML = '';
      menuItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${item.name}</td>
          <td>$${parseFloat(item.price).toFixed(2)}</td>
          <td>
            <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onclick="openRecipePopup(${item.menu_item_id}, '${item.name}')">Recipes</button>
          </td>
        `;
        menuList.appendChild(tr);
      });
    } catch (err) {
      console.error('Error loading menu items:', err);
      showToast('Failed to load menu items');
      menuList.innerHTML = '<tr><td colspan="3">Error loading menu items</td></tr>';
    }
  }

  async function openRecipePopup(menuItemId, menuItemName) {
    console.log('Opening recipe popup for menu_item_id:', menuItemId);
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
      showToast('Failed to load ingredients');
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
          <button class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 ml-2" onclick="editRecipe(${menuItemId}, ${recipe.ingredient_id}, ${recipe.quantity}, '${recipe.unit}')">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2" onclick="deleteRecipe(${menuItemId}, ${recipe.ingredient_id})">Delete</button>
        `;
        recipeList.appendChild(li);
      });
    } catch (error) {
      console.error('Error loading recipes:', error);
      showToast('Failed to load recipes');
      recipeList.innerHTML = '<li>Error loading recipes</li>';
    }

    modal.style.display = 'block';
  }

  async function addRecipe() {
    const menuItemId = document.getElementById('recipeMenuItemId').value;
    const ingredientId = document.getElementById('ingredientSelect').value;
    const quantity = document.getElementById('recipeQuantity').value;
    const unit = document.getElementById('recipeUnit').value;
    if (!ingredientId || !quantity || !unit) {
      showToast('Please fill all fields');
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
      showToast('Recipe added successfully');
      openRecipePopup(menuItemId, document.getElementById('recipeModalTitle').textContent.replace('Recipes for ', ''));
    } catch (error) {
      console.error('Error adding recipe:', error);
      showToast('Failed to add recipe');
    }
  }

  async function editRecipe(menuItemId, ingredientId, currentQuantity, currentUnit) {
    const quantity = prompt('Enter new quantity:', currentQuantity);
    const unit = prompt('Enter new unit:', currentUnit);
    if (!quantity || !unit) {
      showToast('Quantity and unit are required');
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
      showToast('Recipe updated successfully');
      openRecipePopup(menuItemId, document.getElementById('recipeModalTitle').textContent.replace('Recipes for ', ''));
    } catch (error) {
      console.error('Error updating recipe:', error);
      showToast('Failed to update recipe');
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
      showToast('Recipe deleted successfully');
      openRecipePopup(menuItemId, document.getElementById('recipeModalTitle').textContent.replace('Recipes for ', ''));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      showToast('Failed to delete recipe');
    }
  }

  function closeRecipePopup() {
    document.getElementById('recipeModal').style.display = 'none';
  }

  // Initialize page
  loadMenuItems();
}
