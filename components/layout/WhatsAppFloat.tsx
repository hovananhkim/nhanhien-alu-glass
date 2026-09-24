'use client'
export default function WhatsAppFloat() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+919876543210'
  const message = encodeURIComponent('Hello! I am interested in your furniture products. Can you help me?')
  const url = `https://wa.me/${number.replace(/\D/g, '')}?text=${message}`
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="whatsapp-float" aria-label="Chat on WhatsApp">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 2.5C7.649 2.5 2.5 7.649 2.5 14c0 2.034.535 3.944 1.47 5.6L2.5 25.5l6.1-1.447A11.43 11.43 0 0014 25.5c6.351 0 11.5-5.149 11.5-11.5S20.351 2.5 14 2.5z" fill="white"/>
        <path d="M20.3 17.15c-.3-.15-1.77-.873-2.044-.972-.274-.1-.474-.15-.673.15-.2.298-.773.972-.948 1.172-.174.2-.349.224-.648.075-.3-.15-1.265-.466-2.41-1.483-.89-.793-1.492-1.773-1.666-2.072-.174-.3-.018-.462.13-.611.134-.134.3-.349.448-.524.15-.174.2-.299.3-.498.1-.2.05-.374-.025-.524-.075-.15-.673-1.621-.922-2.22-.243-.583-.49-.504-.673-.513l-.573-.01c-.2 0-.524.075-.798.374-.274.3-1.047 1.023-1.047 2.494 0 1.472 1.072 2.894 1.222 3.093.15.2 2.11 3.22 5.113 4.514.714.309 1.272.493 1.707.63.717.228 1.37.196 1.886.119.575-.085 1.77-.724 2.02-1.423.25-.7.25-1.298.174-1.423-.074-.124-.273-.199-.573-.349z" fill="#25D366"/>
      </svg>
    </a>
  )
}
