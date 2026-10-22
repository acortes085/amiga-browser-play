import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import {
  detectGameFromFiles,
  cleanGameTitle,
  slugifyTitle,
  buildGameLaunchData,
} from "@/lib/customGame";

// Mock URL.createObjectURL
if (typeof URL.createObjectURL === "undefined") {
  URL.createObjectURL = (blob: Blob | MediaSource) => `blob:http://localhost/${Math.random()}`;
}

describe("Custom Game - Amiga disk handling", () => {
  it("cleans title properly from diverse Amiga disk naming conventions", () => {
    expect(cleanGameTitle("Monkey_Island_Disk_1.adf")).toBe("Monkey Island");
    expect(cleanGameTitle("Lotus_Esprit_Turbo_Challenge_2_(Disk 1 of 2).adf")).toBe(
      "Lotus Esprit Turbo Challenge 2"
    );
    expect(cleanGameTitle("Superfrog [Disk 2].adf")).toBe("Superfrog");
    expect(cleanGameTitle("Turrican-II-Disk1.adf")).toBe("Turrican II");
    expect(cleanGameTitle("SensibleSoccer.zip")).toBe("SensibleSoccer");
  });

  it("slugifies titles safely", () => {
    expect(slugifyTitle("Monkey Island")).toBe("monkey-island");
    expect(slugifyTitle("North & South!!")).toBe("north-south");
  });

  it("rejects non-amiga file extensions", () => {
    const invalidFiles = [new File(["dummy"], "readme.txt", { type: "text/plain" })];
    expect(detectGameFromFiles(invalidFiles)).toBeNull();
  });

  it("detects single .adf file as boot disk", () => {
    const file = new File(["dummy ADF content"], "Pang.adf");
    const game = detectGameFromFiles([file]);

    expect(game).not.toBeNull();
    expect(game?.title).toBe("Pang");
    expect(game?.isMultiDisk).toBe(false);
    expect(game?.isZip).toBe(false);
    expect(game?.disks).toHaveLength(1);
    expect(game?.disks[0].label).toContain("DF0:");
  });

  it("detects single .zip file", () => {
    const file = new File(["dummy ZIP content"], "Agony.zip");
    const game = detectGameFromFiles([file]);

    expect(game).not.toBeNull();
    expect(game?.title).toBe("Agony");
    expect(game?.isMultiDisk).toBe(false);
    expect(game?.isZip).toBe(true);
  });

  it("naturally sorts multiple .adf files and assigns drive labels", () => {
    // Deliberately unsorted input: Disk 10, Disk 2, Disk 1
    const file10 = new File(["d10"], "Game_Disk10.adf");
    const file2 = new File(["d2"], "Game_Disk2.adf");
    const file1 = new File(["d1"], "Game_Disk1.adf");

    const game = detectGameFromFiles([file10, file2, file1]);

    expect(game).not.toBeNull();
    expect(game?.isMultiDisk).toBe(true);
    expect(game?.disks).toHaveLength(3);

    // Natural sort order must be Disk 1, Disk 2, Disk 10
    expect(game?.disks[0].name).toBe("Game_Disk1.adf");
    expect(game?.disks[0].label).toContain("DF0: Disco 1");
    expect(game?.disks[1].name).toBe("Game_Disk2.adf");
    expect(game?.disks[2].name).toBe("Game_Disk10.adf");
  });

  it("builds multi-disk ZIP in memory with an .m3u playlist file", async () => {
    const file1 = new File(["disk 1 data"], "Indiana_Disk1.adf");
    const file2 = new File(["disk 2 data"], "Indiana_Disk2.adf");

    const game = detectGameFromFiles([file2, file1])!;
    expect(game).not.toBeNull();

    const launchData = await buildGameLaunchData(game);

    expect(launchData.blob).toBeDefined();
    expect(launchData.blobUrl).toContain("blob:");
    expect(launchData.name).toBe(`${game.slug}.zip`);
  });
});
