
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface CustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerInfo: CustomerInfo) => void;
  isLoading?: boolean;
}

const CustomerInfoModal = ({ isOpen, onClose, onConfirm, isLoading }: CustomerInfoModalProps) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    cpf: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerInfo.name && customerInfo.email && customerInfo.phone && customerInfo.cpf) {
      onConfirm(customerInfo);
    }
  };

  const isValid = customerInfo.name && customerInfo.email && customerInfo.phone && customerInfo.cpf;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Seus dados para entrega
          </DialogTitle>
          <DialogDescription>
            Precisamos dessas informações para processar seu pedido
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Nome completo</Label>
            <Input
              id="customer-name"
              placeholder="Seu nome completo"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer-email">E-mail</Label>
            <Input
              id="customer-email"
              type="email"
              placeholder="seu@email.com"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Telefone</Label>
            <Input
              id="customer-phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer-cpf">CPF</Label>
            <Input
              id="customer-cpf"
              placeholder="000.000.000-00"
              value={customerInfo.cpf}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, cpf: e.target.value }))}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="flex-1 gradient-primary text-primary-foreground hover:opacity-90"
              disabled={!isValid || isLoading}
            >
              {isLoading ? "Processando..." : "Finalizar pedido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerInfoModal;
