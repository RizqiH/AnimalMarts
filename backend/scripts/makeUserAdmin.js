const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

async function makeUserAdmin(userEmail) {
  try {
    console.log('🔍 Searching for user:', userEmail);
    
    // Find user by email
    const querySnapshot = await db
      .collection("users")
      .where("email", "==", userEmail.toLowerCase())
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      console.log('❌ User not found with email:', userEmail);
      console.log('💡 Make sure the user is already registered first!');
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log('👤 Found user:', userData.name);
    console.log('📧 Current email:', userData.email);
    console.log('🔐 Current role:', userData.role);
    
    if (userData.role === 'admin') {
      console.log('ℹ️  User is already an admin!');
      return;
    }
    
    // Update user role to admin
    await db
      .collection("users")
      .doc(userId)
      .update({
        role: 'admin',
        updatedAt: new Date()
      });

    console.log('✅ User promoted to admin successfully!');
    console.log('📧 Email:', userEmail);
    console.log('🔐 New Role: admin');
    
  } catch (error) {
    console.error('❌ Error making user admin:', error.message);
    if (error.message.includes('Firebase')) {
      console.log('💡 Make sure Firebase environment variables are set correctly');
    }
  }
}

// Get email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
  console.log('Usage: node makeUserAdmin.js <user-email>');
  console.log('Example: node makeUserAdmin.js admin@animalmart.com');
} else {
  makeUserAdmin(userEmail);
} 