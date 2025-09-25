// Simple test script to verify outlet API functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test credentials - you'll need to replace these with actual credentials
const TEST_USER = {
  email: 'admin@hotel.com', // Replace with actual admin email
  password: 'password123' // Replace with actual password
};

let authToken = null;

async function login() {
  try {
    console.log('🔑 Attempting to login...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER),
    });

    const data = await response.json();
    
    if (data.success) {
      authToken = data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testGetOutlets() {
  try {
    console.log('\n📋 Testing GET /api/pos/outlets...');
    const response = await fetch(`${BASE_URL}/pos/outlets`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`✅ GET outlets successful - Found ${data.data.length} outlets`);
      return data.data;
    } else {
      console.log('❌ GET outlets failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ GET outlets error:', error.message);
    return null;
  }
}

async function testCreateOutlet() {
  try {
    console.log('\n🆕 Testing POST /api/pos/outlets...');
    
    const outletData = {
      name: 'Test Main Restaurant',
      description: 'Main dining area for testing',
      location: 'Ground Floor',
      address: '123 Test Street, Test City',
      phone: '+1-555-123-4567',
      email: 'main@testrestaurant.com',
      outletType: 'RESTAURANT',
      operatingHours: JSON.stringify({
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '23:00', closed: false },
        saturday: { open: '09:00', close: '23:00', closed: false },
        sunday: { open: '10:00', close: '21:00', closed: false }
      })
    };

    const response = await fetch(`${BASE_URL}/pos/outlets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(outletData),
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ CREATE outlet successful');
      return data.data;
    } else {
      console.log('❌ CREATE outlet failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ CREATE outlet error:', error.message);
    return null;
  }
}

async function testGetOutletStatistics(outletId) {
  try {
    console.log(`\n📊 Testing GET /api/pos/outlets/${outletId}/statistics...`);
    const response = await fetch(`${BASE_URL}/pos/outlets/${outletId}/statistics`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ GET outlet statistics successful');
      return data.data;
    } else {
      console.log('❌ GET outlet statistics failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ GET outlet statistics error:', error.message);
    return null;
  }
}

async function testMenuCategoriesWithOutlet(outletId) {
  try {
    console.log(`\n🍽️ Testing GET /api/pos/menu/categories with outletId=${outletId}...`);
    const response = await fetch(`${BASE_URL}/pos/menu/categories?outletId=${outletId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`✅ GET menu categories with outlet filter successful - Found ${data.data.length} categories`);
      return data.data;
    } else {
      console.log('❌ GET menu categories with outlet filter failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ GET menu categories with outlet filter error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Starting Outlet API Tests...\n');
  
  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  // Step 2: Get existing outlets
  const existingOutlets = await testGetOutlets();
  
  // Step 3: Create a new outlet
  const newOutlet = await testCreateOutlet();
  
  // Step 4: Get outlets again to see the new one
  if (newOutlet) {
    await testGetOutlets();
    
    // Step 5: Test outlet statistics
    await testGetOutletStatistics(newOutlet.id);
    
    // Step 6: Test menu categories with outlet filter
    await testMenuCategoriesWithOutlet(newOutlet.id);
  }

  console.log('\n🎉 Outlet API Tests completed!');
  console.log('\nNOTE: If you want to clean up, manually delete the test outlet through the API or database.');
}

// Run the tests
runTests().catch(console.error);