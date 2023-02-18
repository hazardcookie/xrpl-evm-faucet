import { Mapped_Keys } from './types'
import { bridge } from './transaction'
import { mapXrplSecretToEvm } from 'xrpl-evm-mapping'
import { AccountTxRequest, Client, Wallet } from 'xrpl'
import { generateFundedWallet } from '@thebettermint/xrpl-auto-funder'

export const wait = async (time: number) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

/// @author: hazardcookie
async function main() {
  const client: Client = new Client('wss://s.devnet.rippletest.net:51233')
  await client.connect()

  const faucet = await generateFundedWallet('devnet')
  const xrpl_wallet = Wallet.fromSeed(faucet.account.secret)
  const evm_wallet = mapXrplSecretToEvm(faucet.account.secret) as Mapped_Keys
  console.log(evm_wallet)

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
