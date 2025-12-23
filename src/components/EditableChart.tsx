import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChartData } from '@/types';
import { Edit2, Check, X, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface EditableChartProps {
  data: ChartData[];
  onUpdateValue: (chartId: string, newValue: number) => void;
}

export function EditableChart({ data, onUpdateValue }: EditableChartProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    chartId: string;
    newValue: number;
    oldValue: number;
    name: string;
  } | null>(null);
  const { toast } = useToast();

  const handleEdit = (item: ChartData) => {
    setEditingId(item.id);
    setEditValue(item.value.toString());
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSave = (item: ChartData) => {
    const newValue = parseFloat(editValue);
    
    if (isNaN(newValue) || newValue < 0) {
      toast({
        title: 'Invalid value',
        description: 'Please enter a valid positive number',
        variant: 'destructive',
      });
      return;
    }

    if (item.previousValue !== undefined) {
      // Show confirmation dialog if there's a previous value
      setConfirmDialog({
        open: true,
        chartId: item.id,
        newValue,
        oldValue: item.value,
        name: item.name,
      });
    } else {
      // First edit, no confirmation needed
      onUpdateValue(item.id, newValue);
      setEditingId(null);
      setEditValue('');
      toast({
        title: 'Value updated',
        description: `${item.name} has been updated to ${newValue}`,
      });
    }
  };

  const handleConfirmOverwrite = () => {
    if (!confirmDialog) return;
    
    onUpdateValue(confirmDialog.chartId, confirmDialog.newValue);
    setEditingId(null);
    setEditValue('');
    toast({
      title: 'Value overwritten',
      description: `${confirmDialog.name} has been updated to ${confirmDialog.newValue}`,
    });
    setConfirmDialog(null);
  };

  return (
    <>
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Editable Metrics</CardTitle>
          <CardDescription className="text-muted-foreground">
            Click edit to modify values. Previous values will be shown for reference.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30 hover:border-border/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.name}</p>
                  {item.previousValue !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Previous: {item.previousValue.toLocaleString()}
                    </p>
                  )}
                </div>
                
                {editingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 h-8 text-right bg-background border-border"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleSave(item)}
                      className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCancel}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground tabular-nums">
                      {item.name.includes('Satisfaction') ? `${item.value}%` : item.value.toLocaleString()}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDialog?.open} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Confirm Overwrite
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will overwrite the existing value. The current value will be saved as "previous value".
            </DialogDescription>
          </DialogHeader>
          
          {confirmDialog && (
            <div className="py-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{confirmDialog.name}</span>
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="text-lg font-semibold text-foreground">{confirmDialog.oldValue.toLocaleString()}</p>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex-1 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary">New</p>
                  <p className="text-lg font-semibold text-primary">{confirmDialog.newValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmOverwrite} className="gradient-primary text-primary-foreground">
              Confirm Overwrite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
