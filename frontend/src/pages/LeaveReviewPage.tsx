import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveService } from "@/services/leaveService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";

export function LeaveReviewPage() {
  const [page, setPage] = useState(1);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [comments, setComments] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["leaves-review", page],
    queryFn: () => leaveService.findAll({ page, limit: 10, status: "PENDING" }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leaveService.updateStatus(id, status, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves-review"] });
      toast.success("Leave request updated");
      setReviewOpen(false);
      setComments("");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update"),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Review Leaves</h1>
      <p className="text-muted-foreground">Review and manage pending leave requests</p>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">
                    {leave.user.firstName} {leave.user.lastName}
                  </TableCell>
                  <TableCell>{leave.user.department}</TableCell>
                  <TableCell>{leave.leaveType.name}</TableCell>
                  <TableCell>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">{leave.reason}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={reviewOpen && selectedLeave?.id === leave.id} onOpenChange={(open) => { setReviewOpen(open); if (!open) setSelectedLeave(null); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedLeave(leave); setComments(""); }}>
                            <Eye className="h-4 w-4 mr-1" /> Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review Leave Request</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium">{leave.user.firstName} {leave.user.lastName}</p>
                              <p className="text-sm text-muted-foreground">{leave.leaveType.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                              </p>
                              <p className="text-sm mt-2">{leave.reason}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Comments</Label>
                              <Input value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Optional comments..." />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                className="flex-1"
                                onClick={() => reviewMutation.mutate({ id: leave.id, status: "APPROVED" })}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" /> Approve
                              </Button>
                              <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => reviewMutation.mutate({ id: leave.id, status: "REJECTED" })}
                              >
                                <XCircle className="h-4 w-4 mr-2" /> Reject
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data?.pagination && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= (data?.pagination.totalPages || 1)} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
