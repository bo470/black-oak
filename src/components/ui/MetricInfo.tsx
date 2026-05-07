import * as React from "react";
import { Info, X } from "lucide-react";
import { useTranslation } from "@/src/hooks/useTranslation";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface MetricInfoProps {
  metricName: string;
  className?: string;
}

export function MetricInfo({ metricName, className }: MetricInfoProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useTranslation();

  const explanation = t.metricExplanations[metricName];

  if (!explanation) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={className || "p-1 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-slate-400"}
        title={metricName}
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={metricName}
        type="bottom-sheet"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-500">Explanation</h4>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-sm">
              {explanation.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Trade Example</h4>
              <p className="text-xs font-medium text-slate-700 dark:text-gray-300 italic">
                {explanation.example}
              </p>
            </div>

            {explanation.formula && (
              <div className="rounded-2xl bg-blue-50/30 p-4 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/20">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Formula</h4>
                <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {explanation.formula}
                </p>
              </div>
            )}

            {explanation.meaning && (
              <div className="rounded-2xl bg-emerald-50/30 p-4 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/20">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Meaning for Beginners</h4>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {explanation.meaning}
                </p>
              </div>
            )}
          </div>

          <Button 
            className="w-full h-14 rounded-2xl text-base font-bold shadow-xl mt-4" 
            onClick={() => setIsOpen(false)}
          >
            Got it
          </Button>
        </div>
      </Modal>
    </>
  );
}
