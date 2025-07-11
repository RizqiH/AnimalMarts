const { AuthService } = require('../src/services/authService');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function createInitialAdmin() {
  try {
    const authService = new AuthService();
    
    const adminData = {
      email: 'admin@animalmart.com',
      password: 'Admin123!',
      name: 'Admin AnimalMart',
      role: 'admin'
    };

    console.log('Creating initial admin account...');
    
    const admin = await authService.createUser(adminData);
    
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Name:', adminData.name);
    console.log('🔐 Role:', admin.role);
    console.log('\n⚠️  IMPORTANT: Please change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    
    if (error.message.includes('Email already exists')) {
      console.log('ℹ️  Admin with this email already exists.');
    }
  }
}

// Run the script
createInitialAdmin(); 