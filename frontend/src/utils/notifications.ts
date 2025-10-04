// Utility function to show notifications
export const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
  const event = new CustomEvent("show-notification", {
    detail: { message, type }
  });
  window.dispatchEvent(event);
};

// Predefined notification messages for consistency
export const notifications = {
  // Draft submission notifications
  submissionApproved: "Draft has been approved successfully! The teacher will be notified.",
  submissionRejected: "Draft has been rejected and feedback has been sent to the teacher.",
  feedbackRequired: "Please provide feedback before rejecting the submission.",
  
  // Error notifications
  approvalFailed: "Failed to approve the submission. Please try again.",
  rejectionFailed: "Failed to reject the submission. Please try again.",
  loadingFailed: "Failed to load submission data. Please refresh the page.",
  
  // Success notifications
  actionCompleted: "Action completed successfully!",
  changesSaved: "Changes have been saved successfully.",
  
  // Info notifications
  processingRequest: "Processing your request...",
  redirecting: "Redirecting to dashboard...",
  
  // Template notifications
  templates: {
    fetchError: "Unable to load your saved templates. You can still create content without templates.",
    saveSuccess: "Template saved successfully!",
    saveFailed: "Failed to save template. Please try again.",
    deleteSuccess: "Template deleted successfully!",
    deleteFailed: "Failed to delete template. Please try again."
  }
};