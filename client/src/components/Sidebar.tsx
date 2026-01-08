import { Link, useLocation } from "wouter";
import { LayoutDashboard, Receipt, FileBarChart, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/reports", label: "Reports", icon: FileBarChart },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 p-4 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-6 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25">
          <PieChart className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight text-foreground">FinTrack</h1>
          <p className="text-xs text-muted-foreground font-medium">Expense Manager</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group",
              isActive 
                ? "bg-primary/10 text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
              <Icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white mt-auto shadow-xl shadow-slate-900/10">
        <h4 className="font-semibold text-sm mb-1">Pro Tip</h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          Regularly categorize expenses to get better insights in your monthly reports.
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
