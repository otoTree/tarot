import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { getTranslation } from "@/lib/i18n";
import { PLANS, PRICING_PLANS } from "@/lib/pricing";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

interface PricingCardsProps {
  className?: string;
  isModal?: boolean;
}

export function PricingCards({ className, isModal = false }: PricingCardsProps) {
  const { language } = useStore();
  const { user } = useAuthStore();
  const t = getTranslation(language);
  // const [loading, setLoading] = useState<string | null>(null);

  /*
  const handleSubscribe = async (planKey: string) => {
    if (!user) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    try {
      setLoading(planKey);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planKey }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };
  */

  const plans = [
    {
      key: PLANS.BASIC,
      config: PRICING_PLANS[PLANS.BASIC],
      trans: t.pricing.plans.basic,
    },
    {
      key: PLANS.PRO,
      config: PRICING_PLANS[PLANS.PRO],
      trans: t.pricing.plans.pro,
      featured: true,
    },
    {
      key: PLANS.PREMIUM,
      config: PRICING_PLANS[PLANS.PREMIUM],
      trans: t.pricing.plans.premium,
    },
  ];

  const formatFeatureValue = (feature: string, value: number | boolean | string | { limit: number; type: string }) => {
    if (typeof value === 'boolean') {
      return value ? <Check className="h-4 w-4 text-emerald-500" /> : <span className="text-black/20">-</span>;
    }
    
    if (typeof value === 'object' && 'limit' in value) {
        if (value.limit === -1) return t.pricing.values.unlimited;
        if (value.limit === 0) return <span className="text-black/20">-</span>;
        return `${value.limit} ${t.pricing.values.times}${value.type === 'month' ? t.pricing.monthly : ''}`;
    }

    if (feature === 'historyDays') {
        if (value === -1) return t.pricing.values.lifetime;
        return `${value} ${t.pricing.values.days}`;
    }
    
    if (feature === 'apiAccess') {
        if (value === 'none') return <span className="text-black/20">-</span>;
        return <Check className="h-4 w-4 text-emerald-500" />;
    }

    return value;
  };

  const featureKeys = [
    'aiReadings',
    'historyDays',
    'importOthers',
    'dailyFortune',
    'reportExport',
    'apiAccess',
    'consultation'
  ] as const;

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-8", className)}>
      {plans.map((plan, index) => (
        <motion.div
          key={plan.key}
          initial={isModal ? { opacity: 0, scale: 0.95 } : { opacity: 0, y: 20 }}
          whileInView={isModal ? undefined : { opacity: 1, y: 0 }}
          animate={isModal ? { opacity: 1, scale: 1 } : undefined}
          viewport={isModal ? undefined : { once: true }}
          transition={{ delay: index * 0.1 + (isModal ? 0 : 0.2) }}
          className={cn(
            "relative p-10 rounded-2xl border bg-white/40 backdrop-blur-md flex flex-col transition-all duration-500",
            plan.featured 
              ? "bg-white/70 shadow-2xl shadow-slate-200/50 border-slate-200 z-10 scale-[1.02]" 
              : "border-slate-100 hover:bg-white/60 hover:shadow-xl hover:shadow-slate-200/30 hover:border-slate-200/60 hover:-translate-y-1"
          )}
        >
          <div className="mb-10">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-heading font-medium text-slate-800 uppercase tracking-widest">{plan.trans.name}</h3>
              {plan.featured && (
                <span className="bg-slate-900 text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-medium">Most Popular</span>
              )}
            </div>
            
            <div className="flex items-baseline gap-1 mb-6 group-hover:scale-105 transition-transform duration-500 origin-left">
              <span className="text-5xl font-light font-heading tracking-tighter text-slate-900">${plan.config.price}</span>
              <span className="text-slate-400 text-sm font-light uppercase tracking-wide">/ {t.pricing.monthly}</span>
            </div>
            <p className="text-sm text-slate-500 font-sans font-light leading-relaxed min-h-[40px]">
              {plan.trans.description}
            </p>
          </div>

          <div className="flex-1 space-y-5 mb-10">
            {featureKeys.map((key) => {
              const label = t.pricing.features[key === 'aiReadings' ? 'ai_readings' : 
                                             key === 'historyDays' ? 'history_days' :
                                             key === 'importOthers' ? 'import_others' :
                                             key === 'dailyFortune' ? 'daily_fortune' :
                                             key === 'reportExport' ? 'report_export' :
                                             key === 'apiAccess' ? 'api_access' : 'consultation'];
              
              const value = formatFeatureValue(key, plan.config.features[key]);
              
              return (
                <div key={key} className="flex items-center justify-between text-sm group/item">
                  <span className="text-slate-500 group-hover/item:text-slate-700 transition-colors">{label}</span>
                  <span className="font-medium text-slate-800">{value}</span>
                </div>
              );
            })}
          </div>

          <Button 
            variant={plan.featured ? "default" : "outline"}
            className={cn(
              "w-full rounded-xl h-12 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 shadow-sm",
              plan.featured 
                ? "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:scale-[1.02]" 
                : "bg-white/50 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300 hover:shadow-md"
            )}
            disabled={true}
          >
            {user?.plan === plan.key 
              ? (language === 'zh' ? '当前计划' : 'Current Plan')
              : (language === 'zh' ? '暂未开放' : 'Coming Soon')
            }
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
