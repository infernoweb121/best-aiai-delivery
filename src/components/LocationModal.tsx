
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock } from "lucide-react";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationModal = ({ isOpen, onClose }: LocationModalProps) => {
  const [zipCode, setZipCode] = useState("");

  const handleConfirm = () => {
    // Here you would validate the zip code and check delivery area
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Onde você está?
          </DialogTitle>
          <DialogDescription>
            Informe seu CEP para verificarmos se entregamos na sua região
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zipcode">CEP</Label>
            <Input
              id="zipcode"
              placeholder="00000-000"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              maxLength={9}
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Tempo de entrega: 25-35 minutos</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Agora não
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1 gradient-primary text-primary-foreground hover:opacity-90"
            >
              Confirmar localização
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;
