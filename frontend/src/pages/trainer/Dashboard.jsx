import React, { useState } from 'react';
import { useTrainerLayoutData } from '@/components/layout/TrainerLayout';
import OverviewCards from '@/components/trainer/OverviewCards';
import ActivityTrendChart from '@/components/trainer/ActivityTrendChart';
import StudentsTable from '@/components/trainer/StudentsTable';
import TopPerformers from '@/components/trainer/TopPerformers';
import AtRiskStudents from '@/components/trainer/AtRiskStudents';
import InsightsPanel from '@/components/trainer/InsightsPanel';
import StudentDetailModal from '@/components/trainer/StudentDetailModal';

const SkeletonCard = ({ h = 'h-32' }) => (
  <div className={`${h} rounded-2xl bg-white/60 border border-white/40 animate-pulse`} />
);

const TrainerDashboard = () => {
  const { data, loading } = useTrainerLayoutData();
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} h="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><SkeletonCard h="h-72" /></div>
          <SkeletonCard h="h-72" />
        </div>
        <SkeletonCard h="h-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard h="h-64" />
          <SkeletonCard h="h-64" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <OverviewCards overview={data?.overview} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityTrendChart trend={data?.trend} />
          </div>
          <TopPerformers
            performers={data?.topPerformers}
            onViewStudent={setSelectedStudent}
          />
        </div>

        <StudentsTable onViewStudent={setSelectedStudent} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AtRiskStudents
            students={data?.atRisk}
            onViewStudent={setSelectedStudent}
          />
          <InsightsPanel insights={data?.insights} />
        </div>
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

export default TrainerDashboard;
