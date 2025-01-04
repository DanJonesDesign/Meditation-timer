import * as React from "react"

const Switch = React.forwardRef(({ checked, onCheckedChange, ...props }, ref) => {
  const baseStyles = "peer inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
  const bgStyles = checked ? "bg-blue-500" : "bg-gray-200"
  
  const thumbStyles = "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform"
  const thumbPosition = checked ? "translate-x-4" : "translate-x-0"
  
  return (
    <button
      ref={ref}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`${baseStyles} ${bgStyles}`}
      {...props}
    >
      <span className={`${thumbStyles} ${thumbPosition}`} />
    </button>
  )
})
Switch.displayName = "Switch"

export { Switch }
