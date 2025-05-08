
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TabContent } from "./csv/TabContent";

export function CSVImport() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CSV Import</CardTitle>
        <CardDescription>
          Import grades, subjects, sections, and flashcards from CSV files
        </CardDescription>
      </CardHeader>

      <CardContent>
        <TabContent />
      </CardContent>

      <CardFooter className="border-t px-6 py-4">
        <div className="text-sm text-muted-foreground">
          Note: Make sure your CSV files match the specified format to avoid import errors.
        </div>
      </CardFooter>
    </Card>
  );
}
