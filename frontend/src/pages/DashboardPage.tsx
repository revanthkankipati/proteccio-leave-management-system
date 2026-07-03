import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { leaveService } from "@/services/leaveService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Clock, CheckCircle, XCircle } from "lucide-react";

export function DashboardPage() {
  const { user } = useAuth();

  const { data: leavesData } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => leaveService.findAll({ limit: 50 }),
  });

  const { data: balances } = useQuery({
    queryKey: ["leave-balance", user?.id],
    queryFn: () => leaveService.getBalance(user?.id),
  });

  const leaves = leavesData?.data || [];
  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;
  const rejectedCount = leaves.filter((l) => l.status === "REJECTED").length;

  const statsCards = [
    { title: "Total Leaves", value: leaves.length, icon: CalendarCheck, color: "text-blue-600" },
    { title: "Pending", value: pendingCount, icon: Clock, color: "text-yellow-600" },
    { title: "Approved", value: approvedCount, icon: CheckCircle, color: "text-green-600" },
    { title: "Rejected", value: rejectedCount, icon: XCircle, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome back, {user?.firstName}!</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leave Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {balances?.map((balance) => (
                <div key={balance.leaveTypeId} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{balance.leaveTypeName}</p>
                    <p className="text-xs text-muted-foreground">{balance.leaveTypeCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{balance.remainingDays} / {balance.totalDays}</p>
                    <p className="text-xs text-muted-foreground">{balance.usedDays} used</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaves.slice(0, 5).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{leave.leaveType.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={leave.status === "APPROVED" ? "success" : leave.status === "REJECTED" ? "destructive" : "warning"}>
                    {leave.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
