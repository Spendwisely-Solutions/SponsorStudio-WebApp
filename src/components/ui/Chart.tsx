import React from 'react';
import ApexCharts from 'react-apexcharts';

export interface ChartProps {
  options: any;
  series: any[];
  type:
    | 'line'
    | 'area'
    | 'bar'
    | 'pie'
    | 'donut'
    | 'radialBar'
    | 'scatter'
    | 'bubble'
    | 'heatmap'
    | 'candlestick'
    | 'radar'
    | 'polarArea';
  height?: string | number;
  width?: string | number;
}

export const Chart: React.FC<ChartProps> = ({
  options,
  series,
  type,
  height = 350,
  width = '100%',
}) => {
  return (
    <div className="w-full h-full text-white overflow-hidden">
      <ApexCharts
        options={options}
        series={series}
        type={type}
        height={height}
        width={width}
      />
    </div>
  );
};

export default Chart;
