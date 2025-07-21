import { MedusaService, Module } from "@medusajs/framework/utils"
import { Brand } from "./models/brand"

class BrandService extends MedusaService({ Brand }) {
  // сюда можно добавить кастомные методы работы с сущностью Brand
}

export default BrandService