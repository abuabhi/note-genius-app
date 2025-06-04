
export const QuizHistoryLoading = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-mint-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-mint-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-mint-700 font-medium">Loading quiz history...</p>
      </div>
    </div>
  );
};
