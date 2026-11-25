import { expect, it } from "vitest";
import { chapterAt, chapterStops, choreography } from "@/components/motion/choreography";

it("reconstructs the curved sofa, vase and bed paths in either direction", () => {
  const poses = chapterStops.map(choreography);
  expect([...chapterStops].reverse().map(choreography).reverse()).toEqual(poses);
  expect(poses[0].sofa.x).toBeGreaterThan(poses[1].sofa.x + 4);
  expect(poses[2].sofa.angle).toBeGreaterThan(poses[1].sofa.angle);
  expect(poses[2].vase.x).toBeLessThan(poses[1].vase.x - 4);
  expect(poses[3].vase.x).toBeLessThan(poses[2].vase.x - 4);
  expect(poses[3].bed.x).toBeLessThan(poses[2].bed.x - 4);
  expect(choreography(.64).bed.angle).toBeGreaterThan(choreography(.5).bed.angle);
  expect(choreography(-1)).toEqual(poses[0]);
  expect(choreography(2)).toEqual(choreography(1));
});

it("ties six controls to the chamber, lighting gallery and salon dissolve", () => {
  expect(chapterStops.map(chapterAt)).toEqual([0,1,2,3,4,5]);
  const poses=chapterStops.map(choreography);
  expect(poses[3].chamber).toBe(1);
  expect(poses[4].chandelier.y).toBeLessThan(poses[3].chandelier.y-3);
  expect(poses[4].warmth).toBe(1);
  expect(poses[4].camera.aim).toBeGreaterThan(poses[1].camera.aim);
  expect(poses[5].veil).toBe(0);
});
