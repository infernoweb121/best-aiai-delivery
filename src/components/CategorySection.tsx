import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

interface CategorySectionProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategorySection = ({ categories, selectedCategory, onSelectCategory }: CategorySectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-2xl shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-primary">Categorias</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`flex-shrink-0 p-4 rounded-xl transition-all duration-300 min-w-[140px] ${
              selectedCategory === category.id
                ? 'bg-gradient-primary text-primary-foreground shadow-primary scale-105'
                : 'bg-card hover:bg-muted/50 text-card-foreground hover:scale-102'
            }`}
          >
            <div className="text-center space-y-2">
              <div className="text-3xl">{category.icon}</div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">{category.name}</h3>
                <p className={`text-xs ${
                  selectedCategory === category.id 
                    ? 'text-primary-foreground/80' 
                    : 'text-muted-foreground'
                }`}>
                  {category.description}
                </p>
              </div>
              {selectedCategory === category.id && (
                <Badge className="bg-accent text-accent-foreground text-xs">
                  Selecionado
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
      
    </div>
  );
};

export default CategorySection;