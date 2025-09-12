import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ModeToggle } from "../ui/mode-toggle";
import { Menu, User, LogIn, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import SignupForm from "../Auth/SignupForm";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { logout } from "@/store/authSlice"; 
import { useNavigate } from "react-router-dom";

const navItems = [
  {
    label: "National",
    value: "National",
    options: [
      { label: "India", value: "India" },
      { label: "Politics", value: "Politics" },
      { label: "Weather", value: "Weather" },
      { label: "Local", value: "Local" },
    ],
  },
  {
    label: "Entertainment",
    value: "Entertainment",
    options: [
      { label: "Movies", value: "Movies" },
      { label: "TV Shows", value: "TV Shows" },
      { label: "Music", value: "Music" },
      { label: "Celebrities", value: "Celebrities" },
    ],
  },
  {
    label: "Business",
    value: "Business",
    options: [
      { label: "Markets", value: "Markets" },
      { label: "Startups", value: "Startups" },
      { label: "Economy", value: "Economy" },
      { label: "Crypto", value: "Crypto" },
    ],
  },
  {
    label: "Sports",
    value: "Sports",
    options: [
      { label: "Cricket", value: "Cricket" },
      { label: "Football", value: "Football" },
      { label: "Tennis", value: "Tennis" },
      { label: "Olympics", value: "Olympics" },
    ],
  },
  {
    label: "Health",
    value: "Health",
    options: [
      { label: "Fitness", value: "Fitness" },
      { label: "Mental Health", value: "Mental Health" },
      { label: "Nutrition", value: "Nutrition" },
      { label: "COVID-19", value: "COVID-19" },
    ],
  },
  {
    label: "World",
    value: "World",
    options: [
      { label: "Asia", value: "Asia" },
      { label: "Europe", value: "Europe" },
      { label: "US", value: "US" },
      { label: "Africa", value: "Africa" },
    ],
  },
  {
    label: "Tech",
    value: "Technology", // backend value
    options: [
      { label: "AI", value: "Artificial Intelligence" }, // backend value
      { label: "Apps", value: "Apps" },
      { label: "Gadgets", value: "Gadgets" },
      { label: "Startups", value: "Startups" },
    ],
  },
  {
    label: "Videos",
    value: "Videos",
    options: [
      { label: "Interviews", value: "Interviews" },
      { label: "Shorts", value: "Shorts" },
      { label: "News Clips", value: "News Clips" },
      { label: "Trending", value: "Trending" },
    ],
  },
];

interface HeaderProps {
  onFilterChange?: (category: string, subcategory: string) => void;
}

const Header = ({ onFilterChange }: HeaderProps)  => {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
 
  const [showModal, setShowModal] = useState(false);

  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const isAuthenticated = !!token;

  // Navigation handlers
  const handleLogin = () => {
    setShowModal(true);      
    setIsMobileOpen(false);   
    setShowUserMenu(false); 
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showModal]);

  const handleSignup = () => {
    setShowModal(true);      
    setIsMobileOpen(false);   
    setShowUserMenu(false); 
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // CHANGE the handleLogout function to:
  const handleLogout = () => {
    dispatch(logout()); 
    setShowUserMenu(false);
    navigate("/");
  };
  
  const handleProfile = () => {
    console.log("Navigate to profile page");
    setShowUserMenu(false);
  };

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm sticky top-0 z-50">
      <div className="text-lg font-bold">ABI News</div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-1 lg:gap-2 flex-wrap">
        {navItems.map((item) => (
          <Popover
            key={item.label}
            open={openPopover === item.label}
            onOpenChange={(open) => {
              if (!open) setOpenPopover(null);
            }}
          >
            <div
              onMouseEnter={() => setOpenPopover(item.label)}
              onMouseLeave={() => setOpenPopover(null)}
              className="relative"
            >
              <PopoverTrigger asChild>
                <Button variant="ghost" className="capitalize">
                  {item.label}
                </Button>
              </PopoverTrigger>
              <PopoverContent sideOffset={4} className="w-48 p-1">
                <ul className="space-y-1">
                  {item.options.map((option) => (
                    <li key={option.value}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left"
                        onClick={() => {
                          onFilterChange?.(item.value, option.value);
                          setOpenPopover(null);
                          console.log("clicked:", item.value, option.value);
                        }}
                      >
                        {option.label}
                      </Button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </div>
          </Popover>
        ))}
      </nav>

      {/* Right Section - Auth & Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ModeToggle />

        {/* Desktop Auth Section */}
        <div className="hidden sm:flex items-center gap-2">
          {isAuthenticated ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-medium hidden lg:block">
                  {user?.name || 'User'}
                </span>
              </Button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-1 w-48 bg-popover border rounded-md shadow-lg z-50"
                  >
                    <div className="p-1">
                      <Button
                        variant="ghost"
                        onClick={handleProfile}
                        className="w-full justify-start"
                      >
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => console.log('Settings')}
                        className="w-full justify-start"
                      >
                        Settings
                      </Button>
                      <div className="border-t my-1" />
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-100"
                      >
                        Logout
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogin}
                className="flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden lg:inline">Login</span>
              </Button>
              <Button
                size="sm"
                onClick={handleSignup}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden lg:inline">Sign Up</span>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isMobileOpen} onOpenChange={(open) => {
          setIsMobileOpen(open);
          if (!open) setOpenMobileDropdown(null);
        }}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">ABI News</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileOpen(false)}
                    className="h-8 w-8"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const isOpen = openMobileDropdown === item.label;
                  return (
                    <div key={item.label}>
                      <Button
                        variant="ghost"
                        className="w-full justify-between"
                        onClick={() => setOpenMobileDropdown(isOpen ? null : item.label)}
                      >
                        {item.label}
                        <span className="text-lg">{isOpen ? "−" : "+"}</span>
                      </Button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 pl-2 border-l border-muted space-y-1 overflow-hidden"
                          >
                            {item.options.map((option) => (
                              <Button
                                key={option.value}
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => {
                                  onFilterChange?.(item.value, option.value);
                                  setIsMobileOpen(false);
                                  console.log("clicked:", item.value, option.value);
                                }}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Auth Section */}
              <div className="p-4 border-t">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      onClick={handleProfile}
                      className="w-full justify-start gap-3"
                    >
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="font-medium">{user?.name || 'Profile'}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-100"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleLogin}
                      className="flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                    <Button
                      onClick={handleSignup}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Signup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <SignupForm />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;