import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isCustomizable?: boolean;
  isPromo?: boolean;
  originalPrice?: number;
  ingredients?: string[];
  extras?: { name: string; price: number }[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, customizations?: any) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = () => {
    onAddToCart(product);
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card className={`product-card group cursor-pointer ${product.isPromo ? 'promo-card' : ''}`}>
      <CardHeader className="pb-2 relative">
        <div className="relative overflow-hidden rounded-lg mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover transition-smooth group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400&h=300&fit=crop&crop=center';
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white transition-smooth"
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
          </Button>
          
          {product.isPromo && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground font-semibold">
              PROMOÇÃO
            </Badge>
          )}
        </div>
        
        <CardTitle className={`text-lg font-bold ${product.isPromo ? 'text-accent-foreground' : 'text-card-foreground'}`}>
          {product.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className={`text-sm ${product.isPromo ? 'text-accent-foreground/80' : 'text-muted-foreground'}`}>
          {product.description}
        </p>
        
        {product.ingredients && product.ingredients.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Ingredientes:</p>
            <div className="flex flex-wrap gap-1">
              {product.ingredients.slice(0, 3).map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {ingredient}
                </Badge>
              ))}
              {product.ingredients.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{product.ingredients.length - 3} mais
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {product.originalPrice && (
              <p className="text-sm line-through text-muted-foreground">
                {formatPrice(product.originalPrice)}
              </p>
            )}
            <p className={`text-xl font-bold ${product.isPromo ? 'text-accent-foreground' : 'text-primary'}`}>
              {formatPrice(product.price)}
            </p>
          </div>
          
          <Button
            onClick={handleAddToCart}
            className={`${
              product.isPromo 
                ? 'bg-accent-foreground text-accent hover:bg-accent-foreground/90' 
                : 'gradient-primary hover:opacity-90 text-primary-foreground'
            } rounded-full transition-bounce`}
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {product.isCustomizable && (
          <Badge variant="outline" className="w-full justify-center py-1 text-xs">
            ✨ Personalizável
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;