
import { useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { useCountries } from "@/hooks/useCountries";
import { useUnsavedChangesPrompt } from "@/hooks/useUnsavedChangesPrompt";
import { useSettingsFormState } from "./settings/useSettingsFormState";
import { useSettingsFormData } from "./settings/useSettingsFormData";
import { useSettingsFormSubmission } from "./settings/useSettingsFormSubmission";

export const useSettingsForm = () => {
  const { userTier } = useUserTier();
  const { countries, userCountry, updateUserCountry } = useCountries();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const {
    user,
    form,
    activeTab,
    setActiveTab,
    showUnsavedChangesDialog,
    setShowUnsavedChangesDialog,
    pendingNavigation,
    setPendingNavigation,
  } = useSettingsFormState();

  const { reset, formState: { isDirty, isSubmitSuccessful } } = form;
  const isDeanUser = userTier === UserTier.DEAN;

  // Handle tab parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['account', 'subjects', 'adaptive', 'notifications', 'subscription'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, setActiveTab]);

  // Load user preferences data
  useSettingsFormData(user, form);

  // Handle form submission
  const { onSubmit: handleSubmit } = useSettingsFormSubmission(user, userTier, updateUserCountry);

  // Use the unsaved changes prompt hook
  useUnsavedChangesPrompt(
    isDirty,
    setShowUnsavedChangesDialog,
    setPendingNavigation
  );

  useEffect(() => {
    if (userCountry) {
      form.setValue("countryId", userCountry.id);
    }
  }, [userCountry, form]);

  // Reset form when submission is successful
  useEffect(() => {
    if (isSubmitSuccessful) {
      setShowUnsavedChangesDialog(false);
    }
  }, [isSubmitSuccessful]);

  const onSubmit = async (data: any) => {
    const success = await handleSubmit(data);
    if (success) {
      reset(data); // Reset form state but keep the values
    }
  };

  const handleCountryChange = async (countryId: string) => {
    form.setValue("countryId", countryId, { 
      shouldDirty: true,
      shouldValidate: true 
    });
  };

  // Confirm navigation and discard changes
  const confirmNavigation = () => {
    setShowUnsavedChangesDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  return {
    form,
    user,
    userTier,
    isDeanUser,
    countries,
    activeTab,
    setActiveTab,
    showUnsavedChangesDialog,
    setShowUnsavedChangesDialog,
    pendingNavigation,
    onSubmit,
    handleCountryChange,
    confirmNavigation,
    isDirty,
    reset
  };
};
