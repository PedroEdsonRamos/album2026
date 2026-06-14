export function BallIcon({ size = 24, color = "currentColor", ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6" fill="none"/>
      <path d="M12 7.2 L15.3 9.6 L14.05 13.45 L9.95 13.45 L8.7 9.6 Z" fill={color}/>
      <path d="M12 3.2 L13.2 4.4 L12.6 6 L11.4 6 L10.8 4.4 Z" fill={color}/>
      <path d="M18.5 7.5 L19 9 L17.8 10 L16.6 9.2 L17 7.6 Z" fill={color}/>
      <path d="M16.8 16.8 L17.8 17.5 L17.2 18.7 L15.9 18.5 L15.6 17.2 Z" fill={color}/>
      <path d="M7.2 16.8 L8.4 17.2 L8.1 18.5 L6.8 18.7 L6.2 17.5 Z" fill={color}/>
      <path d="M5.5 7.5 L7 7.6 L7.4 9.2 L6.2 10 L5 9 Z" fill={color}/>
      <line x1="12" y1="6" x2="12" y2="7.2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="16.6" y1="9.2" x2="15.3" y2="9.6" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="15.6" y1="17.2" x2="14.05" y2="13.45" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="8.4" y1="17.2" x2="9.95" y2="13.45" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="7.4" y1="9.2" x2="8.7" y2="9.6" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
