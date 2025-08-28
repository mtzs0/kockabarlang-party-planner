import { useState, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Theme {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface ThemeSelectionStepProps {
  selectedTheme: string;
  onThemeSelect: (theme: string) => void;
}

export const ThemeSelectionStep = ({ selectedTheme, onThemeSelect }: ThemeSelectionStepProps) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('kockabarlang_szulinapthemes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setThemes(data || []);
    } catch (error) {
      console.error('Error loading themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredThemes = themes.filter(theme =>
    theme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleThemeSelect = (themeName: string) => {
    onThemeSelect(themeName);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Válassz témát</h2>
        <p className="text-muted-foreground">Keresd meg a tökéletes témát a születésnapra</p>
      </div>

      {/* Search/Dropdown */}
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Keress témát vagy válassz a listából..."
            value={selectedTheme || searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="pl-10 pr-10"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="absolute right-0 top-0 h-full px-3"
          >
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform duration-200",
              isDropdownOpen && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-y-auto shadow-lg">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Témák betöltése...
              </div>
            ) : filteredThemes.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nincs találat
              </div>
            ) : (
              <div className="py-2">
                {filteredThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.name)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-muted transition-colors duration-200",
                      "flex items-center justify-between",
                      selectedTheme === theme.name && "bg-primary/10 text-primary"
                    )}
                  >
                    <div>
                      <div className="font-medium">{theme.name}</div>
                      {theme.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {theme.description}
                        </div>
                      )}
                    </div>
                    {selectedTheme === theme.name && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Selected Theme Display */}
      {selectedTheme && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-primary mr-2" />
            <div>
              <p className="font-medium text-primary">Kiválasztott téma:</p>
              <p className="text-foreground">{selectedTheme}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Theme Preview */}
      <div className="flex-1 overflow-y-auto mt-6">
        {!selectedTheme ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Válassz egy témát a részletek megtekintéséhez</p>
          </div>
        ) : (
          <div className="space-y-4">
            {themes
              .filter(theme => theme.name === selectedTheme)
              .map(theme => (
                <Card key={theme.id} className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{theme.name}</h3>
                  {theme.description && (
                    <p className="text-muted-foreground">{theme.description}</p>
                  )}
                </Card>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};