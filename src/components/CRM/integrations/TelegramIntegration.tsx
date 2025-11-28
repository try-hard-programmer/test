import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Smartphone,
  Key,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface TelegramIntegrationProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  config: Record<string, string>;
  onConfigUpdate: (config: Record<string, string>) => void;
}

type ConnectionStatus = "disconnected" | "validating" | "connected" | "error";

export const TelegramIntegration = ({
  enabled,
  onToggle,
  config,
  onConfigUpdate,
}: TelegramIntegrationProps) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    (config.status as ConnectionStatus) || "disconnected"
  );

  // Changed state to store api_id and api_hash
  const [apiId, setApiId] = useState(config.apiId || "");
  const [apiHash, setApiHash] = useState(config.apiHash || "");

  const [errorMessage, setErrorMessage] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const validateConfig = () => {
    // Basic validation
    if (!apiId.trim()) {
      setErrorMessage("App api_id tidak boleh kosong");
      return false;
    }

    if (!apiHash.trim()) {
      setErrorMessage("App api_hash tidak boleh kosong");
      return false;
    }

    // api_id should be numeric
    const numberPattern = /^\d+$/;
    if (!numberPattern.test(apiId)) {
      setErrorMessage("App api_id harus berupa angka");
      return false;
    }

    // api_hash is usually 32 chars hex, but we'll just check if it's substantial
    if (apiHash.length < 10) {
      setErrorMessage("Format App api_hash tidak valid");
      return false;
    }

    return true;
  };

  const handleConnect = async () => {
    setErrorMessage("");

    if (!validateConfig()) {
      setConnectionStatus("error");
      return;
    }

    setIsValidating(true);
    setConnectionStatus("validating");

    // Simulate API call to validate credentials
    setTimeout(() => {
      // Simulate 80% success rate
      if (Math.random() > 0.2) {
        setConnectionStatus("connected");
        onConfigUpdate({
          apiId,
          apiHash,
          status: "connected",
          connectedAt: new Date().toISOString(),
        });
      } else {
        setConnectionStatus("error");
        setErrorMessage("Kredensial API tidak valid");
      }
      setIsValidating(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    setConnectionStatus("disconnected");
    setApiId("");
    setApiHash("");
    setErrorMessage("");
    onConfigUpdate({
      apiId: "",
      apiHash: "",
      status: "disconnected",
      connectedAt: "",
    });
    onToggle(false);
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "connected":
        return (
          <Badge className="bg-green-500 gap-1">
            <CheckCircle className="h-3 w-3" />
            Configured
          </Badge>
        );
      case "validating":
        return (
          <Badge className="bg-blue-500 gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Validating...
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Invalid Config
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3 w-3" />
            Not Configured
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Changed icon to Smartphone to represent Client/Userbot API */}
            <Smartphone className="h-5 w-5 text-sky-600" />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Telegram Client</CardTitle>
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-sky-100 text-sky-700 border-sky-300"
                >
                  MTProto
                </Badge>
              </div>
              <CardDescription>
                Connect menggunakan Telegram API (my.telegram.org)
              </CardDescription>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            {getStatusBadge()}
          </div>

          {/* Disconnected or Error State - Show Input Form */}
          {(connectionStatus === "disconnected" ||
            connectionStatus === "error") && (
            <div className="space-y-4">
              {/* Instructions Updated for my.telegram.org */}
              <Alert className="bg-sky-50 border-sky-200">
                <AlertDescription className="text-sky-800">
                  <strong>Butuh API Key?</strong> Login ke{" "}
                  <a
                    href="https://my.telegram.org/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline inline-flex items-center gap-1"
                  >
                    my.telegram.org
                    <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  dan masuk ke menu "API development tools" untuk mendapatkan ID
                  dan Hash.
                </AlertDescription>
              </Alert>

              {/* App API ID Input */}
              <div className="space-y-2">
                <Label htmlFor="apiId">
                  App api_id <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="apiId"
                    type="text"
                    inputMode="numeric"
                    placeholder="12345678"
                    value={apiId}
                    onChange={(e) => {
                      // Only allow numbers
                      const val = e.target.value.replace(/\D/g, "");
                      setApiId(val);
                      setErrorMessage("");
                    }}
                    disabled={isValidating}
                    className="font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  ID aplikasi berupa angka dari my.telegram.org
                </p>
              </div>

              {/* App API Hash Input */}
              <div className="space-y-2">
                <Label htmlFor="apiHash">
                  App api_hash <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="apiHash"
                    type="password"
                    placeholder="a1b2c3d4e5f6..."
                    value={apiHash}
                    onChange={(e) => {
                      setApiHash(e.target.value);
                      setErrorMessage("");
                    }}
                    disabled={isValidating}
                    className="font-mono"
                  />
                  <Key className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Hash rahasia aplikasi Anda
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Connect Button */}
              <Button
                onClick={handleConnect}
                disabled={isValidating || !apiId || !apiHash}
                className="w-full gap-2"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validating Config...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>

              {/* Setup Instructions Updated */}
              <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                <h4 className="font-semibold text-sm">
                  Cara mendapatkan API ID & Hash:
                </h4>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>
                    Buka{" "}
                    <a
                      href="https://my.telegram.org"
                      target="_blank"
                      className="underline hover:text-primary"
                    >
                      my.telegram.org
                    </a>
                  </li>
                  <li>Masukkan nomor telepon Anda dan kode OTP</li>
                  <li>
                    Klik menu <strong>API development tools</strong>
                  </li>
                  <li>
                    Isi form <em>App title</em> dan <em>Short name</em> (bebas)
                  </li>
                  <li>
                    Klik <strong>Create application</strong>
                  </li>
                  <li>
                    Salin <strong>App api_id</strong> dan{" "}
                    <strong>App api_hash</strong>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Validating State */}
          {connectionStatus === "validating" && (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
              <div className="text-center">
                <p className="font-medium">Memverifikasi Konfigurasi...</p>
                <p className="text-sm text-muted-foreground">
                  Sedang mengecek format kredensial
                </p>
              </div>
            </div>
          )}

          {/* Connected State */}
          {connectionStatus === "connected" && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Konfigurasi API Tersimpan. Sistem siap untuk melakukan login
                  session.
                </AlertDescription>
              </Alert>

              {/* Connection Info */}
              <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">App api_id:</span>
                  <span className="font-mono">{config.apiId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">App api_hash:</span>
                  <span className="font-mono text-xs">
                    {config.apiHash?.substring(0, 8)}...
                    {config.apiHash?.substring(config.apiHash.length - 4)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Updated At:</span>
                  <span className="font-medium">
                    {config.connectedAt
                      ? new Date(config.connectedAt).toLocaleString()
                      : "-"}
                  </span>
                </div>
              </div>

              {/* Disconnect Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                className="w-full"
              >
                Reset Configuration
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
