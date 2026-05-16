import { Link } from "react-router-dom";
import { Globe, Facebook, Twitter, Linkedin, Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-6 w-6 text-secondary" />
              <span className="text-xl font-bold">Tradevithika</span>
            </div>
            <p className="text-sm text-primary-foreground/80 mb-4">
              India's premier B2B export marketplace connecting verified manufacturers with global buyers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Suppliers */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For Suppliers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  Join as Supplier
                </Link>
              </li>
              <li>
                <Link to="/supplier-benefits" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  Supplier Benefits
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 text-secondary" />
                <span>support@tradevithika.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 text-secondary" />
                <span>+91-1800-123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-primary-foreground/80">
              © 2024 Indimart Global. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                Terms of Service
              </Link>
              <Link to="/legal" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                Legal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
