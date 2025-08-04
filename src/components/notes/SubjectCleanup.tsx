import { useEffect } from 'react';
import { useUserSubjects } from '@/hooks/useUserSubjects';

export const SubjectCleanup = () => {
  const { subjects, removeScannedDocumentsSubject } = useUserSubjects();

  useEffect(() => {
    // Remove "Scanned Documents" subject on component mount if it exists
    const scannedSubject = subjects.find(s => s.name === 'Scanned Documents');
    if (scannedSubject) {
      console.log('🧹 SubjectCleanup: Found unwanted "Scanned Documents" subject, removing...');
      removeScannedDocumentsSubject();
    }
  }, [subjects, removeScannedDocumentsSubject]);

  // This component doesn't render anything
  return null;
};