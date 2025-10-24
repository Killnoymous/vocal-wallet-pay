import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/vocal-wallet';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      authSource: 'admin',
      authMechanism: 'SCRAM-SHA-1'
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    console.log('👥 Creating users...');
    const harsh = new User({
      name: 'Harsh',
      balance: 10000,
      passphrase: 'harsh'
    });

    const tanya = new User({
      name: 'Tanya',
      balance: 10000,
      passphrase: 'tanya'
    });

    await harsh.save();
    await tanya.save();
    console.log('✅ Created users: Harsh and Tanya');

    // Create sample transactions for Harsh
    console.log('💳 Creating sample transactions...');
    const harshTransactions = [
      {
        id: 'TXN' + Date.now() + 'H1',
        userId: harsh._id,
        type: 'received',
        amount: 5000,
        payeeName: 'Demo Sender',
        timestamp: Date.now() - 86400000, // 1 day ago
        status: 'success'
      },
      {
        id: 'TXN' + Date.now() + 'H2',
        userId: harsh._id,
        type: 'sent',
        amount: 1500,
        payeeName: 'Demo Merchant',
        timestamp: Date.now() - 172800000, // 2 days ago
        status: 'success'
      }
    ];

    // Create sample transactions for Tanya
    const tanyaTransactions = [
      {
        id: 'TXN' + Date.now() + 'T1',
        userId: tanya._id,
        type: 'received',
        amount: 3000,
        payeeName: 'Salary Credit',
        timestamp: Date.now() - 259200000, // 3 days ago
        status: 'success'
      },
      {
        id: 'TXN' + Date.now() + 'T2',
        userId: tanya._id,
        type: 'sent',
        amount: 800,
        payeeName: 'Grocery Store',
        timestamp: Date.now() - 345600000, // 4 days ago
        status: 'success'
      }
    ];

    // Insert transactions
    await Transaction.insertMany([...harshTransactions, ...tanyaTransactions]);
    console.log('✅ Created sample transactions');

    // Update user balances based on transactions
    console.log('💰 Updating user balances...');
    harsh.balance = 10000 + 5000 - 1500; // 13500
    tanya.balance = 10000 + 3000 - 800; // 12200

    await harsh.save();
    await tanya.save();
    console.log('✅ Updated user balances');

    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('👤 Users created:');
    console.log('   - Harsh (passphrase: harsh, balance: ₹13,500)');
    console.log('   - Tanya (passphrase: tanya, balance: ₹12,200)');
    console.log('');
    console.log('💳 Sample transactions created for both users');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure MongoDB is running: docker-compose up');
    console.error('2. Check MongoDB credentials: admin:admin123');
    console.error('3. Verify database name: vocal-wallet');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedDatabase();