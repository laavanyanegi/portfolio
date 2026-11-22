/**
 * Placeholder for the persistent room canvas (Phase 4 swaps in the lazy-loaded R3F <Canvas> here).
 * Pure CSS so the site is fully readable without WebGL.
 */
export default function RoomSlot() {
  return (
    <div id="room-slot" aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 25%, var(--room-top), transparent 70%), linear-gradient(180deg, var(--room-mid), var(--room-low))",
        }}
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" style={{ background: "var(--shade)" }} />
    </div>
  );
}
