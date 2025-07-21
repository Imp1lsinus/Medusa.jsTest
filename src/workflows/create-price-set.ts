import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createPriceSetStep = createStep(
  "create-price-set",
  async ({}, { container }) => {
    const pricingModuleService = container.resolve(Modules.PRICING)

    const priceSet = await pricingModuleService.createPriceSets({
      prices: [
        {
          amount: 500,
          currency_code: "USD",
        },
        {
          amount: 400,
          currency_code: "EUR",
          min_quantity: 0,
          max_quantity: 4,
          rules: {},
        },
      ],
    })

    return new StepResponse({ priceSet }, priceSet.id)
  },
  async (priceSetId, { container }) => {
    if (!priceSetId) {
      return
    }
    const pricingModuleService = container.resolve(Modules.PRICING)

    await pricingModuleService.deletePriceSets([priceSetId])
  }
)

export const createPriceSetWorkflow = createWorkflow(
  "create-price-set",
  () => {
    const { priceSet } = createPriceSetStep()

    return new WorkflowResponse({
      priceSet,
    })
  }
)