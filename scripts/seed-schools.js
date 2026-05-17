import { query, initializeDatabase } from '../server/db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const SCHOOLS = [
  {
    name: 'Belleville High School',
    state: 'Michigan',
    district: 'Van Buren Public Schools',
    nutrislice_domain: 'vanburenschools',
  },
];

async function seedSchools() {
  try {
    await initializeDatabase();
    for (const school of SCHOOLS) {
      const existingSchool = await query(
        'SELECT id FROM schools WHERE name = $1',
        [school.name]
      );
      if (existingSchool.rows.length === 0) {
        await query(
          'INSERT INTO schools (id, name, state, district, nutrislice_domain) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), school.name, school.state, school.district, school.nutrislice_domain]
        );
        console.log(`Seeded school: ${school.name}`);
      }
    }
    console.log('Schools seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedSchools();