
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/admin/csv/FileUploader";
import { ImportResults } from "@/components/admin/csv/ImportResults";
import { useFlashcardsImport } from "@/hooks/csv/useFlashcardsImport";
import { getTemplateCSV } from "@/utils/csvUtils";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

export function FlashcardsCSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [countries, setCountries] = useState<{ id: string; name: string; code: string }[]>([]);
  const { importFlashcards, isImporting, importResults } = useFlashcardsImport();
  const form = useForm({
    defaultValues: {
      country: ""
    }
  });

  // Fetch available countries
  useEffect(() => {
    const fetchCountries = async () => {
      const { data } = await supabase
        .from('countries')
        .select('id, name, code')
        .order('name');
      
      if (data) {
        setCountries(data);
      }
    };
    
    fetchCountries();
  }, []);

  const handleFileChange = (file: File | null) => {
    setFile(file);
  };

  const handleImport = async () => {
    if (file) {
      await importFlashcards(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Flashcards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Import flashcards from a CSV file. Download the template below for the correct format.
            The template includes fields for country and education system to properly organize your flashcards.
          </p>
          
          <Form {...form}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Default Country (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Countries</SelectItem>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.code}>
                            {country.name} ({country.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
          
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => {
                const csvContent = getTemplateCSV('flashcards');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'flashcards_template.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              Download Template
            </Button>
            
            <Button
              onClick={handleImport}
              disabled={!file || isImporting}
            >
              {isImporting ? "Importing..." : "Import Flashcards"}
            </Button>
          </div>
          
          <FileUploader
            selectedFile={file}
            onFileChange={handleFileChange}
            acceptedTypes=".csv"
            description="Upload a CSV file with flashcards data"
          />
          
          {importResults && (
            <ImportResults results={importResults} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
