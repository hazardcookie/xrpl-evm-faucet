import { bridge } from '../src/bridge'
import { Client, Wallet } from 'xrpl'
import { create_wallet } from '../src/wallet'
import { Mapped_Keys, Faucet } from '../src/types'
import { map_xrpl_secret_to_evm } from '../src/mapping'

async function main() {
  const client = new Client('wss://s.devnet.rippletest.net:51233')
  await client.connect()

  const faucet = (await create_wallet()) as Faucet
  const xrpl_wallet = Wallet.fromSeed(faucet.secret)
  const evm_wallet = map_xrpl_secret_to_evm(faucet.secret) as Mapped_Keys
  console.log(evm_wallet)

  const result = await bridge(client, xrpl_wallet, evm_wallet.mapped_evm_public_address, 100)
  console.log(result)

  client.disconnect()
}
main()
