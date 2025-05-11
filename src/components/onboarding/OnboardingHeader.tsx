
interface OnboardingHeaderProps {
  title: string;
  subtitle: string;
}

export const OnboardingHeader = ({ title, subtitle }: OnboardingHeaderProps) => {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 className="text-3xl font-bold text-center text-gray-900">{title}</h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        {subtitle}
      </p>
    </div>
  );
};
