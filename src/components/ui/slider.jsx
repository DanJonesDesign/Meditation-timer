export function Slider({ value = [0], min = 0, max = 100, step = 1, onValueChange, className, ...props }) {
  return (
    <div className="relative flex w-full touch-none select-none items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([Number(e.target.value)])}
        className={`h-2 w-full rounded-full bg-gray-200 ${className}`}
        {...props}
      />
    </div>
  )
}
