import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Purchasing Manager, UK",
    company: "Global Imports Ltd",
    content: "Indimart Global connected us with reliable textile suppliers in India. The quality and pricing exceeded our expectations. Highly recommend!",
    rating: 5,
  },
  {
    name: "Rajesh Kumar",
    role: "Export Director",
    company: "Heritage Handicrafts",
    content: "Since joining Indimart Global, we've expanded to 15 new countries. The platform made it easy to reach genuine international buyers.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Procurement Head, USA",
    company: "TechParts America",
    content: "Finding verified Indian manufacturers was always challenging. Indimart Global solved that problem with their detailed supplier profiles.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what buyers and suppliers say about their experience with Indimart Global
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 hover:border-secondary transition-colors">
              <CardContent className="p-6">
                <Quote className="h-10 w-10 text-secondary/30 mb-4" />
                
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="border-t border-border pt-4">
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-sm font-medium text-secondary">{testimonial.company}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
