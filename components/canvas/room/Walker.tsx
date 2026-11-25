"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useUI, type Spot } from "@/store/ui";
import { HOME_VIEW } from "./CameraRig";
import { awayFromDesk, BED_FACE, placeOnChair, sitSpot, standing, wrap } from "./laavanya";
import { JUNCTION, ROUTES, type P2 } from "./sections";

/**
 * Moves Laavanya when a section opens or closes (after the entrance). To leave her chair she turns it
 * to face the room, gets up and steps forward; she walks a route to the section's spot and turns to
 * face the visitor. Going home she walks back to the spot in front of the chair, turns her back to it
 * and sits down, facing the camera, before her spin eases in. Work keeps her seated (she swivels to
 * the laptop, see Character). Deep links and reduced motion put her straight in place.
 */

const SPEED = 2.0; // metres per second
const TURN = 10; // how quickly she turns towards where she's going
const RISE = 0.45; // seconds to get up or sit down
const UP_FACE = Math.PI; // she gets up facing north, towards the room

type Goal = Exclude<Spot, "work"> | "chair";
type Phase = "seated" | "rising" | "walking" | "sitting" | "standing";

/** The way she sits down, facing the camera's corner (phones: the visitor on the bed) but never towards the desk. */
function sitFace(phone: boolean) {
  return awayFromDesk(phone ? BED_FACE : HOME_VIEW.az + useUI.getState().turns * (Math.PI / 2));
}

export default function Walker({
  section,
  entering,
  reducedMotion,
  phone = false,
}: {
  section: Spot | null;
  entering: boolean;
  reducedMotion: boolean;
  phone?: boolean;
}) {
  const goal = useRef<Goal | null>(null);
  const phase = useRef<Phase>("seated");
  const path = useRef<P2[]>([]);
  const at = useRef<Goal>("chair"); // where she last arrived
  const face = useRef(UP_FACE); // the way she sits down / gets up
  const wait = useRef(0); // seconds spent waiting for the chair to turn

  /** Walk from where she is now to `to`: back out along her current route, then on along the new one. */
  function planWalk(to: Goal) {
    const atSpot = phase.current === "standing" && at.current !== "chair";
    const back: P2[] = atSpot ? ROUTES[at.current as Exclude<Goal, "chair">].slice(0, -1).reverse() : [];
    let end: P2[];
    if (to === "chair") {
      face.current = sitFace(phone);
      end = [JUNCTION, sitSpot(face.current)];
    } else end = atSpot ? ROUTES[to] : [JUNCTION, ...ROUTES[to]];
    path.current = [...back, ...end];
    standing.seat = 0;
    standing.walking = true;
    phase.current = "walking";
  }

  useFrame(({ camera }, rawDt) => {
    if (entering) return; // the entrance moves her itself
    const dt = Math.min(rawDt, 0.1); // a stalled frame shouldn't make her jump
    const want: Goal = section && section !== "work" ? section : "chair";

    if (goal.current !== want) {
      const first = goal.current === null;
      goal.current = want;
      if (first || reducedMotion) {
        // deep link / after the entrance / reduced motion: just be there
        path.current = [];
        standing.walking = false;
        standing.chairFace = null;
        if (want === "chair") {
          // after the entrance she is already seated facing the camera; keep that
          if (!first || standing.seat < 1) placeOnChair(face.current, 1);
          phase.current = "seated";
        } else {
          const route = ROUTES[want];
          [standing.x, standing.z] = route[route.length - 1];
          standing.seat = 0;
          phase.current = "standing";
        }
        at.current = want;
      } else if (phase.current === "seated" || phase.current === "sitting") {
        if (want !== "chair") {
          // get up first (the chair turns to face the room)
          face.current = UP_FACE;
          standing.chairFace = UP_FACE;
          wait.current = 0;
          phase.current = "rising";
        }
      } else if (phase.current === "rising" && want === "chair") {
        phase.current = "sitting"; // changed her mind: sit back down
      } else {
        planWalk(want);
      }
    }

    switch (phase.current) {
      case "rising": {
        // wait for the chair to turn (briefly), then stand up and step forward
        wait.current += dt;
        if (Math.abs(wrap(standing.chairAngle - face.current)) > 0.2 && wait.current < 0.7) {
          placeOnChair(face.current, standing.seat);
          break;
        }
        placeOnChair(face.current, Math.max(0, standing.seat - dt / RISE));
        if (standing.seat <= 0) {
          standing.chairFace = null;
          planWalk(goal.current!);
        }
        break;
      }
      case "sitting": {
        // turn her back to the chair, then sit down
        standing.chairFace = face.current;
        const off = wrap(face.current - standing.heading);
        if (standing.seat === 0 && Math.abs(off) > 0.08) {
          standing.heading += off * Math.min(1, dt * TURN);
          break;
        }
        placeOnChair(face.current, Math.min(1, standing.seat + dt / RISE));
        if (standing.seat >= 1) {
          standing.chairFace = null; // her spin can begin
          at.current = "chair";
          phase.current = "seated";
        }
        break;
      }
      case "walking": {
        let step = SPEED * dt;
        const p = path.current;
        while (step > 0 && p.length) {
          const [tx, tz] = p[0];
          const dx = tx - standing.x;
          const dz = tz - standing.z;
          const d = Math.hypot(dx, dz);
          if (d > 1e-4) standing.heading += wrap(Math.atan2(dx, dz) - standing.heading) * Math.min(1, dt * TURN);
          if (d <= step) {
            standing.x = tx;
            standing.z = tz;
            step -= d;
            p.shift();
          } else {
            standing.x += (dx / d) * step;
            standing.z += (dz / d) * step;
            step = 0;
          }
        }
        standing.walking = p.length > 0;
        if (!p.length) {
          if (goal.current === "chair") phase.current = "sitting";
          else {
            at.current = goal.current!;
            phase.current = "standing";
          }
        }
        break;
      }
      case "standing": {
        // at a spot: face the visitor
        const toCam = Math.atan2(camera.position.x - standing.x, camera.position.z - standing.z);
        standing.heading += wrap(toCam - standing.heading) * Math.min(1, dt * 6);
        break;
      }
    }
  });

  return null;
}
