"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyDeckLinkButton({ shareUrl }: {shareUrl: string}) {
    const [message, setMessage] = useState("");

    async function copyLink() {
        try{
            const url = new URL(shareUrl, window.location.origin);
            await navigator.clipboard.writeText(url.href);
            setMessage("Link copied.");
        } catch {
            setMessage("Couldn't copy the link. Try again.");
        }
    }
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copyLink}>Copy Link</Button>
            <span role="status"  className="text-sm text-muted-foreground">{message}</span>

        </div>
    );
}