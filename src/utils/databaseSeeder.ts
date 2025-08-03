
import { supabase } from '@/integrations/supabase/client';

export const seedDatabase = async () => {
  try {
    // Check if countries already exist (since academic_subjects table was removed)
    const { data: existingCountries } = await supabase
      .from('countries')
      .select('id')
      .limit(1);

    if (existingCountries && existingCountries.length > 0) {
      console.log('Database already seeded');
      return;
    }

    // Seed countries
    const countries = [
      { name: 'United States', code: 'US' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'Canada', code: 'CA' },
      { name: 'Australia', code: 'AU' }
    ];

    const { data: countryData } = await supabase
      .from('countries')
      .insert(countries)
      .select();

    // Seed grades
    const grades = [
      { name: 'Grade 1', level: 1 },
      { name: 'Grade 2', level: 2 },
      { name: 'Grade 3', level: 3 },
      { name: 'Grade 4', level: 4 },
      { name: 'Grade 5', level: 5 }
    ];

    const { data: gradeData } = await supabase
      .from('grades')
      .insert(grades)
      .select();

    // Academic subjects table was removed - users now create their own subjects
    console.log('Skipping academic subjects seeding - users create their own subjects');

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

export const runDatabaseSeed = async () => {
  try {
    await seedDatabase();
    return {
      categories: { success: true, message: "Countries and grades seeded successfully" },
      sets: { success: true, message: "Database initialization completed" }
    };
  } catch (error) {
    console.error('Error running database seed:', error);
    return {
      categories: { success: false, message: "Failed to seed database" },
      sets: { success: false, message: "Database initialization failed" }
    };
  }
};
