"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, Strikethrough } from "lucide-react"

export default function Component() {
  const [activeTab, setActiveTab] = useState("description")

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* Left Panel - Code/Configuration */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            {/* Toolbar */}
            <div className="flex gap-2 mb-4 border-b border-gray-700 pb-2">
              <Button size="sm" variant="outline" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                <Bold className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                <Italic className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                <Underline className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                <Strikethrough className="w-4 h-4" />
              </Button>
            </div>

            {/* Code Content */}
            <div className="text-sm space-y-1 font-mono">
              <div className="text-blue-400">{"<gradient:#00CA2B:#00FFB7:#06CA2B>"}</div>
              <div className="text-yellow-400 ml-4">Rising Wind</div>
              <div className="text-blue-400">{"<gradient:#00CA2B:#00FFB7:#06CA2B>"}⋅⋅⋅⋅⋅⋅ ⋅⋅⋅⋅⋅⋅ ⋅⋅⋅⋅⋅⋅</div>
              <div className="text-purple-400">{"<gradient:#949494:#6E6E6E>"}</div>
              <div className="text-blue-400">{"<gradient:#00CA2B:#00FFB7:#06CA2B>"}Branching spirals</div>
              <div className="text-blue-400">{"</gradient>"}around the</div>
              <div className="text-purple-400">{"<gradient:#949494:#6E6E6E>"}wrists</div>
              <div className="text-blue-400">
                {"<gradient:#00CA2B:#00FFB7:#06CA2B>"}underset {"</gradient>"}by
              </div>
              <div className="text-blue-400">
                {"<gradient:#00CA2B:#00FFB7:#06CA2B>"}wraps {"</gradient>"}and
              </div>
              <div className="text-blue-400">
                {"<gradient:#00CA2B:#00FFB7:#06CA2B>"}sinew {"</gradient>"}
              </div>
              <div className="text-purple-400">{"<gradient:#949494:#6E6E6E>"}which</div>
              <div className="text-blue-400">{"<gradient:#00CA2B:#00FFB7:#06CA2B>"}anchor six blades</div>
              <div className="text-purple-400">{"<gradient:#949494:#6E6E6E>"}of</div>
              <div className="text-blue-400">
                {"<gradient:#00CA2B:#00FFB7:#06CA2B>"}spectral energy {"</gradient>"}over the
              </div>
              <div className="text-purple-400">{"<gradient:#949494:#6E6E6E>"}user's</div>
              <div className="text-blue-400">{"<gradient:#00CA2B:#00FFB7:#06CA2B>"}knuckles.</div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Item Description */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            {/* Header with decorative elements */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 text-green-400 text-lg mb-2">
                <span>✦</span>
                <span>~◊~</span>
                <span className="text-xl font-bold">Wraithclaw</span>
                <span>~◊~</span>
                <span>✦</span>
              </div>
              <div className="text-gray-500 text-sm">{"═══════════════════════"}</div>
            </div>

            {/* Description */}
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                <span className="text-green-400">The Wraithclaw is a legendary</span>
                <br />
                <span className="text-green-400">cestus wielded by only the</span>
                <br />
                <span className="text-green-400">greatest galebreather, a one of</span>
                <br />
                <span className="text-gray-400">a kind item forged years ago.</span>
              </p>

              {/* Decorative separator */}
              <div className="text-center text-green-400">✦ ⋅ ═══ ✦ ⋅ ✧ ⋅ ✦ ═══ ⋅ ✦</div>

              {/* Abilities */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✦</span>
                  <span className="text-green-400 font-semibold">Astral Wind</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">⚔</span>
                  <span className="text-green-400 font-semibold">Gale Lunge</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">🌪</span>
                  <span className="text-green-400 font-semibold">Rising Wind</span>
                </div>
              </div>

              {/* Decorative separator */}
              <div className="text-center text-green-400">✦ ⋅ ═══ ✦ ⋅ ✧ ⋅ ✦ ═══ ⋅ ✦</div>

              {/* Extended description */}
              <p>
                <span className="text-green-400">Branching spirals around the</span>
                <br />
                <span className="text-green-400">wrists underset by wraps and</span>
                <br />
                <span className="text-green-400">sinew which anchor six blades</span>
                <br />
                <span className="text-green-400">of spectral energy</span>
                <span className="text-gray-400"> over the</span>
                <br />
                <span className="text-gray-400">user's knuckles.</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
