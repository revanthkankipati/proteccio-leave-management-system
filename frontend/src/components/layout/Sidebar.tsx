import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, CalendarCheck, Users, CheckSquare, Calendar } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leaves", label: "My Leaves", icon: Calendar },
  { to: "/leaves/review", label: "Review Leaves", icon: CheckSquare, managerOnly: true },
  { to: "/employees", label: "Employees", icon: Users, managerOnly: true },
];

export function Sidebar() {
  const { isManager } = useAuth();

  return (
    <aside className="flex w-64 flex-col border-r bg-muted/10">
      <div className="flex h-16 items-center border-b px-6">
        <CalendarCheck className="mr-2 h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Proteccio</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems
          .filter((item) => !item.managerOnly || isManager)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
