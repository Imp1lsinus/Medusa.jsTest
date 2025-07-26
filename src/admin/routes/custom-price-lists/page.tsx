"use client"

import type React from "react"

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge, Text, Button } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk.ts"
import { Link, useNavigate } from "react-router-dom"
import {
  Calendar,
  Clock,
  FileText,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  PauseCircle,
  XCircle,
} from "lucide-react"

interface PriceList {
  id: string
  title: string
  status: "active" | "draft"
  description?: string
  updated_at: string
  starts_at?: string | null
  ends_at?: string | null
}

const PriceListCard = ({ pl }: { pl: PriceList }) => {
  const now = new Date()
  const startsAt = pl.starts_at ? new Date(pl.starts_at) : null
  const endsAt = pl.ends_at ? new Date(pl.ends_at) : null

  let badgeColor: React.ComponentProps<typeof Badge>["color"] = "grey"
  let badgeText = "Черновик"
  let statusIcon = <PauseCircle className="w-4 h-4" />
  let cardBorderClass = "border-ui-border-base"
  let cardBgClass = "bg-ui-bg-base"

  if (startsAt && startsAt > now) {
    badgeColor = "orange"
    badgeText = "Запланирован"
    statusIcon = <Clock className="w-4 h-4" />
    cardBorderClass = "border-orange-200"
    cardBgClass = "bg-gradient-to-br from-orange-50 to-amber-50"
  } else if (endsAt && endsAt < now) {
    badgeColor = "red"
    badgeText = "Истек"
    statusIcon = <XCircle className="w-4 h-4" />
    cardBorderClass = "border-red-200"
    cardBgClass = "bg-gradient-to-br from-red-50 to-rose-50"
  } else if (pl.status === "active") {
    badgeColor = "green"
    badgeText = "Активен"
    statusIcon = <CheckCircle className="w-4 h-4" />
    cardBorderClass = "border-green-200"
    cardBgClass = "bg-gradient-to-br from-green-50 to-emerald-50"
  }

  return (
    <Link
      to={`/price-lists/${pl.id}`}
      className={`block ${cardBgClass} rounded-xl border-2 ${cardBorderClass} p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-full group relative overflow-hidden`}
    >
      {}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <TrendingUp className="w-full h-full" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {statusIcon}
            <Heading
              level="h3"
              className="text-xl font-semibold truncate group-hover:text-ui-fg-interactive transition-colors"
            >
              {pl.title}
            </Heading>
          </div>
          <Badge color={badgeColor} className="shrink-0 ml-2 font-medium px-3 py-1">
            {badgeText}
          </Badge>
        </div>

        {}
        {(badgeText === "Запланирован" || badgeText === "Истек") && (
          <div className="mb-5 p-3 bg-white/60 rounded-lg border border-white/40">
            {badgeText === "Запланирован" && (
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Начало:</span>
                </div>
                <span className="font-semibold text-blue-800">
                  {pl.starts_at ? new Date(pl.starts_at).toLocaleDateString("ru-RU") : "-"}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-blue-600">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">{badgeText === "Истек" ? "Окончание:" : "Окончание:"}</span>
              </div>
              <span className="font-semibold text-blue-800">
                {pl.ends_at ? new Date(pl.ends_at).toLocaleDateString("ru-RU") : "-"}
              </span>
            </div>
          </div>
        )}

        <div className="mb-5">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-ui-fg-subtle mt-0.5 shrink-0" />
            <Text className="text-ui-fg-subtle line-clamp-3 leading-relaxed">{pl.description || "Без описания"}</Text>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/40">
          <div className="flex items-center gap-2 text-ui-fg-muted">
            <Clock className="w-3 h-3" />
            <Text as="span" size="small" className="font-medium">
              Обновлено:
            </Text>
          </div>
          <Text as="span" size="small" className="font-semibold text-blue-800">
            {new Date(pl.updated_at).toLocaleDateString("ru-RU")}
          </Text>
        </div>
      </div>
    </Link>
  )
}

const EmptyState = () => (
  <div className="bg-gradient-to-br from-ui-bg-subtle to-ui-bg-base rounded-2xl p-12 text-center border-2 border-dashed border-ui-border-base">
    <div className="w-20 h-20 mx-auto mb-6 bg-ui-bg-base rounded-full flex items-center justify-center">
      <FileText className="w-10 h-10 text-ui-fg-muted" />
    </div>
    <Heading level="h3" className="text-xl font-semibold mb-3 text-ui-fg-base">
      Нет прайс-листов
    </Heading>
    <Text className="text-ui-fg-subtle mb-6 max-w-md mx-auto">
      Создайте свой первый прайс-лист, чтобы начать управление ценами на товары
    </Text>
  </div>
)

const StatsCard = ({
  title,
  count,
  icon,
  color,
}: {
  title: string
  count: number
  icon: React.ReactNode
  color: string
}) => (
  <div className={`${color} rounded-xl p-4 border border-white/20`}>
    <div className="flex items-center justify-between">
      <div>
        <Text className="text-sm font-medium opacity-80 mb-1">{title}</Text>
        <Text className="text-2xl font-bold">{count}</Text>
      </div>
      <div className="opacity-60">{icon}</div>
    </div>
  </div>
)

const CustomPriceListsPage = () => {
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ["price-lists"],
    queryFn: () =>
      sdk.admin.priceList.list({
        fields: "id,title,status,description,updated_at,starts_at,ends_at",
      }),
  })

  if (isLoading) {
    return (
      <Container>
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 bg-ui-bg-subtle rounded w-48"></div>
            <div className="h-10 bg-ui-bg-subtle rounded w-40"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-ui-bg-subtle rounded-xl"></div>
            ))}
          </div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <Heading level="h2" className="text-red-800 mb-2">
            Ошибка загрузки
          </Heading>
          <Text className="text-red-600">Ошибка загрузки: {(error as Error).message}</Text>
        </div>
      </Container>
    )
  }

  const priceLists = (data?.price_lists as PriceList[]) || []

  const groups = [
    {
      title: "Активные",
      filter: (pl: PriceList) =>
        pl.status === "active" &&
        (!pl.ends_at || new Date(pl.ends_at) > new Date()) &&
        (!pl.starts_at || new Date(pl.starts_at) <= new Date()),
      icon: <CheckCircle className="w-6 h-6" />,
      color: "text-green-700",
    },
    {
      title: "Запланированные",
      filter: (pl: PriceList) => pl.starts_at && new Date(pl.starts_at) > new Date(),
      icon: <Clock className="w-6 h-6" />,
      color: "text-orange-700",
    },
    {
      title: "Черновики",
      filter: (pl: PriceList) =>
        pl.status === "draft" &&
        (!pl.ends_at || new Date(pl.ends_at) > new Date()) &&
        (!pl.starts_at || new Date(pl.starts_at) <= new Date()),
      icon: <PauseCircle className="w-6 h-6" />,
      color: "text-gray-700",
    },
    {
      title: "Истекшие",
      filter: (pl: PriceList) => pl.ends_at && new Date(pl.ends_at) < new Date(),
      icon: <XCircle className="w-6 h-6" />,
      color: "text-red-700",
    },
  ]

  const stats = groups.map((group) => ({
    ...group,
    count: priceLists.filter(group.filter).length,
  }))

  return (
    <Container>
      {}
      <div className="bg-gradient-to-r from-ui-bg-base to-ui-bg-subtle rounded-2xl p-8 mb-8 border border-ui-border-base">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <Heading
              level="h1"
              className="text-3xl font-bold mb-2 bg-gradient-to-r from-ui-fg-base to-ui-fg-subtle bg-clip-text text-transparent"
            >
              Управление прайс-листами
            </Heading>
            <Text className="text-ui-fg-subtle text-lg">Создавайте и управляйте ценами на ваши товары</Text>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-ui-bg-base border border-ui-border-base rounded-full px-4 py-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ui-fg-muted" />
              <Text className="font-semibold">Всего: {priceLists.length}</Text>
            </div>
            <Button
              size="base"
              onClick={() => navigate("/price-lists/create")}
              className="bg-gradient-to-r from-ui-button-inverted to-ui-button-inverted-pressed hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Создать прайс-лист
            </Button>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Активные"
          count={stats[0].count}
          icon={<CheckCircle className="w-8 h-8" />}
          color="bg-gradient-to-br from-green-100 to-emerald-100 text-green-800"
        />
        <StatsCard
          title="Запланированные"
          count={stats[1].count}
          icon={<Clock className="w-8 h-8" />}
          color="bg-gradient-to-br from-orange-100 to-amber-100 text-orange-800"
        />
        <StatsCard
          title="Черновики"
          count={stats[2].count}
          icon={<PauseCircle className="w-8 h-8" />}
          color="bg-gradient-to-br from-gray-100 to-slate-100 text-gray-800"
        />
        <StatsCard
          title="Истекшие"
          count={stats[3].count}
          icon={<XCircle className="w-8 h-8" />}
          color="bg-gradient-to-br from-red-100 to-rose-100 text-red-800"
        />
      </div>

      {}
      {priceLists.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-10">
          {groups.map((group) => {
            const filteredLists = priceLists.filter(group.filter)
            if (filteredLists.length === 0) return null

            return (
              <div key={group.title} className="animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`${group.color}`}>{group.icon}</div>
                  <Heading level="h2" className={`text-2xl font-bold ${group.color}`}>
                    {group.title} ({filteredLists.length})
                  </Heading>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredLists.map((pl) => (
                    <PriceListCard key={pl.id} pl={pl} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Прайс-листы",
})

export default CustomPriceListsPage
