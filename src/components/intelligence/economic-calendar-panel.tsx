import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

type EconomicCalendarPanelProps = {
  content: string[];
};

export default function EconomicCalendarPanel({ content }: EconomicCalendarPanelProps) {
  return (
    <Card className="tactical-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Economic Intel</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {content.map((item, index) => (
            <li key={index} className="text-sm text-muted-foreground list-disc list-inside marker:text-primary/50">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
