import Slider from '@mui/material/Slider';

type WidgetLabelSliderProps = {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
};

export function WidgetLabelSlider({
  min, max, minValue, maxValue, onChange
}: WidgetLabelSliderProps) {
  const handleChange = (_: any, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      onChange(newValue[0], newValue[1]);
    }
  };

  return (
    <div style={{ width: 400, margin: "50px auto" }}>
      <Slider
        value={[minValue, maxValue]}
        onChange={handleChange}
        min={min}
        max={max}
        valueLabelDisplay="auto"
        sx={{
          color: '#007bff'
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span>{minValue}</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
}
