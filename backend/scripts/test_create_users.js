const axios = require('axios');

const users = [
  { name: 'Test User 1', email: 'test1@example.com', password: 'password123' },
  { name: 'Test User 2', email: 'test2@example.com', password: 'password123' }
];

async function createUsers() {
  for (const user of users) {
    try {
      const resp = await axios.post('http://localhost:5000/api/auth/register', user);
      console.log(`User ${user.name} created:`, resp.data.success);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.log(`User ${user.name} already exists.`);
      } else {
        console.error(`Error creating ${user.name}:`, err.message);
      }
    }
  }
}

createUsers();
