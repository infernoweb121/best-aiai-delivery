import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationModal = ({ isOpen, onClose }: LocationModalProps) => {
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [foundStore, setFoundStore] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!city.trim()) return;

    setIsLoading(true);
    setFoundStore(null);

    // Simula busca por 2 segundos
    setTimeout(() => {
      const distances = ["1,3", "1,7", "2,1", "2,5", "2,8", "3,2", "3,6", "3,9"];
      const randomDistance = distances[Math.floor(Math.random() * distances.length)];
      
      setFoundStore(`Best Açaí - Shopping Center a ${randomDistance} km de você`);
      setIsLoading(false);
      
      // Fecha o modal após 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-card border-0 shadow-primary">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold gradient-tropical bg-clip-text text-transparent mb-4">
            🌎 Encontre sua Best Açaí
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {!isLoading && !foundStore && (
            <>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-foreground font-medium">
                  Qual sua cidade?
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="city"
                    placeholder="Digite sua cidade..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-10 border-border focus:ring-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSearch}
                disabled={!city.trim()}
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold py-3 rounded-xl transition-smooth"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar Best Açaí próxima
              </Button>
            </>
          )}

          {isLoading && (
            <div className="text-center py-8 space-y-4">
              <div className="loading-spinner w-8 h-8 mx-auto text-primary"></div>
              <p className="text-muted-foreground animate-pulse-slow">
                Buscando Best Açaí próxima a você...
              </p>
            </div>
          )}

          {foundStore && (
            <div className="text-center py-6 space-y-4 animate-bounce-in">
              <div className="text-4xl">🎉</div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-success">
                  Loja encontrada!
                </h3>
                <p className="text-foreground font-medium bg-success/10 p-3 rounded-lg">
                  {foundStore}
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecionando para o cardápio...
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;