
import React from "react";

interface EnhancementTabHeaderProps {
  title: string;
}

export const EnhancementTabHeader: React.FC<EnhancementTabHeaderProps> = ({ title }) => {
  return (
    <h3 className="text-lg font-medium text-mint-800 mb-3">{title}</h3>
  );
};
