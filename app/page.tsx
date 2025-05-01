"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Info, Eye, EyeOff } from "lucide-react"
import { generateText } from "ai"
import { cn } from "@/lib/utils"

import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"

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

export default function AIKeyTester() {
  const [provider, setProvider] = useState("openai")
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [model, setModel] = useState("gpt-4o")
  const [customModel, setCustomModel] = useState("")
  const [isCustomModel, setIsCustomModel] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
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
  }

  const handleProviderChange = (value: string) => {
    setProvider(value)

    if (value === "openai") {
      setModel("gpt-4o")
    } else if (value === "google") {
      setModel("gemini-1.5-flash")
    } else if (value === "anthropic") {
      setModel("claude-3-7-sonnet-20250219")
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
      default:
        return null
    }
  }

  const testApiKey = async () => {
    setIsLoading(true)
    setResult(null)

    try {
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
        await generateText({
          model: google(selectedModel),
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
      } else {
        throw new Error(`Provider ${provider} is not available in this environment`)
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
      default:
        return "API Key"
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>AI API Key Tester</CardTitle>
          <CardDescription>Test your API keys with OpenAI, Google, or Anthropic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="space-y-2 w-1/3">
              <Label htmlFor="provider">Provider</Label>
              <Select value={provider} onValueChange={handleProviderChange}>
                <SelectTrigger id="provider" className="text-left">
                  <SelectValue placeholder="Select provider">
                    <div className="flex items-center">
                      {getProviderLogo()}
                      <span>{provider === "openai" ? "OpenAI" : provider === "google" ? "Google" : "Anthropic"}</span>
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-2/3">
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
          </div>

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
            disabled={
              isLoading ||
              !apiKey ||
              (isCustomModel && !customModel) ||
              (provider === "anthropic")
            }
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
