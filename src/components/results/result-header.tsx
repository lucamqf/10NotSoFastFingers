import { ResultItem } from "@/components/results/result-item";
import { MINUTE_IN_SECONDS, SECOND_IN_MILLISECONDS } from "@/constants/time";
import { useThrottle } from "@/hooks/use-throttle";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

interface IResultHeaderProps {
  wordsCount: number;
  time: number;
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
}

export const ResultHeader = forwardRef<HTMLDivElement, IResultHeaderProps>(
  (
    {
      wordsCount,
      time,
      totalCharacters,
      correctCharacters,
      incorrectCharacters,
    },
    ref
  ) => {
    const { t } = useTranslation();

    const throttledWordsPerMinute = useThrottle(
      getWordsPerMinute(),
      10 * SECOND_IN_MILLISECONDS
    );

    function getWordsPerMinute() {
      if (wordsCount === 0) return 0;

      const wordsPerMinute = wordsCount / (time / MINUTE_IN_SECONDS);
      const formattedWordsPerMinute = Number.isNaN(wordsPerMinute)
        ? 0
        : Math.floor(wordsPerMinute);

      return formattedWordsPerMinute;
    }

    function getPrecision() {
      const precision = (correctCharacters / totalCharacters) * 100;
      const formattedPrecision = Number.isNaN(precision)
        ? 0
        : Math.floor(precision);

      return Math.max(formattedPrecision, 0);
    }

    const itemClasses = "text-text font-normal";

    return (
      <div ref={ref} className="flex gap-4 text-neutral-300">
        <ResultItem.Item
          className={itemClasses}
          hierarchy="tertiary"
          title={t("result.totalCharacters")}
          value={totalCharacters}
        />
        <ResultItem.Item
          className={itemClasses}
          hierarchy="tertiary"
          title={t("result.correctCharacters")}
          value={correctCharacters}
        />
        <ResultItem.Item
          className={itemClasses}
          hierarchy="tertiary"
          title={t("result.incorrectCharacters")}
          value={incorrectCharacters}
        />
        <ResultItem.Item
          className={itemClasses}
          hierarchy="tertiary"
          title={t("result.accuracy")}
          value={`${getPrecision()}%`}
        />
        <ResultItem.Item
          className={itemClasses}
          hierarchy="tertiary"
          title={t("result.wordsPerMinute")}
          value={throttledWordsPerMinute}
        />
      </div>
    );
  }
);
