import { generateToken } from './lib/oauth2-token-util';

async function main() {
  await generateToken();
}

main().catch(err => console.log(err));
