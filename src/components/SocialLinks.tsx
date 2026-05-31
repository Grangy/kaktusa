"use client";

import { Send } from "lucide-react";
import { SOCIAL } from "@/lib/social";

function VkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202-4.225-6.266-5.44-8.526-5.814-6.01-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.644v3.49c0 .373.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.271.525.644-.22 1.017-2.354 3.912-2.354 3.912-.203.322-.271.458 0 .813.203.271.932.881 1.414 1.406.796.74 1.406 1.362 1.574 1.79.17.424-.085.644-.576.644z" />
    </svg>
  );
}

const iconLinkClass =
  "text-white/70 hover:text-[var(--accent)] transition-colors";

const textLinkClass =
  "inline-flex items-center gap-2 text-white/60 text-sm hover:text-[var(--accent)] transition-colors";

type SocialLinksProps = {
  /** header: только иконки; footer: иконка + подпись; menu: иконка + подпись крупнее */
  variant?: "header" | "footer" | "menu";
  className?: string;
};

export default function SocialLinks({ variant = "header", className = "" }: SocialLinksProps) {
  const gap = variant === "header" ? "gap-4" : "gap-6";
  const iconSize = variant === "header" ? 18 : 20;

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      <a
        href={SOCIAL.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className={variant === "footer" ? textLinkClass : iconLinkClass}
        aria-label="Telegram"
      >
        <Send size={iconSize} className="shrink-0" />
        {variant !== "header" && "Telegram"}
      </a>
      <a
        href={SOCIAL.vk}
        target="_blank"
        rel="noopener noreferrer"
        className={variant === "footer" ? textLinkClass : iconLinkClass}
        aria-label="ВКонтакте"
      >
        <VkIcon size={iconSize} />
        {variant !== "header" && "ВКонтакте"}
      </a>
    </div>
  );
}
