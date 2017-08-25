import { TokenGeneratorFactory } from './lib/oauth2-token-util';

async function main() {
  const tokenGenerator = await TokenGeneratorFactory.create();
  await tokenGenerator.generateToken();
}

main().catch(err => console.log(err));
