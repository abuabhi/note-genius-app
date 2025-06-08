
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, BookOpen, Plus } from "lucide-react";

interface CreateFlashcardBreadcrumbProps {
  setId?: string;
}

export const CreateFlashcardBreadcrumb = ({ setId }: CreateFlashcardBreadcrumbProps) => {
  return (
    <div className="mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/flashcards" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Flashcards
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {setId && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/flashcards/${setId}`} className="flex items-center gap-1">
                  Flashcard Set
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1">
              <Plus className="h-3 w-3" />
              Add New Flashcard
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
