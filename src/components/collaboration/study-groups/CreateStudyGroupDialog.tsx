
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface CreateStudyGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (group: { name: string; description: string; isPublic: boolean }) => void;
}

const CreateStudyGroupDialog = ({
  open,
  onOpenChange,
  onCreate
}: CreateStudyGroupDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onCreate(formData);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      isPublic: false
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Study Group</DialogTitle>
            <DialogDescription>
              Create a new study group to collaborate with others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter group name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the purpose of this group"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-public"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPublic: checked }))
                }
              />
              <Label htmlFor="is-public">Make this group public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudyGroupDialog;
