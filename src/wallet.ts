import axios from 'axios'
import { Faucet } from './types'

// Function to submit request to AMM devnet faucet
export async function create_wallet(): Promise<Faucet> {
  const faucet = 'https://faucet.devnet.rippletest.net/accounts'

  const requestConfig = {
    method: 'post',
    url: faucet,
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const response = await axios(requestConfig)
  const data = response.data.account as Faucet
  return data
}
