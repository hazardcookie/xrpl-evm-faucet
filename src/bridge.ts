import { Mapped_Keys } from './types'
import { bridge } from './transaction'
import { writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs'
import { mapXrplSecretToEvm } from 'xrpl-evm-mapping'
import { AccountTxRequest, Client, Wallet } from 'xrpl'
import { generateFundedWallet } from '@thebettermint/xrpl-auto-funder'

export const wait = async (time: number) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}


function saveWallet(wallet: Mapped_Keys) {
  const data = JSON.stringify(wallet, null, 2)
  if (!existsSync('./wallets')) {
    console.log('Creating data folder. Wallet.json will be here.')
    mkdirSync('wallets')
  }
  if (existsSync('./wallets/generated.json')) {
    appendFileSync('wallets/generated.json', data)
  } else {
    writeFileSync('wallets/generated.json', data)
  }
}

async function main() {
  const client: Client = new Client('wss://s.devnet.rippletest.net:51233')
  await client.connect()

  const faucet = await generateFundedWallet('devnet')
  const xrpl_wallet = Wallet.fromSeed(faucet.account.secret)
  const evm_wallet = mapXrplSecretToEvm(faucet.account.secret) as Mapped_Keys
  saveWallet(evm_wallet)

  console.log('XRPL Wallet generated, funded and mapped to a EVM keypair')
  console.log(evm_wallet)
  console.log('Bridging xrp from the generated XRPL wallet to the mapped EVM wallet')
  console.log('Please wait for the transaction to be confirmed...')

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
