"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import FormContainer from "./_components/FormContainer";
import ConfirmationModal from "./_components/ConfirmationModal";
import QuestionList from "./_components/QuestionList";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";
import { toast } from "sonner";

// Helper function to extract numeric value from duration string
const extractDurationMinutes = (durationString) => {
  if (!durationString) return 30; // default
  const match = durationString.match(/\d+/);
  return match ? parseInt(match[0]) : 30;
};

function CreateInterview() {
  const user = useUser();
  const router = useRouter();
  const [errors, setErrors] = React.useState({});
  const [showConfirmationModal, setShowConfirmationModal] =
    React.useState(false);
  const [formData, setFormData] = React.useState({
    jobPosition: "",
    jobDescription: "",
    experienceLevel: "",
    interviewDuration: "",
    difficultyLevel: "",
    interviewType: "",
  });

  const updateFormData = (field, value) => {
    // Clear any error for this field when user updates it
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate all required form fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    console.log("🔍 Validating form fields:", formData);

    if (!formData.jobPosition.trim()) {
      newErrors.jobPosition = "Job position is required";
      isValid = false;
    }
    if (!formData.interviewType) {
      newErrors.interviewType = "Interview Type is required";
    }
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required";
      isValid = false;
    }
    if (!formData.experienceLevel) {
      newErrors.experienceLevel = "Experience level is required";
      isValid = false;
    }
    if (!formData.interviewDuration) {
      newErrors.interviewDuration = "Interview duration is required";
      isValid = false;
    }

    if (!formData.difficultyLevel) {
      newErrors.difficultyLevel = "Difficulty level is required";
      isValid = false;
    }

    console.log("📋 Validation errors:", newErrors);
    console.log("✅ Form is valid:", isValid);

    setErrors(newErrors);
    return isValid;
  };

  // Check user credits
  const checkUserCredits = () => {
    console.log("Checking user credits:", user?.user?.credits);

    if (!user || !user.user) {
      toast.error("Please login to create an interview");
      return false;
    }

    const userCredits = user.user.credits || 0;

    if (userCredits <= 0) {
      toast.error(
        "You don't have enough credits to create an interview. Please add credits to continue.",
        {
          duration: 5000,
          action: {
            label: "Add Credits",
            onClick: () => router.push("/billing"),
          },
        },
      );
      return false;
    }

    return true;
  };

  const handleCreateInterview = () => {
    console.log("🔍 handleCreateInterview called");
    console.log("📝 Form data:", formData);

    // Validate form and check credits
    if (validateForm()) {
      console.log("✅ Form validation passed");
      if (checkUserCredits()) {
        console.log("✅ Credit check passed");
        setShowConfirmationModal(true);
      } else {
        console.log("❌ Credit check failed");
      }
    } else {
      console.log("❌ Form validation failed");
      console.log("🚨 Validation errors:", errors);
    }
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [generationError, setGenerationError] = React.useState(null);
  const [generatedQuestions, setGeneratedQuestions] = React.useState(null);
  const [showQuestionList, setShowQuestionList] = React.useState(false);
  const [currentInterviewId, setCurrentInterviewId] = React.useState(null);

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Double-check credits before proceeding
      if (!checkUserCredits()) {
        return;
      }

      // Prepare interview data
      const submissionData = {
        ...formData,
      };

      // Generate a unique interview ID
      const interviewId = uuidv4();

      const { data, error } = await supabase.rpc("create_interview", {
        p_interview_id: interviewId,
        p_job_position: submissionData.jobPosition,
        p_job_description: submissionData.jobDescription,
        p_experience_level: submissionData.experienceLevel,
        p_interview_time: extractDurationMinutes(
          submissionData.interviewDuration,
        ),
        p_interview_type: submissionData.interviewType,
        p_difficulty_level: submissionData.difficultyLevel,
      });

      if (error) {
        console.error("Error creating interview:", error);
        toast.error(error.message || "Failed to create interview.");
        return;
      }

      console.log("Interview saved:", data);
      toast.success("Interview created successfully!");

      // Save interview id
      setCurrentInterviewId(interviewId);

      // Close modal
      setShowConfirmationModal(false);

      // Start interview immediately
      router.push(`/interview/${interviewId}`);
    } catch (error) {
      console.error(error);
      setGenerationError(error.message);
      toast.error(`Error creating interview: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setShowConfirmationModal(false);
    }
  };

  return (
    <div className="w-full px-6 md:px-12 lg:px-24 xl:px-32 pt-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ArrowLeft
          onClick={() => router.back()}
          className="cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
          size={36}
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Create New Interview
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Generate personalized questions for your interview practice
          </p>
        </div>
      </div>

      {/* Display user credits */}
      {user?.user && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-700">
                Available Credits:{" "}
                <strong className="text-lg">{user.user.credits || 0}</strong>
              </span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                1 credit per interview
              </span>
            </div>
            {(user.user.credits || 0) <= 0 && (
              <button
                onClick={() => router.push("/billing")}
                className="text-xs bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Add Credits
              </button>
            )}
          </div>
        </div>
      )}

      <FormContainer
        formData={formData}
        updateFormData={updateFormData}
        errors={errors}
      />

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4 text-sm">
          Ready to create your interview? Make sure all required fields (*) are
          filled out.
        </p>
        <button
          onClick={() => {
            console.log("🎯 Button clicked!");
            console.log("👤 User:", user);
            console.log("💰 Credits:", user?.user?.credits);
            handleCreateInterview();
          }}
          className={`px-12 py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-semibold text-lg transition-all duration-200 ${
            !user?.user || user.user.credits <= 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:shadow-xl hover:scale-105 hover:from-primary/90 hover:to-primary/70"
          }`}
          disabled={!user?.user || user.user.credits <= 0}
        >
          🎤 Start AI Interview
        </button>
        {(!user?.user || user.user.credits <= 0) && (
          <p className="text-red-500 text-sm mt-2">
            You need at least 1 credit to create an interview
          </p>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => !isSubmitting && setShowConfirmationModal(false)}
        onConfirm={handleFinalSubmit}
        formData={formData}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default CreateInterview;
