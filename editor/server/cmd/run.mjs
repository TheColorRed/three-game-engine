import { series } from 'async';
import * as cp from 'child_process';
import * as chokidar from 'chokidar';
import { concurrently } from 'concurrently';
import * as path from 'path';
import { dirname } from 'path';
import { debounceTime, map, Subject, tap } from 'rxjs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const src = path.join(__dirname, '../app');
const watcher = chokidar.watch(src);
const sub = new Subject();
const commands = concurrently([
  { command: "ng serve", name: 'ng' },
  { command: "npm:build:electron", name: 'build' },
  { command: "npm:start:electron", name: 'electron' },
]);

// console.log(commands.commands);
console.log('Watching:', src);

const electron = commands.commands.find(cmd => cmd.name === 'electron');

commands.commands.forEach(cmd => {
  cmd.stdout.pipe(
    map(buffer => buffer.toString()),
    tap(i => process.stdout.write(`[${cmd.name}] ${i}`))
  ).subscribe();
});


if (!electron) {
  throw new Error('Could not find the electron command.');
}

sub
  .pipe(
    debounceTime(1000),
    tap(file => {
      console.log('File Changed:', file);
      series([
        done => {
          console.log('Closing Application.');
          electron?.kill();
          done();
        },
        done => {
          console.log('Building Electron...');
          cp.exec('npm run build:electron', { cwd: path.join(__dirname, '../../') })
            .once('close', () => done());
        },
        done => {
          console.log('Starting Application.');
          electron?.start();
          done();
        },
      ]);
    })
  )
  .subscribe();
watcher.on('change', changes => sub.next(changes));
