import { Provider, Wallet } from "fuels";
import "dotenv/config";
import { measure } from "./helpers";
import { ContractTransfer, TransferParamsInput } from "../sway-programs/contracts/ContractTransfer";


async function main() {
  const provider = await Provider.create(process.env.PROVIDER_URL as string);
  const account = Wallet.fromPrivateKey(process.env.ACCOUNT_PVK_1 as string, provider);

  // Clear chain info cache
  Provider.clearChainAndNodeCaches()

  const { duration } = await measure(async () => {
    await provider.connect(process.env.PROVIDER_URL as string);
    const contract = new ContractTransfer(process.env.TRANSFER_CONTRACT_ID as string, account);

    const baseAssetId = provider.getBaseAssetId()
    const amount = 100

    const param: TransferParamsInput = {
      recipient: { Address: { bits: account.address.toB256() } },
      asset_id: { bits: baseAssetId },
      amount,
    }

    // 4 transfer params, requiring 4 `OutputVariable`
    const params = new Array(4).fill(param)

    const call = await contract.functions
      .execute_transfer(params)
      .callParams({
        forward: [amount * params.length, baseAssetId],
      })
      .call();

    return call.waitForResult()
  })

  console.log('script-transaction-missing-4x-output-variable', duration);
}

main()
