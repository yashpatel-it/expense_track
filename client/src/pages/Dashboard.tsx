import { useMemo } from "react";
import { format } from "date-fns";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { TrendingUp, Wallet, ArrowUpRight, DollarSign, Calendar } from "lucide-react";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { useExpenseStats } from "@/hooks/use-expenses";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];

export default function Dashboard() {
  const currentDate = new Date();
  const { data: stats, isLoading } = useExpenseStats({ 
    month: currentDate.getMonth() + 1, 
    year: currentDate.getFullYear() 
  });

  const formattedTotal = useMemo(() => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(stats?.total || 0);
  }, [stats?.total]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview for {format(currentDate, 'MMMM yyyy')}</p>
        </div>
        <AddExpenseDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Expenses</span>
            </div>
            <h3 className="text-4xl font-display font-bold text-foreground">{formattedTotal}</h3>
            <div className="flex items-center gap-2 mt-4 text-sm text-green-600 font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>Spending on track</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-accent/10 rounded-xl text-accent">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Category</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground truncate">
              {stats?.byCategory?.[0]?.category || "None"}
            </h3>
            <p className="text-muted-foreground mt-1">
              Most spending this month
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-500/10 rounded-xl text-green-600">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Transactions</span>
            </div>
            <h3 className="text-4xl font-display font-bold text-foreground">
              {stats?.byCategory.reduce((acc, curr) => acc + curr.count, 0) || 0}
            </h3>
            <p className="text-muted-foreground mt-1">Total items recorded</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Bar Chart */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 h-[400px]">
          <h3 className="text-lg font-bold font-display mb-6">Spending Trend</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={stats?.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 12, fill: '#64748b'}} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => format(new Date(val), 'd MMM')}
              />
              <YAxis 
                tick={{fontSize: 12, fill: '#64748b'}} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <RechartsTooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 h-[400px]">
          <h3 className="text-lg font-bold font-display mb-6">Expenses by Category</h3>
          {stats?.byCategory && stats.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={stats.byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {stats.byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <RechartsTooltip 
                   formatter={(value: number) => `₹${value}`}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{fontSize: '12px', fontWeight: 500}}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground pb-12">
              <PieChart className="w-12 h-12 mb-2 opacity-20" />
              <p>No data to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] rounded-2xl" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    </div>
  );
}
