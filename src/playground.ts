/** Single-file playground UI served at "/". No framework, no build step.
 *  NOTE: content must not contain backticks or ${ — it lives in a TS template literal. */
export const PLAYGROUND_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0b0e14">
<meta name="description" content="Imgora Studio — transform images live: resize, crop, compress and convert to WebP/AVIF with instant cache feedback.">
<meta name="robots" content="noindex, follow">
<link rel="manifest" href="/manifest.webmanifest">
<title>Imgora · Image Studio</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="64x64" href="/favicon.png">
<link rel="apple-touch-icon" href="/favicon.png">
<style>
  :root {
    --bg: #0b0e14; --panel: #11151f; --panel2: #161b28; --border: #232a3a;
    --text: #e6e9f0; --muted: #8b93a7; --accent: #6366f1; --accent2: #a855f7;
    --green: #34d399; --amber: #fbbf24; --red: #f87171;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text);
    font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  header { display: flex; align-items: center; gap: 12px; padding: 14px 22px;
    border-bottom: 1px solid var(--border); background: var(--panel); }
  .logo { width: 30px; height: 30px; flex: none; display: block; transition: .15s; }
  .logo:hover { transform: scale(1.06); }
  .logo svg { width: 100%; height: 100%; display: block; border-radius: 8px; }
  header h1 { font-size: 17px; margin: 0; font-weight: 650; letter-spacing: .2px; }
  header .tag { color: var(--muted); font-size: 12.5px; }
  header .rt { font-size: 12px; color: var(--muted);
    border: 1px solid var(--border); padding: 4px 10px; border-radius: 99px; }
  header .rt:first-of-type { margin-left: auto; }
  header .rt.zero { color: var(--red); border-color: rgba(248, 113, 113, .45); }
  #quotaBanner { display: none; margin-top: 10px; padding: 12px 16px; border-radius: 10px;
    background: rgba(248, 113, 113, .08); border: 1px solid rgba(248, 113, 113, .4);
    color: var(--red); font-size: 13.5px; }
  .linkbtn { background: none; border: none; color: var(--muted); font-size: 11.5px;
    padding: 2px 6px; cursor: pointer; text-transform: lowercase; }
  .linkbtn:hover { color: var(--red); }
  .hist { display: flex; align-items: center; gap: 9px; padding: 6px; border: 1px solid var(--border);
    border-radius: 9px; margin-bottom: 6px; cursor: pointer; transition: .15s; }
  .hist:hover { border-color: var(--accent); }
  .hist img { width: 52px; height: 38px; object-fit: cover; border-radius: 6px; flex: none;
    background: #0d1019; }
  .hist .hinfo { min-width: 0; flex: 1; }
  .hist .hp { font: 11px ui-monospace, monospace; color: #9fb0d0; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; }
  .hist .ht { font-size: 10.5px; color: var(--muted); }
  .hist .hdel { border: none; background: none; color: var(--muted); font-size: 14px;
    padding: 2px 6px; cursor: pointer; flex: none; }
  .hist .hdel:hover { color: var(--red); }
  main { display: grid; grid-template-columns: 290px 1fr 330px; gap: 14px;
    padding: 14px; max-width: 1500px; margin: 0 auto; }
  @media (max-width: 1100px) { main { grid-template-columns: 1fr; } .col.side { position: static; max-height: none; } }
  .col { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  /* side panels scroll independently; center column uses page scroll */
  .col.side { position: sticky; top: 76px; max-height: calc(100vh - 90px);
    overflow-y: auto; overscroll-behavior: contain; padding-right: 2px; }
  .col.side::-webkit-scrollbar { width: 8px; }
  .col.side::-webkit-scrollbar-thumb { background: #232a3a; border-radius: 4px; }
  .col.side::-webkit-scrollbar-thumb:hover { background: #2e3850; }
  .col.side::-webkit-scrollbar-track { background: transparent; }
  .card { background: var(--panel); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px; }
  .card h3 { margin: 0 0 10px; font-size: 11.5px; text-transform: uppercase;
    letter-spacing: .12em; color: var(--muted); font-weight: 600; }
  .card h3.mt { margin-top: 14px; }

  /* dropzone */
  #drop { border: 1.5px dashed #2e3850; border-radius: 12px; padding: 26px 12px;
    text-align: center; cursor: pointer; color: var(--muted); transition: .15s; }
  #drop:hover, #drop.over { border-color: var(--accent); color: var(--text);
    background: rgba(99, 102, 241, .06); }
  #drop .big { font-size: 26px; }
  #sampleBtn { margin-top: 10px; width: 100%; }

  button { background: var(--panel2); color: var(--text); border: 1px solid var(--border);
    border-radius: 8px; padding: 7px 12px; font: inherit; cursor: pointer; transition: .15s; }
  button:hover { border-color: var(--accent); }
  button.primary { background: linear-gradient(135deg, var(--accent), var(--accent2));
    border: none; font-weight: 600; }
  button:disabled { opacity: .5; cursor: default; }

  /* gallery */
  #gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 52vh; overflow: auto; }
  .thumb { position: relative; border: 1px solid var(--border); border-radius: 9px;
    overflow: hidden; cursor: pointer; background: #0d1019; }
  .thumb img { width: 100%; height: 82px; object-fit: cover; display: block; }
  .thumb .cap { font-size: 10.5px; color: var(--muted); padding: 4px 7px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .thumb.sel { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
  .thumb .del { position: absolute; top: 4px; right: 4px; padding: 0 6px;
    font-size: 13px; line-height: 20px; border-radius: 6px; background: rgba(0,0,0,.65);
    display: none; }
  .thumb:hover .del { display: block; }

  /* stage */
  #stage { position: relative; min-height: 340px; display: flex; align-items: center; justify-content: center;
    background: repeating-conic-gradient(#10141d 0% 25%, #0d1019 0% 50%) 0 0 / 24px 24px;
    border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  #preview { max-width: 100%; max-height: 56vh; display: none; border-radius: 4px; transition: opacity .2s; }
  #stage.loading #preview { opacity: .5; }
  #empty { color: var(--muted); padding: 60px 20px; text-align: center; }
  /* transform loading buffer */
  #loadBar { position: absolute; top: 0; left: 0; right: 0; height: 3px; opacity: 0;
    overflow: hidden; transition: opacity .2s; }
  #loadBar::before { content: ""; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent);
    transform: translateX(-100%); animation: loadslide 1.1s linear infinite; }
  @keyframes loadslide { to { transform: translateX(100%); } }
  #stage.loading #loadBar { opacity: 1; }
  #loadPill { position: absolute; top: 12px; right: 12px; display: flex; align-items: center; gap: 7px;
    background: rgba(13, 16, 25, .88); border: 1px solid var(--border); border-radius: 99px;
    padding: 5px 13px; font-size: 12px; color: var(--muted);
    opacity: 0; pointer-events: none; transition: opacity .18s, background .18s, color .18s, border-color .18s; }
  #stage.loading #loadPill { opacity: 1; }
  #loadPill .spin { width: 12px; height: 12px; border-radius: 50%;
    border: 2px solid #313b55; border-top-color: var(--accent);
    animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  #loadPill .tick { display: none; font-weight: 700; }
  #loadPill .l2 { display: none; }
  #stage.done #loadPill { opacity: 1; background: rgba(52, 211, 153, .13);
    border-color: rgba(52, 211, 153, .5); color: var(--green); }
  #stage.done #loadPill .spin { display: none; }
  #stage.done #loadPill .tick { display: inline; }
  #stage.done #loadPill .l2 { display: inline; }
  #stage.done #loadPill .l1 { display: none; }

  /* interactive crop mode */
  #cropLayer { position: absolute; inset: 0; z-index: 6; display: none;
    align-items: center; justify-content: center; background: #0d1019; }
  #cropLayer.on { display: flex; }
  #cropWrap { position: relative; display: inline-block; line-height: 0; }
  #cropWrap img { display: block; max-width: 100%; max-height: 54vh;
    user-select: none; -webkit-user-drag: none; }
  #cropSel { position: absolute; border: 1.5px solid #fff; cursor: move;
    box-shadow: 0 0 0 9999px rgba(11, 14, 20, .6); }
  #cropSel .gx { position: absolute; background: rgba(255, 255, 255, .28); }
  #cropSel .gx1 { left: 33.3%; top: 0; bottom: 0; width: 1px; }
  #cropSel .gx2 { left: 66.6%; top: 0; bottom: 0; width: 1px; }
  #cropSel .gx3 { top: 33.3%; left: 0; right: 0; height: 1px; }
  #cropSel .gx4 { top: 66.6%; left: 0; right: 0; height: 1px; }
  .ch { position: absolute; width: 12px; height: 12px; background: #fff;
    border: 1px solid var(--accent); border-radius: 3px; z-index: 2; }
  .ch-nw { left: -7px; top: -7px; cursor: nwse-resize; }
  .ch-n  { left: calc(50% - 6px); top: -7px; cursor: ns-resize; }
  .ch-ne { right: -7px; top: -7px; cursor: nesw-resize; }
  .ch-e  { right: -7px; top: calc(50% - 6px); cursor: ew-resize; }
  .ch-se { right: -7px; bottom: -7px; cursor: nwse-resize; }
  .ch-s  { left: calc(50% - 6px); bottom: -7px; cursor: ns-resize; }
  .ch-sw { left: -7px; bottom: -7px; cursor: nesw-resize; }
  .ch-w  { left: -7px; top: calc(50% - 6px); cursor: ew-resize; }
  #cropDims { position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
    background: rgba(13, 16, 25, .9); border: 1px solid var(--border); border-radius: 99px;
    padding: 4px 12px; font-size: 11.5px; font-variant-numeric: tabular-nums; color: var(--text);
    z-index: 8; }
  /* crop action bar — OUTSIDE the stage, icon-only buttons with tooltips */
  #cropBar { display: none; align-items: center; justify-content: center; gap: 10px;
    margin-top: 10px; position: relative; z-index: 60; }
  #cropBar.on { display: flex; }
  #cropBar .hint { color: var(--muted); font-size: 11.5px; margin-left: 4px; }
  .ibtn { position: relative; width: 40px; height: 40px; border-radius: 50%;
    font-size: 16px; line-height: 1; font-weight: 700; padding: 0;
    display: inline-flex; align-items: center; justify-content: center; z-index: 70; }
  .ibtn.ok { color: var(--green); border-color: rgba(52, 211, 153, .5);
    background: rgba(52, 211, 153, .09); }
  .ibtn.ok:hover { background: rgba(52, 211, 153, .2); border-color: var(--green); }
  .ibtn.warn { color: var(--amber); border-color: rgba(251, 191, 36, .5);
    background: rgba(251, 191, 36, .09); }
  .ibtn.warn:hover { background: rgba(251, 191, 36, .2); border-color: var(--amber); }
  .ibtn.off { color: var(--muted); }
  .ibtn.off:hover { color: var(--red); border-color: rgba(248, 113, 113, .5); }
  .ibtn::after { content: attr(data-tip); position: absolute; bottom: calc(100% + 9px);
    left: 50%; transform: translateX(-50%) translateY(3px); background: #0d1019;
    border: 1px solid var(--border); color: var(--text); font-size: 11px; font-weight: 400;
    border-radius: 7px; padding: 4px 10px; white-space: nowrap; opacity: 0;
    pointer-events: none; transition: .14s ease; z-index: 200; }
  .ibtn::before { content: ""; position: absolute; bottom: calc(100% + 3px); left: 50%;
    transform: translateX(-50%) rotate(45deg); width: 7px; height: 7px; background: #0d1019;
    border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);
    opacity: 0; transition: .14s ease; z-index: 200; }
  .ibtn:hover::after { opacity: 1; transform: translateX(-50%) translateY(0); }
  .ibtn:hover::before { opacity: 1; }
  .cropbtn { width: 100%; margin: 8px 0 4px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center; }
  .chip { font-size: 12px; padding: 3px 10px; border-radius: 99px;
    border: 1px solid var(--border); color: var(--muted); }
  .chip.hit { color: var(--green); border-color: rgba(52, 211, 153, .4); }
  .chip.miss { color: var(--amber); border-color: rgba(251, 191, 36, .4); }
  .chip.err { color: var(--red); border-color: rgba(248, 113, 113, .4); }
  .chip.save { color: var(--green); }
  .urlbar { display: flex; gap: 8px; margin-top: 10px; }
  .urlbar input { flex: 1; background: #0d1019; border: 1px solid var(--border);
    color: var(--muted); border-radius: 8px; padding: 8px 12px; font: 12px ui-monospace, monospace; min-width: 0; }
  .urlbar a { display: flex; align-items: center; text-decoration: none; color: var(--muted);
    border: 1px solid var(--border); border-radius: 8px; padding: 0 12px; font-size: 12.5px; }
  .urlbar a:hover { color: var(--text); border-color: var(--accent); }

  /* controls */
  .row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
  .row label { font-size: 12.5px; color: var(--muted); width: 78px; flex: none; }
  .row input[type=number], .row input[type=text], .row select {
    background: #0d1019; border: 1px solid var(--border); color: var(--text);
    border-radius: 7px; padding: 6px 8px; font: inherit; width: 100%; min-width: 0; }
  .row input[type=color] { width: 40px; height: 30px; padding: 2px; background: #0d1019;
    border: 1px solid var(--border); border-radius: 7px; }
  .row input[type=range] { flex: 1; accent-color: var(--accent); min-width: 0; }
  .row input[type=range]:disabled { opacity: .35; }
  .row .val { width: 42px; text-align: right; font-size: 12px; color: var(--muted);
    font-variant-numeric: tabular-nums; flex: none; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .checks { display: flex; flex-wrap: wrap; gap: 7px 8px; }
  /* W/H lock button */
  #lockBtn { flex: none; padding: 6px 9px; font-size: 13px; line-height: 1; }
  #lockBtn.on { border-color: var(--accent); color: var(--accent);
    background: rgba(99, 102, 241, .08); }
  /* quick size chips */
  .qrow { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; }
  .qrow .qlab { font-size: 12.5px; color: var(--muted); width: 78px; flex: none; }
  .qchip { font-size: 11.5px; padding: 4px 10px; border-radius: 99px; }
  /* recommended marker */
  .rec { display: inline-flex; align-items: center; font-size: 9.5px; letter-spacing: .04em;
    color: var(--green); border: 1px solid rgba(52, 211, 153, .35);
    border-radius: 99px; padding: 0 6px; margin-left: 6px; text-transform: uppercase; }
  /* output mode */
  .outmode { display: flex; gap: 3px; background: #0d1019; border: 1px solid var(--border);
    border-radius: 8px; padding: 3px; margin-bottom: 10px; }
  .outmode button { flex: 1; background: transparent; border: none; border-radius: 6px;
    padding: 6px 2px; font-size: 12.5px; color: var(--muted); }
  .outmode button.on { background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #fff; font-weight: 600; }
  #outCard[data-mode="preset"] #customBox { display: none; }
  #outCard[data-mode="custom"] #presetBox { display: none; }
  #outCard[data-mode="custom"] #presetHint { display: none; }
  /* collapsible effects */
  details.effectsc { border-top: 1px dashed var(--border); margin-top: 2px; padding-top: 10px; }
  details.effectsc summary { cursor: pointer; color: var(--muted); font-size: 12.5px;
    list-style: none; user-select: none; }
  details.effectsc summary::-webkit-details-marker { display: none; }
  details.effectsc summary::before { content: "▸ "; color: var(--accent); }
  details.effectsc[open] summary::before { content: "▾ "; }

  /* modern pill switch (label.switch wrapping a hidden checkbox) */
  label.switch { position: relative; display: inline-block; width: 38px; height: 21px;
    flex: none; cursor: pointer; }
  label.switch input { position: absolute; opacity: 0; width: 0; height: 0; }
  label.switch .track { position: absolute; inset: 0; background: #20283a;
    border: 1px solid #2e3850; border-radius: 99px; transition: .18s ease; }
  label.switch .track::before { content: ""; position: absolute; width: 13px; height: 13px;
    left: 3px; top: 3px; border-radius: 50%; background: #97a0b5;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .45); transition: .18s ease; }
  label.switch input:checked + .track { background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-color: transparent; }
  label.switch input:checked + .track::before { transform: translateX(17px); background: #fff; }
  label.switch input:checked + .track::after { content: ""; position: absolute; right: 7px; top: 4.5px;
    width: 4px; height: 8px; border: solid #fff; border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg); opacity: 0; animation: switchcheck .18s ease .06s forwards; }
  @keyframes switchcheck { to { opacity: 1; } }
  label.switch input:focus-visible + .track { outline: 2px solid var(--accent); outline-offset: 2px; }

  /* toggle chip pills (effects cluster) */
  label.tchip { cursor: pointer; position: relative; display: inline-flex; }
  label.tchip input { position: absolute; opacity: 0; pointer-events: none; }
  label.tchip span { display: inline-flex; align-items: center; padding: 5px 13px;
    border-radius: 99px; border: 1px solid var(--border); background: var(--panel2);
    color: var(--muted); font-size: 12.5px; transition: .15s ease; user-select: none; }
  label.tchip:hover span { border-color: var(--accent); color: var(--text); }
  label.tchip input:checked + span { background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-color: transparent; color: #fff; font-weight: 600;
    box-shadow: 0 2px 10px rgba(99, 102, 241, .35); }
  label.tchip input:focus-visible + span { outline: 2px solid var(--accent); outline-offset: 2px; }

  .hint { font-size: 11.5px; color: var(--muted); margin: -2px 0 8px 86px; }
  .presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .presets button { font-size: 12px; padding: 5px 10px; border-radius: 99px; }

  /* panel header with reset */
  .panelhead { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .panelhead .ph-info { min-width: 0; }
  .panelhead .sub { font-size: 12px; color: var(--muted); margin-top: 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  button.danger { border-color: rgba(248, 113, 113, .35); color: var(--red);
    background: rgba(248, 113, 113, .07); flex: none; }
  button.danger:hover { background: rgba(248, 113, 113, .16); border-color: var(--red); }

  /* W × H dimension row — full-width inputs with a swap button */
  .dimrow { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; }
  .dimlab { font-size: 12px; color: var(--muted); width: 14px; flex: none; text-align: center; }
  .dimrow input[type=number] { flex: 1; min-width: 0; background: #0d1019;
    border: 1px solid var(--border); color: var(--text); border-radius: 7px;
    padding: 7px 9px; font: inherit; }
  .dimrow input[type=number]:focus { outline: none; border-color: var(--accent); }
  .dimrow button { flex: none; padding: 6px 9px; font-size: 14px; }

  /* segmented controls (format, rotate) */
  .seg { display: flex; gap: 3px; background: #0d1019; border: 1px solid var(--border);
    border-radius: 8px; padding: 3px; margin-bottom: 8px; }
  .seg button { flex: 1; background: transparent; border: none; border-radius: 6px;
    padding: 6px 2px; font-size: 12.5px; color: var(--muted); }
  .seg button:hover { color: var(--text); }
  .seg button.on { background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #fff; font-weight: 600; }

  /* sub-grouping */
  .subhead { font-size: 11px; text-transform: uppercase; letter-spacing: .1em;
    color: var(--muted); margin: 12px 0 7px; }
  .subhead.mt { margin-top: 14px; }
  .subhint { text-transform: none; letter-spacing: 0; color: #566080; }
  .cropbox { border-top: 1px dashed var(--border); margin-top: 4px; padding-top: 2px; }
  .grid2.slim .row label { width: 16px; text-align: center; }
  .checks.mt { margin-top: 12px; }
  details { margin-top: 10px; color: var(--muted); font-size: 12.5px; }
  details pre { background: #0d1019; border: 1px solid var(--border); border-radius: 8px;
    padding: 10px; overflow: auto; font-size: 11.5px; color: #9fb0d0; }
  footer { text-align: center; color: var(--muted); font-size: 12px; padding: 8px 0 22px; }
  footer code { color: #9fb0d0; }
</style>
</head>
<body>
<header>
  <a class="logo" href="/" title="imgora — home"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#lg)"/><rect x="26.5" y="10.5" width="11" height="11" rx="2.5" transform="rotate(45 32 16)" fill="#fff"/><rect x="27" y="25" width="10" height="25" rx="5" fill="#fff"/><rect x="43" y="43" width="8" height="8" rx="2" transform="rotate(45 47 47)" fill="#fff" opacity=".5"/></svg></a>
  <div>
    <h1>Studio</h1>
    <div class="tag">on-the-fly image transforms &middot; URL-query driven &middot; instantly cached</div>
  </div>
  <div class="rt" id="quotaChip">…</div>
  <div class="rt" id="rtChip">…</div>
</header>

<main>
  <!-- left: upload + library + history -->
  <div class="col side">
    <div class="card">
      <h3>Upload</h3>
      <div id="drop">
        <div class="big">⬆</div>
        Drop an image here<br>or click to browse
        <input id="file" type="file" accept="image/*" multiple hidden>
      </div>
      <div class="hint" style="margin-left:0">JPEG · PNG · WebP · GIF · AVIF · TIFF — max 10 MB</div>
    </div>
    <div class="card">
      <h3>Library</h3>
      <div id="gallery"></div>
    </div>
    <div class="card">
      <h3>My transforms <button id="clearHist" class="linkbtn" title="delete all saved history">clear all</button></h3>
      <div id="history"></div>
    </div>
  </div>

  <!-- center: preview -->
  <div class="col">
    <div id="stage">
      <img id="preview" alt="transformed preview">
      <div id="empty">Upload an image or pick one from the library →</div>
      <div id="loadBar"></div>
      <div id="loadPill"><span class="spin"></span><span class="tick">✓</span><span class="l1">Transforming…</span><span class="l2">Done</span></div>
      <div id="cropLayer">
        <div id="cropWrap">
          <img id="cropImg" alt="crop base" draggable="false">
          <div id="cropSel" data-m="move">
            <span class="gx gx1"></span><span class="gx gx2"></span><span class="gx gx3"></span><span class="gx gx4"></span>
            <div class="ch ch-nw" data-m="nw"></div><div class="ch ch-n" data-m="n"></div>
            <div class="ch ch-ne" data-m="ne"></div><div class="ch ch-e" data-m="e"></div>
            <div class="ch ch-se" data-m="se"></div><div class="ch ch-s" data-m="s"></div>
            <div class="ch ch-sw" data-m="sw"></div><div class="ch ch-w" data-m="w"></div>
          </div>
        </div>
        <div id="cropDims">—</div>
      </div>
    </div>
    <div id="cropBar">
      <button id="cropApply" class="ibtn ok" data-tip="Apply crop (Enter)" aria-label="Apply crop">✓</button>
      <button id="cropClear" class="ibtn warn" data-tip="Clear crop" aria-label="Clear crop">⌫</button>
      <button id="cropCancel" class="ibtn off" data-tip="Cancel (Esc)" aria-label="Cancel crop">✕</button>
      <span class="hint">Esc cancels · Enter applies</span>
    </div>
    <div class="chips">
      <span class="chip" id="chipDims">—</span>
      <span class="chip" id="chipSize">—</span>
      <span class="chip" id="chipTime">—</span>
      <span class="chip" id="chipCache">—</span>
    </div>
    <div id="quotaBanner"></div>
    <div class="urlbar">
      <input id="url" readonly placeholder="transform URL appears here">
      <button id="copyBtn">Copy</button>
      <button id="dlBtn" title="download the current transform">Download</button>
      <a id="openLink" href="#" target="_blank" rel="noopener">Open ↗</a>
    </div>
    <div class="card">
      <details>
        <summary>API cheat sheet</summary>
        <pre>POST /upload        multipart field "file" (or {"url": "https://..."})
GET  /t/:id?params  transform — e.g. /t/ID?w=640&fit=cover&q=75&f=webp
GET  /raw/:id       original bytes
GET  /images        list · DELETE /images/:id

curl -F "file=@pic.jpg" localhost:3000/upload
curl -o out.webp "localhost:3000/t/ID?w=640&fit=cover&q=75&f=webp"</pre>
      </details>
    </div>
  </div>

  <!-- right: controls -->
  <div class="col side">
    <div class="card panelhead">
      <div class="ph-info">
        <h3 style="margin:0">Properties</h3>
        <div class="sub" id="imgInfo">no image selected</div>
      </div>
      <button id="resetBtn" class="danger" title="Reset all transforms">↺ Reset</button>
    </div>

    <div class="card">
      <h3>Transform</h3>
      <div class="dimrow">
        <span class="dimlab">W</span><input type="number" id="w" min="1" max="8192" placeholder="auto">
        <button id="lockBtn" class="on" title="Locked: height follows width at the chosen aspect ratio. Click to set them separately.">🔒</button>
        <span class="dimlab">H</span><input type="number" id="h" min="1" max="8192" placeholder="auto">
      </div>
      <div class="row"><label>Aspect</label>
        <select id="ar">
          <option value="1:1" selected>1:1 — square</option>
          <option value="4:3">4:3 — classic</option>
          <option value="3:2">3:2 — photo</option>
          <option value="16:9">16:9 — widescreen</option>
          <option value="9:16">9:16 — story</option>
          <option value="3:4">3:4 — portrait</option>
          <option value="2:3">2:3 — poster</option>
          <option value="orig">original</option>
        </select>
      </div>
      <div class="qrow"><span class="qlab">Quick size</span>
        <button class="qchip" data-s="256">256</button>
        <button class="qchip" data-s="512">512</button>
        <button class="qchip" data-s="1024">1024</button>
        <button class="qchip" data-s="2048">2048</button>
      </div>
      <div class="row"><label>Fit</label><span class="rec">rec</span>
        <select id="fit">
          <option value="cover">cover (crop)</option>
          <option value="contain">contain (letterbox)</option>
          <option value="fill">fill (stretch)</option>
          <option value="inside">inside (no crop)</option>
          <option value="outside">outside (crop)</option>
        </select>
      </div>
      <div class="cropbox">
        <div class="subhead">Crop region <span class="subhint">— before resize</span></div>
        <button id="cropBtn" class="cropbtn">✂ Select crop area</button>
        <div class="grid2 slim">
          <div class="row"><label>X</label><input type="number" id="x" min="0" placeholder="0"></div>
          <div class="row"><label>Y</label><input type="number" id="y" min="0" placeholder="0"></div>
          <div class="row"><label>W</label><input type="number" id="cw" min="1" placeholder="full"></div>
          <div class="row"><label>H</label><input type="number" id="ch" min="1" placeholder="full"></div>
        </div>
      </div>
    </div>

    <div class="card" id="outCard" data-mode="preset">
      <h3>Presets &amp; output</h3>
      <div class="outmode">
        <button id="modePreset" class="on">Presets</button>
        <button id="modeCustom">Custom</button>
      </div>
      <div id="presetBox">
        <div class="row"><label>Preset</label>
          <select id="cqp">
            <option value="">Choose a preset…</option>
            <optgroup label="Recommended sizes">
              <option value="w=256&amp;h=256&amp;fit=cover&amp;q=80&amp;f=webp">Avatar 256² · webp q80</option>
              <option value="w=180&amp;h=100&amp;fit=cover&amp;q=60&amp;f=webp">Thumbnail 180×100 · webp</option>
              <option value="w=1200&amp;h=630&amp;fit=cover&amp;q=80&amp;f=jpeg">Social 1200×630 · jpeg</option>
              <option value="w=800&amp;q=75&amp;f=webp">Web 800w · webp q75</option>
              <option value="w=1280&amp;q=75&amp;f=webp">Web 1280w · webp q75</option>
              <option value="w=1920&amp;fit=inside&amp;q=70&amp;f=avif">Full HD 1920 · avif</option>
            </optgroup>
            <optgroup label="Compression">
              <option value="f=webp&amp;q=45">Small file · webp q45</option>
              <option value="f=webp&amp;q=30&amp;effort=6">Smallest · webp q30 effort 6</option>
              <option value="f=avif&amp;q=60">AVIF modern · avif q60</option>
              <option value="f=jpeg&amp;q=80&amp;prog=1">JPEG classic · q80 progressive</option>
              <option value="f=jpeg&amp;moz=1&amp;cs=444&amp;q=90">Print JPEG · q92 moz 4:4:4</option>
              <option value="f=png&amp;palette=1&amp;level=9">PNG flat art · palette level 9</option>
            </optgroup>
            <optgroup label="Effects">
              <option value="gray=100&amp;w=800&amp;q=80&amp;f=webp">Black &amp; white · webp</option>
              <option value="w=24&amp;blur=2&amp;f=webp">Blur placeholder (LQIP)</option>
            </optgroup>
          </select>
        </div>
        <div class="hint" id="presetHint" style="margin-left:0">One dropdown for every preset — sizes, compression and effects. Switch to Custom for full control; only one mode is active at a time.</div>
      </div>
      <div id="customBox">
        <div class="seg" id="fmtSeg">
          <button data-v="auto">auto</button>
          <button data-v="webp">webp</button>
          <button data-v="avif">avif</button>
          <button data-v="jpeg">jpeg</button>
          <button data-v="png">png</button>
        </div>
        <div class="hint" id="autoHint" style="margin-left:0">auto picks avif/webp from the browser</div>
        <div class="row" id="rowQ"><label>Quality</label><span class="rec">rec</span><input type="range" id="q" min="1" max="100" value="80"><span class="val" id="qVal">80</span></div>
        <div id="fmtAdv" style="display:none">
          <div class="subhead"><span id="advFmtName">webp</span> options</div>
        <div class="row" id="rowProg"><label>Progressive</label><label class="switch"><input type="checkbox" id="prog"><span class="track"></span></label></div>
        <div class="row" id="rowMoz"><label>MozJPEG</label><label class="switch"><input type="checkbox" id="moz"><span class="track"></span></label><span class="val" style="width:auto">tuned encoder</span></div>
          <div class="row" id="rowCs"><label>Chroma</label>
            <select id="cs">
              <option value="420">4:2:0 (smaller)</option>
              <option value="444">4:4:4 (sharper)</option>
            </select>
          </div>
          <div class="row" id="rowEffort"><label>Effort</label><input type="range" id="effort" min="0" max="9" value="4"><span class="val" id="effortVal">auto</span></div>
          <div class="row" id="rowLossless"><label>Lossless</label><label class="switch"><input type="checkbox" id="lossless"><span class="track"></span></label></div>
          <div class="row" id="rowLevel"><label>PNG level</label><input type="range" id="level" min="0" max="9" value="6"><span class="val" id="levelVal">6</span></div>
          <div class="row" id="rowPalette"><label>Palette</label><label class="switch"><input type="checkbox" id="palette"><span class="track"></span></label><span class="val" style="width:auto">8-bit colors</span></div>
          <div class="row" id="rowPqual"><label>Palette Q</label><input type="range" id="pqual" min="1" max="100" value="80"><span class="val" id="pqualVal">80</span></div>
        </div>
      </div>
      <div class="row"><label>Download</label><label class="switch"><input type="checkbox" id="download"><span class="track"></span></label><span class="val" style="width:auto">force on open</span></div>
    </div>

    <div class="card">
      <details class="effectsc">
        <summary>Effects — rotate, adjust, color (optional)</summary>
        <div class="subhead" style="margin-top:12px">Rotate</div>
        <div class="seg" id="rotSeg">
          <button data-v="0">0°</button>
          <button data-v="90">90°</button>
          <button data-v="180">180°</button>
          <button data-v="270">270°</button>
        </div>
        <div class="subhead mt">Adjust</div>
        <div class="row"><label>Brightness</label><input type="range" id="bright" min="1" max="200" value="100"><span class="val" id="brightVal">100</span></div>
        <div class="row"><label>Saturation</label><input type="range" id="sat" min="0" max="200" value="100"><span class="val" id="satVal">100</span></div>
        <div class="row"><label>Hue</label><input type="range" id="hue" min="-180" max="180" value="0"><span class="val" id="hueVal">0</span></div>
        <div class="row"><label>Blur</label><input type="range" id="blur" min="0" max="30" step="0.5" value="0"><span class="val" id="blurVal">0</span></div>
        <div class="row"><label>Grayscale</label><label class="switch"><input type="checkbox" id="gray"><span class="track"></span></label><input type="range" id="grayAmt" min="0" max="100" value="100"><span class="val" id="grayVal">100</span></div>
        <div class="row"><label>Invert</label><label class="switch"><input type="checkbox" id="neg"><span class="track"></span></label><input type="range" id="negAmt" min="0" max="100" value="100"><span class="val" id="negVal">100</span></div>
        <div class="row"><label>Sharpen</label><label class="switch"><input type="checkbox" id="sharpen"><span class="track"></span></label><input type="range" id="shAmt" min="0" max="100" value="50"><span class="val" id="shVal">50</span></div>
        <div class="checks mt">
          <label class="tchip"><input type="checkbox" id="flip"><span>flip ↕</span></label>
          <label class="tchip"><input type="checkbox" id="flop"><span>flop ↔</span></label>
        </div>
      </details>
    </div>
  </div>
</main>

<footer>Identical query params are served from cache instantly — watch the <code>x-cache</code> chip go <b style="color:var(--green)">HIT</b>. URLs are shareable &amp; immutable.</footer>

<script>
(function () {
  "use strict";
  var DEF = { w:"", h:"", fit:"cover", bg:"#000000", bgOn:false, x:"", y:"", cw:"", ch:"", f:"auto",
    q:80, prog:false, moz:false, cs:"420", effort:"", lossless:false, level:6, palette:false, pqual:80,
    rot:"0", bright:100, sat:100, hue:0, blur:0,
    gray:0, neg:0, sharpen:0, flip:false, flop:false, download:false };
  var S = Object.assign({}, DEF);
  var $ = function (id) { return document.getElementById(id); };
  var lastQuery = "__init__", lastUrl = "", blobUrl = null, originalBytes = 0, lastSize = 0;
  var fetchGen = 0, effortDirty = false, lockedWH = true, aspect = "1:1";

  fetch("/healthz").then(function (r) { return r.json(); }).then(function (h) {
    $("rtChip").textContent = h.service + " · " + h.runtime + " · " + h.storage;
  }).catch(function () {});

  function buildQuery() {
    var p = new URLSearchParams();
    if (S.w) p.set("w", S.w);
    if (S.h) p.set("h", S.h);
    if (S.fit !== "cover") p.set("fit", S.fit);
    if (S.bgOn && S.bg) p.set("bg", S.bg.slice(1));
    if (S.x) p.set("x", S.x);
    if (S.y) p.set("y", S.y);
    if (S.cw) p.set("cw", S.cw);
    if (S.ch) p.set("ch", S.ch);
    if (S.f !== "auto") p.set("f", S.f);
    if (S.q !== 80 && !S.lossless && S.f !== "png") p.set("q", S.q);
    if (S.prog) p.set("prog", "1");
    if (S.moz && S.f === "jpeg") p.set("moz", "1");
    if (S.cs !== "420" && S.f === "jpeg") p.set("cs", S.cs);
    if (S.effort !== "" && (S.f === "webp" || S.f === "avif")) p.set("effort", S.effort);
    if (S.lossless && (S.f === "webp" || S.f === "avif")) p.set("lossless", "1");
    if (S.level !== 6 && S.f === "png") p.set("level", S.level);
    if (S.palette && S.f === "png") { p.set("palette", "1"); p.set("pqual", S.pqual); }
    if (S.rot !== "0") p.set("rot", S.rot);
    if (S.bright !== 100) p.set("bright", S.bright);
    if (S.sat !== 100) p.set("sat", S.sat);
    if (S.hue !== 0) p.set("hue", S.hue);
    if (S.blur > 0) p.set("blur", S.blur);
    if (S.gray > 0) p.set("gray", S.gray);
    if (S.neg > 0) p.set("neg", S.neg);
    if (S.sharpen > 0) p.set("sharpen", S.sharpen);
    if (S.flip) p.set("flip", "1");
    if (S.flop) p.set("flop", "1");
    if (S.download) p.set("download", "1");
    return p.toString();
  }

  /* ---- effect intensity rows: switch + amount slider stay in sync ---- */
  var EFFECTS = [["gray", "grayAmt", "grayVal"], ["neg", "negAmt", "negVal"], ["sharpen", "shAmt", "shVal"]];
  EFFECTS.forEach(function (e) {
    $(e[1]).addEventListener("input", function () {
      S[e[0]] = Number(this.value);
      $(e[0]).checked = S[e[0]] > 0;
      $(e[2]).textContent = this.value;
      manualChange();
    });
    $(e[0]).addEventListener("change", function () {
      S[e[0]] = this.checked ? Number($(e[1]).value) || 100 : 0;
      $(e[1]).value = S[e[0]];
      $(e[2]).textContent = S[e[0]];
      manualChange();
    });
  });

  /* ---- aspect ratio helpers (lock links W and H at the chosen ratio) ---- */
  var RATIOS = { "1:1": [1, 1], "4:3": [4, 3], "3:2": [3, 2], "16:9": [16, 9],
    "9:16": [9, 16], "3:4": [3, 4], "2:3": [2, 3] };
  function ratioPair() {
    if (aspect === "orig") {
      var m = S.id ? metaById[S.id] : null;
      if (m && m.width && m.height) return [m.width, m.height];
    }
    return RATIOS[aspect] || [1, 1];
  }
  function hFromW(wv) {
    var r = ratioPair();
    return String(Math.max(1, Math.round((Number(wv) || 0) * r[1] / r[0])) || wv);
  }
  function wFromH(hv) {
    var r = ratioPair();
    return String(Math.max(1, Math.round((Number(hv) || 0) * r[0] / r[1])) || hv);
  }

  function fmtBytes(n) {
    if (n == null) return "—";
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
    return (n / 1048576).toFixed(2) + " MB";
  }

  /* ---- transform loading buffer (shows only when work takes > 250ms) ---- */
  var loadTimer = null, loaderShown = false;
  function loaderStart() {
    var gen = fetchGen;
    loaderShown = false;
    clearTimeout(loadTimer);
    $("stage").classList.remove("done");
    loadTimer = setTimeout(function () {
      if (gen !== fetchGen) return; // superseded before the buffer was needed
      loaderShown = true;
      $("stage").classList.add("loading");
    }, 250);
  }
  function loaderDone(ok) {
    clearTimeout(loadTimer);
    loadTimer = null;
    if (!loaderShown) return;
    loaderShown = false;
    var st = $("stage");
    st.classList.remove("loading");
    if (ok) {
      st.classList.add("done");
      setTimeout(function () { st.classList.remove("done"); }, 900);
    }
  }

  function refresh() {
    if (!S.id || cropMode) return; // transforms wait while the crop frame is open
    var q = buildQuery();
    if (q === lastQuery) return;
    lastQuery = q;
    var url = "/t/" + S.id + (q ? "?" + q : "");
    lastUrl = url;
    $("url").value = location.origin + url;
    $("openLink").href = url;
    var gen = ++fetchGen;
    loaderStart();
    var t0 = performance.now();
    fetch(url).then(function (res) {
      if (gen !== fetchGen) return null; // a newer change superseded this fetch
      updateQuota(res);
      var ms = Math.round(performance.now() - t0);
      var cache = (res.headers.get("x-cache") || "?").toUpperCase();
      if (res.status === 304) { hideBanner(); loaderDone(true); setChips(cache, ms, null, null, false); return null; }
      if (res.status === 429) {
        loaderDone(false);
        res.json().then(function (j) { showBanner((j && j.error) || "Daily transformation limit reached."); })
          .catch(function () { showBanner("Daily transformation limit reached."); });
        setChips("limit", 0, null, null, true);
        return null;
      }
      if (!res.ok) {
        // surface the server's reason (e.g. transform failures) instead of a generic chip
        loaderDone(false);
        return res.json().catch(function () { return { error: "HTTP " + res.status }; }).then(function (j) {
          if (gen === fetchGen) {
            setChips("error", 0, null, null, true);
            showBanner((j && j.error) || "HTTP " + res.status);
          }
        });
      }
      hideBanner();
      return res.blob().then(function (b) {
        if (gen !== fetchGen) return null;
        loaderDone(true);
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        blobUrl = URL.createObjectURL(b);
        var img = $("preview");
        img.style.display = "block";
        $("empty").style.display = "none";
        img.src = blobUrl;
        lastSize = b.size;
        setChips(cache, ms, b.size, null, false);
        if (q) {
          saveTransform({
            key: clientKey + "|" + url,
            client: clientKey,
            id: S.id,
            path: url,
            params: q,
            bytes: b.size,
            dims: res.headers.get("x-image-dimensions") || "",
            at: Date.now()
          });
        }
      });
    }).catch(function () {
      if (gen === fetchGen) loaderDone(false);
      if (gen === fetchGen) setChips("error", 0, null, null, true);
    });
  }

  function setChips(cache, ms, size, dims, failed) {
    var cc = $("chipCache");
    if (failed) {
      cc.textContent = "x-cache: request failed";
      cc.className = "chip err";
    } else {
      cc.textContent = "x-cache: " + cache;
      cc.className = "chip " + (cache.indexOf("HIT") === 0 || cache === "RAW" ? "hit" : "miss");
    }
    $("chipTime").textContent = ms + " ms" + (cache === "MISS" ? " (first)" : "");
    if (size != null) {
      var saved = originalBytes ? Math.max(0, Math.round((1 - size / originalBytes) * 100)) : 0;
      $("chipSize").textContent = fmtBytes(size) + (saved > 0 ? " · " + saved + "% smaller" : "");
      $("chipSize").className = "chip save";
    }
    if (dims) $("chipDims").textContent = dims;
  }

  $("preview").addEventListener("load", function () {
    if (this.naturalWidth) $("chipDims").textContent = this.naturalWidth + " × " + this.naturalHeight;
  });

  /* ---- interactive crop: drag/resize a frame over the original image ---- */
  var cropMode = false, cropScale = 1, sel = { x: 0, y: 0, w: 0, h: 0 };
  var CROP_MIN = 10;

  function clampSel() {
    var img = $("cropImg");
    var bw = img.clientWidth, bh = img.clientHeight;
    sel.w = Math.min(Math.max(sel.w, CROP_MIN), bw);
    sel.h = Math.min(Math.max(sel.h, CROP_MIN), bh);
    sel.x = Math.min(Math.max(sel.x, 0), bw - sel.w);
    sel.y = Math.min(Math.max(sel.y, 0), bh - sel.h);
  }

  function renderSel() {
    var s = $("cropSel");
    s.style.left = Math.round(sel.x) + "px";
    s.style.top = Math.round(sel.y) + "px";
    s.style.width = Math.round(sel.w) + "px";
    s.style.height = Math.round(sel.h) + "px";
    $("cropDims").textContent =
      Math.round(sel.w * cropScale) + " × " + Math.round(sel.h * cropScale) + " px" +
      "  (at " + Math.round(sel.x * cropScale) + ", " + Math.round(sel.y * cropScale) + ")";
  }

  function cropStartDrag(e, mode) {
    e.preventDefault();
    e.stopPropagation();
    var sx = e.clientX, sy = e.clientY;
    var o = { x: sel.x, y: sel.y, w: sel.w, h: sel.h };
    var img = $("cropImg");
    var bw = img.clientWidth, bh = img.clientHeight;
    function move(ev) {
      var dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (mode === "move") {
        sel.x = o.x + dx; sel.y = o.y + dy;
      } else {
        if (mode.indexOf("e") !== -1) sel.w = o.w + dx;
        if (mode.indexOf("s") !== -1) sel.h = o.h + dy;
        if (mode.indexOf("w") !== -1) { sel.x = o.x + dx; sel.w = o.w - dx; }
        if (mode.indexOf("n") !== -1) { sel.y = o.y + dy; sel.h = o.h - dy; }
      }
      // normalize flips and enforce the minimum before clamping to bounds
      if (sel.w < CROP_MIN) { if (mode.indexOf("w") !== -1) sel.x = o.x + o.w - CROP_MIN; sel.w = CROP_MIN; }
      if (sel.h < CROP_MIN) { if (mode.indexOf("n") !== -1) sel.y = o.y + o.h - CROP_MIN; sel.h = CROP_MIN; }
      sel.w = Math.min(sel.w, bw); sel.h = Math.min(sel.h, bh);
      clampSel();
      renderSel();
    }
    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  $("cropSel").addEventListener("pointerdown", function (e) {
    var t = e.target;
    var mode = t.classList && t.classList.contains("ch") ? t.getAttribute("data-m") : "move";
    cropStartDrag(e, mode);
  });

  function enterCrop() {
    if (!S.id) { alert("Select an image first."); return; }
    cropMode = true;
    $("stage").classList.remove("loading", "done");
    $("cropLayer").classList.add("on");
    $("cropBar").classList.add("on");
    var img = $("cropImg");
    img.onload = function () {
      // displayed size vs original pixels — selection maps through this scale
      cropScale = img.naturalWidth / Math.max(1, img.clientWidth);
      var bw = img.clientWidth, bh = img.clientHeight;
      if (S.cw && S.ch) {
        sel = { x: Number(S.x) / cropScale, y: Number(S.y) / cropScale,
                w: Number(S.cw) / cropScale, h: Number(S.ch) / cropScale };
      } else {
        sel = { x: bw * 0.1, y: bh * 0.1, w: bw * 0.8, h: bh * 0.8 };
      }
      clampSel();
      renderSel();
    };
    img.onerror = function () {
      alert("This original format can't be displayed for cropping.");
      exitCrop();
    };
    img.src = "/raw/" + S.id; // exact original: 1:1 coordinate mapping, no quota cost
  }

  function exitCrop() {
    cropMode = false;
    $("cropLayer").classList.remove("on");
    $("cropBar").classList.remove("on");
    $("cropImg").removeAttribute("src");
    // restore the preview state
    if (S.id) { $("preview").style.display = "block"; $("empty").style.display = "none"; }
    else { $("preview").style.display = "none"; $("empty").style.display = "block"; }
  }

  function applyCrop() {
    S.x = String(Math.round(sel.x * cropScale));
    S.y = String(Math.round(sel.y * cropScale));
    S.cw = String(Math.round(sel.w * cropScale));
    S.ch = String(Math.round(sel.h * cropScale));
    exitCrop();
    syncUI();
    manualChange();
  }

  $("cropBtn").addEventListener("click", enterCrop);
  $("cropApply").addEventListener("click", applyCrop);
  $("cropCancel").addEventListener("click", exitCrop);
  $("cropClear").addEventListener("click", function () {
    S.x = ""; S.y = ""; S.cw = ""; S.ch = "";
    exitCrop();
    syncUI();
    manualChange();
  });
  document.addEventListener("keydown", function (e) {
    if (!cropMode) return;
    if (e.key === "Escape") { e.preventDefault(); exitCrop(); }
    if (e.key === "Enter") { e.preventDefault(); applyCrop(); }
  });

  /* ---- daily quota (dummy tier: per-browser cookie identity) ---- */
  var quotaLeft = null, quotaLimit = null;
  function renderQuota() {
    if (quotaLeft === null) return;
    var el = $("quotaChip");
    el.textContent = "⚡ " + quotaLeft + " / " + quotaLimit + " transforms left today";
    el.className = "rt" + (quotaLeft <= 0 ? " zero" : "");
  }
  function loadQuota() {
    fetch("/quota").then(function (r) { return r.json(); }).then(function (q) {
      quotaLeft = q.remaining; quotaLimit = q.limit; renderQuota();
    }).catch(function () { $("quotaChip").textContent = ""; });
  }
  function updateQuota(res) {
    var r = res.headers.get("x-ratelimit-remaining");
    if (r !== null) { quotaLeft = Number(r); renderQuota(); }
  }
  function showBanner(msg) { var b = $("quotaBanner"); b.textContent = "⚠ " + msg; b.style.display = "block"; }
  function hideBanner() { $("quotaBanner").style.display = "none"; }

  /* ---- browser database (IndexedDB): saved transformations per user ---- */
  var clientKey = (function () {
    var k = "";
    try {
      k = localStorage.getItem("imgora_client");
      if (!k) {
        k = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        localStorage.setItem("imgora_client", k);
      }
    } catch (e) { k = "c-anon"; }
    return k;
  })();

  function openDb() {
    if (openDb.p) return openDb.p;
    openDb.p = new Promise(function (resolve) {
      var rq = indexedDB.open("imgora", 2);
      rq.onupgradeneeded = function () {
        var db = rq.result;
        if (!db.objectStoreNames.contains("transforms")) {
          db.createObjectStore("transforms", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("uploads")) {
          db.createObjectStore("uploads", { keyPath: "id" });
        }
      };
      rq.onsuccess = function () { resolve(rq.result); };
      rq.onerror = function () { resolve(null); };
    });
    return openDb.p;
  }
  function idbPut(rec) {
    return openDb().then(function (db) {
      if (!db) return;
      db.transaction("transforms", "readwrite").objectStore("transforms").put(rec);
    });
  }
  function idbDel(key) {
    return openDb().then(function (db) {
      if (!db) return;
      db.transaction("transforms", "readwrite").objectStore("transforms").delete(key);
    });
  }
  function idbClear() {
    return openDb().then(function (db) {
      if (!db) return;
      db.transaction("transforms", "readwrite").objectStore("transforms").clear();
    });
  }
  function allTransforms() {
    return openDb().then(function (db) {
      if (!db) return [];
      return new Promise(function (resolve) {
        var st = db.transaction("transforms", "readonly").objectStore("transforms");
        var req = st.getAll();
        req.onsuccess = function () {
          resolve((req.result || [])
            .filter(function (r) { return r && r.client === clientKey; })
            .sort(function (a, b) { return b.at - a.at; }));
        };
        req.onerror = function () { resolve([]); };
      });
    });
  }
  function saveTransform(rec) { return idbPut(rec).then(renderHistory); }

  // records whose thumbnail failed once — prevents prune-onerror render loops
  var brokenPaths = {};

  /* ---- private per-browser library (IndexedDB "uploads" store) ---- */
  function upPut(rec) {
    return openDb().then(function (db) {
      if (!db) return;
      db.transaction("uploads", "readwrite").objectStore("uploads").put(rec);
    });
  }
  function upDel(id) {
    return openDb().then(function (db) {
      if (!db) return;
      db.transaction("uploads", "readwrite").objectStore("uploads").delete(id);
    });
  }
  function allUploads() {
    return openDb().then(function (db) {
      if (!db) return [];
      return new Promise(function (resolve) {
        var st = db.transaction("uploads", "readonly").objectStore("uploads");
        var req = st.getAll();
        req.onsuccess = function () {
          resolve((req.result || [])
            .filter(function (r) { return r && r.client === clientKey; })
            .sort(function (a, b) { return b.at - a.at; }));
        };
        req.onerror = function () { resolve([]); };
      });
    });
  }

  function timeAgo(t) {
    var s = Math.max(1, Math.round((Date.now() - t) / 1000));
    if (s < 60) return s + "s ago";
    var m = Math.round(s / 60); if (m < 60) return m + "m ago";
    var h = Math.round(m / 60); if (h < 24) return h + "h ago";
    return Math.round(h / 24) + "d ago";
  }

  function renderHistory() {
    return allTransforms().then(function (rows) {
      var box = $("history");
      box.innerHTML = "";
      if (!rows.length) {
        var d = document.createElement("div");
        d.className = "hint"; d.style.marginLeft = "0";
        d.textContent = "Transformations you run are saved here in this browser.";
        box.appendChild(d);
        return;
      }
      rows.slice(0, 60).forEach(function (rec) {
        var item = document.createElement("div");
        item.className = "hist";
        item.title = "click to re-apply this transform";
        var img = document.createElement("img");
        img.loading = "lazy";
        // S3 retention: if the image is gone, drop the stale metadata (loop-guarded)
        if (brokenPaths[rec.key]) {
          img.removeAttribute("src");
        } else {
          img.src = rec.path;
          img.onerror = function () {
            if (brokenPaths[rec.key]) return;
            brokenPaths[rec.key] = true;
            idbDel(rec.key).then(renderHistory);
          };
        }
        var info = document.createElement("div"); info.className = "hinfo";
        var hp = document.createElement("div"); hp.className = "hp";
        hp.textContent = rec.params || "original";
        var ht = document.createElement("div"); ht.className = "ht";
        ht.textContent = timeAgo(rec.at) + " · " + fmtBytes(rec.bytes) + (rec.dims ? " · " + rec.dims : "");
        info.appendChild(hp); info.appendChild(ht);
        var del = document.createElement("button");
        del.className = "hdel"; del.textContent = "×"; del.title = "remove from history";
        del.addEventListener("click", function (ev) { ev.stopPropagation(); idbDel(rec.key).then(renderHistory); });
        item.appendChild(img); item.appendChild(info); item.appendChild(del);
        item.addEventListener("click", function () { applyRecord(rec); });
        box.appendChild(item);
      });
    });
  }

  // retention sweep: ask the server which source images still exist in S3 and
  // delete every saved record whose image has been removed by the retention policy
  function verifyHistory() {
    allTransforms().then(function (rows) {
      var ids = {};
      rows.forEach(function (r) { ids[r.id] = true; });
      Object.keys(ids).slice(0, 40).forEach(function (id) {
        fetch("/exists/" + id).then(function (r) { return r.json(); }).then(function (j) {
          if (j.exists) return;
          allTransforms().then(function (all) {
            return Promise.all(all.filter(function (r) { return r.id === id; })
              .map(function (r) { return idbDel(r.key); }));
          }).then(renderHistory);
        }).catch(function () {});
      });
    });
  }

  function applyRecord(rec) {
    S.id = rec.path.split("?")[0].split("/").pop();
    applyQuery(rec.params);
    originalBytes = (metaById[S.id] && metaById[S.id].bytes) || originalBytes;
    lastQuery = "__init__";
    if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
    updateImgInfo();
    markSelected();
    refresh();
  }

  function amtParam(v) {
    if (v === null) return 0;
    if (v === "1" || v === "true" || v === "yes") return 100;
    var n = Number(v);
    return Number.isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
  }

  function applyQuery(qs) {
    var p = new URLSearchParams(qs || "");
    var explicitH = p.get("h") !== null; // presets that pin both dims are respected as-is
    S.w = p.get("w") || ""; S.h = p.get("h") || "";
    S.fit = p.get("fit") || "cover";
    var bg = p.get("bg"); S.bg = bg ? "#" + bg : "#000000"; S.bgOn = !!bg;
    S.x = p.get("x") || ""; S.y = p.get("y") || ""; S.cw = p.get("cw") || ""; S.ch = p.get("ch") || "";
    S.f = p.get("f") || "auto";
    S.q = Number(p.get("q") || 80);
    S.prog = p.get("prog") === "1"; S.moz = p.get("moz") === "1";
    S.cs = p.get("cs") || "420";
    var e = p.get("effort"); S.effort = e === null ? "" : e; effortDirty = e !== null;
    S.lossless = p.get("lossless") === "1";
    S.level = Number(p.get("level") || 6);
    S.palette = p.get("palette") === "1"; S.pqual = Number(p.get("pqual") || 80);
    S.rot = p.get("rot") || "0";
    S.bright = Number(p.get("bright") || 100); S.sat = Number(p.get("sat") || 100);
    S.hue = Number(p.get("hue") || 0); S.blur = Number(p.get("blur") || 0);
    S.gray = amtParam(p.get("gray")); S.neg = amtParam(p.get("neg")); S.sharpen = amtParam(p.get("sharpen"));
    S.flip = p.get("flip") === "1"; S.flop = p.get("flop") === "1";
    S.download = p.get("download") === "1";
    // lock + no explicit height → height derives from width at the current aspect
    if (lockedWH && !explicitH && S.w) S.h = hFromW(S.w);
    syncUI();
  }

  $("clearHist").addEventListener("click", function () {
    if (!confirm("Delete all saved transforms from this browser?")) return;
    idbClear().then(renderHistory);
  });

  /* ---- segmented controls + format-aware compression panel ---- */
  function setSeg(id, val) {
    document.querySelectorAll("#" + id + " button").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-v") === String(val));
    });
  }

  function syncFormatUI() {
    var f = S.f;
    var isJpeg = f === "jpeg", isWebp = f === "webp", isAvif = f === "avif", isPng = f === "png";
    var show = function (id, on) { $(id).style.display = on ? "flex" : "none"; };
    setSeg("fmtSeg", f);
    $("autoHint").style.display = f === "auto" ? "block" : "none";
    $("fmtAdv").style.display = f === "auto" ? "none" : "block";
    $("advFmtName").textContent = f;
    show("rowQ", f !== "auto");
    show("rowProg", isJpeg || isPng);
    show("rowMoz", isJpeg);
    show("rowCs", isJpeg);
    show("rowEffort", isWebp || isAvif);
    show("rowLossless", isWebp || isAvif);
    show("rowLevel", isPng);
    show("rowPalette", isPng);
    show("rowPqual", isPng && S.palette);
    $("effort").max = isAvif ? 9 : 6;
    var qOff = isPng || S.lossless;
    $("q").disabled = qOff;
    $("qVal").style.opacity = qOff ? ".35" : "1";
  }

  /* ---- controls ---- */
  var simpleRanges = [["q","qVal"],["bright","brightVal"],["sat","satVal"],["hue","hueVal"],["blur","blurVal"],["level","levelVal"],["pqual","pqualVal"]];
  simpleRanges.forEach(function (pair) {
    $(pair[0]).addEventListener("input", function () {
      S[pair[0]] = Number(this.value);
      $(pair[1]).textContent = this.value;
      manualChange();
    });
  });
  $("effort").addEventListener("input", function () {
    effortDirty = true;
    S.effort = this.value;
    $("effortVal").textContent = this.value;
    manualChange();
  });
  ["x","y","cw","ch"].forEach(function (k) {
    $(k).addEventListener("input", function () { S[k] = this.value; manualChange(); });
  });
  // W/H aspect lock — locked by default: width drives height at the chosen ratio
  $("w").addEventListener("input", function () {
    S.w = this.value;
    if (lockedWH) {
      S.h = this.value === "" ? "" : hFromW(this.value);
      $("h").value = S.h;
    }
    manualChange();
  });
  $("h").addEventListener("input", function () {
    S.h = this.value;
    if (lockedWH) {
      S.w = this.value === "" ? "" : wFromH(this.value);
      $("w").value = S.w;
    }
    manualChange();
  });
  $("lockBtn").addEventListener("click", function () {
    lockedWH = !lockedWH;
    this.classList.toggle("on", lockedWH);
    this.textContent = lockedWH ? "🔒" : "🔓";
    this.title = lockedWH
      ? "Locked: height follows width at " + aspect + ". Click to set them separately."
      : "Unlocked: width and height are independent. Click to link them.";
    $("ar").disabled = !lockedWH;
    if (lockedWH && S.w) {
      S.h = hFromW(S.w);
      $("h").value = S.h;
      debounced();
    }
  });
  $("ar").addEventListener("change", function () {
    aspect = this.value;
    if (lockedWH && S.w) {
      S.h = hFromW(S.w);
      $("h").value = S.h;
      $("lockBtn").title = "Locked: height follows width at " + aspect + ". Click to set them separately.";
      debounced();
    }
  });
  document.querySelectorAll(".qchip").forEach(function (b) {
    b.addEventListener("click", function () {
      S.w = b.getAttribute("data-s");
      if (lockedWH) S.h = hFromW(S.w);
      syncUI();
      debounced();
    });
  });
  ["fit","cs"].forEach(function (k) {
    $(k).addEventListener("change", function () { S[k] = this.value; manualChange(); });
  });
  document.querySelectorAll("#fmtSeg button").forEach(function (b) {
    b.addEventListener("click", function () {
      S.f = b.getAttribute("data-v");
      syncFormatUI();
      manualChange();
    });
  });
  document.querySelectorAll("#rotSeg button").forEach(function (b) {
    b.addEventListener("click", function () {
      S.rot = b.getAttribute("data-v");
      setSeg("rotSeg", S.rot);
      manualChange();
    });
  });
  /* output mode: Presets or Custom — only one active at a time */
  function setOutMode(m) {
    $("outCard").setAttribute("data-mode", m);
    $("modePreset").classList.toggle("on", m === "preset");
    $("modeCustom").classList.toggle("on", m === "custom");
  }
  $("modePreset").addEventListener("click", function () { setOutMode("preset"); });
  $("modeCustom").addEventListener("click", function () { setOutMode("custom"); });
  // unified preset dropdown — value is a query string applied wholesale
  $("cqp").addEventListener("change", function () {
    if (!this.value) return;
    applyQuery(this.value);
    debounced();
  });
  ["flip","flop","download","prog","moz"].forEach(function (k) {
    $(k).addEventListener("change", function () { S[k] = this.checked; manualChange(); });
  });
  $("lossless").addEventListener("change", function () {
    S.lossless = this.checked; syncFormatUI(); manualChange();
  });
  $("palette").addEventListener("change", function () {
    S.palette = this.checked; syncFormatUI(); manualChange();
  });

  var tId = null;
  function debounced() { clearTimeout(tId); tId = setTimeout(refresh, 220); }
  // manual control change: clears the active preset selection so the dropdown
  // never shows a stale preset next to hand-tuned values
  function manualChange() {
    $("cqp").value = "";
    debounced();
  }
  function markSelected() {
    document.querySelectorAll('#gallery .thumb').forEach(function (c) {
      c.classList.toggle("sel", c.getAttribute("data-id") === S.id);
    });
  }

  function syncUI() {
    Object.keys(DEF).forEach(function (k) {
      var el = $(k);
      if (!el) return;
      if (el.type === "checkbox") el.checked = S[k];
      else el.value = S[k];
    });
    $("ar").disabled = !lockedWH; // aspect selector only applies while locked
    setSeg("fmtSeg", S.f);
    setSeg("rotSeg", S.rot);
    $("qVal").textContent = S.q; $("brightVal").textContent = S.bright;
    $("satVal").textContent = S.sat; $("hueVal").textContent = S.hue;
    $("blurVal").textContent = S.blur; $("levelVal").textContent = S.level;
    $("pqualVal").textContent = S.pqual;
    $("effortVal").textContent = effortDirty ? String(S.effort) : "auto";
    EFFECTS.forEach(function (e) {
      var amt = Number(S[e[0]]) || 0;
      $(e[0]).checked = amt > 0;
      $(e[1]).value = amt;
      $(e[2]).textContent = amt;
    });
    $("cropBtn").textContent = S.cw ? "✂ Crop · " + S.cw + "×" + S.ch : "✂ Select crop area";
    syncFormatUI();
  }

  function resetTransformState() {
    S = Object.assign({}, DEF);
    effortDirty = false;
  }

  function resetTransforms() {
    var keepId = S.id;
    resetTransformState();
    S.id = keepId;
    $("cqp").value = "";
    syncUI(); lastQuery = "__init__"; refresh();
  }

  $("resetBtn").addEventListener("click", resetTransforms);

  /* ---- library: private, per-browser (IndexedDB), retention-aware ---- */
  var metaById = {};

  function updateImgInfo() {
    var m = S.id ? metaById[S.id] : null;
    $("imgInfo").textContent = m
      ? (m.format || "?") + (m.width ? " · " + m.width + "×" + m.height : "") + " · " + fmtBytes(m.bytes)
      : (S.id ? "id " + S.id : "no image selected");
  }

  function resetChips() {
    ["chipDims", "chipSize", "chipTime", "chipCache"].forEach(function (id) {
      $(id).textContent = "—";
      $(id).className = "chip";
    });
  }

  function clearPreview() {
    S.id = null;
    if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
    $("preview").style.display = "none";
    $("empty").style.display = "block";
    $("url").value = "";
    $("openLink").href = "#";
    lastQuery = "__init__";
    resetChips();
    updateImgInfo();
  }

  function renderLibrary() {
    return allUploads().then(function (rows) {
      var g = $("gallery");
      g.innerHTML = "";
      if (!rows.length) {
        var d = document.createElement("div");
        d.className = "hint"; d.style.marginLeft = "0";
        d.textContent = "Your uploads are private to this browser.";
        g.appendChild(d);
        return;
      }
      rows.forEach(function (m) {
        metaById[m.id] = m;
        var card = document.createElement("div");
        card.className = "thumb" + (m.id === S.id ? " sel" : "");
        card.setAttribute("data-id", m.id);
        var img = document.createElement("img");
        img.src = "/t/" + m.id + "?w=180&h=100&fit=cover&f=webp&q=60";
        img.loading = "lazy";
        // S3 retention: image gone → drop the library record (guarded against loops)
        if (brokenPaths[m.id]) {
          img.removeAttribute("src"); // don't re-request a known-dead image
        }
        img.onerror = function () {
          if (brokenPaths[m.id]) return;
          brokenPaths[m.id] = true;
          delete metaById[m.id];
          upDel(m.id).then(renderLibrary);
          if (m.id === S.id) clearPreview();
        };
        var cap = document.createElement("div");
        cap.className = "cap";
        cap.textContent = (m.format || "?") + " · " + fmtBytes(m.bytes);
        var del = document.createElement("button");
        del.className = "del"; del.textContent = "×"; del.title = "delete";
        del.addEventListener("click", function (ev) {
          ev.stopPropagation();
          fetch("/images/" + m.id, { method: "DELETE" }).then(function () {
            delete metaById[m.id];
            if (m.id === S.id) clearPreview(); // selected image was deleted
            // also drop this image's saved transform history
            allTransforms().then(function (all) {
              return Promise.all(all.filter(function (r) { return r.id === m.id; })
                .map(function (r) { return idbDel(r.key); }));
            }).then(function () { return upDel(m.id); }).then(renderLibrary);
          });
        });
        card.appendChild(img); card.appendChild(cap); card.appendChild(del);
        card.addEventListener("click", function () { select(m.id, m.bytes); });
        g.appendChild(card);
      });
      updateImgInfo();
    });
  }

  // retention sweep for the library: prune records whose S3 image is gone
  function verifyUploads() {
    allUploads().then(function (rows) {
      rows.slice(0, 40).forEach(function (m) {
        fetch("/exists/" + m.id).then(function (r) { return r.json(); }).then(function (j) {
          if (j.exists) return;
          delete metaById[m.id];
          upDel(m.id).then(renderLibrary);
          if (m.id === S.id) clearPreview();
        }).catch(function () {});
      });
    });
  }

  function select(id, bytes) {
    S.id = id;
    originalBytes = bytes || originalBytes;
    lastQuery = "__init__";
    if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
    updateImgInfo();
    // highlight selection without re-rendering the whole library
    document.querySelectorAll('#gallery .thumb').forEach(function (c) {
      c.classList.toggle("sel", c.getAttribute("data-id") === id);
    });
    refresh();
  }

  /* ---- upload ---- */
  var EMPTY_MSG = "Upload an image or pick one from the library →";

  function uploadBlob(blob, name) {
    clearPreview();          // a new image always starts clean: no old styles, no stale URL
    resetTransformState();   // wipe styles right away so controls don't sit stale
    syncUI();
    $("empty").textContent = "Uploading…";
    var fd = new FormData();
    fd.append("file", blob, name || "image");
    var t0 = performance.now();
    return fetch("/upload", { method: "POST", body: fd })
      .then(function (r) { return r.json(); })
      .then(function (m) {
        if (m.error) { alert(m.error); return; }
        var rec = {
          id: m.id, client: clientKey, bytes: m.bytes, format: m.format,
          width: m.width, height: m.height, uploadedAt: m.uploadedAt, at: Date.now()
        };
        metaById[m.id] = rec;
        upPut(rec).then(renderLibrary);
        originalBytes = m.bytes;
        S.id = m.id;
        lastQuery = "__init__";
        refresh();
        console.log("uploaded in " + Math.round(performance.now() - t0) + " ms:", m.id);
      })
      .catch(function () {
        alert("Upload failed — is the server running?");
      })
      .then(function () {
        if (!S.id) $("empty").textContent = EMPTY_MSG;
      });
  }

  var drop = $("drop"), fileInput = $("file");
  drop.addEventListener("click", function () { fileInput.click(); });
  fileInput.addEventListener("change", function () {
    var files = Array.prototype.slice.call(fileInput.files);
    var chain = Promise.resolve();
    files.forEach(function (f) { chain = chain.then(function () { return uploadBlob(f, f.name); }); });
    fileInput.value = "";
  });
  ["dragenter", "dragover"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); });
  });
  drop.addEventListener("drop", function (e) {
    var files = Array.prototype.slice.call(e.dataTransfer.files);
    var chain = Promise.resolve();
    files.forEach(function (f) { chain = chain.then(function () { return uploadBlob(f, f.name); }); });
  });

  $("copyBtn").addEventListener("click", function () {
    if (!lastUrl) return;
    navigator.clipboard.writeText($("url").value).then(function () {
      $("copyBtn").textContent = "Copied ✓";
      setTimeout(function () { $("copyBtn").textContent = "Copy"; }, 1200);
    });
  });

  /* ---- download current transform (server adds Content-Disposition) ---- */
  var EXT_BY_TYPE = { "image/webp": ".webp", "image/avif": ".avif", "image/jpeg": ".jpg", "image/png": ".png" };
  $("dlBtn").addEventListener("click", function () {
    if (!S.id) return;
    var btn = this;
    var q = buildQuery();
    var url = "/t/" + S.id + (q ? "?" + q + "&download=1" : "?download=1");
    btn.disabled = true;
    btn.textContent = "…";
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.blob();
    }).then(function (b) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = S.id + (q ? "-imgora" : "-original") + (EXT_BY_TYPE[b.type] || "");
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    }).catch(function () {
      alert("Download failed — is the server running?");
    }).then(function () {
      btn.disabled = false;
      btn.textContent = "Download";
    });
  });

  syncUI(); // initialize panel state (segmented pills, contextual rows)
  loadQuota();
  renderLibrary();
  verifyUploads();
  renderHistory();
  verifyHistory(); // prune metadata whose S3 image was removed by retention
})();
</script>
</body>
</html>`;
