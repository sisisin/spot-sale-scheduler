import { TokenGeneratorFactory } from './lib/token-generator';

async function main() {
  const tokenGenerator = await TokenGeneratorFactory.create();
  await tokenGenerator.generateToken();
}

main().catch(err => console.log(err));
