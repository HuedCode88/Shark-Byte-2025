type Props = {
  targetId?: string; // id of the element to scroll to; defaults to bottom of document
};

export default function ScrollToBottomButton({
  targetId = "page-bottom",
}: Props) {
  const handleClick = () => {
    try {
      const el = document.getElementById(targetId);
      // helper: find nearest scrollable ancestor (including document.scrollingElement)
      const findScrollableAncestor = (
        node: HTMLElement | null
      ): Element | null => {
        let el: HTMLElement | null = node;
        while (el) {
          const style = window.getComputedStyle(el);
          const overflowY = style.overflowY;
          const isScrollable =
            (overflowY === "auto" ||
              overflowY === "scroll" ||
              overflowY === "overlay") &&
            el.scrollHeight > el.clientHeight;
          if (isScrollable) return el;
          el = el.parentElement;
        }
        // fallback to document.scrollingElement or body
        return document.scrollingElement || document.documentElement;
      };

      if (el) {
        const ancestor = findScrollableAncestor(el) as Element;
        // If ancestor is the document scrolling element, use window-based math
        if (
          ancestor === document.scrollingElement ||
          ancestor === document.documentElement ||
          ancestor === document.body
        ) {
          const docHeight = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight
          );
          const targetTop = Math.max(0, docHeight - window.innerHeight);
          window.scrollTo({ top: targetTop, behavior: "smooth" });
        } else {
          // ancestor is a scrollable container; compute scrollTop relative to that container
          const anc = ancestor as HTMLElement;
          const ancRect = anc.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          // element bottom relative to ancestor's scroll top
          const elBottomRelativeToAnc =
            elRect.bottom - ancRect.top + anc.scrollTop;
          let targetTop = Math.min(
            elBottomRelativeToAnc - anc.clientHeight,
            anc.scrollHeight - anc.clientHeight
          );
          if (targetTop < 0) targetTop = 0;
          anc.scrollTo({ top: targetTop, behavior: "smooth" });
        }
      } else {
        // fallback: scroll nearest scrollable ancestor to its bottom
        const ancestor = findScrollableAncestor(document.body) as Element;
        const anc = ancestor as HTMLElement;
        if (
          anc === document.scrollingElement ||
          anc === document.documentElement ||
          anc === document.body
        ) {
          const docHeight = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight
          );
          const targetTop = Math.max(0, docHeight - window.innerHeight);
          window.scrollTo({ top: targetTop, behavior: "smooth" });
        } else {
          const targetTop = Math.max(0, anc.scrollHeight - anc.clientHeight);
          anc.scrollTo({ top: targetTop, behavior: "smooth" });
        }
      }
    } catch (e) {
      // last-resort fallback
      try {
        const docHeight = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight
        );
        const targetTop = Math.max(0, docHeight - window.innerHeight);
        window.scrollTo({ top: targetTop, behavior: "smooth" });
      } catch (_) {
        // give up silently
      }
    }
  };

  return (
    <button
      aria-label="Scroll to bottom"
      title="Scroll to bottom"
      className="scroll-bottom-btn"
      onClick={handleClick}
    >
      {/* Simple down arrow — SVG for crispness */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M12 5v14M19 12l-7 7-7-7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
