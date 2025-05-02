"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { generateText } from "ai"
import { cn } from "@/lib/utils"

import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const OpenAILogo = () => (
  <img
    src="https://cdn.brandfetch.io/idR3duQxYl/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B"
    alt="OpenAI Logo"
    width={16}
    height={16}
    className="mr-2 flex-shrink-0"
  />
)

const GoogleLogo = () => (
  <img
    src="https://cdn.brandfetch.io/id6O2oGzv-/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B"
    alt="Google Logo"
    width={16}
    height={16}
    className="mr-2 flex-shrink-0"
  />
)

const AnthropicLogo = () => (
  <img
    src="https://cdn.brandfetch.io/idmJWF3N06/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B"
    alt="Anthropic Logo"
    width={16}
    height={16}
    className="mr-2 flex-shrink-0"
  />
)

const HuggingFaceLogo = () => (
  <img
    src="https://cdn-lfs.hf.co/repos/96/a2/96a2c8468c1546e660ac2609e49404b8588fcf5a748761fa72c154b2836b4c83/942cad1ccda905ac5a659dfd2d78b344fccfb84a8a3ac3721e08f488205638a0?response-content-disposition=inline%3B+filename*%3DUTF-8%27%27hf-logo.svg%3B+filename%3D%22hf-logo.svg%22%3B&response-content-type=image%2Fsvg%2Bxml&Expires=1746221527&Policy=eyJTdGF0ZW1lbnQiOlt7IkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc0NjIyMTUyN319LCJSZXNvdXJjZSI6Imh0dHBzOi8vY2RuLWxmcy5oZi5jby9yZXBvcy85Ni9hMi85NmEyYzg0NjhjMTU0NmU2NjBhYzI2MDllNDk0MDRiODU4OGZjZjVhNzQ4NzYxZmE3MmMxNTRiMjgzNmI0YzgzLzk0MmNhZDFjY2RhOTA1YWM1YTY1OWRmZDJkNzhiMzQ0ZmNjZmI4NGE4YTNhYzM3MjFlMDhmNDg4MjA1NjM4YTA%7EcmVzcG9uc2UtY29udGVudC1kaXNwb3NpdGlvbj0qJnJlc3BvbnNlLWNvbnRlbnQtdHlwZT0qIn1dfQ__&Signature=pUNwgju6Ye7Lcq2qSA-hFii-AD2uOBXu1x6FsOatURl8%7EVd5k4PxOLR3-rdC%7EGzTuA8wEdBqvCRnbbS0NFLCY6TImn29aMXvASOt1jvj8AoJkM1jB6TZc4qfaqXIsXIa7k3xCSmb7LE8rK2YcN76pV36j1q3YbeMCvMLS4ZX7mKZWGGWw2uanbm3dzVKX4P4eVRapMMck%7E5D%7E6VebUr8SHb6qViATRHSQl1zd%7EhcIq18icXroh3Fb2wy-z0qZwlho4JokzlBvR1NvONACwBOrmfSUXi6aveBQF8r1DVv7oWNnPIYhBL-EwctFo6CXM5NK3CoyfpTefISUl5V13tSVA__&Key-Pair-Id=K3RPWS32NSSJCE"
    alt="HuggingFace Logo"
    width={16}
    height={16}
    className="mr-2 flex-shrink-0"
  />
)

export default function AIKeyTester() {
  const [provider, setProvider] = useState("openai")
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [model, setModel] = useState("gpt-4o")
  const [customModel, setCustomModel] = useState("")
  const [isCustomModel, setIsCustomModel] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const modelOptions = {
    openai: ["o4-mini", "o3-mini", "gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo", "gpt-3.5-turbo-16k", "custom"],
    google: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro", "custom"],
    anthropic: [
      "claude-3-7-sonnet-20250219",
      "claude-3-5-sonnet-20240620",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
      "custom",
    ],
    huggingface: [],
  }

  const handleProviderChange = (value: string) => {
    setProvider(value)

    if (value === "openai") {
      setModel("gpt-4o")
    } else if (value === "google") {
      setModel("gemini-1.5-flash")
    } else if (value === "anthropic") {
      setModel("claude-3-7-sonnet-20250219")
    } else if (value === "huggingface") {
      setModel("")
    }

    setIsCustomModel(false)
    setResult(null)
  }

  const handleModelChange = (value: string) => {
    setModel(value)
    setIsCustomModel(value === "custom")
  }

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey)
  }

  const getProviderLogo = () => {
    switch (provider) {
      case "openai":
        return <OpenAILogo />
      case "google":
        return <GoogleLogo />
      case "anthropic":
        return <AnthropicLogo />
      case "huggingface":
        return <HuggingFaceLogo />
      default:
        return null
    }
  }

  const testApiKey = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      if (provider === "huggingface") {
        const response = await fetch("https://huggingface.co/api/whoami-v2", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to validate HuggingFace token: ${response.statusText}`)
        }

        const data = await response.json()

        setResult({
          success: true,
          message: `Connection successful! Authenticated as ${data.name || data.id || "user"}.`,
          details: data,
        })
      } else {
        const selectedModel = isCustomModel ? customModel : model

        if (provider === "openai") {
          const openai = createOpenAI({ apiKey })
          await generateText({
            model: openai(selectedModel),
            prompt: "Hello, please respond with a simple confirmation if you can read this message.",
            maxTokens: 20,
          })

          setResult({
            success: true,
            message: `Connection successful! OpenAI model ${selectedModel} is working.`,
          })
        } else if (provider === "google") {
          const googleAI = createGoogleGenerativeAI({ apiKey })
          await generateText({
            model: googleAI(selectedModel),
            prompt: "Hello, please respond with a simple confirmation if you can read this message.",
            maxTokens: 20,
          })

          setResult({
            success: true,
            message: `Connection successful! Google model ${selectedModel} is working.`,
          })
        } else if (provider === "anthropic") {
          const anthropic = createAnthropic({ apiKey })

          await generateText({
            model: anthropic(selectedModel),
            prompt: "Hello, please respond with a simple confirmation if you can read this message.",
            maxTokens: 20,
          })

          setResult({
            success: true,
            message: `Connection successful! Anthropic model ${selectedModel} is working.`,
          })
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getApiKeyPlaceholder = () => {
    switch (provider) {
      case "openai":
        return "sk-..."
      case "google":
        return "AIza..."
      case "anthropic":
        return "sk-ant-..."
      case "huggingface":
        return "hf_..."
      default:
        return "Enter API key"
    }
  }

  const getApiKeyLabel = () => {
    switch (provider) {
      case "openai":
        return "OpenAI API Key"
      case "google":
        return "Google AI API Key"
      case "anthropic":
        return "Anthropic API Key"
      case "huggingface":
        return "Hugging Face Token"
      default:
        return "API Key"
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>AI API Key Tester</CardTitle>
          <CardDescription>Test your API keys with OpenAI, Google, Anthropic, or Hugging Face</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger id="provider" className="text-left">
                <SelectValue placeholder="Select provider">
                  <div className="flex items-center">
                    {getProviderLogo()}
                    <span>
                      {provider === "openai"
                        ? "OpenAI"
                        : provider === "google"
                          ? "Google"
                          : provider === "anthropic"
                            ? "Anthropic"
                            : "Hugging Face"}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">
                  <div className="flex items-center">
                    <OpenAILogo />
                    <span>OpenAI</span>
                  </div>
                </SelectItem>
                <SelectItem value="google">
                  <div className="flex items-center">
                    <GoogleLogo />
                    <span>Google</span>
                  </div>
                </SelectItem>
                <SelectItem value="anthropic">
                  <div className="flex items-center">
                    <AnthropicLogo />
                    <span>Anthropic</span>
                  </div>
                </SelectItem>
                <SelectItem value="huggingface">
                  <div className="flex items-center">
                    <HuggingFaceLogo />
                    <span>Hugging Face</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {provider !== "huggingface" && (
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={model} onValueChange={handleModelChange}>
                <SelectTrigger id="model" className="text-left">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions[provider as keyof typeof modelOptions].map((modelOption) => (
                    <SelectItem key={modelOption} value={modelOption} className="w-full">
                      {modelOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="api-key">{getApiKeyLabel()}</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder={getApiKeyPlaceholder()}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={toggleApiKeyVisibility}
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {isCustomModel && (
            <div className="space-y-2">
              <Label htmlFor="custom-model">Custom Model Name</Label>
              <Input
                id="custom-model"
                placeholder={`Enter ${provider} model name`}
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
              />
            </div>
          )}

          {result && (
            <Alert
              variant={result.success ? "default" : "destructive"}
              className={cn(
                "overflow-hidden",
                result.success && "border-green-500 text-green-700 bg-white",
                !result.success && "bg-white",
              )}
            >
              {result.success ? (
                <>
                  <AlertTitle className="flex items-center">
                    <span className="mr-2">✅</span>Success
                  </AlertTitle>
                  <AlertDescription className="break-words">{result.message}</AlertDescription>
                  {result.details && provider === "huggingface" && (
                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      <pre>{JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <AlertTitle className="flex items-center">
                    <span className="mr-2">❌</span>Error
                  </AlertTitle>
                  <AlertDescription className="break-words">{result.message}</AlertDescription>
                </>
              )}
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={testApiKey}
            disabled={isLoading || !apiKey || (isCustomModel && !customModel)}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
