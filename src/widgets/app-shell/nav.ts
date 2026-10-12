/** `icon` is the sidebar's light glyph, `tab` the tab bar's filled one (Search's: the fab's). */
export const NAV = [
  { label: 'Home', link: '/projects', icon: 'icon-[light--house]', tab: 'icon-[solid--house]' },
  {
    label: 'Search',
    link: '/search',
    icon: 'icon-[light--magnifying-glass]',
    tab: 'icon-[regular--magnifying-glass]',
  },
  {
    label: 'Activity',
    link: '/notifications',
    icon: 'icon-[light--bell]',
    tab: 'icon-[solid--bell]',
  },
  { label: 'Settings', link: '/settings', icon: 'icon-[light--gear]', tab: 'icon-[solid--gear]' },
] as const;

export type NavItem = (typeof NAV)[number];

/* iOS 27 keeps Search out of the tab row: it is the glass button beside the bar. */
export const TABS = NAV.filter((item) => item.link !== '/search');
