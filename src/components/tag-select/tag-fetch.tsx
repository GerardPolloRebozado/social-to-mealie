import { MultiSelectCombobox } from "@/components/ui/multi-select"
import { env } from "@/lib/constants"
import { Option, tag } from "@/lib/types"

export default async function GetTagSelect({ query }: { query: string | undefined }) {
  const tags: Option[] = []

  try {
    const res = await fetch(`${env.MEALIE_URL}/api/organizers/tags?search=${query ?? ''}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.MEALIE_API_KEY}`,
      },
      cache: "no-store",
    })
    const body = await res.json()
    const items = body.items as tag[]
    items.forEach((t) => {
      tags.push({ label: t.name, value: t.name })
    })
  } catch {
    console.log("Failed to fetch tags")
  }

  return (
    <MultiSelectCombobox options={tags} paramName="tags" />
  )
}