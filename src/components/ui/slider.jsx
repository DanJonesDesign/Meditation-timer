import * as React from "react"

const Slider = React.forwardRef(({ value = [0], min = 0, max = 100, step = 1, onValueChange, ...props }, ref) => {
  const percentage = ((value[0] - min) / (max - min)) * 100
  
  const handleChange = (e) => {
    const newValue = Number(e.target.value)
    onValueChange([newValue])
  }
  
  return (
    <div className="relative w-full h-6 flex items-center" ref={ref} {...props}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, rgb(59 130 246) ${percentage}%, rgb(229 231 235) ${percentage}%)`
        }}
      />
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }
