import React, { useState } from 'react';
import StudentsTable from '@/components/trainer/StudentsTable';
import StudentDetailModal from '@/components/trainer/StudentDetailModal';

const TrainerStudents = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Students</h2>
          <p className="text-sm text-slate-500 mt-0.5">Browse, search, and filter all students in your batch.</p>
        </div>
        <StudentsTable onViewStudent={setSelectedStudent} />
      </div>

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </>
  );
};

export default TrainerStudents;
