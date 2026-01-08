import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Search, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Expenses() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: expenses, isLoading } = useExpenses({
    month: selectedMonth,
    year: selectedYear,
    category: categoryFilter !== "all" ? categoryFilter : undefined
  });

  const deleteExpense = useDeleteExpense();

  const handleMonthChange = (val: string) => setSelectedMonth(parseInt(val));
  const handleYearChange = (val: string) => setSelectedYear(parseInt(val));

  return (
    <div className="space-y-8 animate-in pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">Manage and track your transactions</p>
        </div>
        <AddExpenseDialog />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground w-full md:w-auto">
          <Filter className="w-4 h-4" /> Filters:
        </div>
        
        <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-full md:w-[150px] rounded-xl border-border bg-background">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {MONTHS.map((month, idx) => (
              <SelectItem key={month} value={(idx + 1).toString()}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-full md:w-[120px] rounded-xl border-border bg-background">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {[2023, 2024, 2025].map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px] rounded-xl border-border bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
            <SelectItem value="Bills">Bills</SelectItem>
            <SelectItem value="Housing">Housing</SelectItem>
            <SelectItem value="Utilities">Utilities</SelectItem>
            <SelectItem value="Movie">Movie</SelectItem>
            <SelectItem value="Gadgets">Gadgets</SelectItem>
            <SelectItem value="Clothes">Clothes</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-semibold text-foreground pl-6">Date</TableHead>
              <TableHead className="font-semibold text-foreground">Title</TableHead>
              <TableHead className="font-semibold text-foreground">Category</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : expenses && expenses.length > 0 ? (
              expenses.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="pl-6 text-muted-foreground font-medium">
                    {format(new Date(expense.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{expense.title}</div>
                    {expense.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {expense.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-secondary-foreground/10">
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-foreground">
                    ₹{expense.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the expense entry.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteExpense.mutate(expense.id)}
                            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                  No expenses found for this period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
