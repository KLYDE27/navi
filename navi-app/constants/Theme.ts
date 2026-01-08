import { Home, MessageCircle, Flame, User, Bot, MapPin, ChevronRight, 
  ChevronRightCircle, Send, GraduationCap, MessageCircleQuestionMark, Star,
  Book, CirclePlus, Share, Coffee, Utensils, Printer, 
  UserStar} from "lucide-react-native";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const Spacing = {
  "0": 0,
  "1": 4,   // 4px
  "2": 8,   // 8px
  "3": 12,  // 12px
  "4": 16,  // 16px (Standard)
  "6": 24,
  "8": 32,
  "10": 40,
  "12": 48,
};

export const Typography = {
  // text-xs, text-sm, text-base, etc.
  fontFamily: {
    brand: "ADLaMDisplay", // Brand name
    header: "Inter-Bold",  // Headers
    body: "Lexend-Regular", // Body text
    mono: "SpaceMono-Regular", // need to change
  },
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  }
};

// Easy-to-use Layout Constants
export const Layout = {
  windowWidth: width,
  isSmallDevice: width < 375,
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  }
};

export const Colors = {
  // Primary Palette
  primary: "#0469cd",    // Sapphire Sky (Action color)
  dark: "#141c1e",       // Carbon Black (Text)
  light: "#f8f9fa",      // Bright Snow (Background)
  accent: "#ffe45c",     // Royal Gold (Points/Flame)
  danger: "#d42459",     // Raspberry Red (Errors/Cancel)
  
  // Depth Colors
  navy: "#003061",       // Oxford Navy
  deepNavy: "#00264d",   // Prussian Blue
  softBlue: "#d9e8f7",   // Alice Blue (Card borders/Backgrounds)

  // Functional mapping
  background: "#f8f9fa",
  surface: "#FFFFFF",
  text: "#141c1e",
  textMuted: "#515c5e",
};

export const Gradients = {
  primary: [ "#0469cd", "#003061" ], // Sapphire to Oxford
  gold: [ "#ffe45c", "#f0c419" ],
};

export const Icons = {
  Home,
  Chats: MessageCircle,
  Share: Share,
  Points: Flame,
  Profile: User,
  AI: Bot,
  Location: MapPin,
  Goto: ChevronRight,
  GotoCircle: ChevronRightCircle,
  Send: Send,
  GraduationCap: GraduationCap,
  FAQs: MessageCircleQuestionMark,
  Reward: Star,
  Book: Book,
  Plus: CirclePlus,
  Coffee: Coffee,
  Food: Utensils,
  Printer: Printer,
  Admin: UserStar
};