import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, FileText, Banknote, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Invite Buyer',
      icon: UserPlus,
      description: 'Send invite link to a buyer',
      onClick: () => toast.info('Invite buyer feature coming soon'),
    },
    {
      label: 'Create Private Order',
      icon: FileText,
      description: 'Off-platform order tracking',
      onClick: () => toast.info('Private order feature coming soon'),
    },
    {
      label: 'Request Advance',
      icon: Banknote,
      description: 'Request advance payment',
      onClick: () => toast.info('Advance payment feature coming soon'),
    },
    {
      label: 'Generate Invoice',
      icon: Receipt,
      description: 'Create and send invoice',
      onClick: () => toast.info('Invoice generation coming soon'),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all"
              onClick={action.onClick}
            >
              <Icon className="h-5 w-5 text-primary" />
              <div className="text-center">
                <div className="text-xs font-semibold">{action.label}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{action.description}</div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
