import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import LocationModal from "@/components/LocationModal";
import ProductCard, { Product } from "@/components/ProductCard";
import Cart from "@/components/Cart";
import CategorySection, { Category } from "@/components/CategorySection";
import { useToast } from "@/hooks/use-toast";

// Importando as imagens
import heroAcai from "@/assets/hero-acai.jpg";
import iceCreamCollection from "@/assets/ice-cream-collection.jpg";
import tropicalDrinks from "@/assets/tropical-drinks.jpg";

const Index = () => {
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const categories: Category[] = [
    { id: "all", name: "Todos", icon: "🍽️", description: "Ver tudo", color: "primary" },
    { id: "acai", name: "Açaí", icon: "🫐", description: "Tradicional", color: "primary" },
    { id: "sorvete", name: "Sorvetes", icon: "🍦", description: "Gelados", color: "secondary" },
    { id: "bebidas", name: "Bebidas", icon: "🥤", description: "Refrescantes", color: "accent" },
    { id: "doces", name: "Doces", icon: "🍭", description: "Deliciosos", color: "warning" },
    { id: "promocoes", name: "Promoções", icon: "🔥", description: "Imperdível", color: "destructive" },
  ];

  const allProducts: Product[] = [
    // Açaís
    {
      id: "1",
      name: "Açaí Tradicional",
      description: "Açaí puro e cremoso, a base perfeita para sua sobremesa",
      price: 12.90,
      image: heroAcai,
      category: "acai",
      isCustomizable: true,
      ingredients: ["Açaí", "Guaraná natural"],
      extras: [
        { name: "Granola", price: 2.00 },
        { name: "Banana", price: 1.50 },
        { name: "Morango", price: 2.50 },
        { name: "Leite condensado", price: 1.00 },
      ]
    },
    {
      id: "2",
      name: "Açaí Premium",
      description: "Açaí especial com frutas selecionadas e complementos gourmet",
      price: 18.90,
      image: heroAcai,
      category: "acai",
      isCustomizable: true,
      ingredients: ["Açaí premium", "Frutas vermelhas", "Granola artesanal"],
      extras: [
        { name: "Castanha do Pará", price: 3.00 },
        { name: "Chocolate 70%", price: 2.50 },
        { name: "Coco ralado", price: 1.50 },
      ]
    },
    {
      id: "3",
      name: "Açaí Fitness",
      description: "Versão saudável com zero açúcar e proteína",
      price: 16.90,
      image: heroAcai,
      category: "acai",
      isCustomizable: true,
      ingredients: ["Açaí zero açúcar", "Whey protein", "Aveia"],
    },
    // Sorvetes
    {
      id: "4",
      name: "Sorvete Tropical",
      description: "Mix de sabores tropicais em uma casquinha crocante",
      price: 8.90,
      image: iceCreamCollection,
      category: "sorvete",
      isCustomizable: true,
      ingredients: ["Sorvete de manga", "Sorvete de coco", "Casquinha"],
    },
    {
      id: "5",
      name: "Sundae Best",
      description: "Sorvete cremoso com calda especial e chantilly",
      price: 14.90,
      image: iceCreamCollection,
      category: "sorvete",
      isCustomizable: true,
      isPromo: true,
      originalPrice: 18.90,
      ingredients: ["Sorvete artesanal", "Calda especial", "Chantilly"],
    },
    // Bebidas
    {
      id: "6",
      name: "Smoothie Tropical",
      description: "Bebida refrescante com frutas da estação",
      price: 9.90,
      image: tropicalDrinks,
      category: "bebidas",
      ingredients: ["Manga", "Maracujá", "Água de coco"],
    },
    {
      id: "7",
      name: "Suco Detox",
      description: "Combinação verde energizante e saudável",
      price: 11.90,
      image: tropicalDrinks,
      category: "bebidas",
      ingredients: ["Couve", "Limão", "Gengibre", "Maçã verde"],
    },
    // Doces
    {
      id: "8",
      name: "Brownie da Casa",
      description: "Brownie artesanal com chocolate belga",
      price: 7.90,
      image: iceCreamCollection,
      category: "doces",
      ingredients: ["Chocolate belga", "Nozes", "Açúcar cristal"],
    },
    // Promoções
    {
      id: "9",
      name: "Combo Família",
      description: "2 açaís grandes + 2 bebidas + 1 doce",
      price: 39.90,
      originalPrice: 55.90,
      image: heroAcai,
      category: "promocoes",
      isPromo: true,
    }
  ];

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product, customizations?: any) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, customizations }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    toast({
      title: "Redirecionando para pagamento...",
      description: "Você será direcionado para finalizar seu pedido",
    });
    // Aqui seria implementado o redirecionamento para página de pagamento
  };

  return (
    <>
      <LocationModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)} 
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-gradient-hero text-primary-foreground shadow-primary">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🫐</div>
                <div>
                  <h1 className="text-2xl font-bold">Best Açaí</h1>
                  <div className="flex items-center gap-1 text-sm opacity-90">
                    <MapPin className="w-3 h-3" />
                    <span>Shopping Center - 2,3 km</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:block">25-35 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold gradient-hero bg-clip-text text-transparent animate-fade-in">
                O melhor açaí da cidade! 🫐
              </h2>
              <p className="text-xl text-muted-foreground animate-fade-in">
                Sabores únicos, ingredientes frescos e muito amor em cada tigela
              </p>
              
              {/* Search Bar */}
              <div className="max-w-md mx-auto relative animate-scale-in">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-6 text-lg rounded-2xl border-2 focus:ring-primary shadow-card"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <CategorySection
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </section>

        {/* Promoções Especiais */}
        {selectedCategory === "all" || selectedCategory === "promocoes" ? (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="bg-gradient-accent rounded-2xl p-6 text-accent-foreground mb-8 shadow-accent">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">🔥 Promoções Especiais</h3>
                    <p className="text-accent-foreground/80">
                      Aproveite nossas ofertas imperdíveis!
                    </p>
                  </div>
                  <Badge className="bg-accent-foreground text-accent font-bold px-4 py-2">
                    ATÉ 30% OFF
                  </Badge>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Products Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-primary">
                {selectedCategory === "all" 
                  ? "Todos os Produtos" 
                  : categories.find(cat => cat.id === selectedCategory)?.name
                }
              </h3>
              <Badge variant="secondary" className="text-sm">
                {filteredProducts.length} produtos
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard
                    product={product}
                    onAddToCart={addToCart}
                  />
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <div className="text-6xl opacity-50">🔍</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    Tente ajustar sua busca ou escolher uma categoria diferente
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchTerm("");
                  }}
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                >
                  Ver todos os produtos
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Cart */}
        <Cart
          items={cartItems}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
        />
      </div>
    </>
  );
};

export default Index;