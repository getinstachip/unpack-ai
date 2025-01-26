import React from 'react';
import { Hero } from '@/components/Hero';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1A1F2C]">
      <Hero onStartAnalysis={() => navigate('/analysis')} />
    </div>
  );
};

export default Index;