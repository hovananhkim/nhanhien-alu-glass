'use client'

interface Props {
  href: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline'
  className?: string
}

const WA_ICON = (
  <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path
      d="M14 2.5C7.649 2.5 2.5 7.649 2.5 14c0 2.034.535 3.944 1.47 5.6L2.5 25.5l6.1-1.447A11.43 11.43 0 0014 25.5c6.351 0 11.5-5.149 11.5-11.5S20.351 2.5 14 2.5z"
      fill="currentColor" opacity="0.25"
    />
    <path
      d="M20.3 17.15c-.3-.15-1.77-.873-2.044-.972-.274-.1-.474-.15-.673.15-.2.298-.773.972-.948 1.172-.174.2-.349.224-.648.075-.3-.15-1.265-.466-2.41-1.483-.89-.793-1.492-1.773-1.666-2.072-.174-.3-.018-.462.13-.611.134-.134.3-.349.448-.524.15-.174.2-.299.3-.498.1-.2.05-.374-.025-.524-.075-.15-.673-1.621-.922-2.22-.243-.583-.49-.504-.673-.513l-.573-.01c-.2 0-.524.075-.798.374-.274.3-1.047 1.023-1.047 2.494 0 1.472 1.072 2.894 1.222 3.093.15.2 2.11 3.22 5.113 4.514.714.309 1.272.493 1.707.63.717.228 1.37.196 1.886.119.575-.085 1.77-.724 2.02-1.423.25-.7.25-1.298.174-1.423-.074-.124-.273-.199-.573-.349z"
      fill="currentColor"
    />
  </svg>
)

const sizeMap = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3.5 text-base gap-2.5',
}

export default function WhatsAppButton({
  href,
  label = 'Chat on WhatsApp',
  size = 'md',
  variant = 'solid',
  className = '',
}: Props) {
  const base = `inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ${sizeMap[size]}`

  const styles =
    variant === 'solid'
      ? `${base} bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-sm hover:shadow-md hover:-translate-y-0.5`
      : `${base} border-2 border-[#25D366] text-[#1a9e50] hover:bg-[#25D366] hover:text-white`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles} ${className}`}
      aria-label={label}
    >
      {WA_ICON}
      {label}
    </a>
  )
}