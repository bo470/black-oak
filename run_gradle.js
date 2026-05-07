import { spawn } from 'child_process';
import path from 'path';

const gradlew = spawn('./gradlew', ['bundleRelease'], {
  cwd: path.join(process.cwd(), 'android'),
  env: { ...process.env }
});

gradlew.stdout.on('data', (data) => {
  console.log(data.toString());
});

gradlew.stderr.on('data', (data) => {
  console.error(data.toString());
});

gradlew.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
