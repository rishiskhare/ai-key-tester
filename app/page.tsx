"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Github, Check, X, ChevronUp, ChevronDown } from "lucide-react"
import { generateText } from "ai"
import { cn } from "@/lib/utils"

import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createXai } from "@ai-sdk/xai"
import { createPerplexity } from "@ai-sdk/perplexity"
import { createMistral } from "@ai-sdk/mistral"

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
    src="https://cdn.brandfetch.io/idGqKHD5xE/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B"
    alt="Hugging Face Logo"
    width={16}
    height={16}
    className="mr-2 flex-shrink-0"
  />
)

const XAILogo = () => (
  <img
    src="https://cdn.brandfetch.io/iddjpnb3_W/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B"
    alt="xAI Grok Logo"
    width={16}
    height={16}
    className="mr-2 flex-shrink-0"
  />
)

const PerplexityLogo = () => (
  <img
    src="https://cdn.brandfetch.io/idNdawywEZ/w/800/h/800/theme/dark/idy0gCuAWE.png?c=1dxbfHSJFAPEGdCLU4o5B"
    alt="Perplexity Logo"
    width={16}
    height={16}
    className="mr-2 flex-shrink-0"
  />
)

const MistralLogo = () => (
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Mistral_AI_logo_%282025%E2%80%93%29.svg"
    alt="Mistral AI Logo"
    width={16}
    height={16}
    className="mr-2 flex-shrink-0"
  />
)

const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes scaleIn {
    from { transform: scale(0); }
    to { transform: scale(1); }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  .animate-fade-out {
    animation: fadeOut 0.5s ease-in-out forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
`

type OverlayState = "hidden" | "visible" | "fading"

interface TestResult {
  success: boolean
  message: string
  details?: any
  modelResponse?: {
    prompt: string
    response: string
  }
}

export default function AIKeyTester() {
  const [provider, setProvider] = useState("openai")
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [model, setModel] = useState("gpt-4.1-nano")
  const [customModel, setCustomModel] = useState("")
  const [isCustomModel, setIsCustomModel] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successOverlayState, setSuccessOverlayState] = useState<OverlayState>("hidden")
  const [errorOverlayState, setErrorOverlayState] = useState<OverlayState>("hidden")
  const [safetyInfoExpanded, setSafetyInfoExpanded] = useState(true)
  const [hasTestedConnection, setHasTestedConnection] = useState(false)

  const modelOptions = {
    openai: [
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4-turbo",
      "gpt-4",
      "gpt-3.5-turbo",
      "o1",
      "o1-mini",
      "o1-preview",
      "o3-mini",
      "o3",
      "o4-mini",
      "chatgpt-4o-latest",
      "custom",
    ],
    google: [
      "gemini-2.5-flash-preview-04-17",
      "gemini-2.5-pro-exp-03-25",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash-8b",
      "gemini-1.5-flash-8b-latest",
      "custom",
    ],
    anthropic: [
      "claude-3-7-sonnet-20250219",
      "claude-3-5-sonnet-20241022",
      "claude-3-5-sonnet-20240620",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
      "custom",
    ],
    huggingface: [],
    xai: ["grok-3", "grok-3-fast", "grok-3-mini", "grok-3-mini-fast", "grok-2-1212", "grok-beta", "custom"],
    perplexity: ["sonar-pro", "sonar", "sonar-deep-research", "custom"],
    mistral: ["mistral-large-latest", "mistral-small-latest", "ministral-3b-latest", "ministral-8b-latest", "custom"],
  }

  const handleProviderChange = (value: string) => {
    setProvider(value)

    if (value === "openai") {
      setModel("gpt-4.1-nano")
    } else if (value === "google") {
      setModel("gemini-2.0-flash")
    } else if (value === "anthropic") {
      setModel("claude-3-7-sonnet-20250219")
    } else if (value === "huggingface") {
      setModel("")
    } else if (value === "xai") {
      setModel("grok-3")
    } else if (value === "perplexity") {
      setModel("sonar-pro")
    } else if (value === "mistral") {
      setModel("mistral-large-latest")
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
      case "xai":
        return <XAILogo />
      case "perplexity":
        return <PerplexityLogo />
      case "mistral":
        return <MistralLogo />
      default:
        return null
    }
  }

  const showSuccessAnimation = () => {
    setSuccessOverlayState("visible")
    setTimeout(() => {
      setSuccessOverlayState("fading")
      setTimeout(() => setSuccessOverlayState("hidden"), 500)
    }, 800)
  }

  const showErrorAnimation = () => {
    setErrorOverlayState("visible")
    setTimeout(() => {
      setErrorOverlayState("fading")
      setTimeout(() => setErrorOverlayState("hidden"), 500)
    }, 800)
  }

  const testApiKey = async () => {
    if (!hasTestedConnection) {
      setSafetyInfoExpanded(false)
      setHasTestedConnection(true)
    }

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
          throw new Error(`Failed to validate Hugging Face token: ${response.statusText}`)
        }

        const data = await response.json()

        setResult({
          success: true,
          message: `Connection successful! Authenticated as ${data.name || data.id || "user"}.`,
          details: data,
        })
        showSuccessAnimation()
      } else {
        const selectedModel = isCustomModel ? customModel : model
        const testPrompt = "Hello, please respond with a simple confirmation if you can read this message."

        if (provider === "openai") {
          const openai = createOpenAI({ apiKey })
          const { text } = await generateText({
            model: openai(selectedModel),
            prompt: testPrompt,
            maxTokens: 100,
          })

          setResult({
            success: true,
            message: `Connection successful! OpenAI model ${selectedModel} is working.`,
            modelResponse: {
              prompt: testPrompt,
              response: text,
            },
          })
          showSuccessAnimation()
        } else if (provider === "google") {
          const googleAI = createGoogleGenerativeAI({ apiKey })
          const { text } = await generateText({
            model: googleAI(selectedModel),
            prompt: testPrompt,
            maxTokens: 100,
          })

          setResult({
            success: true,
            message: `Connection successful! Google model ${selectedModel} is working.`,
            modelResponse: {
              prompt: testPrompt,
              response: text,
            },
          })
          showSuccessAnimation()
        } else if (provider === "anthropic") {
          const anthropic = createAnthropic({ apiKey })
          const { text } = await generateText({
            model: anthropic(selectedModel),
            prompt: testPrompt,
            maxTokens: 100,
          })

          setResult({
            success: true,
            message: `Connection successful! Anthropic model ${selectedModel} is working.`,
            modelResponse: {
              prompt: testPrompt,
              response: text,
            },
          })
          showSuccessAnimation()
        } else if (provider === "xai") {
          const xai = createXai({ apiKey })
          const { text } = await generateText({
            model: xai(selectedModel),
            prompt: testPrompt,
            maxTokens: 100,
          })

          setResult({
            success: true,
            message: `Connection successful! xAI Grok model ${selectedModel} is working.`,
            modelResponse: {
              prompt: testPrompt,
              response: text,
            },
          })
          showSuccessAnimation()
        } else if (provider === "perplexity") {
          const perplexity = createPerplexity({ apiKey })
          const { text } = await generateText({
            model: perplexity(selectedModel),
            prompt: testPrompt,
            maxTokens: 100,
          })

          setResult({
            success: true,
            message: `Connection successful! Perplexity model ${selectedModel} is working.`,
            modelResponse: {
              prompt: testPrompt,
              response: text,
            },
          })
          showSuccessAnimation()
        } else if (provider === "mistral") {
          const mistral = createMistral({ apiKey })
          const { text } = await generateText({
            model: mistral(selectedModel),
            prompt: testPrompt,
            maxTokens: 100,
          })

          setResult({
            success: true,
            message: `Connection successful! Mistral AI model ${selectedModel} is working.`,
            modelResponse: {
              prompt: testPrompt,
              response: text,
            },
          })
          showSuccessAnimation()
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
      showErrorAnimation()
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
      case "xai":
        return "xai-..."
      case "perplexity":
        return "pplx-..."
      case "mistral":
        return "..."
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
      case "xai":
        return "xAI API Key"
      case "perplexity":
        return "Perplexity API Key"
      case "mistral":
        return "Mistral AI API Key"
      default:
        return "API Key"
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-8">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-1">
            <CardTitle>AI API Key Tester</CardTitle>
            <a
              href="https://github.com/rishiskhare/ai-key-tester"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-sm"
            >
              <Github className="w-4 h-4 mr-1.5" />
              View on GitHub
            </a>
          </div>
          <CardDescription className="mb-4">
            Locally test your API keys from OpenAI, Anthropic, and more!
          </CardDescription>
          <div
            className={cn(
              "mt-2 rounded-md transition-all duration-200 bg-blue-50 text-blue-800",
              safetyInfoExpanded ? "" : "hover:bg-blue-100",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between cursor-pointer transition-colors",
                safetyInfoExpanded ? "px-3 pt-3 pb-0" : "p-3",
              )}
              onClick={() => setSafetyInfoExpanded(!safetyInfoExpanded)}
            >
              <div className="flex items-center">
                <span className="mr-2">🔒</span>
                <span className="text-sm font-medium">Your keys are safe</span>
                {!safetyInfoExpanded && <span className="ml-2 text-xs text-blue-600">(read more)</span>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                {safetyInfoExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
            </div>

            {safetyInfoExpanded && (
              <div className="px-3 pt-1 pb-3 text-sm">
                All testing occurs entirely in your browser. API keys are never sent to any servers or stored, and they
                are discarded once you close or refresh the page. This project is{" "}
                <a
                  href="https://github.com/rishiskhare/ai-key-tester"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-blue-600 transition-colors"
                >
                  open-source
                </a>{" "}
                and client-side.
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
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
                            : provider === "huggingface"
                              ? "Hugging Face"
                              : provider === "xai"
                                ? "xAI Grok"
                                : provider === "perplexity"
                                  ? "Perplexity"
                                  : "Mistral AI"}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic">
                  <div className="flex items-center">
                    <AnthropicLogo />
                    <span>Anthropic</span>
                  </div>
                </SelectItem>
                <SelectItem value="google">
                  <div className="flex items-center">
                    <GoogleLogo />
                    <span>Google</span>
                  </div>
                </SelectItem>
                <SelectItem value="huggingface">
                  <div className="flex items-center">
                    <HuggingFaceLogo />
                    <span>Hugging Face</span>
                  </div>
                </SelectItem>
                <SelectItem value="mistral">
                  <div className="flex items-center">
                    <MistralLogo />
                    <span>Mistral AI</span>
                  </div>
                </SelectItem>
                <SelectItem value="openai">
                  <div className="flex items-center">
                    <OpenAILogo />
                    <span>OpenAI</span>
                  </div>
                </SelectItem>
                <SelectItem value="perplexity">
                  <div className="flex items-center">
                    <PerplexityLogo />
                    <span>Perplexity</span>
                  </div>
                </SelectItem>
                <SelectItem value="xai">
                  <div className="flex items-center">
                    <XAILogo />
                    <span>xAI Grok</span>
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
                      <span>{modelOption}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

          {result && result.success ? (
            <Alert variant="default" className="overflow-hidden mt-2 border-green-500 text-green-700 bg-white">
              <AlertTitle className="flex items-center">
                <span className="mr-2">✅</span>Connection successful
              </AlertTitle>

              {result.details && provider === "huggingface" && (
                <div className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                  <pre>{JSON.stringify(result.details, null, 2)}</pre>
                </div>
              )}

              {result.modelResponse && (
                <div className="mt-3 text-sm border rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <strong>Prompt:</strong>
                    <span className="font-mono text-xs"> {result.modelResponse.prompt}</span>
                  </div>
                  <div className="p-3">
                    <strong>Response:</strong>
                    <span className="font-mono text-xs whitespace-pre-wrap"> {result.modelResponse.response}</span>
                  </div>
                </div>
              )}
            </Alert>
          ) : result && !result.success ? (
            <Alert variant="destructive" className="overflow-hidden mt-2 bg-white">
              <AlertTitle className="flex items-center">
                <span className="mr-2">❌</span>Error
              </AlertTitle>
              <AlertDescription className="break-words">{result.message}</AlertDescription>
            </Alert>
          ) : null}
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

      {successOverlayState !== "hidden" && (
        <div
          className={cn(
            "fixed inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center z-50",
            successOverlayState === "visible" && "animate-fade-in",
            successOverlayState === "fading" && "animate-fade-out",
          )}
        >
          <div className="text-white">
            <Check className="h-24 w-24 animate-scale-in" strokeWidth={3} />
          </div>
        </div>
      )}

      {errorOverlayState !== "hidden" && (
        <div
          className={cn(
            "fixed inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center z-50",
            errorOverlayState === "visible" && "animate-fade-in",
            errorOverlayState === "fading" && "animate-fade-out",
          )}
        >
          <div className="text-white">
            <X className="h-24 w-24 animate-scale-in" strokeWidth={3} />
          </div>
        </div>
      )}
    </div>
  )
}
