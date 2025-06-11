
import { supabase } from '@/integrations/supabase/client';

export const seedDatabase = async () => {
  try {
    // Check if academic subjects already exist
    const { data: existingSubjects } = await supabase
      .from('academic_subjects')
      .select('id')
      .limit(1);

    if (existingSubjects && existingSubjects.length > 0) {
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

    // Seed academic subjects
    if (countryData && gradeData) {
      const subjects = [
        { name: 'Mathematics', grade_id: gradeData[0].id, country_id: countryData[0].id },
        { name: 'Science', grade_id: gradeData[0].id, country_id: countryData[0].id },
        { name: 'English', grade_id: gradeData[0].id, country_id: countryData[0].id },
        { name: 'History', grade_id: gradeData[0].id, country_id: countryData[0].id }
      ];

      await supabase
        .from('academic_subjects')
        .insert(subjects);
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
