import React from 'react';
import { Button } from './ui/button';
import { Brain, Shield, Code, Search } from 'lucide-react';

interface HeroProps {
  onStartAnalysis: () => void;
}

export const Hero = ({ onStartAnalysis }: HeroProps) => {
  return (
    <div className="flex flex-col items-center text-center space-y-12 py-24 px-4 bg-[#1A1F2C]">
      {/* Hero Section */}
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
          <span className="text-[#9b87f5]">unpack</span>.ai
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          AI-powered malware reverse engineering and cipher analysis platform
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto animate-slide-in">
        <FeatureCard
          icon={<Brain className="w-8 h-8 text-[#9b87f5]" />}
          title="AI Analysis"
          description="Advanced pattern recognition for malware signatures and behaviors"
        />
        <FeatureCard
          icon={<Shield className="w-8 h-8 text-[#9b87f5]" />}
          title="Secure Sandbox"
          description="Safe environment for analyzing potentially malicious code"
        />
        <FeatureCard
          icon={<Code className="w-8 h-8 text-[#9b87f5]" />}
          title="Smart Deobfuscation"
          description="Automated unpacking and deobfuscation of complex code"
        />
        <FeatureCard
          icon={<Search className="w-8 h-8 text-[#9b87f5]" />}
          title="Cipher Detection"
          description="Identify and analyze encryption methods automatically"
        />
      </div>

      {/* CTA Section */}
      <div className="pt-8 animate-fade-in">
        <Button 
          size="lg" 
          className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white px-8 py-6 text-lg"
          onClick={onStartAnalysis}
        >
          Start Analysis
        </Button>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="p-6 rounded-lg bg-[#221F26] border border-[#403E43] hover:border-[#9b87f5] transition-colors group">
      <div className="space-y-4">
        <div className="p-3 rounded-lg inline-block bg-[#1A1F2C] group-hover:bg-[#9b87f5]/10 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
};