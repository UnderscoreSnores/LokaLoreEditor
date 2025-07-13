"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Palette, Hash, Save, FolderOpen, LogIn, LogOut, User, Share2, ClipboardCopy, Plus, Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast" // Assuming useToast is available

interface Lore {
  id: string
  name: string
  content: string
  createdAt: string
}

export default function Component() {
  const [selectedColor, setSelectedColor] = useState("#00CA2B") // For single color
  const [gradientColors, setGradientColors] = useState(["#00CA2B", "#00FFB7"]) // For gradient, initially 2 colors
  const [showSingleColorPicker, setShowSingleColorPicker] = useState(false) // New state for single color picker
  const [showGradientColorPicker, setShowGradientColorPicker] = useState(false) // New state for gradient picker
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [currentUser, setCurrentUser] = useState("")
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
    const savedUser = localStorage.getItem("adventureWebUI_user")
    if (savedUser) {
      setCurrentUser(savedUser)
      setIsLoggedIn(true)
      loadUserLores(savedUser)
    }
  }, [])

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

  const handleLogin = () => {
    if (username && password) {
      setCurrentUser(username)
      setIsLoggedIn(true)
      localStorage.setItem("adventureWebUI_user", username)
      loadUserLores(username)
      setUsername("")
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser("")
    setSavedLores([])
    localStorage.removeItem("adventureWebUI_user")
  }

  const loadUserLores = (user: string) => {
    const saved = localStorage.getItem(`adventureWebUI_lores_${user}`)
    if (saved) {
      setSavedLores(JSON.parse(saved))
    }
  }

  const saveLore = () => {
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
    localStorage.setItem(`adventureWebUI_lores_${currentUser}`, JSON.stringify(updatedLores))
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
    localStorage.setItem(`adventureWebUI_lores_${currentUser}`, JSON.stringify(updatedLores))
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center font-mono">
        <Card className="w-96 bg-gray-900 border-gray-700">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center text-green-400 pixelated-text">Loka Lore Editor</h1>
            <p className="text-center text-gray-400 text-sm pixelated-text">Login to create and save lores</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {showRegister ? (
              <RegisterForm />
            ) : (
              <>
                <div>
                  <Label className="text-white pixelated-text">Username</Label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white pixelated-text"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label className="text-white pixelated-text">Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white pixelated-text"
                    placeholder="Enter password"
                  />
                </div>
                <Button onClick={handleLogin} className="w-full bg-green-600 hover:bg-green-700 pixelated-text">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button variant="outline" onClick={() => setShowDiscordLogin(true)} className="w-full text-white hover:bg-gray-700 pixelated-text mb-2">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login with Discord
                </Button>
                <Button variant="outline" onClick={() => setShowRegister(true)} className="w-full text-white hover:bg-gray-700 pixelated-text">
                  <User className="w-4 h-4 mr-2" />
                  Register
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 font-mono">
      <style jsx global>{`
        @font-face {
          font-family: "Minecraftia";
          src: url("/fonts/Minecraftia.ttf") format("truetype"); /* Assuming font is in public/fonts */
          font-weight: normal;
          font-style: normal;
        }
        .pixelated-text {
          font-family: "Minecraftia", monospace; /* Fallback to monospace */
          text-rendering: crisp-edges;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: grayscale;
        }
        .editor-container {
          position: relative;
          height: 400px; /* Fixed height for editor area */
          border: 1px solid #4a5568; /* Add a border to the container */
          border-radius: 0.375rem; /* Match shadcn rounded-md */
          overflow: hidden; /* Ensure children stay within bounds */
        }
        .editor-textarea {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: transparent;
          color: transparent; /* Hide actual text */
          caret-color: white; /* Keep caret visible */
          z-index: 1;
          resize: none;
          overflow: auto; /* Allow textarea to scroll */
          white-space: pre-wrap; /* Preserve whitespace and wrap lines */
          word-break: break-word; /* Break long words */
          padding: 0.75rem 1rem; /* Match shadcn textarea padding */
          line-height: 1.5; /* Match line height for alignment */
          box-sizing: border-box; /* Include padding in width/height */
          border: none; /* Remove default textarea border */
        }
        .editor-highlight {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none; /* Allow clicks to pass through to textarea */
          overflow: auto; /* Allow highlight div to scroll */
          z-index: 0;
          padding: 0.75rem 1rem; /* Match shadcn textarea padding */
          line-height: 1.5; /* Match line height for alignment */
          box-sizing: border-box; /* Include padding in width/height */
          background-color: #1a202c; /* Match bg-gray-950 for visual consistency */
        }
        .editor-highlight pre {
          margin: 0;
          white-space: pre-wrap; /* Preserve whitespace and wrap lines */
          word-break: break-word; /* Break long words */
          color: white; /* Default text color for editor */
        }
        /* Custom styles for color input to fill the box */
        input[type="color"] {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          border: none;
          padding: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        input[type="color"]::-webkit-color-swatch {
          border: none;
          border-radius: 0.375rem; /* Match parent rounded-md */
        }
        input[type="color"]::-moz-color-swatch {
          border: none;
          border-radius: 0.375rem; /* Match parent rounded-md */
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header with user info */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-green-400 pixelated-text">Adventure WebUI</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 flex items-center gap-2 pixelated-text">
              <User className="w-4 h-4" />
              {currentUser}
            </span>
            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className="border-gray-600 text-white bg-transparent pixelated-text"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Layout - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Left Panel - Editor */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              {/* Save/Load/Share Controls */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 pixelated-text">
                      <Save className="w-4 h-4 mr-2" />
                      Save Lore
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 text-white font-mono">
                    <DialogHeader>
                      <DialogTitle className="text-green-400 pixelated-text">Save Lore</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white pixelated-text">Lore Name</Label>
                        <Input
                          value={loreName}
                          onChange={(e) => setLoreName(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white pixelated-text"
                          placeholder="Enter lore name"
                        />
                      </div>
                      <Button onClick={saveLore} className="w-full bg-green-600 hover:bg-green-700 pixelated-text">
                        Save
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-white bg-transparent pixelated-text"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Load Lore
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] font-mono">
                    <DialogHeader>
                      <DialogTitle className="text-green-400 pixelated-text">Saved Lores</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                      <div className="space-y-4">
                        {savedLores.length === 0 ? (
                          <p className="text-gray-400 text-center py-8 pixelated-text">No saved lores found</p>
                        ) : (
                          savedLores.map((lore) => (
                            <div key={lore.id} className="border border-gray-600 rounded-lg p-4 space-y-3">
                              {/* Lore Header */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-green-400 text-lg pixelated-text">{lore.name}</div>
                                  <div className="text-xs text-gray-400 pixelated-text">
                                    Saved: {new Date(lore.createdAt).toLocaleDateString()} at{" "}
                                    {new Date(lore.createdAt).toLocaleTimeString()}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => loadLore(lore)}
                                    className="bg-blue-600 hover:bg-blue-700 pixelated-text"
                                  >
                                    Load
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteLore(lore.id)}
                                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white pixelated-text"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>

                              {/* Lore Preview */}
                              <div>
                                <Label className="text-gray-300 text-xs mb-2 block pixelated-text">Preview:</Label>
                                {renderLorePreview(lore.content, true)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                {/* Share Lore Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateShareableCode}
                  className="border-gray-600 text-white bg-transparent pixelated-text"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Lore
                </Button>

                {/* Load from Code Button */}
                <Dialog open={showLoadCodeDialog} onOpenChange={setShowLoadCodeDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-white bg-transparent pixelated-text"
                    >
                      <ClipboardCopy className="w-4 h-4 mr-2" />
                      Load from Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 text-white font-mono">
                    <DialogHeader>
                      <DialogTitle className="text-green-400 pixelated-text">Load Lore from Code</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white pixelated-text">Paste Shareable Code</Label>
                        <Textarea
                          value={codeToLoad}
                          onChange={(e) => setCodeToLoad(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white pixelated-text min-h-[100px]"
                          placeholder="Paste your shareable lore code here..."
                        />
                      </div>
                      <Button
                        onClick={loadFromShareableCode}
                        className="w-full bg-green-600 hover:bg-green-700 pixelated-text"
                      >
                        Load Lore
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Share Lore Dialog (separate from trigger) */}
              <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white font-mono">
                  <DialogHeader>
                    <DialogTitle className="text-green-400 pixelated-text">Share Your Lore</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-gray-300 pixelated-text">Copy the code below and share it with others:</p>
                    <Textarea
                      value={shareableCode}
                      readOnly
                      className="bg-gray-800 border-gray-600 text-white pixelated-text min-h-[150px]"
                    />
                    <Button onClick={copyShareableCode} className="w-full bg-blue-600 hover:bg-blue-700 pixelated-text">
                      <ClipboardCopy className="w-4 h-4 mr-2" />
                      Copy Code
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Formatting Toolbar */}
              <div className="flex gap-1 mb-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowSingleColorPicker((prev) => !prev)
                    setShowGradientColorPicker(false) // Close gradient picker if open
                  }}
                  className="w-8 h-8 p-0 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500"
                >
                  <Palette className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertCode("<b>", "</b>")}
                  className="w-8 h-8 p-0 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 pixelated-text"
                >
                  B
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertCode("<i>", "</i>")}
                  className="w-8 h-8 p-0 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 pixelated-text"
                >
                  I
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertCode("<u>", "</u>")}
                  className="w-8 h-8 p-0 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 pixelated-text"
                >
                  U
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertCode("<st>", "</st>")}
                  className="w-8 h-8 p-0 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 pixelated-text"
                >
                  S
                </Button>
              </div>

              {/* Color Tools */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowSingleColorPicker((prev) => !prev)
                      setShowGradientColorPicker(false) // Close gradient picker if open
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-7 text-xs pixelated-text"
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    Color
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowGradientColorPicker((prev) => !prev)
                      setShowSingleColorPicker(false) // Close single color picker if open
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 h-7 text-xs pixelated-text"
                  >
                    Gradient
                  </Button>
                </div>

                {/* Minecraft Colors */}
                <div>
                  <Label className="text-gray-300 text-xs mb-2 block font-semibold pixelated-text">
                    Minecraft Colors
                  </Label>
                  <div className="grid grid-cols-4 gap-1">
                    {minecraftColors.map(({ name, color, display }) => (
                      <Button
                        key={name}
                        size="sm"
                        onClick={() => insertCode(`<${name}>`, `</${name}>`)}
                        className="h-6 px-2 text-xs border hover:scale-105 transition-transform pixelated-text"
                        style={{
                          backgroundColor: color,
                          color:
                            color === "#000000" ||
                            color === "#0000AA" ||
                            color === "#00AA00" ||
                            color === "#AA0000" ||
                            color === "#AA00AA" ||
                            color === "#555555"
                              ? "#FFFFFF"
                              : "#000000",
                          borderColor: color,
                        }}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Single Color Picker */}
                {showSingleColorPicker && (
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                    <Label className="text-white text-xs block mb-1 pixelated-text">Single Color</Label>
                    <div className="flex flex-col gap-2">
                      <div className="w-full h-10 rounded-md overflow-hidden border border-gray-600">
                        <Input
                          type="color"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-full h-full p-0 border-0 cursor-pointer"
                        />
                      </div>
                      <Input
                        type="text"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white text-xs h-8 pixelated-text w-full"
                      />
                    </div>
                    <Button
                      onClick={handleCreateColor}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-8 text-sm pixelated-text mt-4"
                    >
                      Create Color
                    </Button>
                  </div>
                )}

                {/* Gradient Color Pickers */}
                {showGradientColorPicker && (
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                    <Label className="text-white text-xs block mb-1 pixelated-text">Gradient Colors</Label>
                    <div className="space-y-3">
                      {gradientColors.map((color, index) => (
                        <div key={index} className="flex flex-col gap-2">
                          <Label className="text-gray-400 text-xs pixelated-text">Color {index + 1}</Label>
                          <div className="w-full h-10 rounded-md overflow-hidden border border-gray-600">
                            <Input
                              type="color"
                              value={color}
                              onChange={(e) => handleGradientColorChange(index, e.target.value)}
                              className="w-full h-full p-0 border-0 cursor-pointer"
                            />
                          </div>
                          <Input
                            type="text"
                            value={color}
                            onChange={(e) => handleGradientColorChange(index, e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white text-xs h-8 pixelated-text w-full"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddGradientColor}
                        disabled={gradientColors.length >= 5}
                        className="h-7 px-3 text-xs bg-gray-700 border-gray-600 text-white hover:bg-gray-600 pixelated-text"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Color
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRemoveGradientColor}
                        disabled={gradientColors.length <= 2}
                        className="h-7 px-3 text-xs bg-gray-700 border-gray-600 text-white hover:bg-gray-600 pixelated-text"
                      >
                        <Minus className="w-3 h-3 mr-1" /> Remove Last
                      </Button>
                    </div>
                    <Button
                      onClick={handleCreateGradient}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-sm pixelated-text mt-4"
                    >
                      Create Gradient
                    </Button>
                  </div>
                )}
              </div>

              {/* Character/Line Counter */}
              <div className="text-xs text-gray-400 mt-2 pixelated-text">
                Lines: {getLineCount()}/15 | Current line: {getCurrentLineLength()}/32 chars
              </div>
            </CardHeader>
            <CardContent className="pt-0 editor-container">
              <Textarea
                ref={textareaRef}
                value={editorContent}
                onChange={handleContentChange}
                className="editor-textarea bg-gray-950 text-sm focus:border-green-500"
                placeholder="Enter your lore text with color codes... (15 lines max, 32 chars per line)"
              />
              <div ref={highlightRef} className="editor-highlight bg-gray-950 rounded-md">
                <pre
                  className="pixelated-text text-sm"
                  dangerouslySetInnerHTML={{ __html: highlightEditorContent(editorContent) }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Minecraft Tooltip Preview */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">{renderMinecraftPreview(editorContent)}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
