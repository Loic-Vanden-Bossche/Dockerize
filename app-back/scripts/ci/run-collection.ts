/* eslint-disable no-console */
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { createInterface } from 'readline';
import path from 'path';
import { createConnection, getRepository } from 'typeorm';
import { Role } from '../../src/roles/role.model';
import { User } from '../../src/user/user.model';
import { readFileSync } from 'fs';
import { hashSync } from 'bcrypt';
import { execSync } from 'child_process';

const startServer = (prod = false): Promise<ChildProcessWithoutNullStreams> => {
  process.on('warning', (e) => console.warn(e.stack));
  return new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
    const _process = spawn('npm', prod ? ['run', 'start:prod'] : ['start']);
    let hasStarted = false;
    _process.stdout.on('data', (data) => {
      if (!hasStarted) {
        process.stdin.setMaxListeners(0);
        process.stdout.setMaxListeners(0);
        const rl = createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.write(data.toString());
      }
      if (data.toString().includes('Nest application successfully started')) {
        setTimeout(() => resolve(_process), 200);
        hasStarted = true;
      } else if (!hasStarted && data.toString().includes('app crashed')) {
        reject('server crashed (stdout)');
      }
    });
    _process.stderr.on('data', (data) => {
      if (!hasStarted) {
        const rl = createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.write(data.toString());
      }
      if (data.toString().includes('app crashed')) {
        reject('server crashed (stderr)');
      }
    });
    _process.on('close', (code) => {
      reject('server closed');
    });
    setTimeout(
      () => reject('server did not start within one minute'),
      60 * 1000,
    );
  });
};

const postmanEnvPath = path.resolve(
  path.join(__dirname, '..', '..', 'docs', 'postman', 'local.environment.json'),
);

const seedData = async (): Promise<void> => {
  // Connect DB
  console.info('Connecting to database...');
  await createConnection();
  // Creating base role
  console.info('Creating roles...');
  const admin = new Role();
  admin.name = 'admin';
  const user = new Role();
  user.name = 'user';
  const rolesRepository = getRepository(Role);
  const savedRoles: Role[] = await rolesRepository.save([admin, user]);
  // Creating root user
  console.info('Creating test admin...');
  const postmanEnv = JSON.parse(readFileSync(postmanEnvPath).toString());
  const rootUser = new User();
  rootUser.username = 'Test admin';
  rootUser.email = postmanEnv.values.find(
    (v: { key: string; value: string }) => v.key === 'admin_email',
  ).value;
  rootUser.password = hashSync(
    postmanEnv.values.find(
      (v: { key: string; value: string }) => v.key === 'admin_password',
    ).value,
    10,
  );
  rootUser.roles = savedRoles;
  const usersRepository = getRepository(User);
  await usersRepository.save(rootUser);
  console.info('Test data successfully generated !');
};

const runCollection = (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(
      'npx',
      [
        '--yes',
        'newman',
        'run',
        path.resolve(
          path.join(__dirname, '..', '..', 'docs', 'postman', 'users.json'),
        ),
        '-e',
        postmanEnvPath,
        '-n',
        '5',
      ],
      { stdio: 'inherit' },
    );
    process.on('close', (code) => {
      if (code === 0) {
        return resolve();
      }
      return reject();
    });
    setTimeout(() => reject(), 60 * 1000);
  });
};

(async () => {
  let server: ChildProcessWithoutNullStreams;
  try {
    const isProd = process.argv.includes('--prod');
    if (isProd) {
      execSync('npm run build', { stdio: 'inherit' });
    }
    console.info('Starting server\n');
    server = await startServer(isProd);
    console.info('Generating test data\n');
    await seedData();
    console.info('Running postman collection\n');
    await runCollection();
    server.kill();
    process.exit(0);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    server?.kill();
    process.exit(1);
  }
})();
