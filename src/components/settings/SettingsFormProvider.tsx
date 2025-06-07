
import { Form } from "@/components/ui/form";
import { SettingsFormTabs } from "./SettingsFormTabs";
import { SettingsFormActions } from "./SettingsFormActions";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import UnsavedChangesDialog from "@/components/dialogs/UnsavedChangesDialog";

export const SettingsFormProvider = () => {
  const {
    form,
    user,
    userTier,
    countries,
    activeTab,
    setActiveTab,
    showUnsavedChangesDialog,
    setShowUnsavedChangesDialog,
    onSubmit,
    handleCountryChange,
    confirmNavigation,
    isDirty,
    reset
  } = useSettingsForm();

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <SettingsFormTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            form={form}
            user={user}
            userTier={userTier}
            countries={countries}
            onCountryChange={handleCountryChange}
          />

          <SettingsFormActions
            form={form}
            isDirty={isDirty}
            onReset={() => reset()}
            activeTab={activeTab}
          />
        </form>
      </Form>

      {/* Unsaved changes confirmation dialog */}
      <UnsavedChangesDialog 
        isOpen={showUnsavedChangesDialog}
        onClose={() => setShowUnsavedChangesDialog(false)}
        onConfirm={confirmNavigation}
      />
    </>
  );
};
