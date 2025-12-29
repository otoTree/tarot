import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { getTranslation } from "@/lib/i18n";
import { PricingCards } from "./PricingCards";

export function PricingSection() {
  const { language } = useStore();
  const t = getTranslation(language);

  return (
    <section className="w-full py-32 px-4 relative overflow-hidden" id="pricing">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 items-end">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-6xl md:text-8xl font-heading font-light tracking-tighter text-black leading-[0.9]">
              PRICING <br />
              <span className="text-black/30 text-4xl md:text-6xl tracking-normal block mt-2">PLANS</span>
            </h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="pb-4"
          >
            <p className="text-xl text-black/60 font-light max-w-md ml-auto md:text-right">
              {t.pricing.subtitle}
            </p>
          </motion.div>
        </div>

        <PricingCards />
      </div>
    </section>
  );
}

