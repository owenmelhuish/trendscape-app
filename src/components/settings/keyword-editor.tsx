"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface KeywordEditorProps {
  keywords: string[];
  onSave: (keywords: string[]) => Promise<void>;
}

export function KeywordEditor({ keywords: initial, onSave }: KeywordEditorProps) {
  const [keywords, setKeywords] = useState(initial);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  const addKeyword = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(keywords);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add keyword..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addKeyword()}
        />
        <Button variant="outline" size="icon" onClick={addKeyword}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <Badge key={keyword} variant="secondary" className="gap-1 pr-1">
            {keyword}
            <button
              onClick={() => removeKeyword(keyword)}
              className="ml-1 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {keywords.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No keywords configured. Add keywords to start tracking trends.
          </p>
        )}
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Keywords"}
      </Button>
    </div>
  );
}
