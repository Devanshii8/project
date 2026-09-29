import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const git = simpleGit();
const path = "./data.json";

const makeCommits = async (n) => {
  if (n === 0) {
    console.log("✅ All commits created, pushing to GitHub...");
    return git.push();
  }

  const x = random.int(40, 50);
  const y = random.int(0, 6);
  const date = moment()
    .subtract(1, "y")
    .add(1, "d")
    .add(x, "w")
    .add(y, "d")
    .format();

  const data = { date };
  console.log("📅 Commit date:", date);

  try {
    await jsonfile.writeFile(path, data);
    await git.add([path]);
    await git.commit(date, { "--date": date });
  } catch (err) {
    console.error("❌ Error making commit:", err);
  }

  // Recurse
  return makeCommits(n - 1);
};

// Start
makeCommits(100);
