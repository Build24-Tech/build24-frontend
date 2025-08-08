'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { DataExporter, ExportOptions } from '@/lib/export-utils';
import { ReportService } from '@/lib/report-service';
import { ProjectData, UserProgress } from '@/types/launch-essentials';
import { BarChart3, Download, FileText, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

interface ExportReportPanelProps {
  projectData: ProjectData;
  progress: UserProgress;
  className?: string;
}

export function ExportReportPanel({ projectData, progress, className }: ExportReportPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'pdf' | 'csv' | 'markdown'>('pdf');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('executive-summary');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [stakeholderView, setStakeholderView] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const { toast } = useToast();
  const templates = ReportService.getTemplates();

  const formatIcons = {
    json: FileText,
    pdf: FileText,
    csv: BarChart3,
    markdown: FileText
  };

  const formatDescriptions = {
    json: 'Machine-readable data format',
    pdf: 'Professional document format',
    csv: 'Spreadsheet-compatible format',
    markdown: 'Documentation-friendly format'
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format: selectedFormat,
        includeCharts,
        stakeholderView,
        sections: selectedSections.length > 0 ? selectedSections : undefined
      };

      const result = await DataExporter.exportProject(projectData, progress, options);

      // Create download link
      const url = URL.createObjectURL(
        typeof result.data === 'string'
          ? new Blob([result.data], { type: result.mimeType })
          : result.data
      );

      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Project data exported as ${selectedFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your project data.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await ReportService.generateReport(
        projectData,
        progress,
        selectedTemplate,
        {
          format: selectedFormat,
          includeCharts,
          stakeholderView
        }
      );

      // Convert report to downloadable format
      const content = selectedFormat === 'json'
        ? JSON.stringify(report, null, 2)
        : report.content.executiveSummary; // Simplified for demo

      const blob = new Blob([content], {
        type: selectedFormat === 'json' ? 'application/json' : 'text/plain'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.title.replace(/\s+/g, '-').toLowerCase()}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Report Generated',
        description: `${report.title} has been generated successfully`,
      });
    } catch (error) {
      console.error('Report generation failed:', error);
      toast({
        title: 'Report Generation Failed',
        description: 'There was an error generating your report.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  const getTemplateIcon = (audience: string) => {
    switch (audience) {
      case 'stakeholder': return Users;
      case 'investor': return TrendingUp;
      case 'internal': return BarChart3;
      default: return FileText;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Export your project data in various formats for backup or external analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={selectedFormat} onValueChange={(value: any) => setSelectedFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(formatDescriptions).map(([format, description]) => {
                    const Icon = formatIcons[format as keyof typeof formatIcons];
                    return (
                      <SelectItem key={format} value={format}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{format.toUpperCase()}</div>
                            <div className="text-xs text-muted-foreground">{description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Export Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charts"
                    checked={includeCharts}
                    onCheckedChange={setIncludeCharts}
                  />
                  <Label htmlFor="include-charts" className="text-sm">
                    Include charts and visualizations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stakeholder-view"
                    checked={stakeholderView}
                    onCheckedChange={setStakeholderView}
                  />
                  <Label htmlFor="stakeholder-view" className="text-sm">
                    Stakeholder-friendly view (hide sensitive data)
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? 'Exporting...' : 'Export Project Data'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Report Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Generation
          </CardTitle>
          <CardDescription>
            Generate professional reports with insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-template">Report Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => {
                  const Icon = getTemplateIcon(template.targetAudience);
                  return (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplateData && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Template Details</Label>
                <Badge variant="outline">
                  {selectedTemplateData.targetAudience}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedTemplateData.description}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Included Sections:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTemplateData.sections.map((section) => (
                    <div key={section.id} className="flex items-center gap-2">
                      <Badge
                        variant={section.required ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {section.title}
                      </Badge>
                      {section.required && (
                        <span className="text-xs text-muted-foreground">Required</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="w-full"
          >
            {isGeneratingReport ? 'Generating Report...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Export Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {Object.keys(progress.phases).length}
              </div>
              <div className="text-sm text-muted-foreground">Phases</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Object.values(progress.phases).reduce(
                  (total, phase) => total + phase.steps.length, 0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Steps</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Object.values(progress.phases).reduce(
                  (total, phase) => total + phase.steps.filter(s => s.status === 'completed').length, 0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Math.round(
                  Object.values(progress.phases).reduce(
                    (total, phase) => total + phase.completionPercentage, 0
                  ) / Object.keys(progress.phases).length
                )}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
