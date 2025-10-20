import { useTranslation } from 'react-i18next'

interface HeaderProps {
  title?: string      // raw string
  titleKey?: string   // i18n key
  className?: string  // Optional custom styling
}

export default function Header({ title, titleKey, className }: HeaderProps) {
  const { t } = useTranslation()

  // Determine title text: either from titleKey or raw title, with fallback
  const displayTitle = titleKey ? t(titleKey, { defaultValue: title }) : title

  return (
    <header className={`bg-gray-100 border-b border-gray-300 py-4 px-6 rounded-t ${className}`}>
      <h1 className="text-xl font-semibold">
        {displayTitle || 'Default Header'}  {/* Fallback if neither title nor titleKey is provided */}
      </h1>
    </header>
  )
}
