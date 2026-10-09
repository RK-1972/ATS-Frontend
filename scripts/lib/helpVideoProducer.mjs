import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import { loginAs } from "../../e2e/helpers/session.mjs";
import { demoPassword, userEmail } from "../../e2e/helpers/demo-config.mjs";

const BASE_URL = process.env.HELP_VIDEO_BASE_URL || "http://localhost:5173";

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function runFfmpeg(args) {
  const binary = ffmpegPath || "ffmpeg";
  const result = spawnSync(binary, args, { stdio: "inherit" });

  if (result.status !== 0) {
    throw new Error(`ffmpeg failed: ${args.join(" ")}`);
  }
}

export function probeDurationSeconds(mediaPath) {
  const binary = ffprobePath?.path || "ffprobe";

  const result = spawnSync(
    binary,
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration,size",
      "-of",
      "json",
      mediaPath
    ],
    { encoding: "utf8" }
  );

  if (result.status !== 0) {
    throw new Error(`ffprobe failed for ${mediaPath}`);
  }

  const payload = JSON.parse(result.stdout || "{}");
  const duration = parseFloat(payload?.format?.duration);
  const size = parseInt(payload?.format?.size, 10);

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Could not probe duration for ${mediaPath}`);
  }

  return { durationSeconds: duration, sizeBytes: size };
}

export function verifyMp4Playable(mp4Path) {
  probeDurationSeconds(mp4Path);

  const binary = ffmpegPath || "ffmpeg";
  const decode = spawnSync(
    binary,
    ["-v", "error", "-i", mp4Path, "-f", "null", "-"],
    { encoding: "utf8" }
  );

  if (decode.status !== 0) {
    throw new Error(
      `ffmpeg decode failed for ${mp4Path}: ${decode.stderr || decode.stdout}`
    );
  }
}

export async function synthesizeNarrationWav(wavPath, narrationText) {
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

async function navigateStep(page, step) {
  await page.goto(step.url, { waitUntil: "domcontentloaded" });

  if (step.label) {
    await page
      .getByText(step.label, { exact: false })
      .first()
      .waitFor({ state: "visible", timeout: 90000 })
      .catch(() => undefined);
  }

  await sleep(step.waitMs);
}

export async function recordUiWalkthrough(workDir, steps, userKey = "requestor") {
  fs.mkdirSync(workDir, { recursive: true });

  const email = userEmail(userKey);
  const password = demoPassword();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: workDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();
  const startedAt = Date.now();

  await loginAs(page, email, password);

  for (const step of steps) {
    await navigateStep(page, step);
  }

  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  const webmPath = await video.path();
  return { webmPath, elapsedSeconds: (Date.now() - startedAt) / 1000 };
}

export async function produceHelpVideo({
  id,
  outMp4,
  workDir,
  narrationText,
  steps
}) {
  fs.mkdirSync(path.dirname(outMp4), { recursive: true });
  fs.mkdirSync(workDir, { recursive: true });

  const wavPath = path.join(workDir, "narration.wav");
  const silentVideoPath = path.join(workDir, "screen.webm");
  const videoOnlyMp4 = path.join(workDir, "screen.mp4");

  console.info(`[${id}] Synthesizing narration…`);
  await synthesizeNarrationWav(wavPath, narrationText);

  const { durationSeconds: audioSeconds } = probeDurationSeconds(wavPath);
  const targetSeconds = Math.max(audioSeconds + 2, 75);
  console.info(`[${id}] Narration ~${audioSeconds.toFixed(1)}s`);

  console.info(`[${id}] Recording UI…`);
  const { webmPath } = await recordUiWalkthrough(workDir, steps);
  fs.copyFileSync(webmPath, silentVideoPath);

  console.info(`[${id}] Encoding video…`);
  runFfmpeg([
    "-y",
    "-i",
    silentVideoPath,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-an",
    videoOnlyMp4
  ]);

  const { durationSeconds: videoSeconds } = probeDurationSeconds(videoOnlyMp4);
  const padSeconds = Math.max(0, audioSeconds - videoSeconds + 0.5);

  console.info(`[${id}] Muxing…`);
  if (padSeconds > 0.1) {
    runFfmpeg([
      "-y",
      "-i",
      videoOnlyMp4,
      "-i",
      wavPath,
      "-filter_complex",
      `[0:v]tpad=stop_mode=clone:stop_duration=${padSeconds.toFixed(2)}[v]`,
      "-map",
      "[v]",
      "-map",
      "1:a",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      "-shortest",
      outMp4
    ]);
  } else {
    runFfmpeg([
      "-y",
      "-i",
      videoOnlyMp4,
      "-i",
      wavPath,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      "-shortest",
      outMp4
    ]);
  }

  verifyMp4Playable(outMp4);

  const final = probeDurationSeconds(outMp4);
  const stats = fs.statSync(outMp4);

  return {
    output: outMp4,
    durationSeconds: final.durationSeconds,
    sizeBytes: stats.size
  };
}
