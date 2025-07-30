"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { useState } from "react";

interface SaveProgressProps {
  onSave: () => Promise<void>;
  autoSaveEnabled?: boolean;
  lastSaved?: Date | null;
  className?: string;
  variant?: "default" | "compact";
  isDirty?: boolean;
}

export function SaveProgress({
  onSave,
  autoSaveEnabled = true,
  lastSaved = null,
  className,
  variant = "default",
  isDirty = false
}: SaveProgressProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setSaveStatus("saving");
      await onSave();
      setSaveStatus("saved");

      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Error saving progress:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const formattedLastSaved = lastSaved
    ? new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: 'numeric',
      month: 'short'
    }).format(lastSaved)
    : null;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="p-1 h-8 w-8"
              >
                {saveStatus === "saving" ? (
                  <span className="animate-spin">
                    <Save className="h-4 w-4" />
                  </span>
                ) : saveStatus === "saved" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : saveStatus === "error" ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Save className={cn("h-4 w-4", isDirty ? "text-amber-500" : "text-gray-400")} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {saveStatus === "saving" ? "Saving..." :
                saveStatus === "saved" ? "Saved successfully" :
                  saveStatus === "error" ? "Failed to save" :
                    isDirty ? "Save changes" : "No changes to save"}

              {formattedLastSaved && saveStatus !== "saving" && (
                <div className="text-xs text-gray-500 mt-1">
                  Last saved: {formattedLastSaved}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex-1 text-sm text-gray-500">
        {autoSaveEnabled && (
          <span className="mr-2">Auto-save enabled.</span>
        )}

        {formattedLastSaved && (
          <span>Last saved: {formattedLastSaved}</span>
        )}

        {!formattedLastSaved && !autoSaveEnabled && (
          <span>Not saved yet</span>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSave}
        disabled={isSaving || !isDirty}
        className="flex items-center gap-2"
      >
        {saveStatus === "saving" ? (
          <>
            <span className="animate-spin">
              <Save className="h-4 w-4" />
            </span>
            <span>Saving...</span>
          </>
        ) : saveStatus === "saved" ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Saved</span>
          </>
        ) : saveStatus === "error" ? (
          <>
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>Failed to save</span>
          </>
        ) : (
          <>
            <Save className={cn("h-4 w-4", isDirty ? "text-amber-500" : "text-gray-400")} />
            <span>Save progress</span>
          </>
        )}
      </Button>
    </div>
  );
}
