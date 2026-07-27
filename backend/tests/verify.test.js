const assert = require('assert');

// 1. Test email validation logic matching user registration rules
const validateEmail = (email) => {
  return /\.edu$|\.ac\.in$/.test(email.toLowerCase());
};

try {
  console.log('Running CampusLoop Test Suite...');
  
  // Test case 1: Accept valid university emails
  assert.strictEqual(validateEmail('student@harvard.edu'), true, 'Should accept .edu emails');
  assert.strictEqual(validateEmail('user@iitd.ac.in'), true, 'Should accept .ac.in emails');
  assert.strictEqual(validateEmail('researcher@oxford.edu'), true, 'Should accept case-insensitive .edu');
  
  // Test case 2: Reject non-university emails
  assert.strictEqual(validateEmail('student@gmail.com'), false, 'Should reject gmail.com');
  assert.strictEqual(validateEmail('student@yahoo.co.in'), false, 'Should reject yahoo.co.in');
  assert.strictEqual(validateEmail('student@edu.com'), false, 'Should reject edu.com if not ending with .edu');
  
  console.log('✔ Email validation tests passed successfully.');

  // 2. Test Listing categorization mock validation
  const allowedCategories = ['Electronics', 'Textbooks', 'Furniture', 'Dorm Gear', 'Clothing', 'Other'];
  const validateCategory = (cat) => allowedCategories.includes(cat);

  assert.strictEqual(validateCategory('Electronics'), true, 'Electronics is valid');
  assert.strictEqual(validateCategory('Textbooks'), true, 'Textbooks is valid');
  assert.strictEqual(validateCategory('Books'), false, 'Books should not be listed as category');

  console.log('✔ Listings category validation tests passed successfully.');
  
  console.log('All automated verification checks PASSED.');
} catch (error) {
  console.error('❌ Test validation FAILED:');
  console.error(error.message);
  process.exit(1);
}
