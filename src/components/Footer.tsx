import { Instagram } from 'lucide-react'; 

export function Footer() {
  // Define social media links and icons
  const socialLinks = [
    { 
      name: 'Instagram', 
      // UPDATED URL HERE:
      href: 'https://www.instagram.com/trio.collection03?igsh=MXAxYWptN2x1ajZ1eg==', 
      icon: Instagram 
    },
  ];

  return (
    <footer className="bg-muted mt-20 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold font-serif mb-4">Trio Collection</h3>
            <p className="text-sm text-muted-foreground">
              Premium men's fashion for the modern gentleman.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/shop" className="hover:text-foreground transition-colors">Shop</a></li>
              <li><a href="/cart" className="hover:text-foreground transition-colors">Cart</a></li>
              <li><a href="/admin" className="hover:text-foreground transition-colors">Admin</a></li>
            </ul>
          </div>
          
          {/* Contact - UPDATED SECTION */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm text-muted-foreground">
              {/* Email */}
              Email: rohankakde25@gmail.com
            </p>
            
            <p className="text-sm text-muted-foreground mt-2">
              {/* Simplified Phone Label */}
              Phone:
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              {/* Only the numbers, each on a new line */}
              <p>
                <a href="tel:+919372961475" className="hover:text-foreground">+91 93729 61475</a>
              </p>
              <p>
                <a href="tel:+918104252280" className="hover:text-foreground">+91 81042 52280</a>
              </p>
              <p>
                <a href="tel:+918355891102" className="hover:text-foreground">+91 83558 91102</a>
              </p>
            </div>
          </div>
          
          {/* Social Media Section */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href} 
                  aria-label={`Follow us on ${link.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <link.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
          
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Trio Collection. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}