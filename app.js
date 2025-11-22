const chat = document.getElementById("chat");
const msg = document.getElementById("msg");
const oid = document.getElementById("oid");
const em  = document.getElementById("em");
const ph  = document.getElementById("ph");
const sendBtn = document.getElementById("send");

function prefill(text){
  msg.value = text;
  msg.focus();
}

function addBubble(text, from="bot"){
  const d = document.createElement("div");
  d.className = from === "user" ? "u" : "b";
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
  return d;
}

function addBotCard(html){
  const wrap = document.createElement("div");
  wrap.className = "botcard";
  wrap.innerHTML = html;
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
  return wrap;
}

function renderTimeline(timeline){
  if(!timeline) return "";
  const { steps=[], currentIndex=0 } = timeline;
  return `<div class="timeline">
    ${steps.map((s,i)=>`
      <div class="step">
        <div class="dot ${i<=currentIndex?'active':''}"></div>
        <span style="font-size:12px">${s}</span>
      </div>
    `).join('<span style="width:10px"></span>')}
  </div>`;
}

async function send(){
  const text = msg.value.trim();
  if(!text) return;
  addBubble(text, "user");
  msg.value = "";

  const res = await fetch("/api/chat", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      message: text,
      orderId: oid.value,
      email: em.value,
      phone: ph.value
    })
  });
  const data = await res.json();

  // Main bot answer
  addBubble(data.answer || "…");

  // Wireframe: show order timeline card if provided
  if(data.timeline){
    addBotCard(`
      <strong>Order Progress</strong>
      ${renderTimeline(data.timeline)}
    `);
  }

  // CSAT + escalation panel
  const ctl = addBotCard(`
    <div class="row" style="justify-content:space-between;align-items:center">
      <div>
        <div class="muted">Was this helpful?</div>
        <div class="csat">
          <button id="csatUp">👍</button>
          <button id="csatDown">👎</button>
        </div>
      </div>
      <button id="escalateBtn" class="cta-esc">Connect to human</button>
    </div>
  `);

  // Wire up CSAT
  ctl.querySelector("#csatUp").onclick = async () => {
    ctl.querySelector("#csatUp").classList.add("selected");
    await fetch("/api/csat", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ rating: "up", message: text }) });
  };
  ctl.querySelector("#csatDown").onclick = async () => {
    ctl.querySelector("#csatDown").classList.add("selected");
    await fetch("/api/csat", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ rating: "down", message: text }) });
  };

  // Escalation button
  ctl.querySelector("#escalateBtn").onclick = async () => {
    const r = await fetch("/api/ticket", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ message: text, orderId: oid.value, email: em.value, phone: ph.value })
    });
    const json = await r.json();
    addBotCard(`<strong>Ticket created:</strong> ${json.ticketId} <span class="muted">Status: ${json.status}</span>`);
  };
}

sendBtn.onclick = send;
msg.addEventListener("keydown", e => { if(e.key==="Enter") send(); });
