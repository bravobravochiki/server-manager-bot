export const OS_ICONS = {
  windows: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg',
  linux: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
  ubuntu: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-plain.svg',
  debian: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/debian/debian-original.svg',
  centos: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/centos/centos-original.svg',
} as const;

export function getOsIcon(distro: string): string {
  const lowerDistro = distro.toLowerCase();
  if (lowerDistro.includes('windows')) return OS_ICONS.windows;
  if (lowerDistro.includes('ubuntu')) return OS_ICONS.ubuntu;
  if (lowerDistro.includes('debian')) return OS_ICONS.debian;
  if (lowerDistro.includes('centos')) return OS_ICONS.centos;
  return OS_ICONS.linux;
}