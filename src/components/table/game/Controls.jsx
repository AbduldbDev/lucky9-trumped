import ActionBar from "./ActionBar.jsx";
import TrumpTray from "./TrumpTray.jsx";

/**
 * Bottom control stack: Hit/Stand row on top, trump card tray below.
 * All behavior lives in the child components; this is composition only.
 */
export default function Controls(props) {
  const { view, isDealing = false } = props;
  const waitingForCounterResponse = view?.waitingForCounterResponse ?? false;

  return (
    <div
      className="flex flex-col gap-1.5 sm:gap-2.5 w-full min-w-0 px-2 sm:px-3 pt-1.5 sm:pt-2.5 pb-0.5 sm:pb-1
        border-t border-gold/15 bg-ink/60 backdrop-blur-md"
    >
      {/* Top: Hit / Stand (full width) */}
      <ActionBar
        {...props}
        waitingForCounterResponse={waitingForCounterResponse}
        isDealing={isDealing}
      />

      {/* Bottom: Trump cards (full width) */}
      <TrumpTray
        {...props}
        waitingForCounterResponse={waitingForCounterResponse}
        isDealing={isDealing}
      />
    </div>
  );
}
