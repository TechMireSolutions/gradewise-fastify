import LoadingSpinner from "./ui/LoadingSpinner";
import QuestionCard from "./QuestionCard";
import { FiAlertCircle, FiList } from "react-icons/fi";

function SampleQuestionsTab({ questions, questionError, loading }) {
  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Sample Questions
        </h2>
        <p className={cn("text-muted-foreground", "text-sm", "mt-1")}>What students will see during the assessment</p>
      </div>

      {questionError ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center shadow-2xl">
          <div className="flex justify-center mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25">
              <FiAlertCircle className="text-white text-lg" />
            </div>
          </div>
          <p className="text-red-400 font-semibold mb-1">
            Failed to generate preview questions
          </p>
          <p className={cn("text-sm", "text-muted-foreground")}>{questionError}</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="dots" color="blue" />
          </div>
          <p className={cn("text-muted-foreground", "text-sm")}>Generating real sample questions from AI...</p>
        </div>
      ) : questions && questions.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {questions.map((question, index) => (
            <QuestionCard key={index} question={question} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-28 text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
            <FiList className="text-indigo-400 text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No questions yet</h3>
          <p className={cn("text-muted-foreground", "max-w-sm", "mb-8")}>Sample questions will appear here once the AI generates them for preview.</p>
        </div>
      )}
    </div>
  );
}

export default SampleQuestionsTab;
