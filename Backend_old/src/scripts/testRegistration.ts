// Test script to verify user registration works
import { AuthService } from '../services/authService';

const testRegistration = async () => {
  console.log('\n=== Testing User Registration ===\n');
  
  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@test.com`,
    password: 'Test123!@#',
    role: 'farmer' as const,
    location: 'Test Location'
  };

  try {
    console.log('Attempting to register user:', testUser.email);
    const result = await AuthService.register(
      testUser.name,
      testUser.email,
      testUser.password,
      testUser.role,
      testUser.location
    );

    console.log('\n✅ Registration successful!');
    console.log('User ID:', result.user.id);
    console.log('User Email:', result.user.email);
    console.log('User Role:', result.user.role);
    console.log('Token generated:', !!result.token);
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Registration failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

testRegistration();
