import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, FileText, Banknote, Receipt, Globe, Library, Package, MessageSquare, TrendingUp, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const QuickActions = () => {
  const navigate = useNavigate();

  const businessActions = [
    {
      label: 'Invite Buyer',
      icon: UserPlus,
      description: 'Send invite link',
      onClick: () => toast.info('Invite buyer feature coming soon'),
    },
    {
      label: 'Custom Quote',
      icon: FileText,
      description: 'Send quote to buyer',
      onClick: () => navigate('/supplier/private-order'),
    },
    {
      label: 'Request Advance',
      icon: Banknote,
      description: 'Advance payment',
      onClick: () => toast.info('Advance payment feature coming soon'),
    },
    {
      label: 'Generate Invoice',
      icon: Receipt,
      description: 'Create & send',
      onClick: () => navigate('/supplier/generate-invoice'),
    },
  ];

  const navLinks = [
    { label: 'Add Product', icon: Plus, to: '/supplier/add-product' },
    { label: 'Product Library', icon: Library, to: '/supplier/product-library' },
    { label: 'RFQ Inbox', icon: FileText, to: '/supplier/rfq-inbox' },
    { label: 'Orders', icon: Package, to: '/supplier/orders' },
    { label: 'Messages', icon: MessageSquare, to: '/messages' },
    { label: 'Analytics', icon: TrendingUp, to: '/analytics' },
    { label: 'Vendor OS', icon: Globe, to: '/supplier/vendor-os', highlight: true },
  ];

  return (
    <div className="space-y-4">
      {/* Business Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {businessActions.map((action) => {
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

      {/* Navigation Shortcuts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Tools & Navigation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.label}
                asChild
                variant="outline"
                className={`h-auto py-3 flex-col gap-1.5 text-xs ${
                  link.highlight
                    ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                    : ''
                }`}
              >
                <Link to={link.to}>
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;
