import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface RecipeCardProps {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  author_name: string | null;
  avg_rating?: number;
  categories?: string[];
}

const RecipeCard = ({ id, title, description, image_url, prep_time, cook_time, servings, author_name, avg_rating, categories }: RecipeCardProps) => {
  const totalTime = (prep_time || 0) + (cook_time || 0);

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link to={`/recipes/${id}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            {image_url ? (
              <img src={image_url} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
                <span className="text-4xl">🍽️</span>
              </div>
            )}
          </div>
          <CardContent className="p-4 space-y-2">
            {categories && categories.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {categories.slice(0, 2).map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                ))}
              </div>
            )}
            <h3 className="font-serif font-semibold text-lg line-clamp-1">{title}</h3>
            {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              {totalTime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {totalTime} min
                </span>
              )}
              {servings && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {servings}
                </span>
              )}
              {avg_rating && avg_rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" /> {avg_rating.toFixed(1)}
                </span>
              )}
            </div>
            {author_name && <p className="text-xs text-muted-foreground">by {author_name}</p>}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default RecipeCard;
