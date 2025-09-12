import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "../ui/mode-toggle";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail,
  MapPin,
  Phone,
  Send
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerSections = [
    {
      title: "Categories",
      links: [
        { label: "National", href: "#" },
        { label: "Entertainment", href: "#" },
        { label: "Business", href: "#" },
        { label: "Sports", href: "#" },
        { label: "Health", href: "#" },
        { label: "World", href: "#" },
        { label: "Tech", href: "#" },
        { label: "Videos", href: "#" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Advertise", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Cookie Policy", href: "#" },
        { label: "Accessibility", href: "#" },
        { label: "Contact", href: "#" },
      ]
    },
    {
      title: "Connect",
      links: [
        { label: "Facebook", href: "#", icon: <Facebook className="w-4 h-4" /> },
        { label: "Twitter", href: "#", icon: <Twitter className="w-4 h-4" /> },
        { label: "Instagram", href: "#", icon: <Instagram className="w-4 h-4" /> },
        { label: "YouTube", href: "#", icon: <Youtube className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <footer className="bg-background border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand Section */}
        <div className="lg:col-span-2">
          <div className="text-2xl font-bold mb-4">ABI News</div>
          <p className="text-muted-foreground mb-6 max-w-md">
            Delivering accurate and timely news from around the world. 
            Stay informed with our comprehensive coverage of national and international events.
          </p>
          
          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">123 News Street, City, Country</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">contact@abinews.com</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        {footerSections.map((section, index) => (
          <div key={index}>
            <h3 className="font-semibold mb-4 text-lg">{section.title}</h3>
            <ul className="space-y-2">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <a 
                    href={link.href} 
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    {/* {link.icon && link.icon} */}
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter Subscription */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Newsletter</h3>
          <p className="text-muted-foreground mb-4">
            Subscribe to our newsletter for the latest news and updates.
          </p>
          <div className="flex flex-col gap-2">
            <Input 
              type="email" 
              placeholder="Your email address" 
              className="bg-muted"
            />
            <Button className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} ABI News. All rights reserved.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Theme:</span>
                <ModeToggle />
              </div>
              
              <div className="flex items-center gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Privacy Policy
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;