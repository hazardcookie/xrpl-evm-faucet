import { bridge } from './bridge'
import { AccountTxRequest, Client, Wallet } from 'xrpl'
import { create_wallet } from './wallet'
import { Mapped_Keys, Faucet } from './types'
import { map_xrpl_secret_to_evm } from './mapping'

export const wait = async (time: number) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

/// @author: hazardcookie
async function main() {
  const client: Client = new Client('wss://s.devnet.rippletest.net:51233')
  await client.connect()

  const faucet = (await create_wallet()) as Faucet
  const xrpl_wallet = Wallet.fromSeed(faucet.secret)
  const evm_wallet = map_xrpl_secret_to_evm(faucet.secret) as Mapped_Keys
  console.log(evm_wallet)

  // Wait and check for fund wallet transaction to go through to receiving wallet
  // Hack: if the number of transactions exceeds 0 (ie transactions.length===1), we can presumme that the funds have made it!
  // If you check my fund wallet package, I had to do something similar, await for finality
  // Opinion, 'create_wallet()' function should be a promise, and only returned when the funding transaction has been successfully sent from faucet. Or at least, give use a hash to check... lol
  const request: AccountTxRequest = { command: 'account_tx', account: xrpl_wallet.address }
  while (true) {
    let r = await client.request(request)
    await wait(500)
    if (r.result.transactions.length > 0) break
  }

  const result = await bridge(client, xrpl_wallet, evm_wallet.mapped_evm_public_address, 100)
  console.log(result)

  client.disconnect()
}
main()
