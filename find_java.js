import { execSync } from 'child_process';
try {
  const javaPath = execSync('which java').toString().trim();
  console.log('Java path:', javaPath);
  const javaHome = execSync('readlink -f ' + javaPath + ' | sed "s:/bin/java::"').toString().trim();
  console.log('JAVA_HOME:', javaHome);
} catch (e) {
  console.error('Java not found');
}
