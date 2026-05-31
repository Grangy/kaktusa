/**
 * Логотип VK (ВКонтакте) — Simple Icons brand pack via react-icons.
 * @see https://simpleicons.org/?q=vk
 */
import { SiVk } from "react-icons/si";

type VkIconProps = {
  size?: number;
  className?: string;
};

export default function VkIcon({ size = 18, className }: VkIconProps) {
  return <SiVk size={size} className={className} aria-hidden />;
}
