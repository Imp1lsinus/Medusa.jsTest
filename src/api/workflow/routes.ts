import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createPriceSetWorkflow } from "../../workflows/create-price-set"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await createPriceSetWorkflow(req.scope)
    .run()

  res.send(result)
}