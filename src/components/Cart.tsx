import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react";
import { Product } from "./ProductCard";

interface CartItem extends Product {
  quantity: number;
  customizations?: any;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

const Cart = ({ items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    onCheckout();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 z-50 gradient-primary hover:opacity-90 text-primary-foreground shadow-primary rounded-full p-4 h-auto min-w-[60px] min-h-[60px]">
          <div className="flex items-center gap-2">
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs min-w-[20px] h-5 flex items-center justify-center p-0">
                  {getTotalItems()}
                </Badge>
              )}
            </div>
            {getTotalItems() > 0 && (
              <span className="font-semibold hidden sm:block">
                {formatPrice(getTotalPrice())}
              </span>
            )}
          </div>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Seu Carrinho
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-6xl opacity-50">🛒</div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">
                  Seu carrinho está vazio
                </h3>
                <p className="text-muted-foreground">
                  Adicione alguns deliciosos produtos do nosso cardápio!
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="bg-card rounded-lg p-4 shadow-card">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-card-foreground">{item.name}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => onRemoveItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-primary">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.price)} cada
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({getTotalItems()} itens)</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de entrega</span>
                    <span className="text-success">Grátis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full gradient-accent hover:opacity-90 text-accent-foreground font-semibold py-3 text-lg rounded-xl transition-smooth"
                  onClick={handleCheckout}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Finalizar Pedido
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;