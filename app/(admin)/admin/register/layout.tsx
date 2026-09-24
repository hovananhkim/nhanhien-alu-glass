// This layout intentionally replaces the admin auth layout for the register page.
// The register page is public — unauthenticated users must be able to access it.
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
