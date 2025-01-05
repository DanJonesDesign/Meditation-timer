export function Switch({ checked, onCheckedChange, className, ...props }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors 
        ${checked ? 'bg-blue-500' : 'bg-gray-200'} 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 
        disabled:cursor-not-allowed disabled:opacity-50`}
      {...props}
    >
      <span 
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform
          ${checked ? 'translate-x-5' : 'translate-x-0'}`} 
      />
    </button>
  )
}
