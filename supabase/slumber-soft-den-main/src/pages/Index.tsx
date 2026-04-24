import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertCircle,
  Heart,
  Loader2,
  Search,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

interface PlayerData {
  basicInfo: {
    accountId: string;
    nickname: string;
    level: number;
    currentExp: number;
    expForCurrentLevel: number;
    expForNextLevel: number;
    expNeeded: number;
    progressPercentage: number;
  };
  bannerUrl: string;
  outfitUrl: string;
}

const Index = () => {
  const [uid, setUid] = useState("7468694883");
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const fetchPlayerData = async (userId: string) => {
    const id = userId.trim();
    if (!id) {
      setFetchError("Please enter a valid UID");
      return;
    }

    setIsLoading(true);
    setFetchError("");
    setPlayerData(null);

    try {
      const { data, error } = await supabase.functions.invoke("player-proxy", {
        body: { uid: id },
      });

      if (error) throw new Error(error.message || "Lookup failed.");
      if (data?.error) throw new Error(data.error);

      const levelJson = data?.level;
      if (!levelJson?.success || !levelJson?.player_info) {
        throw new Error("Player not found.");
      }
      const p = levelJson.player_info;
      setPlayerData({
        basicInfo: {
          accountId: String(p.uid ?? id),
          nickname: p.nickname ?? "Unknown",
          level: p.current_level ?? 0,
          currentExp: p.current_exp ?? 0,
          expForCurrentLevel: p.exp_for_current_level ?? 0,
          expForNextLevel: p.exp_for_next_level ?? 0,
          expNeeded: p.exp_needed ?? 0,
          progressPercentage: p.progress_percentage ?? 0,
        },
        bannerUrl: data?.banner ?? "",
        outfitUrl: data?.outfit ?? "",
      });
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : "Failed to fetch player data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlayerData(uid);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <header className="relative w-full overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
        <div
          className="absolute inset-0 opacity-20 mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, hsl(46 80% 62% / 0.5), transparent 40%), radial-gradient(circle at 80% 70%, hsl(189 100% 50% / 0.35), transparent 45%)",
          }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="text-accent drop-shadow-[0_0_20px_hsl(46_80%_62%/0.6)]">EXU</span>
            <span className="text-foreground/80 mx-3">×</span>
            <span className="text-secondary">MAFU</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Premium Free Fire player lookup. Enter any UID to reveal level,
            banner, and outfit.
          </p>
        </div>
      </header>

      {/* Search */}
      <section className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Enter Player UID..."
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                className="pl-10 h-12 bg-input border-border focus-visible:ring-accent focus-visible:border-accent"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 px-8 bg-gradient-gold text-accent-foreground font-semibold hover:opacity-90 transition-luxe shadow-gold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Searching…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" /> Search
                </>
              )}
            </Button>
          </form>
        </div>
      </section>

      {/* Error */}
      {fetchError && (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="bg-destructive/10 border border-destructive/40 text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{fetchError}</p>
          </div>
        </div>
      )}

      {/* Player data */}
      {playerData && (
        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Banner */}
          <div className="mb-8 rounded-xl overflow-hidden border border-accent/40 shadow-gold animate-in fade-in slide-in-from-bottom-2 duration-500">
            <img
              src={playerData.bannerUrl}
              alt={`${playerData.basicInfo.nickname} profile banner`}
              className="w-full h-auto block"
              loading="lazy"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Profile */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-card border-border overflow-hidden shadow-gold/30 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="border-l-4 border-accent p-8">
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-accent mb-2">
                        Player Profile
                      </p>
                      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {playerData.basicInfo.nickname}
                      </h2>
                      <p className="text-muted-foreground">
                        Level {playerData.basicInfo.level} • UID{" "}
                        <span className="text-foreground font-mono">
                          {playerData.basicInfo.accountId}
                        </span>
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-semibold">
                      Lv {playerData.basicInfo.level}
                    </div>
                  </div>

                  {/* EXP progress bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>
                        EXP {playerData.basicInfo.currentExp.toLocaleString()} /{" "}
                        {playerData.basicInfo.expForNextLevel.toLocaleString()}
                      </span>
                      <span className="text-accent font-semibold">
                        {playerData.basicInfo.progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-input overflow-hidden border border-border">
                      <div
                        className="h-full bg-gradient-gold transition-luxe"
                        style={{
                          width: `${Math.min(100, Math.max(0, playerData.basicInfo.progressPercentage))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <StatTile
                      icon={<Trophy className="w-4 h-4" />}
                      label="Level"
                      value={playerData.basicInfo.level}
                      tone="gold"
                    />
                    <StatTile
                      icon={<Zap className="w-4 h-4" />}
                      label="Current EXP"
                      value={playerData.basicInfo.currentExp.toLocaleString()}
                      tone="teal"
                    />
                    <StatTile
                      icon={<Heart className="w-4 h-4" />}
                      label="Needed"
                      value={playerData.basicInfo.expNeeded.toLocaleString()}
                      tone="gold"
                    />
                    <StatTile
                      icon={<Users className="w-4 h-4" />}
                      label="Next Lv EXP"
                      value={playerData.basicInfo.expForNextLevel.toLocaleString()}
                      tone="teal"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Account */}
            <Card className="bg-gradient-card border-border h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="border-l-4 border-secondary p-6 h-full flex flex-col">
                <p className="text-xs uppercase tracking-[0.25em] text-secondary mb-4">
                  Account Info
                </p>
                <div className="space-y-5 flex-1">
                  <Field label="UID" value={playerData.basicInfo.accountId} mono />
                  <Field
                    label="Nickname"
                    value={playerData.basicInfo.nickname}
                  />
                  <Field
                    label="Level"
                    value={String(playerData.basicInfo.level)}
                  />
                </div>
                <p className="text-muted-foreground text-xs pt-6 border-t border-border mt-6">
                  Profile data refreshes in real-time.
                </p>
              </div>
            </Card>
          </div>

          {/* Outfit */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent" />
              Outfit Showcase
            </h2>
            <Card className="bg-gradient-card border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="border-l-4 border-accent">
                <img
                  src={playerData.outfitUrl}
                  alt={`${playerData.basicInfo.nickname} outfit`}
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>
            </Card>
          </section>
        </main>
      )}

      {/* Empty */}
      {!playerData && !isLoading && !fetchError && (
        <section className="max-w-3xl mx-auto px-4 py-16 text-center">
          <Card className="bg-gradient-card border-border p-12">
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-6">
              <Search className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
              Enter a Player UID to begin
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Search any player UID to view their level progress, banner, and outfit.
            </p>
          </Card>
        </section>
      )}

      {/* Loading */}
      {isLoading && (
        <section className="max-w-3xl mx-auto px-4 py-16 text-center">
          <Card className="bg-gradient-card border-border p-12">
            <Loader2 className="w-12 h-12 text-accent mx-auto mb-4 animate-spin" />
            <p className="text-foreground font-semibold">Fetching player data…</p>
          </Card>
        </section>
      )}

      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
          EXU × MAFU — Crafted for prestige players.
        </div>
      </footer>
    </div>
  );
};

const StatTile = ({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: "gold" | "teal";
}) => {
  const accentClass =
    tone === "gold"
      ? "text-accent group-hover:border-accent group-hover:shadow-gold"
      : "text-secondary group-hover:border-secondary";
  return (
    <div className="group bg-input/60 rounded-lg p-4 border border-border transition-luxe">
      <div className={`flex items-center gap-2 mb-2 ${accentClass.split(" ")[0]}`}>
        {icon}
        <span className="text-muted-foreground text-xs uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={`text-2xl font-bold ${accentClass.split(" ")[0]}`}>{value}</p>
    </div>
  );
};

const Field = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div>
    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className={`text-foreground ${mono ? "font-mono text-sm break-all" : "font-semibold"}`}>
      {value}
    </p>
  </div>
);

export default Index;
