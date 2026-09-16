import { MessageCircle } from "lucide-react";

import { WhatsappLink } from "@/components/public/whatsapp-link";
import { waLink } from "@/lib/brand";

/**
 * Botão flutuante de WhatsApp, fixo em toda página pública — o canal de
 * contato mais usado no mercado imobiliário local, sempre à mão em vez de
 * escondido dentro de uma seção específica.
 */
export function WhatsappFloat() {
  return (
    <WhatsappLink
      href={waLink("Olá! Vi o site da Avança Imóveis e gostaria de mais informações.")}
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-6 w-6" />
    </WhatsappLink>
  );
}
