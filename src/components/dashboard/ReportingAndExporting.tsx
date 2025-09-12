
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trader } from '@/types';

interface ReportingAndExportingProps {
  traders: Trader[];
}

export const ReportingAndExporting: React.FC<ReportingAndExportingProps> = ({ traders }) => {
  const exportToCSV = () => {
    const headers = Object.keys(traders[0] || {});
    const csvContent = [
      headers.join(','),
      ...traders.map((trader) =>
        headers.map((header) => (trader as any)[header]).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'traders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporting and Exporting</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={exportToCSV}>Export Traders to CSV</Button>
      </CardContent>
    </Card>
  );
};
