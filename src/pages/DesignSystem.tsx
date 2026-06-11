import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Code, MoveLeft, Plus, Send, Share2, CheckCircle2, AlertCircle, Trash2, Settings, ExternalLink, Layers } from 'lucide-react';
import Typography from '../components/ui/Typography';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardActions, CardMedia } from '../components/ui/Card';
import Snackbar, { SnackbarSeverity } from '../components/ui/Snackbar';
import { Tabs, Tab, TabPanel } from '../components/ui/Tab';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '../components/ui/Dialog';
import BottomSheet from '../components/ui/BottomSheet';
import { CircularProgress, LinearProgress } from '../components/ui/Loading';
import ToggleButtonGroup, { ToggleButton } from '../components/ui/Toggle';
import RadioGroup, { Radio } from '../components/ui/Radio';
import Checkbox from '../components/ui/Checkbox';
import Switch from '../components/ui/Switch';
import Skeleton from '../components/ui/Skeleton';
import Divider from '../components/ui/Divider';
import Badge from '../components/ui/Badge';
import Chart from '../components/ui/Chart';
import { useTheme } from '../contexts/ThemeContext';

const DesignSystem: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  // Tabs State
  const [activeTab, setActiveTab] = useState<string | number>('info');

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // BottomSheet State
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Snackbar State
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<SnackbarSeverity>('info');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  // Form Controls State
  const [toggleValue, setToggleValue] = useState<any>('brand');
  const [isChecked, setIsChecked] = useState(false);
  const [radioValue, setRadioValue] = useState<string | number>('daily');
  const [switchChecked, setSwitchChecked] = useState(false);

  const triggerSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setIsSnackbarOpen(true);
  };

  // Dynamic theme parameters for charts
  const isDark = theme === 'dark';
  const textColor = isDark ? '#E5E7EB' : '#4B5563'; // Tailwind gray-200 / gray-600
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const primaryChartColor = isDark ? '#00D4FF' : '#2B4B9B';
  const secondaryChartColor = isDark ? '#6366F1' : '#00D4FF';
  const chartMode = isDark ? 'dark' : 'light';

  // ApexCharts Configs
  const areaChartOptions = {
    chart: {
      id: 'sponsorship-volume',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      background: 'transparent',
    },
    theme: { mode: chartMode },
    stroke: { curve: 'smooth', width: 3, colors: [primaryChartColor] },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100],
      }
    },
    colors: [primaryChartColor],
    grid: { borderColor: gridColor },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      labels: { style: { colors: textColor } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: textColor } }
    },
    tooltip: { theme: chartMode },
  };

  const areaChartSeries = [
    { name: 'Deals Closed', data: [31, 40, 28, 51, 42, 109, 100, 120] }
  ];

  const donutChartOptions = {
    chart: { background: 'transparent' },
    theme: { mode: chartMode },
    labels: ['Tech Conferences', 'Sports Events', 'College Fests', 'Music Shows'],
    colors: [primaryChartColor, secondaryChartColor, '#10B981', '#F59E0B'],
    stroke: { show: false },
    legend: { position: 'bottom', labels: { colors: textColor } },
    dataLabels: { enabled: false },
    tooltip: { theme: chartMode }
  };

  const donutChartSeries = [44, 17, 32, 21];

  const barChartOptions = {
    chart: { toolbar: { show: false }, background: 'transparent' },
    theme: { mode: chartMode },
    colors: [secondaryChartColor],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '50%',
      }
    },
    dataLabels: { enabled: false },
    grid: { borderColor: gridColor },
    xaxis: {
      categories: ['Q1', 'Q2', 'Q3', 'Q4'],
      labels: { style: { colors: textColor } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: textColor } }
    },
    tooltip: { theme: chartMode }
  };

  const barChartSeries = [
    { name: 'Earnings (Lakhs)', data: [15, 23, 19, 32] }
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-500 bg-background text-text-primary"
    >
      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00D4FF 0%, transparent 75%)', filter: 'blur(50px)' }} />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 75%)', filter: 'blur(50px)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12 border-b border-border pb-6">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-info hover:text-cyan-300 transition-colors mb-3">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <Typography variant="h2" fontWeight="black" gradient="cyan-blue">
              Typography Design System
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" className="mt-2">
              Premium MUI-inspired responsive typography component for Sponsor Studio.
            </Typography>
          </div>
          <div className="flex items-center gap-4 self-start md:self-center">
            {/* Theme Selector */}
            <div className="flex items-center gap-2 bg-surface-hover/30 dark:bg-surface-hover/30 border border-gray-200 dark:border-border rounded-2xl p-1.5">
              <Button
                variant={theme === 'light' ? 'contained' : 'text'}
                color={theme === 'light' ? 'secondary' : 'white'}
                size="small"
                onClick={() => { if (theme !== 'light') toggleTheme(); }}
              >
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'contained' : 'text'}
                color={theme === 'dark' ? 'secondary' : 'white'}
                size="small"
                onClick={() => { if (theme !== 'dark') toggleTheme(); }}
              >
                Dark
              </Button>
            </div>
            <div className="flex items-center gap-2 bg-surface-hover/30 border border-border rounded-2xl px-4 py-2">
              <Sparkles className="w-5 h-5 text-info animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-info">Tailwind Supported</span>
            </div>
          </div>
        </div>

        {/* CSS Animations (Shimmer) */}
        <style>{`
          @keyframes shimmer {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
        `}</style>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 gap-12">
          
          {/* Section 1: Standard Variants */}
          <section className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Code className="w-5 h-5 text-info" />
              <Typography variant="h5" fontWeight="bold">Typography Variants</Typography>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border pb-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="h1"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="h1">Heading 1 (h1)</Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border pb-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="h2"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="h2">Heading 2 (h2)</Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border pb-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="h3"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="h3">Heading 3 (h3)</Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border pb-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="h4"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="h4">Heading 4 (h4)</Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border pb-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="h5"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="h5">Heading 5 (h5)</Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border pb-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="h6"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="h6">Heading 6 (h6)</Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border pb-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="subtitle1"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="subtitle1">Subtitle 1: High level secondary info or larger paragraphs.</Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border pb-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="subtitle2"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="subtitle2">Subtitle 2: Bold metadata or compact description lines.</Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border pb-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="body1"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="body1">Body 1: The standard content paragraphs. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec arcu id arcu elementum feugiat. Sed in nibh tristique, condimentum lorem at, iaculis ipsum.</Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border pb-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="body2"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="body2">Body 2: Compact paragraphs often used in tables, listings, or details. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec arcu id arcu elementum feugiat.</Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border pb-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="caption"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="caption">Caption: Small text helper for secondary comments, labels or hints.</Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border pb-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="overline"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="overline">Overline: Small uppercase categories or sub-headers</Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Typography variant="caption" className="font-mono text-gray-500">variant="button"</Typography>
                <div className="md:col-span-3">
                  <Typography variant="button">Button text styling</Typography>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Premium Gradients & Shimmer */}
          <section className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Sparkles className="w-5 h-5 text-info" />
              <Typography variant="h5" fontWeight="bold">Premium Gradients &amp; Shimmer Effects</Typography>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-hover/30 p-6 rounded-2xl border border-border">
                <Typography variant="caption" className="font-mono text-gray-500 block mb-2">gradient="cyan-blue" (or true)</Typography>
                <Typography variant="h3" fontWeight="extrabold" gradient="cyan-blue">
                  Brands &amp; Organizers
                </Typography>
              </div>

              <div className="bg-surface-hover/30 p-6 rounded-2xl border border-border">
                <Typography variant="caption" className="font-mono text-gray-500 block mb-2">gradient="indigo-cyan"</Typography>
                <Typography variant="h3" fontWeight="extrabold" gradient="indigo-cyan">
                  Sponsor Studio deals
                </Typography>
              </div>

              <div className="bg-surface-hover/30 p-6 rounded-2xl border border-border">
                <Typography variant="caption" className="font-mono text-gray-500 block mb-2">gradient="shimmer-cyan" (animated)</Typography>
                <Typography variant="h2" fontWeight="black" gradient="shimmer-cyan">
                  Explore Now
                </Typography>
              </div>

              <div className="bg-surface-hover/30 p-6 rounded-2xl border border-border">
                <Typography variant="caption" className="font-mono text-gray-500 block mb-2">gradient="shimmer-indigo" (animated)</Typography>
                <Typography variant="h2" fontWeight="black" gradient="shimmer-indigo">
                  Connect &amp; Grow
                </Typography>
              </div>
            </div>
          </section>

          {/* Section 3: Alignment, Weight overrides, Gutter & Component tag override */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <Typography variant="h5" fontWeight="bold" className="mb-4">Font Weight &amp; Alignments</Typography>
              <div className="space-y-4">
                <div>
                  <Typography variant="caption" className="font-mono text-gray-500 block mb-1">align="center"</Typography>
                  <Typography variant="body1" align="center" className="bg-surface-hover/30 p-2 rounded">
                    Centered body copy
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" className="font-mono text-gray-500 block mb-1">align="right"</Typography>
                  <Typography variant="body1" align="right" className="bg-surface-hover/30 p-2 rounded">
                    Right aligned body copy
                  </Typography>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <Typography variant="caption" className="font-mono text-gray-500 block mb-1">fontWeight="light"</Typography>
                    <Typography variant="h6" fontWeight="light">Light Head</Typography>
                  </div>
                  <div>
                    <Typography variant="caption" className="font-mono text-gray-500 block mb-1">fontWeight="medium"</Typography>
                    <Typography variant="h6" fontWeight="medium">Medium Head</Typography>
                  </div>
                  <div>
                    <Typography variant="caption" className="font-mono text-gray-500 block mb-1">fontWeight="extrabold"</Typography>
                    <Typography variant="h6" fontWeight="extrabold">ExtraBold Head</Typography>
                  </div>
                  <div>
                    <Typography variant="caption" className="font-mono text-gray-500 block mb-1">fontWeight="black"</Typography>
                    <Typography variant="h6" fontWeight="black">Black Head</Typography>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <Typography variant="h5" fontWeight="bold" className="mb-4">Special Modifiers</Typography>
              <div className="space-y-6">
                <div>
                  <Typography variant="caption" className="font-mono text-gray-500 block mb-1">gutterBottom=&#123;true&#125;</Typography>
                  <div className="bg-surface-hover/30 p-4 rounded border border-border">
                    <Typography variant="h5" gutterBottom>
                      Heading with Gutter
                    </Typography>
                    <Typography variant="body2">
                      This body text sits with nice bottom spacing automatically separated from the heading above.
                    </Typography>
                  </div>
                </div>

                <div>
                  <Typography variant="caption" className="font-mono text-gray-500 block mb-1">noWrap=&#123;true&#125;</Typography>
                  <div className="bg-surface-hover/30 p-3 rounded border border-border w-64">
                    <Typography variant="body2" noWrap>
                      This text is too long for the small box it lives in and should be truncated with ellipsis automatically.
                    </Typography>
                  </div>
                </div>

                <div>
                  <Typography variant="caption" className="font-mono text-gray-500 block mb-1">component="span" override on variant="h4"</Typography>
                  <div className="bg-surface-hover/30 p-3 rounded border border-border">
                    <Typography variant="h6" component="span" className="bg-blue-600 px-2 py-1 rounded text-xs font-mono mr-2">
                      &lt;span&gt;
                    </Typography>
                    <Typography variant="h4" component="span">
                      Rendered as a span tag instead of h4 element
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Buttons Showcase */}
          <section className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Layers className="w-5 h-5 text-info" />
              <Typography variant="h5" fontWeight="bold">Button Component Variants</Typography>
            </div>
            
            <div className="space-y-8">
              {/* Variant Rows */}
              <div>
                <Typography variant="subtitle2" color="textSecondary" className="mb-3">Contained Buttons</Typography>
                <div className="flex flex-wrap gap-4">
                  <Button variant="contained" color="primary">Primary</Button>
                  <Button variant="contained" color="secondary">Secondary</Button>
                  <Button variant="contained" color="accent">Accent</Button>
                  <Button variant="contained" color="success">Success</Button>
                  <Button variant="contained" color="error">Error</Button>
                  <Button variant="contained" color="warning">Warning</Button>
                  <Button variant="contained" color="white">White</Button>
                </div>
              </div>

              <div>
                <Typography variant="subtitle2" color="textSecondary" className="mb-3">Outlined Buttons</Typography>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outlined" color="primary">Primary</Button>
                  <Button variant="outlined" color="secondary">Secondary</Button>
                  <Button variant="outlined" color="accent">Accent</Button>
                  <Button variant="outlined" color="success">Success</Button>
                  <Button variant="outlined" color="error">Error</Button>
                  <Button variant="outlined" color="warning">Warning</Button>
                  <Button variant="outlined" color="white">White</Button>
                </div>
              </div>

              <div>
                <Typography variant="subtitle2" color="textSecondary" className="mb-3">Gradient Buttons (With Custom Glow Shadows)</Typography>
                <div className="flex flex-wrap gap-4">
                  <Button variant="gradient" color="primary" glow>Primary</Button>
                  <Button variant="gradient" color="secondary" glow>Secondary</Button>
                  <Button variant="gradient" color="accent" glow>Accent</Button>
                  <Button variant="gradient" color="success" glow>Success</Button>
                  <Button variant="gradient" color="error" glow>Error</Button>
                  <Button variant="gradient" color="warning" glow>Warning</Button>
                </div>
              </div>

              <div>
                <Typography variant="subtitle2" color="textSecondary" className="mb-3">Glass Buttons</Typography>
                <div className="flex flex-wrap gap-4">
                  <Button variant="glass" color="primary">Primary</Button>
                  <Button variant="glass" color="secondary">Secondary</Button>
                  <Button variant="glass" color="accent">Accent</Button>
                  <Button variant="glass" color="success">Success</Button>
                  <Button variant="glass" color="error">Error</Button>
                  <Button variant="glass" color="warning">Warning</Button>
                  <Button variant="glass" color="white">White</Button>
                </div>
              </div>

              <div>
                <Typography variant="subtitle2" color="textSecondary" className="mb-3">Text Buttons</Typography>
                <div className="flex flex-wrap gap-4">
                  <Button variant="text" color="primary">Primary</Button>
                  <Button variant="text" color="secondary">Secondary</Button>
                  <Button variant="text" color="accent">Accent</Button>
                  <Button variant="text" color="success">Success</Button>
                  <Button variant="text" color="error">Error</Button>
                  <Button variant="text" color="warning">Warning</Button>
                  <Button variant="text" color="white">White</Button>
                </div>
              </div>

              {/* Sizes, States & Icons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-border">
                <div>
                  <Typography variant="subtitle2" color="textSecondary" className="mb-3">Sizes</Typography>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Button size="small" variant="gradient" color="secondary">Small</Button>
                    <Button size="medium" variant="gradient" color="secondary">Medium</Button>
                    <Button size="large" variant="gradient" color="secondary">Large</Button>
                  </div>
                </div>

                <div>
                  <Typography variant="subtitle2" color="textSecondary" className="mb-3">Icons & Loading States</Typography>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Button variant="contained" color="primary" startIcon={<Plus className="w-4 h-4" />}>Add Item</Button>
                    <Button variant="outlined" color="accent" endIcon={<Send className="w-4 h-4" />}>Send Info</Button>
                    <Button variant="gradient" color="secondary" loading>Saving</Button>
                  </div>
                </div>

                <div>
                  <Typography variant="subtitle2" color="textSecondary" className="mb-3">Disabled States</Typography>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Button variant="contained" color="primary" disabled>Disabled Solid</Button>
                    <Button variant="glass" color="secondary" disabled>Disabled Glass</Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Cards Showcase */}
          <section className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Layers className="w-5 h-5 text-info" />
              <Typography variant="h5" fontWeight="bold">Card Layout Variants &amp; Composition</Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Stat/Info Glass Card */}
              <Card variant="glass" glow>
                <CardHeader 
                  title="Sponsorship Success Rate"
                  subheader="Platform average last 30 days"
                  action={<Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white transition-colors" />}
                />
                <CardContent>
                  <div className="flex items-baseline gap-2 mt-2">
                    <Typography variant="h3" fontWeight="black" gradient="cyan-blue">
                      98.4%
                    </Typography>
                    <Typography variant="caption" className="text-emerald-400 font-semibold flex items-center">
                      +1.2% this week
                    </Typography>
                  </div>
                  <Typography variant="body2" color="textSecondary" className="mt-3">
                    We track verified connections between creators, event hosts and national brand managers to evaluate successful outcomes.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button variant="text" size="small" color="secondary" endIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    View Analytics
                  </Button>
                </CardActions>
              </Card>

              {/* Card 2: Media Showcase Card */}
              <Card variant="solid" glow>
                <CardMedia 
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80" 
                  alt="Tech Conference 2026 Preview"
                  height="140px"
                />
                <CardHeader 
                  avatar={<div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center text-xs font-bold text-info">TC</div>}
                  title="Tech Conference 2026"
                  subheader="Bangalore • Oct 15, 2026"
                />
                <CardContent className="-mt-2">
                  <Typography variant="body2" color="textSecondary">
                    Looking for title sponsors. Estimated footfall: 5,000+ delegates. Brands will get premium booths and logo display slots.
                  </Typography>
                </CardContent>
                <CardActions disableSpacing className="justify-between">
                  <Button variant="glass" size="small" color="white">Bookmark</Button>
                  <Button variant="gradient" size="small" color="secondary">Apply Sponsor</Button>
                </CardActions>
              </Card>

              {/* Card 3: Minimal Outlined Card */}
              <Card variant="outlined" hoverEffect={false}>
                <CardHeader 
                  title="Verified Brand Profile"
                  subheader="Verified since May 2026"
                  avatar={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                />
                <CardContent>
                  <Typography variant="body2">
                    This brand account has been fully authenticated by the Sponsor Studio support team and has a verified GSTIN/corporate registry.
                  </Typography>
                  <div className="mt-4 bg-surface-hover/30 rounded-2xl p-3 border border-border flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-info" />
                    <Typography variant="caption" color="textSecondary">
                      Verified brands receive 2x priority matching scores.
                    </Typography>
                  </div>
                </CardContent>
                <CardActions>
                  <Button variant="outlined" size="small" color="white">Read Guidelines</Button>
                </CardActions>
              </Card>
            </div>
          </section>

          {/* Section 6: Tabs Showcase */}
          <section className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Sparkles className="w-5 h-5 text-info" />
              <Typography variant="h5" fontWeight="bold">Tabs Switcher Panel</Typography>
            </div>

            <div className="space-y-4">
              <Tabs value={activeTab} onChange={setActiveTab} variant="standard">
                <Tab value="info" label="Sponsor Benefits" icon={<Sparkles className="w-4 h-4" />} />
                <Tab value="analytics" label="Campaign Metrics" icon={<Layers className="w-4 h-4" />} />
                <Tab value="settings" label="Access Rights" icon={<Settings className="w-4 h-4" />} />
              </Tabs>

              <div className="bg-surface-hover/30 border border-border rounded-3xl p-6 min-h-[160px]">
                <TabPanel value="info" activeValue={activeTab}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Reach Premium Creators &amp; Influencers
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Gain visibility across top-performing events. Sponsor Studio enables brands to browse curated lists of events, verify engagement profiles, and draft secure sponsorship agreements.
                  </Typography>
                </TabPanel>

                <TabPanel value="analytics" activeValue={activeTab}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Real-time ROI Tracking
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Measure brand impressions, click-through rates, lead generations, and customer conversions. Access complete custom charts and generate exportable reports for stakeholders.
                  </Typography>
                </TabPanel>

                <TabPanel value="settings" activeValue={activeTab}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Role-Based Workspace Control
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Invite team members, assign editor/viewer permissions, control budget approvals, and audit historical deal logs directly within a secure enterprise dashboard.
                  </Typography>
                </TabPanel>
              </div>
            </div>
          </section>

          {/* Section 7: Dialog & BottomSheet */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <Typography variant="h5" fontWeight="bold" className="mb-2">Overlay Dialogs</Typography>
              <Typography variant="body2" color="textSecondary" className="mb-6">
                Floating confirmation boxes that appear with backdrop blurs and prevent screen scrolls.
              </Typography>
              <Button variant="gradient" color="primary" onClick={() => setIsDialogOpen(true)}>
                Open Dialog Modal
              </Button>
            </div>

            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <Typography variant="h5" fontWeight="bold" className="mb-2">Bottom Drawer Sheet</Typography>
              <Typography variant="body2" color="textSecondary" className="mb-6">
                Mobile-first sheet that slides up from the bottom of the screen with a drag handle.
              </Typography>
              <Button variant="glass" color="secondary" onClick={() => setIsBottomSheetOpen(true)}>
                Open Bottom Sheet
              </Button>
            </div>
          </section>

          {/* Section 8: Toast Notifications (Snackbar) */}
          <section className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Layers className="w-5 h-5 text-info" />
              <Typography variant="h5" fontWeight="bold">Toast Notifications (Snackbar)</Typography>
            </div>
            
            <Typography variant="body2" color="textSecondary" className="mb-6">
              Dismissible feedback alert badges that slide in from the screen corner.
            </Typography>

            <div className="flex flex-wrap gap-4">
              <Button variant="contained" color="success" onClick={() => triggerSnackbar('Sponsorship agreement signed successfully!', 'success')}>
                Trigger Success Toast
              </Button>
              <Button variant="contained" color="primary" onClick={() => triggerSnackbar('New proposal received from Brand Manager.', 'info')}>
                Trigger Info Toast
              </Button>
              <Button variant="contained" color="warning" onClick={() => triggerSnackbar('Your verification profile is 80% complete.', 'warning')}>
                Trigger Warning Toast
              </Button>
              <Button variant="contained" color="error" onClick={() => triggerSnackbar('Connection lost. Please check your network connection.', 'error')}>
                Trigger Error Toast
              </Button>
            </div>
          </section>

        </div>
      </div>

      {/* Render Dialog Instance */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} glow>
        <DialogTitle onClose={() => setIsDialogOpen(false)}>
          Confirm Action
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" className="text-white mb-2">
            Are you sure you want to approve this sponsorship application?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This will initiate draft verification and notify the host organizer. The process is completely secure.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="white" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="gradient" color="secondary" onClick={() => {
            setIsDialogOpen(false);
            triggerSnackbar('Application approved successfully!', 'success');
          }}>
            Approve Deal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Render BottomSheet Instance */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)}>
        <Typography variant="h5" fontWeight="bold" className="text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-info" /> Event Filters
        </Typography>
        <Typography variant="body2" color="textSecondary" className="mb-6">
          Refine your search for the best event sponsorship placements.
        </Typography>
        <div className="space-y-4">
          <div>
            <Typography variant="subtitle2" className="mb-2">Sponsorship Category</Typography>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-surface-hover/30 border border-border rounded-full text-xs hover:border-info cursor-pointer text-info font-semibold">Title Sponsor</span>
              <span className="px-3 py-1 bg-surface-hover/30 border border-border rounded-full text-xs hover:border-info cursor-pointer">Associate Sponsor</span>
              <span className="px-3 py-1 bg-surface-hover/30 border border-border rounded-full text-xs hover:border-info cursor-pointer">Stall Partner</span>
            </div>
          </div>
          <div>
            <Typography variant="subtitle2" className="mb-2">Estimated Attendance</Typography>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-surface-hover/30 border border-border rounded-full text-xs hover:border-info cursor-pointer">&lt; 500</span>
              <span className="px-3 py-1 bg-surface-hover/30 border border-border rounded-full text-xs hover:border-info cursor-pointer text-info font-semibold">500 - 2000</span>
              <span className="px-3 py-1 bg-surface-hover/30 border border-border rounded-full text-xs hover:border-info cursor-pointer">2000+</span>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="text" color="white" onClick={() => setIsBottomSheetOpen(false)}>Reset</Button>
          <Button variant="gradient" color="secondary" onClick={() => setIsBottomSheetOpen(false)}>Apply Filters</Button>
        </div>
      </BottomSheet>

      {/* Render Snackbar Instance */}
      <Snackbar
        isOpen={isSnackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setIsSnackbarOpen(false)}
      />

          {/* Section 9: Form Controls (Checkbox, Radio, Switch, Toggle) */}
          <section className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Code className="w-5 h-5 text-info" />
              <Typography variant="h5" fontWeight="bold">Form Inputs &amp; Controls</Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Checkboxes */}
              <div>
                <Typography variant="subtitle2" color="textSecondary" className="mb-3">Checkboxes</Typography>
                <div className="flex flex-col gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} label="Agree to Sponsorship Terms" />
                  <Checkbox checked={true} onChange={() => {}} label="Verified Profile Option" disabled />
                  <Checkbox checked={false} onChange={() => {}} label="Unchecked Disabled" disabled />
                </div>
              </div>

              {/* Switches */}
              <div>
                <Typography variant="subtitle2" color="textSecondary" className="mb-3">Switches</Typography>
                <div className="flex flex-col gap-3">
                  <Switch checked={switchChecked} onChange={setSwitchChecked} label="Real-time notifications" />
                  <Switch checked={true} onChange={() => {}} label="Auto-approve deals" disabled />
                  <Switch checked={false} onChange={() => {}} label="Offline mode" disabled />
                </div>
              </div>

              {/* Radios */}
              <div>
                <Typography variant="subtitle2" color="textSecondary" className="mb-3">Radio Buttons</Typography>
                <RadioGroup value={radioValue} onChange={setRadioValue} name="payout-schedule">
                  <Radio value="daily" label="Daily payout" />
                  <Radio value="weekly" label="Weekly payout" />
                  <Radio value="monthly" label="Monthly payout" disabled />
                </RadioGroup>
              </div>

              {/* Button Groups (Toggles) */}
              <div>
                <Typography variant="subtitle2" color="textSecondary" className="mb-3">Toggle Button Group</Typography>
                <div className="flex flex-col gap-3">
                  <ToggleButtonGroup value={toggleValue} onChange={setToggleValue}>
                    <ToggleButton value="brand">Brand</ToggleButton>
                    <ToggleButton value="creator">Creator</ToggleButton>
                    <ToggleButton value="both">Both</ToggleButton>
                  </ToggleButtonGroup>
                  <Typography variant="caption" color="textSecondary">
                    Selected mode: <span className="text-info font-bold capitalize">{toggleValue || 'none'}</span>
                  </Typography>
                </div>
              </div>
            </div>
          </section>

          {/* Section 10: Skeletons, Dividers, Badges & Loaders */}
          <section className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Sparkles className="w-5 h-5 text-info" />
              <Typography variant="h5" fontWeight="bold">Skeletons, Dividers, Badges &amp; Loaders</Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Loaders & Badges */}
              <div className="space-y-6">
                <div>
                  <Typography variant="subtitle2" color="textSecondary" className="mb-3">Circular &amp; Linear Loaders</Typography>
                  <div className="flex items-center gap-6 mb-4">
                    <CircularProgress size={32} color="secondary" />
                    <CircularProgress size={40} color="accent" thickness={5} />
                    <CircularProgress size={48} color="white" />
                  </div>
                  <LinearProgress color="gradient" height={6} className="max-w-xs" />
                </div>

                <div>
                  <Typography variant="subtitle2" color="textSecondary" className="mb-3">Overlay Badges</Typography>
                  <div className="flex gap-6 items-center">
                    <Badge badgeContent="9" color="error">
                      <div className="w-10 h-10 rounded-2xl bg-surface-hover/30 border border-border flex items-center justify-center text-sm font-semibold">
                        ✉️
                      </div>
                    </Badge>
                    <Badge badgeContent="New" color="secondary">
                      <div className="w-12 h-10 rounded-2xl bg-surface-hover/30 border border-border flex items-center justify-center text-xs font-semibold px-2">
                        Campaign
                      </div>
                    </Badge>
                    <Badge variant="dot" color="success">
                      <div className="w-10 h-10 rounded-full bg-surface-hover/30 border border-border flex items-center justify-center text-sm font-semibold">
                        👤
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Skeletons & Dividers */}
              <div className="space-y-6">
                <div>
                  <Typography variant="subtitle2" color="textSecondary" className="mb-3">Pulse Skeleton Loaders</Typography>
                  {/* Skeleton Card Composition */}
                  <div className="bg-surface-hover/30 border border-border rounded-2xl p-4 flex gap-4 max-w-sm">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="90%" />
                      <Skeleton variant="rounded" height={60} className="mt-2" />
                    </div>
                  </div>
                </div>

                <div>
                  <Typography variant="subtitle2" color="textSecondary" className="mb-2">Layout Dividers</Typography>
                  <Divider>Category Divider</Divider>
                  <div className="flex items-center justify-center h-8 bg-surface-hover/30 rounded border border-border">
                    <span className="text-xs text-gray-400">Left Column</span>
                    <Divider orientation="vertical" />
                    <span className="text-xs text-gray-400">Right Column</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 11: Interactive Charts (ApexCharts) */}
          <section className="bg-surface border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Layers className="w-5 h-5 text-info" />
              <Typography variant="h5" fontWeight="bold">Interactive Analytics (ApexCharts)</Typography>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart 1: Sponsorship Timeline Volume */}
              <Card variant="glass" className="lg:col-span-2 p-6" hoverEffect={false}>
                <Typography variant="h6" fontWeight="bold" className="mb-1">
                  Sponsorship Match Growth
                </Typography>
                <Typography variant="caption" color="textSecondary" className="block mb-6">
                  Number of deals successfully signed per month
                </Typography>
                <div className="h-[300px]">
                  <Chart options={areaChartOptions} series={areaChartSeries} type="area" height={280} />
                </div>
              </Card>

              {/* Chart 2: Sponsorship Types Distribution */}
              <Card variant="glass" className="p-6 flex flex-col justify-between" hoverEffect={false}>
                <div>
                  <Typography variant="h6" fontWeight="bold" className="mb-1">
                    Event Categories
                  </Typography>
                  <Typography variant="caption" color="textSecondary" className="block mb-6">
                    Distribution of event genres listed
                  </Typography>
                </div>
                <div className="h-[250px] flex items-center justify-center">
                  <Chart options={donutChartOptions} series={donutChartSeries} type="donut" height={220} />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-6">
              {/* Chart 3: Quarterly Platform Earnings */}
              <Card variant="glass" className="p-6" hoverEffect={false}>
                <Typography variant="h6" fontWeight="bold" className="mb-1">
                  Quarterly Closed Funding Volume
                </Typography>
                <Typography variant="caption" color="textSecondary" className="block mb-6">
                  Total capital transacted through Sponsor Studio (Lakhs)
                </Typography>
                <div className="h-[250px]">
                  <Chart options={barChartOptions} series={barChartSeries} type="bar" height={230} />
                </div>
              </Card>
            </div>
          </section>

      {/* Render Snackbar Instance */}
      <Snackbar
        isOpen={isSnackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setIsSnackbarOpen(false)}
      />
    </div>
  );
};

export default DesignSystem;
