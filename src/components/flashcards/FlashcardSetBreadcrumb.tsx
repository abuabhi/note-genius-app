
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, BookOpen } from "lucide-react";

interface FlashcardSetBreadcrumbProps {
  setName?: string;
}

export const FlashcardSetBreadcrumb = ({ setName }: FlashcardSetBreadcrumbProps) => {
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
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1">
              {setName || "Flashcard Set"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
