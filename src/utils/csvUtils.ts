
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
export const getTemplateCSV = (type: 'grades' | 'subjects' | 'sections' | 'flashcards' | 'notes'): string => {
  switch (type) {
    case 'grades':
      return 'name,level,description\nGrade 1,1,"First grade"\nGrade 2,2,"Second grade"';
    case 'subjects':
      return 'name,grade_name,description,country_code\nMath,Grade 1,"Mathematics",AU\nScience,Grade 1,"Science",AU';
    case 'sections':
      return 'name,subject_name,grade_name,description,country_code\nAlgebra,Math,Grade 1,"Algebra section",AU\nGeometry,Math,Grade 1,"Geometry section",AU';
    case 'flashcards':
      return 'set_name,front_content,back_content,subject_name,grade_name,section_name,difficulty,country_code,education_system\n"English Literature","What is the setting of To Kill a Mockingbird?","Maycomb, Alabama during the Great Depression","English","Grade 10","Literature",2,"AU","Australian Curriculum"\n"English Literature","Who wrote Pride and Prejudice?","Jane Austen","English","Grade 10","Literature",1,"AU","Australian Curriculum"';
    case 'notes':
      return 'title,description,content,subject,category,source_type,tags,user_email\n"Mathematics Study Notes","Notes on algebra basics","Algebra is a branch of mathematics dealing with symbols and rules for manipulating symbols...","Mathematics","Study Notes","import","algebra,math,basics","student@example.com"\n"History Essay Notes","World War II overview","World War II was a global war that lasted from 1939 to 1945...","History","Research Notes","import","wwii,history,essay","student@example.com"';
    default:
      return '';
  }
};

// Export JSON to CSV
export const exportToCSV = (data: any[], fileName: string): void => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
