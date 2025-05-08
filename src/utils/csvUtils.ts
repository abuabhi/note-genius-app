
import Papa from "papaparse";

// Parse CSV file to JSON
export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Generate template CSV content based on type
export const getTemplateCSV = (type: 'grades' | 'subjects' | 'sections' | 'flashcards'): string => {
  switch (type) {
    case 'grades':
      return 'name,level,description\nGrade 1,1,"First grade"\nGrade 2,2,"Second grade"';
    case 'subjects':
      return 'name,grade_name,description\nMath,Grade 1,"Mathematics"\nScience,Grade 1,"Science"';
    case 'sections':
      return 'name,subject_name,grade_name,description\nAlgebra,Math,Grade 1,"Algebra section"\nGeometry,Math,Grade 1,"Geometry section"';
    case 'flashcards':
      return 'set_name,front_content,back_content,subject_name,grade_name,section_name,difficulty\n"Basic Math","What is 2+2?","4","Math","Grade 1","Arithmetic",1\n"Basic Math","What is 5x5?","25","Math","Grade 1","Arithmetic",2';
    default:
      return '';
  }
};
