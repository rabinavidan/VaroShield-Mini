interface IconProps {
  size?: number;
}

export function PythonIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#3776AB"
        d="M11.9 1.6c-4.6 0-4.3 2-4.3 2v2.1h4.4v.6H5.8S3 6 3 10.6s2.4 4.4 2.4 4.4h1.5v-2.2s-.1-2.4 2.4-2.4h4.3s2.3 0 2.3-2.2V3.9s.3-2.3-4-2.3zM9.5 3c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7z"
      />
      <path
        fill="#FFD43B"
        d="M12.1 22.4c4.6 0 4.3-2 4.3-2v-2.1H12v-.6h6.2s2.8.3 2.8-4.3-2.4-4.4-2.4-4.4h-1.5v2.2s.1 2.4-2.4 2.4h-4.3s-2.3 0-2.3 2.2v3.7s-.3 2.3 4 2.3zm2.4-1.4c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7z"
      />
    </svg>
  );
}

export function DockerIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="10" width="2.2" height="2.2" />
      <rect x="5.6" y="10" width="2.2" height="2.2" />
      <rect x="8.2" y="10" width="2.2" height="2.2" />
      <rect x="8.2" y="7.3" width="2.2" height="2.2" />
      <rect x="10.8" y="10" width="2.2" height="2.2" />
      <rect x="10.8" y="7.3" width="2.2" height="2.2" />
      <path d="M22.5 11.2c-.6-.4-1.9-.5-2.8-.3-.1-.9-.6-1.6-1.4-2.3l-.5-.3-.3.5c-.4.6-.6 1.5-.5 2.3.1.6.4 1.2.9 1.6-.4.2-.8.4-1.2.5-1 .3-2.1.3-3.1.3H2.6c-.4 1.5-.2 3 .6 4.3 1 1.6 2.7 2.5 4.8 2.5 5.8 0 10.1-2.7 12.1-7.5 1.3.1 2.6-.1 3.2-1.1.1-.2.1-.4 0-.5z" />
    </svg>
  );
}

export function PlaywrightIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C7.5 2 4.5 5.5 4.5 10c0 3 1.3 5.7 3.3 7.6-.3.9-.9 2-1.8 2.9-.3.3-.1.8.3.8 1.7-.1 3.4-.7 4.6-1.5.7.1 1.4.2 2.1.2 4.5 0 7.5-3.5 7.5-8S16.5 2 12 2z" />
      <circle cx="9.2" cy="10" r="1.1" fill="#ffffff" />
      <circle cx="14.8" cy="10" r="1.1" fill="#ffffff" />
    </svg>
  );
}
