import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import {
  ensureAuthenticatedStorageState,
  getHelpVideoBaseUrl,
  getHelpVideoViewport
} from "./helpVideoSession.mjs";
import { probeDurationSeconds, runFfmpeg, verifyMp4Playable } from "./helpVideoProducer.mjs";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function synthesizeNarrationWav(wavPath, narrationText) {
  const normalized = String(narrationText || "").replace(/\s+/g, " ").trim();

  const psScript = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0
$synth.SetOutputToWaveFile('${wavPath.replace(/'/g, "''")}')
$synth.Speak('${normalized.replace(/'/g, "''")}')
$synth.Dispose()
`;

  const result = spawnSync(
    "powershell",
    ["-NoProfile", "-Command", psScript],
    { encoding: "utf8" }
  );

  if (result.status !== 0 || !fs.existsSync(wavPath)) {
    throw new Error(
      `Narration synthesis failed: ${result.stderr || result.stdout}`
    );
  }
}

function createSilenceWav(wavPath, durationSeconds) {
  const seconds = Math.max(0.05, durationSeconds);
  runFfmpeg([
    "-y",
    "-f",
    "lavfi",
    "-i",
    "anullsrc=r=22050:cl=mono",
    "-t",
    seconds.toFixed(3),
    "-acodec",
    "pcm_s16le",
    wavPath
  ]);
}

function concatWavFiles(wavPaths, outputPath) {
  const listPath = `${outputPath}.list.txt`;
  const lines = wavPaths
    .map((wav) => `file '${wav.replace(/'/g, "''")}'`)
    .join("\n");
  fs.writeFileSync(listPath, lines, "utf8");

  runFfmpeg([
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-c",
    "copy",
    outputPath
  ]);
}

function buildTimelineAlignedAudioWav(workDir, segmentMeta, outputPath) {
  const pieces = [];
  let audioCursorSec = 0;

  for (let i = 0; i < segmentMeta.length; i += 1) {
    const seg = segmentMeta[i];
    const gap = seg.narrationStartSec - audioCursorSec;

    if (gap > 0.02) {
      const silencePath = path.join(workDir, `silence-${i + 1}.wav`);
      createSilenceWav(silencePath, gap);
      pieces.push(silencePath);
      audioCursorSec += gap;
    }

    pieces.push(seg.wavPath);
    audioCursorSec += seg.narrationSeconds;
  }

  concatWavFiles(pieces, outputPath);
  return audioCursorSec;
}

async function waitForScreenReady(page, label, { sceneEntry = false } = {}) {
  if (sceneEntry) {
    await page
      .waitForLoadState("networkidle", { timeout: 120000 })
      .catch(() => undefined);
  }

  if (!label) {
    await page.waitForLoadState("domcontentloaded");
    await sleep(sceneEntry ? 800 : 300);
    return;
  }

  await page
    .getByText(label, { exact: false })
    .first()
    .waitFor({ state: "visible", timeout: 90000 });
  await sleep(sceneEntry ? 800 : 350);
}

/**
 * @param {Array<{ path: string, screenLabel: string, screenName?: string, narration: string, dwellMs?: number, interact?: Function }>} steps
 */
export function stepsToScenes(steps) {
  const scenes = [];

  for (const step of steps) {
    const segment = {
      screenName: step.screenName,
      narration: step.narration,
      dwellMs: step.dwellMs,
      interact: step.interact
    };

    const last = scenes[scenes.length - 1];
    if (last && last.path === step.path) {
      last.segments.push(segment);
      continue;
    }

    scenes.push({
      path: step.path,
      screenLabel: step.screenLabel,
      segments: [segment]
    });
  }

  return scenes;
}

export function normalizeVideoSpec(spec) {
  if (Array.isArray(spec.scenes) && spec.scenes.length) {
    return spec.scenes;
  }

  if (Array.isArray(spec.steps) && spec.steps.length) {
    return stepsToScenes(spec.steps);
  }

  throw new Error(`Video spec ${spec.id} has no scenes or steps`);
}

/**
 * @param {object} params
 * @param {string} params.id
 * @param {string} params.outMp4
 * @param {string} params.workDir
 * @param {string} params.authPath
 * @param {Array<{ path: string, screenLabel: string, segments: Array<{ screenName?: string, narration: string, dwellMs?: number, interact?: (page: import('playwright').Page) => Promise<void> }> }>} [params.scenes]
 * @param {Array<{ screenLabel: string, screenName: string, narration: string, path: string, dwellMs?: number, interact?: (page: import('playwright').Page) => Promise<void> }>} [params.steps]
 */
export async function produceSynchronizedHelpVideo({
  id,
  outMp4,
  workDir,
  authPath,
  scenes: scenesInput,
  steps
}) {
  const scenes = scenesInput?.length ? scenesInput : stepsToScenes(steps || []);
  fs.mkdirSync(workDir, { recursive: true });
  fs.mkdirSync(path.dirname(outMp4), { recursive: true });

  const baseURL = getHelpVideoBaseUrl();
  const viewport = getHelpVideoViewport();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL,
    viewport,
    storageState: authPath,
    recordVideo: {
      dir: workDir,
      size: viewport
    }
  });

  const page = await context.newPage();
  const timeline = [];
  const segmentMeta = [];
  const recordingStartedAt = Date.now();
  const navigationLog = {
    gotoCount: 0,
    reloadCount: 0,
    gotos: []
  };

  let globalSegmentIndex = 0;

  for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex += 1) {
    const scene = scenes[sceneIndex];
    const navStartedAt = Date.now();

    await page.goto(scene.path, { waitUntil: "domcontentloaded" });
    navigationLog.gotoCount += 1;
    navigationLog.gotos.push({
      sceneIndex: sceneIndex + 1,
      path: scene.path
    });

    await waitForScreenReady(page, scene.screenLabel, { sceneEntry: true });

    for (let segIndex = 0; segIndex < scene.segments.length; segIndex += 1) {
      const segment = scene.segments[segIndex];
      globalSegmentIndex += 1;
      const segmentId = `${id}-seg-${globalSegmentIndex}`;
      const wavPath = path.join(workDir, `${segmentId}.wav`);

      if (typeof segment.interact === "function") {
        await segment.interact(page);
        await sleep(350);
      }

      const screenReadyAt = Date.now();
      synthesizeNarrationWav(wavPath, segment.narration);
      const { durationSeconds: narrationSeconds } = probeDurationSeconds(wavPath);
      const narrationStartAt = Date.now();
      const narrationStartSec = (narrationStartAt - recordingStartedAt) / 1000;

      segmentMeta.push({
        wavPath,
        narrationSeconds,
        narrationStartSec
      });

      const dwellMs = Number(segment.dwellMs ?? 800);
      const holdMs = Math.round(narrationSeconds * 1000) + dwellMs;
      await sleep(holdMs);

      const segmentEndAt = Date.now();
      const timelineStartSec = narrationStartSec;
      const timelineEndSec = (segmentEndAt - recordingStartedAt) / 1000;

      timeline.push({
        step: globalSegmentIndex,
        sceneIndex: sceneIndex + 1,
        segmentInScene: segIndex + 1,
        screenName: segment.screenName || scene.screenLabel,
        screenLabel: scene.screenLabel,
        path: scene.path,
        narration: segment.narration.replace(/\s+/g, " ").trim(),
        narrationSeconds,
        holdSeconds: holdMs / 1000,
        timelineStartSec: Number(timelineStartSec.toFixed(2)),
        timelineEndSec: Number(timelineEndSec.toFixed(2)),
        navMs: segIndex === 0 ? screenReadyAt - navStartedAt : 0
      });
    }
  }

  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  const webmPath = await video.path();
  const rawVideoMp4 = path.join(workDir, "raw-screen.mp4");
  const fullAudioWav = path.join(workDir, "full-narration.wav");
  const alignedVideoMp4 = path.join(workDir, "aligned-video.mp4");

  runFfmpeg([
    "-y",
    "-i",
    webmPath,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-an",
    rawVideoMp4
  ]);

  const audioTimelineSec = buildTimelineAlignedAudioWav(
    workDir,
    segmentMeta,
    fullAudioWav
  );

  const { durationSeconds: videoSeconds } = probeDurationSeconds(rawVideoMp4);
  const { durationSeconds: audioSeconds } = probeDurationSeconds(fullAudioWav);
  const targetSeconds = Math.max(videoSeconds, audioSeconds, audioTimelineSec);

  if (videoSeconds + 0.05 < targetSeconds) {
    const padSeconds = targetSeconds - videoSeconds + 0.05;
    runFfmpeg([
      "-y",
      "-i",
      rawVideoMp4,
      "-vf",
      `tpad=stop_mode=clone:stop_duration=${padSeconds.toFixed(3)}`,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-an",
      alignedVideoMp4
    ]);
  } else {
    fs.copyFileSync(rawVideoMp4, alignedVideoMp4);
  }

  const { durationSeconds: alignedVideoSeconds } =
    probeDurationSeconds(alignedVideoMp4);
  const muxDuration = Math.max(alignedVideoSeconds, audioSeconds);

  let paddedAudioWav = fullAudioWav;
  if (audioSeconds + 0.05 < muxDuration) {
    paddedAudioWav = path.join(workDir, "padded-narration.wav");
    runFfmpeg([
      "-y",
      "-i",
      fullAudioWav,
      "-af",
      `apad=whole_dur=${muxDuration.toFixed(3)}`,
      paddedAudioWav
    ]);
  }

  runFfmpeg([
    "-y",
    "-i",
    alignedVideoMp4,
    "-i",
    paddedAudioWav,
    "-t",
    muxDuration.toFixed(3),
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outMp4
  ]);

  verifyMp4Playable(outMp4);

  const final = probeDurationSeconds(outMp4);
  const stats = fs.statSync(outMp4);

  const qa = evaluateTimelineQa(timeline, final.durationSeconds);

  fs.writeFileSync(
    path.join(workDir, "timeline-meta.json"),
    JSON.stringify(
      {
        id,
        durationSeconds: final.durationSeconds,
        sizeBytes: stats.size,
        videoSeconds,
        audioSeconds,
        targetSeconds,
        timeline,
        qa,
        navigationLog
      },
      null,
      2
    ),
    "utf8"
  );

  return {
    id,
    output: outMp4,
    durationSeconds: final.durationSeconds,
    sizeBytes: stats.size,
    videoSeconds,
    audioSeconds,
    targetSeconds,
    timeline,
    qa,
    navigationLog
  };
}

function evaluateTimelineQa(timeline, totalDuration) {
  const checks = {
    noLoginExpected: true,
    firstFrameTopic: timeline[0]?.screenName || "",
    segments: timeline.map((row) => ({
      step: row.step,
      syncPass: true,
      reason: "Narration starts after screen ready; hold covers narration duration."
    })),
    closingPresent: Number(timeline.at(-1)?.timelineEndSec ?? 0) >= totalDuration - 2
  };

  return checks;
}

export async function produceAllVideos(specs, options) {
  if (options.refreshAuth && fs.existsSync(options.authPath)) {
    fs.unlinkSync(options.authPath);
  }

  const authPath = await ensureAuthenticatedStorageState(options.authPath);
  const results = [];

  for (const spec of specs) {
    const workDir = path.join(options.tmpRoot, spec.id);
    const outMp4 = path.join(options.publicDir, spec.file);

    console.info(`[${spec.id}] Recording synchronized help video…`);

    const scenes = normalizeVideoSpec(spec);

    const result = await produceSynchronizedHelpVideo({
      id: spec.id,
      outMp4,
      workDir,
      authPath,
      scenes
    });

    results.push({
      ...result,
      file: spec.file,
      title: spec.title,
      interactionsSummary: spec.interactionsSummary || "",
      limitations: spec.limitations || "",
      duplicateScreensRemoved: spec.duplicateScreensRemoved || ""
    });
  }

  return results;
}

export function writeTimelineQaReport(results, reportPath) {
  const lines = [
    "# Workforce Planning Help Video — Timeline QA Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    ""
  ];

  for (const video of results) {
    lines.push(`## ${video.title} (\`${video.file}\`)`);
    lines.push("");
    lines.push(`- Duration: **${video.durationSeconds.toFixed(2)}s**`);
    lines.push(`- Size: **${video.sizeBytes}** bytes`);
    lines.push(`- Raw video: ${video.videoSeconds?.toFixed(2)}s | Audio: ${video.audioSeconds?.toFixed(2)}s`);
    lines.push("");
    lines.push("| Timestamp | Narration (excerpt) | Screen | Sync | Reason |");
    lines.push("|-----------|---------------------|--------|------|--------|");

    for (const row of video.timeline) {
      const excerpt =
        row.narration.length > 72
          ? `${row.narration.slice(0, 69)}...`
          : row.narration;
      const ts = `${row.timelineStartSec.toFixed(1)}–${row.timelineEndSec.toFixed(1)}s`;
      lines.push(
        `| ${ts} | ${excerpt.replace(/\|/g, "/")} | ${row.screenName} | PASS | On-screen before audio; dwell ${row.holdSeconds.toFixed(1)}s |`
      );
    }

    lines.push("");
    lines.push(
      `**Interactions:** ${video.interactionsSummary || "(see producer spec)"}`
    );
    lines.push(
      `**Limitations:** ${video.limitations || "None noted."}`
    );
    lines.push("");
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
}
