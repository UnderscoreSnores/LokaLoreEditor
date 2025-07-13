"use client"

import type React from "react"

import { signIn, signOut } from "next-auth/react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import DiscordIcon from "@/components/ui/DiscordIcon" // Add DiscordIcon import
import { useToast } from "@/hooks/use-toast" // Assuming useToast is available
import { useSession } from "next-auth/react";
import { Palette, Hash, Save, FolderOpen, LogIn, LogOut, User, Share2, ClipboardCopy, Plus, Minus } from "lucide-react"

interface Lore {
  id: string
  name: string
  content: string
  createdAt: string
}

export default function Component() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const [selectedColor, setSelectedColor] = useState("#00CA2B") // For single color
  const [gradientColors, setGradientColors] = useState(["#00CA2B", "#00FFB7"]) // For gradient, initially 2 colors
  const [showSingleColorPicker, setShowSingleColorPicker] = useState(false) // New state for single color picker
  const [showGradientColorPicker, setShowGradientColorPicker] = useState(false) // New state for gradient picker
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [savedLores, setSavedLores] = useState<Lore[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [loreName, setLoreName] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)

  // New states for shareable code
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareableCode, setShareableCode] = useState("")
  const [showLoadCodeDialog, setShowLoadCodeDialog] = useState(false)
  const [codeToLoad, setCodeToLoad] = useState("")
  const [showRegister, setShowRegister] = useState(false)
  const [showDiscordLogin, setShowDiscordLogin] = useState(false)

  const { toast } = useToast() // Initialize toast

  // No initial editor content as requested
  const [editorContent, setEditorContent] = useState("")

  const minecraftColors = [
    { name: "black", color: "#000000", display: "Black" },
    { name: "dark_blue", color: "#0000AA", display: "Dark Blue" },
    { name: "dark_green", color: "#00AA00", display: "Dark Green" },
    { name: "dark_aqua", color: "#00AAAA", display: "Dark Aqua" },
    { name: "dark_red", color: "#AA0000", display: "Dark Red" },
    { name: "dark_purple", color: "#AA00AA", display: "Dark Purple" },
    { name: "gold", color: "#FFAA00", display: "Gold" },
    { name: "gray", color: "#AAAAAA", display: "Gray" },
    { name: "dark_gray", color: "#555555", display: "Dark Gray" },
    { name: "blue", color: "#5555FF", display: "Blue" },
    { name: "green", color: "#55FF55", display: "Green" },
    { name: "aqua", color: "#55FFFF", display: "Aqua" },
    { name: "red", color: "#FF5555", display: "Red" },
    { name: "light_purple", color: "#FF55FF", display: "Light Purple" }, // This is the purple in the screenshot
    { name: "yellow", color: "#FFFF55", display: "Yellow" },
    { name: "white", color: "#FFFFFF", display: "White" },
  ]

  // Load saved data on component mount
  useEffect(() => {
    if (session) {
      const savedUser = session.user.name
      loadUserLores(savedUser)
    }
  }, [session])

  // Sync scroll between textarea and highlight div
  useEffect(() => {
    const textarea = textareaRef.current
    const highlight = highlightRef.current

    const handleScroll = () => {
      if (textarea && highlight) {
        highlight.scrollTop = textarea.scrollTop
        highlight.scrollLeft = textarea.scrollLeft
      }
    }

    textarea?.addEventListener("scroll", handleScroll)
    return () => textarea?.removeEventListener("scroll", handleScroll)
  }, [])

  const loadUserLores = (user: string) => {
    const saved = localStorage.getItem(`adventureWebUI_lores_${user}`)
    if (saved) {
      setSavedLores(JSON.parse(saved))
    }
  }

  const saveLore = () => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to save lores.",
        variant: "destructive",
      })
      return
    }

    if (!loreName || !editorContent) {
      toast({
        title: "Error",
        description: "Lore name and content cannot be empty.",
        variant: "destructive",
      })
      return
    }

    const newLore: Lore = {
      id: Date.now().toString(),
      name: loreName,
      content: editorContent,
      createdAt: new Date().toISOString(),
    }

    const updatedLores = [...savedLores, newLore]
    setSavedLores(updatedLores)
    localStorage.setItem(`adventureWebUI_lores_${session.user.name}`, JSON.stringify(updatedLores))
    setLoreName("")
    setShowSaveDialog(false)
    toast({
      title: "Success",
      description: `Lore "${newLore.name}" saved!`,
    })
  }

  const loadLore = (lore: Lore) => {
    setEditorContent(lore.content)
    setShowLoadDialog(false)
    toast({
      title: "Success",
      description: `Lore "${lore.name}" loaded!`,
    })
  }

  const deleteLore = (id: string) => {
    const updatedLores = savedLores.filter((lore) => lore.id !== id)
    setSavedLores(updatedLores)
    localStorage.setItem(`adventureWebUI_lores_${session?.user.name}`, JSON.stringify(updatedLores))
    toast({
      title: "Success",
      description: "Lore deleted.",
    })
  }

  const enforceCharLimitPerLine = useCallback((line: string) => {
    let visibleCharCount = 0
    let truncatedLine = ""
    let inTag = false
    const MAX_CHARS_PER_LINE = 32

    for (let j = 0; j < line.length; j++) {
      const char = line[j]

      if (char === "<") {
        inTag = true
        truncatedLine += char
      } else if (char === ">") {
        inTag = false
        truncatedLine += char
      } else {
        if (!inTag) {
          if (visibleCharCount < MAX_CHARS_PER_LINE) {
            truncatedLine += char
            visibleCharCount++
          } else {
            break // Visible limit reached
          }
        } else {
          truncatedLine += char // Always add characters inside tags
        }
      }
    }
    return truncatedLine
  }, [])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    const originalValue = textarea.value
    let newContent = originalValue

    const originalSelectionStart = textarea.selectionStart
    const originalSelectionEnd = textarea.selectionEnd

    const MAX_LINES = 15

    // 1. Enforce 15-line limit (preventing newlines after 15th line)
    const lines = newContent.split("\n")
    if (lines.length > MAX_LINES) {
      // If the user just pressed Enter and we are at or over MAX_LINES,
      // prevent the newline from being added.
      const linesBeforeCursor = originalValue.substring(0, originalSelectionStart).split("\n")
      if (linesBeforeCursor.length > MAX_LINES && originalValue[originalSelectionStart - 1] === "\n") {
        newContent =
          originalValue.substring(0, originalSelectionStart - 1) + originalValue.substring(originalSelectionStart)
      } else {
        // If pasting multiple lines or typing on a new line that exceeds limit
        newContent = lines.slice(0, MAX_LINES).join("\n")
      }
    }

    // 2. Enforce 32-character limit per line (visible characters only)
    const processedLines = newContent.split("\n").map(enforceCharLimitPerLine)
    newContent = processedLines.join("\n")

    setEditorContent(newContent)

    // Adjust cursor position after state update
    setTimeout(() => {
      if (textareaRef.current) {
        let newSelectionStart = originalSelectionStart
        let newSelectionEnd = originalSelectionEnd

        // If content was truncated, adjust cursor to stay within bounds
        if (newContent.length < originalValue.length) {
          newSelectionStart = Math.min(originalSelectionStart, newContent.length)
          newSelectionEnd = Math.min(originalSelectionEnd, newContent.length)
        }
        textareaRef.current.setSelectionRange(newSelectionStart, newSelectionEnd)
      }
    }, 0)
  }

  const getLineCount = () => editorContent.split("\n").length
  const getCurrentLineLength = () => {
    const lines = editorContent.split("\n")
    const currentLineIndex =
      textareaRef.current?.value.substr(0, textareaRef.current?.selectionStart).split("\n").length - 1 || 0
    const currentLine = lines[currentLineIndex] || ""
    // Count visible characters by stripping tags
    return currentLine.replace(/<[^>]+>/g, "").length
  }

  const insertCode = useCallback(
    (tagStart: string, tagEnd = "") => {
      if (!textareaRef.current) return

      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = textarea.value.substring(start, end)

      const insertText = `${tagStart}${selectedText || "text"}${tagEnd}`
      const newContent = textarea.value.substring(0, start) + insertText + textarea.value.substring(end)

      // Apply limit AFTER insertion, then update state
      const processedLines = newContent.split("\n").map(enforceCharLimitPerLine)
      const finalContent = processedLines.slice(0, 15).join("\n") // Enforce 15 lines here too
      setEditorContent(finalContent)

      setTimeout(() => {
        textarea.focus()
        let newPosition = start + tagStart.length + (selectedText ? selectedText.length : "text".length)
        // Adjust newPosition if content was truncated
        newPosition = Math.min(newPosition, finalContent.length)
        textarea.setSelectionRange(newPosition, newPosition)
      }, 0)
    },
    [enforceCharLimitPerLine],
  )

  const parseAdventureText = (text: string) => {
    if (!text.trim()) return ""

    // Parse gradient tags
    text = text.replace(/<gradient:([^>]+)>(.*?)<\/gradient>/g, (match, colors, content) => {
      const colorArray = colors.split(":")
      const gradientStyle =
        colorArray.length >= 2
          ? `background: linear-gradient(90deg, ${colorArray.join(", ")}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`
          : `color: ${colorArray[0]};`
      return `<span style="${gradientStyle}">${content}</span>`
    })

    // Parse single gradient tags (without closing) - for editor highlighting
    text = text.replace(/<gradient:([^>]+)>/g, (match, colors) => {
      const colorArray = colors.split(":")
      const gradientStyle =
        colorArray.length >= 2
          ? `background: linear-gradient(90deg, ${colorArray.join(", ")}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`
          : `color: ${colorArray[0]};`
      return `<span style="${gradientStyle}">`
    })

    // Parse Minecraft color tags
    minecraftColors.forEach(({ name, color }) => {
      const regex = new RegExp(`<${name}>(.*?)</${name}>`, "g")
      text = text.replace(regex, `<span style="color: ${color};">$1</span>`)
    })

    // Parse color tags
    text = text.replace(/<color:([^>]+)>(.*?)<\/color>/g, '<span style="color: $1;">$2</span>')

    // Parse formatting tags
    text = text.replace(/<b>(.*?)<\/b>/g, "<strong>$1</strong>")
    text = text.replace(/<i>(.*?)<\/i>/g, "<em>$1</em>")
    text = text.replace(/<u>(.*?)<\/u>/g, '<span style="text-decoration: underline;">$1</span>')
    text = text.replace(/<st>(.*?)<\/st>/g, '<span style="text-decoration: line-through;">$1</span>')

    return text
  }

  const highlightEditorContent = useCallback(
    (text: string) => {
      // Escape HTML characters first to prevent XSS and ensure tags are displayed as text
      let highlightedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

      // Highlight gradient tags
      highlightedText = highlightedText.replace(
        /(&lt;gradient:)(#?[0-9a-fA-F:]+)(&gt;)/g,
        `<span style="color: #FFAA00;">$1</span><span style="color: #FFD700;">$2</span><span style="color: #FFAA00;">$3</span>`, // Gold/Yellow for gradient tags
      )

      // Highlight Minecraft color tags
      minecraftColors.forEach(({ name, color }) => {
        const tagRegex = new RegExp(`(&lt;${name}&gt;)|(&lt;/${name}&gt;)`, "g")
        highlightedText = highlightedText.replace(tagRegex, `<span style="color: ${color};">$1$2</span>`)
      })

      // Highlight <color:#hexcode> tags
      highlightedText = highlightedText.replace(
        /(&lt;color:)(#?[0-9a-fA-F]+)(&gt;)/g,
        `<span style="color: #55FFFF;">$1</span><span style="color: #55FFFF;">$2</span><span style="color: #55FFFF;">$3</span>`, // Aqua for color tags
      )

      // Highlight formatting tags (b, i, u, st)
      highlightedText = highlightedText.replace(
        /(&lt;b&gt;)|(&lt;\/b&gt;)|(&lt;i&gt;)|(&lt;\/i&gt;)|(&lt;u&gt;)|(&lt;\/u&gt;)|(&lt;st&gt;)|(&lt;\/st&gt;)/g,
        `<span style="color: #AAAAAA;">$&</span>`, // Gray for formatting tags
      )

      return highlightedText
    },
    [minecraftColors],
  )

  const renderMinecraftPreview = (content: string) => {
    if (!content.trim()) {
      return (
        <div className="bg-black border-2 border-[#AA00AA] rounded-lg p-4 min-h-[500px] font-mono shadow-2xl flex items-center justify-center">
          <div className="text-gray-500 text-center text-lg italic pixelated-text">No content to preview</div>
        </div>
      )
    }

    const lines = content.split("\n")
    const titleLine = lines[0]
    const restOfContent = lines.slice(1).join("\n")

    return (
      <div className="bg-black border-2 border-[#AA00AA] rounded-lg p-4 min-h-[500px] font-mono shadow-2xl">
        {titleLine && (
          <div className="text-[#FF55FF] text-2xl mb-2">
            <span className="pixelated-text" dangerouslySetInnerHTML={{ __html: parseAdventureText(titleLine) }} />
            <div className="text-[#555555] text-lg mt-1 pixelated-text">{"--------------------------------"}</div>
          </div>
        )}
        {restOfContent && (
          <div
            className="text-[#FF55FF] text-xl leading-relaxed whitespace-pre-wrap pixelated-text"
            dangerouslySetInnerHTML={{ __html: parseAdventureText(restOfContent) }}
          />
        )}
      </div>
    )
  }

  const renderLorePreview = (content: string, isCompact = false) => {
    const parsedContent = parseAdventureText(content)

    if (!content.trim()) {
      return (
        <div
          className={`bg-gray-800 border border-gray-600 rounded p-2 font-mono ${isCompact ? "text-xs" : "text-sm"}`}
        >
          <div className="text-gray-500 italic pixelated-text">Empty lore</div>
        </div>
      )
    }

    const lines = content.split("\n")
    const titleLine = lines[0]
    const restOfContent = lines.slice(1).join("\n")

    return (
      <div
        className={`bg-gray-800 border border-gray-600 rounded p-2 font-mono ${isCompact ? "text-xs max-h-20 overflow-hidden" : "text-sm"}`}
      >
        {titleLine && (
          <div className="text-[#FF55FF] text-sm">
            <span className="pixelated-text" dangerouslySetInnerHTML={{ __html: parseAdventureText(titleLine) }} />
            <div className="text-[#555555] text-xs pixelated-text">{"--------------------------------"}</div>
          </div>
        )}
        {restOfContent && (
          <div
            className="text-[#FF55FF] text-xs leading-relaxed whitespace-pre-wrap pixelated-text"
            dangerouslySetInnerHTML={{ __html: parseAdventureText(restOfContent) }}
          />
        )}
      </div>
    )
  }

  // Shareable Code Functions
  const generateShareableCode = () => {
    if (!editorContent.trim()) {
      toast({
        title: "Error",
        description: "Editor content is empty. Cannot generate shareable code.",
        variant: "destructive",
      })
      return
    }
    const encoded = btoa(encodeURIComponent(editorContent)) // Base64 encode
    setShareableCode(encoded)
    setShowShareDialog(true)
  }

  const copyShareableCode = () => {
    navigator.clipboard.writeText(shareableCode)
    toast({
      title: "Copied!",
      description: "Shareable code copied to clipboard.",
    })
  }

  const loadFromShareableCode = () => {
    if (!codeToLoad.trim()) {
      toast({
        title: "Error",
        description: "Please paste a shareable code.",
        variant: "destructive",
      })
      return
    }
    try {
      const decoded = decodeURIComponent(atob(codeToLoad)) // Base64 decode
      setEditorContent(decoded)
      setShowLoadCodeDialog(false)
      setCodeToLoad("")
      toast({
        title: "Success",
        description: "Lore loaded from shareable code!",
      })
    } catch (error) {
      console.error("Failed to decode shareable code:", error)
      toast({
        title: "Error",
        description: "Invalid shareable code.",
        variant: "destructive",
      })
    }
  }

  // Gradient Color Handlers
  const handleAddGradientColor = () => {
    if (gradientColors.length < 5) {
      // Limit to 5 colors
      setGradientColors([...gradientColors, "#FFFFFF"]) // Add a new white color by default
    } else {
      toast({
        title: "Limit Reached",
        description: "You can add a maximum of 5 gradient colors.",
        variant: "warning",
      })
    }
  }

  const handleRemoveGradientColor = () => {
    if (gradientColors.length > 2) {
      // Ensure at least 2 colors remain
      setGradientColors(gradientColors.slice(0, -1))
    } else {
      toast({
        title: "Minimum Reached",
        description: "A gradient must have at least 2 colors.",
        variant: "warning",
      })
    }
  }

  const handleGradientColorChange = (index: number, value: string) => {
    const newColors = [...gradientColors]
    newColors[index] = value
    setGradientColors(newColors)
  }

  const handleCreateGradient = () => {
    insertCode(`<gradient:${gradientColors.join(":")}>`, "</gradient>")
    setShowGradientColorPicker(false) // Close the picker after creating
  }

  // Single Color Handler
  const handleCreateColor = () => {
    insertCode(`<color:${selectedColor}>`, "</color>")
    setShowSingleColorPicker(false) // Close the picker after creating
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 font-mono">
      <style jsx global>{`
        @font-face {
          font-family: "Minecraftia";
          src: url("/fonts/Minecraftia-Regular.ttf");
        }
        .pixelated-text {
          font-family: "Minecraftia", monospace;
        }
      `}</style>
      <div>
        {!isLoggedIn ? (
          <div className="flex items-center justify-center h-full">
            <Card className="w-96 bg-gray-900 border-gray-700">
              <CardHeader>
                <h1 className="text-2xl font-bold text-center text-green-400 pixelated-text">Loka Lore Editor</h1>
                <p className="text-center text-gray-400 text-sm pixelated-text">Login with Discord to create and save lores</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => signIn('discord', { callbackUrl: '/', redirect: true })} 
                  className="w-full bg-discord hover:bg-discord-dark text-white"
                >
                  <DiscordIcon className="w-4 h-4 mr-2" />
                  Login with Discord
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-green-400 pixelated-text">Loka Lore Editor</h1>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => signOut()} className="hover:bg-gray-700 pixelated-text">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Rest of the editor UI */}
            {/* ... */}
          </div>
        )}
      </div>
    </div>
  )
}
