const els ***REMOVED*** {
  pulseDot: document.getElementById("pulseDot"),
  pulseText: document.getElementById("pulseText"),
  lastUpdate: document.getElementById("lastUpdate"),
  latency: document.getElementById("latency"),

  guardianState: document.getElementById("guardianState"),
  guardianMeta: document.getElementById("guardianMeta"),
  daemonState: document.getElementById("daemonState"),
  daemonMeta: document.getElementById("daemonMeta"),
  loopState: document.getElementById("loopState"),
  loopMeta: document.getElementById("loopMeta"),
  autostartState: document.getElementById("autostartState"),
  autostartMeta: document.getElementById("autostartMeta"),

  cardGuardian: document.getElementById("cardGuardian"),
  cardDaemon: document.getElementById("cardDaemon"),
  cardLoop: document.getElementById("cardLoop"),
  cardAutostart: document.getElementById("cardAutostart"),

  stateList: document.getElementById("stateList"),
  consensusText: document.getElementById("consensusText"),
  logText: document.getElementById("logText"),
  rawText: document.getElementById("rawText"),

  btnRefresh: document.getElementById("btnRefresh"),
  btnStart: document.getElementById("btnStart"),
  btnStop: document.getElementById("btnStop"),
  btnTail: document.getElementById("btnTail"),
  btnRaw: document.getElementById("btnRaw"),
  autoToggle: document.getElementById("autoToggle"),
  refreshInterval: document.getElementById("refreshInterval"),
};

let timer ***REMOVED*** null;
let rawVisible ***REMOVED*** false;

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineMarkdown(text) {
  let html ***REMOVED*** escapeHtml(text);
  html ***REMOVED*** html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href***REMOVED***"$2" target***REMOVED***"_blank" rel***REMOVED***"noopener noreferrer">$1</a>');
  html ***REMOVED*** html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html ***REMOVED*** html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html ***REMOVED*** html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return html;
}

function renderMarkdown(md) {
  const lines ***REMOVED*** String(md || "").replace(/\r\n?/g, "\n").split("\n");
  const out ***REMOVED*** [];
  let inList ***REMOVED*** false;
  let inCode ***REMOVED*** false;
  let inParagraph ***REMOVED*** false;

  const closeParagraph ***REMOVED*** () ***REMOVED***> {
    if (inParagraph) {
      out.push("</p>");
      inParagraph ***REMOVED*** false;
    }
  };
  const closeList ***REMOVED*** () ***REMOVED***> {
    if (inList) {
      out.push("</ul>");
      inList ***REMOVED*** false;
    }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      closeParagraph();
      closeList();
      if (!inCode) {
        out.push("<pre><code>");
        inCode ***REMOVED*** true;
      } else {
        out.push("</code></pre>");
        inCode ***REMOVED*** false;
      }
      continue;
    }

    if (inCode) {
      out.push(`${escapeHtml(line)}\n`);
      continue;
    }

    if (!line.trim()) {
      closeParagraph();
      closeList();
      continue;
    }

    const h ***REMOVED*** line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeParagraph();
      closeList();
      const level ***REMOVED*** h[1].length;
      out.push(`<h${level}>${renderInlineMarkdown(h[2].trim())}</h${level}>`);
      continue;
    }

    const li ***REMOVED*** line.match(/^\s*[-*]\s+(.*)$/);
    if (li) {
      closeParagraph();
      if (!inList) {
        out.push("<ul>");
        inList ***REMOVED*** true;
      }
      out.push(`<li>${renderInlineMarkdown(li[1].trim())}</li>`);
      continue;
    }

    closeList();
    if (!inParagraph) {
      out.push("<p>");
      inParagraph ***REMOVED*** true;
    } else {
      out.push("<br />");
    }
    out.push(renderInlineMarkdown(line.trim()));
  }

  closeParagraph();
  closeList();
  if (inCode) {
    out.push("</code></pre>");
  }

  return out.join("");
}

function classForState(kind, state) {
  if (kind ***REMOVED******REMOVED******REMOVED*** "daemon") {
    if (state ***REMOVED******REMOVED******REMOVED*** "active") return "good";
    if (state ***REMOVED******REMOVED******REMOVED*** "inactive" || state ***REMOVED******REMOVED******REMOVED*** "not_installed") return "warn";
    return "bad";
  }
  if (kind ***REMOVED******REMOVED******REMOVED*** "loop") {
    if (state ***REMOVED******REMOVED******REMOVED*** "running") return "good";
    if (state ***REMOVED******REMOVED******REMOVED*** "stopped") return "warn";
    return "bad";
  }
  if (kind ***REMOVED******REMOVED******REMOVED*** "guardian") {
    if (state ***REMOVED******REMOVED******REMOVED*** "running") return "good";
    if (state ***REMOVED******REMOVED******REMOVED*** "stopped") return "warn";
    return "bad";
  }
  if (kind ***REMOVED******REMOVED******REMOVED*** "autostart") {
    if (state ***REMOVED******REMOVED******REMOVED*** "configured") return "good";
    if (state ***REMOVED******REMOVED******REMOVED*** "not_configured") return "warn";
    return "bad";
  }
  return "warn";
}

function applyCardState(card, kind, state) {
  card.classList.remove("good", "warn", "bad");
  card.classList.add(classForState(kind, state));
}

function formatTime(isoText) {
  try {
    return new Date(isoText).toLocaleString();
  } catch {
    return isoText;
  }
}

function renderStateList(parsed, stateFile) {
  const rows ***REMOVED*** [
    ["Engine", parsed.loop.engine || "-"],
    ["Model", parsed.loop.model || "-"],
    ["Loop Count", parsed.loop.loopCount || stateFile.LOOP_COUNT || "-"],
    ["Error Count", parsed.loop.errorCount || stateFile.ERROR_COUNT || "-"],
    ["Last Run", parsed.loop.lastRun || stateFile.LAST_RUN || "-"],
    ["Loop Daemon Summary", parsed.loop.daemonSummary || "-"],
    ["Daemon ActiveState", parsed.daemon.activeState || "-"],
    ["Daemon SubState", parsed.daemon.subState || "-"],
  ];

  els.stateList.innerHTML ***REMOVED*** rows
    .map(([k, v]) ***REMOVED***> `<div><dt>${k}</dt><dd>${String(v)}</dd></div>`)
    .join("");
}

async function fetchStatus() {
  const started ***REMOVED*** performance.now();
  const res ***REMOVED*** await fetch("/api/status", { cache: "no-store" });
  const data ***REMOVED*** await res.json();
  const elapsed ***REMOVED*** Math.round(performance.now() - started);

  const parsed ***REMOVED*** data.parsed || {};
  const guardian ***REMOVED*** parsed.guardian || {};
  const daemon ***REMOVED*** parsed.daemon || {};
  const loop ***REMOVED*** parsed.loop || {};
  const autostart ***REMOVED*** parsed.autostart || {};

  els.guardianState.textContent ***REMOVED*** (guardian.state || "unknown").toUpperCase();
  els.guardianMeta.textContent ***REMOVED*** guardian.pid ? `PID ${guardian.pid}` : "PID --";
  applyCardState(els.cardGuardian, "guardian", guardian.state);

  els.daemonState.textContent ***REMOVED*** (daemon.state || "unknown").toUpperCase();
  els.daemonMeta.textContent ***REMOVED*** daemon.mainPid ? `MainPID ${daemon.mainPid}` : "MainPID --";
  applyCardState(els.cardDaemon, "daemon", daemon.state);

  els.loopState.textContent ***REMOVED*** (loop.state || "unknown").toUpperCase();
  const loopCycle ***REMOVED*** loop.loopCount ? `Cycle ${loop.loopCount}` : "Cycle --";
  const loopPid ***REMOVED*** loop.pid ? `PID ${loop.pid}` : "PID --";
  els.loopMeta.textContent ***REMOVED*** `${loopCycle} | ${loopPid}`;
  applyCardState(els.cardLoop, "loop", loop.state);

  els.autostartState.textContent ***REMOVED*** (autostart.state || "unknown").toUpperCase();
  els.autostartMeta.textContent ***REMOVED*** autostart.raw || "Task Scheduler";
  applyCardState(els.cardAutostart, "autostart", autostart.state);

  renderStateList(parsed, data.stateFile || {});

  const consensusRaw ***REMOVED*** (data.consensusHead || parsed.consensusPreview || "(no consensus)").trim();
  els.consensusText.innerHTML ***REMOVED*** renderMarkdown(consensusRaw);
  els.logText.textContent ***REMOVED*** (data.logTail || parsed.recentLog || "(no logs yet)").trim();
  els.rawText.textContent ***REMOVED*** data.raw || "";

  const healthy ***REMOVED*** data.ok && loop.state ***REMOVED******REMOVED******REMOVED*** "running" && daemon.state ***REMOVED******REMOVED******REMOVED*** "active";
  els.pulseText.textContent ***REMOVED*** healthy ? "Live Link: STABLE" : "Live Link: ATTENTION";
  els.pulseDot.style.background ***REMOVED*** healthy ? "var(--good)" : "var(--warn)";

  els.lastUpdate.textContent ***REMOVED*** `Last update: ${formatTime(data.timestamp)}`;
  els.latency.textContent ***REMOVED*** `Roundtrip: ${elapsed}ms`;
}

async function runAction(action) {
  const btn ***REMOVED*** action ***REMOVED******REMOVED******REMOVED*** "start" ? els.btnStart : els.btnStop;
  const label ***REMOVED*** btn.textContent;
  btn.disabled ***REMOVED*** true;
  btn.textContent ***REMOVED*** `${label}...`;
  try {
    const res ***REMOVED*** await fetch(`/api/action/${action}`, { method: "POST" });
    const data ***REMOVED*** await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.output || `Action ${action} failed`);
    }
    await fetchStatus();
  } catch (err) {
    const msg ***REMOVED*** err instanceof Error ? err.message : String(err);
    alert(msg);
  } finally {
    btn.disabled ***REMOVED*** false;
    btn.textContent ***REMOVED*** label;
  }
}

function resetAutoTimer() {
  if (timer) {
    clearInterval(timer);
    timer ***REMOVED*** null;
  }
  if (els.autoToggle.checked) {
    timer ***REMOVED*** setInterval(() ***REMOVED***> {
      fetchStatus().catch(() ***REMOVED***> {});
    }, Number(els.refreshInterval.value));
  }
}

els.btnRefresh.addEventListener("click", () ***REMOVED***> fetchStatus().catch(() ***REMOVED***> {}));
els.btnStart.addEventListener("click", () ***REMOVED***> runAction("start"));
els.btnStop.addEventListener("click", () ***REMOVED***> runAction("stop"));
els.btnTail.addEventListener("click", () ***REMOVED***> fetchStatus().catch(() ***REMOVED***> {}));
els.btnRaw.addEventListener("click", () ***REMOVED***> {
  rawVisible ***REMOVED*** !rawVisible;
  els.rawText.classList.toggle("hidden", !rawVisible);
});
els.autoToggle.addEventListener("change", resetAutoTimer);
els.refreshInterval.addEventListener("change", resetAutoTimer);

fetchStatus().catch((err) ***REMOVED***> {
  const msg ***REMOVED*** err instanceof Error ? err.message : String(err);
  els.rawText.textContent ***REMOVED*** msg;
});
resetAutoTimer();
