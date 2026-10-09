import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";

const git = simpleGit();
const path = "./data.json";

// Default settings. You can also override these from Command Prompt:
// node index.js <commit-count> <start-date> <end-date>
const DEFAULT_COMMITS = 600;
const DEFAULT_START = "2025-12-01";
const DEFAULT_END = "2026-10-08";

const args = process.argv.slice(2);
const totalCommits = Number(args[0] || DEFAULT_COMMITS);
const startDate = args[1] || DEFAULT_START;
const endDate = args[2] || DEFAULT_END;

const makeDate = (index, total, start, end) => {
  const startMoment = moment(start).startOf("day");
  const endMoment = moment(end).endOf("day");

  if (!startMoment.isValid() || !endMoment.isValid() || endMoment.isBefore(startMoment)) {
    throw new Error("Invalid date range. Use YYYY-MM-DD for start and end dates.");
  }

  const totalMs = endMoment.valueOf() - startMoment.valueOf();
  const progress = total === 1 ? 0 : index / (total - 1);

  // Spread commits across the whole requested period, with a small random
  // time-of-day offset so they do not all have the exact same timestamp.
  const baseMs = startMoment.valueOf() + totalMs * progress;
  const jitterMs = Math.floor(Math.random() * 18 * 60 * 60 * 1000);
  const dateMs = Math.min(baseMs + jitterMs, endMoment.valueOf());

  return moment(dateMs).format("YYYY-MM-DDTHH:mm:ssZ");
};

const makeCommits = async () => {
  if (!Number.isInteger(totalCommits) || totalCommits < 1) {
    throw new Error("Commit count must be a positive integer.");
  }

  console.log(`🚀 Creating ${totalCommits} commits`);
  console.log(`📅 Date range: ${startDate} → ${endDate}`);

  for (let i = 0; i < totalCommits; i++) {
    const date = makeDate(i, totalCommits, startDate, endDate);
    const data = { date, commitNumber: i + 1 };

    console.log(`📝 ${i + 1}/${totalCommits} — ${date}`);

    try {
      await jsonfile.writeFile(path, data);
      await git.add([path]);
      await git.commit(`Contribution ${i + 1}`, { "--date": date });
    } catch (err) {
      console.error(`❌ Error making commit ${i + 1}:`, err.message || err);
      throw err;
    }
  }

  console.log("✅ All commits created. Pushing to GitHub...");
  await git.push();
  console.log("🎉 Done!");
};

makeCommits().catch((err) => {
  console.error("❌ Script stopped:", err.message || err);
  process.exit(1);
});
